import type { Metadata } from 'next';
import { SettingsPage } from '@/components/dashboard/settings-page';

export const metadata: Metadata = {
  title: 'Settings | KnowYourEmoji',
  description: 'Manage your profile, preferences, and subscription settings.',
};

export default function DashboardSettingsPage() {
  return <SettingsPage />;
}
