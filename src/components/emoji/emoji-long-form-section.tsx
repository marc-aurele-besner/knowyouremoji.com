import { cn } from '@/lib/utils';
import type { LongFormSectionProps } from '@/components/ui/long-form-section';
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
 * Split a multi-paragraph string into trimmed, non-empty paragraphs.
 * Writers use blank lines (`\n\n`) as paragraph breaks.
 */
function splitParagraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function ArticleBlock({
  id,
  heading,
  paragraphs,
}: {
  id: string;
  heading: string;
  paragraphs: string[];
}) {
  if (paragraphs.length === 0) return null;
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-7 first:mt-0">
      <h3
        id={`${id}-heading`}
        className="mb-2.5 text-[21px] font-semibold tracking-tight text-foreground"
      >
        {heading}
      </h3>
      {paragraphs.map((p, idx) => (
        <p key={idx} className="mb-[18px]">
          {p}
        </p>
      ))}
    </section>
  );
}

/**
 * Long-form article block of the emoji detail page: readable prose
 * (max ~720px) followed by the FAQ as native `<details>` disclosures.
 * FAQ answers stay in the DOM when collapsed, so they remain indexable.
 * Keeps the `data-testid="emoji-long-form-section"` contract.
 */
export function EmojiLongFormSection({ longForm, className }: EmojiLongFormSectionProps) {
  const overview = splitParagraphs(longForm.overview);
  const howPeopleUseIt = splitParagraphs(longForm.howPeopleUseIt);
  const whenNotToUse = splitParagraphs(longForm.whenNotToUse);
  const howToReply = splitParagraphs(longForm.howToReply);
  const faqs = Array.isArray(longForm.faqs) ? longForm.faqs : [];

  const hasProse =
    overview.length > 0 ||
    howPeopleUseIt.length > 0 ||
    whenNotToUse.length > 0 ||
    howToReply.length > 0;

  if (!hasProse && faqs.length === 0) return null;

  return (
    <div className={cn('max-w-[720px]', className)} data-testid="emoji-long-form-section">
      {hasProse && (
        <div className="text-[17px] leading-[1.7] text-foreground">
          <ArticleBlock id="overview" heading="Overview" paragraphs={overview} />
          <ArticleBlock
            id="how-people-use-it"
            heading="How People Use It"
            paragraphs={howPeopleUseIt}
          />
          <ArticleBlock
            id="when-not-to-use"
            heading="When Not to Use It"
            paragraphs={whenNotToUse}
          />
          <ArticleBlock id="how-to-reply" heading="How to Reply" paragraphs={howToReply} />
        </div>
      )}

      {faqs.length > 0 && (
        <section aria-labelledby="faq-heading" className={cn(hasProse && 'mt-8')}>
          <h3 id="faq-heading" className="mb-2 text-xl font-semibold tracking-tight">
            Frequently Asked Questions
          </h3>
          <div>
            {faqs.map((faq, idx) => (
              <details key={idx} className="group border-b border-card-border">
                <summary
                  className={cn(
                    'flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-4 font-semibold text-foreground',
                    '[&::-webkit-details-marker]:hidden',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm'
                  )}
                >
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-xl font-normal text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-4 leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Re-export shared types so existing callers keep working without churn.
export type { LongFormSectionProps };
