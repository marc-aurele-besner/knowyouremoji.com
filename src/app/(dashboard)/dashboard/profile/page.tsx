import type { Metadata } from 'next';
import { ProfilePage } from '@/components/dashboard/profile-page';

export const metadata: Metadata = {
  title: 'Profile | KnowYourEmoji',
  description: 'View your account information and subscription status.',
};

export default function DashboardProfilePage() {
  return <ProfilePage />;
}
