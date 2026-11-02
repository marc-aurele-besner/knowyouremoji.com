'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_STOREFRONT, storefrontFor, type StorefrontCode } from '@/lib/amazon-affiliate';

export const COUNTRY_STORAGE_KEY = 'kye_country';
export const COUNTRY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface CachedCountry {
  country: string | null;
}

function readCachedCountry(): CachedCountry | null {
  try {
    const raw = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { country?: unknown; at?: unknown };
    if (typeof cached.at !== 'number' || Date.now() - cached.at > COUNTRY_TTL_MS) return null;
    return { country: typeof cached.country === 'string' ? cached.country : null };
  } catch {
    return null;
  }
}

function writeCachedCountry(country: string | null): void {
  try {
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, JSON.stringify({ country, at: Date.now() }));
  } catch {
    // Storage unavailable (private mode, blocked site data): look it up again next visit.
  }
}

// Shared by every link on the page so the lookup runs at most once at a time.
let pendingCountry: Promise<string | null> | null = null;

/** Visitor's country: cached in localStorage for 30 days, else looked up via /api/geo. */
export function getVisitorCountry(): Promise<string | null> {
  const cached = readCachedCountry();
  if (cached) return Promise.resolve(cached.country);

  pendingCountry ??= fetch('/api/geo')
    .then((response) => (response.ok ? (response.json() as Promise<{ country?: unknown }>) : null))
    .then((data) => {
      if (!data) return null;
      const country = typeof data.country === 'string' ? data.country : null;
      // Only a real answer is cached, so a failed lookup is retried on the next page.
      writeCachedCountry(country);
      return country;
    })
    .catch(() => null)
    .finally(() => {
      pendingCountry = null;
    });
  return pendingCountry;
}

/**
 * Amazon storefront for the current visitor. Starts on amazon.com (what the
 * static HTML is rendered with) and switches once the country is known.
 */
export function useAmazonStorefront(): StorefrontCode {
  const [storefront, setStorefront] = useState<StorefrontCode>(DEFAULT_STOREFRONT);

  useEffect(() => {
    let active = true;
    getVisitorCountry().then((country) => {
      if (active) setStorefront(storefrontFor(country));
    });
    return () => {
      active = false;
    };
  }, []);

  return storefront;
}
