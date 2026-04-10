import Link from 'next/link';
import { getAllEmojis } from '@/lib/emoji-data';
import { AdminEmojiList } from '@/components/admin/admin-emoji-list';

export default async function AdminEmojiPage() {
  const emojis = getAllEmojis();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emoji Admin</h1>
          <p className="text-muted-foreground mt-1">Manage emoji content ({emojis.length} total)</p>
        </div>
        <Link
          href="/admin/emojis/new"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:from-amber-600 hover:to-orange-600"
        >
          + New Emoji
        </Link>
      </div>
      <AdminEmojiList emojis={emojis} />
    </div>
  );
}
