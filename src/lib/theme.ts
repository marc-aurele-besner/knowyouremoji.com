/**
 * Theme configuration for KnowYourEmoji.com
 * These values are mirrored in globals.css for Tailwind v4 @theme blocks
 */

export const themeColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748b',
    600: '#475569',
  },
  accent: {
    500: '#f59e0b',
    600: '#d97706',
  },
  background: '#ffffff',
  foreground: '#0a0a0a',
} as const;

export const themeFontSizes = {
  'emoji-sm': '1.5rem',
  'emoji-md': '2rem',
  'emoji-lg': '3rem',
  'emoji-xl': '4rem',
  'emoji-2xl': '6rem',
} as const;

export const themeFontFamilies = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  emoji: ['Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'],
} as const;

export type ThemeColors = typeof themeColors;
export type ThemeFontSizes = typeof themeFontSizes;
export type ThemeFontFamilies = typeof themeFontFamilies;
