'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Platform } from '@/types/emoji';

/**
 * Importance level for platform notes
 */
export type NoteImportance = 'info' | 'warning' | 'critical';

/**
 * Extended platform note with additional metadata
 */
export interface PlatformNoteExtended {
  /** Platform where this note applies */
  platform: Platform;
  /** Note about usage on this platform */
  note: string;
  /** Importance level of the note */
  importance?: NoteImportance;
  /** Platform version when this change occurred */
  version?: string;
  /** Date when the change occurred (ISO format) */
  date?: string;
  /** Before/after image comparison */
  imageComparison?: {
    before?: string;
    after?: string;
  };
}

/**
 * Props for the PlatformNotesSection component
 */
export interface PlatformNotesSectionProps {
  /** Array of platform notes to display */
  notes: PlatformNoteExtended[];
  /** The emoji character being described */
  emojiCharacter: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Character limit before truncation
 */
const TRUNCATE_LENGTH = 200;

/**
 * Styling configuration for each importance level
 */
const importanceStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  critical: {
    container: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

/**
 * Formats platform name from enum to display name
 */
function formatPlatformName(platform: Platform): string {
  const platformNames: Record<Platform, string> = {
    IMESSAGE: 'iMessage',
    INSTAGRAM: 'Instagram',
    TIKTOK: 'TikTok',
    WHATSAPP: 'WhatsApp',
    SLACK: 'Slack',
    DISCORD: 'Discord',
    TWITTER: 'Twitter',
  };
  return platformNames[platform] ?? platform;
}

/**
 * Info icon component
 */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="info-icon"
      className={cn('w-5 h-5 flex-shrink-0', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/**
 * Warning icon component
 */
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="warning-icon"
      className={cn('w-5 h-5 flex-shrink-0', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Critical/Alert icon component
 */
function CriticalIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="critical-icon"
      className={cn('w-5 h-5 flex-shrink-0', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/**
 * Render the appropriate icon for an importance level
 */
function ImportanceIcon({
  importance,
  className,
}: {
  importance: NoteImportance;
  className?: string;
}) {
  switch (importance) {
    case 'warning':
      return <WarningIcon className={className} />;
    case 'critical':
      return <CriticalIcon className={className} />;
    default:
      return <InfoIcon className={className} />;
  }
}

/**
 * Individual platform note card component
 */
function PlatformNoteCard({ note }: { note: PlatformNoteExtended }) {
  const [expanded, setExpanded] = useState(false);

  const importance = note.importance ?? 'info';
  const styles = importanceStyles[importance];

  const isLongContent = note.note.length > TRUNCATE_LENGTH;
  const displayedNote =
    isLongContent && !expanded ? `${note.note.slice(0, TRUNCATE_LENGTH)}...` : note.note;

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className={cn('border rounded-lg p-4', styles.container)}>
      <div className="flex gap-3">
        <ImportanceIcon importance={importance} className={cn('mt-0.5', styles.iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatPlatformName(note.platform)}
            </span>
            {note.version && (
              <span className="text-sm text-gray-500 dark:text-gray-400">({note.version})</span>
            )}
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">{displayedNote}</p>
            {isLongContent && (
              <button
                onClick={toggleExpand}
                className={cn(
                  'mt-2 text-sm font-medium',
                  'text-blue-600 dark:text-blue-400 hover:underline',
                  'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded'
                )}
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          {note.imageComparison && (
            <div className="mt-4 flex gap-4 flex-wrap">
              {note.imageComparison.before && (
                <div className="flex flex-col items-center">
                  <Image
                    src={note.imageComparison.before}
                    alt="Before change"
                    width={64}
                    height={64}
                    className="rounded border border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Before</span>
                </div>
              )}
              {note.imageComparison.after && (
                <div className="flex flex-col items-center">
                  <Image
                    src={note.imageComparison.after}
                    alt="After change"
                    width={64}
                    height={64}
                    className="rounded border border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">After</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PlatformNotesSection displays platform-specific notes and differences
 * for an emoji with importance-based styling.
 *
 * @example
 * ```tsx
 * <PlatformNotesSection
 *   notes={emoji.platformNotes}
 *   emojiCharacter="🔫"
 * />
 * ```
 */
export function PlatformNotesSection({
  notes,
  emojiCharacter,
  className,
}: PlatformNotesSectionProps) {
  if (notes.length === 0) {
    return null;
  }

  const noteCount = notes.length;
  const noteText = noteCount === 1 ? 'note' : 'notes';

  return (
    <section
      className={cn('my-8', className)}
      aria-labelledby="platform-notes-heading"
      role="region"
    >
      <h2
        id="platform-notes-heading"
        className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100"
      >
        {emojiCharacter} Platform-Specific {noteText}
      </h2>

      <div className="space-y-4">
        {notes.map((note, index) => (
          <PlatformNoteCard key={`${note.platform}-${index}`} note={note} />
        ))}
      </div>
    </section>
  );
}
