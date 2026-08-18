import { describe, it, expect, afterEach } from 'bun:test';
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
});
