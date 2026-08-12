import { LongFormSection, type LongFormContent } from '@/components/ui/long-form-section';
import type { ComboLongForm } from '@/types/combo';

/**
 * Props for the ComboLongFormSection component.
 */
export interface ComboLongFormSectionProps {
  /** Long-form content block from the combo data */
  longForm: ComboLongForm;
  /** Optional extra classes */
  className?: string;
}

/**
 * Thin wrapper that adapts the shared LongFormSection to the combo type.
 */
export function ComboLongFormSection({ longForm, className }: ComboLongFormSectionProps) {
  return (
    <LongFormSection
      longForm={longForm as LongFormContent}
      className={className}
      testId="combo-long-form-section"
    />
  );
}
