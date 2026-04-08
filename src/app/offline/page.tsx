import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline — KnowYourEmoji',
  description: "You're currently offline. Previously visited emoji pages are still available.",
};

export default function OfflinePage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <div className="mb-4 text-6xl md:text-8xl" role="img" aria-label="Disconnected">
          📡
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">
          You&apos;re Offline
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry — any emoji
          pages you&apos;ve visited before are still available offline.
        </p>

        <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            What you can do:
          </h2>
          <ul className="space-y-2 text-left text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">✅</span>
              <span>Browse previously visited emoji pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">✅</span>
              <span>View cached combo interpretations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">❌</span>
              <span>Use the AI interpreter (requires connection)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">❌</span>
              <span>Search for new emojis</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          This page will automatically reload when your connection is restored.
        </p>
      </div>
    </main>
  );
}
