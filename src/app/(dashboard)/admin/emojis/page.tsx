import Link from 'next/link';
import { getAllEmojis } from '@/lib/emoji-data';
import { AdminEmojiList } from '@/components/admin/admin-emoji-list';
import { AdminNav } from '@/components/admin/admin-nav';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-ui';

export default async function AdminEmojiPage() {
  const emojis = getAllEmojis();

  return (
    <div className="space-y-6">
      <AdminNav />
      <DashboardPageHeader
        title="Emoji Admin"
        description={`Manage emoji content (${emojis.length} total)`}
        actions={
          <Link
            href="/admin/emojis/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            + New Emoji
          </Link>
        }
      />
      <AdminEmojiList emojis={emojis} />
    </div>
  );
}
