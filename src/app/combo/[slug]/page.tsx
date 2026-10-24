import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getComboBySlug, getAllComboSlugs, getRelatedCombos } from '@/lib/combo-data';
import { getEmojiBySlug } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { decisionToRobots, getComboIndexingDecision } from '@/lib/seo-policy';
import { ShareSection } from '@/components/share/share-section';
import { BookBanner } from '@/components/layout/book-banner';
import { CopySectionButton } from '@/components/ui/copy-section-button';
import { ComboHeader } from '@/components/combo/combo-header';
import { ComboJsonLd } from '@/components/seo/combo-json-ld';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RelatedCombosSection } from '@/components/combo/related-combos-section';
import { ComboLongFormSection } from '@/components/combo/combo-long-form-section';
import { ComboConversationExamplesSection } from '@/components/combo/combo-conversation-examples-section';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

interface ComboPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for combo pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all combo pages at build time
 */
export async function generateStaticParams() {
  const slugs = getAllComboSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for the combo page
 * Includes full SEO metadata: Open Graph, Twitter Cards, canonical URLs, keywords, and robots directives
 */
export async function generateMetadata({ params }: ComboPageProps): Promise<Metadata> {
  const { slug } = await params;
  const combo = getComboBySlug(slug);

  if (!combo) {
    return {};
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/combo/${combo.slug}`;
  const ogTitle = `${combo.combo} ${combo.name} Combo Meaning`;

  // Apply the indexing policy from src/lib/seo-policy.ts — see issue #355.
  // - Deep/standard combos → index, follow
  // - Thin combos → noindex, follow (page still serves users)
  const indexing = getComboIndexingDecision(combo, pageUrl);

  // Generate keywords array
  const keywords = [
    `${combo.name.toLowerCase()} combo`,
    combo.combo,
    `${combo.combo} meaning`,
    `what does ${combo.combo} mean`,
    combo.category,
    'emoji combo',
    'emoji combination',
    ...(combo.tags || []),
  ];

  return {
    title: combo.seoTitle,
    description: combo.seoDescription,
    keywords,
    alternates: {
      canonical: indexing.canonical || pageUrl,
    },
    openGraph: {
      title: ogTitle,
      description: combo.meaning,
      type: 'article',
      url: pageUrl,
      siteName: env.appName,
      images: [
        {
          url: `${env.appUrl}/og/combo/${combo.slug}.png`,
          width: 1200,
          height: 630,
          alt: `${combo.combo} ${combo.name} combo meaning`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: combo.meaning,
      images: [`${env.appUrl}/og/combo/${combo.slug}.png`],
    },
    robots: decisionToRobots(indexing),
  };
}

/**
 * Emoji link with character display
 */
interface EmojiLinkInfo {
  slug: string;
  character: string;
  name: string;
}

function EmojiLinkCard({ emoji }: { emoji: EmojiLinkInfo }) {
  return (
    <Link
      href={`/emoji/${emoji.slug}`}
      className="flex min-h-[132px] flex-col gap-2 rounded-2xl border border-card-border bg-card p-4 text-foreground transition-[border-color,box-shadow] hover:border-primary-500/60 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      aria-label={`${emoji.name} emoji`}
    >
      <span className="emoji-display text-[40px] leading-none" aria-hidden="true">
        {emoji.character}
      </span>
      <span className="truncate text-[14.5px] font-semibold">{emoji.name}</span>
    </Link>
  );
}

/** Section heading used for every block on the combo detail page. */
function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-2xl font-semibold tracking-tight">{children}</h2>;
}

/**
 * Combo detail page component
 */
export default async function ComboPage({ params }: ComboPageProps) {
  const { slug } = await params;
  const combo = getComboBySlug(slug);
  const env = getEnv();

  if (!combo) {
    notFound();
  }

  // Get related combos
  const relatedCombos = getRelatedCombos(slug, 6);

  // Get emoji info for each emoji in the combo
  const emojiLinks: EmojiLinkInfo[] = combo.emojis
    .map((emojiSlug) => {
      const emoji = getEmojiBySlug(emojiSlug);
      return emoji ? { slug: emojiSlug, character: emoji.character, name: emoji.name } : null;
    })
    .filter((emoji): emoji is EmojiLinkInfo => emoji !== null);

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Combos', href: '/combo' },
    { label: `${combo.combo} ${combo.name}` },
  ];

  // Breadcrumb items for JSON-LD (with name instead of label)
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Combos', href: '/combo' },
    { name: `${combo.combo} ${combo.name}` },
  ];

  return (
    <>
      {/* JSON-LD structured data for rich snippets */}
      <ComboJsonLd combo={combo} appUrl={env.appUrl} appName={env.appName} />
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <main className="container mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Breadcrumb navigation */}
        <Breadcrumbs items={breadcrumbItems} className="mb-5" />

        {/* Hero: combo tile, name, badges, copy + share, meaning panel */}
        <ComboHeader
          combo={combo}
          actions={
            <ShareSection
              url={`${env.appUrl}/combo/${combo.slug}`}
              title={`${combo.combo} ${combo.name} - see what it really means!`}
              description={combo.meaning}
              hashtags={['emoji', 'emojicombo']}
              contentType="combo"
            />
          }
          meaningAction={<CopySectionButton text={combo.meaning} contentType="combo-meaning" />}
        />

        <section className="mt-14">
          <BookBanner />
        </section>

        {/* Description Section */}
        <section className="mt-14 max-w-[720px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">What it says</h2>
            <CopySectionButton text={combo.description} contentType="combo-description" />
          </div>
          <p className="text-[17px] leading-[1.7] text-foreground">{combo.description}</p>
        </section>

        {/* Long-Form Content (CONTENT-P1-001) */}
        {combo.longForm && (
          <ComboLongFormSection
            longForm={combo.longForm}
            className="mt-14 max-w-[720px] text-[17px] leading-[1.7]"
          />
        )}

        {/* Conversation Examples (CONTENT-P1-001) */}
        {combo.conversationExamples && combo.conversationExamples.length > 0 && (
          <ComboConversationExamplesSection examples={combo.conversationExamples} />
        )}

        {/* Examples Section */}
        {combo.examples.length > 0 && (
          <section className="mt-14">
            <SectionTitle>Examples</SectionTitle>
            <ul className="flex flex-col gap-2">
              {combo.examples.map((example, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-card px-4 py-3.5"
                >
                  <p className="min-w-0 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm leading-normal text-foreground">
                    {example}
                  </p>
                  <CopySectionButton text={example} contentType="combo-example" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Emojis in this Combo Section */}
        {emojiLinks.length > 0 && (
          <section className="mt-14">
            <SectionTitle>Emojis in this Combo</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(168px,1fr))]">
              {emojiLinks.map((emoji) => (
                <EmojiLinkCard key={emoji.slug} emoji={emoji} />
              ))}
            </div>
          </section>
        )}

        {/* Related Combos Section */}
        {relatedCombos.length > 0 && <RelatedCombosSection combos={relatedCombos} />}
      </main>
    </>
  );
}
