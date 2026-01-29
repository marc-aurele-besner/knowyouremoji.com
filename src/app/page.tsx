import Link from 'next/link';
import type { Metadata } from 'next';
import { getEmojiSummaries, getEmojiCount, getAllCategoryInfo } from '@/lib/emoji-data';
import { getComboSummaries, getComboCount } from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const defaultDescription =
  'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.';

/**
 * Generate metadata for the homepage including canonical URL
 * Prevents duplicate content issues with canonical link tags
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/`;

  return {
    title: `${env.appName} - Decode What Emojis Really Mean`,
    description: defaultDescription,
    keywords: [
      'emoji meaning',
      'emoji interpreter',
      'what does emoji mean',
      'emoji decoder',
      'emoji translator',
      'emoji guide',
      'emoji dictionary',
      'emoji context',
      'gen z emoji',
      'millennial emoji',
      'emoji slang',
      'text message emoji',
      'emoji explanation',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `${env.appName} - Decode What Emojis Really Mean`,
      description: defaultDescription,
      images: [
        {
          url: `${env.appUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${env.appName} - Decode What Emojis Really Mean`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${env.appName} - Decode What Emojis Really Mean`,
      description: defaultDescription,
      images: [`${env.appUrl}/og-image.png`],
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
 * Homepage for KnowYourEmoji.com
 *
 * Includes:
 * - Hero section with headline and description
 * - Features section highlighting platform capabilities
 * - CTA links to interpreter and emoji browsing
 * - Sample emojis grid
 * - Featured emoji combos section
 */
export default function HomePage() {
  // Get sample emojis and combos for display - show more on homepage
  const emojiSummaries = getEmojiSummaries().slice(0, 12);
  const comboSummaries = getComboSummaries().slice(0, 8);
  const emojiCount = getEmojiCount();
  const comboCount = getComboCount();
  const categories = getAllCategoryInfo();

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Know Your Emoji
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover the real meaning behind emojis. Context-aware interpretations for modern
              communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/interpreter">Interpret a Message</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/emoji">Browse All Emojis</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Context-Aware Feature */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Context-Aware
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Understand how emoji meaning changes based on context - whether it&apos;s work,
                    dating, or casual chat.
                  </p>
                </CardContent>
              </Card>

              {/* Generational Differences Feature */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Generation Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    See how different generations interpret the same emoji - from Gen Z to Boomers.
                  </p>
                </CardContent>
              </Card>

              {/* AI Interpreter Feature */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    AI Interpret
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Use our AI-powered interpreter to decode emoji-filled messages and understand
                    hidden meanings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Emojis Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Popular Emojis
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Explore {emojiCount} emoji meanings
            </p>
            {emojiSummaries.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
                {emojiSummaries.map((emoji) => (
                  <Link
                    key={emoji.slug}
                    href={`/emoji/${emoji.slug}`}
                    className="block"
                    aria-label={emoji.name}
                  >
                    <Card
                      data-testid="emoji-card"
                      className="text-center hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      <CardContent className="pt-6 pb-4">
                        <span className="text-5xl mb-2 block">{emoji.character}</span>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {emoji.name}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No emojis available yet.</p>
            )}
            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link href="/emoji">View All {emojiCount} Emojis</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Browse by Category Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Find emojis organized by type
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`/emoji/category/${category.slug}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg hover:border-amber-500 transition-all duration-200 h-full">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {category.displayName}
                      </h3>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {category.emojiCount} emojis
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Combos Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Popular Emoji Combos
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Discover {comboCount} emoji combination meanings
            </p>
            {comboSummaries.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {comboSummaries.map((combo) => (
                  <Link
                    key={combo.slug}
                    href={`/combo/${combo.slug}`}
                    className="block"
                    aria-label={combo.name}
                  >
                    <Card
                      data-testid="combo-card"
                      className="hover:shadow-lg hover:scale-105 transition-all duration-200 h-full"
                    >
                      <CardHeader className="text-center pb-2">
                        <span className="text-4xl mb-2 block">{combo.combo}</span>
                        <CardTitle className="text-base">{combo.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                          {combo.meaning}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No combos available yet.</p>
            )}
            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link href="/combo">View All Combos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Decode Your Messages?</h2>
            <p className="text-amber-100 mb-8">
              Try our AI-powered emoji interpreter and understand what those emojis really mean.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/interpreter">Try the Interpreter</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
