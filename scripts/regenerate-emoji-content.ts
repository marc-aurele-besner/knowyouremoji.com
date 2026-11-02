#!/usr/bin/env bun
/**
 * Rewrites the templated emoji pages with prose grounded in the guides.
 *
 * Why this exists
 * ---------------
 * 1,011 emoji pages still carry the batch template's language: the same
 * clause in the overview, the same clause in the FAQ answers, and a
 * "-coded" compound sprayed through the long-form. They are noindexed and
 * kept out of the sitemap (see `src/lib/seo-policy.ts` and
 * `src/lib/sitemap-entries.ts`), but that only stops them from hurting the
 * site's rankings — it does not give the readers who land on them anything
 * to read.
 *
 * The problem with rewriting all of them is that most are obscure
 * glyphs nobody searches for. Spending the budget on them would produce
 * a thousand distinct pages nobody ever visits, which is the same doorway-page
 * pattern with better spelling.
 *
 * What this does
 * --------------
 * It rewrites the emoji people actually arrive for: the ones the site's
 * guides already cover. The guides are hand-written articles about what
 * particular emoji mean in real conversations, and they are the only place
 * in the repo where that specific knowledge exists — a page about 🤡 can be
 * written from what the guide says about 🤡, but not from the catalog
 * record, which only knows that 🤡 is a "clown face" in the "smileys &
 * emotion" family.
 *
 * The writer is therefore grounded in the guide prose, and the catalog
 * record supplies only what a guide cannot know (the Unicode name, the
 * codepoint, the category). The output is validated before it is written:
 * it has to clear the same thresholds `validate:emojis` enforces, it has to
 * be free of the template markers, and it has to be free of the abstract
 * vocabulary the old template leaned on.
 *
 * Usage
 * -----
 *   bun run scripts/regenerate-emoji-content.ts --limit 5          # trial run
 *   bun run scripts/regenerate-emoji-content.ts --slug skull       # one page
 *   bun run scripts/regenerate-emoji-content.ts                     # all covered
 *   bun run scripts/regenerate-emoji-content.ts --dry-run --slug X  # show prompt
 *
 * Flags:
 *   --limit N        rewrite at most N pages
 *   --slug S         rewrite one page by slug
 *   --model M        OpenRouter model id (default: anthropic/claude-haiku-4.5)
 *   --fallback-model M  model id for the Anthropic-compatible endpoint
 *   --concurrency N  parallel requests (default: 4)
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
  type ChatMessage,
  type LlmConfig,
} from './combo-content/llm';
import { buildEmojiGrounding, loadGuides } from './emoji-content/guide-grounding';
import { buildEmojiPrompt, ANGLES } from './emoji-content/prompt';
import {
  mergeIntoEmoji,
  normalizeWritten,
  validateWritten,
  type WrittenEmoji,
} from './emoji-content/validate';
import { isEmojiTemplated } from '../src/lib/emoji-boilerplate';
import { getAllEmojis } from '../src/lib/emoji-data';
import type { Emoji } from '../src/types/emoji';

const EMOJIS_DIR = path.join(process.cwd(), 'src', 'data', 'emojis');

/**
 * Where the raw completions of failed pages are kept, so a failure can be
 * diagnosed without paying for the request again.
 */
const FAILED_DIR = path.join(process.cwd(), '.emoji-content-failed');

/**
 * The model that writes the pages.
 *
 * The repo's `OPENROUTER_MODEL` is a small, fast model tuned for answering
 * emoji questions in a couple of sentences, and it cannot hold a long
 * piece of prose together. This one can.
 */
const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5';

/**
 * The providers the writer talks to, in the order it tries them.
 *
 * The OpenRouter key the site already uses has a monthly spend limit, and a
 * rewrite of this size can exhaust it partway through. Rather than abandon
 * the remaining pages, the writer falls back to the Anthropic-compatible
 * endpoint the environment is configured against.
 *
 * The fallback speaks a different model namespace, so it is given its own
 * model id rather than the OpenRouter one: `--model anthropic/...` means
 * nothing to the fallback endpoint. The fallback keeps whatever the
 * environment configures unless `--fallback-model` says otherwise.
 */
function buildConfigs(model: string, fallbackModel?: string): LlmConfig[] {
  const configs: LlmConfig[] = [];

  try {
    configs.push(loadLlmConfig(model));
  } catch {
    // No OpenRouter key; the fallback below may still be usable.
  }

  const anthropic = loadAnthropicConfig(fallbackModel);
  if (anthropic) configs.push(anthropic);

  return configs;
}

/**
 * The token budget for one page.
 *
 * The page itself is a couple of thousand tokens, but a hybrid model spends
 * part of its budget reasoning first, so the ceiling has to leave room for
 * that as well as for the answer.
 */
const MAX_OUTPUT_TOKENS = 16000;

/**
 * How many times a draft may be sent back for correction before the page is
 * left alone.
 */
const MAX_REPAIR_ATTEMPTS = 2;

function parseArgs(argv: string[]) {
  const args = {
    limit: Infinity,
    slug: undefined as string | undefined,
    model: DEFAULT_MODEL,
    fallbackModel: undefined as string | undefined,
    concurrency: 4,
    dryRun: false,
    yes: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--limit') args.limit = Number(argv[++i]);
    else if (arg === '--slug') args.slug = argv[++i];
    else if (arg === '--model') args.model = argv[++i];
    else if (arg === '--fallback-model') args.fallbackModel = argv[++i];
    else if (arg === '--concurrency') args.concurrency = Number(argv[++i]);
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--yes') args.yes = true;
  }
  return args;
}

/**
 * The style reference the writer is shown.
 *
 * `skull` is the page the site wrote by hand, and it is the closest thing
 * to a house style the repo has.
 */
const STYLE_REFERENCE_SLUG = 'skull';

let styleReferenceCache: string | undefined;

/**
 * Load the hand-written page as a style reference.
 */
function loadStyleReference(slug = STYLE_REFERENCE_SLUG): string | undefined {
  if (styleReferenceCache !== undefined) return styleReferenceCache;

  const referencePath = path.join(EMOJIS_DIR, `${slug}.json`);
  let reference: string | undefined;

  if (fs.existsSync(referencePath)) {
    const emoji = JSON.parse(fs.readFileSync(referencePath, 'utf-8')) as Emoji;
    if (emoji.longForm?.overview) {
      reference = [
        `OVERVIEW:\n${emoji.longForm.overview}`,
        `HOW PEOPLE USE IT:\n${emoji.longForm.howPeopleUseIt ?? ''}`,
        `WHEN NOT TO USE IT:\n${emoji.longForm.whenNotToUse ?? ''}`,
        `HOW TO REPLY:\n${emoji.longForm.howToReply ?? ''}`,
      ].join('\n\n');
    }
  }

  styleReferenceCache = reference;
  return reference;
}

/**
 * Give every target page an angle.
 *
 * Emoji that sit in the same family get different angles so their pages do
 * not collapse into one. The assignment is by catalog order, which is stable
 * across runs.
 */
export function assignAngles(emojis: Emoji[]): Map<string, (typeof ANGLES)[number]> {
  const byFamily = new Map<string, Emoji[]>();

  for (const emoji of emojis) {
    const key = emoji.subcategory ?? emoji.category;
    const group = byFamily.get(key) ?? [];
    group.push(emoji);
    byFamily.set(key, group);
  }

  const angles = new Map<string, (typeof ANGLES)[number]>();

  for (const group of byFamily.values()) {
    group.forEach((emoji, index) => {
      angles.set(emoji.slug, ANGLES[index % ANGLES.length]);
    });
  }

  return angles;
}

/**
 * The pages this run is allowed to rewrite.
 *
 * Only the templated pages that a guide covers: a page the guides say
 * nothing about has no source material, and writing one would mean
 * inventing its claims.
 */
export function selectTargets(emojis: Emoji[], guides = loadGuides()): Emoji[] {
  const guideSlugs = new Set<string>();
  for (const guide of guides) {
    for (const slug of guide.relatedEmojis) guideSlugs.add(slug);
  }

  return emojis.filter((emoji) => {
    if (!isEmojiTemplated(emoji)) return false;
    if (emoji.skinToneBase) return false;
    if (!buildEmojiGrounding(emoji, guides)) return false;
    // A guide that lists the emoji in its frontmatter counts as coverage
    // even when the glyph never appears in the body.
    return guideSlugs.has(emoji.slug) || guideCoversBody(emoji, guides);
  });
}

/**
 * Whether any guide body mentions the emoji's glyph.
 */
function guideCoversBody(emoji: Emoji, guides = loadGuides()): boolean {
  return guides.some((guide) => guide.body.includes(emoji.character));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const guides = loadGuides();
  const allEmojis = getAllEmojis();
  const templated = allEmojis.filter(isEmojiTemplated);
  let targets = selectTargets(allEmojis, guides);
  if (args.slug) targets = targets.filter((emoji) => emoji.slug === args.slug);

  const angles = assignAngles(allEmojis);

  console.log(
    `${allEmojis.length} emoji total · ${templated.length} still templated · ${targets.length} covered by a guide and selected`
  );

  if (targets.length === 0) {
    console.log('Nothing to rewrite.');
    return;
  }

  if (args.dryRun) {
    const emoji = targets[0];
    const grounding = buildEmojiGrounding(emoji, guides);
    if (!grounding) {
      console.error('No grounding for this emoji.');
      return;
    }
    const prompt = buildEmojiPrompt(emoji, grounding, {
      angle: angles.get(emoji.slug) ?? ANGLES[0],
      styleReference: loadStyleReference(),
    });
    console.log('\n===== SYSTEM =====\n' + prompt.system);
    console.log('\n===== USER =====\n' + prompt.user);

    const configs = buildConfigs(args.model, args.fallbackModel);
    const result = await chatWithFallback(
      configs,
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      { maxTokens: MAX_OUTPUT_TOKENS }
    );
    const parsed = normalizeWritten(parseJsonObject(result.content) as WrittenEmoji);
    console.log('\n===== RESULT =====\n' + JSON.stringify(parsed, null, 2));
    console.log(
      '\n===== VALIDATION =====\n' +
        (validateWritten(parsed, emoji.slug)
          .map((issue) => `${issue.field}: ${issue.message}`)
          .join('\n') || 'OK')
    );
    return;
  }

  if (!args.yes) {
    console.log(`\nAbout to rewrite ${targets.length} emoji pages with ${args.model}.`);
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

  const configs = buildConfigs(args.model, args.fallbackModel);
  if (configs.length === 0) {
    console.error('No LLM provider is configured. Set OPENROUTER_API_KEY in .env.');
    return;
  }
  console.log(`Using ${configs.map((c) => `${c.provider ?? 'openrouter'}:${c.model}`).join(', ')}`);

  const today = new Date().toISOString().slice(0, 10);

  let completed = 0;
  let failed = 0;
  let totalCost = 0;
  const failures: Array<{ slug: string; reason: string }> = [];

  const queue = [...targets].slice(0, args.limit);
  const queueTotal = queue.length;

  const worker = async () => {
    for (;;) {
      const emoji = queue.shift();
      if (!emoji) return;

      try {
        const grounding = buildEmojiGrounding(emoji, guides);
        if (!grounding) {
          throw new Error('no guide covers this emoji');
        }

        const prompt = buildEmojiPrompt(emoji, grounding, {
          angle: angles.get(emoji.slug) ?? ANGLES[0],
          styleReference: loadStyleReference(),
        });

        let written: WrittenEmoji | null = null;
        let lastIssues: string[] = [];

        for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt += 1) {
          const messages: ChatMessage[] = [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ];

          if (attempt > 0) {
            messages.push({
              role: 'assistant',
              content: JSON.stringify(written),
            });
            messages.push({
              role: 'user',
              content:
                `That draft does not meet the requirements:\n${lastIssues.join('\n')}\n\n` +
                `Rewrite the whole thing, fixing every problem listed above. Return the same JSON shape, ` +
                `and do not repeat the same mistakes.`,
            });
          }

          const result = await chatWithFallback(configs, messages, {
            maxTokens: MAX_OUTPUT_TOKENS,
          });
          totalCost += result.cost;

          written = normalizeWritten(parseJsonObject(result.content) as WrittenEmoji);
          const issues = validateWritten(written, emoji.slug);

          if (issues.length === 0) break;

          lastIssues = issues.map((issue) => `${issue.field}: ${issue.message}`);
          if (attempt === MAX_REPAIR_ATTEMPTS) {
            // The raw completion is kept so a failure can be diagnosed
            // without re-running the request.
            const dumpPath = path.join(FAILED_DIR, `${emoji.slug}.json`);
            fs.mkdirSync(FAILED_DIR, { recursive: true });
            fs.writeFileSync(dumpPath, result.content);
            throw new Error(`${lastIssues.join('; ')} (raw output in ${dumpPath})`);
          }
        }

        if (!written) throw new Error('no completion produced');

        const merged = mergeIntoEmoji(emoji, written, today);

        // The catalog is formatted with Prettier, and `format:check` runs in
        // CI over every data file, so the rewrite has to write back the same
        // shape the rest of the catalog uses.
        const formatted = await prettier.format(JSON.stringify(merged, null, 2), {
          parser: 'json',
        });

        fs.writeFileSync(path.join(EMOJIS_DIR, `${emoji.slug}.json`), formatted);

        completed += 1;
        if (completed % 10 === 0 || completed + failed === queueTotal) {
          console.log(`  ${completed}/${queueTotal} rewritten · $${totalCost.toFixed(2)}`);
        }
      } catch (error) {
        failed += 1;
        const reason = error instanceof Error ? error.message : String(error);
        failures.push({ slug: emoji.slug, reason });
        console.error(`  ✗ ${emoji.slug}: ${reason.slice(0, 200)}`);
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

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
