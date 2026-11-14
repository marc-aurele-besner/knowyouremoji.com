import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { PricingJsonLd, buildPricingJsonLd } from '@/components/seo/pricing-json-ld';
import { PRICING_PLANS, getPricingPlan } from '@/lib/pricing-plans';

afterEach(() => {
  cleanup();
});

const mockAppUrl = 'https://knowyouremoji.com';
const mockAppName = 'KnowYourEmoji';

describe('PricingJsonLd', () => {
  describe('buildPricingJsonLd', () => {
    it('builds a Product for every plan', () => {
      const ld = buildPricingJsonLd(mockAppUrl, mockAppName);

      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@graph']).toHaveLength(PRICING_PLANS.length);
      expect(ld['@graph'].map((product) => product['@id'])).toEqual([
        'https://knowyouremoji.com/pricing#free-plan',
        'https://knowyouremoji.com/pricing#pro-plan',
      ]);
    });

    it('quotes the price as a decimal string, which is what schema.org requires', () => {
      const ld = buildPricingJsonLd(mockAppUrl, mockAppName);
      const pro = ld['@graph'].find((product) => product['@id'].endsWith('#pro-plan'));

      expect(pro?.offers['@type']).toBe('Offer');
      expect(pro?.offers.price).toBe('9.00');
      expect(pro?.offers.priceCurrency).toBe('USD');
    });

    it('prices the free plan at zero', () => {
      const ld = buildPricingJsonLd(mockAppUrl, mockAppName);
      const free = ld['@graph'].find((product) => product['@id'].endsWith('#free-plan'));

      expect(free?.offers.price).toBe('0.00');
    });

    it('carries the plan features in the offer description', () => {
      const ld = buildPricingJsonLd(mockAppUrl, mockAppName);
      const pro = ld['@graph'].find((product) => product['@id'].endsWith('#pro-plan'));
      const proPlan = getPricingPlan('Pro');

      expect(pro?.offers.description).toContain(proPlan!.features[0]);
    });

    it('names the brand and links to the plan page', () => {
      const ld = buildPricingJsonLd(mockAppUrl, mockAppName);

      for (const product of ld['@graph']) {
        expect(product.brand).toEqual({ '@type': 'Brand', name: mockAppName });
        expect(product.url.startsWith('https://knowyouremoji.com')).toBe(true);
        expect(product.offers.availability).toBe('https://schema.org/InStock');
      }
    });

    it('drops a trailing slash from the app URL', () => {
      const ld = buildPricingJsonLd('https://knowyouremoji.com/', mockAppName);

      expect(ld['@graph'][0]['@id']).toBe('https://knowyouremoji.com/pricing#free-plan');
    });

    it('quotes exactly the price the pricing page shows', () => {
      // The markup and the visible tier cards read from the same catalog,
      // so a price cannot drift between them.
      const ld = buildPricingJsonLd(mockAppUrl, mockAppName);

      for (const product of ld['@graph']) {
        const name = product['@id'].split('#')[1].replace('-plan', '');
        const plan = PRICING_PLANS.find((candidate) => candidate.name.toLowerCase() === name);

        expect(plan).toBeDefined();
        expect(product.offers.price).toBe(plan!.price.toFixed(2));
      }
    });
  });

  describe('rendering', () => {
    it('renders a script tag with type application/ld+json', () => {
      render(<PricingJsonLd appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
    });

    it('emits JSON that parses back to the same payload', () => {
      render(<PricingJsonLd appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(JSON.parse(script!.textContent!)).toEqual(buildPricingJsonLd(mockAppUrl, mockAppName));
    });
  });
});
