'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HTMLAttributes, useState } from 'react';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: '📊' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
  { label: 'History', href: '/dashboard/history', icon: '📜' },
  { label: 'Billing', href: '/dashboard/billing', icon: '💳' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export type DashboardSidebarProps = HTMLAttributes<HTMLElement>;

function DashboardSidebar({ className, ...props }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const navContent = (
    <nav aria-label="Dashboard" className="flex flex-col gap-1 p-4">
      {sidebarLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive(link.href)
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
          )}
          aria-current={isActive(link.href) ? 'page' : undefined}
        >
          <span className="emoji-display text-lg" aria-hidden="true">
            {link.icon}
          </span>
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        aria-label="Toggle dashboard menu"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg md:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="dashboard-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 border-r border-gray-200/50 bg-white/95 backdrop-blur-sm transition-transform duration-300 dark:border-gray-700/50 dark:bg-gray-900/95 md:sticky md:top-14 md:z-0 md:h-[calc(100vh-3.5rem)] md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        {...props}
      >
        <div className="flex h-14 items-center border-b border-gray-200/50 px-4 dark:border-gray-700/50 md:hidden">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</span>
        </div>
        {navContent}
      </aside>
    </>
  );
}

DashboardSidebar.displayName = 'DashboardSidebar';

export { DashboardSidebar };
