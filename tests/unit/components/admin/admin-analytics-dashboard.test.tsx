import { describe, it, expect, afterEach, spyOn } from 'bun:test';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import {
  AdminAnalyticsDashboard,
  type AdminAnalyticsDashboardProps,
} from '@/components/admin/admin-analytics-dashboard';

const summaries = [
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'travel', tldr: 'hot' },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'love' },
  { slug: 'smile', character: '😀', name: 'Grinning Face', category: 'faces', tldr: 'happy' },
];

const manySummaries = Array.from({ length: 60 }, (_, index) => ({
  slug: `emoji-${index}`,
  character: '😀',
  name: `Emoji ${index}`,
  category: 'faces',
  tldr: 'many',
}));

function buildProps(
  overrides: Partial<AdminAnalyticsDashboardProps> = {}
): AdminAnalyticsDashboardProps {
  return {
    overview: {
      totalViews: 150,
      trackedEmojis: 2,
      catalogSize: 3,
      topSlug: 'fire',
      topViews: 120,
      viewsLast7Days: 50,
      viewsLast30Days: 150,
      lastUpdatedAt: '2026-08-01T12:00:00.000Z',
    },
    topEmojis: [
      { slug: 'fire', views: 120, lastViewedAt: '2026-08-01T12:00:00.000Z', emoji: summaries[0] },
      { slug: 'heart', views: 30, lastViewedAt: '2026-07-25T08:00:00.000Z', emoji: summaries[1] },
    ],
    leastViewed: [
      { slug: 'heart', views: 30, lastViewedAt: '2026-07-25T08:00:00.000Z', emoji: summaries[1] },
      { slug: 'fire', views: 120, lastViewedAt: '2026-08-01T12:00:00.000Z', emoji: summaries[0] },
    ],
    allEmojis: summaries.map((emoji) => ({
      slug: emoji.slug,
      views: emoji.slug === 'fire' ? 120 : emoji.slug === 'heart' ? 30 : 0,
      lastViewedAt: emoji.slug === 'fire' ? '2026-08-01T12:00:00.000Z' : null,
      emoji,
    })),
    isLive: true,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

function getAllEmojiNames(): string[] {
  const heading = screen.getByRole('heading', { name: /^all emojis$/i });
  const section = heading.closest('section');
  const rows = within(section as HTMLElement).getAllByRole('row');
  return rows.slice(1).map((row) => within(row).getByRole('link').textContent ?? '');
}

describe('AdminAnalyticsDashboard', () => {
  it('renders the analytics heading', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    expect(screen.getByRole('heading', { name: /^analytics$/i, level: 1 })).toBeInTheDocument();
  });

  it('displays total views in the summary card', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    expect(screen.getByTestId('total-views')).toHaveTextContent('150');
  });

  it('shows the live indicator when database data is available', () => {
    render(<AdminAnalyticsDashboard {...buildProps({ isLive: true })} />);
    expect(screen.queryByText(/database unavailable/i)).not.toBeInTheDocument();
    expect(screen.getByText(/last view recorded/i)).toBeInTheDocument();
  });

  it('shows the database-unavailable banner when not live', () => {
    render(
      <AdminAnalyticsDashboard
        {...buildProps({
          isLive: false,
          overview: {
            totalViews: 0,
            trackedEmojis: 0,
            catalogSize: 3,
            topSlug: null,
            topViews: 0,
            viewsLast7Days: 0,
            viewsLast30Days: 0,
            lastUpdatedAt: null,
          },
        })}
      />
    );
    expect(screen.getByText(/database unavailable/i)).toBeInTheDocument();
  });

  it('renders the top emoji rank rows', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    const rows = screen.getAllByTestId('popular-row');
    expect(rows).toHaveLength(2);
    const views = screen.getAllByTestId('popular-views').map((el) => el.textContent);
    expect(views).toEqual(['120', '30']);
  });

  it('shows the empty-state message when no top emojis exist', () => {
    render(<AdminAnalyticsDashboard {...buildProps({ topEmojis: [], isLive: false })} />);
    expect(screen.getByText(/no view data yet/i)).toBeInTheDocument();
  });

  it('falls back to the slug when no emoji summary is found', () => {
    render(
      <AdminAnalyticsDashboard
        {...buildProps({
          topEmojis: [
            {
              slug: 'unknown-slug',
              views: 7,
              lastViewedAt: null,
              emoji: null,
            },
          ],
        })}
      />
    );
    const row = screen.getByTestId('popular-row');
    expect(within(row).getByText('unknown-slug')).toBeInTheDocument();
    expect(within(row).getByText('❔')).toBeInTheDocument();
  });

  it('filters the full table by search query', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    const search = screen.getByRole('searchbox', { name: /search emojis/i });
    fireEvent.change(search, { target: { value: 'fire' } });
    // "All Emojis" table: only one row should match (Fire emoji)
    const allEmojisHeading = screen.getByRole('heading', { name: /^all emojis$/i });
    const allSection = allEmojisHeading.closest('section');
    expect(allSection).not.toBeNull();
    const rows = within(allSection as HTMLElement).getAllByRole('row');
    // 1 header + 1 data row
    expect(rows.length).toBe(2);
  });

  it('switches sort order when buttons are clicked', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    const ascButton = screen.getByRole('button', { name: /least viewed/i });
    fireEvent.click(ascButton);
    expect(ascButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the empty-state when filtering returns no results', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    const search = screen.getByRole('searchbox', { name: /search emojis/i });
    fireEvent.change(search, { target: { value: 'no-such-emoji' } });
    expect(screen.getByText(/no emojis match the current filter/i)).toBeInTheDocument();
  });

  it('keeps all tables visible when search has no matches', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    expect(screen.getByText(/most popular emojis/i)).toBeInTheDocument();
    expect(screen.getByText(/lowest traffic/i)).toBeInTheDocument();
  });

  it('shows no top-emoji card content when topSlug is null', () => {
    render(
      <AdminAnalyticsDashboard
        {...buildProps({
          overview: {
            ...buildProps().overview,
            topSlug: null,
            topViews: 0,
          },
          topEmojis: [],
        })}
      />
    );
    expect(screen.getByText(/no views recorded yet/i)).toBeInTheDocument();
  });

  it('sorts the all-emojis table by name ascending', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    const ascButton = screen.getByRole('button', { name: /a\s*→\s*z/i });
    fireEvent.click(ascButton);
    expect(ascButton).toHaveAttribute('aria-pressed', 'true');
    expect(getAllEmojiNames()).toEqual(['Fire', 'Grinning Face', 'Red Heart']);
  });

  it('sorts the all-emojis table by name descending', () => {
    render(<AdminAnalyticsDashboard {...buildProps()} />);
    const descButton = screen.getByRole('button', { name: /z\s*→\s*a/i });
    fireEvent.click(descButton);
    expect(descButton).toHaveAttribute('aria-pressed', 'true');
    expect(getAllEmojiNames()).toEqual(['Red Heart', 'Grinning Face', 'Fire']);
  });

  it('reports 0% coverage when the catalog is empty', () => {
    render(
      <AdminAnalyticsDashboard
        {...buildProps({
          overview: {
            ...buildProps().overview,
            catalogSize: 0,
            trackedEmojis: 0,
          },
        })}
      />
    );
    expect(screen.getByText(/0% have recorded views/i)).toBeInTheDocument();
    expect(screen.getByTestId('coverage-bar')).toHaveStyle({ width: '0%' });
  });

  it('shows the empty state when there are no least-viewed emojis', () => {
    render(<AdminAnalyticsDashboard {...buildProps({ leastViewed: [] })} />);
    expect(screen.getByText(/no tracked emojis with low traffic yet/i)).toBeInTheDocument();
  });

  it('shows a truncation notice when more than 50 emojis are listed', () => {
    render(
      <AdminAnalyticsDashboard
        {...buildProps({
          allEmojis: manySummaries.map((emoji) => ({
            slug: emoji.slug,
            views: 0,
            lastViewedAt: null,
            emoji,
          })),
        })}
      />
    );
    expect(screen.getByText(/showing the first 50 results/i)).toBeInTheDocument();
  });

  it('falls back to the raw timestamp when the date cannot be formatted', () => {
    const toLocaleString = spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => {
      throw new RangeError('Invalid time value');
    });
    try {
      render(
        <AdminAnalyticsDashboard
          {...buildProps({
            overview: {
              ...buildProps().overview,
              lastUpdatedAt: '2020-01-01T00:00:00.000Z',
            },
          })}
        />
      );
      expect(screen.getByText(/last view recorded/i)).toHaveTextContent('2020-01-01T00:00:00.000Z');
    } finally {
      toLocaleString.mockRestore();
    }
  });
});
