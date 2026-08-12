import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { EmojiJsonLd } from '@/components/seo/emoji-json-ld';
import type { Emoji } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

const mockEmoji: Emoji = {
  unicode: '1F480',
  slug: 'skull',
  character: '💀',
  name: 'Skull',
  shortName: 'skull',
  category: 'faces',
  subcategory: 'face-negative',
  unicodeVersion: '6.0',
  baseMeaning: 'A human skull, often used to represent death or danger in traditional contexts.',
  tldr: "Usually means 'that's so funny I'm dead' or ironic disbelief, not actual death.",
  contextMeanings: [
    {
      context: 'SLANG',
      meaning: "Something is extremely funny - 'I'm dead' from laughing.",
      example: 'That meme 💀💀💀',
      riskLevel: 'LOW',
    },
    {
      context: 'IRONIC',
      meaning: 'Expressing disbelief or embarrassment.',
      example: "I can't believe I said that 💀",
      riskLevel: 'LOW',
    },
  ],
  platformNotes: [
    {
      platform: 'TIKTOK',
      note: 'Very common in comments to indicate something is hilarious.',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: "Almost exclusively means 'I'm dead (from laughing)'.",
    },
  ],
  warnings: [
    {
      title: 'Generational misunderstanding',
      description:
        "Can be misinterpreted as morbid by older generations who may not understand the 'I'm dead' slang.",
      severity: 'LOW',
    },
  ],
  relatedCombos: ['skull-laughing'],
  seoTitle: '💀 Skull Emoji Meaning - What Does 💀 Really Mean?',
  seoDescription:
    "Learn what the skull emoji 💀 really means in modern texting. Usually means 'I'm dead' from laughing, not actual death. Context guide for all platforms.",
};

const mockAppUrl = 'https://knowyouremoji.com';
const mockAppName = 'KnowYourEmoji';

describe('EmojiJsonLd', () => {
  describe('rendering', () => {
    it('renders a script tag with type application/ld+json', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
    });

    it('renders valid JSON-LD content', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

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
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@context']).toBe('https://schema.org');
    });

    it('uses Article as the main type', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@type']).toBe('Article');
    });

    it('includes the correct headline with emoji character and name', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.headline).toBe('💀 Skull Emoji Meaning');
    });

    it('includes the tldr as description', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.description).toBe(mockEmoji.tldr);
    });

    it('includes the correct URL', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.url).toBe('https://knowyouremoji.com/emoji/skull');
    });

    it('includes mainEntityOfPage with WebPage type', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.mainEntityOfPage).toEqual({
        '@type': 'WebPage',
        '@id': 'https://knowyouremoji.com/emoji/skull',
      });
    });

    it('includes publisher information', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.publisher).toEqual({
        '@type': 'Organization',
        name: 'KnowYourEmoji',
        url: 'https://knowyouremoji.com',
      });
    });

    it('includes keywords from emoji data', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.keywords).toContain('skull emoji');
      expect(parsed.keywords).toContain('💀');
      expect(parsed.keywords).toContain('emoji meaning');
    });

    it('includes articleSection with category', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.articleSection).toBe('Faces');
    });

    it('includes about with DefinedTerm type for the emoji', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.about).toEqual({
        '@type': 'DefinedTerm',
        name: 'Skull',
        description: mockEmoji.baseMeaning,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Unicode Emoji',
        },
      });
    });
  });

  describe('edge cases', () => {
    it('handles emoji without subcategory', () => {
      const emojiNoSubcategory: Emoji = {
        ...mockEmoji,
        subcategory: undefined,
      };

      render(<EmojiJsonLd emoji={emojiNoSubcategory} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const parsed = JSON.parse(script!.textContent!);
      expect(parsed.articleSection).toBe('Faces');
    });

    it('handles emoji with empty context meanings', () => {
      const emojiNoContexts: Emoji = {
        ...mockEmoji,
        contextMeanings: [],
      };

      render(<EmojiJsonLd emoji={emojiNoContexts} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      const parsed = JSON.parse(script!.textContent!);
      expect(parsed).toBeDefined();
    });

    it('handles emoji with special characters in name', () => {
      const emojiSpecialChars: Emoji = {
        ...mockEmoji,
        name: "Face with 'Apostrophe' & Ampersand",
      };

      render(<EmojiJsonLd emoji={emojiSpecialChars} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      // Should still parse without error
      const parsed = JSON.parse(script!.textContent!);
      expect(parsed.headline).toContain("Face with 'Apostrophe' & Ampersand");
    });

    it('capitalizes category properly for articleSection', () => {
      const emojiLowerCategory: Emoji = {
        ...mockEmoji,
        category: 'smileys & people',
      };

      render(<EmojiJsonLd emoji={emojiLowerCategory} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.articleSection).toBe('Smileys & people');
    });
  });

  describe('long-form FAQ support (CONTENT-P1-001)', () => {
    it('keeps the legacy Article shape when there are no FAQs', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);
      expect(parsed['@type']).toBe('Article');
      expect(parsed['@graph']).toBeUndefined();
    });

    it('emits an @graph with Article + FAQPage when longForm.faqs is present', () => {
      const emojiWithFaqs: Emoji = {
        ...mockEmoji,
        longForm: {
          faqs: [
            { question: 'What does 💀 mean?', answer: 'It means "dead from laughing".' },
            { question: 'Is 💀 flirty?', answer: 'Usually not.' },
          ],
        },
      };

      render(<EmojiJsonLd emoji={emojiWithFaqs} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@context']).toBe('https://schema.org');
      expect(Array.isArray(parsed['@graph'])).toBe(true);
      const graph = parsed['@graph'] as Array<Record<string, unknown>>;

      const article = graph.find((node) => node['@type'] === 'Article');
      const faq = graph.find((node) => node['@type'] === 'FAQPage');
      expect(article).toBeDefined();
      expect(faq).toBeDefined();

      const faqEntity = faq as {
        mainEntity: Array<{ '@type': string; name: string; acceptedAnswer: { text: string } }>;
      };
      expect(faqEntity.mainEntity).toHaveLength(2);
      expect(faqEntity.mainEntity[0]['@type']).toBe('Question');
      expect(faqEntity.mainEntity[0].name).toBe('What does 💀 mean?');
      expect(faqEntity.mainEntity[0].acceptedAnswer.text).toBe('It means "dead from laughing".');
    });

    it('does not emit an FAQPage when longForm is present but has no FAQs', () => {
      const emojiLongFormNoFaqs: Emoji = {
        ...mockEmoji,
        longForm: { overview: 'paragraph' },
      };

      render(<EmojiJsonLd emoji={emojiLongFormNoFaqs} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed['@type']).toBe('Article');
      expect(parsed['@graph']).toBeUndefined();
    });
  });

  describe('SEO compliance', () => {
    it('includes all required Article properties per Schema.org', () => {
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

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
      render(<EmojiJsonLd emoji={mockEmoji} appUrl={mockAppUrl} appName={mockAppName} />);

      const script = document.querySelector('script[type="application/ld+json"]');
      const parsed = JSON.parse(script!.textContent!);

      expect(parsed.headline.length).toBeLessThanOrEqual(110);
    });
  });
});
