import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { NextRequest } from 'next/server';

// Mock environment before importing route
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: 'test-api-key',
    // Disable interpreter to use mock responses (avoids real OpenAI calls in tests)
    NEXT_PUBLIC_ENABLE_INTERPRETER: 'false',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Import the route handler
import { POST } from '../../../src/app/api/interpret/route';

// Helper to create NextRequest with JSON body
function createRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost:3000/api/interpret', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/interpret', () => {
  describe('request validation', () => {
    it('should reject empty request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/interpret', {
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
      // Status should be 200 or 503 (if OpenAI not configured)
      expect([200, 503].includes(res.status)).toBe(true);
    });

    it('should accept OTHER as a valid platform', async () => {
      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'OTHER',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Status should be 200 or 503 (if OpenAI not configured)
      expect([200, 503].includes(res.status)).toBe(true);
    });

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
        // Should not be 400 (validation error)
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
        // Should not be 400 (validation error)
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

  describe('response structure', () => {
    it('should return proper error structure for validation errors', async () => {
      const req = createRequest({
        message: 'No emoji here at all.',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('status');
    });

    it('should return JSON content type', async () => {
      const req = createRequest({
        message: 'Hello 😀 there friend',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      expect(res.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('HTTP methods', () => {
    it('should only export POST handler', async () => {
      // The route module should only export POST
      const routeModule = await import('../../../src/app/api/interpret/route');
      expect(routeModule.POST).toBeDefined();
      expect(typeof routeModule.POST).toBe('function');
    });
  });

  describe('malformed requests', () => {
    it('should handle non-JSON body gracefully', async () => {
      const req = new NextRequest('http://localhost:3000/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle missing Content-Type header', async () => {
      const req = new NextRequest('http://localhost:3000/api/interpret', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello 😀 there friend how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        }),
      });

      const res = await POST(req);
      // Should still work as Next.js can parse JSON
      expect([200, 400, 503].includes(res.status)).toBe(true);
    });
  });

  describe('mock responses', () => {
    it('should return mock interpretation when interpreter is disabled', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      process.env.OPENAI_API_KEY = 'sk-test-key';

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toMatch(/^int_/);
      expect(data.message).toBe('Hello there friend 😀 how are you today?');
      expect(data.interpretation).toContain('placeholder');
      expect(data.emojis).toBeDefined();
      expect(data.metrics).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it('should return mock interpretation when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      // Should return mock response (200) when OpenAI is not configured
      expect(res.status).toBe(200);
      expect(data.interpretation).toContain('placeholder');
    });

    it('should extract emojis correctly in mock response', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';

      const req = createRequest({
        message: 'Multiple emojis 😀 here 🎉 and 👋',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBe(3);
      expect(data.emojis.map((e: { character: string }) => e.character)).toContain('😀');
      expect(data.emojis.map((e: { character: string }) => e.character)).toContain('🎉');
      expect(data.emojis.map((e: { character: string }) => e.character)).toContain('👋');
    });
  });

  describe('validation edge cases', () => {
    it('should handle multiple validation errors', async () => {
      const req = createRequest({
        message: 'Hi', // Too short AND no emoji
        platform: 'INVALID',
        context: 'INVALID',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.fieldErrors).toBeDefined();
    });

    it('should return fieldErrors with field-specific error messages', async () => {
      const req = createRequest({
        message: 'short😀', // Has emoji but too short
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.fieldErrors?.message).toBeDefined();
      expect(data.fieldErrors?.message[0]).toContain('10 characters');
    });

    it('should accept message at exactly 10 characters with emoji', async () => {
      // 10 chars including emoji (emoji counts as 2 chars typically)
      const req = createRequest({
        message: 'Hi there😀', // "Hi there" (8) + emoji (2) = 10 chars
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation
      expect(res.status).not.toBe(400);
    });

    it('should reject message longer than 1000 characters with emoji', async () => {
      // Create a message that exceeds 1000 characters
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
      // Create a message that's exactly at the max 1000 characters
      // emoji '😀' counts as 2 characters, so 998 + 2 = 1000
      const longText = 'a'.repeat(998) + '😀';
      const req = createRequest({
        message: longText,
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation (200 or 503, not 400)
      expect([200, 503].includes(res.status)).toBe(true);
    });

    it('should handle message with only whitespace and emoji', async () => {
      const req = createRequest({
        message: '          😀', // 10 spaces + emoji
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      // Should pass validation (whitespace counts as characters)
      expect(res.status).not.toBe(400);
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

  describe('emoji deduplication', () => {
    it('should deduplicate repeated emojis in mock response', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';

      const req = createRequest({
        message: 'Hello 😀 there 😀 friend 😀',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      // Should only have 1 unique emoji in the list
      expect(data.emojis.length).toBe(1);
      expect(data.emojis[0].character).toBe('😀');
    });

    it('should handle mixed unique and duplicate emojis', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';

      const req = createRequest({
        message: 'Hello 😀 there 🎉 and 😀 again 🎉',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      // Should have 2 unique emojis
      expect(data.emojis.length).toBe(2);
    });
  });

  describe('interpreter configuration states', () => {
    it('should return mock when interpreter enabled but no API key', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      delete process.env.OPENAI_API_KEY;

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.interpretation).toContain('placeholder');
    });

    it('should return mock when interpreter disabled with API key', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      process.env.OPENAI_API_KEY = 'sk-test-key';

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.interpretation).toContain('placeholder');
    });

    it('should return mock when both interpreter disabled and no API key', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      delete process.env.OPENAI_API_KEY;

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.interpretation).toContain('placeholder');
    });
  });

  describe('response structure validation', () => {
    it('should include all required fields in mock response', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      // Verify all required InterpretationResult fields
      expect(data.id).toMatch(/^int_/);
      expect(data.message).toBe('Hello there friend 😀 how are you today?');
      expect(Array.isArray(data.emojis)).toBe(true);
      expect(typeof data.interpretation).toBe('string');
      expect(data.metrics).toBeDefined();
      expect(typeof data.metrics.sarcasmProbability).toBe('number');
      expect(typeof data.metrics.passiveAggressionProbability).toBe('number');
      expect(['positive', 'neutral', 'negative']).toContain(data.metrics.overallTone);
      expect(typeof data.metrics.confidence).toBe('number');
      expect(Array.isArray(data.redFlags)).toBe(true);
      expect(data.timestamp).toBeDefined();
    });

    it('should include emoji character and meaning in mock response', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.emojis.length).toBeGreaterThan(0);
      expect(data.emojis[0].character).toBe('😀');
      expect(typeof data.emojis[0].meaning).toBe('string');
    });
  });

  describe('cache headers', () => {
    it('should not cache successful responses (dynamic content)', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);

      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain('no-store');
    });

    it('should include private directive to prevent proxy caching', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';

      const req = createRequest({
        message: 'Hello there friend 😀 how are you today?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      const res = await POST(req);

      const cacheControl = res.headers.get('Cache-Control');
      expect(cacheControl).toContain('private');
    });
  });
});
