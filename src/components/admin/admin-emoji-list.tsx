'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Emoji } from '@/types/emoji';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
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

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search emojis by name, character, or slug..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="rounded-lg border border-gray-200/50 dark:border-gray-700/50">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Emoji
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Context Meanings
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {filteredEmojis.map((emoji) => (
              <tr
                key={emoji.slug}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() => setSelectedEmoji(emoji)}
              >
                <td className="px-4 py-3">
                  <span className="text-2xl">{emoji.character}</span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {emoji.name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{emoji.category}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{emoji.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{emoji.contextMeanings.length} contexts</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/emojis/${emoji.slug}`}
                      className="rounded-md px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/emoji/${emoji.slug}`}
                      target="_blank"
                      className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
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

        {filteredEmojis.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No emojis found matching your search.
          </div>
        )}
      </div>

      {/* Emoji Detail Dialog */}
      <Dialog open={!!selectedEmoji} onOpenChange={() => setSelectedEmoji(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-4xl">{selectedEmoji?.character}</span>
              <span>{selectedEmoji?.name}</span>
            </DialogTitle>
            <DialogDescription>Emoji details and preview</DialogDescription>
          </DialogHeader>
          {selectedEmoji && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Slug:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedEmoji.slug}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Category:</span>
                  <Badge variant="secondary" className="ml-2">
                    {selectedEmoji.category}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Unicode:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {selectedEmoji.unicode}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Version:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {selectedEmoji.unicodeVersion}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Base Meaning</h4>
                <p className="text-gray-600 dark:text-gray-300">{selectedEmoji.baseMeaning}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">TL;DR</h4>
                <p className="text-gray-600 dark:text-gray-300">{selectedEmoji.tldr}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Context Meanings ({selectedEmoji.contextMeanings.length})
                </h4>
                <div className="space-y-2">
                  {selectedEmoji.contextMeanings.map((ctx, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-3"
                    >
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
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Risk: {ctx.riskLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{ctx.meaning}</p>
                      {ctx.example && (
                        <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">
                          Example: {ctx.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
