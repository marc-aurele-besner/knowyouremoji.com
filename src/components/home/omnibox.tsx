'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { emojiEvents, errorEvents } from '@/lib/analytics';
import { useRateLimit } from '@/hooks/use-rate-limit';
import type { EmojiSummary } from '@/types/emoji';

const EMOJI_REGEX = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
const SINGLE_EMOJI_REGEX =
  /^(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}[️\p{Emoji_Modifier}]*(?:‍\p{Extended_Pictographic}[️\p{Emoji_Modifier}]*)*)$/u;

/** Example queries offered under the omnibox. */
export const TRY_EXAMPLES = ['💀', '🫠', 'ok sure 🙂', 'that meme 💀😭'] as const;

/** Whether the text contains at least one emoji. */
export function hasEmoji(text: string): boolean {
  return EMOJI_REGEX.test(text);
}

/** Whether the (trimmed) text is exactly one emoji. */
export function isSingleEmoji(text: string): boolean {
  return SINGLE_EMOJI_REGEX.test(text.trim());
}

/**
 * A query reads as a message to interpret (rather than a lookup) when it has
 * whitespace, is longer than 4 characters and contains an emoji or 3+ words.
 */
export function isMessageLike(text: string): boolean {
  const t = text.trim();
  return t.length > 4 && /\s/.test(t) && (hasEmoji(t) || t.split(/\s+/).length >= 3);
}

function stripVariation(text: string): string {
  return text.replace(/️/g, '');
}

/**
 * Decide where a lookup should land: the emoji page when the query is a
 * single emoji (exact match, else first result) or there is exactly one
 * result, otherwise the full search page.
 */
export function resolveLookupHref(query: string, results: EmojiSummary[]): string {
  const q = query.trim();
  if (results.length > 0 && isSingleEmoji(q)) {
    const exact = results.find((r) => stripVariation(r.character) === stripVariation(q));
    return `/emoji/${(exact ?? results[0]).slug}`;
  }
  if (results.length === 1) {
    return `/emoji/${results[0].slug}`;
  }
  return `/search?q=${encodeURIComponent(q)}`;
}

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function UsageLine() {
  const { remaining, maxUses } = useRateLimit();
  // localStorage is only readable after hydration; render the static copy first.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <p
      data-testid="omnibox-usage"
      className="mt-4 flex items-center justify-center gap-2.5 text-[13px] text-muted-foreground"
    >
      <span className="inline-flex gap-1" aria-hidden="true">
        {Array.from({ length: maxUses }, (_, i) => (
          <i
            key={i}
            className={cn(
              'h-1.5 w-[18px] rounded-full',
              !mounted || i < remaining ? 'bg-primary-500' : 'bg-card-border'
            )}
          />
        ))}
      </span>
      {mounted
        ? `${remaining} of ${maxUses} free interpretations left today`
        : `${maxUses} free interpretations a day, no sign-up`}
    </p>
  );
}

/**
 * Hero search field that switches between "look up meaning" (emoji search
 * with suggestions) and "interpret message" (hand-off to the interpreter)
 * based on what is typed.
 */
export function Omnibox() {
  const router = useRouter();
  const inputId = useId();
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EmojiSummary[]>([]);
  const [resultsFor, setResultsFor] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messageMode = isMessageLike(query);

  const fetchResults = useCallback(async (value: string): Promise<EmojiSummary[]> => {
    const q = value.trim();
    try {
      const response = await fetch(`/api/emojis/search?q=${encodeURIComponent(q)}&limit=6`);
      const data = await response.json();
      const emojis: EmojiSummary[] = data.emojis || [];
      setResults(emojis);
      setResultsFor(q);
      setActiveIndex(-1);
      setIsOpen(true);
      emojiEvents.search(q, emojis.length);
      if (emojis.length === 0) {
        errorEvents.searchNoResults(q);
      }
      return emojis;
    } catch {
      setResults([]);
      setResultsFor('');
      return [];
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setResults([]);
    setResultsFor('');
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const updateQuery = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim() || isMessageLike(value)) {
        clearSuggestions();
        return;
      }
      debounceRef.current = setTimeout(() => {
        fetchResults(value);
      }, 200);
    },
    [fetchResults, clearSuggestions]
  );

  const goToEmoji = useCallback(
    (emoji: EmojiSummary, position: number) => {
      emojiEvents.searchResultClick(emoji.character, emoji.slug, position);
      setIsOpen(false);
      router.push(`/emoji/${emoji.slug}`);
    },
    [router]
  );

  const submit = useCallback(async () => {
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isMessageLike(q)) {
      router.push(`/interpreter?m=${encodeURIComponent(q)}`);
      return;
    }
    if (isOpen && activeIndex >= 0 && activeIndex < results.length) {
      goToEmoji(results[activeIndex], activeIndex);
      return;
    }
    const list = resultsFor === q ? results : await fetchResults(q);
    setIsOpen(false);
    router.push(resolveLookupHref(q, list));
  }, [query, isOpen, activeIndex, results, resultsFor, fetchResults, goToEmoji, router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const hasList = isOpen && results.length > 0;
    switch (e.key) {
      case 'ArrowDown':
        if (!hasList) return;
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        if (!hasList) return;
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const tryExample = (value: string) => {
    updateQuery(value);
    inputRef.current?.focus();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const showList = isOpen && !messageMode && query.trim().length > 0;
  const modeLabel = messageMode ? 'Interpret message' : 'Look up meaning';

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[720px] text-left">
      <div className="relative">
        <form
          role="search"
          action="/search"
          method="get"
          onSubmit={handleSubmit}
          className={cn(
            'flex items-center gap-2 rounded-[22px] border border-card-border bg-card p-2 pl-4 shadow-soft transition',
            'focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/20'
          )}
        >
          <SearchIcon />
          <label htmlFor={inputId} className="sr-only">
            Search an emoji or paste a message
          </label>
          <input
            ref={inputRef}
            id={inputId}
            name={messageMode ? 'm' : 'q'}
            type="text"
            role="combobox"
            autoComplete="off"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Try 💀, “melting”, or paste: ok sure 🙂"
            aria-expanded={showList}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={
              showList && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
            }
            className="min-w-0 flex-1 bg-transparent px-1 py-3 text-base outline-none placeholder:text-muted-foreground sm:text-lg"
          />
          <span
            data-testid="omnibox-mode"
            data-mode={messageMode ? 'message' : 'lookup'}
            className={cn(
              'hidden whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold sm:inline-flex',
              messageMode ? 'bg-primary-100 text-primary-700' : 'bg-muted text-muted-foreground'
            )}
          >
            {modeLabel}
          </span>
          <span className="sr-only" role="status" aria-live="polite">
            {query.trim() ? `Mode: ${modeLabel}` : ''}
          </span>
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-5 text-base font-medium text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6"
          >
            {messageMode ? 'Decode' : 'Search'}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <ul
          id={listboxId}
          role="listbox"
          aria-label="Emoji suggestions"
          hidden={!showList}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-[420px] overflow-auto rounded-2xl border border-card-border bg-card p-1.5 shadow-pop"
        >
          {showList && results.length === 0 && resultsFor === query.trim() && (
            <li className="px-3 py-3 text-sm text-muted-foreground">
              No emojis match “{query.trim()}”. Press Enter to search everything.
            </li>
          )}
          {showList &&
            results.map((emoji, index) => (
              <li
                key={emoji.slug}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goToEmoji(emoji, index)}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm',
                  index === activeIndex ? 'bg-muted' : 'hover:bg-muted'
                )}
              >
                <span className="w-7 text-center text-[22px]" aria-hidden="true">
                  {emoji.character}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{emoji.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{emoji.tldr}</span>
                </span>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-[18px] flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>Try</span>
        {TRY_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => tryExample(example)}
            className="inline-flex min-h-10 items-center rounded-full border border-card-border bg-card px-3.5 text-sm text-foreground transition hover:border-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {example}
          </button>
        ))}
      </div>

      <UsageLine />
    </div>
  );
}
