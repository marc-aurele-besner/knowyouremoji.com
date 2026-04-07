import type { Metadata } from 'next';
import { DashboardHome } from '@/components/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | KnowYourEmoji',
  description: 'Your emoji interpretation dashboard - view usage stats and quick actions.',
};

export default function DashboardPage() {
  return <DashboardHome />;
}
