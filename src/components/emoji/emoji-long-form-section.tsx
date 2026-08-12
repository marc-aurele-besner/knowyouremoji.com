import {
  LongFormSection,
  type LongFormContent,
  type LongFormSectionProps,
} from '@/components/ui/long-form-section';
import type { EmojiLongForm } from '@/types/emoji';

/**
 * Props for the EmojiLongFormSection component.
 * Aliased so consumers don't need to import from `@/types/emoji`.
 */
export interface EmojiLongFormSectionProps {
  /** Long-form content block from the emoji data */
  longForm: EmojiLongForm;
  /** Optional extra classes */
  className?: string;
}

/**
 * Thin wrapper that adapts the shared LongFormSection to the emoji type and
 * keeps the existing `data-testid="emoji-long-form-section"` contract for
 * the page and snapshot tests.
 */
export function EmojiLongFormSection({ longForm, className }: EmojiLongFormSectionProps) {
  return (
    <LongFormSection
      longForm={longForm as LongFormContent}
      className={className}
      testId="emoji-long-form-section"
    />
  );
}

// Re-export shared types so existing callers keep working without churn.
export type { LongFormSectionProps };
