import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { HomePageContent } from '@/components/home/home-page-content';
import { createEmojiSummary } from '../../../utils/factories/emoji.factory';
import { createEmojiComboSummary } from '../../../utils/factories/combo.factory';
import type { GuideSummary } from '@/types/guide';

const mockGuide: GuideSummary = {
  slug: 'test-guide',
  title: 'The Test Emoji Guide',
  description: 'A guide used to exercise the homepage editorial section.',
  heroEmoji: '🧪',
  tags: ['testing'],
  publishedAt: '2025-01-01',
  updatedAt: '2025-01-02',
  readingTimeMinutes: 4,
  author: 'Test Author',
};

afterEach(() => {
  cleanup();
});

describe('HomePageContent', () => {
  describe('empty states', () => {
    it('renders the empty state when there are no emojis', () => {
      render(
        <HomePageContent
          emojiSummaries={[]}
          comboSummaries={[createEmojiComboSummary()]}
          guideSummaries={[]}
        />
      );

      expect(screen.getByText('No emojis available yet.')).toBeInTheDocument();
      expect(screen.queryByTestId('emoji-card')).not.toBeInTheDocument();
    });

    it('renders the empty state when there are no combos', () => {
      render(
        <HomePageContent
          emojiSummaries={[createEmojiSummary()]}
          comboSummaries={[]}
          guideSummaries={[]}
        />
      );

      expect(screen.getByText('No combos available yet.')).toBeInTheDocument();
      expect(screen.queryByTestId('combo-card')).not.toBeInTheDocument();
    });
  });

  describe('sections', () => {
    it('renders the hero headline', () => {
      render(<HomePageContent emojiSummaries={[]} comboSummaries={[]} guideSummaries={[]} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Emoji');
    });

    it('renders a card for every emoji summary', () => {
      const emojiSummaries = [createEmojiSummary(), createEmojiSummary()];

      render(
        <HomePageContent emojiSummaries={emojiSummaries} comboSummaries={[]} guideSummaries={[]} />
      );

      expect(screen.getAllByTestId('emoji-card')).toHaveLength(2);
    });

    it('renders a card for every combo summary', () => {
      const comboSummaries = [createEmojiComboSummary(), createEmojiComboSummary()];

      render(
        <HomePageContent emojiSummaries={[]} comboSummaries={comboSummaries} guideSummaries={[]} />
      );

      expect(screen.getAllByTestId('combo-card')).toHaveLength(2);
    });

    it('renders the latest guides section when guides are provided', () => {
      render(
        <HomePageContent emojiSummaries={[]} comboSummaries={[]} guideSummaries={[mockGuide]} />
      );

      expect(screen.getByRole('heading', { name: 'Latest Guides', level: 2 })).toBeInTheDocument();
      expect(screen.getAllByTestId('guide-card')).toHaveLength(1);
    });

    it('does not render the latest guides section when there are no guides', () => {
      render(<HomePageContent emojiSummaries={[]} comboSummaries={[]} guideSummaries={[]} />);

      expect(
        screen.queryByRole('heading', { name: 'Latest Guides', level: 2 })
      ).not.toBeInTheDocument();
    });
  });
});
