'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseServiceWorkerReturn {
  /** Whether the service worker is supported in this browser */
  isSupported: boolean;
  /** Whether the service worker is registered and active */
  isActive: boolean;
  /** Whether a new service worker update is available */
  hasUpdate: boolean;
  /** The current registration, if any */
  registration: ServiceWorkerRegistration | null;
  /** Apply a pending update (reloads the page) */
  applyUpdate: () => void;
}

/**
 * Custom hook for registering and managing the service worker lifecycle.
 *
 * Registers the service worker on mount (production only), tracks its state,
 * and provides update management.
 *
 * @example
 * ```tsx
 * const { isActive, hasUpdate, applyUpdate } = useServiceWorker();
 *
 * if (hasUpdate) {
 *   return <button onClick={applyUpdate}>Update available — click to refresh</button>;
 * }
 * ```
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [isSupported] = useState(
    () => typeof window !== 'undefined' && 'serviceWorker' in navigator
  );
  const [isActive, setIsActive] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!isSupported) return;

    let cancelled = false;

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

        if (cancelled) return;

        setRegistration(reg);

        // Check if SW is already active
        if (reg.active) {
          setIsActive(true);
        }

        // Listen for new service worker becoming active
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              setIsActive(true);
            }
            // If there's already a controller and a new worker is waiting, it's an update
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
            }
          });
        });

        // Also check if a waiting worker already exists
        if (reg.waiting && navigator.serviceWorker.controller) {
          setHasUpdate(true);
        }
      } catch {
        // Service worker registration failed — silently degrade
      }
    }

    register();

    return () => {
      cancelled = true;
    };
  }, [isSupported]);

  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return {
    isSupported,
    isActive,
    hasUpdate,
    registration,
    applyUpdate,
  };
}
