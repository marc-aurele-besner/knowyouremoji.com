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
    title: `${pageTitle} | ${env.appName}`,
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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
            Your privacy matters to us. Here&apos;s how we handle your data.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                KnowYourEmoji is designed with privacy in mind. Here&apos;s what we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>
                  <strong>Interpreter messages:</strong> Messages submitted to the AI interpreter
                  are sent to our AI provider for processing. We do not permanently store the
                  content of your interpreted messages.
                </li>
                <li>
                  <strong>Usage data:</strong> We collect anonymous usage analytics (page views,
                  feature usage) to improve the Service. This data is collected via Google Analytics
                  and PostHog.
                </li>
                <li>
                  <strong>Rate limit data:</strong> We use localStorage in your browser to track
                  daily usage counts for the free interpreter tier. This data stays on your device.
                </li>
                <li>
                  <strong>Error reports:</strong> We use Sentry to collect error reports that help
                  us fix bugs. These may include technical details about your browser and session
                  but no personal information.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Process your emoji interpretation requests</li>
                <li>Improve and optimize the user experience</li>
                <li>Monitor and fix errors and performance issues</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Data Sharing
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We do not sell your personal data. We share data only with the following service
                providers necessary to operate the Service:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
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

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Cookies and Local Storage
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We use cookies and localStorage for essential functionality such as theme
                preferences and rate limiting. Third-party analytics services may set their own
                cookies. You can disable cookies in your browser settings, though this may affect
                some features.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We take reasonable measures to protect your information. All data is transmitted
                over HTTPS. However, no method of transmission over the Internet is 100% secure, and
                we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Children&apos;s Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                The Service is not directed at children under 13. We do not knowingly collect
                personal information from children under 13. If you believe we have collected
                information from a child under 13, please contact us so we can remove it.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Open Source
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                KnowYourEmoji is open source. You can review exactly how we handle data by examining
                our source code on{' '}
                <Link
                  href="https://github.com/marc-aurele-besner/knowyouremoji.com"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of
                significant changes by updating the date at the bottom of this page. Continued use
                of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Contact</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please reach out through our{' '}
                <Link
                  href="https://github.com/marc-aurele-besner/knowyouremoji.com/issues"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Issues
                </Link>
                .
              </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 pt-8 border-t border-gray-200 dark:border-gray-700">
              Last updated: March 2026
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
