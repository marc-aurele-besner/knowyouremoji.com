import { describe, it, expect } from 'bun:test';
import {
  splitGraphemes,
  resolveEmoji,
  buildEmojiBrief,
  buildComboBriefs,
} from '../../../scripts/combo-content/emoji-grounding';
import { buildComboPrompt, ANGLES, BANNED_VOCABULARY } from '../../../scripts/combo-content/prompt';
import type { EmojiCombo } from '../../../src/types/combo';

describe('combo-content/emoji-grounding', () => {
  describe('splitGraphemes', () => {
    it('splits two separate emoji', () => {
      expect(splitGraphemes('💀😂')).toEqual(['💀', '😂']);
    });

    it('keeps a ZWJ sequence together', () => {
      expect(splitGraphemes('😵‍💫')).toEqual(['😵‍💫']);
    });

    it('keeps a variation selector attached to its base', () => {
      expect(splitGraphemes('☮️')).toEqual(['☮️']);
    });

    it('returns nothing for an empty string', () => {
      expect(splitGraphemes('')).toEqual([]);
    });
  });

  describe('resolveEmoji', () => {
    it('resolves an exact slug', () => {
      const record = resolveEmoji('skull');
      expect(record?.character).toBe('💀');
    });

    it('resolves a slug that only differs in hyphens', () => {
      const record = resolveEmoji('lightbulb');
      expect(record?.slug).toBeTruthy();
    });

    it('falls back to the glyph when the slug is unknown', () => {
      const record = resolveEmoji('not-a-real-slug', '💀');
      expect(record?.character).toBe('💀');
    });

    it('returns nothing when neither the slug nor the glyph is known', () => {
      expect(resolveEmoji('not-a-real-slug', '🛂')).toBeUndefined();
    });

    it('returns nothing when there is neither a slug nor a glyph', () => {
      expect(resolveEmoji(undefined, undefined)).toBeUndefined();
    });

    it('prefers the base emoji over a skin-tone variant', () => {
      const record = resolveEmoji(undefined, '👍');
      expect(record?.slug).not.toContain('skin-tone');
    });
  });

  describe('buildEmojiBrief', () => {
    it('builds a brief for a known emoji', () => {
      const brief = buildEmojiBrief('skull', '💀', false);
      expect(brief?.slug).toBe('skull');
      expect(brief?.character).toBe('💀');
      expect(brief?.name).toBeTruthy();
      expect(brief?.baseMeaning).toBeTruthy();
      expect(brief?.tldr).toBeTruthy();
      expect(brief?.doubled).toBe(false);
    });

    it('strips the catalog jargon out of the brief', () => {
      const brief = buildEmojiBrief('skull', '💀', false);
      expect(brief?.baseMeaning).not.toContain('-coded');
    });

    it('caps the contexts, warnings, platform notes and generational notes', () => {
      const brief = buildEmojiBrief('skull', '💀', false);
      expect(brief!.contexts.length).toBeLessThanOrEqual(4);
      expect(brief!.warnings.length).toBeLessThanOrEqual(2);
      expect(brief!.platformNotes.length).toBeLessThanOrEqual(3);
      expect(brief!.generationalNotes.length).toBeLessThanOrEqual(2);
    });

    it('returns nothing for an unknown emoji', () => {
      expect(buildEmojiBrief('not-a-real-slug', '🛂', false)).toBeNull();
    });

    it('records that the combo repeats the same emoji', () => {
      const brief = buildEmojiBrief('light-bulb', '💡', true);
      expect(brief?.doubled).toBe(true);
    });
  });

  describe('buildComboBriefs', () => {
    it('builds one brief per emoji in the combo', () => {
      const { briefs, resolved } = buildComboBriefs(['skull', 'crying-laughing'], '💀😂');
      expect(briefs).toHaveLength(2);
      expect(resolved).toHaveLength(2);
      expect(briefs[0].character).toBe('💀');
      expect(briefs[1].character).toBe('😂');
    });

    it('marks a repeated emoji as doubled', () => {
      const { briefs } = buildComboBriefs(['light-bulb', 'light-bulb'], '💡💡');
      expect(briefs.every((brief) => brief.doubled)).toBe(true);
    });

    it('keeps a null slot for an emoji it could not resolve', () => {
      const { briefs, resolved } = buildComboBriefs(['skull', 'not-a-real-slug'], '💀🛂');
      expect(briefs).toHaveLength(1);
      expect(resolved).toHaveLength(2);
      expect(resolved[1]).toBeNull();
    });

    it('handles a combo with no emoji at all', () => {
      const { briefs, resolved } = buildComboBriefs([], '');
      expect(briefs).toEqual([]);
      expect(resolved).toEqual([]);
    });
  });
});

describe('combo-content/prompt', () => {
  const combo: EmojiCombo = {
    slug: 'lightbulb-lightbulb',
    combo: '💡💡',
    emojis: ['light-bulb', 'light-bulb'],
    name: 'Light Bulb Light Bulb',
    description: 'x',
    meaning: 'x',
    examples: ['x'],
    category: 'reaction',
    seoTitle: 'x',
    seoDescription: 'x',
  };

  const { briefs } = buildComboBriefs(['light-bulb', 'light-bulb'], '💡💡');

  it('offers eight distinct editorial angles', () => {
    expect(ANGLES).toHaveLength(8);
    expect(new Set(ANGLES.map((angle) => angle.key)).size).toBe(8);
    expect(new Set(ANGLES.map((angle) => angle.brief)).size).toBe(8);
  });

  it('bans the abstract vocabulary in the system prompt', () => {
    const { system } = buildComboPrompt(combo, briefs, { angle: ANGLES[0] });
    expect(system).toContain('"register"');
    expect(system).toContain('"-coded"');
    expect(system).toContain('Never open two sections the same way');
  });

  it('grounds the prompt in both emoji records', () => {
    const { user } = buildComboPrompt(combo, briefs, { angle: ANGLES[0] });
    expect(user).toContain('First emoji: 💡');
    expect(user).toContain('Second emoji: 💡');
    expect(user).toContain('What it depicts:');
  });

  it('tells the writer that the combo repeats the same emoji', () => {
    const { user } = buildComboPrompt(combo, briefs, { angle: ANGLES[0] });
    expect(user).toContain('repeats the SAME emoji twice');
  });

  it('does not claim the combo repeats itself when the two differ', () => {
    const mixed = buildComboBriefs(['light-bulb', 'fire'], '💡🔥');
    const { user } = buildComboPrompt(
      { ...combo, combo: '💡🔥', emojis: ['light-bulb', 'fire'] },
      mixed.briefs,
      { angle: ANGLES[0] }
    );
    expect(user).not.toContain('repeats the SAME emoji twice');
  });

  it('includes the assigned angle', () => {
    const { user } = buildComboPrompt(combo, briefs, { angle: ANGLES[3] });
    expect(user).toContain(ANGLES[3].brief);
  });

  it('tells the writer when a sibling page covers the same pair', () => {
    const { user } = buildComboPrompt(combo, briefs, {
      angle: ANGLES[0],
      siblings: ['lightbulb-lightbulb-v2'],
    });
    expect(user).toContain('lightbulb-lightbulb-v2');
    expect(user).toContain('Take your own angle');
  });

  it('leaves the sibling note out when there are no siblings', () => {
    const { user } = buildComboPrompt(combo, briefs, { angle: ANGLES[0] });
    expect(user).not.toContain('other pages cover the same two emojis');
  });

  it('includes a style reference when one is given', () => {
    const { user } = buildComboPrompt(combo, briefs, {
      angle: ANGLES[0],
      styleReference: 'A hand-written page used as a voice reference.',
    });
    expect(user).toContain('A hand-written page used as a voice reference.');
  });

  it('leaves the style reference out when there is none', () => {
    const { user } = buildComboPrompt(combo, briefs, { angle: ANGLES[0] });
    expect(user).not.toContain('Match its voice');
  });

  it('shows the JSON shape with the faqs nested inside longForm', () => {
    const { user } = buildComboPrompt(combo, briefs, { angle: ANGLES[0] });
    expect(user).toContain('"longForm": {');
    expect(user).toContain('"faqs": [');
    expect(user).toContain('"conversationExamples": [');
    expect(user).toContain('"seoDescription":');
  });

  it('falls back to the combo string when a brief is missing', () => {
    const { user } = buildComboPrompt(combo, [], { angle: ANGLES[0] });
    expect(user).toContain('💡💡');
  });

  it('lists the banned vocabulary without the compound marker', () => {
    expect(BANNED_VOCABULARY).toContain('register');
    expect(BANNED_VOCABULARY).toContain('cadence');
    expect(BANNED_VOCABULARY).not.toContain('-coded');
  });
});
