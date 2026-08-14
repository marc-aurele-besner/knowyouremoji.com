import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEnv } from '@/lib/env';

const pageTitle = 'Contact Us';
const pageDescription =
  'Get in touch with the KnowYourEmoji team. Report incorrect emoji meanings, suggest improvements, or ask about partnerships. We respond within 3 business days.';

/**
 * Generate metadata for the contact page including canonical URL
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/contact`;

  return {
    title: `${pageTitle} | ${env.appName}`,
    description: pageDescription,
    keywords: [
      'contact knowyouremoji',
      'emoji feedback',
      'report emoji meaning',
      'suggest emoji',
      'emoji content partnership',
      'editorial correction',
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

const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Contact' }];

const contactReasons = [
  {
    emoji: '✏️',
    title: 'Suggest an edit',
    description:
      'Spotted an emoji meaning that is out of date or missing context? We update pages regularly.',
  },
  {
    emoji: '🤝',
    title: 'Editorial or research partnership',
    description:
      'Researchers, linguists, or publications that want to contribute or co-publish content.',
  },
  {
    emoji: '⚖️',
    title: 'Legal, privacy, or takedown',
    description:
      'Copyright, GDPR / CCPA requests, or content removal. Use the dedicated link in our Privacy Policy.',
  },
  {
    emoji: '🐛',
    title: 'Bug or interpreter issue',
    description:
      'Open an issue on GitHub so the bug stays trackable for other users and contributors.',
  },
];

const githubIssueUrl =
  'https://github.com/marc-aurele-besner/knowyouremoji.com/issues/new?labels=content%2Cfeedback';

/**
 * Contact page for KnowYourEmoji.com
 *
 * Includes:
 * - Primary contact channels (GitHub Issues, email)
 * - Topic-specific routing so messages reach the right person
 * - Realistic response expectation (3 business days)
 * - Editorial policy pointer
 */
export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Contact KnowYourEmoji
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
            We&apos;re a small team that reads every message. Tell us what you spotted, what we got
            wrong, or what we should publish next.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900" data-testid="contact-channels-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="contact-channel-github">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    🐙
                  </span>
                  GitHub Issues (preferred)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  For content corrections, bug reports, and feature requests. Public and tracked, so
                  other readers and contributors can follow along.
                </p>
                <Button asChild>
                  <a href={githubIssueUrl} target="_blank" rel="noopener noreferrer">
                    Open an issue on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="contact-channel-email">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    📬
                  </span>
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  For private matters: partnerships, press, sensitive content takedowns, or anything
                  you don&apos;t want to file publicly.
                </p>
                <p className="text-gray-900 dark:text-white font-medium break-all">
                  <a
                    href="mailto:hello@knowyouremoji.com"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    hello@knowyouremoji.com
                  </a>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We typically reply within 3 business days. There is no human on chat support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-800" data-testid="contact-reasons-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            What can we help with?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {contactReasons.map((reason) => (
              <div
                key={reason.title}
                className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {reason.emoji}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900" data-testid="contact-form-section">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            Send a quick message
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            This form opens your email client with our address pre-filled. Nothing is sent from this
            site.
          </p>
          <form
            action="mailto:hello@knowyouremoji.com"
            method="post"
            encType="text/plain"
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Your name
              </label>
              <Input id="contact-name" name="name" type="text" placeholder="Jane Doe" />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Your email
              </label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="contact-topic"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Topic
              </label>
              <Input
                id="contact-topic"
                name="topic"
                type="text"
                placeholder="Suggestion for 💀 meaning"
              />
            </div>
            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                placeholder="Tell us what's wrong, what's missing, or what we should publish next."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <Button type="submit" className="w-full">
              Open email client
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              We&apos;ll reply within 3 business days. For urgent takedown requests, email directly
              with the word &quot;takedown&quot; in the subject line.
            </p>
          </form>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-800" data-testid="contact-policy-section">
        <div className="container mx-auto px-4 max-w-4xl prose prose-lg dark:prose-invert">
          <h2>How we handle messages</h2>
          <ul>
            <li>
              <strong>3 business days</strong> is our typical response window. We&apos;re a small
              team, so replies sometimes take longer during launches.
            </li>
            <li>
              <strong>Privacy:</strong> we only use what you send to reply. See our{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Privacy Policy
              </Link>{' '}
              for details.
            </li>
            <li>
              <strong>Editorial standards:</strong> read our{' '}
              <Link
                href="/about#methodology"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                methodology
              </Link>{' '}
              to see how we research emoji meanings before suggesting a change.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
