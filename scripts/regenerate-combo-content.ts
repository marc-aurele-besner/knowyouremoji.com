#!/usr/bin/env bun
/**
 * Rewrites the templated combo pages with prose grounded in the real emoji
 * records behind each combo.
 *
 * Why this exists
 * ---------------
 * 750 of the 900 combo pages were generated from a category template. Every
 * one of them carried the same paragraph about the register and the cadence,
 * the same family description, and FAQs drawn from a shared pool. Individually
 * each page passed the word-count floor; together they were one page
 * repeated 750 times, which is exactly the near-duplicate pattern that gets a
 * section of a site de-indexed.
 *
 * What this does
 * --------------
 * It asks a model to write each page with the two emoji records that make up
 * the combo as its only subject matter, so the claims are about that pair
 * rather than about a category. The output is validated before it is written:
 * it has to clear the same thresholds `validate:emojis` enforces, and it has
 * to be free of the shared boilerplate.
 *
 * Combos that cover the same emoji pair as another page are given distinct
 * editorial angles so the two do not say the same thing twice.
 *
 * Usage
 * -----
 *   bun run scripts/regenerate-combo-content.ts --limit 5          # trial run
 *   bun run scripts/regenerate-combo-content.ts --slug 100-fire    # one page
 *   bun run scripts/regenerate-combo-content.ts                     # all templated
 *   bun run scripts/regenerate-combo-content.ts --all               # every combo
 *   bun run scripts/regenerate-combo-content.ts --dry-run --slug X  # show prompt
 *
 * Flags:
 *   --limit N        rewrite at most N combos
 *   --slug S         rewrite one combo by slug
 *   --all            rewrite every combo, including the hand-written ones
 *   --model M        OpenRouter model id (default: claude-haiku-4.5)
 *   --concurrency N  parallel requests (default: 6)
 *   --dry-run        print the prompt and the parsed result, write nothing
 *   --yes            skip the confirmation prompt
 */

import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

import {
  chatWithFallback,
  loadAnthropicConfig,
  loadLlmConfig,
  parseJsonObject,
  type LlmConfig,
} from './combo-content/llm';
import { buildComboBriefs, type EmojiBrief } from './combo-content/emoji-grounding';
import { buildComboPrompt, ANGLES } from './combo-content/prompt';
import { findBoilerplate, countJargon } from './combo-content/boilerplate';
import { validateCombo, validateComboDeepTier } from './validate-emojis';
import type { EmojiCombo, ComboFaq, ComboConversationExample } from '../src/types/combo';

const COMBOS_DIR = path.join(process.cwd(), 'src', 'data', 'combos');

/**
 * The model that writes the pages.
 *
 * Deliberately not the repo's `OPENROUTER_MODEL`: that one is a small, fast
 * model tuned for answering emoji questions in a couple of sentences, and it
 * cannot hold a long piece of prose together. Haiku 4.5 is the cheapest
 * model that writes reference-quality copy.
 */
const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5';

/**
 * The providers the writer talks to, in the order it tries them.
 *
 * The OpenRouter key the site already uses has a monthly spend limit, and a
 * rewrite of this size can exhaust it partway through. Rather than abandon the
 * remaining pages, the writer falls back to the Anthropic-compatible endpoint
 * the environment is configured against.
 */
function buildConfigs(model: string): LlmConfig[] {
  const configs: LlmConfig[] = [];

  try {
    configs.push(loadLlmConfig(model));
  } catch {
    // No OpenRouter key; the fallback below may still be usable.
  }

  const anthropic = loadAnthropicConfig();
  if (anthropic) configs.push(anthropic);

  return configs;
}

/** Word counts the written fields must hit. */
const LIMITS = {
  // Matches the deep-tier floor the repo's validator enforces, so a page the
  // writer produces can never be rejected by `validate:emojis`.
  overviewMin: 120,
  overviewMax: 260,
  sectionMin: 65,
  sectionMax: 150,
  faqCount: 4,
  conversationCount: 5,
};

/** How many jargon words a finished page may carry before it is rejected. */
const MAX_JARGON_HITS = 2;

/**
 * The token budget for one page.
 *
 * The page itself is a couple of thousand tokens, but a hybrid model spends
 * part of its budget reasoning first, so the ceiling has to leave room for
 * that as well as for the answer.
 */
const MAX_OUTPUT_TOKENS = 16000;

/**
 * How many times a draft may be sent back for correction before the combo
 * is left alone.
 */
const MAX_REPAIR_ATTEMPTS = 2;

function parseArgs(argv: string[]) {
  const args = {
    limit: Infinity,
    slug: undefined as string | undefined,
    all: false,
    model: DEFAULT_MODEL,
    concurrency: 6,
    dryRun: false,
    yes: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--slug') args.slug = argv[++i];
    else if (arg === '--all') args.all = true;
    else if (arg === '--model') args.model = argv[++i];
    else if (arg === '--concurrency') args.concurrency = Number(argv[++i]);
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--yes') args.yes = true;
  }
  return args;
}

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/**
 * The prose a reader sees on a combo page, flattened for scanning.
 */
function proseOf(combo: EmojiCombo): string {
  return [
    combo.description ?? '',
    combo.meaning ?? '',
    combo.longForm?.overview ?? '',
    combo.longForm?.howPeopleUseIt ?? '',
    combo.longForm?.whenNotToUse ?? '',
    combo.longForm?.howToReply ?? '',
    ...(combo.longForm?.faqs ?? []).flatMap((f) => [f.question ?? '', f.answer ?? '']),
    ...(combo.conversationExamples ?? []).flatMap((e) => [e.message ?? '', e.interpretation ?? '']),
  ].join('\n');
}

/**
 * A combo still carrying the shared template.
 */
export function isTemplated(combo: EmojiCombo): boolean {
  return findBoilerplate(proseOf(combo)).length > 0;
}

interface WrittenFields {
  description: string;
  meaning: string;
  examples: string[];
  longForm: {
    overview: string;
    howPeopleUseIt: string;
    whenNotToUse: string;
    howToReply: string;
    faqs: ComboFaq[];
  };
  conversationExamples: ComboConversationExample[];
  seoTitle: string;
  seoDescription: string;
}

/**
 * Put a model response into the shape the combo record expects.
 *
 * The prompt shows the target shape, but a model occasionally nests `faqs`
 * beside `longForm` instead of inside it. That is a one-line fix rather than
 * a failed rewrite.
 */
function normalizeWritten(raw: WrittenFields): WrittenFields {
  const longForm = { ...(raw.longForm ?? ({} as WrittenFields['longForm'])) };

  if (!Array.isArray(longForm.faqs) && Array.isArray((raw as any).faqs)) {
    longForm.faqs = (raw as any).faqs;
  }
  if (!Array.isArray(longForm.faqs)) longForm.faqs = [];

  // FAQ questions are search queries, so they read better in sentence case.
  longForm.faqs = longForm.faqs.map((faq) => ({
    question: capitalizeFirst(faq.question ?? ''),
    answer: faq.answer ?? '',
  }));

  return {
    ...raw,
    longForm,
    examples: Array.isArray(raw.examples) ? raw.examples : [],
    conversationExamples: Array.isArray(raw.conversationExamples) ? raw.conversationExamples : [],
  };
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Check a model response against the shape and quality floor we need.
 */
function validateWritten(written: WrittenFields): string[] {
  const errors: string[] = [];

  const requireString = (label: string, value: unknown, min: number, max: number) => {
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${label} is missing`);
      return;
    }
    const words = countWords(value);
    if (words < min) errors.push(`${label} is ${words} words, needs at least ${min}`);
    if (words > max) errors.push(`${label} is ${words} words, needs at most ${max}`);
  };

  requireString('description', written.description, 15, 60);
  requireString('meaning', written.meaning, 25, 90);
  requireString(
    'longForm.overview',
    written.longForm?.overview,
    LIMITS.overviewMin,
    LIMITS.overviewMax
  );
  requireString(
    'longForm.howPeopleUseIt',
    written.longForm?.howPeopleUseIt,
    LIMITS.sectionMin,
    LIMITS.sectionMax
  );
  requireString(
    'longForm.whenNotToUse',
    written.longForm?.whenNotToUse,
    LIMITS.sectionMin,
    LIMITS.sectionMax
  );
  requireString(
    'longForm.howToReply',
    written.longForm?.howToReply,
    LIMITS.sectionMin,
    LIMITS.sectionMax
  );

  if (!Array.isArray(written.examples) || written.examples.length < 3) {
    errors.push('examples needs at least 3 entries');
  } else if (new Set(written.examples).size !== written.examples.length) {
    errors.push('examples contains duplicates');
  }

  const faqs = written.longForm?.faqs;
  if (!Array.isArray(faqs) || faqs.length < LIMITS.faqCount) {
    errors.push(`longForm.faqs needs ${LIMITS.faqCount} entries`);
  } else {
    const questions = faqs.map((f) => f.question?.toLowerCase().trim());
    if (new Set(questions).size !== questions.length)
      errors.push('longForm.faqs has duplicate questions');
    for (const faq of faqs) {
      if (!faq.question?.trim()) errors.push('a faq is missing its question');
      if (!faq.answer?.trim()) errors.push('a faq is missing its answer');
      else if (countWords(faq.answer) < 12) errors.push('a faq answer is too thin');
    }
  }

  const examples = written.conversationExamples;
  if (!Array.isArray(examples) || examples.length < LIMITS.conversationCount) {
    errors.push(`conversationExamples needs ${LIMITS.conversationCount} entries`);
  } else {
    const settings = examples.map((e) => e.setting);
    if (new Set(settings).size !== settings.length) {
      errors.push('conversationExamples repeats a setting');
    }
    const messages = examples.map((e) => e.message?.toLowerCase().trim());
    if (new Set(messages).size !== messages.length) {
      errors.push('conversationExamples repeats a message');
    }
    for (const example of examples) {
      if (!example.message?.trim()) errors.push('a conversation example is missing its message');
      if (!example.interpretation?.trim()) {
        errors.push('a conversation example is missing its interpretation');
      }
    }
  }

  // The whole point of the rewrite: no shared template language survives.
  const prose = proseOf(written as unknown as EmojiCombo);
  const boilerplate = findBoilerplate(prose);
  if (boilerplate.length) {
    errors.push(`carries boilerplate: ${boilerplate.join('; ')}`);
  }
  const jargon = countJargon(prose);
  if (jargon > MAX_JARGON_HITS) {
    errors.push(`uses ${jargon} jargon words (max ${MAX_JARGON_HITS})`);
  }

  return errors;
}

/**
 * Map a model response onto the combo record, keeping the fields the writer
 * does not own.
 */
function mergeIntoCombo(combo: EmojiCombo, written: WrittenFields, today: string): EmojiCombo {
  return {
    ...combo,
    description: written.description.trim(),
    meaning: written.meaning.trim(),
    examples: written.examples.map((e) => e.trim()),
    seoTitle: written.seoTitle.trim(),
    seoDescription: written.seoDescription.trim(),
    longForm: {
      overview: written.longForm.overview.trim(),
      howPeopleUseIt: written.longForm.howPeopleUseIt.trim(),
      whenNotToUse: written.longForm.whenNotToUse.trim(),
      howToReply: written.longForm.howToReply.trim(),
      faqs: written.longForm.faqs.map((f) => ({
        question: f.question.trim(),
        answer: f.answer.trim(),
      })),
    },
    conversationExamples: written.conversationExamples.map((e) => ({
      setting: e.setting,
      message: e.message.trim(),
      interpretation: e.interpretation.trim(),
    })),
    contentTier: 'deep',
    contentUpdatedAt: today,
  };
}

/**
 * Give every combo an angle. Combos that share an emoji pair get different
 * angles so their pages do not collapse into one.
 */
function assignAngles(combos: EmojiCombo[]): Map<string, (typeof ANGLES)[number]> {
  const byPair = new Map<string, EmojiCombo[]>();

  for (const combo of combos) {
    const key = [...combo.emojis].sort().join('+');
    const group = byPair.get(key) ?? [];
    group.push(combo);
    byPair.set(key, group);
  }

  const angles = new Map<string, (typeof ANGLES)[number]>();

  for (const group of byPair.values()) {
    // Highest popularity first, so the most valuable page gets the first and
    // strongest angle.
    const ordered = [...group].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    ordered.forEach((combo, index) => {
      angles.set(combo.slug, ANGLES[index % ANGLES.length]);
    });
  }

  return angles;
}

/**
 * The hand-written pages used as style references.
 *
 * Only a couple of dozen pages in the catalog carry no template language at
 * all, and they are concentrated in a handful of categories. Each category
 * is pointed at the cleanest page in or near it, so the writer is shown the
 * voice it is trying to match rather than one borrowed from a different
 * register.
 */
const STYLE_REFERENCES: Record<string, string> = {
  humor: 'see-no-evil-speak-no-evil',
  sarcasm: 'shrug-upside-down',
  celebration: 'celebrate-hands',
  reaction: 'clap-back',
  relationship: 'hearts-friends',
  emotion: 'sob-broken-heart',
  flirting: 'eggplant-peach',
  food: 'clap-back',
  travel: 'clap-back',
  work: 'celebrate-hands',
  other: 'clap-back',
};

const styleReferenceCache = new Map<string, string | undefined>();

/**
 * Load a hand-written page as a style reference.
 */
function loadStyleReference(slug: string): string | undefined {
  if (styleReferenceCache.has(slug)) return styleReferenceCache.get(slug);

  const referencePath = path.join(COMBOS_DIR, `${slug}.json`);
  let reference: string | undefined;

  if (fs.existsSync(referencePath)) {
    const combo = JSON.parse(fs.readFileSync(referencePath, 'utf-8')) as EmojiCombo;
    if (combo.longForm?.overview) {
      reference = [
        `OVERVIEW:\n${combo.longForm.overview}`,
        `HOW PEOPLE USE IT:\n${combo.longForm.howPeopleUseIt ?? ''}`,
        `WHEN NOT TO USE IT:\n${combo.longForm.whenNotToUse ?? ''}`,
        `HOW TO REPLY:\n${combo.longForm.howToReply ?? ''}`,
      ].join('\n\n');
    }
  }

  styleReferenceCache.set(slug, reference);
  return reference;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const files = fs.readdirSync(COMBOS_DIR).filter((f) => f.endsWith('.json'));
  const allCombos = files.map(
    (file) => JSON.parse(fs.readFileSync(path.join(COMBOS_DIR, file), 'utf-8')) as EmojiCombo
  );

  let targets = allCombos;
  if (!args.all) targets = allCombos.filter(isTemplated);
  if (args.slug) targets = targets.filter((c) => c.slug === args.slug);

  const angles = assignAngles(allCombos);

  console.log(
    `${allCombos.length} combos total · ${allCombos.filter(isTemplated).length} still templated · ${targets.length} selected`
  );

  if (targets.length === 0) {
    console.log('Nothing to rewrite.');
    return;
  }

  if (args.dryRun) {
    const combo = targets[0];
    const { briefs } = buildComboBriefs(combo.emojis, combo.combo);
    const siblings = allCombos
      .filter(
        (c) =>
          c.slug !== combo.slug &&
          [...c.emojis].sort().join('+') === [...combo.emojis].sort().join('+')
      )
      .map((c) => c.name);
    const prompt = buildComboPrompt(combo, briefs, {
      angle: angles.get(combo.slug) ?? ANGLES[0],
      siblings,
      styleReference: loadStyleReference(STYLE_REFERENCES[combo.category] ?? 'clap-back'),
    });
    console.log('\n===== SYSTEM =====\n' + prompt.system);
    console.log('\n===== USER =====\n' + prompt.user);

    const configs = buildConfigs(args.model ?? DEFAULT_MODEL);
    const result = await chatWithFallback(
      configs,
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      { maxTokens: MAX_OUTPUT_TOKENS }
    );
    const parsed = normalizeWritten(parseJsonObject(result.content) as WrittenFields);
    console.log('\n===== RESULT =====\n' + JSON.stringify(parsed, null, 2));
    console.log('\n===== VALIDATION =====\n' + (validateWritten(parsed).join('\n') || 'OK'));
    return;
  }

  if (!args.yes) {
    console.log(
      `\nAbout to rewrite ${targets.length} combo pages with ${args.model ?? 'the default model'}.`
    );
    console.log('Run with --yes to proceed without confirmation.');
    if (!process.stdin.isTTY) {
      console.log('No TTY for confirmation; pass --yes to proceed.');
      return;
    }
    const readline = await import('node:readline/promises');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question('Proceed? (y/N) ');
    rl.close();
    if (!/^y(es)?$/i.test(answer.trim())) {
      console.log('Cancelled.');
      return;
    }
  }

  const configs = buildConfigs(args.model ?? DEFAULT_MODEL);
  if (configs.length === 0) {
    console.error('No LLM provider is configured. Set OPENROUTER_API_KEY in .env.');
    return;
  }
  console.log(`Using ${configs.map((c) => `${c.provider ?? 'openrouter'}:${c.model}`).join(', ')}`);

  const knownSlugs = new Set(allCombos.map((c) => c.slug));
  const today = new Date().toISOString().slice(0, 10);

  let completed = 0;
  let failed = 0;
  let totalCost = 0;
  const failures: Array<{ slug: string; reason: string }> = [];

  const queue = [...targets].slice(0, args.limit);
  const queueTotal = queue.length;

  const worker = async () => {
    for (;;) {
      const combo = queue.shift();
      if (!combo) return;

      try {
        const { briefs } = buildComboBriefs(combo.emojis, combo.combo);
        if (briefs.length === 0) {
          throw new Error('could not resolve either emoji to a catalog record');
        }

        const siblings = allCombos
          .filter(
            (c) =>
              c.slug !== combo.slug &&
              [...c.emojis].sort().join('+') === [...combo.emojis].sort().join('+')
          )
          .map((c) => c.name);

        const prompt = buildComboPrompt(combo, briefs, {
          angle: angles.get(combo.slug) ?? ANGLES[0],
          siblings,
          styleReference: loadStyleReference(STYLE_REFERENCES[combo.category] ?? 'clap-back'),
        });

        const result = await chatWithFallback(
          configs,
          [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
          { maxTokens: MAX_OUTPUT_TOKENS }
        );
        totalCost += result.cost;

        let raw = result.content;
        let written: WrittenFields | null = null;
        let errors: string[] = [];

        // Repair attempts: hand the model its own mistakes and let it fix
        // them. A short overview or a stray boilerplate phrase is a much
        // cheaper thing to correct than to throw away a whole page.
        for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
          try {
            written = normalizeWritten(parseJsonObject(raw) as WrittenFields);
          } catch (error) {
            errors = [
              `the response was not readable JSON: ${
                error instanceof Error ? error.message : String(error)
              }`,
            ];
            break;
          }

          errors = validateWritten(written);
          if (errors.length === 0) break;

          if (attempt === MAX_REPAIR_ATTEMPTS) break;

          const repair = await chatWithFallback(
            configs,
            [
              { role: 'system', content: prompt.system },
              { role: 'user', content: prompt.user },
              { role: 'assistant', content: raw },
              {
                role: 'user',
                content: `That draft did not meet the bar. Fix these problems and return the complete corrected JSON object:\n\n${errors
                  .map((e) => `- ${e}`)
                  .join('\n')}\n\nReturn only the JSON object.`,
              },
            ],
            { maxTokens: MAX_OUTPUT_TOKENS }
          );
          totalCost += repair.cost;

          // Keep the better of the two: if the repair comes back unreadable,
          // fall back to the draft that at least parsed.
          try {
            parseJsonObject(repair.content);
            raw = repair.content;
          } catch {
            // Leave `raw` on the last readable draft.
          }
        }

        if (!written || errors.length) {
          throw new Error(errors.join('; ') || 'the response could not be used');
        }

        const merged = mergeIntoCombo(combo, written, today);

        // The written page has to survive the same checks the repo enforces.
        const validationErrors = [
          ...validateCombo(merged, knownSlugs),
          ...validateComboDeepTier(merged),
        ];
        if (validationErrors.length) {
          throw new Error(validationErrors.map((v) => `[${v.field}] ${v.message}`).join('; '));
        }

        // The catalog is formatted with Prettier, and `format:check` runs in
        // CI over every data file, so the rewrite has to write back the same
        // shape the rest of the catalog uses.
        const formatted = await prettier.format(JSON.stringify(merged, null, 2), {
          parser: 'json',
        });

        fs.writeFileSync(path.join(COMBOS_DIR, `${combo.slug}.json`), formatted);

        completed++;
        if (completed % 10 === 0 || completed + failed === queueTotal) {
          console.log(`  ${completed}/${queueTotal} rewritten · $${totalCost.toFixed(2)}`);
        }
      } catch (error) {
        failed++;
        const reason = error instanceof Error ? error.message : String(error);
        failures.push({ slug: combo.slug, reason });
        console.error(`  ✗ ${combo.slug}: ${reason.slice(0, 200)}`);
      }
    }
  };

  const workers = Array.from({ length: Math.max(1, args.concurrency) }, () => worker());
  await Promise.all(workers);

  console.log(`\nDone. ${completed} rewritten, ${failed} failed, $${totalCost.toFixed(2)} spent.`);

  if (failures.length) {
    console.log('\nFailures:');
    for (const failure of failures) {
      console.log(`  ${failure.slug}: ${failure.reason.slice(0, 300)}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
