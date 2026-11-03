#!/usr/bin/env bun
/**
 * Provisions the KnowYourEmoji product catalog in Stripe.
 *
 * Reads the plans from `src/lib/stripe-products.ts` and makes the Stripe
 * account match them:
 *
 * - The Product is created with a custom ID (e.g. `kye_pro`) so it can be
 *   retrieved directly on later runs. An existing product is updated in place
 *   when its name or description has drifted, and reactivated if archived.
 * - Each Price is looked up by its `lookup_key`. Prices are immutable in
 *   Stripe, so when the amount, currency, or interval changes a new price is
 *   created and the lookup key is transferred to it. Existing subscriptions
 *   keep the old price; new checkouts use the new one once
 *   STRIPE_PRO_PRICE_ID is updated.
 *
 * The script is idempotent: running it twice makes no changes the second
 * time. It prints the env lines to copy into `.env.local` / Vercel.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... bun run stripe:setup
 *   STRIPE_SECRET_KEY=rk_live_... bun run stripe:setup -- --live
 *
 * A live-mode key is refused unless `--live` is passed, so the catalog is
 * never created in live mode by accident. See docs/stripe.md.
 */

import Stripe from 'stripe';

import { STRIPE_API_VERSION } from '../src/lib/stripe';
import {
  PRO_PLAN,
  STRIPE_PLANS,
  type StripePlanConfig,
  type StripePriceConfig,
} from '../src/lib/stripe-products';

/** The subset of the Stripe client the setup script uses. */
export type StripeCatalogClient = Pick<Stripe, 'products' | 'prices'>;

export type PriceAction = 'unchanged' | 'created' | 'replaced';
export type ProductAction = 'unchanged' | 'created' | 'updated';

export interface PriceResult {
  lookupKey: string;
  priceId: string;
  action: PriceAction;
}

export interface PlanResult {
  productId: string;
  productAction: ProductAction;
  prices: PriceResult[];
}

/** Whether a Stripe error means the requested resource does not exist. */
function isMissingResource(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === 'resource_missing'
  );
}

/** Whether an existing Stripe price matches the configured price on the given product. */
export function priceMatches(
  price: Stripe.Price,
  productId: string,
  config: StripePriceConfig
): boolean {
  const priceProductId = typeof price.product === 'string' ? price.product : price.product.id;
  return (
    price.active &&
    priceProductId === productId &&
    price.unit_amount === config.unitAmount &&
    price.currency === config.currency &&
    price.recurring?.interval === config.interval &&
    price.recurring?.interval_count === 1
  );
}

/** Create the plan's product, or bring an existing one in line with the config. */
export async function ensureProduct(
  stripe: StripeCatalogClient,
  plan: StripePlanConfig
): Promise<ProductAction> {
  let product: Stripe.Product;
  try {
    product = await stripe.products.retrieve(plan.productId);
  } catch (error) {
    if (!isMissingResource(error)) {
      throw error;
    }
    await stripe.products.create({
      id: plan.productId,
      name: plan.name,
      description: plan.description,
    });
    return 'created';
  }

  if (product.active && product.name === plan.name && product.description === plan.description) {
    return 'unchanged';
  }

  await stripe.products.update(plan.productId, {
    active: true,
    name: plan.name,
    description: plan.description,
  });
  return 'updated';
}

/** Create the price for a lookup key, or reuse the existing one when it matches. */
export async function ensurePrice(
  stripe: StripeCatalogClient,
  productId: string,
  config: StripePriceConfig
): Promise<PriceResult> {
  const existing = await stripe.prices.list({ lookup_keys: [config.lookupKey], limit: 1 });
  const current = existing.data[0];

  if (current && priceMatches(current, productId, config)) {
    return { lookupKey: config.lookupKey, priceId: current.id, action: 'unchanged' };
  }

  const created = await stripe.prices.create({
    product: productId,
    unit_amount: config.unitAmount,
    currency: config.currency,
    recurring: { interval: config.interval },
    lookup_key: config.lookupKey,
    transfer_lookup_key: Boolean(current),
    nickname: config.nickname,
  });

  return {
    lookupKey: config.lookupKey,
    priceId: created.id,
    action: current ? 'replaced' : 'created',
  };
}

/** Provision every configured plan. */
export async function setupStripeCatalog(
  stripe: StripeCatalogClient,
  plans: readonly StripePlanConfig[] = STRIPE_PLANS
): Promise<PlanResult[]> {
  const results: PlanResult[] = [];
  for (const plan of plans) {
    const productAction = await ensureProduct(stripe, plan);
    const prices: PriceResult[] = [];
    for (const price of plan.prices) {
      prices.push(await ensurePrice(stripe, plan.productId, price));
    }
    results.push({ productId: plan.productId, productAction, prices });
  }
  return results;
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
  return null;
}

/** Format the results as a report plus the env lines to copy. */
export function formatReport(results: readonly PlanResult[]): string {
  const lines: string[] = [];
  for (const plan of results) {
    lines.push(`Product ${plan.productId}: ${plan.productAction}`);
    for (const price of plan.prices) {
      lines.push(`  Price ${price.lookupKey} -> ${price.priceId}: ${price.action}`);
    }
  }

  const proPrice = results
    .find((plan) => plan.productId === PRO_PLAN.productId)
    ?.prices.find((price) => price.lookupKey === PRO_PLAN.prices[0].lookupKey);
  if (proPrice) {
    lines.push('', 'Set this in .env.local and in the Vercel project:', '');
    lines.push(`STRIPE_PRO_PRICE_ID=${proPrice.priceId}`);
  }
  return lines.join('\n');
}

async function main(): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY;
  const keyError = checkApiKey(key, process.argv.includes('--live'));
  if (keyError) {
    console.error(keyError);
    process.exit(1);
  }

  const stripe = new Stripe(key as string, { apiVersion: STRIPE_API_VERSION });
  const results = await setupStripeCatalog(stripe);
  console.log(formatReport(results));
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Stripe setup failed:', error);
    process.exit(1);
  });
}
