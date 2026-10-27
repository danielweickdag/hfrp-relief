import { Pool, type QueryResultRow } from "pg";
import type Stripe from "stripe";

export type DonationPaymentStatus = "pending" | "paid" | "failed";

export interface DonationPayment {
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  invoiceId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  donorEmail: string | null;
  donorName: string | null;
  amountMinor: number;
  currency: string;
  status: DonationPaymentStatus;
  donationType: "one_time" | "recurring";
  campaignId: string;
  failureCode: string | null;
  stripeCreatedAt: Date;
  paidAt: Date | null;
}

export interface StripeSubscriptionRecord {
  subscriptionId: string;
  customerId: string | null;
  campaignId: string;
  amountMinor: number;
  currency: string;
  interval: "day" | "week" | "month" | "year";
  status:
    | "incomplete"
    | "active"
    | "past_due"
    | "paused"
    | "canceled"
    | "unpaid";
  eventCreatedAt: Date;
}

export interface PersistedDonationReport {
  paidTotalsByCampaign: Array<{
    campaignId: string;
    currency: string;
    totalAmountMinor: string;
    donationCount: number;
  }>;
  recentDonations: Array<{
    id: string;
    campaignId: string;
    amountMinor: string;
    currency: string;
    donorEmail: string | null;
    donorName: string | null;
    donationType: DonationPayment["donationType"];
    stripeCreatedAt: Date;
    paidAt: Date | null;
  }>;
}

export interface ClaimedDonationNotification {
  id: string;
  leaseToken: string;
  attempt: number;
  donorEmail: string;
  donorName: string | null;
  amountMinor: string;
  currency: string;
  campaignId: string;
  donationReference: string;
  donationDate: Date;
}

export interface StripeDonationEvent {
  eventId: string;
  eventType: string;
  objectId: string;
  livemode: boolean;
  payment: DonationPayment | null;
  subscription: StripeSubscriptionRecord | null;
}

export interface TransactionClient {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: Row[] }>;
  release(): void;
}

export interface TransactionPool {
  connect(): Promise<TransactionClient>;
}

export interface PersistedDonationLookup {
  checkoutSessionId: string;
  paymentIntentId: string | null;
  subscriptionId: string | null;
}

export type ProcessStripeEventResult =
  | { status: "processed" }
  | { status: "already_processed" }
  | { status: "ignored" };

let pool: Pool | undefined;

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const sandboxId = "prj_szxsOYEgfidh5bC6VBKvPDpbA5cP";
  const isSandbox =
    process.env.HFRP_SANDBOX_PROJECT_ID !== undefined ||
    process.env.VERCEL_PROJECT_ID === sandboxId;

  if (isSandbox) {
    if (
      process.env.VERCEL_PROJECT_ID !== sandboxId ||
      process.env.HFRP_SANDBOX_PROJECT_ID !== sandboxId ||
      process.env.VERCEL_ENV !== "production" ||
      !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    ) {
      throw new Error("Sandbox environment verification failed");
    }

    const expectedHost = process.env.PREVIEW_NEON_HOST;
    if (!expectedHost) {
      throw new Error("Sandbox Neon hostname missing");
    }

    const databaseUrl = new URL(process.env.DATABASE_URL!);

    if (
      databaseUrl.hostname.toLowerCase() !== expectedHost.toLowerCase() ||
      databaseUrl.pathname !== "/neondb"
    ) {
      throw new Error("Sandbox database isolation failed");
    }
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: true },
    });
  }

  return pool;
}

function eventReferences(event: StripeDonationEvent): string[] {
  const payment = event.payment;
  const references: string[] = [];

  if (payment?.paymentIntentId)
    references.push(`pi:${payment.paymentIntentId}`);
  if (payment?.invoiceId) references.push(`in:${payment.invoiceId}`);
  if (payment?.checkoutSessionId)
    references.push(`cs:${payment.checkoutSessionId}`);
  if (event.subscription)
    references.push(`sub:${event.subscription.subscriptionId}`);

  return [...new Set(references)].sort();
}

export class StripeDonationRepository {
  constructor(private readonly database: TransactionPool = getPool()) {}

  async processEvent(
    event: StripeDonationEvent,
  ): Promise<ProcessStripeEventResult> {
    const client = await this.database.connect();

    try {
      await client.query("BEGIN");

      const inserted = await client.query<{ stripe_event_id: string }>(
        `INSERT INTO processed_stripe_events
          (stripe_event_id, event_type, stripe_object_id, livemode, status)
         VALUES ($1, $2, $3, $4, 'processed')
         ON CONFLICT (stripe_event_id) DO NOTHING
         RETURNING stripe_event_id`,
        [event.eventId, event.eventType, event.objectId, event.livemode],
      );

      if (inserted.rows.length === 0) {
        const existing = await client.query<{ status: string }>(
          `SELECT status
           FROM processed_stripe_events
           WHERE stripe_event_id = $1`,
          [event.eventId],
        );

        if (existing.rows[0]?.status !== "processed") {
          throw new Error(
            "Stripe event exists without a completed transaction",
          );
        }

        await client.query("COMMIT");
        return { status: "already_processed" };
      }

      for (const reference of eventReferences(event)) {
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
          [reference],
        );
      }

      if (event.subscription) {
        await this.upsertSubscription(
          client,
          event.subscription,
          event.eventType.startsWith("customer.subscription."),
        );
      }

      if (event.payment) {
        await this.upsertDonation(client, event.payment);
      }

      await client.query("COMMIT");
      return { status: "processed" };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Failed to roll back Stripe donation transaction",
          rollbackError instanceof Error ? rollbackError.name : "unknown",
        );
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async getPaidDonationReport(
    recentLimit: number,
  ): Promise<PersistedDonationReport> {
    const client = await this.database.connect();
    try {
      const totals = await client.query<{
        campaign_id: string;
        currency: string;
        total_amount_minor: string;
        donation_count: string;
      }>(
        `SELECT campaign_id, currency, SUM(amount_minor)::text AS total_amount_minor,
                COUNT(*)::text AS donation_count
         FROM donations
         WHERE status = 'paid'
         GROUP BY campaign_id, currency
         ORDER BY campaign_id, currency`,
      );
      const recent = await client.query<{
        id: string;
        campaign_id: string;
        amount_minor: string;
        currency: string;
        donor_email: string | null;
        donor_name: string | null;
        donation_type: DonationPayment["donationType"];
        stripe_created_at: Date;
        paid_at: Date | null;
      }>(
        `SELECT id, campaign_id, amount_minor::text, currency, donor_email,
                donor_name, donation_type, stripe_created_at, paid_at
         FROM donations
         WHERE status = 'paid'
         ORDER BY paid_at DESC NULLS LAST, stripe_created_at DESC
         LIMIT $1`,
        [recentLimit],
      );

      return {
        paidTotalsByCampaign: totals.rows.map((row) => ({
          campaignId: row.campaign_id,
          currency: row.currency,
          totalAmountMinor: row.total_amount_minor,
          donationCount: Number(row.donation_count),
        })),
        recentDonations: recent.rows.map((row) => ({
          id: row.id,
          campaignId: row.campaign_id,
          amountMinor: row.amount_minor,
          currency: row.currency,
          donorEmail: row.donor_email,
          donorName: row.donor_name,
          donationType: row.donation_type,
          stripeCreatedAt: row.stripe_created_at,
          paidAt: row.paid_at,
        })),
      };
    } finally {
      client.release();
    }
  }

  async hasPersistedPaidDonation(
    lookup: PersistedDonationLookup,
  ): Promise<boolean> {
    const client = await this.database.connect();
    try {
      const result = await client.query<{ persisted: boolean }>(
        `SELECT EXISTS (
           SELECT 1
           FROM donations
           WHERE status = 'paid'
             AND (
               stripe_checkout_session_id = $1
               OR ($2::text IS NOT NULL AND stripe_payment_intent_id = $2)
               OR ($3::text IS NOT NULL AND stripe_subscription_id = $3)
             )
         ) AS persisted`,
        [
          lookup.checkoutSessionId,
          lookup.paymentIntentId,
          lookup.subscriptionId,
        ],
      );
      return result.rows[0]?.persisted === true;
    } finally {
      client.release();
    }
  }

  async claimDonationNotification(): Promise<ClaimedDonationNotification | null> {
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE donation_notification_outbox
         SET status = 'failed', lease_token = NULL, lease_expires_at = NULL,
             last_error_code = 'retry_limit_exceeded'
         WHERE status = 'processing' AND lease_expires_at <= NOW()
           AND attempts >= 10`,
      );
      const selected = await client.query<{
        id: string;
        donor_email: string;
        donor_name: string | null;
        amount_minor: string;
        currency: string;
        campaign_id: string;
        donation_reference: string;
        donation_date: Date;
      }>(
        `SELECT outbox.id, donations.donor_email, donations.donor_name,
                donations.amount_minor::text, donations.currency,
                donations.campaign_id,
                COALESCE(donations.stripe_invoice_id,
                         donations.stripe_payment_intent_id,
                         donations.stripe_checkout_session_id) AS donation_reference,
                COALESCE(donations.paid_at, donations.stripe_created_at) AS donation_date
         FROM donation_notification_outbox AS outbox
         JOIN donations ON donations.id = outbox.donation_id
         WHERE donations.status = 'paid'
           AND donations.donor_email IS NOT NULL
           AND donations.donor_email <> ''
           AND outbox.attempts < 10
           AND (
             (outbox.status = 'pending' AND outbox.next_attempt_at <= NOW())
             OR (outbox.status = 'processing' AND outbox.lease_expires_at <= NOW())
           )
         ORDER BY outbox.created_at
         FOR UPDATE OF outbox SKIP LOCKED
         LIMIT 1`,
      );
      const row = selected.rows[0];
      if (!row) {
        await client.query("COMMIT");
        return null;
      }

      const claimed = await client.query<{
        lease_token: string;
        attempts: number;
      }>(
        `UPDATE donation_notification_outbox
         SET status = 'processing', attempts = attempts + 1,
             lease_token = gen_random_uuid(),
             lease_expires_at = NOW() + INTERVAL '5 minutes'
         WHERE id = $1
         RETURNING lease_token, attempts`,
        [row.id],
      );
      const leaseToken = claimed.rows[0]?.lease_token;
      if (!leaseToken) throw new Error("Failed to claim donation notification");

      await client.query("COMMIT");
      return {
        id: row.id,
        leaseToken,
        attempt: claimed.rows[0].attempts,
        donorEmail: row.donor_email,
        donorName: row.donor_name,
        amountMinor: row.amount_minor,
        currency: row.currency,
        campaignId: row.campaign_id,
        donationReference: row.donation_reference,
        donationDate: row.donation_date,
      };
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Failed to roll back donation notification claim",
          rollbackError instanceof Error ? rollbackError.name : "unknown",
        );
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async markDonationNotificationSent(
    id: string,
    leaseToken: string,
    providerMessageId: string,
  ): Promise<void> {
    const client = await this.database.connect();
    try {
      const updated = await client.query(
        `UPDATE donation_notification_outbox
         SET status = 'sent', provider_message_id = $3, sent_at = NOW(),
             lease_token = NULL, lease_expires_at = NULL, last_error_code = NULL
         WHERE id = $1 AND status = 'processing' AND lease_token = $2
         RETURNING id`,
        [id, leaseToken, providerMessageId],
      );
      if (updated.rows.length !== 1) {
        throw new Error(
          "Donation notification lease was lost before completion",
        );
      }
    } finally {
      client.release();
    }
  }

  async markDonationNotificationFailed(
    id: string,
    leaseToken: string,
    errorCode: string,
    attempt: number,
  ): Promise<void> {
    const client = await this.database.connect();
    try {
      const terminal = attempt >= 10;
      const delaySeconds = Math.min(60 * 2 ** Math.max(0, attempt - 1), 86400);
      const updated = await client.query(
        `UPDATE donation_notification_outbox
         SET status = $3,
             next_attempt_at = NOW() + ($4 * INTERVAL '1 second'),
             lease_token = NULL, lease_expires_at = NULL, last_error_code = $5
         WHERE id = $1 AND status = 'processing' AND lease_token = $2
         RETURNING id`,
        [
          id,
          leaseToken,
          terminal ? "failed" : "pending",
          delaySeconds,
          errorCode.slice(0, 80),
        ],
      );
      if (updated.rows.length !== 1) {
        throw new Error("Donation notification lease was lost before retry");
      }
    } finally {
      client.release();
    }
  }

  private async upsertSubscription(
    client: TransactionClient,
    subscription: StripeSubscriptionRecord,
    lifecycleEvent: boolean,
  ): Promise<void> {
    const update = lifecycleEvent
      ? `UPDATE SET
           stripe_customer_id = CASE WHEN EXCLUDED.status_updated_at > stripe_subscriptions.status_updated_at THEN COALESCE(EXCLUDED.stripe_customer_id, stripe_subscriptions.stripe_customer_id) ELSE stripe_subscriptions.stripe_customer_id END,
           campaign_id = CASE WHEN EXCLUDED.status_updated_at > stripe_subscriptions.status_updated_at THEN EXCLUDED.campaign_id ELSE stripe_subscriptions.campaign_id END,
           amount_minor = CASE WHEN EXCLUDED.status_updated_at > stripe_subscriptions.status_updated_at THEN EXCLUDED.amount_minor ELSE stripe_subscriptions.amount_minor END,
           currency = CASE WHEN EXCLUDED.status_updated_at > stripe_subscriptions.status_updated_at THEN EXCLUDED.currency ELSE stripe_subscriptions.currency END,
           interval = CASE WHEN EXCLUDED.status_updated_at > stripe_subscriptions.status_updated_at THEN EXCLUDED.interval ELSE stripe_subscriptions.interval END,
           status = EXCLUDED.status,
           status_updated_at = EXCLUDED.status_updated_at,
           updated_at = NOW()
         WHERE EXCLUDED.status_updated_at > stripe_subscriptions.status_updated_at`
      : `UPDATE SET
           status = EXCLUDED.status,
           status_updated_at = EXCLUDED.status_updated_at,
           updated_at = NOW()
         WHERE EXCLUDED.status_updated_at > stripe_subscriptions.status_updated_at`;

    await client.query(
      `INSERT INTO stripe_subscriptions
        (stripe_subscription_id, stripe_customer_id, campaign_id, amount_minor,
         currency, interval, status, status_updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (stripe_subscription_id) DO ${update}`,
      [
        subscription.subscriptionId,
        subscription.customerId,
        subscription.campaignId,
        subscription.amountMinor,
        subscription.currency,
        subscription.interval,
        subscription.status,
        subscription.eventCreatedAt,
      ],
    );
  }

  private async upsertDonation(
    client: TransactionClient,
    payment: DonationPayment,
  ): Promise<void> {
    const existing = await client.query<{
      id: string;
      status: string;
      stripe_checkout_session_id: string | null;
      stripe_payment_intent_id: string | null;
      stripe_invoice_id: string | null;
      campaign_id: string;
      donation_type: DonationPayment["donationType"];
    }>(
      `SELECT id, status, stripe_checkout_session_id,
              stripe_payment_intent_id, stripe_invoice_id, campaign_id,
              donation_type
       FROM donations
       WHERE ($1::text IS NOT NULL AND stripe_payment_intent_id = $1)
          OR ($2::text IS NOT NULL AND stripe_checkout_session_id = $2)
          OR ($3::text IS NOT NULL AND stripe_invoice_id = $3)
       FOR UPDATE`,
      [payment.paymentIntentId, payment.checkoutSessionId, payment.invoiceId],
    );

    if (existing.rows.length > 1) {
      throw new Error(
        "Stripe payment identifiers resolve to multiple donations",
      );
    }

    const matched = existing.rows[0];
    if (matched) {
      if (
        (matched.stripe_checkout_session_id &&
          payment.checkoutSessionId &&
          matched.stripe_checkout_session_id !== payment.checkoutSessionId) ||
        (matched.stripe_payment_intent_id &&
          payment.paymentIntentId &&
          matched.stripe_payment_intent_id !== payment.paymentIntentId) ||
        (matched.stripe_invoice_id &&
          payment.invoiceId &&
          matched.stripe_invoice_id !== payment.invoiceId) ||
        (matched.campaign_id !== "general" &&
          matched.campaign_id !== payment.campaignId) ||
        matched.donation_type !== payment.donationType
      ) {
        throw new Error(
          "Stripe payment identifiers conflict with the existing donation",
        );
      }
    }

    const params = [
      payment.checkoutSessionId,
      payment.paymentIntentId,
      payment.invoiceId,
      payment.customerId,
      payment.subscriptionId,
      payment.donorEmail,
      payment.donorName,
      payment.amountMinor,
      payment.currency,
      payment.status,
      payment.donationType,
      payment.campaignId,
      payment.failureCode,
      payment.stripeCreatedAt,
      payment.paidAt,
    ];

    if (matched) {
      await client.query(
        `UPDATE donations
         SET stripe_checkout_session_id = COALESCE($1, stripe_checkout_session_id),
             stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
             stripe_invoice_id = COALESCE($3, stripe_invoice_id),
             stripe_customer_id = COALESCE($4, stripe_customer_id),
             stripe_subscription_id = COALESCE($5, stripe_subscription_id),
             donor_email = COALESCE($6, donor_email),
             donor_name = COALESCE($7, donor_name),
             amount_minor = CASE
               WHEN (status = 'paid' AND $10 <> 'paid')
                 OR (status = 'failed' AND $10 = 'pending')
                 THEN amount_minor
               ELSE $8
             END,
             currency = CASE
               WHEN (status = 'paid' AND $10 <> 'paid')
                 OR (status = 'failed' AND $10 = 'pending')
                 THEN currency
               ELSE $9
             END,
             status = CASE
               WHEN status = 'paid' THEN 'paid'
               WHEN $10 = 'paid' THEN 'paid'
               WHEN status = 'failed' AND $10 = 'pending' THEN 'failed'
               ELSE $10
             END,
             donation_type = COALESCE($11::text, donation_type),
             campaign_id = CASE
               WHEN campaign_id = 'general' AND $12 <> 'general' THEN $12
               ELSE campaign_id
             END,
             failure_code = CASE
               WHEN status = 'paid' OR $10 = 'paid' THEN NULL
               WHEN status = 'failed' AND $10 = 'pending' THEN failure_code
               ELSE $13
             END,
             stripe_created_at = LEAST(stripe_created_at, $14),
             paid_at = COALESCE(paid_at, $15),
             updated_at = NOW()
         WHERE id = $16
         RETURNING id`,
        [...params, matched.id],
      );
      await this.enqueueDonationNotification(client, matched.id);
      return;
    }

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO donations
        (stripe_checkout_session_id, stripe_payment_intent_id, stripe_invoice_id,
         stripe_customer_id, stripe_subscription_id, donor_email, donor_name,
         amount_minor, currency, status, donation_type, campaign_id, failure_code,
         stripe_created_at, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
      params,
    );
    const id = inserted.rows[0]?.id;
    if (!id) throw new Error("Failed to persist Stripe donation");
    await this.enqueueDonationNotification(client, id);
  }

  private async enqueueDonationNotification(
    client: TransactionClient,
    donationId: string,
  ): Promise<void> {
    await client.query(
      `INSERT INTO donation_notification_outbox (donation_id, notification_type)
       SELECT id, 'donation_thank_you'
       FROM donations
       WHERE id = $1 AND status = 'paid'
         AND donor_email IS NOT NULL AND donor_email <> ''
       ON CONFLICT (donation_id, notification_type) DO NOTHING`,
      [donationId],
    );
  }
}

export function createStripeDonationRepository(
  database?: TransactionPool,
): StripeDonationRepository {
  return new StripeDonationRepository(database);
}

export function resetStripeDonationPoolForTests(): void {
  pool = undefined;
}
