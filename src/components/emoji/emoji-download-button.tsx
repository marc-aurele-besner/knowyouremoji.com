'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { emojiEvents } from '@/lib/analytics';

/**
 * Props for the EmojiDownloadButton component
 */
export interface EmojiDownloadButtonProps {
  /** The emoji character to render */
  character: string;
  /** Name used for the filename and alt text */
  name: string;
  /** URL-friendly identifier for analytics tracking */
  slug?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Renders an emoji character onto a canvas and triggers a PNG download.
 */
export function EmojiDownloadButton({
  character,
  name,
  slug,
  className,
}: EmojiDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Transparent background
      ctx.clearRect(0, 0, size, size);

      // Draw emoji centered
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${size * 0.75}px serif`;
      ctx.fillText(character, size / 2, size / 2);

      // Draw site logo watermark in bottom-right corner
      try {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          logo.onload = () => resolve();
          logo.onerror = () => reject(new Error('Logo failed to load'));
          logo.src = '/logo.png';
        });
        const logoSize = 48;
        const padding = 8;
        ctx.globalAlpha = 0.6;
        ctx.drawImage(
          logo,
          size - logoSize - padding,
          size - logoSize - padding,
          logoSize,
          logoSize
        );
        ctx.globalAlpha = 1;
      } catch {
        // Logo is optional — continue without it
      }

      // Convert to blob and download
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-emoji.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track download event
      if (slug) {
        emojiEvents.download(character, slug);
      }
    } finally {
      setDownloading(false);
    }
  }, [character, name, slug]);

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      size="md"
      aria-label={downloading ? 'Downloading...' : 'Download emoji as image'}
      className={className}
      disabled={downloading}
    >
      <span className="mr-2">{downloading ? '...' : '\u2B07'}</span>
      {downloading ? 'Downloading...' : 'Download Image'}
    </Button>
  );
}
