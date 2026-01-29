import { describe, expect, test, beforeEach, afterEach } from 'bun:test';

// Store original env
const originalEnv = { ...process.env };

describe('Site Metadata Configuration', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Set test environment values
    process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
    process.env.NEXT_PUBLIC_APP_NAME = 'KnowYourEmoji';
    // Clear module cache to ensure fresh import
    delete require.cache[require.resolve('../../../src/lib/metadata')];
    delete require.cache[require.resolve('../../../src/lib/env')];
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('createSiteMetadata', () => {
    test('generates metadata with correct default title', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.title).toBeDefined();
      expect(metadata.title).not.toBeNull();
      const title = metadata.title!;
      expect(typeof title === 'object' && 'default' in title).toBe(true);
      const titleObj = title as { default: string; template: string };
      expect(titleObj.default).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('generates metadata with correct title template', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.title).not.toBeNull();
      const titleObj = metadata.title as { default: string; template: string };
      expect(titleObj.template).toBe('%s | KnowYourEmoji');
    });

    test('generates metadata with correct description', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    test('generates metadata with correct keywords', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.keywords).toBeDefined();
      expect(Array.isArray(metadata.keywords)).toBe(true);
      const keywords = metadata.keywords as string[];
      expect(keywords).toContain('emoji meaning');
      expect(keywords).toContain('emoji interpreter');
      expect(keywords).toContain('what does emoji mean');
      expect(keywords).toContain('emoji decoder');
      expect(keywords).toContain('emoji translator');
    });

    test('generates metadata with correct authors', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.authors).toBeDefined();
      expect(Array.isArray(metadata.authors)).toBe(true);
      const authors = metadata.authors as Array<{ name: string; url?: string }>;
      expect(authors.length).toBeGreaterThan(0);
      expect(authors[0].name).toBe('KnowYourEmoji');
    });

    test('generates metadata with correct creator', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.creator).toBe('KnowYourEmoji');
    });

    test('generates metadata with correct publisher', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.publisher).toBe('KnowYourEmoji');
    });
  });

  describe('Open Graph metadata', () => {
    test('has correct type', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const openGraph = metadata.openGraph as {
        type?: string;
        locale?: string;
        siteName?: string;
        title?: string;
        description?: string;
        url?: string;
        images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      };
      expect(openGraph?.type).toBe('website');
    });

    test('has correct locale', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const openGraph = metadata.openGraph as { locale?: string };
      expect(openGraph?.locale).toBe('en_US');
    });

    test('has correct site name', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const openGraph = metadata.openGraph as { siteName?: string };
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
    });

    test('has correct title', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const openGraph = metadata.openGraph as { title?: string };
      expect(openGraph?.title).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct description', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const openGraph = metadata.openGraph as { description?: string };
      expect(openGraph?.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    test('has correct URL', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const openGraph = metadata.openGraph as { url?: string };
      expect(openGraph?.url).toBe('https://knowyouremoji.com');
    });

    // Note: OG images are now auto-generated by Next.js via opengraph-image.tsx
  });

  describe('Twitter Card metadata', () => {
    test('has correct card type', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const twitter = metadata.twitter as {
        card?: string;
        title?: string;
        description?: string;
        site?: string;
        creator?: string;
        images?: string[];
      };
      expect(twitter?.card).toBe('summary_large_image');
    });

    test('has correct title', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const twitter = metadata.twitter as { title?: string };
      expect(twitter?.title).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct description', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const twitter = metadata.twitter as { description?: string };
      expect(twitter?.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    // Note: Twitter images are now auto-generated by Next.js via twitter-image.tsx
  });

  describe('Robots metadata', () => {
    test('has correct robots directives', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

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
    });

    test('has correct googleBot directives', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const robots = metadata.robots as {
        googleBot?: {
          index?: boolean;
          follow?: boolean;
          'max-video-preview'?: number;
          'max-image-preview'?: string;
          'max-snippet'?: number;
        };
      };
      expect(robots?.googleBot).toBeDefined();
      expect(robots?.googleBot?.index).toBe(true);
      expect(robots?.googleBot?.follow).toBe(true);
      expect(robots?.googleBot?.['max-video-preview']).toBe(-1);
      expect(robots?.googleBot?.['max-image-preview']).toBe('large');
      expect(robots?.googleBot?.['max-snippet']).toBe(-1);
    });
  });

  describe('Additional metadata', () => {
    test('has metadataBase configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.metadataBase).toBeDefined();
      expect(metadata.metadataBase?.toString()).toBe('https://knowyouremoji.com/');
    });

    // Note: Icons are now auto-generated by Next.js via icon.tsx and apple-icon.tsx

    test('has manifest configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.manifest).toBe('/site.webmanifest');
    });

    test('has category configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      expect(metadata.category).toBe('technology');
    });

    test('has alternates with canonical URL', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com');
    });
  });

  describe('Helper functions', () => {
    test('getSiteUrl returns correct URL from env', async () => {
      const { getSiteUrl } = await import('../../../src/lib/metadata');
      expect(getSiteUrl()).toBe('https://knowyouremoji.com');
    });

    test('getSiteName returns correct name from env', async () => {
      const { getSiteName } = await import('../../../src/lib/metadata');
      expect(getSiteName()).toBe('KnowYourEmoji');
    });

    test('getSiteUrl returns default when env not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      // Clear module cache to ensure fresh import
      delete require.cache[require.resolve('../../../src/lib/metadata')];
      delete require.cache[require.resolve('../../../src/lib/env')];

      const { getSiteUrl } = await import('../../../src/lib/metadata');
      expect(getSiteUrl()).toBe('http://localhost:3000');
    });

    test('getSiteName returns default when env not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_NAME;
      // Clear module cache to ensure fresh import
      delete require.cache[require.resolve('../../../src/lib/metadata')];
      delete require.cache[require.resolve('../../../src/lib/env')];

      const { getSiteName } = await import('../../../src/lib/metadata');
      expect(getSiteName()).toBe('KnowYourEmoji');
    });
  });

  describe('siteMetadata export', () => {
    test('siteMetadata is exported and valid', async () => {
      const { siteMetadata } = await import('../../../src/lib/metadata');

      expect(siteMetadata).toBeDefined();
      expect(siteMetadata.title).toBeDefined();
      expect(siteMetadata.description).toBeDefined();
      expect(siteMetadata.openGraph).toBeDefined();
      expect(siteMetadata.twitter).toBeDefined();
      expect(siteMetadata.robots).toBeDefined();
    });
  });
});
