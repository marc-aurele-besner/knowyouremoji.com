/**
 * Component tests for the editorial /guides index list.
 *
 * Verifies the featured-card + guide-card grid composition and the empty
 * state. Server component rendered through @testing-library/react (the
 * list has no client hooks).
 */

import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { GuidesIndexList } from '@/components/guides/guides-index-list';
import type { GuideSummary } from '@/types/guide';

function makeGuide(overrides: Partial<GuideSummary> = {}): GuideSummary {
  return {
    slug: overrides.slug ?? 'what-does-skull-mean-in-texting',
    title: overrides.title ?? 'What does 💀 mean in texting?',
    description:
      overrides.description ??
      'A short description for the test that lives long enough to exercise the truncate helper path. Yes, this is intentionally long.',
    heroEmoji: overrides.heroEmoji ?? '💀',
    tags: overrides.tags ?? ['gen-z', 'slang'],
    publishedAt: overrides.publishedAt ?? '2026-08-12',
    updatedAt: overrides.updatedAt ?? '2026-08-12',
    readingTimeMinutes: overrides.readingTimeMinutes ?? 7,
    author: overrides.author ?? 'KnowYourEmoji Editorial',
    relatedEmojis: overrides.relatedEmojis ?? ['skull'],
    relatedCombos: overrides.relatedCombos ?? ['skull-laughing'],
    seoTitle: overrides.seoTitle,
    seoDescription: overrides.seoDescription,
  };
}

describe('GuidesIndexList', () => {
  afterEach(cleanup);

  it('renders the featured spread for the freshest guide', () => {
    const { getByTestId, container } = render(
      <GuidesIndexList guides={[makeGuide({ slug: 'featured' }), makeGuide({ slug: 'second' })]} />
    );

    expect(getByTestId('guides-index-list')).toBeTruthy();
    const featuredTitle = getByTestId('guides-featured-title');
    expect(featuredTitle.getAttribute('href')).toBe('/guides/featured');

    // Featured guide pulls hero emoji onto the page.
    expect(container.textContent).toContain('💀');

    // Heading at the section boundary + featured kicker and read link.
    expect(container.textContent).toContain('All guides');
    expect(container.textContent).toContain('Latest · gen-z');
    expect(container.textContent).toContain('Read the guide');
  });

  it('renders the featured card without emoji or tag kicker when absent', () => {
    const { container } = render(
      <GuidesIndexList
        guides={[makeGuide({ slug: 'plain', title: 'Plain guide', heroEmoji: '', tags: [] })]}
      />
    );
    expect(container.textContent).not.toContain('💀');
    expect(container.textContent).toContain('Latest');
    expect(container.textContent).not.toContain('Latest ·');
  });

  it('renders one guide card per non-featured guide', () => {
    const guides = [
      makeGuide({ slug: 'featured' }),
      makeGuide({ slug: 'second', title: 'Second guide' }),
      makeGuide({ slug: 'third', title: 'Third guide' }),
    ];
    const { getAllByTestId, container } = render(<GuidesIndexList guides={guides} />);

    const rows = getAllByTestId('guides-dispatch-row');
    expect(rows).toHaveLength(2);

    // Dispatch #1 in this index is the second overall guide → index 2.
    expect(rows[0].getAttribute('data-slug')).toBe('second');
    expect(rows[1].getAttribute('data-slug')).toBe('third');

    // Cards carry serif titles and a "N more" count.
    expect(container.textContent).toContain('Second guide');
    expect(container.textContent).toContain('2 more');
  });

  it('clamps long descriptions in guide cards', () => {
    const longDescription = `${'a'.repeat(220)} extra padding to exceed truncation length`;
    const guides = [
      makeGuide({ slug: 'featured' }),
      makeGuide({ slug: 'second', description: longDescription }),
    ];
    const { getByText } = render(<GuidesIndexList guides={guides} />);

    // Full description stays in the DOM (SEO) but is visually clamped.
    expect(getByText(longDescription).className).toContain('line-clamp-3');
  });

  it('renders a friendly empty state when no guides are passed', () => {
    const { getByTestId, container } = render(<GuidesIndexList guides={[]} />);

    expect(getByTestId('guides-empty')).toBeTruthy();
    expect(container.textContent).toContain('No guides yet.');
    // Featured/row testids should not appear in the empty branch.
    expect(container.querySelector('[data-testid="guides-featured-title"]')).toBeNull();
    expect(container.querySelector('[data-testid="guides-dispatch-row"]')).toBeNull();
  });

  it('omits the dispatch section when only the featured guide exists', () => {
    const { container } = render(<GuidesIndexList guides={[makeGuide({ slug: 'solo' })]} />);

    expect(container.querySelector('[data-testid="guides-featured-title"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="guides-dispatch-row"]')).toBeNull();
    expect(container.textContent).not.toContain('All guides');
  });
});
