import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import {
  generateMetadata,
  default as EditorialPolicyPage,
} from '../../../src/app/editorial-policy/page';
import { AMAZON_DISCLOSURE } from '../../../src/lib/amazon-affiliate';

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

// Safely extract text content (plus tag names and hrefs) from React elements
function extractContent(element: unknown): string {
  if (!element) return '';
  if (typeof element === 'string') return element;
  if (typeof element === 'number') return String(element);
  if (Array.isArray(element)) return element.map(extractContent).join(' ');
  if (typeof element === 'object' && element !== null) {
    const el = element as { type?: unknown; props?: { children?: unknown; href?: string } };
    let content = '';
    if (typeof el.type === 'string') content += el.type + ' ';
    if (el.props?.href) content += el.props.href + ' ';
    if (el.props?.children) content += extractContent(el.props.children);
    return content;
  }
  return '';
}

describe('Editorial Policy Page', () => {
  beforeEach(() => {
    saveEnv();
    process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
    process.env.NEXT_PUBLIC_APP_NAME = 'KnowYourEmoji';
  });

  afterEach(() => {
    restoreEnv();
  });

  describe('generateMetadata', () => {
    test('uses the page title without the site name', () => {
      expect(generateMetadata().title).toBe('Editorial Policy');
    });

    test('describes the policy', () => {
      const metadata = generateMetadata();
      expect(typeof metadata.description).toBe('string');
      expect(metadata.description).toContain('affiliate');
    });

    test('sets a self canonical URL', () => {
      const alternates = generateMetadata().alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://knowyouremoji.com/editorial-policy');
    });

    test('sets OpenGraph and Twitter data', () => {
      const metadata = generateMetadata();
      const openGraph = metadata.openGraph as {
        url?: string;
        siteName?: string;
        title?: string;
        images?: unknown[];
      };
      expect(openGraph?.url).toBe('https://knowyouremoji.com/editorial-policy');
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
      expect(openGraph?.title).toBe('Editorial Policy | KnowYourEmoji');
      expect(openGraph?.images?.length).toBeGreaterThan(0);

      const twitter = metadata.twitter as { card?: string; images?: string[] };
      expect(twitter?.card).toBe('summary_large_image');
      expect(twitter?.images).toEqual(['https://knowyouremoji.com/og-image.png']);
    });

    test('is indexable', () => {
      const robots = generateMetadata().robots as { index?: boolean; follow?: boolean };
      expect(robots?.index).toBe(true);
      expect(robots?.follow).toBe(true);
    });

    test('follows the configured app URL', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://custom-url.com';
      const alternates = generateMetadata().alternates as { canonical?: string };
      expect(alternates?.canonical).toBe('https://custom-url.com/editorial-policy');
    });
  });

  describe('EditorialPolicyPage component', () => {
    test('renders a main element with an h1 and breadcrumbs back to About', () => {
      const result = EditorialPolicyPage();
      expect(result.type).toBe('main');
      const content = extractContent(result);
      expect(content).toContain('h1');
      expect(content).toContain('Editorial Policy');

      const breadcrumbs = result.props.children[0] as {
        props: { items: Array<{ label: string; href?: string }> };
      };
      expect(breadcrumbs.props.items).toEqual([
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Editorial Policy' },
      ]);
    });

    test('names the one person who runs the site', () => {
      const content = extractContent(EditorialPolicyPage());
      expect(content).toContain('one-person project');
      expect(content).toContain('Marc-Aurele Besner');
      expect(content).not.toContain('small team');
    });

    test('discloses that pages are drafted with language models', () => {
      const content = extractContent(EditorialPolicyPage());
      expect(content).toContain('drafted with large language models');
      expect(content).toContain('KnowYourEmoji');
      expect(content).toContain('Editorial');
    });

    test('explains that templated pages are kept out of search', () => {
      const content = extractContent(EditorialPolicyPage());
      expect(content).toContain('noindex');
      expect(content).toContain('sitemap');
    });

    test('explains how to request a correction', () => {
      const content = extractContent(EditorialPolicyPage());
      expect(content).toContain('Corrections');
      expect(content).toContain(
        'https://github.com/marc-aurele-besner/knowyouremoji.com/issues/new'
      );
      expect(content).toContain('mailto:hello@knowyouremoji.com');
    });

    test('discloses the Amazon affiliate relationship', () => {
      const content = extractContent(EditorialPolicyPage());
      expect(content).toContain(AMAZON_DISCLOSURE);
      expect(content).toContain('/books');
      expect(content).toContain('Nobody pays');
    });

    test('lists one contents entry per section', () => {
      const content = extractContent(EditorialPolicyPage());
      for (let index = 1; index <= 7; index += 1) {
        expect(content).toContain(`#section-${index}`);
      }
    });
  });
});
