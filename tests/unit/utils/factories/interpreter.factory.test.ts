import { describe, it, expect } from 'bun:test';
import {
  createInterpretRequest,
  createInterpretationResult,
  createDetectedEmoji,
  createInterpretationMetrics,
  createRedFlag,
  createMultipleDetectedEmojis,
  createMultipleRedFlags,
} from '../../../utils/factories/interpreter.factory';
import type {
  DetectedEmoji,
  RedFlag,
  Platform,
  RelationshipContext,
} from '../../../../src/types/emoji';

describe('interpreter.factory', () => {
  describe('createInterpretRequest', () => {
    it('should create a valid InterpretRequest with default values', () => {
      const request = createInterpretRequest();

      expect(request.message).toBeDefined();
      expect(request.message.length).toBeGreaterThanOrEqual(10);
      expect(request.platform).toBeDefined();
      expect(request.context).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const request = createInterpretRequest({
        message: 'Hey there! 😊 How are you?',
        platform: 'SLACK',
        context: 'COWORKER',
      });

      expect(request.message).toBe('Hey there! 😊 How are you?');
      expect(request.platform).toBe('SLACK');
      expect(request.context).toBe('COWORKER');
    });

    it('should accept all valid platforms including OTHER', () => {
      const platforms: (Platform | 'OTHER')[] = [
        'IMESSAGE',
        'INSTAGRAM',
        'TIKTOK',
        'WHATSAPP',
        'SLACK',
        'DISCORD',
        'TWITTER',
        'OTHER',
      ];

      platforms.forEach((platform) => {
        const request = createInterpretRequest({ platform });
        expect(request.platform).toBe(platform);
      });
    });

    it('should accept all valid relationship contexts', () => {
      const contexts: RelationshipContext[] = [
        'ROMANTIC_PARTNER',
        'FRIEND',
        'FAMILY',
        'COWORKER',
        'ACQUAINTANCE',
        'STRANGER',
      ];

      contexts.forEach((context) => {
        const request = createInterpretRequest({ context });
        expect(request.context).toBe(context);
      });
    });
  });

  describe('createInterpretationResult', () => {
    it('should create a valid InterpretationResult with default values', () => {
      const result = createInterpretationResult();

      expect(result.id).toBeDefined();
      expect(result.message).toBeDefined();
      expect(Array.isArray(result.emojis)).toBe(true);
      expect(result.interpretation).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(Array.isArray(result.redFlags)).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const result = createInterpretationResult({
        id: 'custom-id-123',
        message: 'Custom message 😀',
        interpretation: 'This is a custom interpretation',
      });

      expect(result.id).toBe('custom-id-123');
      expect(result.message).toBe('Custom message 😀');
      expect(result.interpretation).toBe('This is a custom interpretation');
    });

    it('should allow setting emojis and redFlags', () => {
      const emojis: DetectedEmoji[] = [
        { character: '😀', meaning: 'happy', slug: 'grinning-face' },
      ];
      const redFlags: RedFlag[] = [
        { type: 'passive_aggressive', description: 'May be sarcastic', severity: 'medium' },
      ];

      const result = createInterpretationResult({ emojis, redFlags });

      expect(result.emojis).toEqual(emojis);
      expect(result.redFlags).toEqual(redFlags);
    });

    it('should create unique ids for different calls', () => {
      const result1 = createInterpretationResult();
      const result2 = createInterpretationResult();

      expect(result1.id).not.toBe(result2.id);
    });

    it('should create valid ISO timestamp', () => {
      const result = createInterpretationResult();
      const date = new Date(result.timestamp);

      expect(date.toString()).not.toBe('Invalid Date');
    });
  });

  describe('createDetectedEmoji', () => {
    it('should create a valid DetectedEmoji with default values', () => {
      const emoji = createDetectedEmoji();

      expect(emoji.character).toBeDefined();
      expect(emoji.meaning).toBeDefined();
    });

    it('should allow overriding specific fields', () => {
      const emoji = createDetectedEmoji({
        character: '💀',
        meaning: 'Dead laughing',
        slug: 'skull',
      });

      expect(emoji.character).toBe('💀');
      expect(emoji.meaning).toBe('Dead laughing');
      expect(emoji.slug).toBe('skull');
    });

    it('should handle optional slug field', () => {
      const emojiWithSlug = createDetectedEmoji({ slug: 'test-slug' });
      const emojiWithoutSlug = createDetectedEmoji({ slug: undefined });

      expect(emojiWithSlug.slug).toBe('test-slug');
      expect(emojiWithoutSlug.slug).toBeUndefined();
    });
  });

  describe('createInterpretationMetrics', () => {
    it('should create valid InterpretationMetrics with default values', () => {
      const metrics = createInterpretationMetrics();

      expect(typeof metrics.sarcasmProbability).toBe('number');
      expect(metrics.sarcasmProbability).toBeGreaterThanOrEqual(0);
      expect(metrics.sarcasmProbability).toBeLessThanOrEqual(100);

      expect(typeof metrics.passiveAggressionProbability).toBe('number');
      expect(metrics.passiveAggressionProbability).toBeGreaterThanOrEqual(0);
      expect(metrics.passiveAggressionProbability).toBeLessThanOrEqual(100);

      expect(['positive', 'neutral', 'negative']).toContain(metrics.overallTone);

      expect(typeof metrics.confidence).toBe('number');
      expect(metrics.confidence).toBeGreaterThanOrEqual(0);
      expect(metrics.confidence).toBeLessThanOrEqual(100);
    });

    it('should allow overriding specific fields', () => {
      const metrics = createInterpretationMetrics({
        sarcasmProbability: 75,
        passiveAggressionProbability: 10,
        overallTone: 'negative',
        confidence: 95,
      });

      expect(metrics.sarcasmProbability).toBe(75);
      expect(metrics.passiveAggressionProbability).toBe(10);
      expect(metrics.overallTone).toBe('negative');
      expect(metrics.confidence).toBe(95);
    });

    it('should accept all valid tone values', () => {
      const tones: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];

      tones.forEach((overallTone) => {
        const metrics = createInterpretationMetrics({ overallTone });
        expect(metrics.overallTone).toBe(overallTone);
      });
    });
  });

  describe('createRedFlag', () => {
    it('should create a valid RedFlag with default values', () => {
      const redFlag = createRedFlag();

      expect(redFlag.type).toBeDefined();
      expect(redFlag.description).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(redFlag.severity);
    });

    it('should allow overriding specific fields', () => {
      const redFlag = createRedFlag({
        type: 'manipulation',
        description: 'Potential guilt-tripping detected',
        severity: 'high',
      });

      expect(redFlag.type).toBe('manipulation');
      expect(redFlag.description).toBe('Potential guilt-tripping detected');
      expect(redFlag.severity).toBe('high');
    });

    it('should accept all valid severity levels', () => {
      const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

      severities.forEach((severity) => {
        const redFlag = createRedFlag({ severity });
        expect(redFlag.severity).toBe(severity);
      });
    });
  });

  describe('createMultipleDetectedEmojis', () => {
    it('should create the specified number of detected emojis', () => {
      const emojis = createMultipleDetectedEmojis(5);

      expect(emojis).toHaveLength(5);
      emojis.forEach((emoji) => {
        expect(emoji.character).toBeDefined();
        expect(emoji.meaning).toBeDefined();
      });
    });

    it('should apply overrides to all emojis', () => {
      const emojis = createMultipleDetectedEmojis(3, { slug: 'custom-slug' });

      emojis.forEach((emoji) => {
        expect(emoji.slug).toBe('custom-slug');
      });
    });

    it('should return empty array for count of 0', () => {
      const emojis = createMultipleDetectedEmojis(0);

      expect(emojis).toHaveLength(0);
    });
  });

  describe('createMultipleRedFlags', () => {
    it('should create the specified number of red flags', () => {
      const redFlags = createMultipleRedFlags(5);

      expect(redFlags).toHaveLength(5);
      redFlags.forEach((redFlag) => {
        expect(redFlag.type).toBeDefined();
        expect(redFlag.description).toBeDefined();
      });
    });

    it('should apply overrides to all red flags', () => {
      const redFlags = createMultipleRedFlags(3, { severity: 'high' });

      redFlags.forEach((redFlag) => {
        expect(redFlag.severity).toBe('high');
      });
    });

    it('should return empty array for count of 0', () => {
      const redFlags = createMultipleRedFlags(0);

      expect(redFlags).toHaveLength(0);
    });
  });
});
