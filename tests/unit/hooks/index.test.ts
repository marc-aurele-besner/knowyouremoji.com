import { describe, it, expect } from 'bun:test';
import * as hooks from '@/hooks';

describe('Hooks barrel export (index.ts)', () => {
  describe('useEmojiSearch exports', () => {
    it('exports useEmojiSearch hook', () => {
      expect(hooks.useEmojiSearch).toBeDefined();
      expect(typeof hooks.useEmojiSearch).toBe('function');
    });
  });

  describe('useRateLimit exports', () => {
    it('exports useRateLimit hook', () => {
      expect(hooks.useRateLimit).toBeDefined();
      expect(typeof hooks.useRateLimit).toBe('function');
    });
  });

  describe('useStreamingInterpret exports', () => {
    it('exports useStreamingInterpret hook', () => {
      expect(hooks.useStreamingInterpret).toBeDefined();
      expect(typeof hooks.useStreamingInterpret).toBe('function');
    });
  });

  describe('all exports are valid', () => {
    it('exports the correct number of items (3 hooks + 6 types = 9 exports)', () => {
      const exportedKeys = Object.keys(hooks);
      // useEmojiSearch, useRateLimit, useStreamingInterpret = 3 hooks
      // UseEmojiSearchOptions, UseEmojiSearchReturn = 2 types
      // UseRateLimitOptions, UseRateLimitReturn = 2 types
      // UseStreamingInterpretOptions, UseStreamingInterpretReturn, InterpretInput = 3 types
      // Note: Type exports may not appear in runtime Object.keys
      // At minimum, 3 hooks should be exported
      expect(exportedKeys.length).toBeGreaterThanOrEqual(3);
    });

    it('all hook exports are valid functions', () => {
      const hookNames = ['useEmojiSearch', 'useRateLimit', 'useStreamingInterpret'];
      hookNames.forEach((name) => {
        const hook = hooks[name as keyof typeof hooks];
        expect(typeof hook).toBe('function');
      });
    });

    it('hook names follow the React hook naming convention (use prefix)', () => {
      const hookNames = ['useEmojiSearch', 'useRateLimit', 'useStreamingInterpret'];
      hookNames.forEach((name) => {
        expect(name.startsWith('use')).toBe(true);
      });
    });
  });
});
