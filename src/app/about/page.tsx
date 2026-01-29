import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEnv } from '@/lib/env';

const pageTitle = 'About Us';
const pageDescription =
  'Learn about KnowYourEmoji - our mission to help you understand emoji meanings in context, how our platform works, and why millions trust us for accurate emoji interpretations.';

/**
 * Generate metadata for the about page including canonical URL
 * Prevents duplicate content issues with canonical link tags
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/about`;

  return {
    title: `${pageTitle} | ${env.appName}`,
    description: pageDescription,
    keywords: [
      'about knowyouremoji',
      'emoji meaning platform',
      'emoji interpreter about',
      'emoji decoder team',
      'emoji translation service',
      'emoji context explanation',
      'how emoji meanings work',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `${pageTitle} | ${env.appName}`,
      description: pageDescription,
      images: [
        {
          url: `${env.appUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${pageTitle} | ${env.appName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | ${env.appName}`,
      description: pageDescription,
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

const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'About' }];

/**
 * About page for KnowYourEmoji.com
 *
 * Includes:
 * - Mission statement explaining our purpose
 * - How it works section explaining the platform
 * - Trust signals section for credibility
 * - CTA to try the interpreter
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            About KnowYourEmoji
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
            Helping you understand what emojis really mean in context.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-900" data-testid="mission-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Mission
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
              Emojis have become an essential part of modern communication. But their meanings
              aren&apos;t always obvious. A single emoji can mean completely different things
              depending on who sends it, the context, and even which platform you&apos;re using.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
              Our mission is simple: to bridge the emoji communication gap. We help you understand
              the real meanings behind emojis, so you can communicate with confidence and avoid
              misunderstandings.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Whether you&apos;re decoding a message from a Gen Z colleague, understanding platform
              differences, or just curious about that emoji someone sent you - we&apos;re here to
              help.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800" data-testid="how-it-works-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <CardTitle>Browse or Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore our comprehensive emoji database or search for specific emojis. Each emoji
                  page includes detailed context-aware meanings.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">2</span>
                </div>
                <CardTitle>Use the Interpreter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Paste any message with emojis into our AI-powered interpreter. It analyzes the
                  context and explains what the emojis likely mean.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">3</span>
                </div>
                <CardTitle>Communicate Better</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Armed with understanding, respond with confidence. No more second-guessing what
                  that message really meant.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-16 bg-white dark:bg-gray-900" data-testid="trust-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Why Trust Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Accurate */}
            <div className="text-center">
              <div className="text-4xl mb-4">
                <span role="img" aria-label="Target">
                  🎯
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Accurate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our interpretations are based on real-world usage, cultural research, and AI
                analysis.
              </p>
            </div>

            {/* Up-to-date */}
            <div className="text-center">
              <div className="text-4xl mb-4">
                <span role="img" aria-label="Refresh">
                  🔄
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Up-to-date
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Emoji meanings evolve. We continuously update our database to reflect current usage.
              </p>
            </div>

            {/* Privacy-focused */}
            <div className="text-center">
              <div className="text-4xl mb-4">
                <span role="img" aria-label="Lock">
                  🔒
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Privacy-first
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We don&apos;t store your interpreted messages. Your conversations stay private.
              </p>
            </div>

            {/* Free to use */}
            <div className="text-center">
              <div className="text-4xl mb-4">
                <span role="img" aria-label="Gift">
                  🎁
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Free to Use
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access emoji meanings and use the interpreter without signing up or paying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Decode Your Messages?</h2>
          <p className="text-blue-100 mb-8">
            Try our AI-powered emoji interpreter and finally understand what those emojis really
            mean.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/interpreter">Try the Interpreter</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/emoji">Browse All Emojis</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
