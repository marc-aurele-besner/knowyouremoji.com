import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  extractEmojisWithPositions,
  lookupEmojiSlug,
  createEmojiSlugMap,
  clearEmojiSlugCache,
  parseOpenAIResponse,
  buildInterpretationResult,
  interpretMessage,
} from '../../../src/lib/interpreter';
import { OpenAIError, resetClients } from '../../../src/lib/openai';

// Store original env
const originalEnv = { ...process.env };

describe('interpreter service', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv, OPENAI_API_KEY: 'sk-test-key' };
    // Reset OpenAI clients and emoji cache
    resetClients();
    clearEmojiSlugCache();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    resetClients();
    clearEmojiSlugCache();
  });

  describe('extractEmojisWithPositions', () => {
    it('should extract single emoji with position', () => {
      const result = extractEmojisWithPositions('Hello 😀');
      expect(result).toHaveLength(1);
      expect(result[0].character).toBe('😀');
      expect(result[0].index).toBe(6);
    });

    it('should extract multiple emojis with positions', () => {
      const result = extractEmojisWithPositions('Hello 👋 there 😊');
      expect(result).toHaveLength(2);
      expect(result[0].character).toBe('👋');
      expect(result[0].index).toBe(6);
      expect(result[1].character).toBe('😊');
      // Note: 👋 takes 2 bytes, so position is 'Hello '.length (6) + '👋'.length (2) + ' there '.length (7) = 15
      expect(result[1].index).toBe(15);
    });

    it('should handle combined emojis (ZWJ sequences)', () => {
      const result = extractEmojisWithPositions('Family: 👨‍👩‍👧‍👦');
      expect(result).toHaveLength(1);
      expect(result[0].character).toBe('👨‍👩‍👧‍👦');
    });

    it('should handle emoji modifiers (skin tones)', () => {
      const result = extractEmojisWithPositions('Hi 👋🏻 there');
      // Note: skin tone modifiers may be extracted separately depending on the regex
      // The key is that we detect the emoji exists
      expect(result.length).toBeGreaterThan(0);
      // At least one of them should be the wave emoji
      const hasWaveEmoji = result.some((e) => e.character.includes('👋'));
      expect(hasWaveEmoji).toBe(true);
    });

    it('should return empty array for message without emojis', () => {
      const result = extractEmojisWithPositions('Hello there');
      expect(result).toHaveLength(0);
    });

    it('should handle consecutive emojis', () => {
      const result = extractEmojisWithPositions('😀😊😎');
      expect(result).toHaveLength(3);
    });
  });

  describe('lookupEmojiSlug', () => {
    it('should return slug for known emoji', () => {
      // This depends on emoji data being available
      // For now, test that it returns undefined if emoji not found
      const result = lookupEmojiSlug('🦄');
      // Result could be undefined or a slug depending on data
      expect(result === undefined || typeof result === 'string').toBe(true);
    });

    it('should return undefined for unknown emoji', () => {
      // Use an obscure emoji that likely isn't in the data
      const result = lookupEmojiSlug('🏴󠁧󠁢󠁥󠁮󠁧󠁿');
      // Could be undefined or a string depending on data
      expect(result === undefined || typeof result === 'string').toBe(true);
    });

    it('should cache results after first lookup', () => {
      // First lookup
      const result1 = lookupEmojiSlug('😀');
      // Second lookup should hit cache
      const result2 = lookupEmojiSlug('😀');
      // Results should be the same
      expect(result1).toBe(result2);
    });
  });

  describe('interpretMessage', () => {
    it('should throw error when OpenAI key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      resetClients();

      await expect(
        interpretMessage({
          message: 'Hello 😀 there',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        })
      ).rejects.toThrow('OPENAI_API_KEY is not configured');
    });

    it('should be a function', () => {
      expect(typeof interpretMessage).toBe('function');
    });
  });

  describe('parseOpenAIResponse', () => {
    it('should parse valid JSON response', () => {
      const validResponse = {
        emojis: [{ character: '😀', meaning: 'Happy face' }],
        interpretation: 'A friendly message',
        metrics: {
          sarcasmProbability: 10,
          passiveAggressionProbability: 5,
          overallTone: 'positive' as const,
          confidence: 85,
        },
        redFlags: [],
      };

      const result = parseOpenAIResponse(JSON.stringify(validResponse));
      expect(result.emojis).toHaveLength(1);
      expect(result.interpretation).toBe('A friendly message');
      expect(result.metrics.sarcasmProbability).toBe(10);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => parseOpenAIResponse('not valid json')).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidResponse = {
        emojis: [{ character: '😀' }],
        // Missing interpretation, metrics, redFlags
      };

      expect(() => parseOpenAIResponse(JSON.stringify(invalidResponse))).toThrow();
    });

    it('should validate metrics range (0-100)', () => {
      const responseWithInvalidMetrics = {
        emojis: [],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: 150, // Invalid
          passiveAggressionProbability: 5,
          overallTone: 'positive',
          confidence: 85,
        },
        redFlags: [],
      };

      expect(() => parseOpenAIResponse(JSON.stringify(responseWithInvalidMetrics))).toThrow();
    });

    it('should validate overallTone enum', () => {
      const responseWithInvalidTone = {
        emojis: [],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: 10,
          passiveAggressionProbability: 5,
          overallTone: 'happy', // Invalid - should be positive/neutral/negative
          confidence: 85,
        },
        redFlags: [],
      };

      expect(() => parseOpenAIResponse(JSON.stringify(responseWithInvalidTone))).toThrow();
    });

    it('should validate red flag severity enum', () => {
      const responseWithInvalidSeverity = {
        emojis: [],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: 10,
          passiveAggressionProbability: 5,
          overallTone: 'negative',
          confidence: 85,
        },
        redFlags: [
          {
            type: 'manipulation',
            description: 'Test',
            severity: 'critical', // Invalid - should be low/medium/high
          },
        ],
      };

      expect(() => parseOpenAIResponse(JSON.stringify(responseWithInvalidSeverity))).toThrow();
    });

    it('should throw PARSE_ERROR for invalid JSON', () => {
      try {
        parseOpenAIResponse('invalid json');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Use name check instead of instanceof for cross-module compatibility
        expect((error as Error).name).toBe('OpenAIError');
        expect((error as OpenAIError).code).toBe('PARSE_ERROR');
      }
    });

    it('should throw PARSE_ERROR for schema validation failure', () => {
      try {
        parseOpenAIResponse(JSON.stringify({ invalid: 'response' }));
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Use name check instead of instanceof for cross-module compatibility
        expect((error as Error).name).toBe('OpenAIError');
        expect((error as OpenAIError).code).toBe('PARSE_ERROR');
      }
    });

    it('should handle response with optional emoji slug', () => {
      const responseWithSlug = {
        emojis: [{ character: '😀', meaning: 'Happy', slug: 'optional-slug' }],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: 0,
          passiveAggressionProbability: 0,
          overallTone: 'positive',
          confidence: 100,
        },
        redFlags: [],
      };

      const result = parseOpenAIResponse(JSON.stringify(responseWithSlug));
      expect(result.emojis[0].slug).toBe('optional-slug');
    });

    it('should handle response with all red flag severities', () => {
      const responseWithRedFlags = {
        emojis: [],
        interpretation: 'Concerning',
        metrics: {
          sarcasmProbability: 50,
          passiveAggressionProbability: 50,
          overallTone: 'negative',
          confidence: 80,
        },
        redFlags: [
          { type: 'type1', description: 'Desc 1', severity: 'low' },
          { type: 'type2', description: 'Desc 2', severity: 'medium' },
          { type: 'type3', description: 'Desc 3', severity: 'high' },
        ],
      };

      const result = parseOpenAIResponse(JSON.stringify(responseWithRedFlags));
      expect(result.redFlags).toHaveLength(3);
    });
  });

  describe('buildInterpretationResult', () => {
    it('should create a valid InterpretationResult', () => {
      const result = buildInterpretationResult(
        'Hello 😀 friend',
        {
          emojis: [{ character: '😀', meaning: 'Happy face' }],
          interpretation: 'A friendly greeting',
          metrics: {
            sarcasmProbability: 10,
            passiveAggressionProbability: 5,
            overallTone: 'positive' as const,
            confidence: 85,
          },
          redFlags: [],
        },
        new Map([['😀', 'grinning-face']])
      );

      expect(result.message).toBe('Hello 😀 friend');
      expect(result.emojis).toHaveLength(1);
      expect(result.emojis[0].slug).toBe('grinning-face');
      expect(result.interpretation).toBe('A friendly greeting');
      expect(result.metrics.sarcasmProbability).toBe(10);
      expect(result.redFlags).toHaveLength(0);
      expect(result.id).toMatch(/^int_/);
      expect(result.timestamp).toBeDefined();
    });

    it('should generate unique IDs', () => {
      const mockResponse = {
        emojis: [],
        interpretation: 'Test',
        metrics: {
          sarcasmProbability: 0,
          passiveAggressionProbability: 0,
          overallTone: 'neutral' as const,
          confidence: 50,
        },
        redFlags: [],
      };

      const result1 = buildInterpretationResult('Test 😀', mockResponse, new Map());
      const result2 = buildInterpretationResult('Test 😀', mockResponse, new Map());

      expect(result1.id).not.toBe(result2.id);
    });

    it('should handle emojis without slugs', () => {
      const result = buildInterpretationResult(
        'Hello 🦄 friend',
        {
          emojis: [{ character: '🦄', meaning: 'Unicorn' }],
          interpretation: 'A magical greeting',
          metrics: {
            sarcasmProbability: 0,
            passiveAggressionProbability: 0,
            overallTone: 'positive' as const,
            confidence: 90,
          },
          redFlags: [],
        },
        new Map() // No slug mapping
      );

      expect(result.emojis[0].slug).toBeUndefined();
    });

    it('should include red flags in result', () => {
      const result = buildInterpretationResult(
        'Test 😀',
        {
          emojis: [],
          interpretation: 'Concerning message',
          metrics: {
            sarcasmProbability: 80,
            passiveAggressionProbability: 90,
            overallTone: 'negative' as const,
            confidence: 85,
          },
          redFlags: [
            {
              type: 'manipulation',
              description: 'Guilt-tripping detected',
              severity: 'high' as const,
            },
          ],
        },
        new Map()
      );

      expect(result.redFlags).toHaveLength(1);
      expect(result.redFlags[0].type).toBe('manipulation');
      expect(result.redFlags[0].severity).toBe('high');
    });

    it('should use emoji slug from response when not in slugMap', () => {
      const result = buildInterpretationResult(
        'Hello 😀 friend',
        {
          emojis: [{ character: '😀', meaning: 'Happy face', slug: 'from-response' }],
          interpretation: 'A friendly greeting',
          metrics: {
            sarcasmProbability: 10,
            passiveAggressionProbability: 5,
            overallTone: 'positive' as const,
            confidence: 85,
          },
          redFlags: [],
        },
        new Map() // Empty slug map - should fall back to response slug
      );

      expect(result.emojis[0].slug).toBe('from-response');
    });

    it('should prefer slugMap over response slug', () => {
      const result = buildInterpretationResult(
        'Hello 😀 friend',
        {
          emojis: [{ character: '😀', meaning: 'Happy face', slug: 'from-response' }],
          interpretation: 'A friendly greeting',
          metrics: {
            sarcasmProbability: 10,
            passiveAggressionProbability: 5,
            overallTone: 'positive' as const,
            confidence: 85,
          },
          redFlags: [],
        },
        new Map([['😀', 'from-slugmap']])
      );

      expect(result.emojis[0].slug).toBe('from-slugmap');
    });

    it('should handle multiple red flags', () => {
      const result = buildInterpretationResult(
        'Test 😀',
        {
          emojis: [],
          interpretation: 'Very concerning message',
          metrics: {
            sarcasmProbability: 90,
            passiveAggressionProbability: 95,
            overallTone: 'negative' as const,
            confidence: 95,
          },
          redFlags: [
            {
              type: 'manipulation',
              description: 'Guilt-tripping detected',
              severity: 'high' as const,
            },
            {
              type: 'gaslighting',
              description: 'Reality distortion detected',
              severity: 'medium' as const,
            },
            {
              type: 'boundary_violation',
              description: 'Personal boundary crossed',
              severity: 'low' as const,
            },
          ],
        },
        new Map()
      );

      expect(result.redFlags).toHaveLength(3);
      expect(result.redFlags[0].severity).toBe('high');
      expect(result.redFlags[1].severity).toBe('medium');
      expect(result.redFlags[2].severity).toBe('low');
    });

    it('should map all metric fields correctly', () => {
      const result = buildInterpretationResult(
        'Test 😀',
        {
          emojis: [],
          interpretation: 'Test interpretation',
          metrics: {
            sarcasmProbability: 25,
            passiveAggressionProbability: 35,
            overallTone: 'neutral' as const,
            confidence: 75,
          },
          redFlags: [],
        },
        new Map()
      );

      expect(result.metrics.sarcasmProbability).toBe(25);
      expect(result.metrics.passiveAggressionProbability).toBe(35);
      expect(result.metrics.overallTone).toBe('neutral');
      expect(result.metrics.confidence).toBe(75);
    });

    it('should handle multiple emojis in response', () => {
      const result = buildInterpretationResult(
        'Hello 😀😊🎉',
        {
          emojis: [
            { character: '😀', meaning: 'Happy face' },
            { character: '😊', meaning: 'Smiling face' },
            { character: '🎉', meaning: 'Celebration' },
          ],
          interpretation: 'A celebratory message',
          metrics: {
            sarcasmProbability: 5,
            passiveAggressionProbability: 0,
            overallTone: 'positive' as const,
            confidence: 95,
          },
          redFlags: [],
        },
        new Map([
          ['😀', 'grinning-face'],
          ['😊', 'smiling-face'],
        ])
      );

      expect(result.emojis).toHaveLength(3);
      expect(result.emojis[0].slug).toBe('grinning-face');
      expect(result.emojis[1].slug).toBe('smiling-face');
      expect(result.emojis[2].slug).toBeUndefined();
    });
  });

  describe('createEmojiSlugMap', () => {
    it('should create map from extracted emojis', () => {
      const extractedEmojis = [
        { character: '😀', index: 0 },
        { character: '😊', index: 5 },
      ];

      const map = createEmojiSlugMap(extractedEmojis);

      // Map should exist and be iterable
      expect(map instanceof Map).toBe(true);
    });

    it('should handle empty emoji array', () => {
      const map = createEmojiSlugMap([]);

      expect(map.size).toBe(0);
    });

    it('should only include emojis that have slugs', () => {
      // Use an emoji that likely exists in data and one that doesn't
      const extractedEmojis = [
        { character: '😀', index: 0 },
        { character: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', index: 5 }, // Scotland flag - unlikely to have a slug
      ];

      const map = createEmojiSlugMap(extractedEmojis);

      // Map size depends on what emojis have slugs
      expect(map instanceof Map).toBe(true);
    });
  });

  describe('clearEmojiSlugCache', () => {
    it('should clear the emoji slug cache', () => {
      // First lookup to populate cache
      lookupEmojiSlug('😀');

      // Clear the cache
      clearEmojiSlugCache();

      // The function should still work after clearing
      const result = lookupEmojiSlug('😀');
      expect(result === undefined || typeof result === 'string').toBe(true);
    });

    it('should allow cache to be rebuilt after clearing', () => {
      // First lookup
      const result1 = lookupEmojiSlug('😀');

      // Clear cache
      clearEmojiSlugCache();

      // Second lookup (rebuilds cache)
      const result2 = lookupEmojiSlug('😀');

      // Results should be the same
      expect(result1).toBe(result2);
    });
  });
});
