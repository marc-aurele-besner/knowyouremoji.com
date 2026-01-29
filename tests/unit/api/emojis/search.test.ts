import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { NextRequest } from 'next/server';

// Mock emoji data
const mockEmojiSummaries = [
  { slug: 'skull', character: '💀', name: 'Skull', category: 'faces', tldr: "Usually means 'I'm dead' from laughing" },
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'travel', tldr: "Something is 'hot' or awesome" },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'Expression of love' },
  { slug: 'grinning-face', character: '😀', name: 'Grinning Face', category: 'faces', tldr: 'Basic happy expression' },
  { slug: 'thinking-face', character: '🤔', name: 'Thinking Face', category: 'faces', tldr: 'Contemplation or skepticism' },
];

// Mock emoji-data module
mock.module('@/lib/emoji-data', () => ({
  getEmojiSummaries: () => mockEmojiSummaries,
}));

// Import the route handler after mocking
import { GET } from '../../../../src/app/api/emojis/search/route';

// Helper to create NextRequest with query params
function createRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost:3000/api/emojis/search');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url.toString(), { method: 'GET' });
}

describe('GET /api/emojis/search', () => {
  describe('basic functionality', () => {
    it('should return emojis without query (limited)', async () => {
      const req = createRequest();
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis).toBeDefined();
      expect(Array.isArray(data.emojis)).toBe(true);
    });

    it('should return JSON content type', async () => {
      const req = createRequest();
      const res = await GET(req);

      expect(res.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('search by query', () => {
    it('should filter emojis by name', async () => {
      const req = createRequest({ q: 'skull' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBe(1);
      expect(data.emojis[0].slug).toBe('skull');
    });

    it('should filter emojis case-insensitively', async () => {
      const req = createRequest({ q: 'SKULL' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBe(1);
      expect(data.emojis[0].name).toBe('Skull');
    });

    it('should filter emojis by character', async () => {
      const req = createRequest({ q: '💀' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBe(1);
      expect(data.emojis[0].character).toBe('💀');
    });

    it('should filter emojis by category', async () => {
      const req = createRequest({ q: 'faces' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBeGreaterThan(0);
      data.emojis.forEach((emoji: { category: string }) => {
        expect(emoji.category).toBe('faces');
      });
    });

    it('should filter emojis by tldr content', async () => {
      const req = createRequest({ q: 'love' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBe(1);
      expect(data.emojis[0].slug).toBe('heart');
    });

    it('should filter emojis by slug', async () => {
      const req = createRequest({ q: 'grinning' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.some((e: { slug: string }) => e.slug === 'grinning-face')).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const req = createRequest({ q: 'nonexistent' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis).toEqual([]);
    });

    it('should return multiple matches for partial query', async () => {
      const req = createRequest({ q: 'face' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBeGreaterThan(1);
    });
  });

  describe('limit parameter', () => {
    it('should respect the limit parameter', async () => {
      const req = createRequest({ limit: '2' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBeLessThanOrEqual(2);
    });

    it('should default to 8 results', async () => {
      const req = createRequest();
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBeLessThanOrEqual(8);
    });

    it('should cap limit at 20', async () => {
      const req = createRequest({ limit: '100' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBeLessThanOrEqual(20);
    });

    it('should handle invalid limit parameter', async () => {
      const req = createRequest({ limit: 'invalid' });
      const res = await GET(req);
      const data = await res.json();

      // Should default to 8 when parsing fails (NaN)
      expect(res.status).toBe(200);
      expect(data.emojis).toBeDefined();
    });
  });

  describe('combined parameters', () => {
    it('should apply both query and limit', async () => {
      const req = createRequest({ q: 'face', limit: '1' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty query string', async () => {
      const req = createRequest({ q: '' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis).toBeDefined();
    });

    it('should handle whitespace-only query', async () => {
      const req = createRequest({ q: '   ' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      // Empty after trimming should return limited default results
      expect(data.emojis).toBeDefined();
    });

    it('should handle special characters in query', async () => {
      const req = createRequest({ q: "I'm dead" });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      // Should match skull's tldr
      expect(data.emojis.some((e: { slug: string }) => e.slug === 'skull')).toBe(true);
    });
  });

  describe('response structure', () => {
    it('should return emojis with all required fields', async () => {
      const req = createRequest({ q: 'skull' });
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBe(1);

      const emoji = data.emojis[0];
      expect(emoji.slug).toBeDefined();
      expect(emoji.character).toBeDefined();
      expect(emoji.name).toBeDefined();
      expect(emoji.category).toBeDefined();
      expect(emoji.tldr).toBeDefined();
    });
  });
});
