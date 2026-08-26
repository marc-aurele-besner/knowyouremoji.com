-- Migration: Create subscriptions table for Stripe-backed plans
-- Run against your Neon Postgres database.

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'free',
  plan text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One subscription row per user. The app always reads a single row per user
-- (getUserSubscription in src/lib/subscriptions.ts) and the Stripe webhook
-- updates by user_id, so uniqueness is also what stops a redelivered
-- checkout.session.completed from inserting a second row for the same user.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Webhook handlers resolve a Stripe subscription back to exactly one row
-- (customer.subscription.updated / .deleted, invoice.payment_failed).
-- NULLs are distinct in Postgres, so free-plan rows without a Stripe
-- subscription are unaffected by this constraint.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON subscriptions(stripe_subscription_id);

-- Keep updated_at current on every write. update_updated_at() is defined in
-- 004_create_profiles.sql; migrations are applied in numeric order.
DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ AUTHORIZATION NOTE (no RLS policies) ============
--
-- The original spec for this table asked for Supabase-style RLS policies. This
-- project runs on Neon Postgres with NextAuth, not Supabase Auth, so RLS is
-- deliberately not enabled here:
--
--   1. auth.uid() does not exist outside Supabase, so a policy written against
--      it would fail at migration time.
--   2. The app connects through a single Postgres role over the Neon HTTP
--      driver (src/lib/db/index.ts). There is no per-request database identity
--      for a policy to match on, and each query is its own implicit
--      transaction, so a SET LOCAL / current_setting() based policy has nothing
--      reliable to read.
--   3. Enabling RLS without a workable policy would silently return zero rows
--      whenever the connecting role is not the table owner.
--
-- Access is therefore scoped in the application layer: every read and write
-- filters by the NextAuth session user id, and the API routes under
-- src/app/api/billing/* reject unauthenticated requests. Revisit this if the
-- project ever moves to per-user database roles.
