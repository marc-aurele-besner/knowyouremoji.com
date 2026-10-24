import type { ReactNode } from 'react';
import Link from 'next/link';

const SIDE_EMOJIS = ['🙂', '💀', '👍', '😭', '🫠', '✨'];

export interface AuthShellProps {
  title: string;
  description: string;
  /** Short testimonial-style line shown in the left panel on large screens. */
  quote: string;
  children: ReactNode;
}

/**
 * Split layout for the auth pages: a muted brand panel on the left (≥ lg) and a centered
 * narrow card column on the right that holds the page title and the form.
 */
export function AuthShell({ title, description, quote, children }: AuthShellProps) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2" data-testid="auth-shell">
      <aside
        className="hidden flex-col justify-between gap-6 border-r border-card-border bg-muted p-14 lg:flex"
        aria-label="About KnowYourEmoji"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-foreground"
        >
          <span className="emoji-display text-[22px]" aria-hidden="true">
            🤔
          </span>
          KnowYourEmoji
        </Link>
        <blockquote className="max-w-[460px] text-[28px] leading-snug tracking-tight text-foreground">
          {quote}
        </blockquote>
        <div className="flex gap-3" aria-hidden="true">
          {SIDE_EMOJIS.map((emoji) => (
            <span key={emoji} className="emoji-display text-[28px]">
              {emoji}
            </span>
          ))}
        </div>
      </aside>
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
