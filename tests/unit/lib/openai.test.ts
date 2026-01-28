import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

// Store original env
const originalEnv = { ...process.env };

describe('openai module', () => {
  beforeEach(async () => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Clear module cache to ensure fresh import
    delete require.cache[require.resolve('../../../src/lib/openai')];
    // Reset client instances
    try {
      const { resetClients } = await import('../../../src/lib/openai');
      resetClients();
    } catch {
      // Module may not be loaded yet, which is fine
    }
  });

  afterEach(async () => {
    // Restore original env
    process.env = originalEnv;
    // Reset client instances after each test
    try {
      const { resetClients } = await import('../../../src/lib/openai');
      resetClients();
    } catch {
      // Module may not be loaded yet, which is fine
    }
  });

  describe('getOpenAIClient', () => {
    it('should throw error when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      const { getOpenAIClient } = await import('../../../src/lib/openai');
      expect(() => getOpenAIClient()).toThrow('OPENAI_API_KEY is not configured');
    });

    it('should return OpenAI client when API key is set', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { getOpenAIClient } = await import('../../../src/lib/openai');
      const client = getOpenAIClient();
      expect(client).toBeDefined();
    });

    it('should return the same client instance on subsequent calls', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { getOpenAIClient } = await import('../../../src/lib/openai');
      const client1 = getOpenAIClient();
      const client2 = getOpenAIClient();
      expect(client1).toBe(client2);
    });
  });

  describe('INTERPRETATION_SYSTEM_PROMPT', () => {
    it('should be a non-empty string', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { INTERPRETATION_SYSTEM_PROMPT } = await import('../../../src/lib/openai');
      expect(typeof INTERPRETATION_SYSTEM_PROMPT).toBe('string');
      expect(INTERPRETATION_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it('should mention emoji analysis', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { INTERPRETATION_SYSTEM_PROMPT } = await import('../../../src/lib/openai');
      expect(INTERPRETATION_SYSTEM_PROMPT.toLowerCase()).toContain('emoji');
    });

    it('should mention sarcasm scoring', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { INTERPRETATION_SYSTEM_PROMPT } = await import('../../../src/lib/openai');
      expect(INTERPRETATION_SYSTEM_PROMPT.toLowerCase()).toContain('sarcasm');
    });

    it('should mention passive-aggression scoring', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { INTERPRETATION_SYSTEM_PROMPT } = await import('../../../src/lib/openai');
      expect(INTERPRETATION_SYSTEM_PROMPT.toLowerCase()).toContain('passive');
    });
  });

  describe('OPENAI_MODEL', () => {
    it('should be gpt-4-turbo', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { OPENAI_MODEL } = await import('../../../src/lib/openai');
      expect(OPENAI_MODEL).toBe('gpt-4-turbo');
    });
  });

  describe('interpretationResponseSchema', () => {
    it('should be a valid zod schema', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { interpretationResponseSchema } = await import('../../../src/lib/openai');
      expect(interpretationResponseSchema).toBeDefined();
      expect(typeof interpretationResponseSchema.parse).toBe('function');
    });

    it('should validate correct interpretation response', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { interpretationResponseSchema } = await import('../../../src/lib/openai');

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

    it('should reject invalid interpretation response', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { interpretationResponseSchema } = await import('../../../src/lib/openai');

      const invalidResponse = {
        emojis: 'not an array',
        interpretation: 123,
      };

      expect(() => interpretationResponseSchema.parse(invalidResponse)).toThrow();
    });

    it('should validate metrics with correct range (0-100)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { interpretationResponseSchema } = await import('../../../src/lib/openai');

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

    it('should validate metrics with negative values as invalid', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { interpretationResponseSchema } = await import('../../../src/lib/openai');

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

    it('should validate overallTone enum values', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { interpretationResponseSchema } = await import('../../../src/lib/openai');

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

    it('should validate red flags with severity enum', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { interpretationResponseSchema } = await import('../../../src/lib/openai');

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
    it('should include the message in the prompt', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { buildInterpretationPrompt } = await import('../../../src/lib/openai');

      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊 how are you?',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });

      expect(prompt).toContain('Hey 😊 how are you?');
    });

    it('should include the platform in the prompt', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { buildInterpretationPrompt } = await import('../../../src/lib/openai');

      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊',
        platform: 'SLACK',
        context: 'COWORKER',
      });

      expect(prompt).toContain('SLACK');
    });

    it('should include the relationship context in the prompt', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { buildInterpretationPrompt } = await import('../../../src/lib/openai');

      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊',
        platform: 'IMESSAGE',
        context: 'ROMANTIC_PARTNER',
      });

      expect(prompt).toContain('ROMANTIC_PARTNER');
    });

    it('should handle OTHER platform', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { buildInterpretationPrompt } = await import('../../../src/lib/openai');

      const prompt = buildInterpretationPrompt({
        message: 'Hey 😊',
        platform: 'OTHER',
        context: 'FRIEND',
      });

      expect(prompt).toContain('OTHER');
    });
  });

  describe('OpenAIError', () => {
    it('should be a custom error class', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { OpenAIError } = await import('../../../src/lib/openai');

      const error = new OpenAIError('Test error', 'API_ERROR');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('OpenAIError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('API_ERROR');
    });

    it('should include optional status code', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { OpenAIError } = await import('../../../src/lib/openai');

      const error = new OpenAIError('Rate limited', 'RATE_LIMIT', 429);
      expect(error.statusCode).toBe(429);
    });
  });

  describe('TokenUsage', () => {
    it('should track token usage with all required fields', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { tokenUsageSchema } = await import('../../../src/lib/openai');

      const usage = {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      };

      const result = tokenUsageSchema.parse(usage);
      expect(result).toEqual(usage);
    });

    it('should reject negative token counts', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { tokenUsageSchema } = await import('../../../src/lib/openai');

      const invalidUsage = {
        promptTokens: -10,
        completionTokens: 50,
        totalTokens: 40,
      };

      expect(() => tokenUsageSchema.parse(invalidUsage)).toThrow();
    });
  });

  describe('MAX_RETRIES', () => {
    it('should be a positive number', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { MAX_RETRIES } = await import('../../../src/lib/openai');
      expect(MAX_RETRIES).toBeGreaterThan(0);
    });

    it('should default to 3', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { MAX_RETRIES } = await import('../../../src/lib/openai');
      expect(MAX_RETRIES).toBe(3);
    });
  });

  describe('RETRY_DELAY_MS', () => {
    it('should be a positive number', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { RETRY_DELAY_MS } = await import('../../../src/lib/openai');
      expect(RETRY_DELAY_MS).toBeGreaterThan(0);
    });

    it('should default to 1000ms', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { RETRY_DELAY_MS } = await import('../../../src/lib/openai');
      expect(RETRY_DELAY_MS).toBe(1000);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for rate limit errors (429)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { isRetryableError, OpenAIError } = await import('../../../src/lib/openai');

      const error = new OpenAIError('Rate limited', 'RATE_LIMIT', 429);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for server errors (500)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { isRetryableError, OpenAIError } = await import('../../../src/lib/openai');

      const error = new OpenAIError('Server error', 'SERVER_ERROR', 500);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for service unavailable (503)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { isRetryableError, OpenAIError } = await import('../../../src/lib/openai');

      const error = new OpenAIError('Service unavailable', 'SERVER_ERROR', 503);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for client errors (400)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { isRetryableError, OpenAIError } = await import('../../../src/lib/openai');

      const error = new OpenAIError('Bad request', 'INVALID_REQUEST', 400);
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for auth errors (401)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { isRetryableError, OpenAIError } = await import('../../../src/lib/openai');

      const error = new OpenAIError('Unauthorized', 'AUTH_ERROR', 401);
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for non-OpenAIError', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { isRetryableError } = await import('../../../src/lib/openai');

      const error = new Error('Generic error');
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getOpenAIProvider', () => {
    it('should throw error when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      const { getOpenAIProvider } = await import('../../../src/lib/openai');
      expect(() => getOpenAIProvider()).toThrow('OPENAI_API_KEY is not configured');
    });

    it('should return OpenAI provider when API key is set', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { getOpenAIProvider } = await import('../../../src/lib/openai');
      const provider = getOpenAIProvider();
      expect(provider).toBeDefined();
    });
  });
});
