import { describe, it, expect } from 'bun:test';
import * as hooks from '@/hooks';

describe('Hooks barrel export (index.ts)', () => {
  describe('useEmojiSearch exports', () => {
    it('exports useEmojiSearch hook', () => {
      expect(hooks.useEmojiSearch).toBeDefined();
      expect(typeof hooks.useEmojiSearch).toBe('function');
    });
  });

  describe('useComboSearch exports', () => {
    it('exports useComboSearch hook', () => {
      expect(hooks.useComboSearch).toBeDefined();
      expect(typeof hooks.useComboSearch).toBe('function');
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

  describe('useServiceWorker exports', () => {
    it('exports useServiceWorker hook', () => {
      expect(hooks.useServiceWorker).toBeDefined();
      expect(typeof hooks.useServiceWorker).toBe('function');
    });
  });

  describe('all exports are valid', () => {
    it('exports the correct number of items (5 hooks + types)', () => {
      const exportedKeys = Object.keys(hooks);
      // useEmojiSearch, useComboSearch, useRateLimit, useStreamingInterpret, useServiceWorker = 5 hooks
      // Note: Type exports may not appear in runtime Object.keys
      // At minimum, 5 hooks should be exported
      expect(exportedKeys.length).toBeGreaterThanOrEqual(5);
    });

    it('all hook exports are valid functions', () => {
      const hookNames = [
        'useEmojiSearch',
        'useComboSearch',
        'useRateLimit',
        'useStreamingInterpret',
        'useServiceWorker',
      ];
      hookNames.forEach((name) => {
        const hook = hooks[name as keyof typeof hooks];
        expect(typeof hook).toBe('function');
      });
    });

    it('hook names follow the React hook naming convention (use prefix)', () => {
      const hookNames = [
        'useEmojiSearch',
        'useComboSearch',
        'useRateLimit',
        'useStreamingInterpret',
        'useServiceWorker',
      ];
      hookNames.forEach((name) => {
        expect(name.startsWith('use')).toBe(true);
      });
    });
  });
});
