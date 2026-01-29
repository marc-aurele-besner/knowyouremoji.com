'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { HTMLAttributes, useState } from 'react';
import { MobileNav } from './mobile-nav';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';

export type HeaderProps = HTMLAttributes<HTMLElement>;

const navLinks = [
  { label: 'Emojis', href: '/emoji' },
  { label: 'Interpreter', href: '/interpreter' },
  { label: 'About', href: '/about' },
];

function Header({ className, ...props }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800 dark:supports-[backdrop-filter]:bg-gray-900/60',
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors dark:text-white dark:hover:text-amber-400"
          >
            <span className="emoji-display">🤔</span>
            <span>KnowYourEmoji</span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors dark:text-gray-300 dark:hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
            <ThemeSwitcher />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
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
                {isMobileNavOpen ? (
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
          </div>
        </div>
      </header>

      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
}

Header.displayName = 'Header';

export { Header };
