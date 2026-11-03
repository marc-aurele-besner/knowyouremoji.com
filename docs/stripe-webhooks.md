# Stripe Webhooks

Subscription state in Neon comes from Stripe webhooks, not from the Checkout success page. Each environment that takes payments needs a webhook endpoint in Stripe and a matching `STRIPE_WEBHOOK_SECRET`. If the endpoint is missing or the secret is wrong, checkouts still succeed, but subscriptions never become active in the app.

| What                     | Where                                        |
| ------------------------ | -------------------------------------------- |
| Webhook route            | `src/app/api/webhooks/stripe/route.ts`       |
| Subscribed events (list) | `src/lib/stripe-webhook-events.ts`           |
| Endpoint setup script    | `scripts/setup-stripe-webhook.ts`            |
| Signing secret           | `STRIPE_WEBHOOK_SECRET` (Vercel environment) |

## Endpoints per environment

| Environment       | Stripe account mode       | Endpoint URL                                           | Vercel environment |
| ----------------- | ------------------------- | ------------------------------------------------------ | ------------------ |
| Production        | Live mode                 | `https://knowyouremoji.com/api/webhooks/stripe`        | Production         |
| Staging / preview | A sandbox                 | `https://<stable preview domain>/api/webhooks/stripe`  | Preview            |
| Local development | A sandbox, via Stripe CLI | `localhost:3000/api/webhooks/stripe` (`stripe listen`) | `.env.local`       |

Rules:

- Use the apex domain `knowyouremoji.com`, not `www`. Stripe does not follow redirects.
- Each endpoint has its own signing secret. A live-mode secret never works with a sandbox endpoint, and the reverse is also true.
- Use a [sandbox](https://docs.stripe.com/sandboxes.md) for staging and local development, not live mode. Per-deployment preview URLs change on every push, so point a sandbox endpoint at a stable preview domain (a branch alias), or use `stripe listen` instead.
- The route reads the raw request body to verify the `Stripe-Signature` header. Do not put anything in front of `/api/webhooks/stripe` that parses or rewrites the body, or that requires a login. The auth middleware (`src/middleware.ts`) only matches `/dashboard` and the auth pages, and the `www` redirect in `vercel.json` skips `/api/`.

## Subscribed events

The endpoint subscribes to exactly the events the handler processes, defined in `STRIPE_WEBHOOK_EVENTS` (`src/lib/stripe-webhook-events.ts`):

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `invoice.paid`
- `invoice.payment_failed`

Do not subscribe to `*`. Events the handler ignores still cost a request and fill the delivery logs. When you add a `case` to the handler, add the event to `STRIPE_WEBHOOK_EVENTS` and run the setup script for each environment.

## Creating or updating an endpoint

`bun run stripe:webhook:setup` makes the Stripe account have one endpoint for `<site URL>/api/webhooks/stripe` with the events above:

- No endpoint for that URL: it creates one, pinned to the API version of the installed `stripe` SDK, and prints the signing secret. **Stripe returns the secret only on creation**, so copy it right away.
- An endpoint exists: it updates the enabled events if they drifted and re-enables the endpoint if Stripe disabled it. The secret does not change and is not printed.
- Running it again makes no changes.

The site URL comes from `--url`, or from `NEXT_PUBLIC_APP_URL` when `--url` is omitted.

### API key

Use a [restricted API key](https://docs.stripe.com/keys.md) (`rk_...`) with **Write** access to **Webhook Endpoints** and nothing else. Do not paste it into `.env.local`. Pass it only for the one command, and delete the key when you are done.

### Sandbox (staging)

```bash
STRIPE_SECRET_KEY=rk_test_... bun run stripe:webhook:setup -- --url https://<stable preview domain>
```

Set the printed `STRIPE_WEBHOOK_SECRET=whsec_...` in the Vercel **Preview** environment.

### Production (live mode)

The script refuses a live key unless you pass `--live`, and refuses `--live` with a test key. In live mode the URL must be https.

```bash
STRIPE_SECRET_KEY=rk_live_... bun run stripe:webhook:setup -- --live --url https://knowyouremoji.com
```

Then:

1. In Vercel, go to Project Settings > Environment Variables. Set `STRIPE_WEBHOOK_SECRET` to the printed `whsec_...` value for **Production** only.
2. Redeploy production. Environment variables apply only to new deployments.
3. [Verify delivery](#verifying-delivery).

If the endpoint already existed and you do not have its secret, reveal it in the Dashboard (Developers > Webhooks > the endpoint > Signing secret).

## Local development

Stripe cannot reach `localhost`. Forward sandbox events with the [Stripe CLI](https://docs.stripe.com/stripe-cli.md) instead of creating an endpoint:

```bash
stripe login
stripe listen \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.paused,customer.subscription.resumed,invoice.paid,invoice.payment_failed \
  --forward-to localhost:3000/api/webhooks/stripe
```

`stripe listen` prints a `whsec_...` secret for the session. Put it in `.env.local` as `STRIPE_WEBHOOK_SECRET` and restart `bun dev`. The secret usually stays the same across sessions for the same CLI login and account; if signatures start failing, copy the new one.

Send test events from another terminal:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_failed
```

To test the full flow, complete a checkout on the dashboard with a [test card](https://docs.stripe.com/testing.md) such as `4242 4242 4242 4242`.

## Verifying delivery

After you configure an endpoint or rotate its secret:

1. In the Dashboard, open Developers > Webhooks > the endpoint. Each event should show a `200` response.
2. In sandboxes, run `stripe trigger checkout.session.completed` and confirm a `200`. Do not trigger events in live mode; make a real subscription or wait for the next one instead.
3. A `400` with `Invalid signature` means `STRIPE_WEBHOOK_SECRET` (or `STRIPE_SECRET_KEY`) is missing in that deployment or does not match the endpoint. Check that the deployment has the secret for the right endpoint and mode, and that you redeployed after setting it.
4. A `500` means the event was verified but the handler failed, for example because the database is unreachable. Check the Vercel function logs and Sentry for `/api/webhooks/stripe`.

Stripe retries failed deliveries for up to three days in live mode. After you fix a problem, resend missed events from the Dashboard, or with `stripe events resend <event id>`. If deliveries keep failing for several days, Stripe disables the endpoint and emails the account owner. Running the setup script re-enables it.

## Rotating the signing secret

Rotate the secret if it leaks, and when someone with access to it leaves.

1. In the Dashboard, open Developers > Webhooks > the endpoint, and choose **Roll secret**. Pick an expiry for the old secret, for example 24 hours. Until then, Stripe signs each event with both secrets, so the current deployment keeps working.
2. Set the new `whsec_...` value as `STRIPE_WEBHOOK_SECRET` in Vercel for that environment.
3. Redeploy, and confirm deliveries return `200` before the old secret expires.

If the secret leaked, pick the shortest expiry that still leaves time to redeploy.

## Upgrading the API version

An endpoint's API version is set when it is created and cannot be changed through the API. The setup script warns when the endpoint's version differs from the installed `stripe` SDK. After you upgrade the `stripe` package:

1. Create a new endpoint with the new version: delete the old endpoint in a sandbox first and run the setup script, or follow Stripe's [webhook versioning guide](https://docs.stripe.com/webhooks/versioning.md) for production, which avoids missing events by running both endpoints side by side.
2. Set the new endpoint's secret in Vercel, redeploy, then delete the old endpoint.

## Security

- The route verifies every event's signature with `STRIPE_WEBHOOK_SECRET` before it reads it. Treat the secret like an API key: keep it only in Vercel and `.env.local`, never in code or logs.
- The handler must stay idempotent. Stripe can deliver the same event more than once and out of order.
- For defense in depth, you can also allow only [Stripe's webhook IP addresses](https://docs.stripe.com/ips.md) with the Vercel firewall.
