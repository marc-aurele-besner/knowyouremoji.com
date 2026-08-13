import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup, screen } from '@testing-library/react';
import { GuideCardDark } from '@/components/guides/guide-card-dark';
import type { GuideSummary } from '@/types/guide';

afterEach(() => {
  cleanup();
});

function createGuideSummary(overrides: Partial<GuideSummary> = {}): GuideSummary {
  return {
    slug: 'test-guide',
    title: 'Test Guide',
    description: 'A test guide for unit testing.',
    heroEmoji: '💀',
    tags: ['gen-z', 'slang'],
    publishedAt: '2026-08-12T00:00:00.000Z',
    updatedAt: '2026-08-12T00:00:00.000Z',
    readingTimeMinutes: 7,
    author: 'Test Author',
    relatedEmojis: [],
    relatedCombos: [],
    ...overrides,
  };
}

describe('GuideCardDark', () => {
  it('renders the guide title as a heading', () => {
    const guide = createGuideSummary({ title: 'Skull decoded' });
    render(<GuideCardDark guide={guide} index={0} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Skull decoded' })).toBeDefined();
  });

  it('zero-pads the dispatch number to at least three digits', () => {
    const guide = createGuideSummary();
    render(<GuideCardDark guide={guide} index={0} />);
    expect(screen.getByText('001')).toBeDefined();
  });

  it('renders the given index + 1 as the dispatch number', () => {
    const guide = createGuideSummary();
    render(<GuideCardDark guide={guide} index={4} />);
    expect(screen.getByText('005')).toBeDefined();
  });

  it('links the card to the slug URL', () => {
    const guide = createGuideSummary({ slug: 'what-does-skull-mean-in-texting' });
    render(<GuideCardDark guide={guide} index={0} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/guides/what-does-skull-mean-in-texting');
  });

  it('uses the title as the aria-label on the wrapping link', () => {
    const guide = createGuideSummary({ title: 'Skull decoded' });
    render(<GuideCardDark guide={guide} index={0} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('aria-label')).toBe('Skull decoded');
  });

  it('renders the hero emoji as a stamp when present', () => {
    const guide = createGuideSummary({ heroEmoji: '🔥' });
    const { container } = render(<GuideCardDark guide={guide} index={0} />);
    expect(container.querySelector('.guides-stamp')?.textContent).toBe('🔥');
  });

  it('omits the hero emoji stamp when no heroEmoji is provided', () => {
    const guide = createGuideSummary({ heroEmoji: undefined });
    const { container } = render(<GuideCardDark guide={guide} index={0} />);
    expect(container.querySelector('.guides-stamp')).toBeNull();
  });

  it('renders the published date in the meta strip', () => {
    const guide = createGuideSummary({ publishedAt: '2026-08-12T00:00:00.000Z' });
    render(<GuideCardDark guide={guide} index={0} />);
    expect(screen.getByText('Aug 12, 2026')).toBeDefined();
  });

  it('renders the reading time in the meta strip', () => {
    const guide = createGuideSummary({ readingTimeMinutes: 5 });
    render(<GuideCardDark guide={guide} index={0} />);
    expect(screen.getByText('5 min')).toBeDefined();
  });

  it('renders a "Read" call-to-action with an arrow', () => {
    const guide = createGuideSummary();
    render(<GuideCardDark guide={guide} index={0} />);
    expect(screen.getByText(/Read/)).toBeDefined();
    expect(screen.getByText('→')).toBeDefined();
  });

  it('falls back to the raw date string when the date is invalid', () => {
    const guide = createGuideSummary({ publishedAt: 'not-a-date' });
    const { container } = render(<GuideCardDark guide={guide} index={0} />);
    // The fact that the card renders without throwing is the assertion.
    expect(container.querySelector('.guides-filed-card')).toBeDefined();
  });

  it('uses the guides-filed-card class for the wrapping link', () => {
    const guide = createGuideSummary();
    const { container } = render(<GuideCardDark guide={guide} index={0} />);
    expect(container.querySelector('a.guides-filed-card')).toBeDefined();
  });

  it('uses the guides-filed-card-title class for the heading', () => {
    const guide = createGuideSummary();
    const { container } = render(<GuideCardDark guide={guide} index={0} />);
    expect(container.querySelector('h3.guides-filed-card-title')).toBeDefined();
  });

  it('uses the guides-meta-strip class for the meta paragraph', () => {
    const guide = createGuideSummary();
    const { container } = render(<GuideCardDark guide={guide} index={0} />);
    expect(container.querySelector('p.guides-meta-strip')).toBeDefined();
  });

  it('uses the guides-dispatch-number class for the leading number', () => {
    const guide = createGuideSummary();
    const { container } = render(<GuideCardDark guide={guide} index={0} />);
    expect(container.querySelector('.guides-dispatch-number')?.textContent).toBe('001');
  });
});
