import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(() => {}), replace: mock(() => {}), prefetch: mock(() => {}) }),
  usePathname: () => '/',
}));

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

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'What does that emoji actually mean?'
      );
    });

    it('renders the omnibox and the interpreter CTA band', () => {
      render(<HomePageContent emojiSummaries={[]} comboSummaries={[]} guideSummaries={[]} />);

      expect(screen.getByRole('combobox', { name: /search an emoji/i })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: /got a text you can.t read/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /open the interpreter/i })).toHaveAttribute(
        'href',
        '/interpreter'
      );
    });

    it('links the context strip to the context hubs', () => {
      render(<HomePageContent emojiSummaries={[]} comboSummaries={[]} guideSummaries={[]} />);

      const hrefs = screen.getAllByTestId('context-card').map((a) => a.getAttribute('href'));
      expect(hrefs).toEqual([
        '/emoji/context/SLANG',
        '/emoji/context/DATING',
        '/emoji/context/WORK',
        '/emoji/context/IRONIC',
      ]);
    });

    it('shows the emoji name and tldr on trending cards', () => {
      const emoji = createEmojiSummary({ name: 'Test Skull', tldr: 'Means I am dead' });
      render(<HomePageContent emojiSummaries={[emoji]} comboSummaries={[]} guideSummaries={[]} />);

      const card = screen.getByTestId('emoji-card');
      expect(card).toHaveTextContent('Test Skull');
      expect(card).toHaveTextContent('Means I am dead');
      expect(card).toHaveAttribute('href', `/emoji/${emoji.slug}`);
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

      expect(screen.getByRole('heading', { name: 'Latest guides', level: 2 })).toBeInTheDocument();
      expect(screen.getAllByTestId('guide-card')).toHaveLength(1);
    });

    it('does not render the latest guides section when there are no guides', () => {
      render(<HomePageContent emojiSummaries={[]} comboSummaries={[]} guideSummaries={[]} />);

      expect(
        screen.queryByRole('heading', { name: 'Latest guides', level: 2 })
      ).not.toBeInTheDocument();
    });
  });
});
