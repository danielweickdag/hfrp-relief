import Stripe from "stripe";
import {
  type DonationPayment,
  type StripeDonationEvent,
  type StripeDonationRepository,
  type StripeSubscriptionRecord,
  createStripeDonationRepository,
} from "./stripeDonationRepository";

type Environment = Record<string, string | undefined>;

export function resolveStripeWebhookConfig(environment: Environment): {
  secretKey: string;
  webhookSecret: string;
  livemode: boolean;
} | null {
  const secretKey = environment.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "your_stripe_secret_key_here") return null;

  const livemode = secretKey.startsWith("sk_live_");
  if (!livemode && !secretKey.startsWith("sk_test_")) return null;

  if (
    environment.VERCEL_ENV &&
    (environment.VERCEL_ENV === "production") !== livemode
  ) {
    return null;
  }

  const webhookSecret = livemode
    ? environment.STRIPE_WEBHOOK_SECRET_LIVE ||
      environment.STRIPE_WEBHOOK_SECRET
    : environment.STRIPE_WEBHOOK_SECRET_TEST ||
      environment.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !webhookSecret.startsWith("whsec_")) return null;

  return { secretKey, webhookSecret, livemode };
}

function objectId(
  value: string | { id: string } | null | undefined,
): string | null {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

function positiveAmount(value: number | null | undefined): number {
  if (
    value === null ||
    value === undefined ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error("Stripe event contains an invalid amount");
  }
  return value;
}

function normalizeCurrency(value: string | null | undefined): string {
  const currency = value?.toLowerCase();
  if (!currency || !/^[a-z]{3}$/.test(currency)) {
    throw new Error("Stripe event contains an invalid currency");
  }
  return currency;
}

interface DonationIdentity {
  campaignId: string;
  donationType: "one_time" | "recurring";
}

function donationIdentity(
  ...records: Array<Stripe.Metadata | null | undefined>
): DonationIdentity | null {
  let identity: DonationIdentity | null = null;

  for (const record of records) {
    if (!record || record.hfrp_donation === undefined) continue;

    const campaignId = record.campaignId ?? record.campaign_id;
    const donationType = record.donation_type;
    if (
      record.hfrp_donation !== "v1" ||
      !campaignId ||
      !/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(campaignId) ||
      (record.campaignId &&
        record.campaign_id &&
        record.campaignId !== record.campaign_id) ||
      (donationType !== "one_time" && donationType !== "recurring")
    ) {
      return null;
    }

    const current: DonationIdentity = { campaignId, donationType };
    if (
      identity &&
      (identity.campaignId !== current.campaignId ||
        identity.donationType !== current.donationType)
    ) {
      return null;
    }
    identity = current;
  }

  return identity;
}

function paymentData(
  values: Omit<DonationPayment, "campaignId" | "stripeCreatedAt" | "paidAt">,
  event: Stripe.Event,
  campaignId: string,
): DonationPayment {
  return {
    ...values,
    campaignId,
    stripeCreatedAt: new Date(event.created * 1000),
    paidAt: values.status === "paid" ? new Date(event.created * 1000) : null,
  };
}

function subscriptionInterval(
  value: string | null | undefined,
): StripeSubscriptionRecord["interval"] {
  if (
    value === "day" ||
    value === "week" ||
    value === "month" ||
    value === "year"
  ) {
    return value;
  }
  return "month";
}

function subscriptionStatus(
  status: Stripe.Subscription.Status,
): StripeSubscriptionRecord["status"] {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "unpaid":
      return "unpaid";
    default:
      return "incomplete";
  }
}

export function normalizeStripeDonationEvent(
  event: Stripe.Event,
): StripeDonationEvent | null {
  const base = {
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
  };

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const identity = donationIdentity(session.metadata);
      if (!identity) return null;

      if (session.mode === "subscription") {
        if (identity.donationType !== "recurring") return null;
        return {
          ...base,
          objectId: session.id,
          payment: null,
          subscription: null,
        };
      }
      if (session.mode !== "payment" || identity.donationType !== "one_time") {
        return null;
      }

      const status: DonationPayment["status"] =
        event.type === "checkout.session.async_payment_failed"
          ? "failed"
          : event.type === "checkout.session.async_payment_succeeded"
            ? "paid"
            : session.payment_status === "paid"
              ? "paid"
              : "pending";

      return {
        ...base,
        objectId: session.id,
        subscription: null,
        payment: paymentData(
          {
            checkoutSessionId: session.id,
            paymentIntentId: objectId(session.payment_intent),
            invoiceId: null,
            customerId: objectId(session.customer),
            subscriptionId: null,
            donorEmail:
              session.customer_details?.email ?? session.customer_email ?? null,
            donorName: session.customer_details?.name ?? null,
            amountMinor: positiveAmount(session.amount_total),
            currency: normalizeCurrency(session.currency),
            status,
            donationType: "one_time",
            failureCode: null,
          },
          event,
          identity.campaignId,
        ),
      };
    }

    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const identity = donationIdentity(intent.metadata);
      if (!identity || identity.donationType !== "one_time") return null;
      return {
        ...base,
        objectId: intent.id,
        subscription: null,
        payment: paymentData(
          {
            checkoutSessionId: null,
            paymentIntentId: intent.id,
            invoiceId: null,
            customerId: objectId(intent.customer),
            subscriptionId: null,
            donorEmail: null,
            donorName: null,
            amountMinor: positiveAmount(
              intent.amount_received || intent.amount,
            ),
            currency: normalizeCurrency(intent.currency),
            status: "paid",
            donationType: "one_time",
            failureCode: null,
          },
          event,
          identity.campaignId,
        ),
      };
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const identity = donationIdentity(subscription.metadata);
      if (!identity || identity.donationType !== "recurring") return null;

      const item = subscription.items.data[0];
      if (!item?.price) return null;
      return {
        ...base,
        objectId: subscription.id,
        payment: null,
        subscription: {
          subscriptionId: subscription.id,
          customerId: objectId(subscription.customer),
          campaignId: identity.campaignId,
          amountMinor: positiveAmount(item.price.unit_amount),
          currency: normalizeCurrency(item.price.currency),
          interval: subscriptionInterval(item.price.recurring?.interval),
          status:
            event.type === "customer.subscription.deleted"
              ? "canceled"
              : subscriptionStatus(subscription.status),
          eventCreatedAt: new Date(event.created * 1000),
        },
      };
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.id) throw new Error("Stripe invoice is missing its ID");
      const parent = invoice.parent?.subscription_details;
      const subscriptionId = parent ? objectId(parent.subscription) : null;
      if (!subscriptionId) return null;
      const identity = donationIdentity(
        invoice.metadata,
        parent?.metadata,
        ...invoice.lines.data.map((line) => line.metadata),
      );
      if (!identity || identity.donationType !== "recurring") return null;
      const amount =
        event.type === "invoice.paid"
          ? invoice.amount_paid
          : invoice.amount_due;

      if (amount === 0 && event.type === "invoice.paid") {
        return {
          ...base,
          objectId: invoice.id,
          payment: null,
          subscription: null,
        };
      }

      const campaignId = identity.campaignId;
      const amountMinor = positiveAmount(amount);
      const status = event.type === "invoice.paid" ? "paid" : "failed";
      const paymentIntent = invoice.payments?.data.find(
        (invoicePayment) => invoicePayment.payment.payment_intent,
      )?.payment.payment_intent;
      const paymentIntentId = objectId(paymentIntent);

      return {
        ...base,
        objectId: invoice.id,
        subscription:
          subscriptionId && parent
            ? {
                subscriptionId,
                customerId: objectId(invoice.customer),
                campaignId,
                amountMinor,
                currency: normalizeCurrency(invoice.currency),
                interval: subscriptionInterval(
                  parent.metadata?.donation_frequency,
                ),
                status: status === "paid" ? "active" : "past_due",
                eventCreatedAt: new Date(event.created * 1000),
              }
            : null,
        payment: paymentData(
          {
            checkoutSessionId: null,
            paymentIntentId,
            invoiceId: invoice.id,
            customerId: objectId(invoice.customer),
            subscriptionId,
            donorEmail: invoice.customer_email ?? null,
            donorName: invoice.customer_name ?? null,
            amountMinor,
            currency: normalizeCurrency(invoice.currency),
            status,
            donationType: "recurring",
            failureCode: invoice.last_finalization_error?.code ?? null,
          },
          event,
          campaignId,
        ),
      };
    }

    default:
      return null;
  }
}

export async function processStripeDonationEvent(
  event: Stripe.Event,
  repository?: StripeDonationRepository,
): Promise<"processed" | "already_processed" | "ignored"> {
  const normalized = normalizeStripeDonationEvent(event);
  if (!normalized) return "ignored";
  const result = await (
    repository ?? createStripeDonationRepository()
  ).processEvent(normalized);
  return result.status;
}

export function constructVerifiedStripeEvent(
  stripe: Stripe,
  rawBody: string,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}
