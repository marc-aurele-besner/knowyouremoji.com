'use client';

import { useState, useCallback } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { shareEvents } from '@/lib/analytics';

export type SharePlatform = 'twitter' | 'facebook' | 'copy' | 'native' | 'whatsapp' | 'email';

export interface ShareButtonsProps {
  /** The URL to share */
  url: string;
  /** The title/text to share */
  title: string;
  /** Optional description for native share (Web Share API) */
  description?: string;
  /** Which platforms to show (default: all) */
  platforms?: SharePlatform[];
  /** Hashtags for Twitter share (without #) */
  hashtags?: string[];
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Button size */
  size?: ButtonProps['size'];
  /** Button variant */
  variant?: 'ghost' | 'outline' | 'secondary';
  /** Whether to show text labels */
  showLabels?: boolean;
  /** Additional className */
  className?: string;
  /** Delay in ms before resetting copied state (default: 2000) */
  copyResetDelay?: number;
  /** Content type for analytics tracking (default: 'page') */
  contentType?: string;
  /** Callback when share action is triggered */
  onShare?: (platform: SharePlatform, url: string) => void;
  /** Callback when copy succeeds */
  onCopy?: () => void;
  /** Callback when copy fails */
  onCopyError?: (error: Error) => void;
}

/**
 * ShareButtons component provides Twitter, Facebook, and copy link sharing buttons.
 *
 * @example
 * ```tsx
 * <ShareButtons
 *   url="https://knowyouremoji.com/emoji/fire"
 *   title="Fire Emoji Meaning"
 * />
 *
 * <ShareButtons
 *   url="https://knowyouremoji.com/emoji/fire"
 *   title="Fire Emoji"
 *   platforms={['twitter', 'copy']}
 *   hashtags={['emoji', 'meaning']}
 *   size="sm"
 * />
 * ```
 */
export function ShareButtons({
  url,
  title,
  description,
  platforms = ['twitter', 'facebook', 'copy'],
  hashtags = [],
  direction = 'horizontal',
  size = 'md',
  variant = 'ghost',
  showLabels = true,
  className,
  copyResetDelay = 2000,
  contentType = 'page',
  onShare,
  onCopy,
  onCopyError,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleTwitterShare = useCallback(() => {
    const params = new URLSearchParams({
      text: title,
      url: url,
    });

    if (hashtags.length > 0) {
      params.set('hashtags', hashtags.join(','));
    }

    const twitterUrl = `https://twitter.com/intent/tweet?${params.toString()}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    shareEvents.share('twitter', url, contentType);
    onShare?.('twitter', url);
  }, [url, title, hashtags, contentType, onShare]);

  const handleFacebookShare = useCallback(() => {
    const params = new URLSearchParams({
      u: url,
    });

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    shareEvents.share('facebook', url, contentType);
    onShare?.('facebook', url);
  }, [url, contentType, onShare]);

  const handleCopyLink = useCallback(async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      shareEvents.copyLink(url, contentType);
      onCopy?.();
      onShare?.('copy', url);
      setTimeout(() => setCopied(false), copyResetDelay);
    } catch (error) {
      onCopyError?.(error instanceof Error ? error : new Error('Copy failed'));
    }
  }, [url, copyResetDelay, contentType, onCopy, onCopyError, onShare]);

  const handleNativeShare = useCallback(async () => {
    const shareData: ShareData = {
      title,
      text: description || title,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        shareEvents.share('native', url, contentType);
        onShare?.('native', url);
      }
    } catch {
      // User cancelled or share failed
    }
  }, [url, title, description, contentType, onShare]);

  const handleWhatsAppShare = useCallback(() => {
    const text = `${title} ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    shareEvents.share('whatsapp', url, contentType);
    onShare?.('whatsapp', url);
  }, [url, title, contentType, onShare]);

  const handleEmailShare = useCallback(() => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title} ${url}`)}`;
    window.open(mailtoUrl);
    shareEvents.share('email', url, contentType);
    onShare?.('email', url);
  }, [url, title, contentType, onShare]);

  const buttonSize = size === 'icon' ? 'icon' : size;

  return (
    <div
      role="group"
      aria-label="Share options"
      className={cn('flex gap-2', direction === 'vertical' ? 'flex-col' : 'flex-row', className)}
    >
      {platforms.includes('twitter') && (
        <Button
          variant={variant}
          size={buttonSize}
          onClick={handleTwitterShare}
          aria-label="Share on Twitter"
        >
          <span className={showLabels ? 'mr-2' : ''}>𝕏</span>
          {showLabels && 'Twitter'}
        </Button>
      )}

      {platforms.includes('facebook') && (
        <Button
          variant={variant}
          size={buttonSize}
          onClick={handleFacebookShare}
          aria-label="Share on Facebook"
        >
          <span className={showLabels ? 'mr-2' : ''}>📘</span>
          {showLabels && 'Facebook'}
        </Button>
      )}

      {platforms.includes('copy') && (
        <Button
          variant={copied ? 'secondary' : variant}
          size={buttonSize}
          onClick={handleCopyLink}
          aria-label={copied ? 'Copied!' : 'Copy link'}
        >
          <span className={showLabels ? 'mr-2' : ''}>{copied ? '✓' : '🔗'}</span>
          {showLabels && (copied ? 'Copied!' : 'Copy Link')}
        </Button>
      )}

      {platforms.includes('native') && (
        <Button
          variant={variant}
          size={buttonSize}
          onClick={handleNativeShare}
          aria-label="Share via device"
        >
          <span className={showLabels ? 'mr-2' : ''}>📤</span>
          {showLabels && 'Share'}
        </Button>
      )}

      {platforms.includes('whatsapp') && (
        <Button
          variant={variant}
          size={buttonSize}
          onClick={handleWhatsAppShare}
          aria-label="Share on WhatsApp"
        >
          <span className={showLabels ? 'mr-2' : ''}>💬</span>
          {showLabels && 'WhatsApp'}
        </Button>
      )}

      {platforms.includes('email') && (
        <Button
          variant={variant}
          size={buttonSize}
          onClick={handleEmailShare}
          aria-label="Share via email"
        >
          <span className={showLabels ? 'mr-2' : ''}>📧</span>
          {showLabels && 'Email'}
        </Button>
      )}
    </div>
  );
}
