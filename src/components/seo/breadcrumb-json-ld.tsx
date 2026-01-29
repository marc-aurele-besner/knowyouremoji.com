/**
 * JSON-LD structured data component for breadcrumb navigation
 *
 * Generates Schema.org BreadcrumbList markup for rich snippets in search results.
 * Helps search engines understand page hierarchy and display breadcrumb trails.
 */

export interface BreadcrumbJsonLdItem {
  /** Display name for the breadcrumb item */
  name: string;
  /** URL path for the breadcrumb (optional for current page) */
  href?: string;
}

interface BreadcrumbJsonLdProps {
  /** Array of breadcrumb items from root to current page */
  items: BreadcrumbJsonLdItem[];
  /** Base URL of the application */
  appUrl: string;
}

/**
 * Constructs a full URL from a relative path and base URL
 */
function constructUrl(appUrl: string, href: string): string {
  // Remove trailing slash from appUrl
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  // Ensure href starts with slash
  const path = href.startsWith('/') ? href : `/${href}`;
  return `${baseUrl}${path}`;
}

/**
 * Generate JSON-LD structured data for breadcrumb navigation
 */
function generateBreadcrumbJsonLd(items: BreadcrumbJsonLdItem[], appUrl: string) {
  const itemListElement = items.map((item, index) => {
    const listItem: Record<string, unknown> = {
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
    };

    // Only add item (URL) if href is provided
    if (item.href) {
      listItem.item = constructUrl(appUrl, item.href);
    }

    return listItem;
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * Renders JSON-LD structured data for breadcrumb navigation
 *
 * This component outputs a script tag with type application/ld+json
 * containing Schema.org BreadcrumbList markup.
 */
export function BreadcrumbJsonLd({ items, appUrl }: BreadcrumbJsonLdProps) {
  const jsonLd = generateBreadcrumbJsonLd(items, appUrl);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
