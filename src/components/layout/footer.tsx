'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { HTMLAttributes } from 'react';
import { engagementEvents } from '@/lib/analytics';

export type FooterProps = HTMLAttributes<HTMLElement>;

const navLinks = [
  { label: 'Emojis', href: '/emoji' },
  { label: 'Interpreter', href: '/interpreter' },
  { label: 'About', href: '/about' },
];

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

function Footer({ className, ...props }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn('border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800', className)}
      {...props}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors dark:text-white dark:hover:text-amber-400"
            >
              <span className="emoji-display">🤔</span>
              <span>KnowYourEmoji</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-xs dark:text-gray-400">
              Understand what emojis really mean in context. Decode social cues, platform
              differences, and generational nuances.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 dark:text-white">Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-amber-600 transition-colors dark:text-gray-400 dark:hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 dark:text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-amber-600 transition-colors dark:text-gray-400 dark:hover:text-amber-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500 text-center dark:text-gray-400">
            © {currentYear} KnowYourEmoji. All rights reserved.
          </p>
          <a
            href="https://github.com/marc-aurele-besner/knowyouremoji.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-amber-600 transition-colors dark:text-gray-500 dark:hover:text-amber-400"
            onClick={() =>
              engagementEvents.externalLinkClick(
                'https://github.com/marc-aurele-besner/knowyouremoji.com',
                'Open Source on GitHub'
              )
            }
          >
            Open Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';

export { Footer };
