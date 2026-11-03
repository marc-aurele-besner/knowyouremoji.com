import { describe, it, expect, mock } from 'bun:test';
import Stripe from 'stripe';

import {
  ENDPOINT_DESCRIPTION,
  checkApiKey,
  ensureWebhookEndpoint,
  formatReport,
  listAllEndpoints,
  parseArgs,
  resolveWebhookUrl,
  sameEvents,
  type EndpointResult,
  type StripeWebhookClient,
} from '../../../scripts/setup-stripe-webhook';
import { STRIPE_WEBHOOK_EVENTS } from '../../../src/lib/stripe-webhook-events';

const URL_PROD = 'https://knowyouremoji.com/api/webhooks/stripe';
const EVENTS = [...STRIPE_WEBHOOK_EVENTS];

function endpoint(overrides: Partial<Stripe.WebhookEndpoint> = {}): Stripe.WebhookEndpoint {
  return {
    id: 'we_1',
    object: 'webhook_endpoint',
    url: URL_PROD,
    enabled_events: EVENTS,
    api_version: Stripe.API_VERSION,
    status: 'enabled',
    ...overrides,
  } as Stripe.WebhookEndpoint;
}

interface FakeClient {
  client: StripeWebhookClient;
  list: ReturnType<typeof mock>;
  create: ReturnType<typeof mock>;
  update: ReturnType<typeof mock>;
}

/** Fake Stripe client whose list returns the given pages in order. */
function fakeClient(pages: Stripe.WebhookEndpoint[][]): FakeClient {
  let call = 0;
  const list = mock(async () => {
    const data = pages[call] ?? [];
    const has_more = call < pages.length - 1;
    call++;
    return { data, has_more };
  });
  const create = mock(async (params: Stripe.WebhookEndpointCreateParams) =>
    endpoint({
      id: 'we_new',
      url: params.url,
      enabled_events: params.enabled_events,
      api_version: params.api_version ?? null,
      secret: 'whsec_test_new',
    })
  );
  const update = mock(async (id: string, params: Stripe.WebhookEndpointUpdateParams) =>
    endpoint({ id, enabled_events: params.enabled_events })
  );
  const client = { webhookEndpoints: { list, create, update } } as unknown as StripeWebhookClient;
  return { client, list, create, update };
}

describe('setup-stripe-webhook', () => {
  describe('parseArgs', () => {
    it('defaults to test mode with no URL', () => {
      expect(parseArgs([])).toEqual({ live: false });
    });

    it('reads --live and --url in both forms', () => {
      expect(parseArgs(['--live', '--url', 'https://a.com'])).toEqual({
        live: true,
        url: 'https://a.com',
      });
      expect(parseArgs(['--url=https://b.com'])).toEqual({ live: false, url: 'https://b.com' });
    });

    it('ignores unknown arguments', () => {
      expect(parseArgs(['--verbose'])).toEqual({ live: false });
    });
  });

  describe('checkApiKey', () => {
    it('requires a key', () => {
      expect(checkApiKey(undefined, false)).toContain('not set');
    });

    it('rejects publishable and malformed keys', () => {
      expect(checkApiKey('pk_test_123', false)).toContain('secret (sk_) or restricted (rk_)');
    });

    it('accepts test secret and restricted keys', () => {
      expect(checkApiKey('sk_test_123', false)).toBeNull();
      expect(checkApiKey('rk_test_123', false)).toBeNull();
    });

    it('refuses a live key without --live', () => {
      expect(checkApiKey('rk_live_123', false)).toContain('without --live');
    });

    it('accepts a live key with --live', () => {
      expect(checkApiKey('rk_live_123', true)).toBeNull();
    });

    it('rejects --live with a test key', () => {
      expect(checkApiKey('sk_test_123', true)).toContain('test-mode key');
    });
  });

  describe('resolveWebhookUrl', () => {
    it('requires a site URL', () => {
      expect(resolveWebhookUrl(undefined, false)).toEqual({
        error: expect.stringContaining('--url'),
      });
    });

    it('rejects an invalid site URL', () => {
      expect(resolveWebhookUrl('nope', false)).toEqual({
        error: 'Invalid site URL: nope',
      });
    });

    it('rejects localhost and points at stripe listen', () => {
      for (const site of ['http://localhost:3000', 'http://127.0.0.1:3000']) {
        expect(resolveWebhookUrl(site, false)).toEqual({
          error: expect.stringContaining('stripe listen'),
        });
      }
    });

    it('requires https in live mode', () => {
      expect(resolveWebhookUrl('http://knowyouremoji.com', true)).toEqual({
        error: 'Live webhook endpoints must use https.',
      });
    });

    it('allows http in test mode', () => {
      expect(resolveWebhookUrl('http://staging.example.com', false)).toEqual({
        url: 'http://staging.example.com/api/webhooks/stripe',
      });
    });

    it('builds the production webhook URL', () => {
      expect(resolveWebhookUrl('https://knowyouremoji.com/', true)).toEqual({ url: URL_PROD });
    });
  });

  describe('sameEvents', () => {
    it('ignores order', () => {
      expect(sameEvents(['a', 'b'], ['b', 'a'])).toBe(true);
    });

    it('detects missing and extra events', () => {
      expect(sameEvents(['a'], ['a', 'b'])).toBe(false);
      expect(sameEvents(['a', 'c'], ['a', 'b'])).toBe(false);
    });
  });

  describe('listAllEndpoints', () => {
    it('follows pagination', async () => {
      const { client, list } = fakeClient([
        [endpoint({ id: 'we_a' }), endpoint({ id: 'we_b' })],
        [endpoint({ id: 'we_c' })],
      ]);
      const all = await listAllEndpoints(client);
      expect(all.map((e) => e.id)).toEqual(['we_a', 'we_b', 'we_c']);
      expect(list).toHaveBeenNthCalledWith(1, { limit: 100 });
      expect(list).toHaveBeenNthCalledWith(2, { limit: 100, starting_after: 'we_b' });
    });

    it('stops on an empty page even if has_more is set', async () => {
      const list = mock(async () => ({ data: [], has_more: true }));
      const client = { webhookEndpoints: { list } } as unknown as StripeWebhookClient;
      expect(await listAllEndpoints(client)).toEqual([]);
      expect(list).toHaveBeenCalledTimes(1);
    });
  });

  describe('ensureWebhookEndpoint', () => {
    it('creates the endpoint when none matches the URL', async () => {
      const { client, create, update } = fakeClient([
        [endpoint({ id: 'we_other', url: 'https://other.example.com/hook' })],
      ]);
      const result = await ensureWebhookEndpoint(client, URL_PROD);

      expect(create).toHaveBeenCalledWith({
        url: URL_PROD,
        enabled_events: EVENTS,
        api_version: Stripe.API_VERSION,
        description: ENDPOINT_DESCRIPTION,
      });
      expect(update).not.toHaveBeenCalled();
      expect(result).toEqual({
        action: 'created',
        endpointId: 'we_new',
        url: URL_PROD,
        enabledEvents: EVENTS,
        secret: 'whsec_test_new',
        warnings: [],
      });
    });

    it('leaves a matching endpoint unchanged and returns no secret', async () => {
      const { client, create, update } = fakeClient([
        [endpoint({ enabled_events: [...EVENTS].reverse() })],
      ]);
      const result = await ensureWebhookEndpoint(client, URL_PROD);

      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(result.action).toBe('unchanged');
      expect(result.secret).toBeUndefined();
      expect(result.warnings).toEqual([]);
    });

    it('updates enabled events that drifted', async () => {
      const { client, update } = fakeClient([
        [endpoint({ enabled_events: ['checkout.session.completed', 'charge.succeeded'] })],
      ]);
      const result = await ensureWebhookEndpoint(client, URL_PROD);

      expect(update).toHaveBeenCalledWith('we_1', { enabled_events: EVENTS });
      expect(result.action).toBe('updated');
      expect(result.enabledEvents).toEqual(EVENTS);
      expect(result.secret).toBeUndefined();
    });

    it('re-enables a disabled endpoint', async () => {
      const { client, update } = fakeClient([[endpoint({ status: 'disabled' })]]);
      const result = await ensureWebhookEndpoint(client, URL_PROD);

      expect(update).toHaveBeenCalledWith('we_1', { enabled_events: EVENTS, disabled: false });
      expect(result.action).toBe('updated');
    });

    it('warns about duplicate endpoints and uses the first', async () => {
      const { client, update } = fakeClient([[endpoint({ id: 'we_a' }), endpoint({ id: 'we_b' })]]);
      const result = await ensureWebhookEndpoint(client, URL_PROD);

      expect(update).not.toHaveBeenCalled();
      expect(result.endpointId).toBe('we_a');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('we_a, we_b');
    });

    it('warns when the endpoint API version differs from the SDK', async () => {
      const { client } = fakeClient([
        [
          endpoint({ id: 'we_a', api_version: '2025-03-31.basil' }),
          endpoint({ id: 'we_b', url: 'x' }),
        ],
      ]);
      const result = await ensureWebhookEndpoint(client, URL_PROD);
      expect(result.warnings).toEqual([expect.stringContaining('2025-03-31.basil')]);
    });

    it('describes a null API version as the account default', async () => {
      const { client } = fakeClient([[endpoint({ api_version: null })]]);
      const result = await ensureWebhookEndpoint(client, URL_PROD);
      expect(result.warnings[0]).toContain('account default');
    });

    it('accepts a custom event list and API version', async () => {
      const { client, create } = fakeClient([[]]);
      await ensureWebhookEndpoint(client, URL_PROD, ['invoice.paid'], '2025-03-31.basil');
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled_events: ['invoice.paid'],
          api_version: '2025-03-31.basil',
        })
      );
    });
  });

  describe('formatReport', () => {
    const base: EndpointResult = {
      action: 'unchanged',
      endpointId: 'we_1',
      url: URL_PROD,
      enabledEvents: ['invoice.paid'],
      warnings: [],
    };

    it('prints the secret only on creation', () => {
      const report = formatReport({ ...base, action: 'created', secret: 'whsec_test_new' }, true);
      expect(report).toContain('we_1 (live mode): created');
      expect(report).toContain('STRIPE_WEBHOOK_SECRET=whsec_test_new');
      expect(report).toContain('Production');
    });

    it('points test-mode secrets at the Preview environment', () => {
      const report = formatReport({ ...base, action: 'created', secret: 'whsec_x' }, false);
      expect(report).toContain('(test mode)');
      expect(report).toContain('Preview');
    });

    it('does not print a secret when the endpoint already existed', () => {
      const report = formatReport({ ...base, warnings: ['careful'] }, false);
      expect(report).not.toContain('STRIPE_WEBHOOK_SECRET=');
      expect(report).toContain('The signing secret is unchanged');
      expect(report).toContain('Warning: careful');
      expect(report).toContain(`URL: ${URL_PROD}`);
      expect(report).toContain('Events: invoice.paid');
    });
  });
});
