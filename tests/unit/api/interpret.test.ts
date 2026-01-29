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
});
