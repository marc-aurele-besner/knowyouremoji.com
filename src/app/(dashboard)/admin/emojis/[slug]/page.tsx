import { notFound } from 'next/navigation';
import { getEmojiBySlug } from '@/lib/emoji-data';
import { AdminEmojiForm } from '@/components/admin/admin-emoji-form';

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
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Emoji</h1>
        <p className="text-muted-foreground mt-1">
          Update emoji content for {emoji.character} {emoji.name}
        </p>
      </div>
      <AdminEmojiForm emoji={emoji} />
    </div>
  );
}
