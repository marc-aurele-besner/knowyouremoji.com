import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

export const metadata: Metadata = {
  title: 'Emoji Interpreter - Decode Hidden Meanings | KnowYourEmoji',
  description:
    'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.',
  openGraph: {
    title: 'Emoji Interpreter - Decode Hidden Meanings',
    description:
      'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.',
    type: 'website',
  },
};

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
        <p className="text-gray-500 text-center">Interpreter form will be added here.</p>
      </section>
    </main>
  );
}
