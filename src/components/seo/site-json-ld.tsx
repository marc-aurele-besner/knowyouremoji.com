/**
 * Site-wide JSON-LD structured data.
 *
 * Emits `Organization` and `WebSite` entities once, from the root layout,
 * so every page on the site carries the same publisher identity. Without
 * this, search engines have to infer the site name and publisher from
 * per-page markup, which is exactly the kind of guesswork that produces
 * inconsistent knowledge panels.
 *
 * Why this matters for Agent Engine Optimization (AEO): answer engines
 * resolve "who published this and how much of it can I trust" from
 * `Organization` markup. A first-party `sameAs` profile, a logo, and a
 * description let an agent attribute an answer to a named publisher
 * instead of to "a website".
 */

interface SiteJsonLdProps {
  /** Base URL of the application (e.g. https://knowyouremoji.com) */
  appUrl: string;
  /** Name of the application */
  appName: string;
  /** Short description of the site, used as the entity description */
  description: string;
}

/**
 * First-party profile URLs for the publisher.
 *
 * Only profiles that actually exist are listed — an unverified `sameAs`
 * entry is a broken identity claim, and answer engines penalise those.
 */
export const PUBLISHER_SAME_AS = [
  'https://github.com/marc-aurele-besner/knowyouremoji.com',
] as const;

/**
 * The `Organization` entity describing the publisher.
 */
export interface OrganizationEntity {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  description: string;
  logo: { '@type': 'ImageObject'; url: string };
  image: { '@type': 'ImageObject'; url: string };
  sameAs: string[];
}

/**
 * The `WebSite` entity describing the site as a whole.
 */
export interface WebSiteEntity {
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  publisher: { '@id': string };
  potentialAction: {
    '@type': 'SearchAction';
    target: { '@type': 'EntryPoint'; urlTemplate: string };
    'query-input': string;
  };
}

/**
 * The site-wide JSON-LD payload.
 */
export interface SiteJsonLd {
  '@context': 'https://schema.org';
  '@graph': [OrganizationEntity, WebSiteEntity];
}

/**
 * Build the site-wide JSON-LD payload.
 *
 * Exported separately from the component so the shape can be asserted in
 * unit tests without rendering React.
 */
export function buildSiteJsonLd(appUrl: string, appName: string, description: string): SiteJsonLd {
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  const logoUrl = `${baseUrl}/logo.png`;

  const organization: OrganizationEntity = {
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: appName,
    url: baseUrl,
    description,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
    image: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
    sameAs: [...PUBLISHER_SAME_AS],
  };

  const website: WebSiteEntity = {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: appName,
    description,
    inLanguage: 'en',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website],
  };
}

/**
 * Renders the site-wide `Organization` + `WebSite` JSON-LD.
 *
 * Rendered once in the root layout so it is inherited by every route.
 */
export function SiteJsonLd({ appUrl, appName, description }: SiteJsonLdProps) {
  const jsonLd = buildSiteJsonLd(appUrl, appName, description);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
