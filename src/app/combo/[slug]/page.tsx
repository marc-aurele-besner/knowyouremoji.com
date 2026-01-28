import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getComboBySlug, getAllComboSlugs, getRelatedCombos } from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ComboHeader } from '@/components/combo/combo-header';
import { ComboJsonLd } from '@/components/seo/combo-json-ld';
import type { Metadata } from 'next';
import type { EmojiComboSummary } from '@/types/combo';

interface ComboPageProps {
  params: Promise<{ slug: string }>;
}

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
 * Related combo card component
 */
function RelatedComboCard({ combo }: { combo: EmojiComboSummary }) {
  return (
    <Link
      href={`/combo/${combo.slug}`}
      className="block border rounded-lg p-4 bg-card dark:bg-card hover:border-primary hover:shadow-md transition-all"
      aria-label={`${combo.name} combo`}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0">{combo.combo}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
            {combo.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{combo.meaning}</p>
        </div>
      </div>
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

  return (
    <>
      {/* JSON-LD structured data for rich snippets */}
      <ComboJsonLd combo={combo} appUrl={env.appUrl} appName={env.appName} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
        {combo.emojis.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Emojis in this Combo
            </h2>
            <div className="flex flex-wrap gap-2">
              {combo.emojis.map((emojiSlug) => (
                <Link
                  key={emojiSlug}
                  href={`/emoji/${emojiSlug}`}
                  className="inline-flex items-center px-3 py-2 rounded-md border bg-card hover:border-primary hover:shadow-md transition-all text-sm"
                >
                  {emojiSlug}
                </Link>
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
        {relatedCombos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Related Combos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedCombos.map((relatedCombo) => (
                <RelatedComboCard key={relatedCombo.slug} combo={relatedCombo} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
