'use client';

import { useState, useEffect } from 'react';
import { ShareButtons, type SharePlatform } from './share-buttons';
import { cn } from '@/lib/utils';

export interface ShareSectionProps {
  /** The URL to share */
  url: string;
  /** The title/text to share */
  title: string;
  /** Optional description for native share */
  description?: string;
  /** Hashtags for Twitter share (without #) */
  hashtags?: string[];
  /** Content type for analytics tracking */
  contentType?: string;
  /** Additional className */
  className?: string;
}

/**
 * Smart share section wrapper with responsive platform selection.
 * On mobile (when navigator.share available): shows native share as primary + other platforms.
 * On desktop: shows inline row of Twitter, Facebook, WhatsApp, Copy Link, Email.
 */
export function ShareSection({
  url,
  title,
  description,
  hashtags,
  contentType,
  className,
}: ShareSectionProps) {
  const desktopPlatforms: SharePlatform[] = ['twitter', 'facebook', 'whatsapp', 'copy', 'email'];
  const mobilePlatforms: SharePlatform[] = ['native', 'twitter', 'copy'];

  // Check navigator.share on mount; default to desktop platforms for SSR
  const [platforms, setPlatforms] = useState<SharePlatform[]>(desktopPlatforms);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setPlatforms(mobilePlatforms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Share</span>
      <ShareButtons
        url={url}
        title={title}
        description={description}
        platforms={platforms}
        hashtags={hashtags}
        size="sm"
        variant="ghost"
        showLabels={false}
        contentType={contentType}
      />
    </div>
  );
}
