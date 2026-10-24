import { AdminEmojiForm } from '@/components/admin/admin-emoji-form';
import { AdminNav } from '@/components/admin/admin-nav';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-ui';

export default function NewEmojiPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <AdminNav />
      <DashboardPageHeader title="Create New Emoji" description="Add a new emoji to the database" />
      <AdminEmojiForm />
    </div>
  );
}
