import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  AMAZON_DISCLOSURE,
  AMAZON_LINK_REL,
  DEFAULT_STOREFRONT,
  NEAREST_STOREFRONT,
  STOREFRONTS,
  amazonProductUrl,
  hasAmazonTag,
  storefrontFor,
  tagFor,
  type StorefrontCode,
} from '@/lib/amazon-affiliate';

const CODES = Object.keys(STOREFRONTS) as StorefrontCode[];
const TAG_KEYS = ['NEXT_PUBLIC_AMZN_TAG', ...CODES.map((code) => `NEXT_PUBLIC_AMZN_TAG_${code}`)];
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of TAG_KEYS) {
    savedEnv[key] = process.env[key];
    Reflect.deleteProperty(process.env, key);
  }
});

afterEach(() => {
  for (const key of TAG_KEYS) {
    if (savedEnv[key] === undefined) Reflect.deleteProperty(process.env, key);
    else process.env[key] = savedEnv[key];
  }
});

describe('storefrontFor', () => {
  it('uses the country’s own storefront', () => {
    for (const code of CODES) expect(storefrontFor(code)).toBe(code);
  });

  it('ignores case and whitespace', () => {
    expect(storefrontFor(' de ')).toBe('DE');
  });

  it('sends nearby countries to the closest storefront', () => {
    expect(storefrontFor('IE')).toBe('GB');
    expect(storefrontFor('UK')).toBe('GB');
    expect(storefrontFor('AT')).toBe('DE');
    expect(storefrontFor('CH')).toBe('DE');
    expect(storefrontFor('MC')).toBe('FR');
    expect(storefrontFor('NZ')).toBe('AU');
    for (const target of Object.values(NEAREST_STOREFRONT)) {
      expect(STOREFRONTS[target]).toBeDefined();
    }
  });

  it('falls back to amazon.com for other or unknown countries', () => {
    expect(DEFAULT_STOREFRONT).toBe('US');
    expect(storefrontFor('KR')).toBe('US');
    expect(storefrontFor('')).toBe('US');
    expect(storefrontFor(null)).toBe('US');
    expect(storefrontFor(undefined)).toBe('US');
    // Inherited object keys are not storefronts.
    expect(storefrontFor('constructor')).toBe('US');
  });
});

describe('tagFor', () => {
  it('returns nothing when no tag is configured', () => {
    for (const code of CODES) expect(tagFor(code)).toBeUndefined();
    expect(hasAmazonTag()).toBe(false);
  });

  it('applies the default tag to storefronts linked by Earning by country', () => {
    process.env.NEXT_PUBLIC_AMZN_TAG = ' knowyouremoji-20 ';
    for (const code of CODES) {
      expect(tagFor(code)).toBe(STOREFRONTS[code].oneLink ? 'knowyouremoji-20' : undefined);
    }
    expect(hasAmazonTag()).toBe(true);
  });

  it('prefers a per-storefront override, including on separate programs', () => {
    process.env.NEXT_PUBLIC_AMZN_TAG = 'knowyouremoji-20';
    process.env.NEXT_PUBLIC_AMZN_TAG_DE = 'knowyouremoji-21';
    process.env.NEXT_PUBLIC_AMZN_TAG_JP = 'knowyouremoji-22';
    expect(tagFor('DE')).toBe('knowyouremoji-21');
    expect(tagFor('JP')).toBe('knowyouremoji-22');
    expect(tagFor('FR')).toBe('knowyouremoji-20');
  });

  it('reads every storefront override', () => {
    for (const code of CODES) {
      process.env[`NEXT_PUBLIC_AMZN_TAG_${code}`] = `tag-${code}`;
      expect(tagFor(code)).toBe(`tag-${code}`);
    }
  });

  it('treats blank values as unset', () => {
    process.env.NEXT_PUBLIC_AMZN_TAG = '   ';
    process.env.NEXT_PUBLIC_AMZN_TAG_AU = '';
    expect(tagFor('US')).toBeUndefined();
    expect(tagFor('AU')).toBeUndefined();
    expect(hasAmazonTag()).toBe(false);
  });

  it('counts a single storefront override as configured', () => {
    process.env.NEXT_PUBLIC_AMZN_TAG_MX = 'knowyouremoji-mx';
    expect(hasAmazonTag()).toBe(true);
  });
});

describe('amazonProductUrl', () => {
  it('links to amazon.com without a tag by default', () => {
    expect(amazonProductUrl('B0HN32NYYX')).toBe('https://www.amazon.com/dp/B0HN32NYYX');
  });

  it('links to the storefront with its tracking ID', () => {
    process.env.NEXT_PUBLIC_AMZN_TAG = 'knowyouremoji-20';
    expect(amazonProductUrl('B0HN32NYYX', 'GB')).toBe(
      'https://www.amazon.co.uk/dp/B0HN32NYYX?tag=knowyouremoji-20'
    );
    expect(amazonProductUrl('B0HN32NYYX', 'AU')).toBe('https://www.amazon.com.au/dp/B0HN32NYYX');
  });

  it('encodes the tag', () => {
    process.env.NEXT_PUBLIC_AMZN_TAG_US = 'a&b';
    expect(amazonProductUrl('B0HN32NYYX', 'US')).toBe(
      'https://www.amazon.com/dp/B0HN32NYYX?tag=a%26b'
    );
  });
});

describe('compliance constants', () => {
  it('marks links as sponsored and nofollow', () => {
    expect(AMAZON_LINK_REL.split(' ')).toEqual(['nofollow', 'sponsored', 'noopener']);
  });

  it('uses the Associates disclosure wording', () => {
    expect(AMAZON_DISCLOSURE).toContain('As an Amazon Associate');
    expect(AMAZON_DISCLOSURE).toContain('earns from qualifying purchases');
  });
});
