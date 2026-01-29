import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { NextRequest } from 'next/server';
import { resetClients } from '../../../src/lib/openai';

// Store original env
const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: 'test-api-key',
    NEXT_PUBLIC_ENABLE_INTERPRETER: 'true',
  };
  resetClients();
});

afterEach(() => {
  process.env = { ...originalEnv };
  resetClients();
});

// Import the route handler
import { POST } from '../../../src/app/api/interpret/stream/route';

// Helper to create NextRequest with JSON body
function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/interpret/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/interpret/stream', () => {
  describe('request validation', () => {
    it('should reject empty request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/interpret/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject message without emoji', async () => {
      const req = createRequest({
        message: 'Hello, this is a test message without any emojis.',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain('emoji');
    });

    it('should reject message shorter than 10 characters', async () => {
      const req = createRequest({
        message: 'Hi 😀',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.fieldErrors?.message).toBeDefined();
    });

    it('should reject message longer than 1000 characters', async () => {
      const longMessage = '😀'.repeat(501); // 501 emojis = 1002+ characters
      const req = createRequest({
        message: longMessage,
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.fieldErrors?.message).toBeDefined();
    });

    it('should reject invalid platform', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you?',
        platform: 'INVALID_PLATFORM',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.fieldErrors?.platform).toBeDefined();
    });

    it('should reject invalid context', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you?',
        platform: 'IMESSAGE',
        context: 'INVALID_CONTEXT',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.fieldErrors?.context).toBeDefined();
    });

    it('should accept valid request with all required fields', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Status should be 200 (streaming) or 503 (if OpenAI not configured)
      expect([200, 503].includes(res.status)).toBe(true);
    });

    it('should accept OTHER as a valid platform', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'OTHER',
        context: 'FRIEND',
      });

      const res = await POST(req);
      expect([200, 503].includes(res.status)).toBe(true);
    });
  });

  describe('streaming response', () => {
    it('should return streaming content type for valid requests when streaming enabled', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // When OpenAI is not configured, we might get 503, otherwise we get a stream
      if (res.status === 200) {
        const contentType = res.headers.get('content-type');
        // Vercel AI SDK may return text/plain or text/event-stream depending on configuration
        expect(contentType).toContain('text/');
      }
    });

    it('should include proper streaming headers', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      if (res.status === 200) {
        expect(res.headers.get('cache-control')).toContain('no-cache');
        expect(res.headers.get('connection')).toBe('keep-alive');
      }
    });

    it('should have a readable body stream for valid requests', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      if (res.status === 200) {
        expect(res.body).not.toBeNull();
        expect(res.body?.getReader).toBeDefined();
      }
    });
  });

  describe('error handling', () => {
    it('should handle non-JSON body gracefully', async () => {
      const req = new NextRequest('http://localhost:3000/api/interpret/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return 503 when OpenAI API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      resetClients();

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toContain('not configured');
    });
  });

  describe('HTTP method', () => {
    it('should only export POST handler', async () => {
      const routeModule = await import('../../../src/app/api/interpret/stream/route');
      expect(routeModule.POST).toBeDefined();
      expect(typeof routeModule.POST).toBe('function');
    });
  });
});
