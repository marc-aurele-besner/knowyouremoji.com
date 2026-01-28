import { describe, it, expect } from 'bun:test';
import { themeColors, themeFontSizes, themeFontFamilies } from '../../../src/lib/theme';

describe('Theme configuration', () => {
  describe('theme colors', () => {
    it('should define primary color scale', () => {
      expect(themeColors.primary).toBeDefined();
      expect(themeColors.primary[50]).toBe('#eff6ff');
      expect(themeColors.primary[100]).toBe('#dbeafe');
      expect(themeColors.primary[500]).toBe('#3b82f6');
      expect(themeColors.primary[600]).toBe('#2563eb');
      expect(themeColors.primary[700]).toBe('#1d4ed8');
    });

    it('should define secondary color scale', () => {
      expect(themeColors.secondary).toBeDefined();
      expect(themeColors.secondary[50]).toBe('#f8fafc');
      expect(themeColors.secondary[100]).toBe('#f1f5f9');
      expect(themeColors.secondary[500]).toBe('#64748b');
      expect(themeColors.secondary[600]).toBe('#475569');
    });

    it('should define accent color scale', () => {
      expect(themeColors.accent).toBeDefined();
      expect(themeColors.accent[500]).toBe('#f59e0b');
      expect(themeColors.accent[600]).toBe('#d97706');
    });

    it('should define semantic colors', () => {
      expect(themeColors.background).toBe('#ffffff');
      expect(themeColors.foreground).toBe('#0a0a0a');
    });
  });

  describe('theme font sizes', () => {
    it('should define emoji-specific font sizes', () => {
      expect(themeFontSizes['emoji-sm']).toBe('1.5rem');
      expect(themeFontSizes['emoji-md']).toBe('2rem');
      expect(themeFontSizes['emoji-lg']).toBe('3rem');
      expect(themeFontSizes['emoji-xl']).toBe('4rem');
      expect(themeFontSizes['emoji-2xl']).toBe('6rem');
    });
  });

  describe('theme font families', () => {
    it('should define sans font family', () => {
      expect(themeFontFamilies.sans).toBeDefined();
      expect(themeFontFamilies.sans).toContain('Inter');
    });

    it('should define emoji font family', () => {
      expect(themeFontFamilies.emoji).toBeDefined();
      expect(themeFontFamilies.emoji).toContain('Apple Color Emoji');
      expect(themeFontFamilies.emoji).toContain('Segoe UI Emoji');
      expect(themeFontFamilies.emoji).toContain('Noto Color Emoji');
    });
  });
});
