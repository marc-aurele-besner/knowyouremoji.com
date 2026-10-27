import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Button } from '@/components/ui/button';
import { CheckoutButton } from '@/components/checkout';
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
    title: pageTitle,
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

const freeFeatures = [
  '3 interpretations per day',
  'Browse emoji database',
  'Context-aware meanings',
  'Platform differences',
];

const proFeatures = [
  'Unlimited interpretations',
  'Priority AI processing',
  'Interpretation history',
  'Save favorite interpretations',
  'No ads',
];

/** Feature comparison rows: `true` = included, `false` = not included, string = value. */
const comparisonRows: { feature: string; free: boolean | string; pro: boolean | string }[] = [
  { feature: 'Daily interpretations', free: '3', pro: 'Unlimited' },
  { feature: 'Emoji database access', free: true, pro: true },
  { feature: 'Context-aware meanings', free: true, pro: true },
  { feature: 'Platform differences', free: true, pro: true },
  { feature: 'Priority AI processing', free: false, pro: true },
  { feature: 'Interpretation history', free: false, pro: true },
  { feature: 'Save favorites', free: false, pro: true },
  { feature: 'Ad-free experience', free: false, pro: true },
];

const phase2Features = [
  {
    emoji: '👤',
    label: 'Person',
    title: 'User Accounts',
    description: 'Sign in to save your preferences and interpretation history',
  },
  {
    emoji: '👥',
    label: 'Team',
    title: 'Team Plans',
    description: 'Collaborate with your team and share interpretations',
  },
  {
    emoji: '📊',
    label: 'Chart',
    title: 'Analytics',
    description: 'Track emoji trends and usage patterns across your communications',
  },
];

const checkIcon = (
  <svg
    className="mt-0.5 h-4 w-4 shrink-0 text-success"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * Pricing page for KnowYourEmoji.com
 *
 * Includes:
 * - Centered header with eyebrow
 * - Pricing tiers (Free and Pro)
 * - Feature comparison table
 * - Coming soon teaser for Phase 2 features
 * - CTA to try the interpreter
 */
export default function PricingPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 pb-16 pt-10">
      <Breadcrumbs items={breadcrumbItems} className="mb-5" />

      {/* Header Section */}
      <header className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-700">Pricing</p>
        <h1 className="mt-2.5 text-4xl font-semibold tracking-tight md:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto mt-2.5 max-w-2xl text-[17px] text-muted-foreground">
          Get started for free. Upgrade when you need more.
        </p>
      </header>

      {/* Pricing Tiers Section */}
      <section
        aria-label="Plans"
        className="mx-auto grid max-w-[880px] gap-5 md:grid-cols-2"
        data-testid="pricing-tiers-section"
      >
        {/* Free Tier */}
        <div className="flex flex-col gap-5 rounded-[22px] border border-card-border bg-card p-7">
          <div>
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">Perfect for casual users</p>
          </div>
          <p className="text-5xl font-semibold tracking-tight">
            $0<span className="text-[15px] font-normal text-muted-foreground">/month</span>
          </p>
          <ul className="flex flex-col gap-2.5 text-[14.5px]">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex gap-2.5">
                {checkIcon}
                {feature}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-auto w-full" variant="secondary" size="lg">
            <Link href="/interpreter">Get Started Free</Link>
          </Button>
        </div>

        {/* Pro Tier */}
        <div className="flex flex-col gap-5 rounded-[22px] border border-foreground bg-card p-7 shadow-soft">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Pro</h2>
              <span className="rounded-full bg-foreground px-2.5 py-1 text-[11.5px] font-semibold text-background">
                Most Popular
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">For power users and professionals</p>
          </div>
          <p className="text-5xl font-semibold tracking-tight">
            $9<span className="text-[15px] font-normal text-muted-foreground">/month</span>
          </p>
          <ul className="flex flex-col gap-2.5 text-[14.5px]">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex gap-2.5">
                {checkIcon}
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            <CheckoutButton className="w-full" variant="brand" size="lg">
              Start 7-Day Free Trial
            </CheckoutButton>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="mt-14" data-testid="feature-comparison-section">
        <h2 className="mb-5 text-center text-2xl font-semibold tracking-tight md:text-[28px]">
          Feature Comparison
        </h2>

        <div className="mx-auto max-w-[880px] overflow-x-auto rounded-2xl border border-card-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                <th scope="col" className="p-4 text-left font-semibold">
                  Feature
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  Free
                </th>
                <th scope="col" className="p-4 text-center font-semibold">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-card-border last:border-b-0">
                  <th scope="row" className="p-4 text-left font-normal text-muted-foreground">
                    {row.feature}
                  </th>
                  {[row.free, row.pro].map((value, index) => (
                    <td key={index} className="p-4 text-center">
                      {value === true ? (
                        <span className="font-bold text-success">
                          <span aria-hidden="true">✓</span>
                          <span className="sr-only">Included</span>
                        </span>
                      ) : value === false ? (
                        <span className="text-muted-foreground">
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">Not included</span>
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Phase 2 Teaser Section */}
      <section
        className="mt-16 rounded-3xl bg-foreground p-7 text-background md:p-12"
        data-testid="phase2-teaser-section"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-500">
            Phase 2
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-[34px]">
            More Features Coming Soon
          </h2>
          <p className="mt-2 opacity-75">
            We&apos;re working hard to bring you even more powerful features. Stay tuned for user
            accounts, team plans, and advanced analytics.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {phase2Features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-background/15 p-5">
              <span className="text-3xl" role="img" aria-label={feature.label}>
                {feature.emoji}
              </span>
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm opacity-75">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight md:text-[28px]">
          Start Interpreting Today
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Try our AI-powered emoji interpreter for free. No sign-up required.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild size="lg" variant="brand">
            <Link href="/interpreter">Try the Interpreter</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/emoji">Browse All Emojis</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
