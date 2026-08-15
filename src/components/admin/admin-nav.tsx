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
    <nav
      aria-label="Admin sections"
      className={cn(
        'flex flex-wrap gap-2 rounded-2xl border border-gray-200/50 bg-white/80 p-2 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/60',
        className
      )}
    >
      {adminLinks.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== '/admin' && pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

AdminNav.displayName = 'AdminNav';
