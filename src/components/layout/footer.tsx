'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { HTMLAttributes } from 'react';
import { engagementEvents } from '@/lib/analytics';
import { FOOTER_LINK_GROUPS } from '@/lib/nav-links';

export type FooterProps = HTMLAttributes<HTMLElement>;

function Footer({ className, ...props }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('mt-20 border-t border-card-border bg-background', className)} {...props}>
      <div className="container mx-auto px-4 pt-12 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-foreground"
            >
              <span className="emoji-display text-[22px] inline-block group-hover:animate-wiggle">
                🤔
              </span>
              <span>KnowYourEmoji</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Understand what emojis really mean in context. Decode social cues, platform
              differences, and generational nuances.
            </p>
          </div>

          {FOOTER_LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-[13px] font-semibold text-foreground">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-card-border pt-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} KnowYourEmoji. All rights reserved.</p>
          <a
            href="https://github.com/marc-aurele-besner/knowyouremoji.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
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
