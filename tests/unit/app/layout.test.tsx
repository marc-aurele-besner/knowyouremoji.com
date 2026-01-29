import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test';
import { render } from '@testing-library/react';

// Store original env
const originalEnv = { ...process.env };

describe('Root Layout Metadata', () => {
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

  describe('Basic metadata', () => {
    test('has correct default title', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.title).toBeDefined();
      expect(
        siteMetadata.title !== null &&
          typeof siteMetadata.title === 'object' &&
          'default' in siteMetadata.title
      ).toBe(true);
      const titleObj = siteMetadata.title as { default: string; template: string };
      expect(titleObj.default).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct title template', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const titleObj = siteMetadata.title as { default: string; template: string };
      expect(titleObj.template).toBe('%s | KnowYourEmoji');
    });

    test('has correct description', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    test('has correct keywords', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.keywords).toBeDefined();
      expect(Array.isArray(siteMetadata.keywords)).toBe(true);
      const keywords = siteMetadata.keywords as string[];
      expect(keywords).toContain('emoji meaning');
      expect(keywords).toContain('emoji interpreter');
      expect(keywords).toContain('what does emoji mean');
      expect(keywords).toContain('emoji decoder');
      expect(keywords).toContain('emoji translator');
    });

    test('has correct authors', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.authors).toBeDefined();
      expect(Array.isArray(siteMetadata.authors)).toBe(true);
      const authors = siteMetadata.authors as Array<{ name: string; url?: string }>;
      expect(authors.length).toBeGreaterThan(0);
      expect(authors[0].name).toBe('KnowYourEmoji');
    });

    test('has correct creator', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.creator).toBe('KnowYourEmoji');
    });

    test('has correct publisher', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.publisher).toBe('KnowYourEmoji');
    });
  });

  describe('Open Graph metadata', () => {
    test('has correct type', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const openGraph = siteMetadata.openGraph as {
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
      const siteMetadata = createSiteMetadata();

      const openGraph = siteMetadata.openGraph as { locale?: string };
      expect(openGraph?.locale).toBe('en_US');
    });

    test('has correct site name', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const openGraph = siteMetadata.openGraph as { siteName?: string };
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
    });

    test('has correct title', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const openGraph = siteMetadata.openGraph as { title?: string };
      expect(openGraph?.title).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct description', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const openGraph = siteMetadata.openGraph as { description?: string };
      expect(openGraph?.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    test('has correct URL', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const openGraph = siteMetadata.openGraph as { url?: string };
      expect(openGraph?.url).toBe('https://knowyouremoji.com');
    });

    // Note: OG images are now auto-generated by Next.js via opengraph-image.tsx
  });

  describe('Twitter Card metadata', () => {
    test('has correct card type', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const twitter = siteMetadata.twitter as {
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
      const siteMetadata = createSiteMetadata();

      const twitter = siteMetadata.twitter as { title?: string };
      expect(twitter?.title).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct description', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const twitter = siteMetadata.twitter as { description?: string };
      expect(twitter?.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    // Note: Twitter images are now auto-generated by Next.js via twitter-image.tsx
  });

  describe('Robots metadata', () => {
    test('has correct robots directives', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const robots = siteMetadata.robots as {
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
      const siteMetadata = createSiteMetadata();

      const robots = siteMetadata.robots as {
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
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.metadataBase).toBeDefined();
      expect(siteMetadata.metadataBase?.toString()).toBe('https://knowyouremoji.com/');
    });

    // Note: Icons are now auto-generated by Next.js via icon.tsx and apple-icon.tsx

    test('has manifest configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.manifest).toBe('/site.webmanifest');
    });

    test('has category configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      expect(siteMetadata.category).toBe('technology');
    });

    test('has alternates with canonical URL', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const siteMetadata = createSiteMetadata();

      const alternates = siteMetadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com');
    });
  });
});

describe('Root Layout Component', () => {
  beforeEach(() => {
    // Mock the fonts since they can't be loaded in tests
    mock.module('next/font/google', () => ({
      Geist: () => ({ variable: '--font-geist-sans' }),
      Geist_Mono: () => ({ variable: '--font-geist-mono' }),
    }));

    // Mock Google Analytics
    mock.module('@next/third-parties/google', () => ({
      GoogleAnalytics: ({ gaId }: { gaId: string }) => (
        <div data-testid="google-analytics-mock" data-ga-id={gaId} />
      ),
    }));
  });

  test('should not render GoogleAnalytics in test environment', async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';

    const { GoogleAnalytics } = await import('../../../src/components/analytics/google-analytics');

    const { container } = render(<GoogleAnalytics />);
    expect(container.innerHTML).toBe('');
  });
});
