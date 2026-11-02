/**
 * Validation for the emoji content the writer produces.
 *
 * The writer is a language model, so its output has to be checked before it
 * reaches the catalog. Three things can go wrong, and each has its own
 * check:
 *
 *   1. It can reproduce the template. The markers the batch generator left
 *      behind are rejected outright, because a page carrying them is a
 *      doorway page no matter how good the rest of the prose is.
 *   2. It can be too thin. The deep-tier thresholds in
 *      `scripts/validate-emojis.ts` are the floor; the writer is held to
 *      the same floor here so a bad completion is caught before it is
 *      written.
 *   3. It can be abstract. The jargon the old template leaned on is
 *      counted, and a page full of it is rejected.
 *
 * The checks here are deliberately stricter than the validator, because a
 * completion that only just passes the validator still reads as generated.
 */

import {
  EMOJI_TEMPLATE_CODED_TOKEN,
  EMOJI_TEMPLATE_PHRASES,
  countCodedTokens,
  normalizeProse,
} from '../../src/lib/emoji-boilerplate';
import { countWords, validateDeepTier } from '../validate-emojis';
import type {
  ContextType,
  ConversationSetting,
  Emoji,
  EmojiFaq,
  EmojiLongForm,
  Generation,
  Platform,
  RiskLevel,
  WarningSeverity,
} from '../../src/types/emoji';
import { EMOJI_JARGON_WORDS, MAX_JARGON_HITS } from './prompt';

/**
 * The enumerations the catalog accepts.
 *
 * The model is told which values are legal, but it does not always obey, and
 * a page with an illegal context type is rejected by `validate:emojis`
 * after it has been written. Checking here turns that into a repair prompt.
 */
const VALID_CONTEXT_TYPES: readonly ContextType[] = [
  'LITERAL',
  'SLANG',
  'IRONIC',
  'PASSIVE_AGGRESSIVE',
  'DATING',
  'WORK',
  'RED_FLAG',
];

const VALID_RISK_LEVELS: readonly RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

const VALID_PLATFORMS: readonly Platform[] = [
  'IMESSAGE',
  'INSTAGRAM',
  'TIKTOK',
  'WHATSAPP',
  'SLACK',
  'DISCORD',
  'TWITTER',
];

const VALID_GENERATIONS: readonly Generation[] = ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'BOOMER'];

const VALID_SEVERITIES: readonly WarningSeverity[] = ['LOW', 'MEDIUM', 'HIGH'];

const VALID_SETTINGS: readonly ConversationSetting[] = [
  'dating',
  'friends',
  'work',
  'family',
  'social',
  'other',
];

/**
 * Word-count bounds the writer is held to, per field.
 *
 * The lower bounds match the deep-tier thresholds so a page cannot slip
 * through the validator by being short. The upper bounds stop the model
 * padding a section out with restatement.
 */
export const LIMITS = {
  tldrMin: 8,
  tldrMax: 26,
  overviewMin: 130,
  overviewMax: 240,
  sectionMin: 75,
  sectionMax: 160,
  faqCount: 4,
  conversationCount: 5,
  contextCount: 4,
  platformCount: 4,
  generationalCount: 3,
} as const;

/**
 * The shape the writer is asked to return.
 */
export interface WrittenEmoji {
  tldr?: string;
  contextMeanings?: Emoji['contextMeanings'];
  platformNotes?: Emoji['platformNotes'];
  generationalNotes?: Emoji['generationalNotes'];
  warnings?: Emoji['warnings'];
  longForm?: Emoji['longForm'];
  conversationExamples?: Emoji['conversationExamples'];
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * One thing wrong with a completion.
 */
export interface ValidationIssue {
  /** Which field the issue is about. */
  field: string;
  /** What is wrong, in a form that can be shown to the writer. */
  message: string;
}

/**
 * Count the jargon words in a piece of prose.
 */
export function countJargon(text: string): number {
  const normalized = normalizeProse(text);
  let count = 0;
  for (const word of EMOJI_JARGON_WORDS) {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const pattern = word.startsWith('-')
      ? new RegExp(escaped, 'g')
      : new RegExp(`\\b${escaped}\\b`, 'g');
    count += (normalized.match(pattern) ?? []).length;
  }
  return count;
}

/**
 * Every reader-visible string on the page, joined for scanning.
 */
export function writtenProse(written: WrittenEmoji): string {
  return [
    written.tldr ?? '',
    ...(written.contextMeanings ?? []).flatMap((c) => [c.meaning ?? '', c.example ?? '']),
    ...(written.platformNotes ?? []).map((p) => p.note ?? ''),
    ...(written.generationalNotes ?? []).map((g) => g.note ?? ''),
    ...(written.warnings ?? []).flatMap((w) => [w.title ?? '', w.description ?? '']),
    written.longForm?.overview ?? '',
    written.longForm?.howPeopleUseIt ?? '',
    written.longForm?.whenNotToUse ?? '',
    written.longForm?.howToReply ?? '',
    ...(written.longForm?.faqs ?? []).flatMap((f) => [f.question ?? '', f.answer ?? '']),
    ...(written.conversationExamples ?? []).flatMap((c) => [
      c.message ?? '',
      c.interpretation ?? '',
    ]),
    written.seoTitle ?? '',
    written.seoDescription ?? '',
  ].join('\n');
}

/**
 * Reject a completion that reintroduces the template.
 *
 * The markers are the same ones `src/lib/emoji-boilerplate.ts` uses to
 * decide a page is not indexable, so a completion that carries one would
 * come back as a noindex page after all the work.
 */
export function findTemplateMarkers(written: WrittenEmoji): string[] {
  const markers: string[] = [];

  // The phrases are scanned across every reader-visible string rather than
  // only in the slot the batch filled, because a page that says "is a
  // natural fit for" in a section is still echoing the template.
  const prose = normalizeProse(writtenProse(written));
  for (const phrase of EMOJI_TEMPLATE_PHRASES) {
    if (prose.includes(phrase)) markers.push(`page contains "${phrase}"`);
  }

  const coded = countCodedTokens(writtenProse(written));
  if (coded >= 10) {
    markers.push(`page carries ${coded} "${EMOJI_TEMPLATE_CODED_TOKEN}" compounds`);
  }

  return markers;
}

/**
 * Check a completion against every rule the catalog holds a page to.
 *
 * Returns the list of problems; an empty list means the completion is
 * good to write.
 */
export function validateWritten(written: WrittenEmoji, slug: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const marker of findTemplateMarkers(written)) {
    issues.push({ field: 'template', message: marker });
  }

  const tldrWords = countWords(written.tldr ?? '');
  if (tldrWords < LIMITS.tldrMin) {
    issues.push({
      field: 'tldr',
      message: `tldr needs at least ${LIMITS.tldrMin} words (got ${tldrWords})`,
    });
  }
  if (tldrWords > LIMITS.tldrMax) {
    issues.push({
      field: 'tldr',
      message: `tldr must be at most ${LIMITS.tldrMax} words (got ${tldrWords})`,
    });
  }

  const overviewWords = countWords(written.longForm?.overview ?? '');
  if (overviewWords < LIMITS.overviewMin) {
    issues.push({
      field: 'longForm.overview',
      message: `overview needs at least ${LIMITS.overviewMin} words (got ${overviewWords})`,
    });
  }
  if (overviewWords > LIMITS.overviewMax) {
    issues.push({
      field: 'longForm.overview',
      message: `overview must be at most ${LIMITS.overviewMax} words (got ${overviewWords})`,
    });
  }

  const sections = [
    ['howPeopleUseIt', written.longForm?.howPeopleUseIt],
    ['whenNotToUse', written.longForm?.whenNotToUse],
    ['howToReply', written.longForm?.howToReply],
  ] as const;

  for (const [field, value] of sections) {
    const words = countWords(value ?? '');
    if (words < LIMITS.sectionMin) {
      issues.push({
        field: `longForm.${field}`,
        message: `${field} needs at least ${LIMITS.sectionMin} words (got ${words})`,
      });
    }
    if (words > LIMITS.sectionMax) {
      issues.push({
        field: `longForm.${field}`,
        message: `${field} must be at most ${LIMITS.sectionMax} words (got ${words})`,
      });
    }
  }

  const faqs = written.longForm?.faqs ?? [];
  if (faqs.length < LIMITS.faqCount) {
    issues.push({
      field: 'longForm.faqs',
      message: `needs at least ${LIMITS.faqCount} FAQ entries (got ${faqs.length})`,
    });
  }

  // The catalog's validator rejects a FAQ without a question or an answer,
  // so a completion that drops one of them is caught here and sent back for
  // a rewrite instead of failing the catalog after it has been written.
  faqs.forEach((faq, index) => {
    if (!faq.question) {
      issues.push({ field: `longForm.faqs[${index}].question`, message: 'question is required' });
    }
    if (!faq.answer) {
      issues.push({ field: `longForm.faqs[${index}].answer`, message: 'answer is required' });
    }
  });

  const examples = written.conversationExamples ?? [];
  if (examples.length < LIMITS.conversationCount) {
    issues.push({
      field: 'conversationExamples',
      message: `needs at least ${LIMITS.conversationCount} conversation examples (got ${examples.length})`,
    });
  }

  const contexts = written.contextMeanings ?? [];
  if (contexts.length < LIMITS.contextCount) {
    issues.push({
      field: 'contextMeanings',
      message: `needs at least ${LIMITS.contextCount} context meanings (got ${contexts.length})`,
    });
  }

  const platforms = written.platformNotes ?? [];
  if (platforms.length < LIMITS.platformCount) {
    issues.push({
      field: 'platformNotes',
      message: `needs at least ${LIMITS.platformCount} platform notes (got ${platforms.length})`,
    });
  }

  const generations = written.generationalNotes ?? [];
  if (generations.length < LIMITS.generationalCount) {
    issues.push({
      field: 'generationalNotes',
      message: `needs at least ${LIMITS.generationalCount} generational notes (got ${generations.length})`,
    });
  }

  // The catalog only accepts a fixed set of enum values, so a model that
  // invents one is caught here rather than by the validator after the write.
  contexts.forEach((context, index) => {
    if (!VALID_CONTEXT_TYPES.includes(context.context)) {
      issues.push({
        field: `contextMeanings[${index}].context`,
        message: `context must be one of ${VALID_CONTEXT_TYPES.join(', ')} (got "${context.context}")`,
      });
    }
    if (!VALID_RISK_LEVELS.includes(context.riskLevel)) {
      issues.push({
        field: `contextMeanings[${index}].riskLevel`,
        message: `riskLevel must be one of ${VALID_RISK_LEVELS.join(', ')} (got "${context.riskLevel}")`,
      });
    }
  });

  platforms.forEach((platform, index) => {
    if (!VALID_PLATFORMS.includes(platform.platform)) {
      issues.push({
        field: `platformNotes[${index}].platform`,
        message: `platform must be one of ${VALID_PLATFORMS.join(', ')} (got "${platform.platform}")`,
      });
    }
  });

  generations.forEach((generation, index) => {
    if (!VALID_GENERATIONS.includes(generation.generation)) {
      issues.push({
        field: `generationalNotes[${index}].generation`,
        message: `generation must be one of ${VALID_GENERATIONS.join(', ')} (got "${generation.generation}")`,
      });
    }
  });

  (written.warnings ?? []).forEach((warning, index) => {
    if (!warning.title) {
      issues.push({ field: `warnings[${index}].title`, message: 'title is required' });
    }
    if (!warning.description) {
      issues.push({ field: `warnings[${index}].description`, message: 'description is required' });
    }
    if (!VALID_SEVERITIES.includes(warning.severity)) {
      issues.push({
        field: `warnings[${index}].severity`,
        message: `severity must be one of ${VALID_SEVERITIES.join(', ')} (got "${warning.severity}")`,
      });
    }
  });

  examples.forEach((example, index) => {
    if (!example.message) {
      issues.push({
        field: `conversationExamples[${index}].message`,
        message: 'message is required',
      });
    }
    if (!example.interpretation) {
      issues.push({
        field: `conversationExamples[${index}].interpretation`,
        message: 'interpretation is required',
      });
    }
    if (!VALID_SETTINGS.includes(example.setting)) {
      issues.push({
        field: `conversationExamples[${index}].setting`,
        message: `setting must be one of ${VALID_SETTINGS.join(', ')} (got "${example.setting}")`,
      });
    }
  });

  const jargon = countJargon(writtenProse(written));
  if (jargon > MAX_JARGON_HITS) {
    issues.push({
      field: 'jargon',
      message: `page carries ${jargon} jargon words (maximum ${MAX_JARGON_HITS})`,
    });
  }

  const seoDescription = written.seoDescription ?? '';
  if (seoDescription.length < 120 || seoDescription.length > 160) {
    issues.push({
      field: 'seoDescription',
      message: `seoDescription must be 120-160 characters (got ${seoDescription.length})`,
    });
  }

  if (!written.seoTitle || written.seoTitle.length < 10) {
    issues.push({ field: 'seoTitle', message: 'seoTitle is required' });
  }

  // The catalog's own validator is the final word on shape, so its verdict
  // is folded in here rather than run separately.
  const merged = mergeIntoEmoji(emptyRecord(slug), written);
  for (const error of validateDeepTier(merged)) {
    issues.push({ field: error.field, message: error.message });
  }

  return issues;
}

/**
 * A record with the identity of an emoji and nothing else.
 *
 * The deep-tier validator walks the record's arrays, so a stub has to
 * carry them — empty is enough, because the completion is what is being
 * checked.
 */
function emptyRecord(slug: string): Emoji {
  return {
    unicode: '',
    slug,
    character: '',
    name: '',
    shortName: '',
    category: '',
    unicodeVersion: '',
    baseMeaning: '',
    tldr: '',
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: '',
    seoDescription: '',
  };
}

/**
 * The keys a model uses for each long-form section, including the ones it
 * reaches for instead of the catalog's.
 *
 * The catalog calls the section `whenNotToUse`, but the model frequently
 * writes `whenNotToUseIt` or `when_not_to_use` — the same section under the
 * name it half-remembers from the prompt's prose. The completion is right
 * and only the key is wrong, so it is mapped rather than rejected.
 */
const LONG_FORM_ALIASES: Record<string, keyof EmojiLongForm> = {
  overview: 'overview',
  howPeopleUseIt: 'howPeopleUseIt',
  how_people_use_it: 'howPeopleUseIt',
  howPeopleUse: 'howPeopleUseIt',
  whenNotToUse: 'whenNotToUse',
  whenNotToUseIt: 'whenNotToUse',
  when_not_to_use: 'whenNotToUse',
  whenNotToUseItIt: 'whenNotToUse',
  howToReply: 'howToReply',
  how_to_reply: 'howToReply',
  faqs: 'faqs',
  faq: 'faqs',
};

/**
 * Capitalize the first letter of a FAQ question.
 *
 * FAQ questions are search queries, so they read better in sentence case
 * than shouted in all caps.
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Put a model response into the shape the emoji record expects.
 *
 * The prompt shows the target shape, but a model occasionally nests `faqs`
 * beside `longForm` instead of inside it, or spells a long-form key its own
 * way. Those are one-line fixes rather than failed rewrites.
 */
export function normalizeWritten(raw: WrittenEmoji): WrittenEmoji {
  const source = (raw ?? {}) as Record<string, unknown>;

  const longForm: EmojiLongForm = {};
  const rawLongForm = (source.longForm ?? {}) as Record<string, unknown>;

  for (const [key, value] of Object.entries(rawLongForm)) {
    const target = LONG_FORM_ALIASES[key];
    if (!target || value === undefined || value === null) continue;
    if (typeof value !== 'string' && !Array.isArray(value)) continue;
    (longForm as Record<string, unknown>)[target] = value;
  }

  const faqs = longForm.faqs ?? (source.faqs as EmojiFaq[] | undefined);
  longForm.faqs = Array.isArray(faqs)
    ? faqs.map((faq) => ({
        question: capitalizeFirst(faq?.question ?? ''),
        answer: faq?.answer ?? '',
      }))
    : [];

  return {
    ...source,
    longForm,
    contextMeanings: Array.isArray(source.contextMeanings)
      ? (source.contextMeanings as Emoji['contextMeanings'])
      : [],
    platformNotes: Array.isArray(source.platformNotes)
      ? (source.platformNotes as Emoji['platformNotes'])
      : [],
    generationalNotes: Array.isArray(source.generationalNotes)
      ? (source.generationalNotes as Emoji['generationalNotes'])
      : [],
    warnings: Array.isArray(source.warnings) ? (source.warnings as Emoji['warnings']) : [],
    conversationExamples: Array.isArray(source.conversationExamples)
      ? (source.conversationExamples as Emoji['conversationExamples'])
      : [],
  };
}

/**
 * Fold a completion back into the catalog record.
 *
 * The record keeps its identity — the Unicode codepoint, the category, the
 * skin-tone wiring — and takes the new prose for everything the writer
 * produced.
 */
export function mergeIntoEmoji(emoji: Emoji, written: WrittenEmoji, today?: string): Emoji {
  const merged: Emoji = {
    ...emoji,
    tldr: written.tldr ?? emoji.tldr,
    contextMeanings: written.contextMeanings ?? emoji.contextMeanings,
    platformNotes: written.platformNotes ?? emoji.platformNotes,
    generationalNotes: written.generationalNotes ?? emoji.generationalNotes,
    warnings: written.warnings ?? emoji.warnings,
    longForm: written.longForm ?? emoji.longForm,
    conversationExamples: written.conversationExamples ?? emoji.conversationExamples,
    seoTitle: written.seoTitle ?? emoji.seoTitle,
    seoDescription: written.seoDescription ?? emoji.seoDescription,
    contentTier: 'deep',
  };

  if (today) merged.contentUpdatedAt = today;

  return merged;
}
