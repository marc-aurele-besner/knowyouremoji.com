'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { HTMLAttributes } from 'react';

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
    <footer className={cn('border-t bg-gray-50', className)} {...props}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <span className="emoji-display">🤔</span>
              <span>KnowYourEmoji</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-xs">
              Understand what emojis really mean in context. Decode social cues, platform
              differences, and generational nuances.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {currentYear} KnowYourEmoji. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';

export { Footer };
