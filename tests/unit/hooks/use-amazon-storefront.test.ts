import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { renderHook, waitFor, cleanup } from '@testing-library/react';
import {
  COUNTRY_STORAGE_KEY,
  COUNTRY_TTL_MS,
  getVisitorCountry,
  useAmazonStorefront,
} from '@/hooks/use-amazon-storefront';

const originalFetch = globalThis.fetch;
const mockFetch = mock(async (..._args: unknown[]) => Response.json({ country: 'DE' }));

function cache(value: unknown) {
  window.localStorage.setItem(COUNTRY_STORAGE_KEY, JSON.stringify(value));
}

function cached() {
  return JSON.parse(window.localStorage.getItem(COUNTRY_STORAGE_KEY) ?? 'null');
}

beforeEach(() => {
  window.localStorage.clear();
  mockFetch.mockClear();
  mockFetch.mockImplementation(async () => Response.json({ country: 'DE' }));
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  window.localStorage.clear();
});

describe('getVisitorCountry', () => {
  it('looks the country up and caches it', async () => {
    expect(await getVisitorCountry()).toBe('DE');
    expect(mockFetch).toHaveBeenCalledWith('/api/geo');
    expect(cached().country).toBe('DE');
    expect(typeof cached().at).toBe('number');
  });

  it('uses the cached country without a request', async () => {
    cache({ country: 'FR', at: Date.now() });
    expect(await getVisitorCountry()).toBe('FR');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('caches an unknown country as null', async () => {
    mockFetch.mockImplementation(async () => Response.json({ country: null }));
    expect(await getVisitorCountry()).toBeNull();
    expect(cached().country).toBeNull();

    expect(await getVisitorCountry()).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('reads a cached non-string country as null', async () => {
    cache({ country: 42, at: Date.now() });
    expect(await getVisitorCountry()).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('looks up again once the cache is older than 30 days', async () => {
    cache({ country: 'FR', at: Date.now() - COUNTRY_TTL_MS - 1 });
    expect(await getVisitorCountry()).toBe('DE');
  });

  it('ignores a cache entry without a timestamp or with invalid JSON', async () => {
    cache({ country: 'FR' });
    expect(await getVisitorCountry()).toBe('DE');

    window.localStorage.setItem(COUNTRY_STORAGE_KEY, '{not json');
    expect(await getVisitorCountry()).toBe('DE');
  });

  it('shares one request between concurrent callers', async () => {
    const [a, b] = await Promise.all([getVisitorCountry(), getVisitorCountry()]);
    expect([a, b]).toEqual(['DE', 'DE']);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns null without caching when the lookup fails', async () => {
    mockFetch.mockImplementation(async () => new Response('nope', { status: 500 }));
    expect(await getVisitorCountry()).toBeNull();
    expect(cached()).toBeNull();

    mockFetch.mockImplementation(async () => {
      throw new Error('offline');
    });
    expect(await getVisitorCountry()).toBeNull();
    expect(cached()).toBeNull();
  });

  it('still answers when storage is unavailable', async () => {
    const storage = window.localStorage;
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    Object.defineProperty(window, 'localStorage', { value: throwing, configurable: true });
    try {
      expect(await getVisitorCountry()).toBe('DE');
    } finally {
      Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
    }
  });
});

describe('useAmazonStorefront', () => {
  it('starts on amazon.com and switches to the visitor’s storefront', async () => {
    mockFetch.mockImplementation(async () => Response.json({ country: 'AT' }));
    const { result } = renderHook(() => useAmazonStorefront());
    expect(result.current).toBe('US');
    await waitFor(() => expect(result.current).toBe('DE'));
  });

  it('stays on amazon.com when the country is unknown', async () => {
    mockFetch.mockImplementation(async () => Response.json({ country: null }));
    const { result } = renderHook(() => useAmazonStorefront());
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(result.current).toBe('US');
  });

  it('does not update after unmounting', async () => {
    let resolve: (response: Response) => void = () => {};
    mockFetch.mockImplementation(() => new Promise<Response>((r) => (resolve = r)));
    const { result, unmount } = renderHook(() => useAmazonStorefront());
    unmount();
    resolve(Response.json({ country: 'GB' }));
    await waitFor(() => expect(cached()?.country).toBe('GB'));
    expect(result.current).toBe('US');
  });
});
