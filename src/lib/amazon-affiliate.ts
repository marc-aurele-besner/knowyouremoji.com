/**
 * Amazon Associates links for our own books.
 *
 * Builds direct product links (`/dp/<ASIN>`) on the storefront closest to the
 * visitor, carrying the Associates tracking ID for that storefront. See
 * docs/amazon-affiliate.md for setup.
 */

export interface Storefront {
  /** Hostname without `www.` */
  domain: string;
  /**
   * Whether the storefront can be linked to the default tracking ID with
   * "Earning by country" in Associates Central. Other storefronts are separate
   * Associates programs and only get a tag from their own override variable.
   */
  oneLink: boolean;
}

/** Storefronts where KDP sells our books, keyed by ISO 3166-1 alpha-2 country code. */
export const STOREFRONTS = {
  US: { domain: 'amazon.com', oneLink: true },
  CA: { domain: 'amazon.ca', oneLink: true },
  GB: { domain: 'amazon.co.uk', oneLink: true },
  DE: { domain: 'amazon.de', oneLink: true },
  FR: { domain: 'amazon.fr', oneLink: true },
  IT: { domain: 'amazon.it', oneLink: true },
  ES: { domain: 'amazon.es', oneLink: true },
  NL: { domain: 'amazon.nl', oneLink: true },
  AU: { domain: 'amazon.com.au', oneLink: false },
  JP: { domain: 'amazon.co.jp', oneLink: false },
  IN: { domain: 'amazon.in', oneLink: false },
  BR: { domain: 'amazon.com.br', oneLink: false },
  MX: { domain: 'amazon.com.mx', oneLink: false },
} as const satisfies Record<string, Storefront>;

export type StorefrontCode = keyof typeof STOREFRONTS;

export const DEFAULT_STOREFRONT: StorefrontCode = 'US';

/**
 * Countries without their own storefront that buy (including Kindle books)
 * from a neighbouring one. Every other country falls back to amazon.com.
 */
export const NEAREST_STOREFRONT: Readonly<Record<string, StorefrontCode>> = {
  UK: 'GB',
  IE: 'GB',
  IM: 'GB',
  JE: 'GB',
  GG: 'GB',
  GI: 'GB',
  AT: 'DE',
  CH: 'DE',
  LI: 'DE',
  LU: 'DE',
  MC: 'FR',
  SM: 'IT',
  VA: 'IT',
  AD: 'ES',
  NZ: 'AU',
};

/** `rel` for every outbound Amazon link: no SEO credit, marked as paid, no opener access. */
export const AMAZON_LINK_REL = 'nofollow sponsored noopener';

export const AMAZON_DISCLOSURE =
  'As an Amazon Associate, KnowYourEmoji earns from qualifying purchases.';

function isStorefrontCode(code: string): code is StorefrontCode {
  return Object.hasOwn(STOREFRONTS, code);
}

/** Maps a visitor's country code (any case, may be missing) to a storefront. */
export function storefrontFor(country: string | null | undefined): StorefrontCode {
  const code = country?.trim().toUpperCase() ?? '';
  if (isStorefrontCode(code)) return code;
  return NEAREST_STOREFRONT[code] ?? DEFAULT_STOREFRONT;
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

// Each variable is read with a literal `process.env.NEXT_PUBLIC_*` access so
// Next.js inlines it into the client bundle.
function storefrontTags(): Record<StorefrontCode, string | undefined> {
  return {
    US: process.env.NEXT_PUBLIC_AMZN_TAG_US,
    CA: process.env.NEXT_PUBLIC_AMZN_TAG_CA,
    GB: process.env.NEXT_PUBLIC_AMZN_TAG_GB,
    DE: process.env.NEXT_PUBLIC_AMZN_TAG_DE,
    FR: process.env.NEXT_PUBLIC_AMZN_TAG_FR,
    IT: process.env.NEXT_PUBLIC_AMZN_TAG_IT,
    ES: process.env.NEXT_PUBLIC_AMZN_TAG_ES,
    NL: process.env.NEXT_PUBLIC_AMZN_TAG_NL,
    AU: process.env.NEXT_PUBLIC_AMZN_TAG_AU,
    JP: process.env.NEXT_PUBLIC_AMZN_TAG_JP,
    IN: process.env.NEXT_PUBLIC_AMZN_TAG_IN,
    BR: process.env.NEXT_PUBLIC_AMZN_TAG_BR,
    MX: process.env.NEXT_PUBLIC_AMZN_TAG_MX,
  };
}

/**
 * Tracking ID for a storefront: its own override if set, otherwise the
 * default ID on storefronts linked through "Earning by country".
 */
export function tagFor(storefront: StorefrontCode): string | undefined {
  const override = clean(storefrontTags()[storefront]);
  if (override) return override;
  return STOREFRONTS[storefront].oneLink ? clean(process.env.NEXT_PUBLIC_AMZN_TAG) : undefined;
}

/** Whether any tracking ID is configured, i.e. whether links can earn commissions. */
export function hasAmazonTag(): boolean {
  return (Object.keys(STOREFRONTS) as StorefrontCode[]).some((code) => tagFor(code) !== undefined);
}

/** Direct product link, e.g. `https://www.amazon.de/dp/B0HN32NYYX?tag=knowyouremoji-21`. */
export function amazonProductUrl(
  asin: string,
  storefront: StorefrontCode = DEFAULT_STOREFRONT
): string {
  const url = new URL(`https://www.${STOREFRONTS[storefront].domain}/dp/${asin}`);
  const tag = tagFor(storefront);
  if (tag) url.searchParams.set('tag', tag);
  return url.toString();
}
