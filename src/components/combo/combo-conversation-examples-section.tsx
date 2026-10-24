import { cn } from '@/lib/utils';
import type { ComboConversationExample, ComboConversationSetting } from '@/types/combo';

/**
 * Props for the ComboConversationExamplesSection component
 */
export interface ComboConversationExamplesSectionProps {
  /** Richer conversation examples from the combo data */
  examples: ComboConversationExample[];
  /** Optional extra classes */
  className?: string;
}

/**
 * Display label for each conversation setting.
 */
const SETTING_LABEL: Record<ComboConversationSetting, string> = {
  dating: 'Dating',
  friends: 'Friends',
  work: 'Work',
  family: 'Family',
  social: 'Social',
  other: 'Other',
};

/**
 * ComboConversationExamplesSection renders the optional `conversationExamples`
 * array as a card grid, with one card per setting so readers can scan
 * vibe quickly.
 */
export function ComboConversationExamplesSection({
  examples,
  className,
}: ComboConversationExamplesSectionProps) {
  if (!Array.isArray(examples) || examples.length === 0) return null;

  return (
    <section
      aria-labelledby="combo-conversation-examples-heading"
      className={cn('mt-14', className)}
      data-testid="combo-conversation-examples-section"
    >
      <h2
        id="combo-conversation-examples-heading"
        className="mb-4 text-2xl font-semibold tracking-tight"
      >
        Real Conversation Examples
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {examples.map((example, idx) => (
          <article
            key={idx}
            className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-5"
            data-testid="combo-conversation-example"
          >
            <span className="eyebrow">{SETTING_LABEL[example.setting] ?? example.setting}</span>
            <p className="self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm leading-normal text-foreground">
              {example.message}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {example.interpretation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
