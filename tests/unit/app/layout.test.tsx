import { describe, expect, test, mock } from 'bun:test';

// Mock the env module before importing metadata
mock.module('@/lib/env', () => ({
  getEnv: () => ({
    appUrl: 'https://knowyouremoji.com',
    appName: 'KnowYourEmoji',
    openaiApiKey: undefined,
    enableInterpreter: true,
    sentryDsn: undefined,
    vercelAnalyticsId: undefined,
  }),
}));

// Import after mocking - use the function to ensure mock is applied
import { createSiteMetadata } from '@/lib/metadata';

// Create metadata after mock is applied
const siteMetadata = createSiteMetadata();

describe('Root Layout Metadata', () => {
  describe('Basic metadata', () => {
    test('has correct default title', () => {
      expect(siteMetadata.title).toBeDefined();
      expect(typeof siteMetadata.title === 'object' && 'default' in siteMetadata.title).toBe(true);
      const titleObj = siteMetadata.title as { default: string; template: string };
      expect(titleObj.default).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct title template', () => {
      const titleObj = siteMetadata.title as { default: string; template: string };
      expect(titleObj.template).toBe('%s | KnowYourEmoji');
    });

    test('has correct description', () => {
      expect(siteMetadata.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    test('has correct keywords', () => {
      expect(siteMetadata.keywords).toBeDefined();
      expect(Array.isArray(siteMetadata.keywords)).toBe(true);
      const keywords = siteMetadata.keywords as string[];
      expect(keywords).toContain('emoji meaning');
      expect(keywords).toContain('emoji interpreter');
      expect(keywords).toContain('what does emoji mean');
      expect(keywords).toContain('emoji decoder');
      expect(keywords).toContain('emoji translator');
    });

    test('has correct authors', () => {
      expect(siteMetadata.authors).toBeDefined();
      expect(Array.isArray(siteMetadata.authors)).toBe(true);
      const authors = siteMetadata.authors as Array<{ name: string; url?: string }>;
      expect(authors.length).toBeGreaterThan(0);
      expect(authors[0].name).toBe('KnowYourEmoji');
    });

    test('has correct creator', () => {
      expect(siteMetadata.creator).toBe('KnowYourEmoji');
    });

    test('has correct publisher', () => {
      expect(siteMetadata.publisher).toBe('KnowYourEmoji');
    });
  });

  describe('Open Graph metadata', () => {
    test('has correct type', () => {
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

    test('has correct locale', () => {
      const openGraph = siteMetadata.openGraph as { locale?: string };
      expect(openGraph?.locale).toBe('en_US');
    });

    test('has correct site name', () => {
      const openGraph = siteMetadata.openGraph as { siteName?: string };
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
    });

    test('has correct title', () => {
      const openGraph = siteMetadata.openGraph as { title?: string };
      expect(openGraph?.title).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct description', () => {
      const openGraph = siteMetadata.openGraph as { description?: string };
      expect(openGraph?.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    test('has correct URL', () => {
      const openGraph = siteMetadata.openGraph as { url?: string };
      expect(openGraph?.url).toBe('https://knowyouremoji.com');
    });

    test('has images configured', () => {
      const openGraph = siteMetadata.openGraph as {
        images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      };
      expect(openGraph?.images).toBeDefined();
      expect(Array.isArray(openGraph?.images)).toBe(true);
      expect(openGraph?.images?.length).toBeGreaterThan(0);

      const image = openGraph?.images?.[0];
      expect(image?.url).toContain('/og-image.png');
      expect(image?.width).toBe(1200);
      expect(image?.height).toBe(630);
      expect(image?.alt).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });
  });

  describe('Twitter Card metadata', () => {
    test('has correct card type', () => {
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

    test('has correct title', () => {
      const twitter = siteMetadata.twitter as { title?: string };
      expect(twitter?.title).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });

    test('has correct description', () => {
      const twitter = siteMetadata.twitter as { description?: string };
      expect(twitter?.description).toBe(
        'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.'
      );
    });

    test('has images configured', () => {
      const twitter = siteMetadata.twitter as { images?: string[] };
      expect(twitter?.images).toBeDefined();
      expect(Array.isArray(twitter?.images)).toBe(true);
      expect(twitter?.images?.length).toBeGreaterThan(0);
      expect(twitter?.images?.[0]).toContain('/og-image.png');
    });
  });

  describe('Robots metadata', () => {
    test('has correct robots directives', () => {
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

    test('has correct googleBot directives', () => {
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
    test('has metadataBase configured', () => {
      expect(siteMetadata.metadataBase).toBeDefined();
      expect(siteMetadata.metadataBase?.toString()).toBe('https://knowyouremoji.com/');
    });

    test('has icons configured', () => {
      const icons = siteMetadata.icons as {
        icon?: string;
        shortcut?: string;
        apple?: string;
      };
      expect(icons).toBeDefined();
      expect(icons?.icon).toBe('/favicon.ico');
      expect(icons?.shortcut).toBe('/favicon-16x16.png');
      expect(icons?.apple).toBe('/apple-touch-icon.png');
    });

    test('has manifest configured', () => {
      expect(siteMetadata.manifest).toBe('/site.webmanifest');
    });

    test('has category configured', () => {
      expect(siteMetadata.category).toBe('technology');
    });

    test('has alternates with canonical URL', () => {
      const alternates = siteMetadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com');
    });
  });
});
