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
      className={cn('my-8', className)}
      data-testid="combo-conversation-examples-section"
    >
      <h2
        id="combo-conversation-examples-heading"
        className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100"
      >
        Real Conversation Examples
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {examples.map((example, idx) => (
          <article
            key={idx}
            className="rounded-2xl border bg-white/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 p-5 shadow-sm transition-all duration-300"
            data-testid="combo-conversation-example"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
              {SETTING_LABEL[example.setting] ?? example.setting}
            </div>
            <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-3 italic text-gray-900 dark:text-gray-100 mb-3">
              &ldquo;{example.message}&rdquo;
            </blockquote>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {example.interpretation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
