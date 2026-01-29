import { describe, expect, test, beforeEach, afterEach } from 'bun:test';

// Store original env
const originalEnv = { ...process.env };

describe('About Page', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Set test environment values
    process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
    process.env.NEXT_PUBLIC_APP_NAME = 'KnowYourEmoji';
    // Clear module cache to ensure fresh import
    delete require.cache[require.resolve('../../../src/app/about/page')];
    delete require.cache[require.resolve('../../../src/lib/env')];
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('generateMetadata', () => {
    test('generates metadata with correct title', async () => {
      const { generateMetadata } = await import('../../../src/app/about/page');
      const metadata = generateMetadata();

      expect(metadata.title).toBe('About Us | KnowYourEmoji');
    });

    test('generates metadata with correct description', async () => {
      const { generateMetadata } = await import('../../../src/app/about/page');
      const metadata = generateMetadata();

      expect(metadata.description).toContain('emoji');
      expect(typeof metadata.description).toBe('string');
    });

    test('generates metadata with canonical URL', async () => {
      const { generateMetadata } = await import('../../../src/app/about/page');
      const metadata = generateMetadata();

      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com/about');
    });

    test('generates metadata with correct keywords', async () => {
      const { generateMetadata } = await import('../../../src/app/about/page');
      const metadata = generateMetadata();

      expect(metadata.keywords).toBeDefined();
      expect(Array.isArray(metadata.keywords)).toBe(true);
      const keywords = metadata.keywords as string[];
      expect(keywords.length).toBeGreaterThan(0);
    });

    test('generates metadata with OpenGraph data', async () => {
      const { generateMetadata } = await import('../../../src/app/about/page');
      const metadata = generateMetadata();

      const openGraph = metadata.openGraph as {
        type?: string;
        url?: string;
        siteName?: string;
        title?: string;
        description?: string;
      };
      expect(openGraph?.type).toBe('website');
      expect(openGraph?.url).toBe('https://knowyouremoji.com/about');
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
    });

    test('generates metadata with Twitter card data', async () => {
      const { generateMetadata } = await import('../../../src/app/about/page');
      const metadata = generateMetadata();

      const twitter = metadata.twitter as {
        card?: string;
        title?: string;
        description?: string;
      };
      expect(twitter?.card).toBe('summary_large_image');
      expect(twitter?.title).toBeDefined();
    });

    test('generates metadata with robots directives', async () => {
      const { generateMetadata } = await import('../../../src/app/about/page');
      const metadata = generateMetadata();

      const robots = metadata.robots as {
        index?: boolean;
        follow?: boolean;
      };
      expect(robots?.index).toBe(true);
      expect(robots?.follow).toBe(true);
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
        if (typeof el.type === 'function' && (el.type as { displayName?: string }).displayName)
          content += (el.type as { displayName: string }).displayName + ' ';
        if (el.props?.href) content += el.props.href + ' ';
        if (el.props?.children) content += extractContent(el.props.children);
        return content;
      }
      return '';
    }

    test('is a valid React component function', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
      expect(typeof AboutPage).toBe('function');
    });

    test('returns a valid React element', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
      const result = AboutPage();
      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });

    test('contains breadcrumbs navigation', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
      const result = AboutPage();

      // Check that children are defined
      const children = result.props.children;
      expect(children).toBeDefined();

      // Check that one of the children is Breadcrumbs component
      const content = extractContent(result);
      expect(content).toContain('Breadcrumbs');
    });

    test('contains mission section', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
      const result = AboutPage();

      // Check for mission-related content
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('mission');
    });

    test('contains how it works section', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
      const result = AboutPage();

      // Check for how it works content
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('how');
      expect(content).toContain('works');
    });

    test('contains trust signals section', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
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

    test('has accessible heading structure', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
      const result = AboutPage();

      // Check for h1 heading
      const content = extractContent(result);
      expect(content).toContain('h1');
    });

    test('contains CTA link to interpreter', async () => {
      const { default: AboutPage } = await import('../../../src/app/about/page');
      const result = AboutPage();

      const content = extractContent(result);
      expect(content).toContain('/interpreter');
    });
  });
});
