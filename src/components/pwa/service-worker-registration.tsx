'use client';

import { useServiceWorker } from '@/hooks/use-service-worker';

/**
 * Client component that registers the service worker and shows
 * an update prompt when a new version is available.
 */
export function ServiceWorkerRegistration() {
  const { hasUpdate, applyUpdate } = useServiceWorker();

  if (!hasUpdate) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-lg dark:border-amber-800 dark:bg-amber-950"
    >
      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
        A new version is available.
      </p>
      <button
        type="button"
        onClick={applyUpdate}
        className="mt-2 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
      >
        Update now
      </button>
    </div>
  );
}
