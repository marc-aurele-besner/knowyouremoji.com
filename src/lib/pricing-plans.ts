/**
 * The KnowYourEmoji subscription plans.
 *
 * The pricing page renders these as tier cards, and the page's
 * `Product` / `Offer` structured data is built from the same records. A
 * single source is the point: an answer engine quoting "Pro is $9 a month"
 * has to be quoting the same number the page shows, and a price that
 * drifts between the markup and the visible card is worse than no markup
 * at all.
 *
 * Prices are in whole US dollars per month. The `price` field is a string
 * because schema.org requires a decimal-formatted string.
 */

export interface PricingPlan {
  /** Plan name, as shown on the tier card. */
  name: string;
  /** Short positioning line under the plan name. */
  tagline: string;
  /** Price in whole US dollars per month. */
  price: number;
  /** Currency of `price`. */
  currency: string;
  /** One-line summary used as the structured-data description. */
  description: string;
  /** Bullet points listed on the tier card. */
  features: string[];
  /** Canonical path of the plan's call to action. */
  url: string;
}

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    name: 'Free',
    tagline: 'Perfect for casual users',
    price: 0,
    currency: 'USD',
    description:
      'Free KnowYourEmoji plan with 3 emoji interpretations per day, the full emoji and combo dictionary, and context-aware meanings.',
    features: [
      '3 interpretations per day',
      'Browse emoji database',
      'Context-aware meanings',
      'Platform differences',
    ],
    url: '/interpreter',
  },
  {
    name: 'Pro',
    tagline: 'For power users and professionals',
    price: 9,
    currency: 'USD',
    description:
      'KnowYourEmoji Pro plan with unlimited emoji interpretations, priority AI processing, interpretation history, and saved favourites, for $9 per month.',
    features: [
      'Unlimited interpretations',
      'Priority AI processing',
      'Interpretation history',
      'Save favorite interpretations',
    ],
    url: '/pricing',
  },
] as const;

/**
 * Get a plan by name.
 */
export function getPricingPlan(name: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.name === name);
}
