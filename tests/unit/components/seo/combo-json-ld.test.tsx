import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { ComboJsonLd } from '@/components/seo/combo-json-ld';
import type { EmojiCombo } from '@/types/combo';

afterEach(() => {
  cleanup();
});

const mockCombo: EmojiCombo = {
  slug: 'skull-laughing',
  combo: '💀😂',
  emojis: ['skull', 'face-with-tears-of-joy'],
  name: 'Dead Laughing',
  description:
    "The ultimate expression of finding something hilarious - combining 'I'm dead' with tears of joy.",
  meaning:
    "Something is so funny that one skull isn't enough to express how dead you are from laughing.",
  examples: ["That video 💀😂 I can't breathe", '💀😂💀😂 this thread is killing me'],
  category: 'humor',
  seoTitle: '💀😂 Dead Laughing Combo Meaning',
  seoDescription:
    'What does 💀😂 mean? The skull and laughing emoji combo explained. Used when something is extremely funny.',
  relatedCombos: ['fire-100', 'sob-laughing'],
  tags: ['funny', 'laughing', 'dead'],
  popularity: 95,
};

const mockAppUrl = 'https://knowyouremoji.com';
const mockAppName = 'KnowYourEmoji';

describe('ComboJsonLd', () => {
  describe('rendering', () => {
    it('renders a script tag with type application/ld+json', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
    });

    it('renders valid JSON-LD content', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const content = script?.textContent;
      expect(content).not.toBeNull();

      // Should parse without error
      const parsed = JSON.parse(content!);
      expect(parsed).toBeDefined();
    });
  });

  describe('JSON-LD structure', () => {
    it('includes @context with schema.org', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@context']).toBe('https://schema.org');
    });

    it('uses Article as the main type', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@type']).toBe('Article');
    });

    it('includes the correct headline with combo characters and name', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.headline).toBe('💀😂 Dead Laughing Combo Meaning');
    });

    it('includes the meaning as description', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.description).toBe(mockCombo.meaning);
    });

    it('includes the correct URL', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.url).toBe('https://knowyouremoji.com/combo/skull-laughing');
    });

    it('includes mainEntityOfPage with WebPage type', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.mainEntityOfPage).toEqual({
        '@type': 'WebPage',
        '@id': 'https://knowyouremoji.com/combo/skull-laughing',
      });
    });

    it('includes publisher information', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.publisher).toEqual({
        '@type': 'Organization',
        name: 'KnowYourEmoji',
        url: 'https://knowyouremoji.com',
      });
    });

    it('includes keywords from combo data', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.keywords).toContain('dead laughing combo');
      expect(parsed.keywords).toContain('💀😂');
      expect(parsed.keywords).toContain('emoji combo');
    });

    it('includes tags in keywords when available', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.keywords).toContain('funny');
      expect(parsed.keywords).toContain('laughing');
      expect(parsed.keywords).toContain('dead');
    });

    it('includes articleSection with category', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.articleSection).toBe('Humor');
    });

    it('includes about with DefinedTerm type for the combo', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.about).toEqual({
        '@type': 'DefinedTerm',
        name: 'Dead Laughing',
        description: mockCombo.description,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Emoji Combinations',
        },
      });
    });
  });

  describe('edge cases', () => {
    it('handles combo without tags', () => {
      const comboNoTags: EmojiCombo = {
        ...mockCombo,
        tags: undefined,
      };

      render(<ComboJsonLd combo={comboNoTags} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const parsed = JSON.parse(script!.textContent!);
      expect(parsed.keywords).toBeDefined();
      expect(parsed.keywords).toContain('dead laughing combo');
    });

    it('handles combo with empty tags array', () => {
      const comboEmptyTags: EmojiCombo = {
        ...mockCombo,
        tags: [],
      };

      render(<ComboJsonLd combo={comboEmptyTags} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const parsed = JSON.parse(script!.textContent!);
      expect(parsed).toBeDefined();
    });

    it('handles combo with special characters in name', () => {
      const comboSpecialChars: EmojiCombo = {
        ...mockCombo,
        name: "Combo with 'Apostrophe' & Ampersand",
      };

      render(<ComboJsonLd combo={comboSpecialChars} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      // Should still parse without error
      const parsed = JSON.parse(script!.textContent!);
      expect(parsed.headline).toContain("Combo with 'Apostrophe' & Ampersand");
    });

    it('capitalizes category properly for articleSection', () => {
      const comboLowerCategory: EmojiCombo = {
        ...mockCombo,
        category: 'humor',
      };

      render(<ComboJsonLd combo={comboLowerCategory} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.articleSection).toBe('Humor');
    });

    it('handles combo without relatedCombos', () => {
      const comboNoRelated: EmojiCombo = {
        ...mockCombo,
        relatedCombos: undefined,
      };

      render(<ComboJsonLd combo={comboNoRelated} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const parsed = JSON.parse(script!.textContent!);
      expect(parsed).toBeDefined();
    });

    it('handles combo without popularity', () => {
      const comboNoPopularity: EmojiCombo = {
        ...mockCombo,
        popularity: undefined,
      };

      render(<ComboJsonLd combo={comboNoPopularity} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const parsed = JSON.parse(script!.textContent!);
      expect(parsed).toBeDefined();
    });
  });

  describe('SEO compliance', () => {
    it('includes all required Article properties per Schema.org', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      // Required properties for Article
      expect(parsed['@context']).toBeDefined();
      expect(parsed['@type']).toBeDefined();
      expect(parsed.headline).toBeDefined();
      expect(parsed.description).toBeDefined();
      expect(parsed.url).toBeDefined();
      expect(parsed.publisher).toBeDefined();
      expect(parsed.mainEntityOfPage).toBeDefined();
    });

    it('headline is under 110 characters as recommended', () => {
      render(<ComboJsonLd combo={mockCombo} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.headline.length).toBeLessThanOrEqual(110);
    });
  });
});
