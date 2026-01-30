import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { generateMetadata, default as PricingPage } from '../../../src/app/pricing/page';

// Store original env
const originalEnv = { ...process.env };

describe('Pricing Page', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Set test environment values
    process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
    process.env.NEXT_PUBLIC_APP_NAME = 'KnowYourEmoji';
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('generateMetadata', () => {
    test('generates metadata with correct title', () => {
      const metadata = generateMetadata();

      expect(metadata.title).toBe('Pricing | KnowYourEmoji');
    });

    test('generates metadata with correct description', () => {
      const metadata = generateMetadata();

      expect(metadata.description).toContain('pricing');
      expect(typeof metadata.description).toBe('string');
    });

    test('generates metadata with canonical URL', () => {
      const metadata = generateMetadata();

      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com/pricing');
    });

    test('generates metadata with correct keywords', () => {
      const metadata = generateMetadata();

      expect(metadata.keywords).toBeDefined();
      expect(Array.isArray(metadata.keywords)).toBe(true);
      const keywords = metadata.keywords as string[];
      expect(keywords.length).toBeGreaterThan(0);
    });

    test('generates metadata with OpenGraph data', () => {
      const metadata = generateMetadata();

      const openGraph = metadata.openGraph as {
        type?: string;
        url?: string;
        siteName?: string;
        title?: string;
        description?: string;
        locale?: string;
        images?: Array<{ url: string; width: number; height: number; alt: string }>;
      };
      expect(openGraph?.type).toBe('website');
      expect(openGraph?.url).toBe('https://knowyouremoji.com/pricing');
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
      expect(openGraph?.locale).toBe('en_US');
      expect(openGraph?.title).toBe('Pricing | KnowYourEmoji');
      expect(openGraph?.images).toBeDefined();
      expect(openGraph?.images?.length).toBeGreaterThan(0);
    });

    test('generates metadata with Twitter card data', () => {
      const metadata = generateMetadata();

      const twitter = metadata.twitter as {
        card?: string;
        title?: string;
        description?: string;
        images?: string[];
      };
      expect(twitter?.card).toBe('summary_large_image');
      expect(twitter?.title).toBeDefined();
      expect(twitter?.description).toBeDefined();
      expect(twitter?.images).toBeDefined();
    });

    test('generates metadata with robots directives', () => {
      const metadata = generateMetadata();

      const robots = metadata.robots as {
        index?: boolean;
        follow?: boolean;
        googleBot?: {
          index?: boolean;
          follow?: boolean;
          'max-video-preview'?: number;
          'max-image-preview'?: string;
          'max-snippet'?: number;
        };
      };
      expect(robots?.index).toBe(true);
      expect(robots?.follow).toBe(true);
      expect(robots?.googleBot?.index).toBe(true);
      expect(robots?.googleBot?.follow).toBe(true);
      expect(robots?.googleBot?.['max-video-preview']).toBe(-1);
      expect(robots?.googleBot?.['max-image-preview']).toBe('large');
      expect(robots?.googleBot?.['max-snippet']).toBe(-1);
    });

    test('uses environment variables correctly', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://custom-url.com';
      process.env.NEXT_PUBLIC_APP_NAME = 'CustomName';

      const metadata = generateMetadata();

      expect(metadata.title).toBe('Pricing | CustomName');
      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://custom-url.com/pricing');
    });
  });

  describe('PricingPage component', () => {
    // Helper function to safely extract text content from React elements
    function extractContent(element: unknown): string {
      if (!element) return '';
      if (typeof element === 'string') return element;
      if (typeof element === 'number') return String(element);
      if (Array.isArray(element)) return element.map(extractContent).join(' ');
      if (typeof element === 'object' && element !== null) {
        const el = element as { type?: unknown; props?: { children?: unknown; href?: string } };
        let content = '';
        if (typeof el.type === 'string') content += el.type + ' ';
        if (
          typeof el.type === 'function' &&
          (el.type as unknown as { displayName?: string }).displayName
        )
          content += (el.type as unknown as { displayName: string }).displayName + ' ';
        if (el.props?.href) content += el.props.href + ' ';
        if (el.props?.children) content += extractContent(el.props.children);
        return content;
      }
      return '';
    }

    test('is a valid React component function', () => {
      expect(typeof PricingPage).toBe('function');
    });

    test('returns a valid React element', () => {
      const result = PricingPage();
      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });

    test('contains breadcrumbs navigation', () => {
      const result = PricingPage();

      // Check that children are defined
      const children = result.props.children;
      expect(children).toBeDefined();

      // Check that one of the children is Breadcrumbs component
      const content = extractContent(result);
      expect(content).toContain('Breadcrumbs');
    });

    test('contains pricing tiers section', () => {
      const result = PricingPage();

      // Check for pricing tier content
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('free');
      expect(content).toContain('pro');
    });

    test('contains feature comparison section', () => {
      const result = PricingPage();

      // Check for feature comparison content
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('feature');
    });

    test('contains coming soon indicators for Phase 2 features', () => {
      const result = PricingPage();

      // Check for coming soon or Phase 2 indicators
      const content = extractContent(result).toLowerCase();
      const hasComingSoon =
        content.includes('coming soon') || content.includes('phase 2') || content.includes('soon');
      expect(hasComingSoon).toBe(true);
    });

    test('has accessible heading structure', () => {
      const result = PricingPage();

      // Check for h1 heading
      const content = extractContent(result);
      expect(content).toContain('h1');
    });

    test('contains CTA link to interpreter', () => {
      const result = PricingPage();

      const content = extractContent(result);
      expect(content).toContain('/interpreter');
    });

    test('displays free tier benefits', () => {
      const result = PricingPage();

      const content = extractContent(result).toLowerCase();
      // Free tier should mention interpretations per day
      expect(content).toContain('interpretation');
    });

    test('displays pro tier benefits', () => {
      const result = PricingPage();

      const content = extractContent(result).toLowerCase();
      // Pro tier should mention unlimited or enhanced features
      const hasProBenefits =
        content.includes('unlimited') || content.includes('priority') || content.includes('pro');
      expect(hasProBenefits).toBe(true);
    });
  });
});
