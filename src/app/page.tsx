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

const floatingEmojis = [
  { emoji: '😂', top: '10%', left: '5%', delay: '0s', size: '2.5rem' },
  { emoji: '❤️', top: '20%', right: '8%', delay: '1s', size: '2rem' },
  { emoji: '🔥', top: '60%', left: '3%', delay: '2s', size: '2.2rem' },
  { emoji: '✨', top: '15%', right: '15%', delay: '0.5s', size: '1.8rem' },
  { emoji: '🤔', top: '70%', right: '5%', delay: '3s', size: '2rem' },
  { emoji: '💀', top: '40%', left: '8%', delay: '1.5s', size: '1.8rem' },
  { emoji: '🥺', top: '80%', left: '12%', delay: '2.5s', size: '2rem' },
  { emoji: '💯', top: '50%', right: '10%', delay: '0.8s', size: '2.2rem' },
];

const featureCards = [
  {
    emoji: '🎯',
    title: 'Context-Aware',
    description:
      "Understand how emoji meaning changes based on context - whether it's work, dating, or casual chat.",
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    emoji: '👥',
    title: 'Generation Guide',
    description: 'See how different generations interpret the same emoji - from Gen Z to Boomers.',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    emoji: '🤖',
    title: 'AI Interpret',
    description:
      'Use our AI-powered interpreter to decode emoji-filled messages and understand hidden meanings.',
    gradient: 'from-cyan-400 to-blue-500',
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
  const emojiSummaries = getEmojiSummaries().slice(0, 12);
  const comboSummaries = getComboSummaries().slice(0, 8);
  const emojiCount = getEmojiCount();
  const comboCount = getComboCount();
  const categories = getAllCategoryInfo();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-32">
        {/* Floating Background Emojis */}
        {floatingEmojis.map((item, i) => (
          <span
            key={i}
            className="floating-emoji animate-float-slow"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              fontSize: item.size,
              animationDelay: item.delay,
            }}
            aria-hidden="true"
          >
            {item.emoji}
          </span>
        ))}

        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <div className="mb-6 text-6xl md:text-7xl animate-bounce-in">🤔</div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="gradient-text">Know Your Emoji</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Discover the <em>real</em> meaning behind emojis. Context-aware interpretations for
            modern communication.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Button asChild size="lg" className="animate-pulse-glow text-base px-8 py-3">
              <Link href="/interpreter">Interpret a Message</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 py-3 hover:scale-105 transition-transform"
            >
              <Link href="/emoji">Browse All Emojis</Link>
            </Button>
          </div>
        </div>

        {/* Decorative gradient blur */}
        <div
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-gradient-to-r from-amber-300/30 via-pink-300/20 to-purple-300/30 dark:from-amber-500/10 dark:via-pink-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
      </section>

      {/* Popular Emojis Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Popular Emojis
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-lg">
            Explore {emojiCount} emoji meanings
          </p>
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
                      <span className="emoji-char text-5xl mb-2 block">{emoji.character}</span>
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
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="hover:scale-105 transition-transform">
              <Link href="/emoji">View All {emojiCount} Emojis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Browse by Category
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-lg">
            Find emojis organized by type
          </p>
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

      {/* Featured Combos Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Popular Emoji Combos
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-lg">
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
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="hover:scale-105 transition-transform">
              <Link href="/combo">View All Combos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="emoji-card-hover overflow-hidden group">
                <div
                  className={`h-2 bg-gradient-to-r ${feature.gradient} transition-all duration-300 group-hover:h-3`}
                />
                <CardHeader>
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
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 dark:from-amber-600 dark:via-orange-600 dark:to-rose-600 animate-gradient" />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-2xl">
          <div className="text-5xl mb-6 animate-float">🚀</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Decode Your Messages?
          </h2>
          <p className="text-amber-100 mb-8 text-lg">
            Try our AI-powered emoji interpreter and understand what those emojis really mean.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="hover:scale-110 transition-transform text-base px-8"
          >
            <Link href="/interpreter">Try the Interpreter</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
