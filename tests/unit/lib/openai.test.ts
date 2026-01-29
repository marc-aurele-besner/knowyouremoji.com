import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  getOpenAIClient,
  getOpenAIProvider,
  buildInterpretationPrompt,
  interpretationResponseSchema,
  tokenUsageSchema,
  OpenAIError,
  isRetryableError,
  resetClients,
  INTERPRETATION_SYSTEM_PROMPT,
  OPENAI_MODEL,
  MAX_RETRIES,
  RETRY_DELAY_MS,
} from '../../../src/lib/openai';

// Store original env
const originalEnv = { ...process.env };

describe('openai module', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Reset client instances
    resetClients();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    // Reset client instances after each test
    resetClients();
  });

  describe('getOpenAIClient', () => {
    it('should throw error when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => getOpenAIClient()).toThrow('OPENAI_API_KEY is not configured');
    });

    it('should return OpenAI client when API key is set', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const client = getOpenAIClient();
      expect(client).toBeDefined();
    });

    it('should return the same client instance on subsequent calls', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const client1 = getOpenAIClient();
      const client2 = getOpenAIClient();
      expect(client1).toBe(client2);
    });
  });

  describe('INTERPRETATION_SYSTEM_PROMPT', () => {
    it('should be a non-empty string', () => {
      expect(typeof INTERPRETATION_SYSTEM_PROMPT).toBe('string');
      expect(INTERPRETATION_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it('should mention emoji analysis', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT.toLowerCase()).toContain('emoji');
    });

    it('should mention sarcasm scoring', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT.toLowerCase()).toContain('sarcasm');
    });

    it('should mention passive-aggression scoring', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT.toLowerCase()).toContain('passive');
    });
  });

  describe('OPENAI_MODEL', () => {
    it('should be gpt-4-turbo', () => {
      expect(OPENAI_MODEL).toBe('gpt-4-turbo');
    });
  });

  describe('interpretationResponseSchema', () => {
    it('should be a valid zod schema', () => {
      expect(interpretationResponseSchema).toBeDefined();
      expect(typeof interpretationResponseSchema.parse).toBe('function');
    });

    it('should validate correct interpretation response', () => {
      const validResponse = {
        emojis: [
          {
            character: '😊',
            meaning: 'Expressing genuine happiness or friendliness',
          },
        ],
        interpretation: 'The message conveys a friendly greeting with positive intent.',
        metrics: {
          sarcasmProbability: 10,
          passiveAggressionProbability: 5,
          overallTone: 'positive' as const,
          confidence: 85,
        },
        redFlags: [],
      };

      const result = interpretationResponseSchema.parse(validResponse);
      expect(result).toEqual(validResponse);
    });

    it('should reject invalid interpretation response', () => {
      const invalidResponse = {
        emojis: 'not an array',
        interpretation: 123,
      };

      expect(() => interpretationResponseSchema.parse(invalidResponse)).toThrow();
    });

    it('should validate metrics with correct range (0-100)', () => {
      const responseWithInvalidMetrics = {
        emojis: [],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: 150, // Invalid: > 100
          passiveAggressionProbability: 50,
          overallTone: 'positive' as const,
          confidence: 85,
        },
        redFlags: [],
      };

      expect(() => interpretationResponseSchema.parse(responseWithInvalidMetrics)).toThrow();
    });

    it('should validate metrics with negative values as invalid', () => {
      const responseWithNegativeMetrics = {
        emojis: [],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: -10, // Invalid: < 0
          passiveAggressionProbability: 50,
          overallTone: 'positive' as const,
          confidence: 85,
        },
        redFlags: [],
      };

      expect(() => interpretationResponseSchema.parse(responseWithNegativeMetrics)).toThrow();
    });

    it('should validate overallTone enum values', () => {
      const responseWithInvalidTone = {
        emojis: [],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: 50,
          passiveAggressionProbability: 50,
          overallTone: 'invalid' as const,
          confidence: 85,
        },
        redFlags: [],
      };

      expect(() => interpretationResponseSchema.parse(responseWithInvalidTone)).toThrow();
    });

    it('should validate red flags with severity enum', () => {
      const validResponseWithRedFlags = {
        emojis: [{ character: '🚩', meaning: 'Warning sign' }],
        interpretation: 'The message contains concerning patterns.',
        metrics: {
          sarcasmProbability: 50,
          passiveAggressionProbability: 70,
          overallTone: 'negative' as const,
          confidence: 90,
        },
        redFlags: [
          {
            type: 'manipulation',
            description: 'Guilt-tripping language detected',
            severity: 'high' as const,
          },
        ],
      };

      const result = interpretationResponseSchema.parse(validResponseWithRedFlags);
      expect(result.redFlags).toHaveLength(1);
      expect(result.redFlags[0].severity).toBe('high');
    });
  });

  describe('buildInterpretationPrompt', () => {
    it('should include the message in the prompt', () => {
      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊 how are you?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      expect(prompt).toContain('Hey 😊 how are you?');
    });

    it('should include the platform in the prompt', () => {
      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊',
        platform: 'SLACK',
        context: 'COWORKER',
      });

      expect(prompt).toContain('SLACK');
    });

    it('should include the relationship context in the prompt', () => {
      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊',
        platform: 'IMESSAGE',
        context: 'ROMANTIC_PARTNER',
      });

      expect(prompt).toContain('ROMANTIC_PARTNER');
    });

    it('should handle OTHER platform', () => {
      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊',
        platform: 'OTHER',
        context: 'FRIEND',
      });

      expect(prompt).toContain('OTHER');
    });

    it('should include platform labels for all platforms', () => {
      // Test each platform
      const platforms = [
        { platform: 'IMESSAGE' as const, expectedLabel: 'Apple iMessage' },
        { platform: 'INSTAGRAM' as const, expectedLabel: 'Instagram DMs' },
        { platform: 'TIKTOK' as const, expectedLabel: 'TikTok comments/messages' },
        { platform: 'WHATSAPP' as const, expectedLabel: 'WhatsApp' },
        { platform: 'SLACK' as const, expectedLabel: 'Slack workplace messaging' },
        { platform: 'DISCORD' as const, expectedLabel: 'Discord' },
        { platform: 'TWITTER' as const, expectedLabel: 'Twitter/X DMs' },
        { platform: 'OTHER' as const, expectedLabel: 'Other platform' },
      ];

      for (const { platform, expectedLabel } of platforms) {
        const prompt = buildInterpretationPrompt({
          message: 'Test 😊',
          platform,
          context: 'FRIEND',
        });
        expect(prompt).toContain(expectedLabel);
      }
    });

    it('should include context labels for all relationship contexts', () => {
      // Test each context
      const contexts = [
        {
          context: 'ROMANTIC_PARTNER' as const,
          expectedLabel: 'Someone you are dating or in a relationship with',
        },
        { context: 'FRIEND' as const, expectedLabel: 'A friend or close acquaintance' },
        { context: 'FAMILY' as const, expectedLabel: 'A family member' },
        { context: 'COWORKER' as const, expectedLabel: 'A colleague or professional contact' },
        { context: 'ACQUAINTANCE' as const, expectedLabel: 'Someone you know casually' },
        { context: 'STRANGER' as const, expectedLabel: 'Someone you do not know personally' },
      ];

      for (const { context, expectedLabel } of contexts) {
        const prompt = buildInterpretationPrompt({
          message: 'Test 😊',
          platform: 'IMESSAGE',
          context,
        });
        expect(prompt).toContain(expectedLabel);
      }
    });
  });

  describe('OpenAIError', () => {
    it('should be a custom error class', () => {
      const error = new OpenAIError('Test error', 'API_ERROR');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('OpenAIError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('API_ERROR');
    });

    it('should include optional status code', () => {
      const error = new OpenAIError('Rate limited', 'RATE_LIMIT', 429);
      expect(error.statusCode).toBe(429);
    });

    it('should have undefined statusCode when not provided', () => {
      const error = new OpenAIError('Config error', 'CONFIG_ERROR');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('TokenUsage', () => {
    it('should track token usage with all required fields', () => {
      const usage = {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      };

      const result = tokenUsageSchema.parse(usage);
      expect(result).toEqual(usage);
    });

    it('should reject negative token counts', () => {
      const invalidUsage = {
        promptTokens: -10,
        completionTokens: 50,
        totalTokens: 40,
      };

      expect(() => tokenUsageSchema.parse(invalidUsage)).toThrow();
    });
  });

  describe('MAX_RETRIES', () => {
    it('should be a positive number', () => {
      expect(MAX_RETRIES).toBeGreaterThan(0);
    });

    it('should default to 3', () => {
      expect(MAX_RETRIES).toBe(3);
    });
  });

  describe('RETRY_DELAY_MS', () => {
    it('should be a positive number', () => {
      expect(RETRY_DELAY_MS).toBeGreaterThan(0);
    });

    it('should default to 1000ms', () => {
      expect(RETRY_DELAY_MS).toBe(1000);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for rate limit errors (429)', () => {
      const error = new OpenAIError('Rate limited', 'RATE_LIMIT', 429);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for server errors (500)', () => {
      const error = new OpenAIError('Server error', 'SERVER_ERROR', 500);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for service unavailable (503)', () => {
      const error = new OpenAIError('Service unavailable', 'SERVER_ERROR', 503);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for client errors (400)', () => {
      const error = new OpenAIError('Bad request', 'INVALID_REQUEST', 400);
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for auth errors (401)', () => {
      const error = new OpenAIError('Unauthorized', 'AUTH_ERROR', 401);
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for non-OpenAIError', () => {
      const error = new Error('Generic error');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for OpenAIError without status code', () => {
      const error = new OpenAIError('Error without status', 'API_ERROR');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return true for edge status code (599)', () => {
      const error = new OpenAIError('Server error', 'SERVER_ERROR', 599);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for status code 600', () => {
      const error = new OpenAIError('Unknown error', 'API_ERROR', 600);
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getOpenAIProvider', () => {
    it('should throw error when OPENAI_API_KEY is not set', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => getOpenAIProvider()).toThrow('OPENAI_API_KEY is not configured');
    });

    it('should return OpenAI provider when API key is set', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const provider = getOpenAIProvider();
      expect(provider).toBeDefined();
    });

    it('should return the same provider instance on subsequent calls', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const provider1 = getOpenAIProvider();
      const provider2 = getOpenAIProvider();
      expect(provider1).toBe(provider2);
    });
  });

  describe('resetClients', () => {
    it('should reset client instances', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const client1 = getOpenAIClient();
      resetClients();
      const client2 = getOpenAIClient();
      expect(client1).not.toBe(client2);
    });

    it('should reset provider instances', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const provider1 = getOpenAIProvider();
      resetClients();
      const provider2 = getOpenAIProvider();
      expect(provider1).not.toBe(provider2);
    });
  });
});
