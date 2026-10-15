import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import {
  BookBannerStats,
  formatClickRate,
  type BookBannerStatsData,
} from '@/components/admin/book-banner-stats';

afterEach(() => {
  cleanup();
});

const stats: BookBannerStatsData = {
  totals: { views: 1200, clicks: 36 },
  daily: [
    { day: '2026-10-13', views: 40, clicks: 2 },
    { day: '2026-10-14', views: 60, clicks: 0 },
    { day: '2026-10-15', views: 0, clicks: 0 },
  ],
  byBanner: [
    { banner: 'book-cover-01', views: 700, clicks: 21 },
    { banner: 'book-cover-02', views: 500, clicks: 15 },
  ],
};

describe('formatClickRate', () => {
  it('returns a dash when there are no views', () => {
    expect(formatClickRate({ views: 0, clicks: 0 })).toBe('—');
  });

  it('formats the click-through rate as a percentage', () => {
    expect(formatClickRate({ views: 200, clicks: 3 })).toBe('1.5%');
  });
});

describe('BookBannerStats', () => {
  it('renders all-time totals and click-through rate', () => {
    render(<BookBannerStats stats={stats} />);
    expect(screen.getByTestId('banner-total-views')).toHaveTextContent('1,200');
    expect(screen.getByTestId('banner-total-clicks')).toHaveTextContent('36');
    expect(screen.getByTestId('banner-ctr')).toHaveTextContent('3.0%');
  });

  it('renders totals for the trailing window', () => {
    render(<BookBannerStats stats={stats} />);
    expect(screen.getByText('100 in this window')).toBeInTheDocument();
    expect(screen.getByText('2 in this window')).toBeInTheDocument();
    expect(screen.getByText('2.0% in this window')).toBeInTheDocument();
    expect(screen.getByText('Last 3 days')).toBeInTheDocument();
  });

  it('renders one bar group per day', () => {
    render(<BookBannerStats stats={stats} />);
    const chart = screen.getByRole('list', { name: 'Daily banner activity' });
    expect(chart.querySelectorAll('li')).toHaveLength(3);
    expect(screen.getByText('Oct 13: 40 views, 2 clicks')).toBeInTheDocument();
    expect(screen.getByText('Oct 13')).toBeInTheDocument();
    expect(screen.getByText('Oct 15')).toBeInTheDocument();
  });

  it('renders per-banner rows', () => {
    render(<BookBannerStats stats={stats} />);
    expect(screen.getByText('book-cover-01')).toBeInTheDocument();
    expect(screen.getByText('book-cover-02')).toBeInTheDocument();
  });

  it('renders an empty state with no activity', () => {
    render(
      <BookBannerStats
        stats={{
          totals: { views: 0, clicks: 0 },
          daily: [{ day: '2026-10-15', views: 0, clicks: 0 }],
          byBanner: [],
        }}
      />
    );
    expect(screen.getByText('No banner activity recorded in this window yet.')).toBeInTheDocument();
    expect(screen.queryByText('By banner (all time)')).not.toBeInTheDocument();
    expect(screen.getByTestId('banner-ctr')).toHaveTextContent('—');
  });

  it('omits the window badge when there is no daily data', () => {
    render(
      <BookBannerStats stats={{ totals: { views: 0, clicks: 0 }, daily: [], byBanner: [] }} />
    );
    expect(screen.queryByText(/^Last \d+ days$/)).not.toBeInTheDocument();
  });
});
