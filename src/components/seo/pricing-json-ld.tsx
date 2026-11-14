/**
 * JSON-LD structured data for the pricing page.
 *
 * The pricing page is the one page on the site where a fact is both
 * public and precisely quotable: what a plan costs. Without `Offer`
 * markup an answer engine has to read the tier cards and infer a price
 * from "$9 /month" text; with it, the price is a machine-readable field
 * it can cite directly.
 *
 * Every field here comes from `src/lib/pricing-plans.ts`, which is also
 * what the visible tier cards render, so the markup cannot drift from
 * what the reader sees. Nothing is invented here — there are no ratings
 * or reviews because the page publishes none.
 */

import { PRICING_PLANS } from '@/lib/pricing-plans';

interface PricingJsonLdProps {
  /** Base URL of the application (e.g. https://knowyouremoji.com) */
  appUrl: string;
  /** Name of the application */
  appName: string;
}

/**
 * Build the `Product` / `Offer` payload for the pricing page.
 *
 * Exported separately so the shape can be asserted in unit tests without
 * rendering React.
 */
export function buildPricingJsonLd(appUrl: string, appName: string) {
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

  const products = PRICING_PLANS.map((plan) => ({
    '@type': 'Product' as const,
    '@id': `${baseUrl}/pricing#${plan.name.toLowerCase()}-plan`,
    name: `KnowYourEmoji ${plan.name}`,
    description: plan.description,
    url: `${baseUrl}${plan.url}`,
    brand: {
      '@type': 'Brand' as const,
      name: appName,
    },
    category: 'Software Application',
    offers: {
      '@type': 'Offer' as const,
      name: `${plan.name} plan`,
      price: plan.price.toFixed(2),
      priceCurrency: plan.currency,
      description: `${plan.name} plan: ${plan.features.join(', ')}`,
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}${plan.url}`,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': products,
  };
}

/**
 * Renders `Product` + `Offer` JSON-LD for the pricing page.
 */
export function PricingJsonLd({ appUrl, appName }: PricingJsonLdProps) {
  const jsonLd = buildPricingJsonLd(appUrl, appName);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
