import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { getEnv } from '@/lib/env';

const pageTitle = 'Privacy Policy';
const pageDescription =
  'Read the Privacy Policy for KnowYourEmoji. Learn how we handle your data, what information we collect, and how we protect your privacy.';

/**
 * Generate metadata for the privacy page including canonical URL
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/privacy`;

  return {
    title: pageTitle,
    description: pageDescription,
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

const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }];

/** Section headings, in order, for the contents aside. */
const sections = [
  '1. Information We Collect',
  '2. How We Use Your Information',
  '3. Data Sharing',
  '4. Cookies and Local Storage',
  '5. Data Security',
  "6. Children's Privacy",
  '7. Open Source',
  '8. Changes to This Policy',
  '9. Contact',
];

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 pb-16 pt-10">
      <Breadcrumbs items={breadcrumbItems} className="mb-5" />

      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">
          Your privacy matters to us. Here&apos;s how we handle your data.
        </p>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
        <article className="order-2 max-w-[720px] space-y-10 text-[17px] leading-[1.7] lg:order-1">
          <div id="section-1" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              KnowYourEmoji is designed with privacy in mind. Here&apos;s what we collect:
            </p>
            <ul className="list-disc space-y-2 pl-6 marker:text-muted-foreground">
              <li>
                <strong>Interpreter messages:</strong> Messages submitted to the AI interpreter are
                sent to our AI provider for processing. We do not permanently store the content of
                your interpreted messages.
              </li>
              <li>
                <strong>Usage data:</strong> We collect anonymous usage analytics (page views,
                feature usage) to improve the Service. This data is collected via Google Analytics
                and PostHog.
              </li>
              <li>
                <strong>Rate limit data:</strong> We use localStorage in your browser to track daily
                usage counts for the free interpreter tier. This data stays on your device.
              </li>
              <li>
                <strong>Error reports:</strong> We use Sentry to collect error reports that help us
                fix bugs. These may include technical details about your browser and session but no
                personal information.
              </li>
            </ul>
          </div>

          <div id="section-2" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">
              2. How We Use Your Information
            </h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc space-y-2 pl-6 marker:text-muted-foreground">
              <li>Provide and maintain the Service</li>
              <li>Process your emoji interpretation requests</li>
              <li>Improve and optimize the user experience</li>
              <li>Monitor and fix errors and performance issues</li>
            </ul>
          </div>

          <div id="section-3" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">3. Data Sharing</h2>
            <p className="mb-3">
              We do not sell your personal data. We share data only with the following service
              providers necessary to operate the Service:
            </p>
            <ul className="list-disc space-y-2 pl-6 marker:text-muted-foreground">
              <li>
                <strong>OpenRouter / AI providers:</strong> To process interpreter requests
              </li>
              <li>
                <strong>Google Analytics:</strong> For anonymous usage analytics
              </li>
              <li>
                <strong>PostHog:</strong> For product analytics
              </li>
              <li>
                <strong>Sentry:</strong> For error monitoring
              </li>
              <li>
                <strong>Vercel:</strong> For hosting and infrastructure
              </li>
            </ul>
          </div>

          <div id="section-4" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">
              4. Cookies and Local Storage
            </h2>
            <p>
              We use cookies and localStorage for essential functionality such as theme preferences
              and rate limiting. Third-party analytics services may set their own cookies. You can
              disable cookies in your browser settings, though this may affect some features.
            </p>
          </div>

          <div id="section-5" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">5. Data Security</h2>
            <p>
              We take reasonable measures to protect your information. All data is transmitted over
              HTTPS. However, no method of transmission over the Internet is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </div>

          <div id="section-6" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">
              6. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed at children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information from
              a child under 13, please contact us so we can remove it.
            </p>
          </div>

          <div id="section-7" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">7. Open Source</h2>
            <p>
              KnowYourEmoji is open source. You can review exactly how we handle data by examining
              our source code on{' '}
              <Link
                href="https://github.com/marc-aurele-besner/knowyouremoji.com"
                className="font-medium underline decoration-card-border underline-offset-4 hover:decoration-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
              .
            </p>
          </div>

          <div id="section-8" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of
              significant changes by updating the date at the bottom of this page. Continued use of
              the Service after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          <div id="section-9" className="scroll-mt-24">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">9. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please reach out via our{' '}
              <Link
                href="/contact"
                className="font-medium underline decoration-card-border underline-offset-4 hover:decoration-foreground"
              >
                Contact page
              </Link>
              .
            </p>
          </div>

          <p className="border-t border-card-border pt-8 text-sm text-muted-foreground">
            Last updated: August 2026
          </p>
        </article>

        <aside className="order-1 lg:sticky lg:top-24 lg:order-2">
          <nav aria-label="Contents" className="rounded-2xl border border-card-border bg-card p-5">
            <p className="eyebrow">Contents</p>
            <ol className="mt-2 flex flex-col gap-0.5 text-sm">
              {sections.map((title, index) => (
                <li key={title}>
                  <a
                    href={`#section-${index + 1}`}
                    className="block rounded-[10px] px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
    </main>
  );
}
