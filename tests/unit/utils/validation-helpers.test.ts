import { describe, it, expect } from 'bun:test';
import {
  isValidInterpretationResult,
  assertValidInterpretationResult,
} from '../../utils/helpers/validation.helpers';
import { createInterpretationResult } from '../../utils/factories/interpreter.factory';

describe('validation.helpers - interpretation metrics', () => {
  it('should return false when the metrics object is missing', () => {
    const result = createInterpretationResult();
    expect(isValidInterpretationResult({ ...result, metrics: undefined })).toBe(false);
  });

  it('should return false when the metrics object is null', () => {
    const result = createInterpretationResult();
    expect(isValidInterpretationResult({ ...result, metrics: null })).toBe(false);
  });

  it('should return false when the metrics value is not an object', () => {
    const result = createInterpretationResult();
    expect(isValidInterpretationResult({ ...result, metrics: 'not-an-object' })).toBe(false);
  });

  it('should throw when the metrics object is not an object', () => {
    const result = createInterpretationResult();
    expect(() => assertValidInterpretationResult({ ...result, metrics: null })).toThrow(
      'Invalid InterpretationResult'
    );
  });
});
