import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { GuideJsonLd, buildGuideJsonLd } from '@/components/seo/guide-json-ld';
import type { Guide } from '@/types/guide';

afterEach(() => {
  cleanup();
});

const mockGuide: Guide = {
  slug: 'what-does-skull-mean-in-texting',
  title: 'What does 💀 mean in texting in 2026?',
  description:
    'A complete guide to the skull emoji — why it means "I\'m dead" (in a good way), how Gen Z uses it, and when sending it can go sideways.',
  heroEmoji: '💀',
  tags: ['gen-z', 'slang', 'dying-of-laughter'],
  publishedAt: '2026-08-12T00:00:00.000Z',
  updatedAt: '2026-08-12T00:00:00.000Z',
  readingTimeMinutes: 7,
  author: 'KnowYourEmoji Editorial',
  relatedEmojis: ['skull'],
  relatedCombos: ['skull-laughing'],
  seoTitle: 'What does 💀 mean in texting?',
  seoDescription: 'The skull emoji decoded for 2026.',
  body: '# Hello\n\nBody.',
  html: '<h1>Hello</h1>',
  draft: false,
};

const mockAppUrl = 'https://knowyouremoji.com';
const mockAppName = 'KnowYourEmoji';

describe('GuideJsonLd', () => {
  describe('buildGuideJsonLd', () => {
    it('produces a Schema.org Article payload', () => {
      const ld = buildGuideJsonLd(mockGuide, mockAppUrl, mockAppName);
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('Article');
      expect(ld.headline).toBe(mockGuide.title);
      expect(ld.description).toBe(mockGuide.description);
      expect(ld.url).toBe(`${mockAppUrl}/guides/${mockGuide.slug}`);
    });

    it('uses publishedAt and updatedAt for date fields', () => {
      const ld = buildGuideJsonLd(mockGuide, mockAppUrl, mockAppName);
      expect(ld.datePublished).toBe(mockGuide.publishedAt);
      expect(ld.dateModified).toBe(mockGuide.updatedAt);
    });

    it('joins tags with commas for the keywords field', () => {
      const ld = buildGuideJsonLd(mockGuide, mockAppUrl, mockAppName);
      expect(ld.keywords).toBe('gen-z, slang, dying-of-laughter');
    });

    it('includes publisher and author information', () => {
      const ld = buildGuideJsonLd(mockGuide, mockAppUrl, mockAppName);
      expect(ld.author).toEqual({
        '@type': 'Organization',
        name: mockGuide.author,
        url: mockAppUrl,
      });
      expect(ld.publisher).toEqual({ '@type': 'Organization', name: mockAppName, url: mockAppUrl });
    });
  });

  describe('rendering', () => {
    it('renders a script tag with type application/ld+json', () => {
      render(<GuideJsonLd guide={mockGuide} appUrl={mockAppUrl} appName={mockAppName} />);
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
    });

    it('emits JSON that parses back to the same payload', () => {
      render(<GuideJsonLd guide={mockGuide} appUrl={mockAppUrl} appName={mockAppName} />);
      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);
      expect(parsed['@type']).toBe('Article');
      expect(parsed.url).toBe(`${mockAppUrl}/guides/${mockGuide.slug}`);
    });

    it('falls back to appName when guide has no author', () => {
      render(
        <GuideJsonLd
          guide={{ ...mockGuide, author: '' }}
          appUrl={mockAppUrl}
          appName={mockAppName}
        />
      );
      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);
      expect((parsed.author as { name: string }).name).toBe(mockAppName);
    });
  });
});
