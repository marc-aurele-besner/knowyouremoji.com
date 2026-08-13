/**
 * Component tests for the editorial /guides index list.
 *
 * Verifies the featured-spread + dispatch-rows composition and the empty
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

    // Heading at the section boundary ("The dispatches").
    expect(container.textContent).toContain('The dispatches');
    expect(container.textContent).toContain('Read the dispatch');
  });

  it('renders one dispatch row per non-featured guide with a padded serial', () => {
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

    // Zero-padded serial numbers: № 002, № 003.
    expect(container.textContent).toContain('№');
    expect(container.textContent).toContain('002');
    expect(container.textContent).toContain('003');
  });

  it('truncates long descriptions in dispatch rows', () => {
    const longDescription = `${'a'.repeat(220)} extra padding to exceed truncation length`;
    const guides = [
      makeGuide({ slug: 'featured' }),
      makeGuide({ slug: 'second', description: longDescription }),
    ];
    const { container } = render(<GuidesIndexList guides={guides} />);

    // Ellipsis indicates truncation; full description should not appear.
    expect(container.textContent).toContain('…');
    expect(container.textContent).not.toContain('extra padding to exceed truncation length');
  });

  it('renders a friendly empty state when no guides are passed', () => {
    const { getByTestId, container } = render(<GuidesIndexList guides={[]} />);

    expect(getByTestId('guides-empty')).toBeTruthy();
    expect(container.textContent).toContain('No dispatches yet.');
    // Featured/row testids should not appear in the empty branch.
    expect(container.querySelector('[data-testid="guides-featured-title"]')).toBeNull();
    expect(container.querySelector('[data-testid="guides-dispatch-row"]')).toBeNull();
  });

  it('omits the dispatch section when only the featured guide exists', () => {
    const { container } = render(<GuidesIndexList guides={[makeGuide({ slug: 'solo' })]} />);

    expect(container.querySelector('[data-testid="guides-featured-title"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="guides-dispatch-row"]')).toBeNull();
    expect(container.textContent).not.toContain('The dispatches');
  });
});
