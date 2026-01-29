'use client';

import { cn } from '@/lib/utils';
import type { Platform } from '@/types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { interpreterEvents } from '@/lib/analytics';

/**
 * Platform configuration with display name and icon
 */
interface PlatformConfig {
  value: Platform | 'OTHER';
  label: string;
  icon: string;
  description: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    value: 'IMESSAGE',
    label: 'iMessage',
    icon: '💬',
    description: 'Apple blue bubble culture, read receipts',
  },
  { value: 'INSTAGRAM', label: 'Instagram DM', icon: '📸', description: 'Gen-Z emoji conventions' },
  { value: 'TIKTOK', label: 'TikTok', icon: '🎵', description: 'Viral trends, young audience' },
  {
    value: 'WHATSAPP',
    label: 'WhatsApp',
    icon: '📱',
    description: 'International communication norms',
  },
  { value: 'SLACK', label: 'Slack', icon: '💼', description: 'Professional context' },
  {
    value: 'DISCORD',
    label: 'Discord',
    icon: '🎮',
    description: 'Gaming/internet culture meanings',
  },
  {
    value: 'TWITTER',
    label: 'Twitter/X',
    icon: '🐦',
    description: 'Character limits affect emoji density',
  },
  {
    value: 'OTHER',
    label: 'Other/Unknown',
    icon: '❓',
    description: 'General emoji interpretation',
  },
];

export interface PlatformSelectorProps {
  value: Platform | 'OTHER' | undefined;
  onChange: (platform: Platform | 'OTHER') => void;
  variant?: 'dropdown' | 'buttons';
  disabled?: boolean;
  className?: string;
}

/**
 * Platform selector component for the interpreter tool.
 * Supports dropdown and button group variants with accessible navigation.
 */
export function PlatformSelector({
  value,
  onChange,
  variant = 'dropdown',
  disabled = false,
  className,
}: PlatformSelectorProps) {
  if (variant === 'buttons') {
    return (
      <div
        role="radiogroup"
        aria-label="Select messaging platform"
        className={cn('flex flex-wrap gap-2', className)}
      >
        {PLATFORMS.map((platform) => (
          <button
            key={platform.value}
            type="button"
            role="radio"
            aria-checked={value === platform.value}
            data-selected={value === platform.value ? 'true' : undefined}
            disabled={disabled}
            onClick={() => {
              interpreterEvents.platformSelect(platform.value);
              onChange(platform.value);
            }}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'min-h-[44px] min-w-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-gray-900',
              'disabled:pointer-events-none disabled:opacity-50',
              value === platform.value
                ? 'bg-amber-500 text-white dark:bg-amber-600'
                : 'border border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <span className="text-lg" aria-hidden="true">
              {platform.icon}
            </span>
            <span>{platform.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={(val) => {
          interpreterEvents.platformSelect(val);
          onChange(val as Platform | 'OTHER');
        }}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Select messaging platform">
          <SelectValue placeholder="Select platform..." />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((platform) => (
            <SelectItem key={platform.value} value={platform.value}>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true">{platform.icon}</span>
                <span>{platform.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
