import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getEnv } from '@/lib/env';

const pageTitle = 'Pricing';
const pageDescription =
  'View KnowYourEmoji pricing plans. Get started for free with 3 interpretations per day, or upgrade to Pro for unlimited access. Compare features and find the right plan for you.';

/**
 * Generate metadata for the pricing page including canonical URL
 * Prevents duplicate content issues with canonical link tags
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/pricing`;

  return {
    title: `${pageTitle} | ${env.appName}`,
    description: pageDescription,
    keywords: [
      'knowyouremoji pricing',
      'emoji interpreter plans',
      'emoji decoder pricing',
      'emoji translation cost',
      'free emoji interpreter',
      'pro emoji interpreter',
      'emoji meaning subscription',
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

const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Pricing' }];

/**
 * Pricing page for KnowYourEmoji.com
 *
 * Includes:
 * - Hero section with page title
 * - Pricing tiers (Free and Pro)
 * - Feature comparison table
 * - Coming soon teaser for Phase 2 features
 * - CTA to try the interpreter
 */
export default function PricingPage() {
  return (
    <main className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">
            Get started for free. Upgrade when you need more.
          </p>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-16 bg-white dark:bg-gray-900" data-testid="pricing-tiers-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for casual users</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      3 interpretations per day
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Browse emoji database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Context-aware meanings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Platform differences</span>
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/interpreter">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="relative border-amber-500 dark:border-amber-400">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="warning">Coming Soon</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For power users and professionals</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$9</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Unlimited interpretations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Priority AI processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Interpretation history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Save favorite interpretations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">No ads</span>
                  </li>
                </ul>
                <Button className="w-full" disabled>
                  Coming in Phase 2
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section
        className="py-16 bg-gray-50 dark:bg-gray-800"
        data-testid="feature-comparison-section"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Feature Comparison
          </h2>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">
                    Feature
                  </th>
                  <th className="text-center p-4 text-gray-900 dark:text-white font-semibold">
                    Free
                  </th>
                  <th className="text-center p-4 text-gray-900 dark:text-white font-semibold">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-600 dark:text-gray-300">Daily interpretations</td>
                  <td className="p-4 text-center text-gray-600 dark:text-gray-300">3</td>
                  <td className="p-4 text-center text-gray-600 dark:text-gray-300">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-600 dark:text-gray-300">Emoji database access</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-600 dark:text-gray-300">Context-aware meanings</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-600 dark:text-gray-300">Platform differences</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-600 dark:text-gray-300">Priority AI processing</td>
                  <td className="p-4 text-center text-gray-400">-</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-600 dark:text-gray-300">Interpretation history</td>
                  <td className="p-4 text-center text-gray-400">-</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-600 dark:text-gray-300">Save favorites</td>
                  <td className="p-4 text-center text-gray-400">-</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-600 dark:text-gray-300">Ad-free experience</td>
                  <td className="p-4 text-center text-gray-400">-</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Phase 2 Teaser Section */}
      <section className="py-16 bg-white dark:bg-gray-900" data-testid="phase2-teaser-section">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Phase 2
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            More Features Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            We&apos;re working hard to bring you even more powerful features. Stay tuned for user
            accounts, team plans, and advanced analytics.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl mb-3">
                <span role="img" aria-label="Person">
                  👤
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Accounts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in to save your preferences and interpretation history
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl mb-3">
                <span role="img" aria-label="Team">
                  👥
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Team Plans</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Collaborate with your team and share interpretations
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl mb-3">
                <span role="img" aria-label="Chart">
                  📊
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track emoji trends and usage patterns across your communications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-600 dark:bg-amber-700">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Start Interpreting Today</h2>
          <p className="text-amber-100 mb-8">
            Try our AI-powered emoji interpreter for free. No sign-up required.
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
