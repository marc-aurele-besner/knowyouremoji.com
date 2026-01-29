import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { InterpreterClient } from '@/components/interpreter/interpreter-client';
import { getEnv } from '@/lib/env';

const pageTitle = 'Emoji Interpreter - Decode Hidden Meanings';
const pageDescription =
  'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.';

/**
 * Generate metadata for the interpreter page including canonical URL
 * Prevents duplicate content issues with canonical link tags
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/interpreter`;

  return {
    title: `${pageTitle} | ${env.appName}`,
    description: pageDescription,
    keywords: [
      'emoji interpreter',
      'decode emoji',
      'emoji meaning',
      'emoji decoder',
      'emoji translator',
      'text message decoder',
      'hidden emoji meanings',
      'AI emoji interpreter',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: `${env.appUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
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

const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Interpreter' }];

export default function InterpreterPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Emoji Interpreter</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Paste a message with emojis and we&apos;ll decode what they really mean.
        </p>
      </section>

      <section
        data-testid="interpreter-form-section"
        className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800"
      >
        <InterpreterClient />
      </section>
    </main>
  );
}
