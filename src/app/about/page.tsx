import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEnv } from '@/lib/env';

const pageTitle = 'About Us';
const pageDescription =
  'How KnowYourEmoji researches emoji meanings, our editorial standards, and why context matters more than the Unicode definition.';

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
      'emoji methodology',
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

const methodologySteps = [
  {
    title: 'Start with the Unicode definition',
    description:
      'We anchor every emoji to the original Unicode Consortium description so we never invent a meaning that contradicts the platform standard.',
  },
  {
    title: 'Research real-world usage',
    description:
      'We read published linguistic work, watch how creators use the emoji on TikTok and Twitter, and cross-reference community wikis and emoji dictionaries.',
  },
  {
    title: 'Capture platform and generational nuance',
    description:
      'An emoji often means different things in a Slack thread vs. a Tinder DM. We surface those splits on every page instead of pretending there is one universal meaning.',
  },
  {
    title: 'Review before publishing',
    description:
      'Long-form pages are reviewed for tone, accuracy, and originality. Thin pages are either enriched or marked as thin (and de-emphasized in search).',
  },
];

const editorialPillars = [
  {
    title: 'Original writing',
    description:
      'Every entry on the site is written for the question a reader is actually asking — not a rewrite of the Unicode spec.',
  },
  {
    title: 'Specific, not generic',
    description:
      'We avoid filler like "popular in captions and stories." If a sentence could apply to any emoji, it does not belong on the page.',
  },
  {
    title: 'Sourced and dated',
    description:
      'Pages record when they were last reviewed so you can judge whether the meaning still matches current usage.',
  },
  {
    title: 'Honest about limits',
    description:
      'Emoji meaning shifts. We say so when we are uncertain rather than pretending the AI interpreter is definitive.',
  },
];

const whoWeAre = [
  {
    title: 'Operator',
    description:
      'KnowYourEmoji is built and maintained by Marc-Aurele Besner. Source code, commit history, and editorial decisions are public on GitHub.',
  },
  {
    title: 'Funding',
    description:
      'Currently a personal, self-funded project. No paid placements or affiliate-driven emoji rankings — see our editorial policy.',
  },
  {
    title: 'Disclosure',
    description:
      'The AI interpreter uses third-party language models. The site does not permanently store interpreted messages.',
  },
];

/**
 * About page for KnowYourEmoji.com
 *
 * Includes:
 * - Mission statement explaining our purpose
 * - Methodology (the "not just Unicode" section)
 * - Editorial standards
 * - Who operates the site
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
            We explain what emojis actually mean in real conversations — not just what the Unicode
            Consortium named them.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-900" data-testid="mission-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our mission
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

      {/* Methodology Section */}
      <section
        id="methodology"
        className="py-16 bg-gray-50 dark:bg-gray-800 scroll-mt-20"
        data-testid="methodology-section"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
              Methodology
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How we decide what an emoji means
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
              Emoji meaning is not the same as the Unicode definition. Here is the process we use
              for every entry on the site.
            </p>
          </div>
          <ol className="grid md:grid-cols-2 gap-6 list-none [counter-reset:step]">
            {methodologySteps.map((step, index) => (
              <li
                key={step.title}
                className="relative bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shadow-md">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-sm text-gray-500 dark:text-gray-400 text-center max-w-3xl mx-auto">
            Pages without original research — older entries that are still anchored to the Unicode
            description — are clearly marked as thin content and de-emphasized in search while we
            expand our editorial coverage.
          </p>
        </div>
      </section>

      {/* Editorial Standards Section */}
      <section
        className="py-16 bg-white dark:bg-gray-900"
        data-testid="editorial-standards-section"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
              Editorial Standards
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What we publish
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
              We hold every entry on the site to the same four standards. Anything that does not
              meet them is rewritten, not quietly shipped.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {editorialPillars.map((pillar) => (
              <Card key={pillar.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who operates the site */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800" data-testid="who-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
              Who we are
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Who runs KnowYourEmoji
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {whoWeAre.map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-gray-600 dark:text-gray-300">
            Questions, corrections, or partnership ideas?{' '}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-900" data-testid="how-it-works-section">
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
                  Explore our emoji database or search for specific emojis. Each emoji page includes
                  detailed context-aware meanings.
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
      <section className="py-16 bg-gray-50 dark:bg-gray-800" data-testid="trust-section">
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
