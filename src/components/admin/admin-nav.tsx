'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const adminLinks = [
  { label: 'Emojis', href: '/admin/emojis', icon: '🗂️' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
];

export interface AdminNavProps {
  className?: string;
}

export function AdminNav({ className }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className={cn('flex flex-wrap gap-2', className)}>
      {adminLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== '/admin' && pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              isActive
                ? 'border-foreground bg-foreground text-background'
                : 'border-card-border bg-card text-foreground hover:border-gray-400'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="emoji-display" aria-hidden="true">
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

AdminNav.displayName = 'AdminNav';
