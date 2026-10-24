import { cn } from '@/lib/utils';
import { BUBBLE_CLASS } from '@/components/emoji/emoji-labels';
import type { ConversationExample, ConversationSetting } from '@/types/emoji';

/**
 * Props for the EmojiConversationExamplesSection component
 */
export interface EmojiConversationExamplesSectionProps {
  /** Richer conversation examples from the emoji data */
  examples: ConversationExample[];
  /** Optional extra classes */
  className?: string;
}

/**
 * Display label for each conversation setting.
 */
const SETTING_LABEL: Record<ConversationSetting, string> = {
  dating: 'Dating',
  friends: 'Friends',
  work: 'Work',
  family: 'Family',
  social: 'Social',
  other: 'Other',
};

/**
 * EmojiConversationExamplesSection renders the optional `conversationExamples`
 * array as a card grid: setting label, the message as a chat bubble and
 * the interpretation underneath.
 */
export function EmojiConversationExamplesSection({
  examples,
  className,
}: EmojiConversationExamplesSectionProps) {
  if (!Array.isArray(examples) || examples.length === 0) return null;

  return (
    <section
      aria-labelledby="conversation-examples-heading"
      className={cn('mt-14', className)}
      data-testid="emoji-conversation-examples-section"
    >
      <h2
        id="conversation-examples-heading"
        className="mb-5 text-2xl font-semibold tracking-tight text-foreground"
      >
        In real conversations
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3">
        {examples.map((example, idx) => (
          <article
            key={idx}
            className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-5"
            data-testid="conversation-example"
          >
            <span className="eyebrow">{SETTING_LABEL[example.setting] ?? example.setting}</span>
            <p className={BUBBLE_CLASS}>{example.message}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {example.interpretation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
