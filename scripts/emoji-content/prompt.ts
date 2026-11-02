/**
 * Prompt construction for the emoji content writer.
 *
 * The writer's job is to turn the guide prose into an emoji page. The
 * previous generator had no source material and filled the page with the
 * emoji's category instead, which is why a thousand pages shared the same
 * sentences. Here the source material is the guide excerpt, and the page
 * has to be about the emoji the writer was handed — not about the category,
 * not about "emoji in general".
 *
 * The house-style rules below are the ones the hand-written pages already
 * follow (see `src/data/emojis/skull.json`): concrete, opinionated, and
 * free of the abstract vocabulary the template leaned on.
 */

import type { Emoji } from '../../src/types/emoji';
import type { EmojiGrounding, GuideExcerpt } from './guide-grounding';

/**
 * The editorial angles a page can take.
 *
 * Two pages about the same emoji family would collapse into each other if
 * they took the same angle, so the angle is assigned rather than left to
 * the writer.
 */
export interface Angle {
  key: string;
  brief: string;
}

export const ANGLES: Angle[] = [
  {
    key: 'origin',
    brief:
      'Start from where the emoji came from and what it used to mean before people gave it its current meaning.',
  },
  {
    key: 'reaction',
    brief:
      'Start from the emoji as a bare reaction — the moment that prompts it and who sends it first.',
  },
  {
    key: 'conversation',
    brief:
      'Start from the emoji closing a sentence. Show the kinds of sentence people actually attach it to.',
  },
  {
    key: 'platform',
    brief:
      'Start from where the emoji travels: the platform, the corner of it, and the audience that reads it there.',
  },
  {
    key: 'generation',
    brief: 'Start from who reads the emoji and how differently people of different ages take it.',
  },
  {
    key: 'misread',
    brief:
      'Start from the misread: the way the emoji gets taken the wrong way, and what the sender actually meant.',
  },
  {
    key: 'contrast',
    brief:
      'Start from what this emoji does that the neighbouring ones cannot, and when the neighbour is the better choice.',
  },
  {
    key: 'occasion',
    brief:
      'Start from the occasions it belongs to — the wins, the callouts, the small moments people reach for it on.',
  },
];

/**
 * Words the catalog used to describe meaning abstractly instead of
 * describing what people do. They are not banned outright, but a page
 * built out of them reads as generated.
 */
export const EMOJI_JARGON_WORDS: readonly string[] = [
  'register',
  'cadence',
  'the read',
  'the cue',
  'travels without losing',
  '-coded',
];

/**
 * A hard cap on how many of those words a page may carry.
 */
export const MAX_JARGON_HITS = 2;

const SYSTEM_PROMPT = `You write the reference pages that explain what a single emoji actually means when people send it.

You have watched thousands of real chats. Your writing reflects that: specific, concrete, opinionated, and free of filler. You describe what people send and why, not what a category of emoji "represents".

House style — follow every rule:

1. Write like a person, not a content template. Vary sentence length, paragraph length, and structure. Never open two sections the same way.
2. Be concrete. Name real situations, real message examples, real misreads. A reader should learn something they could not have guessed.
3. Every sentence must be true of THIS particular emoji. If a sentence would still fit on a page about a different emoji, it does not belong.
4. Never use this abstract vocabulary: "register", "cadence", "cue", "the read", "travels without losing", "shallow", or any hyphenated "-coded" compound. Describe meaning directly instead: say "reads as approval" not "carries an approval register".
5. Never describe an emoji family in the abstract ("smileys like this are..."). Write only about this emoji.
6. Do not pad. Every sentence earns its place. If a section could be shorter, make it shorter — but it must still hit its word minimum with substance, not filler.
7. Do not invent platform behaviour, statistics, or slang you are not confident about. Prefer honest, specific, grounded claims. The source material below is the authority on what this emoji means; where it does not cover something, say something modest rather than something bold.
8. Use the emoji character itself when referring to the emoji, so the reader sees it.
9. Never reuse a sentence from the source material word for word. Absorb what the source says and write it in your own words — a reader landing on the emoji page and then on the guide should read two articles, not one.

Output format: return a single JSON object and nothing else. No prose before or after, no markdown fences.`;

interface PromptOptions {
  /** The editorial angle this page should take. */
  angle: Angle;
  /** A hand-written page used as a style reference. */
  styleReference?: string;
  /** Notes about sibling pages covering the same emoji. */
  siblings?: string[];
}

/**
 * Render the guide excerpts as the writer's source material.
 */
function formatExcerpts(excerpts: GuideExcerpt[]): string {
  return excerpts
    .map((excerpt, index) => {
      const heading = excerpt.heading ? ` (under "${excerpt.heading}")` : '';
      return `[${index + 1}] From the guide "${excerpt.guideTitle}"${heading}:\n${excerpt.text}`;
    })
    .join('\n\n');
}

/**
 * Build the chat messages for one emoji.
 */
export function buildEmojiPrompt(
  emoji: Emoji,
  grounding: EmojiGrounding,
  options: PromptOptions
): { system: string; user: string } {
  const styleNote = options.styleReference
    ? `Here is a hand-written page from this same site. Match its voice, its level of detail, and its warmth — but do not reuse its sentences or its examples:\n\n${options.styleReference}\n`
    : '';

  const siblingNote = options.siblings?.length
    ? `\nNote: other pages cover the same emoji (${options.siblings.join(
        ', '
      )}). Do not try to match or contradict them. Take your own angle and make your page stand on its own.\n`
    : '';

  const user = `Write the page for the emoji ${emoji.character} (${emoji.name}, catalog slug: ${emoji.slug}).

WHAT THE GLYPH IS: ${emoji.baseMeaning}
CATEGORY: ${emoji.category}${grounding.subcategory ? ` / ${grounding.subcategory}` : ''} (Unicode ${emoji.unicodeVersion})

SOURCE MATERIAL — the notes this site's editors have already written about ${emoji.character}. Everything you claim about how people use it, what it means, and where it misreads must come from here or be a modest general statement. Do not invent facts that contradict this material, and do not invent specific statistics, dates, or platform features that it does not mention.

${formatExcerpts(grounding.excerpts)}

ANGLE FOR THIS PAGE: ${options.angle.brief}
${siblingNote}
${styleNote}
Write these fields:

- "tldr" (10-20 words): one line saying what the emoji is for, the way a reader would explain it to a friend. No jargon, no "register", no "-coded" compound.
- "contextMeanings" (4 entries): each has "context" (one of: LITERAL, SLANG, IRONIC, PASSIVE_AGGRESSIVE, DATING, WORK, RED_FLAG), "meaning" (1 sentence about what the emoji means in that context), "example" (a short message someone would actually send, containing the emoji), and "riskLevel" (LOW, MEDIUM, or HIGH). The four contexts must be four genuinely different situations.
- "platformNotes" (4 entries): each has "platform" (one of: IMESSAGE, INSTAGRAM, TIKTOK, WHATSAPP, SLACK, DISCORD, TWITTER) and "note" (2-3 sentences, at least 40 characters, about how the emoji behaves on that platform). Each platform must be a genuinely different surface.
- "generationalNotes" (3 entries): each has "generation" (one of: GEN_Z, MILLENNIAL, GEN_X, BOOMER) and "note" (1-2 sentences about how that generation reads it). At least one of the three must say something genuinely different from the others.
- "warnings" (1-2 entries): each has "title" (a short label for the misread), "description" (1-2 sentences on what goes wrong and what to send instead), and "severity" (LOW, MEDIUM, or HIGH). Only warn where the source material actually supports a misread.
- "longForm.overview" (130-190 words, 2-3 paragraphs separated by a blank line): the main explanation. What the emoji is, how it is actually used, what separates it from its neighbours, and what a reader gets wrong about it. This is the section people read in full.
- "longForm.howPeopleUseIt" (80-120 words, 2 paragraphs): where it shows up in real conversations, what prompts it, and what people are trying to say when they send it.
- "longForm.whenNotToUse" (80-120 words, 2 paragraphs): the contexts where it misfires, who might misread it, and what to reach for instead.
- "longForm.howToReply" (80-120 words, 2 paragraphs): how to answer it — how to match the energy, how to escalate, and what to do if it lands on your own content.
- "longForm.faqs" (4 entries): each has "question" and "answer". Phrase the questions the way someone would actually type them into a search box ("What does ${emoji.character} mean from a guy", "Is ${emoji.character} flirty", "What does ${emoji.character} mean on TikTok"), in normal sentence case with a capital first letter. The answers are 1-3 sentences, self-contained, and specific to this emoji. Do not repeat a question the page already answers.
- "conversationExamples" (5 entries): each has "setting" (one of: dating, friends, work, family, social), "message" (a full message containing the emoji, typed like a real person, lowercase and unpolished), and "interpretation" (what that message means in that setting and how to respond). Every setting must be a genuinely different situation — a work example must not be the same situation as a dating example, and no two messages may share a scenario.
- "seoTitle": the emoji character, then the name, then "Emoji Meaning" — for example "${emoji.character} ${emoji.name} Emoji Meaning".
- "seoDescription": one sentence, 120-155 characters, that starts with "What does ${emoji.character} mean?" and says specifically what it means.

Use exactly this shape — note that "faqs" sits inside "longForm":

{
  "tldr": "...",
  "contextMeanings": [
    { "context": "SLANG", "meaning": "...", "example": "...", "riskLevel": "LOW" }
  ],
  "platformNotes": [
    { "platform": "TIKTOK", "note": "..." }
  ],
  "generationalNotes": [
    { "generation": "GEN_Z", "note": "..." }
  ],
  "warnings": [
    { "title": "...", "description": "...", "severity": "MEDIUM" }
  ],
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
    { "setting": "friends", "message": "...", "interpretation": "..." }
  ],
  "seoTitle": "...",
  "seoDescription": "..."
}

Return the JSON object now.`;

  return { system: SYSTEM_PROMPT, user };
}
