import { describe, it, expect } from 'bun:test';
import {
  chipClass,
  formatCodepoints,
  getContextLabel,
  getGenerationLabel,
  getGenerationYears,
  getPlatformLabel,
  PAGEABLE_CONTEXTS,
  riskBadgeClass,
} from '@/components/emoji/emoji-labels';

describe('emoji-labels', () => {
  it('maps enum values to labels and falls back to the raw value', () => {
    expect(getContextLabel('PASSIVE_AGGRESSIVE')).toBe('Passive-Aggressive');
    expect(getContextLabel('UNKNOWN')).toBe('UNKNOWN');
    expect(getPlatformLabel('TWITTER')).toBe('Twitter/X');
    expect(getPlatformLabel('MYSPACE')).toBe('MYSPACE');
    expect(getGenerationLabel('GEN_Z')).toBe('Gen Z');
    expect(getGenerationLabel('ALPHA')).toBe('ALPHA');
  });

  it('returns generation years when known', () => {
    expect(getGenerationYears('MILLENNIAL')).toBe('Born 1981–1996');
    expect(getGenerationYears('ALPHA')).toBeUndefined();
  });

  it('lists only contexts that have hub pages', () => {
    expect(PAGEABLE_CONTEXTS.has('SLANG')).toBe(true);
    expect(PAGEABLE_CONTEXTS.has('LITERAL')).toBe(false);
  });

  it('maps risk levels to status colours', () => {
    expect(riskBadgeClass('LOW')).toContain('text-success');
    expect(riskBadgeClass('MEDIUM')).toContain('text-primary-700');
    expect(riskBadgeClass('HIGH')).toContain('text-danger');
  });

  it('builds chip classes for active and inactive chips', () => {
    expect(chipClass(true)).toContain('bg-foreground');
    expect(chipClass()).toContain('bg-card');
    expect(chipClass(false)).not.toContain('bg-foreground');
  });

  it('formats code points and drops variation selector-16', () => {
    expect(formatCodepoints('💀')).toBe('U+1F480');
    expect(formatCodepoints('❤️')).toBe('U+2764');
    expect(formatCodepoints('👩‍💻')).toBe('U+1F469 U+200D U+1F4BB');
  });
});
