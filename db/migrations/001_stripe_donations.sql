BEGIN;

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  campaign_id TEXT NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  currency CHAR(3) NOT NULL CHECK (currency ~ '^[a-z]{3}$'),
  interval TEXT NOT NULL CHECK (interval IN ('day', 'week', 'month', 'year')),
  status TEXT NOT NULL CHECK (
    status IN ('incomplete', 'active', 'past_due', 'paused', 'canceled', 'unpaid')
  ),
  status_updated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT REFERENCES stripe_subscriptions(stripe_subscription_id),
  donor_email TEXT,
  donor_name TEXT,
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  currency CHAR(3) NOT NULL CHECK (currency ~ '^[a-z]{3}$'),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  donation_type TEXT NOT NULL CHECK (donation_type IN ('one_time', 'recurring')),
  campaign_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website',
  failure_code TEXT,
  stripe_created_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    stripe_checkout_session_id IS NOT NULL
    OR stripe_payment_intent_id IS NOT NULL
    OR stripe_invoice_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS donations_campaign_status_date_idx
  ON donations (campaign_id, status, stripe_created_at DESC);
CREATE INDEX IF NOT EXISTS donations_subscription_date_idx
  ON donations (stripe_subscription_id, stripe_created_at DESC)
  WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS donations_customer_date_idx
  ON donations (stripe_customer_id, stripe_created_at DESC)
  WHERE stripe_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS processed_stripe_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  stripe_object_id TEXT NOT NULL,
  livemode BOOLEAN NOT NULL,
  status TEXT NOT NULL CHECK (status = 'processed'),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
