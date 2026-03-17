import { describe, it, expect } from 'bun:test';
import { encodeInterpretation, decodeInterpretation, getShareUrl } from '@/lib/share-encoding';
import type { InterpretationResult } from '@/types';

const mockResult: InterpretationResult = {
  id: 'test-123',
  message: 'Hey 😊 how are you?',
  emojis: [{ character: '😊', meaning: 'Warmth', slug: 'smiling-face' }],
  interpretation: 'A friendly greeting expressing warmth.',
  metrics: {
    sarcasmProbability: 10,
    passiveAggressionProbability: 5,
    overallTone: 'positive',
    confidence: 85,
  },
  redFlags: [],
  timestamp: '2024-01-15T10:00:00.000Z',
};

describe('share-encoding', () => {
  describe('encodeInterpretation', () => {
    it('returns a base64 encoded string', () => {
      const encoded = encodeInterpretation(mockResult);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('truncates long messages to 200 chars', () => {
      const longResult = {
        ...mockResult,
        message: 'A'.repeat(300),
      };
      const encoded = encodeInterpretation(longResult);
      const decoded = decodeInterpretation(encoded);
      expect(decoded?.message.length).toBe(200);
    });

    it('truncates long interpretations to 500 chars', () => {
      const longResult = {
        ...mockResult,
        interpretation: 'B'.repeat(600),
      };
      const encoded = encodeInterpretation(longResult);
      const decoded = decodeInterpretation(encoded);
      expect(decoded?.interpretation.length).toBe(500);
    });

    it('handles unicode characters in messages', () => {
      const unicodeResult = {
        ...mockResult,
        message: 'Hello 😊🔥💀 world!',
      };
      const encoded = encodeInterpretation(unicodeResult);
      const decoded = decodeInterpretation(encoded);
      expect(decoded?.message).toBe('Hello 😊🔥💀 world!');
    });
  });

  describe('decodeInterpretation', () => {
    it('round-trips encode/decode correctly', () => {
      const encoded = encodeInterpretation(mockResult);
      const decoded = decodeInterpretation(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.message).toBe(mockResult.message);
      expect(decoded?.interpretation).toBe(mockResult.interpretation);
      expect(decoded?.tone).toBe('positive');
      expect(decoded?.sarcasm).toBe(10);
      expect(decoded?.passiveAggression).toBe(5);
      expect(decoded?.confidence).toBe(85);
    });

    it('returns null for invalid base64', () => {
      expect(decodeInterpretation('not-valid-base64!!!')).toBeNull();
    });

    it('returns null for valid base64 with invalid JSON', () => {
      const encoded = btoa(encodeURIComponent('not json'));
      expect(decodeInterpretation(encoded)).toBeNull();
    });

    it('returns null for missing required fields', () => {
      const partial = btoa(encodeURIComponent(JSON.stringify({ message: 'hello' })));
      expect(decodeInterpretation(partial)).toBeNull();
    });

    it('returns null for invalid tone value', () => {
      const data = {
        message: 'test',
        interpretation: 'test',
        tone: 'invalid',
        sarcasm: 0,
        passiveAggression: 0,
        confidence: 50,
      };
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      expect(decodeInterpretation(encoded)).toBeNull();
    });

    it('returns null for wrong field types', () => {
      const data = {
        message: 'test',
        interpretation: 'test',
        tone: 'positive',
        sarcasm: 'not a number',
        passiveAggression: 0,
        confidence: 50,
      };
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      expect(decodeInterpretation(encoded)).toBeNull();
    });
  });

  describe('getShareUrl', () => {
    it('generates a URL with encoded result', () => {
      const url = getShareUrl(mockResult, 'https://knowyouremoji.com');
      expect(url).toContain('https://knowyouremoji.com/interpreter?r=');
    });

    it('generates a decodable URL', () => {
      const url = getShareUrl(mockResult, 'https://knowyouremoji.com');
      const encoded = url.split('?r=')[1];
      const decoded = decodeInterpretation(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.message).toBe(mockResult.message);
    });

    it('keeps URL under 2000 chars for typical results', () => {
      const url = getShareUrl(mockResult, 'https://knowyouremoji.com');
      expect(url.length).toBeLessThan(2000);
    });
  });
});
