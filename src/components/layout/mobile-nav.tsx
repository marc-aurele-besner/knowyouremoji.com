'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SearchBar } from '@/components/search';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { label: 'Emojis', href: '/emoji' },
  { label: 'Interpreter', href: '/interpreter' },
  { label: 'About', href: '/about' },
];

function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div data-testid="mobile-nav" className="fixed inset-0 z-50 md:hidden">
      <div
        data-testid="mobile-nav-overlay"
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        data-testid="mobile-nav-drawer"
        className={cn(
          'fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl dark:bg-gray-900',
          'transform transition-transform duration-300 ease-in-out',
          'translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b dark:border-gray-800">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <span className="emoji-display">🤔</span>
            <span>KnowYourEmoji</span>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="px-4 py-6">
          <div className="mb-6">
            <SearchBar placeholder="Search emojis..." />
          </div>
          <ul className="space-y-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block text-lg font-medium text-gray-900 hover:text-amber-600 transition-colors py-2 dark:text-white dark:hover:text-amber-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

MobileNav.displayName = 'MobileNav';

export { MobileNav };
