/**
 * Centralized primary navigation for KnowYourEmoji.
 *
 * Used by:
 *  - src/components/layout/header.tsx (desktop nav)
 *  - src/components/layout/mobile-nav.tsx (mobile drawer)
 *  - src/components/layout/footer.tsx (Navigation column)
 *
 * Edit this file to add / remove / re-order top-level nav links. The
 * AdSense review (issue #344) flags nav that does not surface editorial
 * content, so this list intentionally mixes tools + editorial + legal.
 */

export interface NavLink {
  /** Display label */
  label: string;
  /** In-app path or absolute URL */
  href: string;
}

export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: 'Emojis', href: '/emoji' },
  { label: 'Combos', href: '/combo' },
  { label: 'Guides', href: '/guides' },
  { label: 'Interpreter', href: '/interpreter' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];
