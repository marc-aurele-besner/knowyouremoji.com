import { describe, it, expect } from 'bun:test';
import * as emojiComponents from '@/components/emoji';

describe('Emoji Components barrel export (index.ts)', () => {
  describe('Core emoji display components', () => {
    it('exports EmojiHeader component', () => {
      expect(emojiComponents.EmojiHeader).toBeDefined();
    });

    it('exports EmojiContextCard component', () => {
      expect(emojiComponents.EmojiContextCard).toBeDefined();
    });

    it('exports EmojiTLDR component', () => {
      expect(emojiComponents.EmojiTLDR).toBeDefined();
    });

    it('exports EmojiComboList component', () => {
      expect(emojiComponents.EmojiComboList).toBeDefined();
    });

    it('exports EmojiCopyButton component', () => {
      expect(emojiComponents.EmojiCopyButton).toBeDefined();
    });

    it('exports EmojiGrid component', () => {
      expect(emojiComponents.EmojiGrid).toBeDefined();
    });

    it('exports EmojiPlatformPreview component', () => {
      expect(emojiComponents.EmojiPlatformPreview).toBeDefined();
    });

    it('exports EmojiSearch component', () => {
      expect(emojiComponents.EmojiSearch).toBeDefined();
    });

    it('exports EmojiWarnings component', () => {
      expect(emojiComponents.EmojiWarnings).toBeDefined();
    });
  });

  describe('Section components', () => {
    it('exports ContextMeaningsSection component', () => {
      expect(emojiComponents.ContextMeaningsSection).toBeDefined();
    });

    it('exports EmojiCombosSection component', () => {
      expect(emojiComponents.EmojiCombosSection).toBeDefined();
    });

    it('exports GenerationalNotesSection component', () => {
      expect(emojiComponents.GenerationalNotesSection).toBeDefined();
    });

    it('exports PlatformNotesSection component', () => {
      expect(emojiComponents.PlatformNotesSection).toBeDefined();
    });

    it('exports RelatedEmojisSection component', () => {
      expect(emojiComponents.RelatedEmojisSection).toBeDefined();
    });
  });

  describe('Navigation component', () => {
    it('exports CategoryLink component', () => {
      expect(emojiComponents.CategoryLink).toBeDefined();
    });
  });

  describe('all exports are valid', () => {
    it('exports at least 15 items (components and types)', () => {
      const exportedKeys = Object.keys(emojiComponents);
      // At minimum 15 components:
      // Core: EmojiHeader, EmojiContextCard, EmojiTLDR, EmojiComboList, EmojiCopyButton,
      //       EmojiGrid, EmojiPlatformPreview, EmojiSearch, EmojiWarnings (9)
      // Sections: ContextMeaningsSection, EmojiCombosSection, GenerationalNotesSection,
      //           PlatformNotesSection, RelatedEmojisSection (5)
      // Navigation: CategoryLink (1)
      expect(exportedKeys.length).toBeGreaterThanOrEqual(15);
    });

    it('all component exports are valid React components', () => {
      const componentNames = [
        'EmojiHeader',
        'EmojiContextCard',
        'EmojiTLDR',
        'EmojiComboList',
        'EmojiCopyButton',
        'EmojiGrid',
        'EmojiPlatformPreview',
        'EmojiSearch',
        'EmojiWarnings',
        'ContextMeaningsSection',
        'EmojiCombosSection',
        'GenerationalNotesSection',
        'PlatformNotesSection',
        'RelatedEmojisSection',
        'CategoryLink',
      ];
      componentNames.forEach((name) => {
        const component = emojiComponents[name as keyof typeof emojiComponents];
        // React components can be functions or objects (forwardRef returns an object)
        const isFunction = typeof component === 'function';
        const isForwardRef =
          typeof component === 'object' &&
          component !== null &&
          '$$typeof' in component &&
          'render' in component;
        expect(isFunction || isForwardRef).toBe(true);
      });
    });
  });
});
