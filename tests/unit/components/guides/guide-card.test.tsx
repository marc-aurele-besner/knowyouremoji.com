import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { GuideCard } from '@/components/guides/guide-card';
import type { GuideSummary } from '@/types/guide';

afterEach(() => {
  cleanup();
});

const guide: GuideSummary = {
  slug: 'skull-guide',
  title: 'What does 💀 mean?',
  description: 'A guide to the skull.',
  heroEmoji: '💀',
  tags: ['gen-z', 'slang'],
  publishedAt: '2026-08-12T12:00:00Z',
  updatedAt: '2026-08-12T12:00:00Z',
  readingTimeMinutes: 7,
  author: 'KnowYourEmoji Editorial',
};

describe('GuideCard', () => {
  it('renders a single link card with serif title, dek and meta', () => {
    render(<GuideCard guide={guide} className="extra" />);
    const link = screen.getByRole('link', { name: guide.title });
    expect(link).toHaveAttribute('href', '/guides/skull-guide');
    expect(link).toHaveAttribute('data-testid', 'guide-card');
    expect(link).toHaveAttribute('data-slug', 'skull-guide');
    expect(link).toHaveClass('extra');
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('font-serif');
    expect(screen.getByText('A guide to the skull.')).toHaveClass('line-clamp-3');
    expect(screen.getByText(/Aug 12, 2026 · 7 min read · gen-z/)).toBeInTheDocument();
  });

  it('supports a custom test id and omits emoji/tag when absent', () => {
    const { container } = render(
      <GuideCard guide={{ ...guide, heroEmoji: undefined, tags: [] }} testId="custom-card" />
    );
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    expect(container.textContent).not.toContain('gen-z');
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('falls back to the raw date string when it cannot be parsed', () => {
    render(<GuideCard guide={{ ...guide, publishedAt: 'someday' }} />);
    expect(screen.getByText(/someday · 7 min read/)).toBeInTheDocument();
  });
});
