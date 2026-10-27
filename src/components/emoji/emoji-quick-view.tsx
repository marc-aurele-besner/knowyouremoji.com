'use client';

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import Link from 'next/link';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmojiCopyButton } from '@/components/emoji/emoji-copy-button';
import { EmojiCard, emojiGridClass } from '@/components/emoji/emoji-card';
import { ArrowRightIcon, CloseIcon } from '@/components/emoji/emoji-icons';
import {
  getCategoryDisplayName,
  isValidCategorySlug,
  resolveCategorySlug,
} from '@/lib/emoji-taxonomy';
import {
  BADGE_CLASS,
  BUBBLE_CLASS,
  chipClass,
  formatCodepoints,
  getContextLabel,
  riskBadgeClass,
} from '@/components/emoji/emoji-labels';
import type { EmojiSummary, RiskLevel } from '@/types/emoji';

/**
 * Context meaning shown in the quick view (a subset of `ContextMeaning`).
 */
export interface QuickViewContext {
  context: string;
  meaning: string;
  riskLevel: RiskLevel;
  example?: string;
}

/**
 * Emoji data for the quick view: the summary plus optional context meanings
 * when the page already has them.
 */
export interface QuickViewEmoji extends EmojiSummary {
  contexts?: QuickViewContext[];
}

export interface EmojiQuickViewDrawerProps {
  /** Emoji to show (kept while closing) */
  emoji: QuickViewEmoji | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element that receives focus again when the drawer closes */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Right-side drawer with a quick summary of an emoji: TL;DR, up to four
 * context meanings (when provided) and links to the full entry.
 * Built on Radix Dialog: focus moves inside, Escape / overlay click close it,
 * and focus returns to the card that opened it.
 */
export function EmojiQuickViewDrawer({
  emoji,
  open,
  onOpenChange,
  returnFocusRef,
}: EmojiQuickViewDrawerProps) {
  const handleCloseAutoFocus = useCallback(
    (event: Event) => {
      const target = returnFocusRef?.current;
      if (target) {
        event.preventDefault();
        target.focus();
      }
    },
    [returnFocusRef]
  );

  if (!emoji) return null;

  const contexts = (emoji.contexts ?? []).slice(0, 4);
  const categorySlug = resolveCategorySlug(emoji.category);
  const hasCategoryPage = isValidCategorySlug(categorySlug);
  const categoryLabel = getCategoryDisplayName(categorySlug);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[60] bg-black/45"
          data-testid="quick-view-overlay"
        />
        <DialogPrimitive.Content
          aria-modal="true"
          onCloseAutoFocus={handleCloseAutoFocus}
          className={cn(
            'fixed inset-y-0 right-0 z-[61] w-full max-w-[480px] overflow-y-auto',
            'border-l border-card-border bg-card px-6 pb-10 pt-5 text-foreground shadow-pop sm:px-[26px]',
            'focus:outline-none'
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow">{categoryLabel}</span>
            <DialogPrimitive.Close asChild>
              <Button variant="outline" size="icon" aria-label="Close quick view">
                <CloseIcon size={18} />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="mb-3.5 mt-[18px] flex h-[104px] w-[104px] items-center justify-center rounded-[28px] bg-primary-50">
            <span className="emoji-display text-[64px]" aria-hidden="true">
              {emoji.character}
            </span>
          </div>
          <DialogPrimitive.Title className="text-[28px] font-semibold tracking-tight">
            {emoji.name}
          </DialogPrimitive.Title>
          <p className="mt-1 font-mono text-[13px] text-muted-foreground">
            {formatCodepoints(emoji.character)} · /emoji/{emoji.slug}
          </p>

          <div className="mt-[18px] rounded-2xl bg-muted px-5 py-4">
            <DialogPrimitive.Description className="text-base leading-relaxed">
              <strong className="font-semibold">TL;DR</strong> — {emoji.tldr}
            </DialogPrimitive.Description>
          </div>

          {contexts.length > 0 ? (
            <>
              <h3 className="mb-2 mt-[22px] text-[15px] font-semibold">In context</h3>
              <ul className="flex flex-col gap-2">
                {contexts.map((ctx, index) => (
                  <li
                    key={`${ctx.context}-${index}`}
                    className="rounded-2xl border border-card-border p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{getContextLabel(ctx.context)}</span>
                      <span className={cn(BADGE_CLASS, riskBadgeClass(ctx.riskLevel))}>
                        {ctx.riskLevel.toLowerCase()} risk
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{ctx.meaning}</p>
                    {ctx.example && <p className={cn(BUBBLE_CLASS, 'mt-2')}>{ctx.example}</p>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            hasCategoryPage && (
              <div className="mt-[18px] flex flex-wrap gap-2">
                <Link href={`/emoji/category/${categorySlug}`} className={chipClass()}>
                  {categoryLabel}
                </Link>
              </div>
            )
          )}

          <div className="mt-[22px] flex flex-wrap gap-2">
            <Button asChild variant="primary">
              <Link href={`/emoji/${emoji.slug}`}>
                Open full entry
                <ArrowRightIcon />
              </Link>
            </Button>
            <EmojiCopyButton
              emoji={emoji.character}
              slug={emoji.slug}
              label="Copy"
              variant="outline"
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * True when a click should keep the browser's default link behaviour
 * (new tab / window, download, or a non-primary button).
 */
export function isModifiedClick(event: MouseEvent<HTMLElement>): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export interface EmojiQuickViewGridProps {
  emojis: QuickViewEmoji[];
  /** Show the TL;DR line on each card */
  showTldr?: boolean;
  /** Dense layout */
  compact?: boolean;
  /** Grid classes (defaults to the responsive auto-fill grid) */
  gridClassName?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Grid of emoji cards where a plain click opens the quick-view drawer.
 * Cards stay real links: modifier/middle clicks (and no-JS) follow the href.
 */
export function EmojiQuickViewGrid({
  emojis,
  showTldr = false,
  compact = false,
  gridClassName,
  ariaLabel = 'Emoji grid',
  className,
}: EmojiQuickViewGridProps) {
  const [selected, setSelected] = useState<QuickViewEmoji | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, emoji: QuickViewEmoji) => {
      if (isModifiedClick(event)) return;
      event.preventDefault();
      triggerRef.current = event.currentTarget;
      setSelected(emoji);
      setOpen(true);
    },
    []
  );

  return (
    <>
      <ul
        role="list"
        aria-label={ariaLabel}
        className={cn(gridClassName ?? emojiGridClass(compact), className)}
      >
        {emojis.map((emoji) => (
          <li key={emoji.slug}>
            <EmojiCard
              emoji={emoji}
              showTldr={showTldr}
              compact={compact}
              onClick={(event) => handleCardClick(event, emoji)}
            />
          </li>
        ))}
      </ul>
      <EmojiQuickViewDrawer
        emoji={selected}
        open={open}
        onOpenChange={setOpen}
        returnFocusRef={triggerRef}
      />
    </>
  );
}

/**
 * Read the quick-view data a server-rendered `EmojiCard` exposes through its
 * `data-quick-*` attributes.
 */
export function readQuickViewData(card: HTMLElement): QuickViewEmoji {
  const { quickSlug, quickCharacter, quickName, quickCategory, quickTldr, quickContexts } =
    card.dataset;
  let contexts: QuickViewContext[] | undefined;
  if (quickContexts) {
    try {
      contexts = JSON.parse(quickContexts) as QuickViewContext[];
    } catch {
      contexts = undefined;
    }
  }
  return {
    slug: quickSlug ?? '',
    character: quickCharacter ?? '',
    name: quickName ?? '',
    category: quickCategory ?? '',
    tldr: quickTldr ?? '',
    contexts,
  };
}

export interface EmojiQuickViewRegionProps {
  /** Server-rendered content containing `EmojiCard`s with `quickView` set */
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight client wrapper for server-rendered grids: a delegated click
 * handler opens the quick-view drawer for any card inside, reading its data
 * from `data-quick-*` attributes (so large grids don't ship their data twice).
 * Modifier / middle clicks and no-JS keep following the card links.
 */
export function EmojiQuickViewRegion({ children, className }: EmojiQuickViewRegionProps) {
  const [selected, setSelected] = useState<QuickViewEmoji | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('[data-quick-slug]');
    if (!card || isModifiedClick(event)) return;
    event.preventDefault();
    triggerRef.current = card;
    setSelected(readQuickViewData(card));
    setOpen(true);
  }, []);

  return (
    // The click handler only enhances real links inside; keyboard users
    // activate those links (Enter fires a click), so no extra key handling.
    <div className={className} onClick={handleClick}>
      {children}
      <EmojiQuickViewDrawer
        emoji={selected}
        open={open}
        onOpenChange={setOpen}
        returnFocusRef={triggerRef}
      />
    </div>
  );
}
