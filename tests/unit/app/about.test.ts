import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { generateMetadata, default as AboutPage } from '../../../src/app/about/page';

// Store original env
const originalEnv = { ...process.env };

describe('About Page', () => {
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

      expect(metadata.title).toBe('About Us | KnowYourEmoji');
    });

    test('generates metadata with correct description', () => {
      const metadata = generateMetadata();

      expect(metadata.description).toContain('emoji');
      expect(typeof metadata.description).toBe('string');
    });

    test('generates metadata with canonical URL', () => {
      const metadata = generateMetadata();

      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com/about');
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
      expect(openGraph?.url).toBe('https://knowyouremoji.com/about');
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
      expect(openGraph?.locale).toBe('en_US');
      expect(openGraph?.title).toBe('About Us | KnowYourEmoji');
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

      expect(metadata.title).toBe('About Us | CustomName');
      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://custom-url.com/about');
    });
  });

  describe('AboutPage component', () => {
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
      expect(typeof AboutPage).toBe('function');
    });

    test('returns a valid React element', () => {
      const result = AboutPage();
      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });

    test('contains breadcrumbs navigation', () => {
      const result = AboutPage();

      // Check that children are defined
      const children = result.props.children;
      expect(children).toBeDefined();

      // Check that one of the children is Breadcrumbs component
      const content = extractContent(result);
      expect(content).toContain('Breadcrumbs');
    });

    test('contains mission section', () => {
      const result = AboutPage();

      // Check for mission-related content
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('mission');
    });

    test('contains how it works section', () => {
      const result = AboutPage();

      // Check for how it works content
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('how');
      expect(content).toContain('works');
    });

    test('contains trust signals section', () => {
      const result = AboutPage();

      // Check for trust-related content
      const content = extractContent(result).toLowerCase();
      // Trust signals could be about team, technology, privacy, or credentials
      const hasTrustSignals =
        content.includes('trust') ||
        content.includes('privacy') ||
        content.includes('secure') ||
        content.includes('reliable') ||
        content.includes('accurate');
      expect(hasTrustSignals).toBe(true);
    });

    test('has accessible heading structure', () => {
      const result = AboutPage();

      // Check for h1 heading
      const content = extractContent(result);
      expect(content).toContain('h1');
    });

    test('contains CTA link to interpreter', () => {
      const result = AboutPage();

      const content = extractContent(result);
      expect(content).toContain('/interpreter');
    });

    test('contains CTA link to emoji browse', () => {
      const result = AboutPage();

      const content = extractContent(result);
      expect(content).toContain('/emoji');
    });
  });
});
