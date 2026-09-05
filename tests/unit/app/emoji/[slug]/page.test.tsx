import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen } from '@testing-library/react';
import EmojiPage, {
  generateStaticParams,
  generateMetadata,
  revalidate,
} from '@/app/emoji/[slug]/page';
import type { Emoji } from '@/types/emoji';

// Mock the emoji-data module
const mockGetEmojiBySlug = mock<() => Emoji | undefined>(() => undefined);
const mockGetAllEmojiSlugs = mock<() => string[]>(() => ['skull', 'heart']);

mock.module('@/lib/emoji-data', () => ({
  getEmojiBySlug: mockGetEmojiBySlug,
  getAllEmojiSlugs: mockGetAllEmojiSlugs,
}));

// Mock next/navigation
const mockNotFound = mock(() => {
  throw new Error('NEXT_NOT_FOUND');
});

mock.module('next/navigation', () => ({
  notFound: mockNotFound,
}));

// Mock env so generateMetadata's openGraph.siteName is deterministic
// regardless of process.env state leaked in from other test files (PR 388 flake).
// Mirrors the pattern in tests/unit/app/combo/[slug]/page.test.tsx.
const mockGetEnv = mock(() => ({
  appUrl: 'http://localhost:3000',
  appName: 'KnowYourEmoji',
  openrouterApiKey: undefined,
  openrouterModel: 'liquid/lfm2-8b-a1b',
  enableInterpreter: true,
  sentryDsn: undefined,
  sentryDsnPublic: undefined,
  gaMeasurementId: undefined,
  posthogKey: undefined,
  posthogHost: undefined,
  upstashRedisRestUrl: undefined,
  upstashRedisRestToken: undefined,
  authSecret: undefined,
  googleClientId: undefined,
  googleClientSecret: undefined,
  githubClientId: undefined,
  githubClientSecret: undefined,
  resendApiKey: undefined,
  resendFromEmail: undefined,
  slackBotToken: undefined,
  slackLogChannelId: undefined,
  stripeSecretKey: undefined,
  stripePublishableKey: undefined,
  stripeWebhookSecret: undefined,
  stripeProPriceId: undefined,
  databaseUrl: undefined,
}));

mock.module('@/lib/env', () => ({
  getEnv: mockGetEnv,
}));

const mockEmoji: Emoji = {
  unicode: '1F480',
  slug: 'skull',
  character: '💀',
  name: 'Skull',
  shortName: 'skull',
  category: 'faces',
  subcategory: 'face-negative',
  unicodeVersion: '6.0',
  baseMeaning: 'A human skull',
  tldr: "Usually means 'that's so funny I'm dead'",
  contextMeanings: [
    {
      context: 'SLANG',
      meaning: "Something is extremely funny - 'I'm dead' from laughing.",
      example: 'That meme 💀💀💀',
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
      description: 'Can be misinterpreted as morbid by older generations.',
      severity: 'LOW',
    },
  ],
  relatedCombos: ['skull-laughing'],
  seoTitle: '💀 Skull Emoji Meaning - What Does 💀 Really Mean?',
  seoDescription: 'Learn what the skull emoji 💀 really means in modern texting.',
};

describe('EmojiPage', () => {
  beforeEach(() => {
    mockGetEmojiBySlug.mockReset();
    mockGetAllEmojiSlugs.mockReset();
    mockNotFound.mockReset();
    mockGetAllEmojiSlugs.mockImplementation(() => ['skull', 'heart']);
  });

  afterEach(() => {
    mockGetEmojiBySlug.mockReset();
    mockGetAllEmojiSlugs.mockReset();
    mockNotFound.mockReset();
  });

  describe('ISR configuration', () => {
    test('exports revalidate constant for ISR', () => {
      expect(revalidate).toBeDefined();
      expect(typeof revalidate).toBe('number');
    });

    test('revalidate is set to 1 hour (3600 seconds)', () => {
      expect(revalidate).toBe(3600);
    });
  });

  describe('generateStaticParams', () => {
    test('returns all emoji slugs as params', async () => {
      const params = await generateStaticParams();
      expect(params).toEqual([{ slug: 'skull' }, { slug: 'heart' }]);
      expect(mockGetAllEmojiSlugs).toHaveBeenCalled();
    });

    test('returns empty array when no emojis exist', async () => {
      mockGetAllEmojiSlugs.mockImplementation(() => []);
      const params = await generateStaticParams();
      expect(params).toEqual([]);
    });
  });

  describe('generateMetadata', () => {
    test('returns metadata for existing emoji', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'skull' }) });

      expect(metadata.title).toBe('💀 Skull Emoji Meaning - What Does 💀 Really Mean?');
      expect(metadata.description).toBe(
        'Learn what the skull emoji 💀 really means in modern texting.'
      );
      expect(metadata.openGraph?.title).toBe('💀 Skull Emoji Meaning');
      expect(metadata.openGraph?.description).toBe("Usually means 'that's so funny I'm dead'");
    });

    test('returns empty metadata for non-existent emoji', async () => {
      mockGetEmojiBySlug.mockImplementation(() => undefined);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });

      expect(metadata).toEqual({});
    });

    test('includes full Open Graph metadata', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'skull' }) });

      // Open Graph basic fields - cast to access type-specific properties
      const openGraph = metadata.openGraph as {
        type?: string;
        siteName?: string;
        url?: string;
        images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      };
      expect(openGraph?.type).toBe('article');
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
      expect(openGraph?.url).toContain('/emoji/skull');

      // Open Graph images
      const ogImages = openGraph?.images;
      expect(ogImages).toBeDefined();
      expect(Array.isArray(ogImages) ? ogImages.length : 0).toBeGreaterThan(0);
    });

    test('includes Twitter Card metadata', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'skull' }) });

      // Cast to access Twitter-specific properties
      const twitter = metadata.twitter as {
        card?: string;
        title?: string;
        description?: string;
      };
      expect(twitter?.card).toBe('summary_large_image');
      expect(twitter?.title).toBe('💀 Skull Emoji Meaning');
      expect(twitter?.description).toBe("Usually means 'that's so funny I'm dead'");
    });

    test('includes canonical URL', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'skull' }) });

      expect(metadata.alternates?.canonical).toContain('/emoji/skull');
    });

    test('includes keywords with emoji-related terms', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'skull' }) });

      expect(metadata.keywords).toBeDefined();
      expect(metadata.keywords).toContain('skull emoji');
      expect(metadata.keywords).toContain('💀');
    });

    test('includes proper robots directives', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'skull' }) });

      expect(metadata.robots).toBeDefined();
      expect(metadata.robots).toEqual({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      });
    });
  });

  describe('EmojiPage component', () => {
    test('renders emoji page with all sections', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);

      const page = await EmojiPage({ params: Promise.resolve({ slug: 'skull' }) });
      render(page);

      // Check emoji header
      expect(screen.getByRole('img', { name: 'Skull' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Skull', level: 1 })).toBeInTheDocument();

      // Check TL;DR section
      expect(screen.getByText(/Usually means 'that's so funny I'm dead'/)).toBeInTheDocument();

      // Check context meanings
      expect(screen.getByText(/Something is extremely funny/)).toBeInTheDocument();

      // Check platform notes
      expect(screen.getByText(/Very common in comments/)).toBeInTheDocument();

      // Check generational notes
      expect(screen.getByText(/Almost exclusively means/)).toBeInTheDocument();

      // Check warnings
      expect(screen.getByText(/Generational misunderstanding/)).toBeInTheDocument();
    });

    test('calls notFound for non-existent emoji', async () => {
      mockGetEmojiBySlug.mockImplementation(() => undefined);
      mockNotFound.mockImplementation(() => {
        throw new Error('NEXT_NOT_FOUND');
      });

      await expect(EmojiPage({ params: Promise.resolve({ slug: 'nonexistent' }) })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
      expect(mockNotFound).toHaveBeenCalled();
    });

    test('renders JSON-LD structured data', async () => {
      mockGetEmojiBySlug.mockImplementation(() => mockEmoji);

      const page = await EmojiPage({ params: Promise.resolve({ slug: 'skull' }) });
      render(page);

      // Check JSON-LD script tag is present
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      // Verify JSON-LD content
      const jsonLd = JSON.parse(script!.textContent!);
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('Article');
      expect(jsonLd.headline).toBe('💀 Skull Emoji Meaning');
      expect(jsonLd.description).toBe("Usually means 'that's so funny I'm dead'");
    });

    test('renders HIGH risk level context meanings', async () => {
      const emojiWithHighRisk: Emoji = {
        ...mockEmoji,
        contextMeanings: [
          {
            context: 'RED_FLAG',
            meaning: 'This can be a red flag.',
            example: 'Example message 💀',
            riskLevel: 'HIGH',
          },
          {
            context: 'DATING',
            meaning: 'Dating context meaning.',
            example: 'Another example 💀',
            riskLevel: 'MEDIUM',
          },
        ],
      };
      mockGetEmojiBySlug.mockImplementation(() => emojiWithHighRisk);

      const page = await EmojiPage({ params: Promise.resolve({ slug: 'skull' }) });
      render(page);

      // Check that context meanings render
      expect(screen.getByText(/This can be a red flag/)).toBeInTheDocument();
      expect(screen.getByText(/Dating context meaning/)).toBeInTheDocument();
    });

    test('renders HIGH severity warnings', async () => {
      const emojiWithHighSeverity: Emoji = {
        ...mockEmoji,
        warnings: [
          {
            title: 'Critical Warning',
            description: 'This is a high severity warning.',
            severity: 'HIGH',
          },
          {
            title: 'Medium Warning',
            description: 'This is a medium severity warning.',
            severity: 'MEDIUM',
          },
        ],
      };
      mockGetEmojiBySlug.mockImplementation(() => emojiWithHighSeverity);

      const page = await EmojiPage({ params: Promise.resolve({ slug: 'skull' }) });
      render(page);

      // Check that warnings render
      expect(screen.getByText(/Critical Warning/)).toBeInTheDocument();
      expect(screen.getByText(/Medium Warning/)).toBeInTheDocument();
    });

    test('renders the long-form section when longForm is present', async () => {
      const emojiWithLongForm: Emoji = {
        ...mockEmoji,
        longForm: {
          overview: 'First paragraph of the article overview.\n\nSecond paragraph follows.',
          howPeopleUseIt: 'It shows up everywhere.',
          whenNotToUse: 'Skip it in formal channels.',
          howToReply: 'Mirror the energy with another skull.',
          faqs: [{ question: 'What does it mean?', answer: 'It means the sender is amused.' }],
        },
      };
      mockGetEmojiBySlug.mockImplementation(() => emojiWithLongForm);

      const page = await EmojiPage({ params: Promise.resolve({ slug: 'skull' }) });
      render(page);

      expect(screen.getByTestId('emoji-long-form-section')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Overview', level: 2 })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'How People Use It', level: 2 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'When Not to Use It', level: 2 })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'How to Reply', level: 2 })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Frequently Asked Questions', level: 2 })
      ).toBeInTheDocument();
    });

    test('renders conversation examples when provided', async () => {
      const emojiWithExamples: Emoji = {
        ...mockEmoji,
        conversationExamples: [
          {
            setting: 'friends',
            message: 'bro i just tripped into the projector at work 💀',
            interpretation: 'Sender is laughing at their own embarrassment.',
          },
        ],
      };
      mockGetEmojiBySlug.mockImplementation(() => emojiWithExamples);

      const page = await EmojiPage({ params: Promise.resolve({ slug: 'skull' }) });
      render(page);

      expect(screen.getByTestId('emoji-conversation-examples-section')).toBeInTheDocument();
      expect(screen.getByText(/tripped into the projector/)).toBeInTheDocument();
    });
  });
});
