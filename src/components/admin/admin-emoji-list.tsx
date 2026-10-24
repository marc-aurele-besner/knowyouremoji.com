'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Emoji } from '@/types/emoji';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminEmojiListProps {
  emojis: Emoji[];
}

export function AdminEmojiList({ emojis }: AdminEmojiListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<Emoji | null>(null);

  const filteredEmojis = emojis.filter((emoji) => {
    const query = searchQuery.toLowerCase();
    return (
      emoji.name.toLowerCase().includes(query) ||
      emoji.character.includes(query) ||
      emoji.slug.toLowerCase().includes(query)
    );
  });

  const actionClass =
    'inline-flex h-9 items-center rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-md">
          <label htmlFor="admin-emoji-search" className="sr-only">
            Search emojis
          </label>
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <Input
            id="admin-emoji-search"
            type="search"
            placeholder="Search emojis by name, character, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-full pl-10"
          />
        </div>
        <span className="text-[13px] text-muted-foreground" aria-live="polite">
          {filteredEmojis.length} emoji{filteredEmojis.length === 1 ? '' : 's'}
        </span>
      </div>

      {filteredEmojis.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center">
          <span className="emoji-display text-4xl" aria-hidden="true">
            🔍
          </span>
          <p className="font-semibold text-foreground">No emojis found matching your search.</p>
          <p className="text-sm text-muted-foreground">Try another name, character or slug.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-card-border bg-muted/60">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Emoji
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Slug
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Contexts
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredEmojis.map((emoji) => (
                <tr
                  key={emoji.slug}
                  className="cursor-pointer transition-colors hover:bg-muted/60"
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <span className="emoji-display text-2xl" aria-hidden="true">
                        {emoji.character}
                      </span>
                      <span className="font-semibold text-foreground">{emoji.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">
                    {emoji.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{emoji.category}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {emoji.contextMeanings.length}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                      <button
                        type="button"
                        className={cn(
                          actionClass,
                          'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmoji(emoji);
                        }}
                        aria-label={`View details for ${emoji.name}`}
                      >
                        Details
                      </button>
                      <Link
                        href={`/admin/emojis/${emoji.slug}`}
                        className={cn(
                          actionClass,
                          'border border-card-border bg-card text-foreground hover:bg-muted'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/emoji/${emoji.slug}`}
                        target="_blank"
                        className={cn(
                          actionClass,
                          'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Emoji Detail Dialog */}
      <Dialog open={!!selectedEmoji} onOpenChange={() => setSelectedEmoji(null)}>
        <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="emoji-display text-5xl">{selectedEmoji?.character}</span>
              <span>{selectedEmoji?.name}</span>
            </DialogTitle>
            <DialogDescription>Emoji details and preview</DialogDescription>
          </DialogHeader>
          {selectedEmoji && (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-card-border p-3">
                  <dt className="text-xs text-muted-foreground">Slug</dt>
                  <dd className="mt-0.5 font-mono text-foreground">{selectedEmoji.slug}</dd>
                </div>
                <div className="rounded-xl border border-card-border p-3">
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="mt-0.5 text-foreground">{selectedEmoji.category}</dd>
                </div>
                <div className="rounded-xl border border-card-border p-3">
                  <dt className="text-xs text-muted-foreground">Unicode</dt>
                  <dd className="mt-0.5 font-mono text-foreground">{selectedEmoji.unicode}</dd>
                </div>
                <div className="rounded-xl border border-card-border p-3">
                  <dt className="text-xs text-muted-foreground">Version</dt>
                  <dd className="mt-0.5 text-foreground">{selectedEmoji.unicodeVersion}</dd>
                </div>
              </dl>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">Base Meaning</h4>
                <p className="text-sm text-muted-foreground">{selectedEmoji.baseMeaning}</p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">TL;DR</h4>
                <p className="text-sm text-muted-foreground">{selectedEmoji.tldr}</p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">
                  Context Meanings ({selectedEmoji.contextMeanings.length})
                </h4>
                <div className="space-y-2">
                  {selectedEmoji.contextMeanings.map((ctx, idx) => (
                    <div key={idx} className="rounded-xl border border-card-border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            ctx.riskLevel === 'HIGH'
                              ? 'destructive'
                              : ctx.riskLevel === 'MEDIUM'
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {ctx.context}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Risk: {ctx.riskLevel}</span>
                      </div>
                      <p className="text-sm text-foreground">{ctx.meaning}</p>
                      {ctx.example && (
                        <p className="mt-2 inline-block rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground">
                          <span className="sr-only">Example: </span>
                          {ctx.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-card-border pt-4">
                <Link
                  href={`/admin/emojis/${selectedEmoji.slug}`}
                  className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  Edit
                </Link>
                <Link
                  href={`/emoji/${selectedEmoji.slug}`}
                  target="_blank"
                  className="inline-flex h-10 items-center rounded-full border border-card-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  View live ↗
                </Link>
                <DialogClose className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                  Close
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
