import type { Metadata } from 'next';
import { AdminAnalyticsDashboard } from '@/components/admin/admin-analytics-dashboard';
import { AdminNav } from '@/components/admin/admin-nav';
import { BookBannerStats } from '@/components/admin/book-banner-stats';
import {
  getAllEmojiViewCounts,
  getAnalyticsOverview,
  getBookBannerStats,
  getLeastViewedTrackedEmojis,
  getTopEmojisByViews,
} from '@/lib/analytics-queries';

export const metadata: Metadata = {
  title: 'Analytics | Admin | KnowYourEmoji',
  description: 'View counts, popular emoji, and book banner telemetry for KnowYourEmoji.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const [overview, topEmojis, leastViewed, allEmojis, bookBannerStats] = await Promise.all([
    getAnalyticsOverview(),
    getTopEmojisByViews(10),
    getLeastViewedTrackedEmojis(10),
    getAllEmojiViewCounts(),
    getBookBannerStats(30),
  ]);

  const isLive = overview.totalViews > 0 || overview.trackedEmojis > 0;

  return (
    <div className="space-y-6">
      <AdminNav />
      <AdminAnalyticsDashboard
        overview={overview}
        topEmojis={topEmojis}
        leastViewed={leastViewed}
        allEmojis={allEmojis}
        isLive={isLive}
      />
      <BookBannerStats stats={bookBannerStats} />
    </div>
  );
}
