/**
 * Shared archetype interface and helpers used by the per-category archetype files.
 */

import { pick as _pick, fillTemplate as _fill, pickN as _pickN, countWords as _cw } from './util';
import type { ComboConversationSetting } from '../../src/types/combo';

export interface SegmentOverrides {
  description: (ctx: Record<string, string>) => string;
  meaning: (ctx: Record<string, string>) => string;
  overview: (ctx: Record<string, string>) => string;
  howPeopleUseIt: (ctx: Record<string, string>) => string;
  whenNotToUse: (ctx: Record<string, string>) => string;
  howToReply: (ctx: Record<string, string>) => string;
  examples: (ctx: Record<string, string>, rand: () => number) => string[];
  conversationLines: (
    ctx: Record<string, string>,
    rand: () => number
  ) => Array<{ setting: ComboConversationSetting; message: string; interpretation: string }>;
  seoTitle: (ctx: Record<string, string>) => string;
  seoDescription: (ctx: Record<string, string>) => string;
  tones: [string, string, string];
}

export function pad(text: string, minWords: number): string {
  let words = _cw(text);
  if (words >= minWords) return text;
  const fillers = [
    ' The read depends on context, but the register itself does not.',
    ' Across platforms the meaning is consistent, and the cadence stays the same.',
    ' The combo lands in 1:1 threads, on Instagram, and on TikTok without losing the read.',
    ' In tight groups it carries more warmth; in cross-functional work threads it carries less.',
    ' The receiver reads the combo the same whether it lands at the end of a sentence or as a stand-alone reaction.',
    ' Most platforms render the two emojis side by side, but the read does not change with spacing.',
  ];
  let i = 0;
  while (words < minWords && i < fillers.length) {
    text += fillers[i++];
    words = _cw(text);
  }
  return text;
}

/** Stable string hash → 0..1. */
export function hashUnit(s: string, salt = 0): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  h = (h + salt) >>> 0;
  return ((h * 2654435761) >>> 0) / 4294967296;
}

export const pick = _pick;
export const fillTemplate = _fill;
export const pickN = _pickN;

/** Builds a conversationLines slice (3..5) deterministically. */
export function takeLines<T>(all: T[], rand: () => number, n = 4): T[] {
  return all.slice(0, n + Math.floor(rand() * 2));
}

export const TONES_NOT = [
  'Skip it in sympathy or condolence-coded moments — the register is wrong for grief and reads as tone deaf. A single heart or a sentence that acknowledges the moment is a better fit.',
  'Avoid it in formal or cross-functional work channels where the read can be misread. A sentence or a softer single emoji keeps the message grounded in professional contexts.',
  'Do not default to it when the moment is mixed or serious on both sides. The two emojis together read louder than either alone, and the volume can overshadow the harder part of the message.',
  'Skip it when the sender wants to communicate a different register — the {a} cue is too specific-coded for moments that need a more neutral read; reach for a single emoji or a sentence.',
  'Avoid it as a deflection in a tense thread. The {a} register can read as performative over real conflict; prefer a sentence that names the issue.',
];

export const TONES_USE = [
  '{c} shows up in 1:1 threads between two people who already share the register, and in group chats when a moment lands that everyone reads the same way. The combo is shorthand for the kind of feeling the two emojis together make clear. On Instagram and TikTok the combo punctuates photo drops, story shares, and comment threads in the same {a} register. Across all of these surfaces the rule is the same: the more {a} the moment, the more natural {c} feels.',
  '{c} lives in spaces where the sender wants the two-emoji register to land at once — under a photo drop, in a tight friend thread, on a milestone-coded chat. The combination is shorthand for the moment, and the moment reads {a} across audiences. On Discord and Slack the same combo lands in {a} channels without forcing additional context. The combo does not need a sentence around it — a stand-alone {c} carries the full register.',
  '{c} appears as the closer on a {a} moment, the punctuation on a {a} reveal, and the softener on a {a} tag. The two emojis together fit the same {a} register across friend-coded chats, family groups, and {a} DMs alike. In tight groups it carries the most warmth; across wider audiences the combo reads without forcing extra context. The {a} register travels across most platforms without losing meaning.',
];

export const TONES_REPLY = [
  'The cleanest mirror is another {c} if you want to match the energy. A short sentence that names the moment lands as more sincere than another emoji when the read should be specific-coded.',
  'Mirroring {c} with another emoji is fine for casual threads. For deeper moments, a sentence that acknowledges the feeling lands as more {a} than another combo.',
  'Mirror {c} with another combo or escalate with a sentence. If the register feels too loud, a single softer emoji will register as agreement without matching the volume.',
  'If {c} lands on something you posted, reply with the same combo or a short "thank you" plus the combo to keep the register intact. For wider audiences, drop to a single emoji so the read does not overperform.',
];
