import { cn } from '@/lib/utils';
import type { EmojiLongForm } from '@/types/emoji';

/**
 * Props for the EmojiLongFormSection component
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

/**
 * Render a labeled article section (heading + paragraphs).
 */
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
    <section aria-labelledby={`${id}-heading`} className="space-y-3">
      <h2 id={`${id}-heading`} className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {heading}
      </h2>
      <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/**
 * Render the FAQ block as a definition list — clear Q/A pairs without an
 * accordion so they remain indexable and printable.
 */
function FaqBlock({ faqs }: { faqs: NonNullable<EmojiLongForm['faqs']> }) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return (
    <section aria-labelledby="faq-heading" className="space-y-4">
      <h2 id="faq-heading" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border-l-4 border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/30 rounded-r-lg p-4"
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{faq.question}</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * EmojiLongFormSection renders the optional article-style `longForm` block
 * for an emoji page. Each sub-section is only rendered when its content is
 * present so thin pages remain visually unchanged.
 */
export function EmojiLongFormSection({ longForm, className }: EmojiLongFormSectionProps) {
  const overview = splitParagraphs(longForm.overview);
  const howPeopleUseIt = splitParagraphs(longForm.howPeopleUseIt);
  const whenNotToUse = splitParagraphs(longForm.whenNotToUse);
  const howToReply = splitParagraphs(longForm.howToReply);
  const faqs = Array.isArray(longForm.faqs) ? longForm.faqs : [];

  const hasAnyContent =
    overview.length > 0 ||
    howPeopleUseIt.length > 0 ||
    whenNotToUse.length > 0 ||
    howToReply.length > 0 ||
    faqs.length > 0;

  if (!hasAnyContent) return null;

  return (
    <div
      className={cn('my-10 space-y-8 prose prose-gray dark:prose-invert max-w-none', className)}
      data-testid="emoji-long-form-section"
    >
      <ArticleBlock id="overview" heading="Overview" paragraphs={overview} />
      <ArticleBlock
        id="how-people-use-it"
        heading="How People Use It"
        paragraphs={howPeopleUseIt}
      />
      <ArticleBlock id="when-not-to-use" heading="When Not to Use It" paragraphs={whenNotToUse} />
      <ArticleBlock id="how-to-reply" heading="How to Reply" paragraphs={howToReply} />
      <FaqBlock faqs={faqs} />
    </div>
  );
}
