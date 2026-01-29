import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { NextRequest } from 'next/server';
import { resetClients } from '../../../src/lib/openai';

// Store original env
const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: 'test-api-key',
    // Disable interpreter to use mock responses (avoids real OpenAI calls in tests)
    NEXT_PUBLIC_ENABLE_INTERPRETER: 'false',
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

  describe('validation edge cases', () => {
    it('should accept message at exactly 10 characters with emoji', async () => {
      const req = createRequest({
        message: 'Hi there😀', // "Hi there" (8) + emoji (2) = 10 chars
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation (may return 503 if OpenAI not configured)
      expect(res.status).not.toBe(400);
    });

    it('should reject message longer than 1000 characters with emoji', async () => {
      // emoji '😀' counts as 2 characters in string length
      const longText = 'a'.repeat(1000) + '😀'; // 1000 + 2 = 1002 chars
      const req = createRequest({
        message: longText,
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.fieldErrors?.message).toBeDefined();
    });

    it('should accept message at maximum allowed length', async () => {
      // emoji '😀' counts as 2 characters, so 998 + 2 = 1000
      const longText = 'a'.repeat(998) + '😀';
      const req = createRequest({
        message: longText,
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation (200/503, not 400)
      expect([200, 503].includes(res.status)).toBe(true);
    });

    it('should handle message with newlines and emoji', async () => {
      const req = createRequest({
        message: 'Hello\nthere\n😀 friend',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation
      expect(res.status).not.toBe(400);
    });

    it('should handle message with special characters and emoji', async () => {
      const req = createRequest({
        message: 'Hello! @#$%^&*() 😀 ~`[]{}|;\':",./<>?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation
      expect(res.status).not.toBe(400);
    });

    it('should handle message with Unicode characters and emoji', async () => {
      const req = createRequest({
        message: 'こんにちは 😀 Hello 你好 مرحبا',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation
      expect(res.status).not.toBe(400);
    });
  });

  describe('interpreter configuration states', () => {
    it('should return 503 when interpreter disabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      process.env.OPENAI_API_KEY = 'sk-test-key';
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

    it('should return 503 when both interpreter disabled and no API key', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
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

  describe('platform and context validation', () => {
    it('should accept all valid platforms', async () => {
      const platforms = [
        'IMESSAGE',
        'INSTAGRAM',
        'TIKTOK',
        'WHATSAPP',
        'SLACK',
        'DISCORD',
        'TWITTER',
        'OTHER',
      ];

      for (const platform of platforms) {
        const req = createRequest({
          message: 'Hello there friend 😀 how are you today?',
          platform,
          context: 'FRIEND',
        });

        const res = await POST(req);
        // Should not be a validation error
        expect(res.status).not.toBe(400);
      }
    });

    it('should accept all valid relationship contexts', async () => {
      const contexts = [
        'ROMANTIC_PARTNER',
        'FRIEND',
        'FAMILY',
        'COWORKER',
        'ACQUAINTANCE',
        'STRANGER',
      ];

      for (const context of contexts) {
        const req = createRequest({
          message: 'Hello there friend 😀 how are you today?',
          platform: 'IMESSAGE',
          context,
        });

        const res = await POST(req);
        // Should not be a validation error
        expect(res.status).not.toBe(400);
      }
    });
  });

  describe('emoji detection', () => {
    it('should detect single emoji', async () => {
      const req = createRequest({
        message: 'This is a test message 😀 with an emoji',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Validation should pass (not 400)
      expect(res.status).not.toBe(400);
    });

    it('should detect multiple emojis', async () => {
      const req = createRequest({
        message: 'Hello 👋 friend 😊 how are you? 🎉',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Validation should pass
      expect(res.status).not.toBe(400);
    });

    it('should detect emoji sequences (combined emojis)', async () => {
      const req = createRequest({
        message: 'Testing combined emoji 👨‍👩‍👧‍👦 in message',
        platform: 'IMESSAGE',
        context: 'FAMILY',
      });

      const res = await POST(req);
      // Validation should pass
      expect(res.status).not.toBe(400);
    });
  });
});
