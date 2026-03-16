import Link from 'next/link';
import type { Metadata } from 'next';
import { getEmojiSummaries, getEmojiCount, getAllCategoryInfo } from '@/lib/emoji-data';
import { getComboSummaries, getComboCount } from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

const tickerEmojiChars = [
  '😂',
  '❤️',
  '🔥',
  '✨',
  '🤔',
  '💀',
  '🥺',
  '💯',
  '😭',
  '🙏',
  '😍',
  '🤡',
  '👀',
  '💅',
  '🫠',
  '😈',
  '🥰',
  '🤝',
  '💕',
  '🎯',
];

const featureCards = [
  {
    emoji: '🎯',
    title: 'Context-Aware',
    description:
      "Understand how emoji meaning changes based on context - whether it's work, dating, or casual chat.",
    gradient: 'from-amber-400 to-orange-500',
    tag: 'Smart',
  },
  {
    emoji: '👥',
    title: 'Generation Guide',
    description: 'See how different generations interpret the same emoji - from Gen Z to Boomers.',
    gradient: 'from-purple-400 to-pink-500',
    tag: 'Cultural',
  },
  {
    emoji: '🤖',
    title: 'AI Interpret',
    description:
      'Use our AI-powered interpreter to decode emoji-filled messages and understand hidden meanings.',
    gradient: 'from-cyan-400 to-blue-500',
    tag: 'AI-Powered',
  },
];

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
  const allSummaries = getEmojiSummaries();
  const emojiSummaries = allSummaries.slice(0, 12);
  const comboSummaries = getComboSummaries().slice(0, 8);
  const emojiCount = getEmojiCount();
  const comboCount = getComboCount();
  const categories = getAllCategoryInfo();

  // Build ticker list by matching characters to their summaries for slug links
  const summaryByChar = new Map(allSummaries.map((s) => [s.character, s]));
  const tickerEmojis = tickerEmojiChars
    .map((char) => summaryByChar.get(char))
    .filter((s): s is (typeof allSummaries)[number] => s != null);

  return (
    <>
      {/* Hero Section - Mesh gradient with floating blobs */}
      <section className="relative overflow-hidden mesh-gradient dark:bg-gray-900 py-24 md:py-36 lg:py-40">
        {/* Animated gradient blobs */}
        <div
          className="absolute top-10 left-[10%] w-72 h-72 bg-amber-300/30 dark:bg-amber-500/10 rounded-full animate-morph animate-glow-pulse"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 right-[10%] w-96 h-96 bg-rose-300/20 dark:bg-rose-500/10 rounded-full animate-morph animate-glow-pulse"
          style={{ animationDelay: '2s' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-200/20 dark:bg-violet-500/5 rounded-full animate-morph"
          style={{ animationDelay: '4s' }}
          aria-hidden="true"
        />

        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/30 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 mb-8 animate-slide-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            AI-Powered Emoji Decoder
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight">
            <span className="gradient-text">Know Your</span>
            <br />
            <span className="gradient-text">Emoji</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Decode the{' '}
            <em className="not-italic font-semibold text-gray-900 dark:text-white">real meaning</em>{' '}
            behind every emoji. Context-aware interpretations powered by AI for modern
            communication.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden text-base px-8 py-3 shadow-lg shadow-amber-500/25 dark:shadow-amber-500/10"
            >
              <Link href="/interpreter">
                <span className="relative z-10">Interpret a Message</span>
                <span className="absolute inset-0 animate-shimmer pointer-events-none" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 py-3 hover:scale-105 transition-transform backdrop-blur-sm"
            >
              <Link href="/emoji">Browse All Emojis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Emoji Ticker */}
      <div className="emoji-ticker bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200/60 dark:border-gray-700/60 py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...tickerEmojis, ...tickerEmojis].map((item, i) => (
            <Link
              key={i}
              href={`/emoji/${item.slug}`}
              className="mx-6 text-2xl md:text-3xl opacity-60 hover:opacity-100 hover:scale-125 transition-all select-none inline-block"
              aria-label={item.name}
            >
              {item.character}
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Emojis Section */}
      <section className="py-20 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
              Explore
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              Popular Emojis
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {emojiCount} emoji meanings and counting
            </p>
          </div>
          {emojiSummaries.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
              {emojiSummaries.map((emoji, i) => (
                <Link
                  key={emoji.slug}
                  href={`/emoji/${emoji.slug}`}
                  className="block"
                  aria-label={emoji.name}
                >
                  <Card
                    data-testid="emoji-card"
                    className={`text-center emoji-card-hover rainbow-border opacity-0 animate-bounce-in stagger-${i + 1}`}
                  >
                    <CardContent className="pt-6 pb-4">
                      <span className="emoji-char text-5xl mb-3 block transition-transform">
                        {emoji.character}
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
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
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="hover:scale-105 transition-transform">
              <Link href="/emoji">View All {emojiCount} Emojis</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      {/* Browse by Category Section */}
      <section className="py-20 md:py-24 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
              Categories
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Find emojis organized by type
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.slug}
                href={`/emoji/category/${category.slug}`}
                className="block group"
              >
                <Card className="emoji-card-hover h-full border-2 border-transparent hover:border-amber-400 dark:hover:border-amber-500">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {category.displayName}
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {category.emojiCount} emojis
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      {/* Featured Combos Section */}
      <section className="py-20 md:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
              Combinations
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
              Popular Emoji Combos
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {comboCount} emoji combination meanings decoded
            </p>
          </div>
          {comboSummaries.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {comboSummaries.map((combo) => (
                <Link
                  key={combo.slug}
                  href={`/combo/${combo.slug}`}
                  className="block"
                  aria-label={combo.name}
                >
                  <Card data-testid="combo-card" className="emoji-card-hover rainbow-border h-full">
                    <CardHeader className="text-center pb-2">
                      <span className="text-4xl mb-2 block emoji-char">{combo.combo}</span>
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
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="hover:scale-105 transition-transform">
              <Link href="/combo">View All Combos</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="section-divider" aria-hidden="true" />

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
              Why KnowYourEmoji
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Features
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="emoji-card-hover overflow-hidden group relative">
                <div
                  className={`h-1.5 bg-gradient-to-r ${feature.gradient} transition-all duration-300 group-hover:h-2`}
                />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-white`}
                    >
                      {feature.tag}
                    </span>
                  </div>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl group-hover:animate-wiggle inline-block">
                      {feature.emoji}
                    </span>
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-600 dark:via-orange-600 dark:to-rose-600 animate-gradient" />
        {/* Overlay pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-2xl">
          <div className="text-6xl mb-8 animate-float">🚀</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Decode?</h2>
          <p className="text-amber-100 mb-10 text-lg max-w-md mx-auto">
            Try our AI-powered emoji interpreter and finally understand what those emojis really
            mean.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="hover:scale-110 transition-transform text-base px-8 shadow-xl"
          >
            <Link href="/interpreter">Try the Interpreter</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
