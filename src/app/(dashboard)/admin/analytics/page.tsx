import type { Metadata } from 'next';
import { AdminAnalyticsDashboard } from '@/components/admin/admin-analytics-dashboard';
import { AdminNav } from '@/components/admin/admin-nav';
import {
  getAllEmojiViewCounts,
  getAnalyticsOverview,
  getLeastViewedTrackedEmojis,
  getTopEmojisByViews,
} from '@/lib/analytics-queries';

export const metadata: Metadata = {
  title: 'Analytics | Admin | KnowYourEmoji',
  description: 'View counts and popular emoji telemetry for KnowYourEmoji.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const [overview, topEmojis, leastViewed, allEmojis] = await Promise.all([
    getAnalyticsOverview(),
    getTopEmojisByViews(10),
    getLeastViewedTrackedEmojis(10),
    getAllEmojiViewCounts(),
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
    </div>
  );
}
