/**
 * Display helpers shared by the emoji pages and components.
 *
 * These are plain data/functions (no `fs` access) so they can be used from
 * both server and client components. The data loaders in `@/lib/emoji-data`
 * remain the source of truth for page content; this module only maps enum
 * values to labels and design-system classes.
 */
import type { ContextType, Generation, Platform, RiskLevel } from '@/types/emoji';

export const CONTEXT_LABELS: Record<ContextType, string> = {
  LITERAL: 'Literal',
  SLANG: 'Slang',
  IRONIC: 'Ironic',
  PASSIVE_AGGRESSIVE: 'Passive-Aggressive',
  DATING: 'Dating',
  WORK: 'Work',
  RED_FLAG: 'Red Flag',
};

/** Contexts that have their own `/emoji/context/[context]` hub page. */
export const PAGEABLE_CONTEXTS: ReadonlySet<string> = new Set([
  'SLANG',
  'DATING',
  'WORK',
  'IRONIC',
  'PASSIVE_AGGRESSIVE',
  'RED_FLAG',
]);

export const PLATFORM_LABELS: Record<Platform, string> = {
  IMESSAGE: 'iMessage',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  WHATSAPP: 'WhatsApp',
  SLACK: 'Slack',
  DISCORD: 'Discord',
  TWITTER: 'Twitter/X',
};

export const GENERATION_LABELS: Record<Generation, string> = {
  GEN_Z: 'Gen Z',
  MILLENNIAL: 'Millennial',
  GEN_X: 'Gen X',
  BOOMER: 'Boomer',
};

/** Commonly cited birth-year ranges, shown as secondary text on generation cards. */
export const GENERATION_YEARS: Record<Generation, string> = {
  GEN_Z: 'Born 1997–2012',
  MILLENNIAL: 'Born 1981–1996',
  GEN_X: 'Born 1965–1980',
  BOOMER: 'Born 1946–1964',
};

export function getContextLabel(context: string): string {
  return CONTEXT_LABELS[context as ContextType] || context;
}

export function getPlatformLabel(platform: string): string {
  return PLATFORM_LABELS[platform as Platform] || platform;
}

export function getGenerationLabel(generation: string): string {
  return GENERATION_LABELS[generation as Generation] || generation;
}

export function getGenerationYears(generation: string): string | undefined {
  return GENERATION_YEARS[generation as Generation];
}

/** Risk/severity badge colours: LOW → success, MEDIUM → amber, HIGH → danger. */
export function riskBadgeClass(level: RiskLevel | string): string {
  switch (level) {
    case 'HIGH':
      return 'bg-danger-background text-danger';
    case 'MEDIUM':
      return 'bg-primary-50 text-primary-700';
    default:
      return 'bg-success-background text-success';
  }
}

/** Base classes for the small pill badges used across the emoji pages. */
export const BADGE_CLASS =
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold';

/** Filter / navigation chip (pill) classes. */
export function chipClass(active = false): string {
  return [
    'inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-card-border bg-card text-foreground hover:border-gray-400 dark:hover:border-gray-500',
  ].join(' ');
}

/**
 * Format the code points of an emoji character as `U+XXXX` tokens,
 * dropping variation selector-16 (U+FE0F) which carries no meaning on its own.
 *
 * @example formatCodepoints('💀') // "U+1F480"
 */
export function formatCodepoints(character: string): string {
  return Array.from(character)
    .map((ch) => ch.codePointAt(0) as number)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => `U+${cp.toString(16).toUpperCase()}`)
    .join(' ');
}

/** Chat-bubble classes for example messages. */
export const BUBBLE_CLASS =
  'max-w-full self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm leading-relaxed text-foreground';
