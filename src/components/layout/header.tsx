'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { HTMLAttributes, useState } from 'react';
import { MobileNav } from './mobile-nav';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { SearchBar } from '@/components/search';
import { navigationEvents } from '@/lib/analytics';

export type HeaderProps = HTMLAttributes<HTMLElement>;

const navLinks = [
  { label: 'Emojis', href: '/emoji' },
  { label: 'Interpreter', href: '/interpreter' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

function Header({ className, ...props }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:border-gray-700/50 dark:supports-[backdrop-filter]:bg-gray-900/60',
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors dark:text-white dark:hover:text-amber-400"
          >
            <span className="emoji-display inline-block group-hover:animate-wiggle transition-transform">
              🤔
            </span>
            <span className="bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
              KnowYourEmoji
            </span>
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
            <SearchBar className="w-48 lg:w-64" />
            <ThemeSwitcher />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => {
                if (!isMobileNavOpen) {
                  navigationEvents.mobileNavOpen();
                }
                setIsMobileNavOpen(!isMobileNavOpen);
              }}
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
