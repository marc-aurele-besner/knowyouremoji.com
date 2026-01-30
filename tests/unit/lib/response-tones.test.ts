import { describe, it, expect } from 'bun:test';
import {
  RESPONSE_TONE_TYPES,
  ALL_RESPONSE_TONE_TYPES,
  calculateToneWeights,
  selectTopTones,
  generateToneReasoning,
  generateToneExamples,
  calculateToneConfidence,
  generateToneSuggestions,
  getToneTypeInfo,
  isValidResponseToneType,
} from '../../../src/lib/response-tones';
import type { InterpretationMetrics, ResponseToneType } from '../../../src/types';

describe('response-tones', () => {
  describe('RESPONSE_TONE_TYPES constant', () => {
    it('should have all five tone types defined', () => {
      expect(Object.keys(RESPONSE_TONE_TYPES)).toHaveLength(5);
      expect(RESPONSE_TONE_TYPES.DIRECT).toBeDefined();
      expect(RESPONSE_TONE_TYPES.PLAYFUL).toBeDefined();
      expect(RESPONSE_TONE_TYPES.CLARIFYING).toBeDefined();
      expect(RESPONSE_TONE_TYPES.NEUTRAL).toBeDefined();
      expect(RESPONSE_TONE_TYPES.MATCHING).toBeDefined();
    });

    it('should have proper structure for each tone type', () => {
      for (const type of ALL_RESPONSE_TONE_TYPES) {
        const info = RESPONSE_TONE_TYPES[type];
        expect(info.type).toBe(type);
        expect(typeof info.label).toBe('string');
        expect(info.label.length).toBeGreaterThan(0);
        expect(typeof info.description).toBe('string');
        expect(info.description.length).toBeGreaterThan(0);
        expect(typeof info.icon).toBe('string');
      }
    });
  });

  describe('ALL_RESPONSE_TONE_TYPES constant', () => {
    it('should contain all five tone types', () => {
      expect(ALL_RESPONSE_TONE_TYPES).toHaveLength(5);
      expect(ALL_RESPONSE_TONE_TYPES).toContain('DIRECT');
      expect(ALL_RESPONSE_TONE_TYPES).toContain('PLAYFUL');
      expect(ALL_RESPONSE_TONE_TYPES).toContain('CLARIFYING');
      expect(ALL_RESPONSE_TONE_TYPES).toContain('NEUTRAL');
      expect(ALL_RESPONSE_TONE_TYPES).toContain('MATCHING');
    });
  });

  describe('calculateToneWeights', () => {
    it('should return weights for all tone types', () => {
      const metrics: InterpretationMetrics = {
        sarcasmProbability: 20,
        passiveAggressionProbability: 10,
        overallTone: 'neutral',
        confidence: 80,
      };

      const weights = calculateToneWeights(metrics);

      expect(typeof weights.DIRECT).toBe('number');
      expect(typeof weights.PLAYFUL).toBe('number');
      expect(typeof weights.CLARIFYING).toBe('number');
      expect(typeof weights.NEUTRAL).toBe('number');
      expect(typeof weights.MATCHING).toBe('number');
    });

    it('should increase PLAYFUL weight for positive tone', () => {
      const positiveMetrics: InterpretationMetrics = {
        sarcasmProbability: 10,
        passiveAggressionProbability: 5,
        overallTone: 'positive',
        confidence: 85,
      };

      const neutralMetrics: InterpretationMetrics = {
        ...positiveMetrics,
        overallTone: 'neutral',
      };

      const positiveWeights = calculateToneWeights(positiveMetrics);
      const neutralWeights = calculateToneWeights(neutralMetrics);

      expect(positiveWeights.PLAYFUL).toBeGreaterThan(neutralWeights.PLAYFUL);
    });

    it('should increase CLARIFYING weight for negative tone', () => {
      const negativeMetrics: InterpretationMetrics = {
        sarcasmProbability: 10,
        passiveAggressionProbability: 15,
        overallTone: 'negative',
        confidence: 75,
      };

      const positiveMetrics: InterpretationMetrics = {
        ...negativeMetrics,
        overallTone: 'positive',
      };

      const negativeWeights = calculateToneWeights(negativeMetrics);
      const positiveWeights = calculateToneWeights(positiveMetrics);

      expect(negativeWeights.CLARIFYING).toBeGreaterThan(positiveWeights.CLARIFYING);
    });

    it('should increase CLARIFYING weight for high sarcasm', () => {
      const highSarcasm: InterpretationMetrics = {
        sarcasmProbability: 75,
        passiveAggressionProbability: 10,
        overallTone: 'neutral',
        confidence: 70,
      };

      const lowSarcasm: InterpretationMetrics = {
        ...highSarcasm,
        sarcasmProbability: 10,
      };

      const highSarcasmWeights = calculateToneWeights(highSarcasm);
      const lowSarcasmWeights = calculateToneWeights(lowSarcasm);

      expect(highSarcasmWeights.CLARIFYING).toBeGreaterThan(lowSarcasmWeights.CLARIFYING);
    });

    it('should increase DIRECT weight for passive-aggression', () => {
      const passiveAggressive: InterpretationMetrics = {
        sarcasmProbability: 20,
        passiveAggressionProbability: 70,
        overallTone: 'negative',
        confidence: 80,
      };

      const friendly: InterpretationMetrics = {
        ...passiveAggressive,
        passiveAggressionProbability: 5,
      };

      const paWeights = calculateToneWeights(passiveAggressive);
      const friendlyWeights = calculateToneWeights(friendly);

      expect(paWeights.DIRECT).toBeGreaterThan(friendlyWeights.DIRECT);
    });

    it('should increase CLARIFYING weight for low confidence', () => {
      const lowConfidence: InterpretationMetrics = {
        sarcasmProbability: 30,
        passiveAggressionProbability: 20,
        overallTone: 'neutral',
        confidence: 30,
      };

      const highConfidence: InterpretationMetrics = {
        ...lowConfidence,
        confidence: 90,
      };

      const lowConfWeights = calculateToneWeights(lowConfidence);
      const highConfWeights = calculateToneWeights(highConfidence);

      expect(lowConfWeights.CLARIFYING).toBeGreaterThan(highConfWeights.CLARIFYING);
    });

    it('should return non-negative weights', () => {
      const extremeMetrics: InterpretationMetrics = {
        sarcasmProbability: 100,
        passiveAggressionProbability: 100,
        overallTone: 'negative',
        confidence: 0,
      };

      const weights = calculateToneWeights(extremeMetrics);

      for (const key of Object.keys(weights) as ResponseToneType[]) {
        expect(weights[key]).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('selectTopTones', () => {
    it('should return the specified number of tones', () => {
      const weights = {
        DIRECT: 80,
        PLAYFUL: 60,
        CLARIFYING: 70,
        NEUTRAL: 50,
        MATCHING: 40,
      };

      const top3 = selectTopTones(weights, 3);
      expect(top3).toHaveLength(3);

      const top2 = selectTopTones(weights, 2);
      expect(top2).toHaveLength(2);
    });

    it('should return tones sorted by weight descending', () => {
      const weights = {
        DIRECT: 80,
        PLAYFUL: 60,
        CLARIFYING: 90,
        NEUTRAL: 50,
        MATCHING: 70,
      };

      const topTones = selectTopTones(weights, 3);

      expect(topTones[0]).toBe('CLARIFYING'); // 90
      expect(topTones[1]).toBe('DIRECT'); // 80
      expect(topTones[2]).toBe('MATCHING'); // 70
    });

    it('should default to 3 tones when count not specified', () => {
      const weights = {
        DIRECT: 50,
        PLAYFUL: 50,
        CLARIFYING: 50,
        NEUTRAL: 50,
        MATCHING: 50,
      };

      const tones = selectTopTones(weights);
      expect(tones).toHaveLength(3);
    });
  });

  describe('generateToneReasoning', () => {
    const baseMetrics: InterpretationMetrics = {
      sarcasmProbability: 20,
      passiveAggressionProbability: 15,
      overallTone: 'neutral',
      confidence: 80,
    };

    it('should return a non-empty string for DIRECT tone', () => {
      const reasoning = generateToneReasoning('DIRECT', baseMetrics);
      expect(typeof reasoning).toBe('string');
      expect(reasoning.length).toBeGreaterThan(0);
    });

    it('should return a non-empty string for PLAYFUL tone', () => {
      const reasoning = generateToneReasoning('PLAYFUL', baseMetrics);
      expect(typeof reasoning).toBe('string');
      expect(reasoning.length).toBeGreaterThan(0);
    });

    it('should return a non-empty string for CLARIFYING tone', () => {
      const reasoning = generateToneReasoning('CLARIFYING', baseMetrics);
      expect(typeof reasoning).toBe('string');
      expect(reasoning.length).toBeGreaterThan(0);
    });

    it('should return a non-empty string for NEUTRAL tone', () => {
      const reasoning = generateToneReasoning('NEUTRAL', baseMetrics);
      expect(typeof reasoning).toBe('string');
      expect(reasoning.length).toBeGreaterThan(0);
    });

    it('should return a non-empty string for MATCHING tone', () => {
      const reasoning = generateToneReasoning('MATCHING', baseMetrics);
      expect(typeof reasoning).toBe('string');
      expect(reasoning.length).toBeGreaterThan(0);
    });

    it('should generate context-specific reasoning for DIRECT with passive-aggression', () => {
      const paMetrics: InterpretationMetrics = {
        ...baseMetrics,
        passiveAggressionProbability: 75,
      };

      const reasoning = generateToneReasoning('DIRECT', paMetrics);
      expect(reasoning.toLowerCase()).toContain('passive-aggressive');
    });

    it('should generate context-specific reasoning for CLARIFYING with sarcasm', () => {
      const sarcasmMetrics: InterpretationMetrics = {
        ...baseMetrics,
        sarcasmProbability: 70,
      };

      const reasoning = generateToneReasoning('CLARIFYING', sarcasmMetrics);
      expect(reasoning.toLowerCase()).toContain('sarcasm');
    });

    it('should generate context-specific reasoning for PLAYFUL with positive tone', () => {
      const positiveMetrics: InterpretationMetrics = {
        ...baseMetrics,
        overallTone: 'positive',
      };

      const reasoning = generateToneReasoning('PLAYFUL', positiveMetrics);
      expect(reasoning.toLowerCase()).toContain('positive');
    });

    it('should generate context-specific reasoning for NEUTRAL with negative tone', () => {
      const negativeMetrics: InterpretationMetrics = {
        ...baseMetrics,
        overallTone: 'negative',
      };

      const reasoning = generateToneReasoning('NEUTRAL', negativeMetrics);
      expect(reasoning.toLowerCase()).toContain('de-escalate');
    });

    it('should generate context-specific reasoning for CLARIFYING with low confidence', () => {
      const lowConfMetrics: InterpretationMetrics = {
        ...baseMetrics,
        confidence: 30,
      };

      const reasoning = generateToneReasoning('CLARIFYING', lowConfMetrics);
      expect(reasoning.toLowerCase()).toContain('ambiguity');
    });
  });

  describe('generateToneExamples', () => {
    it('should return array of examples for each tone and overall tone combination', () => {
      const tones: ResponseToneType[] = ['DIRECT', 'PLAYFUL', 'CLARIFYING', 'NEUTRAL', 'MATCHING'];
      const overallTones: Array<'positive' | 'neutral' | 'negative'> = [
        'positive',
        'neutral',
        'negative',
      ];

      for (const tone of tones) {
        for (const overall of overallTones) {
          const examples = generateToneExamples(tone, overall);
          expect(Array.isArray(examples)).toBe(true);
          expect(examples.length).toBeGreaterThan(0);
          for (const example of examples) {
            expect(typeof example).toBe('string');
            expect(example.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should return different examples for different overall tones', () => {
      const positiveExamples = generateToneExamples('DIRECT', 'positive');
      const negativeExamples = generateToneExamples('DIRECT', 'negative');

      // Should be different sets of examples
      expect(positiveExamples).not.toEqual(negativeExamples);
    });
  });

  describe('calculateToneConfidence', () => {
    it('should return 50 for zero max weight', () => {
      const confidence = calculateToneConfidence(0, 0);
      expect(confidence).toBe(50);
    });

    it('should return 100 for max weight matching weight', () => {
      const confidence = calculateToneConfidence(100, 100);
      expect(confidence).toBe(100);
    });

    it('should return value between 50 and 100 for normal weights', () => {
      const confidence = calculateToneConfidence(50, 100);
      expect(confidence).toBeGreaterThanOrEqual(50);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should return higher confidence for higher relative weight', () => {
      const highConfidence = calculateToneConfidence(90, 100);
      const lowConfidence = calculateToneConfidence(30, 100);
      expect(highConfidence).toBeGreaterThan(lowConfidence);
    });

    it('should round the result', () => {
      const confidence = calculateToneConfidence(33, 100);
      expect(Number.isInteger(confidence)).toBe(true);
    });
  });

  describe('generateToneSuggestions', () => {
    const testMetrics: InterpretationMetrics = {
      sarcasmProbability: 25,
      passiveAggressionProbability: 15,
      overallTone: 'neutral',
      confidence: 75,
    };

    it('should return 3 suggestions by default', () => {
      const suggestions = generateToneSuggestions(testMetrics);
      expect(suggestions).toHaveLength(3);
    });

    it('should return suggestions with proper structure', () => {
      const suggestions = generateToneSuggestions(testMetrics);

      for (const suggestion of suggestions) {
        expect(ALL_RESPONSE_TONE_TYPES).toContain(suggestion.tone);
        expect(typeof suggestion.reasoning).toBe('string');
        expect(suggestion.reasoning.length).toBeGreaterThan(0);
        expect(typeof suggestion.confidence).toBe('number');
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(100);
        expect(Array.isArray(suggestion.examples)).toBe(true);
        expect(suggestion.examples.length).toBeGreaterThan(0);
      }
    });

    it('should return suggestions sorted by confidence descending', () => {
      const suggestions = generateToneSuggestions(testMetrics);

      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].confidence).toBeGreaterThanOrEqual(suggestions[i + 1].confidence);
      }
    });

    it('should prioritize PLAYFUL for positive messages', () => {
      const positiveMetrics: InterpretationMetrics = {
        sarcasmProbability: 5,
        passiveAggressionProbability: 0,
        overallTone: 'positive',
        confidence: 90,
      };

      const suggestions = generateToneSuggestions(positiveMetrics);
      const tones = suggestions.map((s) => s.tone);

      // PLAYFUL should be in top 3 for positive messages
      expect(tones).toContain('PLAYFUL');
    });

    it('should prioritize CLARIFYING for uncertain messages', () => {
      const uncertainMetrics: InterpretationMetrics = {
        sarcasmProbability: 60,
        passiveAggressionProbability: 40,
        overallTone: 'negative',
        confidence: 30,
      };

      const suggestions = generateToneSuggestions(uncertainMetrics);
      // CLARIFYING should be first for very uncertain messages
      expect(suggestions[0].tone).toBe('CLARIFYING');
    });

    it('should prioritize DIRECT and CLARIFYING for passive-aggressive messages', () => {
      const paMetrics: InterpretationMetrics = {
        sarcasmProbability: 30,
        passiveAggressionProbability: 80,
        overallTone: 'negative',
        confidence: 75,
      };

      const suggestions = generateToneSuggestions(paMetrics);
      const tones = suggestions.map((s) => s.tone);

      expect(tones).toContain('DIRECT');
      expect(tones).toContain('CLARIFYING');
    });
  });

  describe('getToneTypeInfo', () => {
    it('should return info for DIRECT tone', () => {
      const info = getToneTypeInfo('DIRECT');
      expect(info.type).toBe('DIRECT');
      expect(info.label).toBe('Direct & Assertive');
      expect(info.icon).toBe('💪');
    });

    it('should return info for PLAYFUL tone', () => {
      const info = getToneTypeInfo('PLAYFUL');
      expect(info.type).toBe('PLAYFUL');
      expect(info.label).toBe('Playful & Light');
      expect(info.icon).toBe('😄');
    });

    it('should return info for CLARIFYING tone', () => {
      const info = getToneTypeInfo('CLARIFYING');
      expect(info.type).toBe('CLARIFYING');
      expect(info.label).toBe('Clarifying & Questioning');
      expect(info.icon).toBe('🤔');
    });

    it('should return info for NEUTRAL tone', () => {
      const info = getToneTypeInfo('NEUTRAL');
      expect(info.type).toBe('NEUTRAL');
      expect(info.label).toBe('Neutral & Professional');
      expect(info.icon).toBe('🤝');
    });

    it('should return info for MATCHING tone', () => {
      const info = getToneTypeInfo('MATCHING');
      expect(info.type).toBe('MATCHING');
      expect(info.label).toBe('Matching Energy');
      expect(info.icon).toBe('🪞');
    });
  });

  describe('isValidResponseToneType', () => {
    it('should return true for valid tone types', () => {
      expect(isValidResponseToneType('DIRECT')).toBe(true);
      expect(isValidResponseToneType('PLAYFUL')).toBe(true);
      expect(isValidResponseToneType('CLARIFYING')).toBe(true);
      expect(isValidResponseToneType('NEUTRAL')).toBe(true);
      expect(isValidResponseToneType('MATCHING')).toBe(true);
    });

    it('should return false for invalid tone types', () => {
      expect(isValidResponseToneType('INVALID')).toBe(false);
      expect(isValidResponseToneType('direct')).toBe(false);
      expect(isValidResponseToneType('')).toBe(false);
      expect(isValidResponseToneType('AGGRESSIVE')).toBe(false);
    });
  });
});
