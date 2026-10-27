import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BookBanner } from '@/components/layout/book-banner';
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
  const description = sharedData ? sharedData.interpretation.slice(0, 160) : pageDescription;

  const ogImageUrl = sharedData
    ? `${env.appUrl}/og/interpretation?r=${sharedResult}`
    : `${env.appUrl}/og-image.png`;

  return {
    // The root layout applies the `%s | <siteName>` title template, so the
    // metadata title must NOT include the site name itself.
    title,
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

/** Longest message the interpreter accepts; longer prefills are trimmed. */
const MAX_PREFILL_LENGTH = 1000;

interface InterpreterPageProps {
  searchParams: Promise<{ r?: string; m?: string | string[] }>;
}

function PageHeading() {
  return (
    <>
      <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Emoji <em className="accent-serif">interpreter</em>
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
        Paste a message with emojis and we&apos;ll decode what they really mean — tone, sarcasm,
        passive-aggression and red flags.
      </p>
    </>
  );
}

export default async function InterpreterPage({ searchParams }: InterpreterPageProps) {
  const { r: sharedResult, m } = await searchParams;
  const rawPrefill = Array.isArray(m) ? m[0] : m;
  const initialMessage = rawPrefill ? rawPrefill.slice(0, MAX_PREFILL_LENGTH) : undefined;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      {sharedResult ? (
        <>
          <section className="mb-8">
            <PageHeading />
          </section>
          <SharedResultSection encodedResult={sharedResult} />
        </>
      ) : (
        <section data-testid="interpreter-form-section">
          <InterpreterClient header={<PageHeading />} initialMessage={initialMessage} />
        </section>
      )}

      <BookBanner className="mt-8" />
    </main>
  );
}
