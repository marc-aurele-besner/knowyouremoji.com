import { notFound } from 'next/navigation';
import { getEmojiBySlug } from '@/lib/emoji-data';
import Link from 'next/link';
import { AdminEmojiForm } from '@/components/admin/admin-emoji-form';
import { AdminNav } from '@/components/admin/admin-nav';
import { DashboardPageHeader } from '@/components/dashboard/dashboard-ui';

interface EditEmojiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditEmojiPage({ params }: EditEmojiPageProps) {
  const { slug } = await params;
  const emoji = getEmojiBySlug(slug);

  if (!emoji) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <AdminNav />
      <DashboardPageHeader
        title="Edit Emoji"
        description={`Update emoji content for ${emoji.character} ${emoji.name}`}
        actions={
          <Link
            href={`/emoji/${emoji.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center justify-center rounded-full border border-card-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            View live ↗
          </Link>
        }
      />
      <AdminEmojiForm emoji={emoji} />
    </div>
  );
}
