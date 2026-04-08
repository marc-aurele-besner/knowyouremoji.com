import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// SERVICE WORKER TESTS
// ============================================
// Since the service worker is a plain JS file that runs in the SW scope,
// we test its URL matching logic and caching strategies by evaluating
// the helper functions and simulating the SW environment.

// Read the service worker source to extract and test helper functions
const swSource = fs.readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf-8');

// Extract the URL matching functions from the SW source
// We eval them in our test scope so we can call them directly
const helperFunctions = `
${swSource.split('// --- URL matchers ---')[1]}
`;

// eslint-disable-next-line no-eval
const evalScope = new Function(`
  ${helperFunctions}
  return { isStaticAsset, isImageRequest, isEmojiPage, isComboPage };
`)();

const { isStaticAsset, isImageRequest, isEmojiPage, isComboPage } = evalScope as {
  isStaticAsset: (pathname: string) => boolean;
  isImageRequest: (pathname: string) => boolean;
  isEmojiPage: (pathname: string) => boolean;
  isComboPage: (pathname: string) => boolean;
};

describe('Service Worker (public/sw.js)', () => {
  describe('URL matchers', () => {
    describe('isStaticAsset', () => {
      it('should match Next.js static files', () => {
        expect(isStaticAsset('/_next/static/chunks/main.js')).toBe(true);
        expect(isStaticAsset('/_next/static/css/app.css')).toBe(true);
        expect(isStaticAsset('/_next/static/media/font.woff2')).toBe(true);
      });

      it('should match JS and CSS files', () => {
        expect(isStaticAsset('/scripts/app.js')).toBe(true);
        expect(isStaticAsset('/styles/main.css')).toBe(true);
      });

      it('should match font files', () => {
        expect(isStaticAsset('/fonts/custom.woff')).toBe(true);
        expect(isStaticAsset('/fonts/custom.woff2')).toBe(true);
        expect(isStaticAsset('/fonts/custom.ttf')).toBe(true);
        expect(isStaticAsset('/fonts/custom.eot')).toBe(true);
      });

      it('should not match non-static files', () => {
        expect(isStaticAsset('/emoji/fire')).toBe(false);
        expect(isStaticAsset('/about')).toBe(false);
        expect(isStaticAsset('/api/interpret')).toBe(false);
      });
    });

    describe('isImageRequest', () => {
      it('should match common image formats', () => {
        expect(isImageRequest('/images/logo.png')).toBe(true);
        expect(isImageRequest('/images/photo.jpg')).toBe(true);
        expect(isImageRequest('/images/photo.jpeg')).toBe(true);
        expect(isImageRequest('/images/icon.svg')).toBe(true);
        expect(isImageRequest('/images/hero.webp')).toBe(true);
        expect(isImageRequest('/images/hero.avif')).toBe(true);
        expect(isImageRequest('/favicon.ico')).toBe(true);
        expect(isImageRequest('/images/animated.gif')).toBe(true);
      });

      it('should not match non-image files', () => {
        expect(isImageRequest('/about')).toBe(false);
        expect(isImageRequest('/styles.css')).toBe(false);
        expect(isImageRequest('/script.js')).toBe(false);
      });
    });

    describe('isEmojiPage', () => {
      it('should match emoji page paths', () => {
        expect(isEmojiPage('/emoji/fire')).toBe(true);
        expect(isEmojiPage('/emoji/skull')).toBe(true);
        expect(isEmojiPage('/emoji/heart-eyes')).toBe(true);
      });

      it('should not match nested emoji paths', () => {
        expect(isEmojiPage('/emoji/fire/details')).toBe(false);
      });

      it('should not match the emoji index', () => {
        expect(isEmojiPage('/emoji')).toBe(false);
        expect(isEmojiPage('/emoji/')).toBe(false);
      });

      it('should not match other pages', () => {
        expect(isEmojiPage('/about')).toBe(false);
        expect(isEmojiPage('/combo/fire-skull')).toBe(false);
      });
    });

    describe('isComboPage', () => {
      it('should match combo page paths', () => {
        expect(isComboPage('/combo/fire-skull')).toBe(true);
        expect(isComboPage('/combo/heart-eyes-smile')).toBe(true);
      });

      it('should not match nested combo paths', () => {
        expect(isComboPage('/combo/fire-skull/details')).toBe(false);
      });

      it('should not match the combo index', () => {
        expect(isComboPage('/combo')).toBe(false);
        expect(isComboPage('/combo/')).toBe(false);
      });

      it('should not match other pages', () => {
        expect(isComboPage('/about')).toBe(false);
        expect(isComboPage('/emoji/fire')).toBe(false);
      });
    });
  });

  describe('configuration', () => {
    it('should define valid cache names', () => {
      expect(swSource).toContain("STATIC_CACHE = `knowyouremoji-static-");
      expect(swSource).toContain("PAGE_CACHE = `knowyouremoji-pages-");
      expect(swSource).toContain("IMAGE_CACHE = `knowyouremoji-images-");
    });

    it('should define cache version', () => {
      expect(swSource).toContain("CACHE_VERSION = 'v1'");
    });

    it('should precache critical URLs', () => {
      expect(swSource).toContain("'/'");
      expect(swSource).toContain("'/offline'");
      expect(swSource).toContain("'/site.webmanifest'");
    });

    it('should define max cache entries', () => {
      expect(swSource).toContain('MAX_PAGE_ENTRIES = 100');
      expect(swSource).toContain('MAX_IMAGE_ENTRIES = 200');
    });
  });

  describe('event listeners', () => {
    it('should register install event listener', () => {
      expect(swSource).toContain("self.addEventListener('install'");
    });

    it('should register activate event listener', () => {
      expect(swSource).toContain("self.addEventListener('activate'");
    });

    it('should register fetch event listener', () => {
      expect(swSource).toContain("self.addEventListener('fetch'");
    });

    it('should call skipWaiting on install', () => {
      expect(swSource).toContain('self.skipWaiting()');
    });

    it('should call clients.claim on activate', () => {
      expect(swSource).toContain('self.clients.claim()');
    });
  });

  describe('caching strategies', () => {
    it('should implement cacheFirst strategy', () => {
      expect(swSource).toContain('async function cacheFirst');
    });

    it('should implement networkFirst strategy', () => {
      expect(swSource).toContain('async function networkFirst');
    });

    it('should implement trimCache for cache eviction', () => {
      expect(swSource).toContain('async function trimCache');
    });

    it('should skip non-GET requests', () => {
      expect(swSource).toContain("request.method !== 'GET'");
    });

    it('should skip cross-origin requests', () => {
      expect(swSource).toContain('url.origin !== self.location.origin');
    });

    it('should skip API routes', () => {
      expect(swSource).toContain("url.pathname.startsWith('/api/')");
    });

    it('should handle navigation requests with offline fallback', () => {
      expect(swSource).toContain("request.mode === 'navigate'");
      expect(swSource).toContain('OFFLINE_URL');
    });
  });
});
