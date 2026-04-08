import type { Metadata } from 'next';
import { HistoryPage } from '@/components/dashboard/history-page';

export const metadata: Metadata = {
  title: 'Interpretation History | KnowYourEmoji',
  description: 'View your past emoji interpretation history.',
};

export default function DashboardHistoryPage() {
  return <HistoryPage />;
}
