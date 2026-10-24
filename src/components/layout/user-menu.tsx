'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

export interface UserMenuProps {
  className?: string;
}

/**
 * Header account area: "Sign in / Get started" for guests, an avatar menu
 * (Dashboard, History, Settings, Sign out) for signed-in users.
 */
function UserMenu({ className }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (status === 'loading') {
    return <span className={cn('h-9 w-24', className)} aria-hidden="true" />;
  }

  if (!session?.user) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Link
          href="/login"
          className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          Get started
        </Link>
      </div>
    );
  }

  const name = session.user.name || session.user.email || 'Account';
  const initial = name.charAt(0).toUpperCase();
  const close = () => setOpen(false);
  const itemClass =
    'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-muted transition-colors';

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-56 rounded-2xl border border-card-border bg-card p-1.5 shadow-pop"
        >
          <div className="border-b border-card-border px-3 py-2.5 mb-1.5">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            {session.user.email && (
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            )}
          </div>
          <Link role="menuitem" href="/dashboard" onClick={close} className={itemClass}>
            Dashboard
          </Link>
          <Link role="menuitem" href="/dashboard/history" onClick={close} className={itemClass}>
            History
          </Link>
          <Link role="menuitem" href="/dashboard/settings" onClick={close} className={itemClass}>
            Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            className={itemClass}
            onClick={() => {
              close();
              signOut({ callbackUrl: '/' });
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

UserMenu.displayName = 'UserMenu';

export { UserMenu };
