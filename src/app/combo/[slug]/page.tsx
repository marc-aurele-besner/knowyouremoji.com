import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getComboBySlug, getAllComboSlugs, getRelatedCombos } from '@/lib/combo-data';
import { getEmojiBySlug } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ComboHeader } from '@/components/combo/combo-header';
import { ComboJsonLd } from '@/components/seo/combo-json-ld';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RelatedCombosSection } from '@/components/combo/related-combos-section';
import type { Metadata } from 'next';

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
      canonical: pageUrl,
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:border-primary hover:shadow-md transition-all text-sm"
      aria-label={`${emoji.name} emoji`}
    >
      <span className="text-xl">{emoji.character}</span>
      <span className="text-gray-700 dark:text-gray-300">{emoji.name}</span>
    </Link>
  );
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb navigation */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Header Section */}
        <ComboHeader combo={combo} className="mb-8" />

        {/* Meaning Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meaning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{combo.meaning}</p>
            </CardContent>
          </Card>
        </section>

        {/* Description Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{combo.description}</p>
            </CardContent>
          </Card>
        </section>

        {/* Examples Section */}
        {combo.examples.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Examples
            </h2>
            <div className="space-y-3">
              {combo.examples.map((example, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      &ldquo;{example}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Emojis in this Combo Section */}
        {emojiLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Emojis in this Combo
            </h2>
            <div className="flex flex-wrap gap-2">
              {emojiLinks.map((emoji) => (
                <EmojiLinkCard key={emoji.slug} emoji={emoji} />
              ))}
            </div>
          </section>
        )}

        {/* Tags Section */}
        {combo.tags && combo.tags.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {combo.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
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
