import { notFound } from 'next/navigation';
import {
  getEmojiBySlug,
  getAllEmojiSlugs,
  getRelatedEmojis,
  getCategoryDisplayName,
} from '@/lib/emoji-data';
import { getComboSummariesByEmoji } from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { decisionToRobots, getIndexingDecision } from '@/lib/seo-policy';
import { getAllComparisons } from '@/lib/comparison-data';
import { EmojiHeader } from '@/components/emoji/emoji-header';
import { EmojiJsonLd } from '@/components/seo/emoji-json-ld';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RelatedEmojisSection } from '@/components/emoji/related-emojis-section';
import { EmojiCombosSection } from '@/components/emoji/emoji-combos-section';
import { EmojiLongFormSection } from '@/components/emoji/emoji-long-form-section';
import { EmojiConversationExamplesSection } from '@/components/emoji/emoji-conversation-examples-section';
import { EmojiPlatformPreview } from '@/components/emoji/emoji-platform-preview';
import { EmojiTLDR } from '@/components/emoji/emoji-tldr';
import { CopyTextButton } from '@/components/emoji/copy-text-button';
import { EmojiSectionNav, type EmojiSectionNavItem } from '@/components/emoji/emoji-section-nav';
import {
  ContextMeaningCards,
  DetailSection,
  EmojiWarningRows,
  GenerationalNotesGrid,
  PlatformNotesList,
} from '@/components/emoji/emoji-detail-sections';
import { ShareSection } from '@/components/share/share-section';
import { ShareCardDialog } from '@/components/share/share-card-dialog';
import { ShareMeaningButton } from '@/components/share/share-meaning-button';
import { BookBanner } from '@/components/layout/book-banner';
import { EmojiViewTracker } from '@/components/emoji/emoji-view-tracker';
import type { Metadata } from 'next';

interface EmojiPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for emoji pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all emoji pages at build time
 */
export async function generateStaticParams() {
  const slugs = getAllEmojiSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for the emoji page
 * Includes full SEO metadata: Open Graph, Twitter Cards, canonical URLs, keywords, and robots directives
 */
export async function generateMetadata({ params }: EmojiPageProps): Promise<Metadata> {
  const { slug } = await params;
  const emoji = getEmojiBySlug(slug);

  if (!emoji) {
    return {};
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/emoji/${emoji.slug}`;
  const basePageUrl = emoji.skinToneBase ? `${env.appUrl}/emoji/${emoji.skinToneBase}` : undefined;
  const ogTitle = `${emoji.character} ${emoji.name} Emoji Meaning`;

  // Apply the indexing policy from src/lib/seo-policy.ts — see issue #344.
  // - Deep/standard pages → index, follow
  // - Skin-tone variants → noindex, follow, canonical to base
  // - Stub thin pages → noindex, follow
  const indexing = getIndexingDecision(emoji, pageUrl, basePageUrl);

  // Generate keywords array
  const keywords = [
    `${emoji.name.toLowerCase()} emoji`,
    emoji.character,
    `${emoji.character} meaning`,
    `what does ${emoji.character} mean`,
    emoji.shortName,
    emoji.category,
    'emoji meaning',
    'emoji guide',
  ];

  return {
    title: emoji.seoTitle,
    description: emoji.seoDescription,
    keywords,
    alternates: {
      canonical: indexing.canonical || pageUrl,
    },
    openGraph: {
      title: ogTitle,
      description: emoji.tldr,
      type: 'article',
      url: pageUrl,
      siteName: env.appName,
      images: [
        {
          url: `${env.appUrl}/og/emoji/${emoji.slug}.png`,
          width: 1200,
          height: 630,
          alt: `${emoji.character} ${emoji.name} emoji meaning`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: emoji.tldr,
      images: [`${env.appUrl}/og/emoji/${emoji.slug}.png`],
    },
    robots: decisionToRobots(indexing),
  };
}

/**
 * Emoji detail page component
 */
export default async function EmojiPage({ params }: EmojiPageProps) {
  const { slug } = await params;
  const emoji = getEmojiBySlug(slug);
  const env = getEnv();

  if (!emoji) {
    notFound();
  }

  // Get related emojis from the same category
  const relatedEmojis = getRelatedEmojis(slug, 8);

  // Get combos that contain this emoji
  const combosWithEmoji = getComboSummariesByEmoji(slug, 6);

  // Get category display name
  const categoryDisplayName = getCategoryDisplayName(emoji.category);

  // Breadcrumb items for navigation (with category link)
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Emojis', href: '/emoji' },
    { label: categoryDisplayName, href: `/emoji/category/${emoji.category}` },
    { label: `${emoji.character} ${emoji.name}` },
  ];

  // Breadcrumb items for JSON-LD (with name instead of label, including category)
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Emojis', href: '/emoji' },
    { name: categoryDisplayName, href: `/emoji/category/${emoji.category}` },
    { name: `${emoji.character} ${emoji.name}` },
  ];

  // Curated comparison featuring this emoji (only link to pages that exist)
  const comparison = getAllComparisons().find(
    (c) => c.emoji1Slug === emoji.slug || c.emoji2Slug === emoji.slug
  );
  const compareHref = comparison
    ? `/compare/${comparison.emoji1Slug}/${comparison.emoji2Slug}`
    : undefined;

  const pageUrl = `${env.appUrl}/emoji/${emoji.slug}`;
  const hasWarnings = emoji.warnings.length > 0;
  const hasContexts = emoji.contextMeanings.length > 0;
  const hasPlatformNotes = emoji.platformNotes.length > 0;
  const hasGenerationalNotes = emoji.generationalNotes.length > 0;
  const hasConversationExamples = (emoji.conversationExamples?.length ?? 0) > 0;
  const hasRelated = combosWithEmoji.length > 0 || relatedEmojis.length > 0;

  // In-page navigation: every group stays rendered in the DOM; the nav only
  // lists groups that have content.
  const navSections: EmojiSectionNavItem[] = [
    ...(hasContexts || hasWarnings ? [{ id: 'meaning', label: 'Meaning' }] : []),
    { id: 'platforms', label: 'Platforms & generations' },
    ...(hasConversationExamples ? [{ id: 'examples', label: 'Examples' }] : []),
    ...(emoji.longForm ? [{ id: 'deep-dive', label: 'Deep dive' }] : []),
    ...(hasRelated ? [{ id: 'related', label: 'Related' }] : []),
  ];

  return (
    <>
      <EmojiViewTracker slug={slug} />
      {/* JSON-LD structured data for rich snippets */}
      <EmojiJsonLd emoji={emoji} appUrl={env.appUrl} appName={env.appName} />
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-8 md:pt-10">
        {/* Breadcrumb navigation */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6 text-[13px]" />

        {/* Hero: emoji tile, name, metadata badges, actions */}
        <EmojiHeader
          emoji={{
            character: emoji.character,
            name: emoji.name,
            unicode: emoji.unicode,
            shortcodes: [`:${emoji.shortName}:`],
            slug: emoji.slug,
            category: emoji.category,
            categoryName: categoryDisplayName,
            unicodeVersion: emoji.unicodeVersion,
            subcategory: emoji.subcategory,
            updatedAt: emoji.contentUpdatedAt,
          }}
          compareHref={compareHref}
          actions={
            <ShareCardDialog
              character={emoji.character}
              name={emoji.name}
              tldr={emoji.tldr}
              url={pageUrl}
              imageUrl={`${env.appUrl}/og/emoji/${emoji.slug}.png`}
              imageFileName={`${emoji.slug}-meaning.png`}
            />
          }
        />

        {/* TL;DR */}
        <EmojiTLDR
          tldr={emoji.tldr}
          className="mt-7"
          actions={
            <>
              <CopyTextButton text={emoji.tldr} contentType="tldr" ariaLabel="Copy TL;DR" />
              <ShareMeaningButton
                emoji={emoji.character}
                context="TL;DR"
                meaning={emoji.tldr}
                slug={emoji.slug}
                index={-1}
              />
            </>
          }
        />

        <BookBanner className="mt-7" />

        {/* Sticky in-page section navigation (anchor links + scroll-spy) */}
        <EmojiSectionNav sections={navSections} className="mt-8" />

        {/* Meaning: context meanings + warnings */}
        {(hasContexts || hasWarnings) && (
          <div id="meaning" className="scroll-mt-32">
            {hasContexts && (
              <DetailSection id="context-meanings" title="What it means in context">
                <ContextMeaningCards
                  meanings={emoji.contextMeanings}
                  character={emoji.character}
                  slug={emoji.slug}
                />
              </DetailSection>
            )}
            {hasWarnings && <EmojiWarningRows warnings={emoji.warnings} />}
          </div>
        )}

        {/* Platforms & generations */}
        <div id="platforms" className="scroll-mt-32">
          {hasPlatformNotes && (
            <DetailSection id="platform-notes" title="Platform differences">
              <PlatformNotesList notes={emoji.platformNotes} />
            </DetailSection>
          )}
          {hasGenerationalNotes && (
            <DetailSection id="generational-notes" title="Generational differences">
              <GenerationalNotesGrid notes={emoji.generationalNotes} />
            </DetailSection>
          )}
          <EmojiPlatformPreview
            character={emoji.character}
            platformEmojis={[]}
            unicodeVersion={emoji.unicodeVersion}
          />
        </div>

        {/* Examples */}
        {hasConversationExamples && (
          <div id="examples" className="scroll-mt-32">
            <EmojiConversationExamplesSection examples={emoji.conversationExamples!} />
          </div>
        )}

        {/* Deep dive: long-form article + FAQ */}
        {emoji.longForm && (
          <div id="deep-dive" className="scroll-mt-32">
            <DetailSection id="long-read" title="The long read">
              <EmojiLongFormSection longForm={emoji.longForm} />
            </DetailSection>
          </div>
        )}

        {/* Related: combos + related emojis */}
        {hasRelated && (
          <div id="related" className="scroll-mt-32">
            {combosWithEmoji.length > 0 && (
              <EmojiCombosSection
                combos={combosWithEmoji}
                title={`Combos with ${emoji.character}`}
              />
            )}
            {relatedEmojis.length > 0 && <RelatedEmojisSection emojis={relatedEmojis} />}
          </div>
        )}

        {/* Share */}
        <section
          aria-labelledby="share-heading"
          className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-card-border bg-card p-5"
        >
          <div>
            <h2 id="share-heading" className="font-semibold text-foreground">
              Share this meaning
            </h2>
            <p className="text-sm text-muted-foreground">Help a friend decode it.</p>
          </div>
          <ShareSection
            url={pageUrl}
            title={`Check out what ${emoji.character} really means!`}
            description={emoji.tldr}
            hashtags={['emoji', emoji.shortName]}
            contentType="emoji"
            showLabel={false}
          />
        </section>
      </main>
    </>
  );
}
