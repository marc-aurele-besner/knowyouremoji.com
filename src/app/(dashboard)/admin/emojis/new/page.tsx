import { AdminEmojiForm } from '@/components/admin/admin-emoji-form';

export default function NewEmojiPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Emoji</h1>
        <p className="text-muted-foreground mt-1">Add a new emoji to the database</p>
      </div>
      <AdminEmojiForm />
    </div>
  );
}
