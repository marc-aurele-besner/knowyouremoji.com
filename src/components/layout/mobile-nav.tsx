'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { SearchBar } from '@/components/search';
import { PRIMARY_NAV_LINKS } from '@/lib/nav-links';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { data: session } = useSession();
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-testid="mobile-nav"
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        data-testid="mobile-nav-overlay"
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        data-testid="mobile-nav-drawer"
        className={cn(
          'fixed inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-card-border bg-card shadow-pop',
          'transform transition-transform duration-300 ease-in-out',
          'translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-card-border">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-foreground"
          >
            <span className="emoji-display text-[22px]">🤔</span>
            <span>KnowYourEmoji</span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-card-border text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-1 flex-col px-5 py-5">
          <div className="mb-4">
            <SearchBar placeholder="Search emojis..." />
          </div>
          <ul className="space-y-1">
            {PRIMARY_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-3 text-[17px] font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {session?.user ? (
            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-card-border pt-5">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="rounded-full border border-card-border px-4 py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  signOut({ callbackUrl: '/' });
                }}
                className="rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background hover:opacity-90"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-card-border pt-5">
              <Link
                href="/login"
                onClick={onClose}
                className="rounded-full border border-card-border px-4 py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background hover:opacity-90"
              >
                Get started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

MobileNav.displayName = 'MobileNav';

export { MobileNav };
