'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface EmojiSectionNavItem {
  /** Id of the target element on the page */
  id: string;
  /** Visible label */
  label: string;
}

export interface EmojiSectionNavProps {
  sections: EmojiSectionNavItem[];
  /**
   * Distance from the top of the viewport (px) at which a section counts as
   * the current one — roughly the sticky header + this nav.
   */
  offset?: number;
  className?: string;
}

/**
 * Sticky in-page navigation for the emoji detail page. Renders plain anchor
 * links (all sections stay in the DOM) and highlights the section currently
 * in view with `aria-current="location"` (scroll-spy).
 */
export function EmojiSectionNav({ sections, offset = 140, className }: EmojiSectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const update = () => {
      let current = sections[0]?.id ?? '';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) {
          current = section.id;
        }
      }
      setActiveId(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sections, offset]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className={cn(
        'sticky top-16 z-30 -mx-4 border-b border-card-border bg-background px-4 md:mx-0 md:px-0',
        className
      )}
    >
      <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <li key={section.id} className="flex-none">
              <a
                href={`#${section.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={() => setActiveId(section.id)}
                className={cn(
                  '-mb-px flex min-h-11 items-center whitespace-nowrap border-b-2 px-3.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
                  active
                    ? 'border-primary-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
