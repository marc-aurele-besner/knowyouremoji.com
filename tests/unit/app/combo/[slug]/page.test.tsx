import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import ComboPage, { generateStaticParams, generateMetadata } from '@/app/combo/[slug]/page';
import type { EmojiCombo } from '@/types/combo';

// Mock the combo-data module
const mockGetComboBySlug = mock<() => EmojiCombo | undefined>(() => undefined);
const mockGetAllComboSlugs = mock<() => string[]>(() => ['skull-laughing', 'fire-100']);
const mockGetRelatedCombos = mock<() => EmojiCombo[]>(() => []);

mock.module('@/lib/combo-data', () => ({
  getComboBySlug: mockGetComboBySlug,
  getAllComboSlugs: mockGetAllComboSlugs,
  getRelatedCombos: mockGetRelatedCombos,
}));

// Mock the emoji-data module for emoji lookup
const mockEmojiData: Record<string, { character: string; name: string }> = {
  skull: { character: '💀', name: 'Skull' },
  'face-with-tears-of-joy': { character: '😂', name: 'Face with Tears of Joy' },
  'grinning-face': { character: '😀', name: 'Grinning Face' },
  'thumbs-up': { character: '👍', name: 'Thumbs Up' },
  fire: { character: '🔥', name: 'Fire' },
  'hundred-points': { character: '💯', name: 'Hundred Points' },
};

mock.module('@/lib/emoji-data', () => ({
  getEmojiBySlug: (slug: string) => {
    const data = mockEmojiData[slug];
    return data ? { slug, character: data.character, name: data.name } : undefined;
  },
}));

// Mock next/navigation
const mockNotFound = mock(() => {
  throw new Error('NEXT_NOT_FOUND');
});

mock.module('next/navigation', () => ({
  notFound: mockNotFound,
}));

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

const mockRelatedCombo: EmojiCombo = {
  slug: 'fire-100',
  combo: '🔥💯',
  emojis: ['fire', 'hundred-points'],
  name: 'Fire Hundred',
  description: 'Perfect and on fire - maximum approval.',
  meaning: 'Something is absolutely perfect, excellent, or on fire.',
  examples: ['That fit 🔥💯', 'New track 🔥💯'],
  category: 'celebration',
  seoTitle: '🔥💯 Fire Hundred Combo Meaning',
  seoDescription: 'What does 🔥💯 mean? Learn about the fire hundred combo.',
};

describe('ComboPage', () => {
  beforeEach(() => {
    mockGetComboBySlug.mockReset();
    mockGetAllComboSlugs.mockReset();
    mockGetRelatedCombos.mockReset();
    mockNotFound.mockReset();
    mockGetAllComboSlugs.mockImplementation(() => ['skull-laughing', 'fire-100']);
  });

  afterEach(() => {
    cleanup();
    mockGetComboBySlug.mockReset();
    mockGetAllComboSlugs.mockReset();
    mockGetRelatedCombos.mockReset();
    mockNotFound.mockReset();
  });

  describe('generateStaticParams', () => {
    test('returns all combo slugs as params', async () => {
      const params = await generateStaticParams();
      expect(params).toEqual([{ slug: 'skull-laughing' }, { slug: 'fire-100' }]);
      expect(mockGetAllComboSlugs).toHaveBeenCalled();
    });

    test('returns empty array when no combos exist', async () => {
      mockGetAllComboSlugs.mockImplementation(() => []);
      const params = await generateStaticParams();
      expect(params).toEqual([]);
    });
  });

  describe('generateMetadata', () => {
    test('returns metadata for existing combo', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'skull-laughing' }),
      });

      expect(metadata.title).toBe('💀😂 Dead Laughing Combo Meaning');
      expect(metadata.description).toBe(
        'What does 💀😂 mean? The skull and laughing emoji combo explained. Used when something is extremely funny.'
      );
      expect(metadata.openGraph?.title).toBe('💀😂 Dead Laughing Combo Meaning');
      expect(metadata.openGraph?.description).toBe(
        "Something is so funny that one skull isn't enough to express how dead you are from laughing."
      );
    });

    test('returns empty metadata for non-existent combo', async () => {
      mockGetComboBySlug.mockImplementation(() => undefined);
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });

      expect(metadata).toEqual({});
    });

    test('includes full Open Graph metadata', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'skull-laughing' }),
      });

      // Open Graph basic fields
      const openGraph = metadata.openGraph as {
        type?: string;
        siteName?: string;
        url?: string;
        images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      };
      expect(openGraph?.type).toBe('article');
      expect(openGraph?.siteName).toBe('KnowYourEmoji');
      expect(openGraph?.url).toContain('/combo/skull-laughing');

      // Open Graph images
      const ogImages = openGraph?.images;
      expect(ogImages).toBeDefined();
      expect(Array.isArray(ogImages) ? ogImages.length : 0).toBeGreaterThan(0);
    });

    test('includes Twitter Card metadata', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'skull-laughing' }),
      });

      const twitter = metadata.twitter as {
        card?: string;
        title?: string;
        description?: string;
      };
      expect(twitter?.card).toBe('summary_large_image');
      expect(twitter?.title).toBe('💀😂 Dead Laughing Combo Meaning');
      expect(twitter?.description).toBe(
        "Something is so funny that one skull isn't enough to express how dead you are from laughing."
      );
    });

    test('includes canonical URL', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'skull-laughing' }),
      });

      expect(metadata.alternates?.canonical).toContain('/combo/skull-laughing');
    });

    test('includes keywords with combo-related terms', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'skull-laughing' }),
      });

      expect(metadata.keywords).toBeDefined();
      expect(metadata.keywords).toContain('dead laughing combo');
      expect(metadata.keywords).toContain('💀😂');
    });

    test('includes proper robots directives', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: 'skull-laughing' }),
      });

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

  describe('ComboPage component', () => {
    test('renders combo page with all sections', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      mockGetRelatedCombos.mockImplementation(() => [mockRelatedCombo]);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'skull-laughing' }) });
      render(page);

      // Check combo header - combo characters
      expect(screen.getByText('💀😂')).toBeInTheDocument();

      // Check combo name
      expect(screen.getByRole('heading', { name: 'Dead Laughing', level: 1 })).toBeInTheDocument();

      // Check meaning (appears in both header summary and meaning card)
      const meaningElements = screen.getAllByText(
        /Something is so funny that one skull isn't enough/
      );
      expect(meaningElements.length).toBeGreaterThanOrEqual(1);

      // Check description
      expect(
        screen.getByText(/The ultimate expression of finding something hilarious/)
      ).toBeInTheDocument();

      // Check examples
      expect(screen.getByText(/That video 💀😂 I can't breathe/)).toBeInTheDocument();

      // Check category badge
      expect(screen.getByText('humor')).toBeInTheDocument();
    });

    test('calls notFound for non-existent combo', async () => {
      mockGetComboBySlug.mockImplementation(() => undefined);
      mockNotFound.mockImplementation(() => {
        throw new Error('NEXT_NOT_FOUND');
      });

      await expect(ComboPage({ params: Promise.resolve({ slug: 'nonexistent' }) })).rejects.toThrow(
        'NEXT_NOT_FOUND'
      );
      expect(mockNotFound).toHaveBeenCalled();
    });

    test('renders examples section when examples exist', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      mockGetRelatedCombos.mockImplementation(() => []);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'skull-laughing' }) });
      render(page);

      expect(screen.getByRole('heading', { name: 'Examples', level: 2 })).toBeInTheDocument();
      expect(screen.getByText(/this thread is killing me/)).toBeInTheDocument();
    });

    test('renders related combos section when related combos exist', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      mockGetRelatedCombos.mockImplementation(() => [mockRelatedCombo]);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'skull-laughing' }) });
      render(page);

      expect(screen.getByRole('heading', { name: 'Related Combos', level: 2 })).toBeInTheDocument();
      expect(screen.getByText('🔥💯')).toBeInTheDocument();
      expect(screen.getByText('Fire Hundred')).toBeInTheDocument();
    });

    test('does not render related combos section when no related combos', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      mockGetRelatedCombos.mockImplementation(() => []);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'skull-laughing' }) });
      render(page);

      expect(
        screen.queryByRole('heading', { name: 'Related Combos', level: 2 })
      ).not.toBeInTheDocument();
    });

    test('renders tags when present', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      mockGetRelatedCombos.mockImplementation(() => []);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'skull-laughing' }) });
      render(page);

      expect(screen.getByText('funny')).toBeInTheDocument();
      expect(screen.getByText('laughing')).toBeInTheDocument();
      expect(screen.getByText('dead')).toBeInTheDocument();
    });

    test('renders combo without optional fields', async () => {
      const minimalCombo: EmojiCombo = {
        slug: 'minimal-combo',
        combo: '😀👍',
        emojis: ['grinning-face', 'thumbs-up'],
        name: 'Minimal Combo',
        description: 'A minimal test combo.',
        meaning: 'Basic approval.',
        examples: ['Good job 😀👍'],
        category: 'reaction',
        seoTitle: 'Minimal Combo Meaning',
        seoDescription: 'What does 😀👍 mean?',
      };
      mockGetComboBySlug.mockImplementation(() => minimalCombo);
      mockGetRelatedCombos.mockImplementation(() => []);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'minimal-combo' }) });
      render(page);

      expect(screen.getByText('😀👍')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Minimal Combo', level: 1 })).toBeInTheDocument();
    });

    test('renders links to individual emojis in the combo', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      mockGetRelatedCombos.mockImplementation(() => []);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'skull-laughing' }) });
      render(page);

      // Check for emoji links
      const emojiLinks = screen.getAllByRole('link');
      const emojiPageLinks = emojiLinks.filter(
        (link) =>
          link.getAttribute('href')?.includes('/emoji/skull') ||
          link.getAttribute('href')?.includes('/emoji/face-with-tears-of-joy')
      );
      expect(emojiPageLinks.length).toBeGreaterThan(0);
    });

    test('renders JSON-LD structured data', async () => {
      mockGetComboBySlug.mockImplementation(() => mockCombo);
      mockGetRelatedCombos.mockImplementation(() => []);

      const page = await ComboPage({ params: Promise.resolve({ slug: 'skull-laughing' }) });
      render(page);

      // Check JSON-LD script tag is present
      const script = document.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();

      // Verify JSON-LD content
      const jsonLd = JSON.parse(script!.textContent!);
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('Article');
      expect(jsonLd.headline).toBe('💀😂 Dead Laughing Combo Meaning');
      expect(jsonLd.description).toBe(
        "Something is so funny that one skull isn't enough to express how dead you are from laughing."
      );
    });
  });
});
