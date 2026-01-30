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
  return (
    <section className={cn('my-8', className)} aria-labelledby="platforms-heading" role="region">
      <h2
        id="platforms-heading"
        className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100"
      >
        How {character} looks across platforms
      </h2>

      <p className="text-muted-foreground mb-6">
        This emoji was introduced in Unicode {unicodeVersion}. Different platforms may display it
        differently.
      </p>

      {/* Native device preview */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground mb-2">On your device:</p>
        <span
          data-testid="native-preview"
          className="text-6xl select-none"
          role="img"
          aria-label={`${character} on your device`}
        >
          {character}
        </span>
      </div>

      {/* Platform grid */}
      {platformEmojis.length > 0 ? (
        <div
          data-testid="platform-grid"
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
        >
          {platformEmojis.map(({ platform, imageUrl, version }) => (
            <div
              key={platform}
              className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <OptimizedImage
                src={imageUrl}
                alt={`${character} on ${platformLabels[platform]}`}
                width={48}
                height={48}
                className="mb-2"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {platformLabels[platform]}
              </span>
              {version && <span className="text-xs text-muted-foreground">{version}</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          No platform-specific images available for this emoji.
        </p>
      )}
    </section>
  );
}
