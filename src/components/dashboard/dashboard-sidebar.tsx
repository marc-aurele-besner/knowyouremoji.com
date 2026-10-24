'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { HTMLAttributes } from 'react';

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'History', href: '/dashboard/history', icon: '🕘' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  { label: 'Billing', href: '/dashboard/billing', icon: '💳' },
];

const adminLink = { label: 'Admin', href: '/admin/emojis', icon: '🛠️' };

const itemClass =
  'flex min-h-10 flex-none items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

export type DashboardSidebarProps = HTMLAttributes<HTMLElement>;

/**
 * Dashboard navigation: a sticky vertical list on md+ that collapses into a horizontally
 * scrollable row on small screens. The Admin entry is shown while browsing /admin pages.
 */
function DashboardSidebar({ className, ...props }: DashboardSidebarProps) {
  const pathname = usePathname();
  const inAdmin = pathname.startsWith('/admin');
  const links = inAdmin ? [...sidebarLinks, adminLink] : sidebarLinks;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === adminLink.href) return inAdmin;
    return pathname.startsWith(href);
  };

  return (
    <aside
      data-testid="dashboard-sidebar"
      className={cn(
        '-mx-4 border-b border-card-border md:sticky md:top-[88px] md:mx-0 md:self-start md:border-b-0',
        className
      )}
      {...props}
    >
      <nav
        aria-label="Dashboard"
        className="flex gap-1 overflow-x-auto px-4 pb-3 md:flex-col md:gap-0.5 md:overflow-visible md:px-0 md:pb-0"
      >
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                itemClass,
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span className="emoji-display text-base" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            itemClass,
            'text-left text-muted-foreground hover:bg-muted hover:text-foreground md:mt-2'
          )}
        >
          <span className="emoji-display text-base" aria-hidden="true">
            👋
          </span>
          Sign Out
        </button>
      </nav>
    </aside>
  );
}

DashboardSidebar.displayName = 'DashboardSidebar';

export { DashboardSidebar };
