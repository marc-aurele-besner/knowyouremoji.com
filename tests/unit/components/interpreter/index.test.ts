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
});
