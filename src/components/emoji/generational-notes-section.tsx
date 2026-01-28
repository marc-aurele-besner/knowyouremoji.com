'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Generation } from '@/types/emoji';

/**
 * Cringe factor levels for generational emoji usage
 */
export type CringeFactor = 'acceptable' | 'slightly-cringe' | 'very-cringe' | 'ironic-use';

/**
 * Extended generational note with additional metadata
 */
export interface GenerationalNoteExtended {
  /** Generation this note applies to */
  generation: Generation;
  /** How this generation interprets the emoji */
  interpretation: string;
  /** Example usage of the emoji by this generation */
  example?: string;
  /** Cringe factor rating */
  cringeFactor?: CringeFactor;
  /** Source citation for the information */
  source?: string;
}

/**
 * Props for the GenerationalNotesSection component
 */
export interface GenerationalNotesSectionProps {
  /** Array of generational notes to display */
  notes: GenerationalNoteExtended[];
  /** The emoji character being described */
  emojiCharacter: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Generation metadata with labels and birth year ranges
 */
const generationLabels: Record<Generation, { label: string; years: string }> = {
  GEN_Z: { label: 'Gen Z', years: '1997-2012' },
  MILLENNIAL: { label: 'Millennials', years: '1981-1996' },
  GEN_X: { label: 'Gen X', years: '1965-1980' },
  BOOMER: { label: 'Boomers', years: '1946-1964' },
};

/**
 * Cringe factor labels and styling
 */
const cringeLabels: Record<CringeFactor, { label: string; color: string }> = {
  acceptable: { label: 'Acceptable', color: 'text-green-600 dark:text-green-400' },
  'slightly-cringe': { label: 'Slightly Cringe', color: 'text-yellow-600 dark:text-yellow-400' },
  'very-cringe': { label: 'Very Cringe', color: 'text-red-600 dark:text-red-400' },
  'ironic-use': { label: 'Ironic Use Only', color: 'text-purple-600 dark:text-purple-400' },
};

/**
 * Users icon component
 */
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="users-icon"
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/**
 * Chevron down icon component
 */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="chevron-down-icon"
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Chevron up icon component
 */
function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="chevron-up-icon"
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

/**
 * Individual generational note card component
 */
function GenerationalNoteCard({ note }: { note: GenerationalNoteExtended }) {
  const gen = generationLabels[note.generation];
  const cringe = note.cringeFactor ? cringeLabels[note.cringeFactor] : null;

  return (
    <div className="border rounded-lg p-4 bg-card dark:bg-card">
      <div className="flex items-center gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{gen.label}</h3>
          <span className="text-sm text-muted-foreground">{gen.years}</span>
        </div>
      </div>

      <p className="mb-3 text-gray-700 dark:text-gray-300">{note.interpretation}</p>

      {note.example && (
        <blockquote className="border-l-4 border-primary pl-3 py-1 text-sm italic bg-muted/50 rounded-r mb-3">
          {note.example}
        </blockquote>
      )}

      {cringe && <p className={cn('text-sm font-medium', cringe.color)}>{cringe.label}</p>}

      {note.source && <p className="text-xs text-muted-foreground mt-2">Source: {note.source}</p>}
    </div>
  );
}

/**
 * GenerationalNotesSection displays how different generations interpret
 * emojis with side-by-side comparisons, cringe factors, and examples.
 *
 * @example
 * ```tsx
 * <GenerationalNotesSection
 *   notes={emoji.generationalNotes}
 *   emojiCharacter="💀"
 * />
 * ```
 */
export function GenerationalNotesSection({
  notes,
  emojiCharacter: _emojiCharacter,
  className,
}: GenerationalNotesSectionProps) {
  // Note: emojiCharacter prop kept for API consistency with other sections
  void _emojiCharacter;
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (notes.length === 0) {
    return null;
  }

  return (
    <section className={cn('my-8', className)} aria-labelledby="gen-notes-heading" role="region">
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left mb-4"
        aria-expanded={expanded}
      >
        <h2
          id="gen-notes-heading"
          className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100"
        >
          <UsersIcon />
          Generational Differences
        </h2>
        {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {expanded && (
        <div className="grid md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <GenerationalNoteCard key={note.generation} note={note} />
          ))}
        </div>
      )}
    </section>
  );
}
