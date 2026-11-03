# Stripe setup

KnowYourEmoji sells one plan, **Pro**: $9/month with a 7-day free trial, paid through Stripe Checkout and managed through the Stripe Customer Portal.

## Where things live

| Piece                                                    | File                                      |
| -------------------------------------------------------- | ----------------------------------------- |
| Stripe client (`getStripe`, pinned `STRIPE_API_VERSION`) | `src/lib/stripe.ts`                       |
| Product and price catalog (`PRO_PLAN`)                   | `src/lib/stripe-products.ts`              |
| Catalog setup script                                     | `scripts/setup-stripe.ts`                 |
| Checkout session                                         | `src/app/api/checkout/route.ts`           |
| Customer Portal, cancel, subscription status             | `src/app/api/billing/*/route.ts`          |
| Webhook handler                                          | `src/app/api/webhooks/stripe/route.ts`    |
| Subscription table                                       | `migrations/006_create_subscriptions.sql` |

## API version

The client pins `STRIPE_API_VERSION` to the version bundled with the installed `stripe` SDK, so payload shapes do not change when the account's default version changes in the Dashboard. When you upgrade the `stripe` package, update `STRIPE_API_VERSION` to the SDK's version (typecheck fails until they match), and update the webhook endpoint's API version in the Dashboard to the same value.

## Products and prices

`src/lib/stripe-products.ts` is the source of truth. Each plan is one Stripe Product with a fixed ID (`kye_pro`). Each price has a `lookup_key` (`kye_pro_monthly`), so the script can find it without storing its ID.

To create or update the catalog:

1. Use a [sandbox](https://docs.stripe.com/sandboxes.md) for development, not live mode. Create a [restricted API key](https://docs.stripe.com/keys.md) (`rk_test_...`) with write access to Products and Prices, or use the sandbox secret key.
2. Run the script:

   ```bash
   STRIPE_SECRET_KEY=rk_test_... bun run stripe:setup
   ```

3. Copy the printed `STRIPE_PRO_PRICE_ID=price_...` line into `.env.local` and into the Vercel project's environment variables.

The script is idempotent. Running it again makes no changes. If you change a price's amount, currency, or interval, it creates a new price and moves the lookup key to it, because Stripe prices cannot be edited. Existing subscribers keep the old price. Update `STRIPE_PRO_PRICE_ID` so new checkouts use the new one.

For live mode, the script refuses a live key unless you pass `--live`:

```bash
STRIPE_SECRET_KEY=rk_live_... bun run stripe:setup -- --live
```

## Environment variables

| Variable                             | Purpose                                                       |
| ------------------------------------ | ------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                  | Server-side API key. A restricted key (`rk_`) is recommended. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side key (`pk_`).                                      |
| `STRIPE_WEBHOOK_SECRET`              | Signing secret for the webhook endpoint (`whsec_`).           |
| `STRIPE_PRO_PRICE_ID`                | Price ID printed by `bun run stripe:setup`.                   |

Without `STRIPE_SECRET_KEY`, the checkout and billing routes return 503. Without `STRIPE_PRO_PRICE_ID`, the checkout route returns 503.

## Webhooks

Subscription state comes from webhooks, not from the Checkout success page. Point a webhook endpoint at `/api/webhooks/stripe`. For local development, forward events with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Tax

If you charge customers in the US or EU, consider enabling [Stripe Tax](https://docs.stripe.com/billing/taxes/collect-taxes.md). Stripe Tax collects nothing until the account has an active tax registration, so add the registration before enabling it.
