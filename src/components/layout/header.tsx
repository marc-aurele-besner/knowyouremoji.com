'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HTMLAttributes, useState } from 'react';
import { MobileNav } from './mobile-nav';
import { UserMenu } from './user-menu';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { SearchBar } from '@/components/search';
import { navigationEvents } from '@/lib/analytics';
import { PRIMARY_NAV_LINKS } from '@/lib/nav-links';

export type HeaderProps = HTMLAttributes<HTMLElement>;

/** True when `href` is the current section (e.g. /emoji/skull is inside /emoji). */
export function isNavLinkActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Header({ className, ...props }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  // The home page hero carries its own omnibox, so the header search would be redundant there.
  const showSearch = pathname !== '/';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-card-border bg-background/85 backdrop-blur-xl backdrop-saturate-150',
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link
            href="/"
            className="group flex flex-none items-center gap-2.5 text-[17px] font-semibold tracking-tight text-foreground"
          >
            <span className="emoji-display text-[22px] inline-block group-hover:animate-wiggle">
              🤔
            </span>
            <span>KnowYourEmoji</span>
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
            {PRIMARY_NAV_LINKS.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {showSearch && <SearchBar className="hidden md:block w-52 xl:w-64" />}
            <ThemeSwitcher />
            <UserMenu className="hidden md:flex" />
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isMobileNavOpen}
              onClick={() => {
                if (!isMobileNavOpen) {
                  navigationEvents.mobileNavOpen();
                }
                setIsMobileNavOpen(!isMobileNavOpen);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-card text-foreground hover:bg-muted lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
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
