'use client';

import { cn } from '@/lib/utils';
import type { RelationshipContext } from '@/types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

/**
 * Context configuration with display name, icon, and description
 */
interface ContextConfig {
  value: RelationshipContext;
  label: string;
  icon: string;
  description: string;
}

const CONTEXTS: ContextConfig[] = [
  {
    value: 'ROMANTIC_PARTNER',
    label: 'Romantic Partner',
    icon: '💕',
    description: 'Dating/married',
  },
  {
    value: 'FRIEND',
    label: 'Friend',
    icon: '👋',
    description: 'Close or casual friend',
  },
  {
    value: 'FAMILY',
    label: 'Family Member',
    icon: '👨‍👩‍👧',
    description: 'Parent, sibling, relative',
  },
  {
    value: 'COWORKER',
    label: 'Coworker/Professional',
    icon: '💼',
    description: 'Work colleague, boss, client',
  },
  {
    value: 'ACQUAINTANCE',
    label: 'Acquaintance',
    icon: '🤝',
    description: 'Someone you know casually',
  },
  {
    value: 'STRANGER',
    label: 'Unknown/Stranger',
    icon: '❓',
    description: "Someone you don't know",
  },
];

/** Human-readable label for a relationship context value. */
export function getContextLabel(value: RelationshipContext): string {
  return CONTEXTS.find((c) => c.value === value)?.label ?? value;
}

export interface ContextSelectorProps {
  value: RelationshipContext | undefined;
  onChange: (context: RelationshipContext) => void;
  variant?: 'radio' | 'select';
  disabled?: boolean;
  className?: string;
}

/**
 * Context selector component for the interpreter tool.
 * Allows users to specify their relationship with the message sender.
 * Supports radio button and select dropdown variants with accessible navigation.
 */
export function ContextSelector({
  value,
  onChange,
  variant = 'radio',
  disabled = false,
  className,
}: ContextSelectorProps) {
  if (variant === 'radio') {
    return (
      <div
        role="radiogroup"
        aria-label="Select relationship context"
        className={cn('grid grid-cols-1 gap-2 min-[400px]:grid-cols-2', className)}
      >
        {CONTEXTS.map((context) => {
          const selected = value === context.value;
          return (
            <button
              key={context.value}
              type="button"
              role="radio"
              aria-checked={selected}
              data-selected={selected ? 'true' : undefined}
              disabled={disabled}
              onClick={() => onChange(context.value)}
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
                {context.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-foreground">
                  {context.label}
                </span>
                <span className="block text-xs leading-snug text-muted-foreground">
                  {context.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Select variant
  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as RelationshipContext)}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Select relationship context">
          <SelectValue placeholder="Select relationship..." />
        </SelectTrigger>
        <SelectContent>
          {CONTEXTS.map((context) => (
            <SelectItem key={context.value} value={context.value}>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true">{context.icon}</span>
                <span>{context.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
