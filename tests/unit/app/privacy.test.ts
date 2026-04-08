import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { generateMetadata, default as PrivacyPage } from '../../../src/app/privacy/page';

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

describe('Privacy Page', () => {
  beforeEach(() => {
    saveEnv();
    process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
    process.env.NEXT_PUBLIC_APP_NAME = 'KnowYourEmoji';
  });

  afterEach(() => {
    restoreEnv();
  });

  describe('generateMetadata', () => {
    test('generates metadata with correct title', () => {
      const metadata = generateMetadata();
      expect(metadata.title).toBe('Privacy Policy | KnowYourEmoji');
    });

    test('generates metadata with correct description', () => {
      const metadata = generateMetadata();
      expect(metadata.description).toContain('Privacy Policy');
      expect(typeof metadata.description).toBe('string');
    });

    test('generates metadata with canonical URL', () => {
      const metadata = generateMetadata();
      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com/privacy');
    });

    test('generates metadata with OpenGraph data', () => {
      const metadata = generateMetadata();
      const openGraph = metadata.openGraph as {
        type?: string;
        url?: string;
        siteName?: string;
        title?: string;
        locale?: string;
        images?: Array<{ url: string; width: number; height: number; alt: string }>;
      };
      expect(openGraph?.type).toBe('website');
      expect(openGraph?.url).toBe('https://knowyouremoji.com/privacy');
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
      expect(openGraph?.locale).toBe('en_US');
      expect(openGraph?.title).toBe('Privacy Policy | KnowYourEmoji');
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
      expect(metadata.title).toBe('Privacy Policy | CustomName');
      const alternates = metadata.alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://custom-url.com/privacy');
    });
  });

  describe('PrivacyPage component', () => {
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
      expect(typeof PrivacyPage).toBe('function');
    });

    test('returns a valid React element', () => {
      const result = PrivacyPage();
      expect(result).toBeDefined();
      expect(result.type).toBe('main');
    });

    test('contains breadcrumbs navigation', () => {
      const result = PrivacyPage();
      const content = extractContent(result);
      expect(content).toContain('Breadcrumbs');
    });

    test('has accessible heading structure', () => {
      const result = PrivacyPage();
      const content = extractContent(result);
      expect(content).toContain('h1');
    });

    test('contains privacy policy content', () => {
      const result = PrivacyPage();
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('privacy');
      expect(content).toContain('policy');
    });

    test('contains information collection section', () => {
      const result = PrivacyPage();
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('information');
      expect(content).toContain('collect');
    });

    test('contains data sharing section', () => {
      const result = PrivacyPage();
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('data');
      expect(content).toContain('sharing');
    });

    test('contains data security section', () => {
      const result = PrivacyPage();
      const content = extractContent(result).toLowerCase();
      expect(content).toContain('security');
    });

    test('contains link to GitHub', () => {
      const result = PrivacyPage();
      const content = extractContent(result);
      expect(content).toContain('github.com/marc-aurele-besner/knowyouremoji.com');
    });
  });
});
