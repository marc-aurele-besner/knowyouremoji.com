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
        className={cn('flex flex-col gap-2', className)}
      >
        {CONTEXTS.map((context) => (
          <button
            key={context.value}
            type="button"
            role="radio"
            aria-checked={value === context.value}
            data-selected={value === context.value ? 'true' : undefined}
            disabled={disabled}
            onClick={() => onChange(context.value)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
              'min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              value === context.value
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white hover:bg-gray-100'
            )}
          >
            <span className="text-lg" aria-hidden="true">
              {context.icon}
            </span>
            <div className="flex flex-col">
              <span>{context.label}</span>
              <span
                className={cn(
                  'text-xs',
                  value === context.value ? 'text-blue-100' : 'text-gray-500'
                )}
              >
                {context.description}
              </span>
            </div>
          </button>
        ))}
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
