import { describe, it, expect, mock } from 'bun:test';
import type Stripe from 'stripe';
import {
  checkApiKey,
  ensurePrice,
  ensureProduct,
  formatReport,
  priceMatches,
  setupStripeCatalog,
  type StripeCatalogClient,
} from '../../../scripts/setup-stripe';
import { PRO_PLAN, type StripePlanConfig } from '../../../src/lib/stripe-products';

const PRO_PRICE = PRO_PLAN.prices[0];

function makePrice(overrides: Partial<Stripe.Price> = {}): Stripe.Price {
  return {
    id: 'price_existing',
    active: true,
    product: PRO_PLAN.productId,
    unit_amount: PRO_PRICE.unitAmount,
    currency: PRO_PRICE.currency,
    recurring: { interval: PRO_PRICE.interval, interval_count: 1 },
    ...overrides,
  } as Stripe.Price;
}

function makeProduct(overrides: Partial<Stripe.Product> = {}): Stripe.Product {
  return {
    id: PRO_PLAN.productId,
    active: true,
    name: PRO_PLAN.name,
    description: PRO_PLAN.description,
    ...overrides,
  } as Stripe.Product;
}

function missingError(): Error {
  return Object.assign(new Error('No such product'), { code: 'resource_missing' });
}

interface FakeOptions {
  product?: Stripe.Product | Error;
  prices?: Stripe.Price[];
}

function makeClient({ product = makeProduct(), prices = [] }: FakeOptions = {}) {
  const products = {
    retrieve: mock(() =>
      product instanceof Error ? Promise.reject(product) : Promise.resolve(product)
    ),
    create: mock(() => Promise.resolve(makeProduct())),
    update: mock(() => Promise.resolve(makeProduct())),
  };
  const priceApi = {
    list: mock(() => Promise.resolve({ data: prices })),
    create: mock(() => Promise.resolve(makePrice({ id: 'price_new' }))),
  };
  const client = { products, prices: priceApi } as unknown as StripeCatalogClient;
  return { client, products, prices: priceApi };
}

describe('priceMatches', () => {
  it('matches an active price with the configured amount, currency, and interval', () => {
    expect(priceMatches(makePrice(), PRO_PLAN.productId, PRO_PRICE)).toBe(true);
  });

  it('accepts an expanded product object', () => {
    const price = makePrice({ product: { id: PRO_PLAN.productId } as Stripe.Product });
    expect(priceMatches(price, PRO_PLAN.productId, PRO_PRICE)).toBe(true);
  });

  it.each([
    ['inactive', { active: false }],
    ['on another product', { product: 'prod_other' }],
    ['a different amount', { unit_amount: 1200 }],
    ['a different currency', { currency: 'eur' }],
    ['a different interval', { recurring: { interval: 'year', interval_count: 1 } }],
    ['a multi-month interval', { recurring: { interval: 'month', interval_count: 3 } }],
    ['a one-time price', { recurring: null }],
  ])('rejects a price that is %s', (_label, overrides) => {
    const price = makePrice(overrides as Partial<Stripe.Price>);
    expect(priceMatches(price, PRO_PLAN.productId, PRO_PRICE)).toBe(false);
  });
});

describe('ensureProduct', () => {
  it('creates the product with its custom ID when missing', async () => {
    const { client, products } = makeClient({ product: missingError() });
    expect(await ensureProduct(client, PRO_PLAN)).toBe('created');
    expect(products.create).toHaveBeenCalledWith({
      id: PRO_PLAN.productId,
      name: PRO_PLAN.name,
      description: PRO_PLAN.description,
    });
  });

  it('leaves a matching product unchanged', async () => {
    const { client, products } = makeClient();
    expect(await ensureProduct(client, PRO_PLAN)).toBe('unchanged');
    expect(products.create).not.toHaveBeenCalled();
    expect(products.update).not.toHaveBeenCalled();
  });

  it.each([
    ['archived', { active: false }],
    ['renamed', { name: 'Old name' }],
    ['re-described', { description: null }],
  ])('updates a product that was %s', async (_label, overrides) => {
    const { client, products } = makeClient({
      product: makeProduct(overrides as Partial<Stripe.Product>),
    });
    expect(await ensureProduct(client, PRO_PLAN)).toBe('updated');
    expect(products.update).toHaveBeenCalledWith(PRO_PLAN.productId, {
      active: true,
      name: PRO_PLAN.name,
      description: PRO_PLAN.description,
    });
  });

  it('rethrows unexpected errors', async () => {
    const { client } = makeClient({ product: new Error('network down') });
    await expect(ensureProduct(client, PRO_PLAN)).rejects.toThrow('network down');
  });
});

describe('ensurePrice', () => {
  it('reuses the price found by lookup key', async () => {
    const { client, prices } = makeClient({ prices: [makePrice()] });
    expect(await ensurePrice(client, PRO_PLAN.productId, PRO_PRICE)).toEqual({
      lookupKey: PRO_PRICE.lookupKey,
      priceId: 'price_existing',
      action: 'unchanged',
    });
    expect(prices.list).toHaveBeenCalledWith({ lookup_keys: [PRO_PRICE.lookupKey], limit: 1 });
    expect(prices.create).not.toHaveBeenCalled();
  });

  it('creates the price when no price has the lookup key', async () => {
    const { client, prices } = makeClient();
    expect(await ensurePrice(client, PRO_PLAN.productId, PRO_PRICE)).toEqual({
      lookupKey: PRO_PRICE.lookupKey,
      priceId: 'price_new',
      action: 'created',
    });
    expect(prices.create).toHaveBeenCalledWith({
      product: PRO_PLAN.productId,
      unit_amount: PRO_PRICE.unitAmount,
      currency: PRO_PRICE.currency,
      recurring: { interval: PRO_PRICE.interval },
      lookup_key: PRO_PRICE.lookupKey,
      transfer_lookup_key: false,
      nickname: PRO_PRICE.nickname,
    });
  });

  it('replaces a drifted price and transfers the lookup key', async () => {
    const { client, prices } = makeClient({ prices: [makePrice({ unit_amount: 500 })] });
    const result = await ensurePrice(client, PRO_PLAN.productId, PRO_PRICE);
    expect(result.action).toBe('replaced');
    expect(result.priceId).toBe('price_new');
    expect(prices.create).toHaveBeenCalledWith(
      expect.objectContaining({ transfer_lookup_key: true })
    );
  });
});

describe('setupStripeCatalog', () => {
  it('provisions every configured plan by default', async () => {
    const { client } = makeClient({ prices: [makePrice()] });
    expect(await setupStripeCatalog(client)).toEqual([
      {
        productId: PRO_PLAN.productId,
        productAction: 'unchanged',
        prices: [
          { lookupKey: PRO_PRICE.lookupKey, priceId: 'price_existing', action: 'unchanged' },
        ],
      },
    ]);
  });

  it('provisions each price of the given plans', async () => {
    const plan: StripePlanConfig = {
      ...PRO_PLAN,
      prices: [PRO_PRICE, { ...PRO_PRICE, lookupKey: 'kye_pro_yearly', interval: 'year' }],
    };
    const { client, prices } = makeClient({ product: missingError() });
    const [result] = await setupStripeCatalog(client, [plan]);
    expect(result.productAction).toBe('created');
    expect(result.prices.map((p) => p.lookupKey)).toEqual(['kye_pro_monthly', 'kye_pro_yearly']);
    expect(prices.create).toHaveBeenCalledTimes(2);
  });
});

describe('checkApiKey', () => {
  it('requires a key', () => {
    expect(checkApiKey(undefined, false)).toContain('not set');
  });

  it('rejects publishable keys', () => {
    expect(checkApiKey('pk_test_abc', false)).toContain('secret');
  });

  it('accepts sandbox secret and restricted keys', () => {
    expect(checkApiKey('sk_test_abc', false)).toBeNull();
    expect(checkApiKey('rk_test_abc', false)).toBeNull();
  });

  it('refuses live keys without --live', () => {
    expect(checkApiKey('rk_live_abc', false)).toContain('--live');
    expect(checkApiKey('rk_live_abc', true)).toBeNull();
  });
});

describe('formatReport', () => {
  it('lists each change and prints the env line for the Pro price', () => {
    const report = formatReport([
      {
        productId: PRO_PLAN.productId,
        productAction: 'created',
        prices: [{ lookupKey: PRO_PRICE.lookupKey, priceId: 'price_123', action: 'created' }],
      },
    ]);
    expect(report).toContain(`Product ${PRO_PLAN.productId}: created`);
    expect(report).toContain(`Price ${PRO_PRICE.lookupKey} -> price_123: created`);
    expect(report).toContain('STRIPE_PRO_PRICE_ID=price_123');
  });

  it('omits the env line when the Pro price is absent', () => {
    expect(formatReport([])).not.toContain('STRIPE_PRO_PRICE_ID');
  });
});
