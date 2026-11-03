import { describe, it, expect } from 'bun:test';
import {
  STRIPE_WEBHOOK_EVENTS,
  STRIPE_WEBHOOK_PATH,
  getStripeWebhookUrl,
  isStripeWebhookEvent,
} from '../../../src/lib/stripe-webhook-events';

describe('stripe-webhook-events', () => {
  describe('STRIPE_WEBHOOK_EVENTS', () => {
    it('lists exactly the events the webhook handler processes', () => {
      expect([...STRIPE_WEBHOOK_EVENTS]).toEqual([
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'customer.subscription.paused',
        'customer.subscription.resumed',
        'invoice.paid',
        'invoice.payment_failed',
      ]);
    });

    it('has no duplicates and no wildcard', () => {
      expect(new Set(STRIPE_WEBHOOK_EVENTS).size).toBe(STRIPE_WEBHOOK_EVENTS.length);
      expect(STRIPE_WEBHOOK_EVENTS as readonly string[]).not.toContain('*');
    });
  });

  describe('STRIPE_WEBHOOK_PATH', () => {
    it('points at the webhook route', () => {
      expect(STRIPE_WEBHOOK_PATH).toBe('/api/webhooks/stripe');
    });
  });

  describe('isStripeWebhookEvent', () => {
    it('returns true for subscribed events', () => {
      expect(isStripeWebhookEvent('invoice.paid')).toBe(true);
      expect(isStripeWebhookEvent('customer.subscription.paused')).toBe(true);
    });

    it('returns false for other events', () => {
      expect(isStripeWebhookEvent('charge.succeeded')).toBe(false);
      expect(isStripeWebhookEvent('')).toBe(false);
    });
  });

  describe('getStripeWebhookUrl', () => {
    it('appends the webhook path to the site URL', () => {
      expect(getStripeWebhookUrl('https://knowyouremoji.com')).toBe(
        'https://knowyouremoji.com/api/webhooks/stripe'
      );
    });

    it('ignores a trailing slash or path on the site URL', () => {
      expect(getStripeWebhookUrl('https://knowyouremoji.com/')).toBe(
        'https://knowyouremoji.com/api/webhooks/stripe'
      );
      expect(getStripeWebhookUrl('https://knowyouremoji.com/some/page?x=1')).toBe(
        'https://knowyouremoji.com/api/webhooks/stripe'
      );
    });

    it('keeps the port for local URLs', () => {
      expect(getStripeWebhookUrl('http://localhost:3000')).toBe(
        'http://localhost:3000/api/webhooks/stripe'
      );
    });

    it('throws on an invalid site URL', () => {
      expect(() => getStripeWebhookUrl('not a url')).toThrow();
    });
  });
});
