/// <reference lib="webworker" />

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `knowyouremoji-static-${CACHE_VERSION}`;
const PAGE_CACHE = `knowyouremoji-pages-${CACHE_VERSION}`;
const IMAGE_CACHE = `knowyouremoji-images-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline';

const PRECACHE_URLS = ['/', '/offline', '/site.webmanifest'];

const CACHE_NAMES = [STATIC_CACHE, PAGE_CACHE, IMAGE_CACHE];

// Max entries per cache to avoid unbounded storage growth
const MAX_PAGE_ENTRIES = 100;
const MAX_IMAGE_ENTRIES = 200;

/**
 * Install event — precache critical resources including offline fallback
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event — clean up old caches from previous versions
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !CACHE_NAMES.includes(key)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event — route requests to appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip API routes (except interpret cache)
  if (url.pathname.startsWith('/api/')) return;

  // Skip Next.js internal routes
  if (url.pathname.startsWith('/_next/data/')) {
    event.respondWith(networkFirst(request, PAGE_CACHE));
    return;
  }

  // Static assets (JS, CSS, fonts) — cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Images — cache first with image cache
  if (isImageRequest(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
    return;
  }

  // Emoji and combo pages — network first (fresh content, offline fallback)
  if (isEmojiPage(url.pathname) || isComboPage(url.pathname)) {
    event.respondWith(networkFirst(request, PAGE_CACHE, MAX_PAGE_ENTRIES));
    return;
  }

  // All other navigation — network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, PAGE_CACHE, MAX_PAGE_ENTRIES));
    return;
  }
});

/**
 * Cache-first strategy: serve from cache, fall back to network
 */
async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (maxEntries) trimCache(cacheName, maxEntries);
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-first strategy: try network, fall back to cache, then offline page
 */
async function networkFirst(request, cacheName, maxEntries) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (maxEntries) trimCache(cacheName, maxEntries);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // For navigation requests, show offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match(OFFLINE_URL);
      if (offlinePage) return offlinePage;
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Trim cache to max entries (FIFO — removes oldest entries)
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxEntries);
  }
}

// --- URL matchers ---

function isStaticAsset(pathname) {
  return /\/_next\/static\//.test(pathname) || /\.(js|css|woff2?|ttf|eot)$/.test(pathname);
}

function isImageRequest(pathname) {
  return /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/.test(pathname);
}

function isEmojiPage(pathname) {
  return /^\/emoji\/[^/]+$/.test(pathname);
}

function isComboPage(pathname) {
  return /^\/combo\/[^/]+$/.test(pathname);
}
