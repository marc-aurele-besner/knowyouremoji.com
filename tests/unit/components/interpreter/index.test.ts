import { describe, it, expect } from 'bun:test';
import * as InterpreterExports from '@/components/interpreter';

describe('interpreter component exports', () => {
  it('exports PlatformSelector component', () => {
    expect(InterpreterExports.PlatformSelector).toBeDefined();
    expect(typeof InterpreterExports.PlatformSelector).toBe('function');
  });

  it('exports ContextSelector component', () => {
    expect(InterpreterExports.ContextSelector).toBeDefined();
    expect(typeof InterpreterExports.ContextSelector).toBe('function');
  });

  it('exports InterpretResult component', () => {
    expect(InterpreterExports.InterpretResult).toBeDefined();
    expect(typeof InterpreterExports.InterpretResult).toBe('function');
  });

  it('exports InterpreterForm component', () => {
    expect(InterpreterExports.InterpreterForm).toBeDefined();
    expect(typeof InterpreterExports.InterpreterForm).toBe('function');
  });

  it('exports InterpretLoading component', () => {
    expect(InterpreterExports.InterpretLoading).toBeDefined();
    expect(typeof InterpreterExports.InterpretLoading).toBe('function');
  });

  it('exports formatElapsedTime utility', () => {
    expect(InterpreterExports.formatElapsedTime).toBeDefined();
    expect(typeof InterpreterExports.formatElapsedTime).toBe('function');
    expect(InterpreterExports.formatElapsedTime(30)).toBe('30s');
    expect(InterpreterExports.formatElapsedTime(90)).toBe('1m 30s');
  });

  it('exports ProbabilityMeter component', () => {
    expect(InterpreterExports.ProbabilityMeter).toBeDefined();
    expect(typeof InterpreterExports.ProbabilityMeter).toBe('function');
  });

  it('exports PassiveAggressionMeter component', () => {
    expect(InterpreterExports.PassiveAggressionMeter).toBeDefined();
    expect(typeof InterpreterExports.PassiveAggressionMeter).toBe('function');
  });

  it('exports RedFlagBadge component', () => {
    expect(InterpreterExports.RedFlagBadge).toBeDefined();
    expect(typeof InterpreterExports.RedFlagBadge).toBe('function');
  });

  it('exports RedFlagSection component', () => {
    expect(InterpreterExports.RedFlagSection).toBeDefined();
    expect(typeof InterpreterExports.RedFlagSection).toBe('function');
  });

  it('exports EmojiLink component', () => {
    expect(InterpreterExports.EmojiLink).toBeDefined();
    expect(typeof InterpreterExports.EmojiLink).toBe('function');
  });
});
