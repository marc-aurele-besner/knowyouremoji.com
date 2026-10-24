import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
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

const howItWorks = [
  {
    emoji: '🔍',
    title: 'Browse or Search',
    description:
      'Explore our emoji database or search for specific emojis. Each emoji page includes detailed context-aware meanings.',
  },
  {
    emoji: '💬',
    title: 'Use the Interpreter',
    description:
      'Paste any message with emojis into our AI-powered interpreter. It analyzes the context and explains what the emojis likely mean.',
  },
  {
    emoji: '🤝',
    title: 'Communicate Better',
    description:
      'Armed with understanding, respond with confidence. No more second-guessing what that message really meant.',
  },
];

const trustSignals = [
  {
    emoji: '🎯',
    label: 'Target',
    title: 'Accurate',
    description:
      'Our interpretations are based on real-world usage, cultural research, and AI analysis.',
  },
  {
    emoji: '🔄',
    label: 'Refresh',
    title: 'Up-to-date',
    description:
      'Emoji meanings evolve. We continuously update our database to reflect current usage.',
  },
  {
    emoji: '🔒',
    label: 'Lock',
    title: 'Privacy-first',
    description: "We don't store your interpreted messages. Your conversations stay private.",
  },
  {
    emoji: '🎁',
    label: 'Gift',
    title: 'Free to Use',
    description: 'Access emoji meanings and use the interpreter without signing up or paying.',
  },
];

const sectionTitle = 'text-2xl font-semibold tracking-tight md:text-[28px]';
const cardClass = 'rounded-2xl border border-card-border bg-card p-5';

/**
 * About page for KnowYourEmoji.com
 *
 * Includes:
 * - Mission statement explaining our purpose
 * - How it works
 * - Methodology (the "not just Unicode" section)
 * - Editorial standards
 * - Trust signals section for credibility
 * - Who operates the site
 * - CTA to try the interpreter
 */
export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 pb-16 pt-10">
      <Breadcrumbs items={breadcrumbItems} className="mb-5" />

      {/* Header Section */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-700">
          About KnowYourEmoji
        </p>
        <h1 className="mt-2.5 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          We explain what emojis <em className="accent-serif">actually</em> mean in real
          conversations.
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] text-muted-foreground">
          Not just what the Unicode Consortium named them.
        </p>
      </header>

      {/* Mission Section */}
      <section className="mt-14" data-testid="mission-section">
        <p className="eyebrow">Our mission</p>
        <div className="mt-3 max-w-[720px] space-y-4 text-[17px] leading-[1.7]">
          <p>
            Emojis have become an essential part of modern communication. But their meanings
            aren&apos;t always obvious. A single emoji can mean completely different things
            depending on who sends it, the context, and even which platform you&apos;re using.
          </p>
          <p>
            Our mission is simple: to bridge the emoji communication gap. We help you understand the
            real meanings behind emojis, so you can communicate with confidence and avoid
            misunderstandings.
          </p>
          <p>
            Whether you&apos;re decoding a message from a Gen Z colleague, understanding platform
            differences, or just curious about that emoji someone sent you - we&apos;re here to
            help.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mt-14" data-testid="how-it-works-section">
        <h2 className={sectionTitle}>How It Works</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {howItWorks.map((step) => (
            <div key={step.title} className={cardClass}>
              <span className="emoji-display text-[28px] leading-none" aria-hidden="true">
                {step.emoji}
              </span>
              <h3 className="mb-1.5 mt-3 text-[17px] font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="mt-14 scroll-mt-24" data-testid="methodology-section">
        <p className="eyebrow">Methodology</p>
        <h2 className={`${sectionTitle} mt-2`}>How we decide what an emoji means</h2>
        <p className="mt-2 max-w-[680px] text-muted-foreground">
          Emoji meaning is not the same as the Unicode definition. Here is the process we use for
          every entry on the site.
        </p>
        <ol className="mt-5 grid list-none gap-3 md:grid-cols-2">
          {methodologySteps.map((step, index) => (
            <li key={step.title} className={cardClass}>
              <span className="font-mono text-sm text-muted-foreground">0{index + 1}</span>
              <h3 className="mb-1.5 mt-2 text-[17px] font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 max-w-[680px] text-sm text-muted-foreground">
          Pages without original research — older entries that are still anchored to the Unicode
          description — are clearly marked as thin content and de-emphasized in search while we
          expand our editorial coverage.
        </p>
      </section>

      {/* Editorial Standards Section */}
      <section className="mt-14" data-testid="editorial-standards-section">
        <p className="eyebrow">Editorial Standards</p>
        <h2 className={`${sectionTitle} mt-2`}>What we publish</h2>
        <p className="mt-2 max-w-[680px] text-muted-foreground">
          We hold every entry on the site to the same four standards. Anything that does not meet
          them is rewritten, not quietly shipped.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {editorialPillars.map((pillar, index) => (
            <div key={pillar.title} className={cardClass}>
              <span className="font-mono text-sm text-muted-foreground">0{index + 1}</span>
              <h3 className="mb-1.5 mt-2 text-[17px] font-semibold">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="mt-14" data-testid="trust-section">
        <h2 className={sectionTitle}>Why Trust Us</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustSignals.map((signal) => (
            <div key={signal.title} className={cardClass}>
              <span className="text-[28px] leading-none" role="img" aria-label={signal.label}>
                {signal.emoji}
              </span>
              <h3 className="mb-1.5 mt-3 text-[17px] font-semibold">{signal.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{signal.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who operates the site */}
      <section className="mt-14" data-testid="who-section">
        <p className="eyebrow">Who we are</p>
        <h2 className={`${sectionTitle} mt-2`}>Who runs KnowYourEmoji</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {whoWeAre.map((item) => (
            <div key={item.title} className={cardClass}>
              <h3 className="mb-1.5 text-[17px] font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-muted-foreground">
          Questions, corrections, or partnership ideas?{' '}
          <Link
            href="/contact"
            className="font-medium text-foreground underline decoration-card-border underline-offset-4 hover:decoration-foreground"
          >
            Contact us
          </Link>
          .
        </p>
      </section>

      {/* CTA Section */}
      <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-foreground p-7 text-background md:p-12">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-[34px]">
            Ready to Decode Your Messages?
          </h2>
          <p className="mt-1.5 max-w-xl opacity-75">
            Try our AI-powered emoji interpreter and finally understand what those emojis really
            mean.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg" variant="brand">
            <Link href="/interpreter">Try the Interpreter</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-background/30 bg-transparent text-background hover:bg-background/10"
          >
            <Link href="/emoji">Browse All Emojis</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
