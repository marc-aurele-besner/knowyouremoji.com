import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
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

const cardClass = 'rounded-2xl border border-card-border bg-card p-6 md:p-7';
const labelClass = 'mb-1.5 block text-sm font-medium';
const linkClass =
  'font-medium text-foreground underline decoration-card-border underline-offset-4 hover:decoration-foreground';

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
    <main className="container mx-auto max-w-6xl px-4 pb-16 pt-10">
      <Breadcrumbs items={breadcrumbItems} className="mb-5" />

      <header className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Contact KnowYourEmoji</h1>
        <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">
          We&apos;re a small team that reads every message. Tell us what you spotted, what we got
          wrong, or what we should publish next.
        </p>
      </header>

      <div
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10"
        data-testid="contact-channels-section"
      >
        <div className="flex flex-col gap-4">
          <section className={cardClass} data-testid="contact-channel-github">
            <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
              GitHub Issues
              <span className="rounded-full bg-success-background px-2.5 py-0.5 text-[11.5px] font-semibold text-success">
                Preferred
              </span>
            </h2>
            <p className="mb-4 mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
              For content corrections, bug reports, and feature requests. Public and tracked, so
              other readers and contributors can follow along.
            </p>
            <Button asChild variant="secondary">
              <a href={githubIssueUrl} target="_blank" rel="noopener noreferrer">
                Open an issue on GitHub
                <span aria-hidden="true" className="ml-1.5">
                  ↗
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          </section>

          <section className={cardClass} data-testid="contact-form-section">
            <h2 className="text-xl font-semibold">Send a quick message</h2>
            <p className="mb-5 mt-1.5 text-sm leading-relaxed text-muted-foreground">
              This form opens your email client with our address pre-filled. Nothing is sent from
              this site.
            </p>
            <form
              action="mailto:hello@knowyouremoji.com"
              method="post"
              encType="text/plain"
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Your name
                  </label>
                  <Input id="contact-name" name="name" type="text" placeholder="Jane Doe" />
                </div>
                <div>
                  <label htmlFor="contact-email" className={labelClass}>
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
              </div>
              <div>
                <label htmlFor="contact-topic" className={labelClass}>
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
                <label htmlFor="contact-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Tell us what's wrong, what's missing, or what we should publish next."
                  className="w-full rounded-xl border border-card-border bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-gray-400 transition-[border-color,box-shadow] focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500/25 dark:placeholder:text-gray-500"
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start">
                Open email client
              </Button>
              <p className="text-xs text-muted-foreground">
                We&apos;ll reply within 3 business days. For urgent takedown requests, email
                directly with the word &quot;takedown&quot; in the subject line.
              </p>
            </form>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <section
            className="rounded-2xl border border-card-border bg-card p-5"
            data-testid="contact-channel-email"
          >
            <h2 className="text-base font-semibold">Email</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              For private matters: partnerships, press, sensitive content takedowns, or anything you
              don&apos;t want to file publicly.
            </p>
            <p className="mt-3 break-all text-sm">
              <a href="mailto:hello@knowyouremoji.com" className={linkClass}>
                hello@knowyouremoji.com
              </a>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              We typically reply within 3 business days. There is no human on chat support.
            </p>
          </section>

          <section
            className="rounded-2xl border border-card-border bg-card p-5"
            data-testid="contact-policy-section"
          >
            <h2 className="text-base font-semibold">How we handle messages</h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">3 business days</strong> is our typical response
                window. We&apos;re a small team, so replies sometimes take longer during launches.
              </li>
              <li>
                <strong className="text-foreground">Privacy:</strong> we only use what you send to
                reply. See our{' '}
                <Link href="/privacy" className={linkClass}>
                  Privacy Policy
                </Link>{' '}
                for details.
              </li>
              <li>
                <strong className="text-foreground">Editorial standards:</strong> read our{' '}
                <Link href="/about#methodology" className={linkClass}>
                  methodology
                </Link>{' '}
                to see how we research emoji meanings before suggesting a change.
              </li>
            </ul>
          </section>

          <section
            className="rounded-2xl border border-card-border bg-card p-5"
            data-testid="contact-reasons-section"
          >
            <h2 className="text-base font-semibold">What can we help with?</h2>
            <ul className="mt-3 flex flex-col gap-3.5">
              {contactReasons.map((reason) => (
                <li key={reason.title} className="flex gap-3">
                  <span className="emoji-display text-xl leading-6" aria-hidden="true">
                    {reason.emoji}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{reason.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
