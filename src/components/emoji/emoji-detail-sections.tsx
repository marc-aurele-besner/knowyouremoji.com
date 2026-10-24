/**
 * Server-rendered building blocks for the emoji detail page. Every section
 * renders its full content into the DOM (nothing is hidden behind client
 * state) so the page stays fully indexable.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ShareMeaningButton } from '@/components/share/share-meaning-button';
import { CopyTextButton } from '@/components/emoji/copy-text-button';
import { PlatformIcon } from '@/components/emoji/platform-icon';
import { WarningIcon } from '@/components/emoji/emoji-icons';
import {
  BADGE_CLASS,
  BUBBLE_CLASS,
  PAGEABLE_CONTEXTS,
  getContextLabel,
  getGenerationLabel,
  getGenerationYears,
  getPlatformLabel,
  riskBadgeClass,
} from '@/components/emoji/emoji-labels';
import type { ContextMeaning, EmojiWarning, GenerationalNote, PlatformNote } from '@/types/emoji';

const CARD_CLASS = 'rounded-2xl border border-card-border bg-card';
const LINK_FOCUS =
  'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

// ============================================
// Section shell
// ============================================

export interface DetailSectionProps {
  /** Unique id used for the heading (`${id}-heading`) */
  id: string;
  /** Section title (h2) */
  title: ReactNode;
  /** Optional element shown at the end of the heading row */
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Section with a consistent heading row used for every block on the page. */
export function DetailSection({ id, title, extra, children, className }: DetailSectionProps) {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn('mt-14', className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <h2 id={`${id}-heading`} className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

// ============================================
// Context meanings
// ============================================

export interface ContextMeaningCardsProps {
  meanings: ContextMeaning[];
  /** Emoji character (used in share text) */
  character: string;
  /** Emoji slug (used for share links) */
  slug: string;
}

/** Grid of context meaning cards with risk badge, chat-bubble example and actions. */
export function ContextMeaningCards({ meanings, character, slug }: ContextMeaningCardsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
      {meanings.map((ctx, index) => {
        const label = getContextLabel(ctx.context);
        return (
          <article
            key={`${ctx.context}-${index}`}
            id={`context-${index}`}
            className={cn(CARD_CLASS, 'flex scroll-mt-32 flex-col gap-2 p-[18px]')}
            data-testid="context-meaning-card"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-foreground">
                {PAGEABLE_CONTEXTS.has(ctx.context) ? (
                  <Link
                    href={`/emoji/context/${ctx.context}`}
                    className={cn(LINK_FOCUS, 'hover:text-primary-700')}
                  >
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </h3>
              <span className={cn(BADGE_CLASS, riskBadgeClass(ctx.riskLevel))}>
                {ctx.riskLevel.toLowerCase()} risk
              </span>
            </div>
            <p className="text-[14.5px] leading-relaxed text-muted-foreground">{ctx.meaning}</p>
            {ctx.example && (
              <p className={BUBBLE_CLASS}>
                <span className="sr-only">Example: </span>
                {ctx.example}
              </p>
            )}
            <div className="mt-auto flex items-center gap-1 pt-1">
              <CopyTextButton
                text={ctx.example ? `${ctx.meaning}\nExample: "${ctx.example}"` : ctx.meaning}
                contentType="context-meaning"
                label="Copy"
                ariaLabel={`Copy ${label} meaning`}
              />
              <ShareMeaningButton
                emoji={character}
                context={label}
                meaning={ctx.meaning}
                slug={slug}
                index={index}
                className="h-8 w-8 border-transparent bg-transparent text-muted-foreground"
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

// ============================================
// Warnings
// ============================================

/** Warnings as tinted rows (amber, or red for HIGH severity). */
export function EmojiWarningRows({ warnings }: { warnings: EmojiWarning[] }) {
  return (
    <div className="mt-6 flex flex-col gap-2" data-testid="emoji-warnings">
      {warnings.map((warning, index) => {
        const high = warning.severity === 'HIGH';
        return (
          <div
            key={index}
            role="note"
            className={cn(
              'flex gap-3 rounded-2xl px-[18px] py-4 text-foreground',
              high ? 'bg-danger-background' : 'bg-primary-50'
            )}
          >
            <WarningIcon
              size={18}
              className={cn('mt-0.5 flex-none', high ? 'text-danger' : 'text-primary-700')}
            />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <strong className="font-semibold">{warning.title}</strong>
                <span className={cn(BADGE_CLASS, riskBadgeClass(warning.severity))}>
                  {warning.severity.toLowerCase()}
                </span>
              </p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-muted-foreground">
                {warning.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Platform notes
// ============================================

/** Platform notes as a divided list inside one card, each platform linking to its hub. */
export function PlatformNotesList({ notes }: { notes: PlatformNote[] }) {
  return (
    <div className={cn(CARD_CLASS, 'px-5')}>
      <ul className="divide-y divide-card-border">
        {notes.map((note, index) => (
          <li
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 py-4 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-start"
          >
            <Link
              href={`/emoji/platform/${note.platform}`}
              className={cn(
                LINK_FOCUS,
                'inline-flex items-center gap-2 self-center text-[14.5px] font-semibold text-foreground hover:text-primary-700 sm:self-start'
              )}
            >
              <PlatformIcon platform={note.platform} className="h-3.5 w-3.5" />
              {getPlatformLabel(note.platform)}
            </Link>
            <p className="col-span-2 row-start-2 text-[14.5px] leading-relaxed text-muted-foreground sm:col-span-1 sm:row-start-1 sm:col-start-2">
              {note.note}
            </p>
            <CopyTextButton
              text={note.note}
              contentType="platform-note"
              ariaLabel={`Copy ${getPlatformLabel(note.platform)} note`}
              className="col-start-2 row-start-1 sm:col-start-3"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// Generational notes
// ============================================

/** Generational notes as cards linking to each generation hub. */
export function GenerationalNotesGrid({ notes }: { notes: GenerationalNote[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
      {notes.map((note, index) => (
        <Link
          key={index}
          href={`/emoji/generation/${note.generation}`}
          className={cn(
            CARD_CLASS,
            'flex flex-col gap-2 p-[18px] transition-colors hover:border-primary-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-[15px] font-semibold text-foreground">
              {getGenerationLabel(note.generation)}
            </span>
            {getGenerationYears(note.generation) && (
              <span className="text-xs text-muted-foreground">
                {getGenerationYears(note.generation)}
              </span>
            )}
          </span>
          <span className="text-[14.5px] leading-relaxed text-muted-foreground">{note.note}</span>
        </Link>
      ))}
    </div>
  );
}
