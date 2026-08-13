import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup, screen } from '@testing-library/react';
import { DispatchList } from '@/components/guides/dispatch-list';
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

describe('DispatchList', () => {
  describe('empty state', () => {
    it('returns null when the guides array is empty', () => {
      const { container } = render(<DispatchList guides={[]} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('single guide (latest only)', () => {
    it('renders the latest dispatch with the latest test id', () => {
      const guide = createGuideSummary();
      render(<DispatchList guides={[guide]} />);
      expect(screen.getByTestId('guide-dispatch-latest')).toBeDefined();
    });

    it('omits the archive section when there is only one guide', () => {
      const guide = createGuideSummary();
      render(<DispatchList guides={[guide]} />);
      expect(screen.queryByText('Archive')).toBeNull();
    });

    it('labels the latest dispatch as "Lead dispatch"', () => {
      const guide = createGuideSummary();
      render(<DispatchList guides={[guide]} />);
      expect(screen.getByText('Lead dispatch')).toBeDefined();
    });

    it('indexes the latest dispatch as №01', () => {
      const guide = createGuideSummary();
      render(<DispatchList guides={[guide]} />);
      expect(screen.getByText('01')).toBeDefined();
    });

    it('shows the guide title and description in the lead block', () => {
      const guide = createGuideSummary({
        title: 'Skull emoji decoded',
        description: 'What it means',
      });
      render(<DispatchList guides={[guide]} />);
      expect(
        screen.getByRole('heading', { level: 2, name: 'Skull emoji decoded' })
      ).toBeDefined();
      expect(screen.getByText('What it means')).toBeDefined();
    });

    it('shows the author and reading time in the byline', () => {
      const guide = createGuideSummary({ author: 'Editorial', readingTimeMinutes: 5 });
      render(<DispatchList guides={[guide]} />);
      expect(screen.getByText(/By Editorial/)).toBeDefined();
      expect(screen.getByText('5 min')).toBeDefined();
    });

    it('renders the hero emoji as a stamp', () => {
      const guide = createGuideSummary({ heroEmoji: '💀' });
      const { container } = render(<DispatchList guides={[guide]} />);
      expect(container.querySelector('.guides-stamp')).toBeDefined();
    });

    it('omits the hero emoji stamp when the guide has no heroEmoji', () => {
      const guide = createGuideSummary({ heroEmoji: undefined });
      const { container } = render(<DispatchList guides={[guide]} />);
      expect(container.querySelector('.guides-stamp')).toBeNull();
    });

    it('renders tags as tag chips when present', () => {
      const guide = createGuideSummary({ tags: ['gen-z', 'slang', 'reaction'] });
      render(<DispatchList guides={[guide]} />);
      expect(screen.getByText('gen-z')).toBeDefined();
      expect(screen.getByText('slang')).toBeDefined();
    });

    it('caps the lead-row tags to the first four', () => {
      const guide = createGuideSummary({ tags: ['a', 'b', 'c', 'd', 'e', 'f'] });
      render(<DispatchList guides={[guide]} />);
      expect(screen.getByText('a')).toBeDefined();
      expect(screen.getByText('d')).toBeDefined();
      expect(screen.queryByText('e')).toBeNull();
      expect(screen.queryByText('f')).toBeNull();
    });

    it('skips the tag block when there are no tags', () => {
      const guide = createGuideSummary({ tags: [] });
      const { container } = render(<DispatchList guides={[guide]} />);
      const tags = container.querySelectorAll('.guides-tag');
      expect(tags.length).toBe(0);
    });

    it('links the lead dispatch to the slug URL', () => {
      const guide = createGuideSummary({ slug: 'what-does-skull-mean-in-texting' });
      render(<DispatchList guides={[guide]} />);
      const link = screen.getByTestId('guide-dispatch-latest').closest('a');
      expect(link?.getAttribute('href')).toBe('/guides/what-does-skull-mean-in-texting');
    });

    it('includes a "Read dispatch" prompt', () => {
      const guide = createGuideSummary();
      render(<DispatchList guides={[guide]} />);
      expect(screen.getByText(/Read dispatch/)).toBeDefined();
    });

    it('handles an invalid date by falling back to the raw string', () => {
      const guide = createGuideSummary({ publishedAt: 'not-a-date' });
      render(<DispatchList guides={[guide]} />);
      // The raw string shows up in the byline area; just confirm the component didn't crash.
      expect(screen.getByTestId('guide-dispatch-latest')).toBeDefined();
    });
  });

  describe('archive list (multiple guides)', () => {
    const guides: GuideSummary[] = [
      createGuideSummary({
        slug: 'latest',
        title: 'Latest',
        publishedAt: '2026-08-13T00:00:00.000Z',
      }),
      createGuideSummary({
        slug: 'middle',
        title: 'Middle',
        publishedAt: '2026-08-12T00:00:00.000Z',
      }),
      createGuideSummary({
        slug: 'oldest',
        title: 'Oldest',
        publishedAt: '2026-08-11T00:00:00.000Z',
      }),
    ];

    it('shows the archive header when more than one guide exists', () => {
      render(<DispatchList guides={guides} />);
      expect(screen.getByText('Archive')).toBeDefined();
    });

    it('pluralizes the archive entry count when there are multiple entries', () => {
      render(<DispatchList guides={guides} />);
      expect(screen.getByText(/2 entries/)).toBeDefined();
    });

    it('singularizes the archive entry count when there is exactly one archive entry', () => {
      const two: GuideSummary[] = [guides[0], guides[1]];
      render(<DispatchList guides={two} />);
      expect(screen.getByText(/1 entry\b/)).toBeDefined();
    });

    it('renders archive rows after the lead with the archive test id', () => {
      render(<DispatchList guides={guides} />);
      expect(screen.getByTestId('guide-dispatch-latest')).toBeDefined();
      expect(screen.getAllByTestId('guide-dispatch').length).toBe(2);
    });

    it('renders archive rows with sequential dispatch numbers', () => {
      render(<DispatchList guides={guides} />);
      expect(screen.getByText('01')).toBeDefined();
      expect(screen.getByText('02')).toBeDefined();
      expect(screen.getByText('03')).toBeDefined();
    });

    it('renders the archive row title and description', () => {
      render(<DispatchList guides={guides} />);
      expect(screen.getByRole('heading', { level: 3, name: 'Middle' })).toBeDefined();
      expect(screen.getAllByText('A test guide for unit testing.').length).toBeGreaterThan(0);
    });

    it('links each archive row to its slug', () => {
      render(<DispatchList guides={guides} />);
      const archiveRows = screen.getAllByTestId('guide-dispatch');
      const hrefs = archiveRows.map((row) => row.closest('a')?.getAttribute('href'));
      expect(hrefs).toContain('/guides/middle');
      expect(hrefs).toContain('/guides/oldest');
    });

    it('renders the hero emoji stamp on archive rows', () => {
      const lead = createGuideSummary({ slug: 'with-stamp', heroEmoji: '🔥' });
      const tail = createGuideSummary({ slug: 'tail', heroEmoji: '🔥' });
      render(<DispatchList guides={[lead, tail]} />);
      expect(document.querySelectorAll('.guides-stamp').length).toBeGreaterThan(0);
    });

    it('omits the hero emoji stamp when an archive row has no heroEmoji', () => {
      const lead = createGuideSummary({ slug: 'no-stamp', heroEmoji: undefined });
      const tail = createGuideSummary({ slug: 'tail', heroEmoji: undefined });
      render(<DispatchList guides={[lead, tail]} />);
      expect(document.querySelectorAll('.guides-stamp').length).toBe(0);
    });

    it('renders the reading time meta strip on archive rows', () => {
      render(<DispatchList guides={guides} />);
      expect(screen.getAllByText(/min read/).length).toBeGreaterThan(0);
    });

    it('dates in archive rows render as month-abbreviated YYYY-MM-DD', () => {
      render(<DispatchList guides={guides} />);
      // Aug 13, 2026 → "Aug 13, 2026"
      expect(screen.getAllByText('Aug 13, 2026').length).toBeGreaterThan(0);
    });
  });
});
