/// Service Worker for KnowYourEmoji.com
/// Provides offline caching for emoji pages, static assets, and app shell

const CACHE_VERSION = 'kye-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

const APP_SHELL_URLS = ['/', '/emoji', '/combo', '/search', '/about', '/pricing'];

const STATIC_EXTENSIONS = ['.js', '.css', '.woff', '.woff2', '.ttf'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.ico'];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('kye-') && !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: apply caching strategies per resource type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from same origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip API routes and Next.js internals
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) {
    return;
  }

  const pathname = url.pathname;

  // Static assets: cache-first
  if (
    STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
    pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Images: cache-first
  if (IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    event.respondWith(cacheFirst(request, IMAGES_CACHE));
    return;
  }

  // Emoji and combo pages: stale-while-revalidate
  if (pathname.startsWith('/emoji/') || pathname.startsWith('/combo/')) {
    event.respondWith(staleWhileRevalidate(request, PAGES_CACHE));
    return;
  }

  // App shell pages: network-first
  if (
    request.headers.get('accept')?.includes('text/html') ||
    APP_SHELL_URLS.includes(pathname)
  ) {
    event.respondWith(networkFirst(request, PAGES_CACHE));
    return;
  }
});

// Cache-first: serve from cache, fallback to network
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// Network-first: try network, fallback to cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale-while-revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}
