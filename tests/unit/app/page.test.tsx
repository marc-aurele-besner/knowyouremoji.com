import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import type { EmojiSummary } from '@/types/emoji';
import type { EmojiComboSummary } from '@/types/combo';

// Mock emoji data
const mockEmojiSummaries: EmojiSummary[] = [
  {
    slug: 'skull',
    character: '💀',
    name: 'Skull',
    category: 'faces',
    tldr: "Usually means 'I'm dead' from laughing",
  },
  {
    slug: 'fire',
    character: '🔥',
    name: 'Fire',
    category: 'objects',
    tldr: 'Something is hot, exciting, or impressive',
  },
  {
    slug: 'heart',
    character: '❤️',
    name: 'Red Heart',
    category: 'symbols',
    tldr: 'Love and affection',
  },
  {
    slug: 'crying-laughing',
    character: '😂',
    name: 'Face with Tears of Joy',
    category: 'faces',
    tldr: 'Something is extremely funny',
  },
  {
    slug: 'thumbs-up',
    character: '👍',
    name: 'Thumbs Up',
    category: 'people',
    tldr: 'Approval, agreement, or acknowledgment',
  },
  {
    slug: 'sparkles',
    character: '✨',
    name: 'Sparkles',
    category: 'objects',
    tldr: 'Something is special, magical, or exciting',
  },
];

// Mock combo data
const mockComboSummaries: EmojiComboSummary[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'Something is so funny you are dead',
    category: 'humor',
  },
  {
    slug: 'fire-100',
    combo: '🔥💯',
    name: 'Fire 100',
    meaning: 'Something is absolutely perfect',
    category: 'celebration',
  },
  {
    slug: 'eyes-tea',
    combo: '👀☕',
    name: 'Spilling Tea',
    meaning: 'Watching drama unfold or sharing gossip',
    category: 'sarcasm',
  },
  {
    slug: 'pleading-sparkles',
    combo: '🥺✨',
    name: 'Pleading Sparkles',
    meaning: 'Cute begging or soft request',
    category: 'emotion',
  },
];

// Mock the emoji-data module
const mockGetEmojiSummaries = mock<() => EmojiSummary[]>(() => mockEmojiSummaries);
const mockGetEmojiCount = mock<() => number>(() => mockEmojiSummaries.length);

mock.module('@/lib/emoji-data', () => ({
  getEmojiSummaries: mockGetEmojiSummaries,
  getEmojiCount: mockGetEmojiCount,
}));

// Mock the combo-data module
const mockGetComboSummaries = mock<() => EmojiComboSummary[]>(() => mockComboSummaries);
const mockGetComboCount = mock<() => number>(() => mockComboSummaries.length);

mock.module('@/lib/combo-data', () => ({
  getComboSummaries: mockGetComboSummaries,
  getComboCount: mockGetComboCount,
}));

describe('HomePage', () => {
  beforeEach(() => {
    mockGetEmojiSummaries.mockReset();
    mockGetComboSummaries.mockReset();
    mockGetEmojiCount.mockReset();
    mockGetComboCount.mockReset();
    mockGetEmojiSummaries.mockImplementation(() => mockEmojiSummaries);
    mockGetComboSummaries.mockImplementation(() => mockComboSummaries);
    mockGetEmojiCount.mockImplementation(() => mockEmojiSummaries.length);
    mockGetComboCount.mockImplementation(() => mockComboSummaries.length);
  });

  afterEach(() => {
    mockGetEmojiSummaries.mockReset();
    mockGetComboSummaries.mockReset();
    mockGetEmojiCount.mockReset();
    mockGetComboCount.mockReset();
  });

  describe('Hero section', () => {
    test('renders main headline', () => {
      render(<HomePage />);

      // Check for main heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('Emoji');
    });

    test('renders descriptive subheadline', () => {
      render(<HomePage />);

      // Check for description text about emoji meanings
      expect(screen.getByText(/real meaning/i)).toBeInTheDocument();
    });
  });

  describe('Features section', () => {
    test('renders features heading', () => {
      render(<HomePage />);

      // Check for features section heading
      expect(screen.getByRole('heading', { name: 'Features', level: 2 })).toBeInTheDocument();
    });

    test('displays key platform features', () => {
      render(<HomePage />);

      // Check for context-aware feature (heading)
      expect(screen.getByRole('heading', { name: /Context-Aware/i })).toBeInTheDocument();

      // Check for generational differences feature (heading)
      expect(screen.getByRole('heading', { name: /Generation/i })).toBeInTheDocument();

      // Check for AI interpreter feature (heading)
      expect(screen.getByRole('heading', { name: /AI Interpret/i })).toBeInTheDocument();
    });
  });

  describe('CTA section', () => {
    test('renders interpreter CTA link', () => {
      render(<HomePage />);

      // Check for link to interpreter - there are multiple, check that at least one exists with correct href
      const ctaLinks = screen.getAllByRole('link', { name: /interpret/i });
      expect(ctaLinks.length).toBeGreaterThan(0);
      expect(ctaLinks.some((link) => link.getAttribute('href') === '/interpreter')).toBe(true);
    });

    test('renders browse emojis link', () => {
      render(<HomePage />);

      // Check for link to emoji browsing
      const browseLinks = screen.getAllByRole('link', { name: /browse|view all emoji/i });
      expect(browseLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Sample emojis section', () => {
    test('renders sample emojis section heading', () => {
      render(<HomePage />);

      // Use exact text match to distinguish from "Popular Emoji Combos"
      expect(screen.getByRole('heading', { name: 'Popular Emojis', level: 2 })).toBeInTheDocument();
    });

    test('displays emoji cards with character and name', () => {
      render(<HomePage />);

      // Check that emoji characters are displayed
      expect(screen.getByText('💀')).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();

      // Check that emoji names are displayed
      expect(screen.getByText('Skull')).toBeInTheDocument();
      expect(screen.getByText('Fire')).toBeInTheDocument();
    });

    test('emoji cards link to detail pages', () => {
      render(<HomePage />);

      // Check for links to emoji detail pages - get all and filter
      const allLinks = screen.getAllByRole('link');
      const skullLink = allLinks.find(
        (link) =>
          link.getAttribute('aria-label') === 'Skull' &&
          link.getAttribute('href') === '/emoji/skull'
      );
      expect(skullLink).toBeDefined();

      const fireLink = allLinks.find(
        (link) =>
          link.getAttribute('aria-label') === 'Fire' && link.getAttribute('href') === '/emoji/fire'
      );
      expect(fireLink).toBeDefined();
    });

    test('limits displayed emojis to a reasonable number', () => {
      render(<HomePage />);

      // Should show max 6 emojis on homepage
      const emojiCards = screen.getAllByTestId('emoji-card');
      expect(emojiCards.length).toBeLessThanOrEqual(6);
    });
  });

  describe('Featured combos section', () => {
    test('renders featured combos section heading', () => {
      render(<HomePage />);

      expect(
        screen.getByRole('heading', { name: /popular emoji combo/i, level: 2 })
      ).toBeInTheDocument();
    });

    test('displays combo cards with emoji combination', () => {
      render(<HomePage />);

      // Check that combo strings are displayed
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('🔥💯')).toBeInTheDocument();
    });

    test('displays combo names and meanings', () => {
      render(<HomePage />);

      // Check that combo names are displayed
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();

      // Check that meanings are displayed
      expect(screen.getByText(/so funny/i)).toBeInTheDocument();
    });

    test('combo cards link to detail pages', () => {
      render(<HomePage />);

      // Check for links to combo detail pages
      const skullLaughingLink = screen.getByRole('link', { name: /dead laughing/i });
      expect(skullLaughingLink).toHaveAttribute('href', '/combo/skull-laughing');
    });

    test('limits displayed combos to a reasonable number', () => {
      render(<HomePage />);

      // Should show max 4 combos on homepage
      const comboCards = screen.getAllByTestId('combo-card');
      expect(comboCards.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Empty states', () => {
    test('handles empty emoji data gracefully', () => {
      mockGetEmojiSummaries.mockImplementation(() => []);
      mockGetEmojiCount.mockImplementation(() => 0);

      render(<HomePage />);

      // Should still render the page without crashing
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('handles empty combo data gracefully', () => {
      mockGetComboSummaries.mockImplementation(() => []);
      mockGetComboCount.mockImplementation(() => 0);

      render(<HomePage />);

      // Should still render the page without crashing
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<HomePage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    test('links have descriptive text', () => {
      render(<HomePage />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // Each link should have meaningful text content
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    test('main content is wrapped in main landmark', () => {
      render(<HomePage />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('SEO elements', () => {
    test('page is structured for SEO', () => {
      render(<HomePage />);

      // Check that main content areas are present
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Check that important keywords are present in content
      const pageContent = document.body.textContent;
      expect(pageContent).toContain('emoji');
      expect(pageContent?.toLowerCase()).toContain('meaning');
    });
  });
});
