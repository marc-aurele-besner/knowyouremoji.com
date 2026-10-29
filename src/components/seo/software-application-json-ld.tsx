/**
 * JSON-LD structured data for the AI Emoji Interpreter tool.
 *
 * `SoftwareApplication` is what lets a search engine treat the interpreter
 * as an *app* rather than an article, which is the shape that supports
 * tool-style results and, more importantly for Agent Engine Optimization
 * (AEO), tells an answer engine exactly what the tool does and that it is
 * free to use.
 */

interface SoftwareApplicationJsonLdProps {
  /** Base URL of the application (e.g. https://knowyouremoji.com) */
  appUrl: string;
  /** Name of the application */
  appName: string;
  /** Description of what the tool does */
  description: string;
  /** Bullet list of the tool's capabilities */
  features: string[];
}

/**
 * Build the `SoftwareApplication` JSON-LD payload.
 *
 * Exported for unit tests so the shape can be asserted without rendering.
 */
export function buildSoftwareApplicationJsonLd({
  appUrl,
  appName,
  description,
  features,
}: SoftwareApplicationJsonLdProps) {
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${appName} Emoji Interpreter`,
    url: `${baseUrl}/interpreter`,
    description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    inLanguage: 'en',
    featureList: features,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: appName,
      url: baseUrl,
    },
  };
}

/**
 * Renders `SoftwareApplication` JSON-LD for the interpreter tool.
 */
export function SoftwareApplicationJsonLd(props: SoftwareApplicationJsonLdProps) {
  const jsonLd = buildSoftwareApplicationJsonLd(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
