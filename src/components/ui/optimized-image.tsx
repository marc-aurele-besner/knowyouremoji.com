'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Props for the OptimizedImage component
 */
export interface OptimizedImageProps {
  /** Image source URL (internal or external) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image width (not required if fill is true) */
  width?: number;
  /** Image height (not required if fill is true) */
  height?: number;
  /** Fill the parent container */
  fill?: boolean;
  /** Object fit style when using fill */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Object position style when using fill */
  objectPosition?: string;
  /** Load image with priority (above the fold) */
  priority?: boolean;
  /** Image quality (1-100), defaults to 75 */
  quality?: number;
  /** Placeholder type */
  placeholder?: 'blur' | 'empty';
  /** Blur data URL for blur placeholder */
  blurDataURL?: string;
  /** Sizes for responsive images */
  sizes?: string;
  /** Additional CSS class names */
  className?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * OptimizedImage wraps next/image with sensible defaults for performance.
 *
 * Features:
 * - Automatic lazy loading (unless priority is set)
 * - Support for both internal and external images
 * - WebP format conversion (handled by Next.js)
 * - Responsive sizing support
 * - Proper accessibility attributes
 *
 * @example
 * ```tsx
 * // Basic usage with dimensions
 * <OptimizedImage
 *   src="/emoji.png"
 *   alt="Skull emoji"
 *   width={48}
 *   height={48}
 * />
 *
 * // Fill mode for responsive containers
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   fill
 *   objectFit="cover"
 * />
 *
 * // Priority loading for above-the-fold images
 * <OptimizedImage
 *   src="/logo.png"
 *   alt="Site logo"
 *   width={120}
 *   height={40}
 *   priority
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  objectFit,
  objectPosition,
  priority = false,
  quality = 75,
  placeholder,
  blurDataURL,
  sizes,
  className,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const style: React.CSSProperties = {};

  if (fill && objectFit) {
    style.objectFit = objectFit;
  }

  if (fill && objectPosition) {
    style.objectPosition = objectPosition;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      sizes={sizes}
      className={cn(className)}
      style={Object.keys(style).length > 0 ? style : undefined}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
