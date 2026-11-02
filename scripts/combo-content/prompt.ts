/**
 * Prompt construction for the combo content writer.
 *
 * The writer is grounded in the two emoji records that make up the combo, so
 * the prose is about the pair rather than about a category. That grounding is
 * the whole point: the previous generator filled a category template with a
 * few slots, which is why several hundred pages ended up saying the same
 * thing in the same words.
 */

import type { EmojiCombo } from '../../src/types/combo';
import type { EmojiBrief } from './emoji-grounding';
import { COMBO_JARGON_WORDS } from './boilerplate';

/**
 * Editorial angles. A combo whose emoji pair is also covered by another
 * page gets its own angle so the two do not collapse into each other.
 */
export interface Angle {
  key: string;
  brief: string;
}

export const ANGLES: Angle[] = [
  {
    key: 'literal',
    brief:
      'Start from what the two images literally depict and what that picture evokes for a reader. Let the picture do the explaining.',
  },
  {
    key: 'reaction',
    brief:
      'Start from the combo as a bare reaction — where it shows up, who sends it, and what moment prompts it.',
  },
  {
    key: 'phrase',
    brief:
      'Start from the combo closing a sentence. Show the kinds of sentence people actually attach it to.',
  },
  {
    key: 'platform',
    brief:
      'Start from where the combo travels: the platform, the corner of it, and the audience that reads it there.',
  },
  {
    key: 'generation',
    brief: 'Start from who reads the combo and how differently people of different ages take it.',
  },
  {
    key: 'misread',
    brief:
      'Start from the misread: the way this combo gets taken the wrong way, and what the sender actually meant.',
  },
  {
    key: 'contrast',
    brief:
      'Start from what the pair does that either emoji alone cannot, and the cases where a single emoji is the better choice.',
  },
  {
    key: 'occasion',
    brief:
      'Start from the occasions it belongs to — the wins, milestones, callouts and quiet moments people reach for it on.',
  },
];

const SYSTEM_PROMPT = `You write the reference pages that explain what emoji combinations actually mean when people send them.

You have watched thousands of real chats. Your writing reflects that: specific, concrete, opinionated, and free of filler. You describe what people send and why, not what a category of emoji "represents".

House style — follow every rule:

1. Write like a person, not a content template. Vary sentence length, paragraph length, and structure. Never open two sections the same way.
2. Be concrete. Name real situations, real message examples, real misreads. A reader should learn something they could not have guessed.
3. Every sentence must be true of THIS particular pair of emojis. If a sentence would still fit on a page about a different pair, it does not belong.
4. Never use this abstract vocabulary: "register", "cadence", "cue", "the read", "travels without losing", "shallow", "punctuates a moment", or any hyphenated "-coded" compound. Describe meaning directly instead: say "reads as approval" not "carries an approval register".
5. Never describe an emoji family in the abstract ("combos in the hearts family are..."). Write only about this pair.
6. Do not pad. Every sentence earns its place. If a section could be shorter, make it shorter — but it must still hit its word minimum with substance, not filler.
7. Do not invent platform behaviour, statistics, or slang you are not confident about. Prefer honest, specific, grounded claims.
8. Use the emoji characters themselves when referring to the combo, so the reader sees them.

Output format: return a single JSON object and nothing else. No prose before or after, no markdown fences.`;

interface PromptOptions {
  /** The editorial angle this page should take. */
  angle: Angle;
  /** Names of sibling pages covering the same emoji pair, if any. */
  siblings?: string[];
  /** A hand-written page used as a style reference. */
  styleReference?: string;
}

function formatBrief(brief: EmojiBrief | undefined, position: 'first' | 'second'): string {
  const lines: string[] = [];
  const label = position === 'first' ? 'First emoji' : 'Second emoji';

  if (!brief) {
    lines.push(`${label}: (not in the catalog — describe only what the glyph shows)`);
    return lines.join('\n');
  }

  lines.push(`${label}: ${brief.character} ${brief.name} (catalog slug: ${brief.slug})`);
  lines.push(`  What it depicts: ${brief.baseMeaning}`);
  lines.push(`  What it is used for: ${brief.tldr}`);

  if (brief.contexts.length) {
    lines.push('  How it reads in different situations:');
    for (const ctx of brief.contexts) {
      const example = ctx.example ? ` (e.g. "${ctx.example}")` : '';
      lines.push(`    - ${ctx.context}: ${ctx.meaning}${example}`);
    }
  }

  if (brief.warnings.length) {
    lines.push('  Known misreads:');
    for (const warning of brief.warnings) {
      lines.push(`    - ${warning.title}: ${warning.description}`);
    }
  }

  if (brief.platformNotes.length) {
    lines.push('  Where it shows up:');
    for (const note of brief.platformNotes) {
      lines.push(`    - ${note.platform}: ${note.note}`);
    }
  }

  if (brief.generationalNotes.length) {
    lines.push('  Who sends it:');
    for (const note of brief.generationalNotes) {
      lines.push(`    - ${note.generation}: ${note.note}`);
    }
  }

  return lines.join('\n');
}

/**
 * Build the chat messages for one combo.
 */
export function buildComboPrompt(
  combo: EmojiCombo,
  briefs: EmojiBrief[],
  options: PromptOptions
): { system: string; user: string } {
  const first = briefs[0];
  const second = briefs[1];

  const siblingNote = options.siblings?.length
    ? `\nNote: other pages cover the same two emojis (${options.siblings.join(
        ', '
      )}). Do not try to match or contradict them. Take your own angle and make your page stand on its own.`
    : '';

  const styleNote = options.styleReference
    ? `\nHere is a hand-written page from this same site. Match its voice, its level of detail, and its warmth — but do not reuse its sentences or its examples:\n\n${options.styleReference}\n`
    : '';

  const emojiPart = first && second ? `${first.character}${second.character}` : combo.combo;
  const doubledNote =
    first && second && first.slug === second.slug
      ? `\nImportant: this combo repeats the SAME emoji twice (${first.name}). That repetition is the point — write about what doubling the same glyph changes. Do not describe two different emojis.`
      : '';

  const user = `Write the page for the emoji combo ${emojiPart} (currently titled "${combo.name}", category: ${combo.category}).

${formatBrief(first, 'first')}

${second ? formatBrief(second, 'second') : ''}
${doubledNote}
ANGLE FOR THIS PAGE: ${options.angle.brief}
${siblingNote}
${styleNote}
Write these fields:

- "description" (20-35 words): one or two sentences saying what this combo is for. Not a teaser — a real summary.
- "meaning" (30-55 words): what the combo means in context, and how the two parts combine to make that meaning.
- "examples" (3-5 strings): real messages someone would actually send, each containing the combo. Write them the way people type, lowercase and unpolished. No emoji other than this combo unless the sentence clearly needs it.
- "longForm.overview" (130-190 words, 2-3 paragraphs separated by a blank line): the main explanation. What the combo is, what the two parts contribute, how it is actually used, and what separates it from a single emoji. This is the section people read in full.
- "longForm.howPeopleUseIt" (70-110 words, 2 paragraphs): where it shows up in real conversations, what prompts it, and what people are trying to say when they send it.
- "longForm.whenNotToUse" (70-110 words, 2 paragraphs): the contexts where it misfires, who might misread it, and what to reach for instead.
- "longForm.howToReply" (70-110 words, 2 paragraphs): how to answer it — how to match the energy, how to escalate, and what to do if it lands on your own content.
- "longForm.faqs" (4 entries): each has "question" and "answer". Phrase the questions the way someone would actually type them into a search box ("What does ${emojiPart} mean in a group chat", "Is ${emojiPart} flirty"), in normal sentence case with a capital first letter. The answers are 1-3 sentences, self-contained, and specific to this pair. Do not repeat a question that the description already answers.
- "conversationExamples" (5 entries): each has "setting" (one of: dating, friends, work, family, social), "message" (a full message containing the combo, typed like a real person), and "interpretation" (what that message means in that setting and how to respond). Every setting must be a genuinely different situation — a work example must not be the same situation as a dating example, and no two messages may share a scenario.
- "seoTitle": the combo characters, then the name, then "Combo Meaning" — for example "${emojiPart} ${combo.name} Combo Meaning".
- "seoDescription": one sentence, 120-155 characters, that starts with "What does ${emojiPart} mean?" and says specifically what it means.

Use exactly this shape — note that "faqs" sits inside "longForm":

{
  "description": "...",
  "meaning": "...",
  "examples": ["...", "..."],
  "longForm": {
    "overview": "...",
    "howPeopleUseIt": "...",
    "whenNotToUse": "...",
    "howToReply": "...",
    "faqs": [
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ]
  },
  "conversationExamples": [
    { "setting": "work", "message": "...", "interpretation": "..." },
    { "setting": "friends", "message": "...", "interpretation": "..." },
    { "setting": "dating", "message": "...", "interpretation": "..." },
    { "setting": "family", "message": "...", "interpretation": "..." },
    { "setting": "social", "message": "...", "interpretation": "..." }
  ],
  "seoTitle": "...",
  "seoDescription": "..."
}

Return the JSON object now.`;

  return { system: SYSTEM_PROMPT, user };
}

/**
 * The banned vocabulary, as it should be shown to the writer.
 */
export const BANNED_VOCABULARY = COMBO_JARGON_WORDS.filter((w) => !w.startsWith('-'));
