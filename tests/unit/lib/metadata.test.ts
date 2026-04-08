import { describe, expect, test, beforeEach, afterEach } from 'bun:test';

// Save/restore only the env vars this test file touches
const TESTED_KEYS = ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_APP_NAME'] as const;
const savedEnv: Record<string, string | undefined> = {};

function saveEnv() {
  for (const key of TESTED_KEYS) {
    savedEnv[key] = process.env[key];
  }
}
function restoreEnv() {
  for (const key of TESTED_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
}

describe('Site Metadata Configuration', () => {
  beforeEach(() => {
    saveEnv();
    // Set test environment values
    process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
    process.env.NEXT_PUBLIC_APP_NAME = 'KnowYourEmoji';
    // Clear module cache to ensure fresh import
    delete require.cache[require.resolve('../../../src/lib/metadata')];
    delete require.cache[require.resolve('../../../src/lib/env')];
  });

  afterEach(() => {
    restoreEnv();
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

    test('has OG images configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const openGraph = metadata.openGraph as {
        images?: Array<{ url: string; alt?: string }>;
      };
      expect(openGraph?.images).toBeDefined();
      expect(openGraph?.images?.length).toBeGreaterThan(0);
      expect(openGraph?.images?.[0].url).toBe('/logo.png');
      expect(openGraph?.images?.[0].alt).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });
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

    test('has Twitter images configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const twitter = metadata.twitter as {
        images?: Array<{ url: string; alt?: string }>;
      };
      expect(twitter?.images).toBeDefined();
      expect(twitter?.images?.length).toBeGreaterThan(0);
      expect(twitter?.images?.[0].url).toBe('/logo.png');
      expect(twitter?.images?.[0].alt).toBe('KnowYourEmoji - Decode What Emojis Really Mean');
    });
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

    test('has icons configured with favicon', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const icons = metadata.icons as {
        icon?: Array<{ url: string; sizes?: string; type?: string }>;
        apple?: Array<{ url: string; sizes?: string; type?: string }>;
      };
      expect(icons).toBeDefined();
      expect(icons.icon).toBeDefined();
      expect(icons.icon?.length).toBe(3);
      expect(icons.icon?.[0].url).toBe('/favicon.ico');
      expect(icons.icon?.[1].url).toBe('/favicon/favicon.svg');
      expect(icons.icon?.[2].url).toBe('/favicon/favicon-96x96.png');
    });

    test('has apple touch icon configured', async () => {
      const { createSiteMetadata } = await import('../../../src/lib/metadata');
      const metadata = createSiteMetadata();

      const icons = metadata.icons as {
        apple?: Array<{ url: string; sizes?: string; type?: string }>;
      };
      expect(icons?.apple).toBeDefined();
      expect(icons?.apple?.length).toBe(1);
      expect(icons?.apple?.[0].url).toBe('/favicon/apple-touch-icon.png');
      expect(icons?.apple?.[0].sizes).toBe('180x180');
    });

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
