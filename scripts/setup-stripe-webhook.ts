#!/usr/bin/env bun
/**
 * Configures the KnowYourEmoji webhook endpoint in Stripe.
 *
 * Makes the Stripe account have exactly one webhook endpoint for
 * `<site URL>/api/webhooks/stripe` that subscribes to the events in
 * `src/lib/stripe-webhook-events.ts`:
 *
 * - No endpoint for the URL: one is created, pinned to the API version of the
 *   installed `stripe` SDK, and its signing secret is printed once so it can
 *   be stored as STRIPE_WEBHOOK_SECRET. Stripe only returns the secret on
 *   creation.
 * - An endpoint exists: its enabled events are updated if they drifted, and
 *   it is re-enabled if it was disabled. The signing secret is not changed
 *   and never printed.
 *
 * The script is idempotent: running it twice makes no changes the second time.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=rk_test_... bun run stripe:webhook:setup -- --url https://staging.example.com
 *   STRIPE_SECRET_KEY=rk_live_... bun run stripe:webhook:setup -- --live
 *
 * The site URL comes from `--url`, or NEXT_PUBLIC_APP_URL when omitted. A
 * live-mode key is refused unless `--live` is passed, and live mode requires
 * a public https URL. See docs/stripe-webhooks.md.
 */

import Stripe from 'stripe';

import { STRIPE_WEBHOOK_EVENTS, getStripeWebhookUrl } from '../src/lib/stripe-webhook-events';

/** The subset of the Stripe client the setup script uses. */
export type StripeWebhookClient = Pick<Stripe, 'webhookEndpoints'>;

export type EndpointAction = 'created' | 'updated' | 'unchanged';

export interface EndpointResult {
  action: EndpointAction;
  endpointId: string;
  url: string;
  enabledEvents: string[];
  /** Signing secret. Only set when the endpoint was just created. */
  secret?: string;
  warnings: string[];
}

export interface CliOptions {
  live: boolean;
  url?: string;
}

/** Marks endpoints this script manages, so they are easy to spot in the Dashboard. */
export const ENDPOINT_DESCRIPTION = 'KnowYourEmoji subscriptions (managed by setup-stripe-webhook)';

/** Parse `--live` and `--url <site URL>` (or `--url=<site URL>`). */
export function parseArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = { live: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--live') {
      options.live = true;
    } else if (arg === '--url') {
      options.url = argv[i + 1];
      i++;
    } else if (arg.startsWith('--url=')) {
      options.url = arg.slice('--url='.length);
    }
  }
  return options;
}

/** Validate the API key and mode. Returns an error message, or null when OK. */
export function checkApiKey(key: string | undefined, allowLive: boolean): string | null {
  if (!key) {
    return 'STRIPE_SECRET_KEY is not set. Use a sandbox key (sk_test_ or rk_test_).';
  }
  if (!/^(sk|rk)_(test|live)_/.test(key)) {
    return 'STRIPE_SECRET_KEY must be a secret (sk_) or restricted (rk_) key.';
  }
  if (key.includes('_live_') && !allowLive) {
    return 'Refusing to use a live-mode key without --live.';
  }
  if (!key.includes('_live_') && allowLive) {
    return '--live was passed but STRIPE_SECRET_KEY is a test-mode key.';
  }
  return null;
}

/**
 * Resolve the absolute webhook URL from the site URL. Returns the URL, or an
 * error message. Live mode requires a public https URL because Stripe only
 * delivers live events to https endpoints.
 */
export function resolveWebhookUrl(
  siteUrl: string | undefined,
  live: boolean
): { url: string } | { error: string } {
  if (!siteUrl) {
    return { error: 'No site URL. Pass --url <site URL> or set NEXT_PUBLIC_APP_URL.' };
  }

  let url: URL;
  try {
    url = new URL(getStripeWebhookUrl(siteUrl));
  } catch {
    return { error: `Invalid site URL: ${siteUrl}` };
  }

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (isLocal) {
    return {
      error:
        'Stripe cannot reach localhost. For local development use: ' +
        'stripe listen --forward-to localhost:3000/api/webhooks/stripe',
    };
  }
  if (live && url.protocol !== 'https:') {
    return { error: 'Live webhook endpoints must use https.' };
  }
  return { url: url.toString() };
}

/** Whether two event lists contain the same events, ignoring order. */
export function sameEvents(a: readonly string[], b: readonly string[]): boolean {
  const left = new Set(a);
  const right = new Set(b);
  return left.size === right.size && [...left].every((event) => right.has(event));
}

/** List every webhook endpoint on the account, following pagination. */
export async function listAllEndpoints(
  stripe: StripeWebhookClient
): Promise<Stripe.WebhookEndpoint[]> {
  const endpoints: Stripe.WebhookEndpoint[] = [];
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.webhookEndpoints.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    endpoints.push(...page.data);
    if (!page.has_more || page.data.length === 0) {
      return endpoints;
    }
    startingAfter = page.data[page.data.length - 1].id;
  }
}

/** Create the webhook endpoint for `url`, or bring an existing one in line. */
export async function ensureWebhookEndpoint(
  stripe: StripeWebhookClient,
  url: string,
  events: readonly Stripe.WebhookEndpointCreateParams.EnabledEvent[] = STRIPE_WEBHOOK_EVENTS,
  apiVersion: Stripe.WebhookEndpointCreateParams.ApiVersion = Stripe.API_VERSION
): Promise<EndpointResult> {
  const warnings: string[] = [];
  const matches = (await listAllEndpoints(stripe)).filter((endpoint) => endpoint.url === url);

  if (matches.length === 0) {
    const created = await stripe.webhookEndpoints.create({
      url,
      enabled_events: [...events],
      api_version: apiVersion,
      description: ENDPOINT_DESCRIPTION,
    });
    return {
      action: 'created',
      endpointId: created.id,
      url,
      enabledEvents: created.enabled_events,
      secret: created.secret,
      warnings,
    };
  }

  const [endpoint, ...duplicates] = matches;
  if (duplicates.length > 0) {
    warnings.push(
      `${matches.length} endpoints point at ${url}: ${matches.map((e) => e.id).join(', ')}. ` +
        `Using ${endpoint.id}. Delete the others in the Dashboard, or each event is delivered more than once.`
    );
  }
  if (endpoint.api_version !== apiVersion) {
    warnings.push(
      `Endpoint ${endpoint.id} uses API version ${endpoint.api_version ?? 'account default'}, ` +
        `but the stripe SDK uses ${apiVersion}. An endpoint's API version cannot be changed; ` +
        'see "Upgrading the API version" in docs/stripe-webhooks.md.'
    );
  }

  const eventsDrifted = !sameEvents(endpoint.enabled_events, events);
  const disabled = endpoint.status === 'disabled';
  if (!eventsDrifted && !disabled) {
    return {
      action: 'unchanged',
      endpointId: endpoint.id,
      url,
      enabledEvents: endpoint.enabled_events,
      warnings,
    };
  }

  const updated = await stripe.webhookEndpoints.update(endpoint.id, {
    enabled_events: [...events],
    ...(disabled ? { disabled: false } : {}),
  });
  return {
    action: 'updated',
    endpointId: updated.id,
    url,
    enabledEvents: updated.enabled_events,
    warnings,
  };
}

/** Format the result as a report. The secret is only included on creation. */
export function formatReport(result: EndpointResult, live: boolean): string {
  const lines = [
    `Webhook endpoint ${result.endpointId} (${live ? 'live' : 'test'} mode): ${result.action}`,
    `  URL: ${result.url}`,
    `  Events: ${result.enabledEvents.join(', ')}`,
  ];

  for (const warning of result.warnings) {
    lines.push('', `Warning: ${warning}`);
  }

  if (result.secret) {
    lines.push(
      '',
      'Stripe shows this signing secret only once. Set it as STRIPE_WEBHOOK_SECRET',
      `in the Vercel project (${live ? 'Production' : 'Preview'} environment), then redeploy:`,
      '',
      `STRIPE_WEBHOOK_SECRET=${result.secret}`
    );
  } else {
    lines.push(
      '',
      'The signing secret is unchanged. If STRIPE_WEBHOOK_SECRET is missing or wrong,',
      'reveal or roll the secret in the Dashboard (Developers > Webhooks).'
    );
  }
  return lines.join('\n');
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const key = process.env.STRIPE_SECRET_KEY;
  const keyError = checkApiKey(key, options.live);
  if (keyError) {
    console.error(keyError);
    process.exit(1);
  }

  const resolved = resolveWebhookUrl(options.url ?? process.env.NEXT_PUBLIC_APP_URL, options.live);
  if ('error' in resolved) {
    console.error(resolved.error);
    process.exit(1);
  }

  const stripe = new Stripe(key as string, { apiVersion: Stripe.API_VERSION });
  const result = await ensureWebhookEndpoint(stripe, resolved.url);
  console.log(formatReport(result, options.live));
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Stripe webhook setup failed:', error);
    process.exit(1);
  });
}
