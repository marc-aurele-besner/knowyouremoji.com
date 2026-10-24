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

/** Human-readable label for a platform value. */
export function getPlatformLabel(value: Platform | 'OTHER'): string {
  return PLATFORMS.find((p) => p.value === value)?.label ?? value;
}

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
        className={cn('grid grid-cols-1 gap-2 min-[400px]:grid-cols-2', className)}
      >
        {PLATFORMS.map((platform) => {
          const selected = value === platform.value;
          return (
            <button
              key={platform.value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-selected={selected ? 'true' : undefined}
              disabled={disabled}
              onClick={() => {
                interpreterEvents.platformSelect(platform.value);
                onChange(platform.value);
              }}
              className={cn(
                'flex min-h-[44px] items-start gap-2.5 rounded-xl border bg-card px-3 py-2.5 text-left transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                'disabled:pointer-events-none disabled:opacity-50',
                selected
                  ? 'border-primary-500 ring-[3px] ring-primary-500/20'
                  : 'border-card-border hover:border-secondary-500'
              )}
            >
              <span className="mt-0.5 text-lg leading-none" aria-hidden="true">
                {platform.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-foreground">
                  {platform.label}
                </span>
                <span className="block text-xs leading-snug text-muted-foreground">
                  {platform.description}
                </span>
              </span>
            </button>
          );
        })}
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
