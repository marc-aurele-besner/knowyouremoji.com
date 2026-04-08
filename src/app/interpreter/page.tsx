import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { InterpreterClient } from '@/components/interpreter/interpreter-client';
import { SharedResultSection } from '@/components/interpreter/shared-result-section';
import { decodeInterpretation } from '@/lib/share-encoding';
import { getEnv } from '@/lib/env';

const pageTitle = 'Emoji Interpreter - Decode Hidden Meanings';
const pageDescription =
  'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.';

interface MetadataProps {
  searchParams: Promise<{ r?: string }>;
}

/**
 * Generate metadata for the interpreter page including canonical URL.
 * When a shared result is present (?r=...), generates a dynamic OG image.
 */
export async function generateMetadata({ searchParams }: MetadataProps): Promise<Metadata> {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/interpreter`;
  const { r: sharedResult } = await searchParams;

  // Check if this is a shared interpretation with valid data
  const sharedData = sharedResult ? decodeInterpretation(sharedResult) : null;

  const title = sharedData
    ? `Emoji Interpretation: "${sharedData.message.slice(0, 60)}${sharedData.message.length > 60 ? '...' : ''}"`
    : pageTitle;
  const description = sharedData
    ? sharedData.interpretation.slice(0, 160)
    : pageDescription;

  const ogImageUrl = sharedData
    ? `${env.appUrl}/og/interpretation?r=${sharedResult}`
    : `${env.appUrl}/og-image.png`;

  return {
    title: `${title} | ${env.appName}`,
    description,
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
      url: sharedResult ? `${pageUrl}?r=${sharedResult}` : pageUrl,
      siteName: env.appName,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
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

interface InterpreterPageProps {
  searchParams: Promise<{ r?: string }>;
}

export default async function InterpreterPage({ searchParams }: InterpreterPageProps) {
  const { r: sharedResult } = await searchParams;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Emoji Interpreter</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Paste a message with emojis and we&apos;ll decode what they really mean.
        </p>
      </section>

      {sharedResult ? (
        <SharedResultSection encodedResult={sharedResult} />
      ) : (
        <section
          data-testid="interpreter-form-section"
          className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800"
        >
          <InterpreterClient />
        </section>
      )}
    </main>
  );
}
