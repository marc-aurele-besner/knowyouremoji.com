'use client';

import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

/**
 * Supported platform types for emoji rendering
 */
export type PlatformType = 'apple' | 'google' | 'twitter' | 'samsung' | 'microsoft' | 'facebook';

/**
 * Platform emoji data with image URL and optional version info
 */
export interface PlatformEmoji {
  /** Platform identifier */
  platform: PlatformType;
  /** URL to the emoji image for this platform */
  imageUrl: string;
  /** Optional platform version (e.g., "iOS 14.0", "Android 12") */
  version?: string;
}

/**
 * Props for the EmojiPlatformPreview component
 */
export interface EmojiPlatformPreviewProps {
  /** The emoji character */
  character: string;
  /** Array of platform-specific emoji images */
  platformEmojis: PlatformEmoji[];
  /** Unicode version when this emoji was introduced */
  unicodeVersion: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Human-readable labels for each platform
 */
const platformLabels: Record<PlatformType, string> = {
  apple: 'Apple',
  google: 'Google',
  twitter: 'Twitter/X',
  samsung: 'Samsung',
  microsoft: 'Microsoft',
  facebook: 'Facebook',
};

/**
 * EmojiPlatformPreview displays how an emoji renders across different platforms
 * (Apple, Google, Twitter, Samsung, Microsoft, Facebook).
 *
 * Features:
 * - Shows native device preview (how it looks on your device)
 * - Responsive grid of platform-specific emoji images
 * - Lazy loading for images
 * - Accessible with proper alt text and ARIA attributes
 *
 * @example
 * ```tsx
 * <EmojiPlatformPreview
 *   character="💀"
 *   platformEmojis={[
 *     { platform: 'apple', imageUrl: '/emojis/apple/skull.png', version: '14.0' },
 *     { platform: 'google', imageUrl: '/emojis/google/skull.png' },
 *   ]}
 *   unicodeVersion="6.0"
 * />
 * ```
 */
export function EmojiPlatformPreview({
  character,
  platformEmojis,
  unicodeVersion,
  className,
}: EmojiPlatformPreviewProps) {
  const tile =
    'flex min-w-0 flex-[1_1_96px] flex-col items-center justify-center gap-2 rounded-2xl border border-card-border bg-card px-2 py-3.5 text-xs text-muted-foreground';

  return (
    <section className={cn('mt-14', className)} aria-labelledby="platforms-heading" role="region">
      <h2
        id="platforms-heading"
        className="mb-1.5 text-lg font-semibold tracking-tight text-foreground"
      >
        How {character} looks across platforms
      </h2>

      <p className="mb-4 text-sm text-muted-foreground">
        Introduced in Unicode {unicodeVersion}. Each platform draws its own artwork, so it can look
        slightly different on other devices.
      </p>

      <div data-testid="platform-grid" className="flex flex-wrap gap-3">
        {/* Native device preview */}
        <div className={tile}>
          <span
            data-testid="native-preview"
            className="emoji-display text-[40px] select-none"
            role="img"
            aria-label={`${character} on your device`}
          >
            {character}
          </span>
          On your device
        </div>

        {platformEmojis.length > 0 ? (
          platformEmojis.map(({ platform, imageUrl, version }) => (
            <div key={platform} className={tile}>
              <OptimizedImage
                src={imageUrl}
                alt={`${character} on ${platformLabels[platform]}`}
                width={40}
                height={40}
              />
              <span className="font-medium text-foreground">{platformLabels[platform]}</span>
              {version && <span>{version}</span>}
            </div>
          ))
        ) : (
          <>
            <div className={tile}>
              <span className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground">
                lol {character}
              </span>
              In a message
            </div>
            <div className={tile}>
              <span className="whitespace-nowrap text-sm text-foreground">
                inline <span className="emoji-display">{character}</span> text
              </span>
              Inline size
            </div>
          </>
        )}
      </div>
    </section>
  );
}
