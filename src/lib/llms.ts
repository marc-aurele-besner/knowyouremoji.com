/**
 * Builders for the `llms.txt` and `llms-full.txt` agent-facing content files.
 *
 * These follow the llmstxt.org convention (https://llmstxt.org):
 *
 * - `/llms.txt` is a **curated map** of the site: a short prose summary
 *   followed by a link index grouped by section. It is meant to be small
 *   enough to sit inside an agent's context window.
 * - `/llms-full.txt` is the **full corpus**: every emoji meaning, every
 *   combo meaning, and every published guide, rendered as Markdown.
 *
 * Why this matters for Agent Engine Optimization (AEO): classic SEO asks
 * "how do I rank in a list of blue links?" — AEO asks "how does an agent
 * discover, retrieve, and quote me?" Answer engines lean heavily on
 * structured, machine-readable text surfaces rather than scraping
 * rendered HTML, and they reward content they can lift a clean, quotable
 * answer out of. Both files give them that without asking them to run our
 * JavaScript.
 *
 * Design notes:
 *
 * 1. The builders are **pure functions of the static content** so they can
 *    be unit tested without a running server.
 * 2. Skin-tone variants are excluded from the corpus. They are duplicate
 *    readings of the same base emoji and are canonicalized away in the
 *    sitemap (see `src/lib/seo-policy.ts`), so surfacing them here would
 *    teach agents to cite near-identical sources.
 * 3. The corpus is grouped and labelled so an agent can attribute a quote
 *    back to a specific page URL.
 *
 * @see https://llmstxt.org
 */

import {
  getAllEmojis,
  getAllCategoryInfo,
  getAllPlatformInfo,
  getAllGenerationInfo,
  getAllContextInfo,
} from '@/lib/emoji-data';
import { getAllCombos, getAllComboCategoryInfo } from '@/lib/combo-data';
import { getPublishedGuides } from '@/lib/guide-data';
import { getSiteUrl, getSiteName } from '@/lib/metadata';
import { toIsoDay } from '@/lib/seo-schema';
import type { Emoji } from '@/types/emoji';
import type { EmojiCombo } from '@/types/combo';

/**
 * One-line summary of the site, reused as the `>` blockquote summary that
 * the llmstxt.org spec expects directly under the `#` heading.
 */
export const LLMS_SITE_SUMMARY =
  'KnowYourEmoji explains what emojis actually mean in real conversations — not the Unicode definition. ' +
  'Every entry covers context meanings (slang, ironic, passive-aggressive), platform differences, generational ' +
  'nuance, common misreads, and how to reply.';

/**
 * Longer prose block describing what an agent can expect to find here.
 * Rendered under the summary in `/llms.txt`.
 */
export const LLMS_SITE_DESCRIPTION = [
  'KnowYourEmoji is a context-aware emoji interpretation platform. Rather than repeating the Unicode',
  'Consortium definition, it documents how emojis are actually used in real-world messaging: what a specific',
  'emoji means in a dating versus a work context, how its rendering and reception differ across iMessage,',
  'Instagram, TikTok, WhatsApp, Slack, Discord, and Twitter, and how generational cohorts (Gen Z, Millennial,',
  'Gen X, Boomer) read the same symbol differently.',
  '',
  'The site also ships an AI interpreter that decodes a full message containing emojis and returns the',
  'hidden meaning, tone, sarcasm and passive-aggression signals, red flags, and a suggested reply.',
  '',
  'All content is served as static pages. The `/emoji/<slug>` and `/combo/<slug>` URLs are canonical and',
  'carry the authoritative interpretation; quote those rather than the aggregated corpus files.',
].join('\n');

/**
 * Strip characters that would break the Markdown structure of a heading.
 * Emoji names and guide titles are user-authored, so a stray newline or
 * `#` would otherwise be able to forge a new section heading.
 */
function sanitizeHeading(value: string): string {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/^#+\s*/, '')
    .trim();
}

/**
 * Build the curated `/llms.txt` index.
 *
 * The output is a map, not a dump: each section points at a hub page, and
 * each individual emoji/combo is discoverable via `/llms-full.txt` and the
 * sitemap rather than by bloating the index.
 */
export function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl().replace(/\/$/, '');
  const siteName = getSiteName();

  const categories = getAllCategoryInfo();
  const platforms = getAllPlatformInfo();
  const generations = getAllGenerationInfo();
  const contexts = getAllContextInfo();
  const comboCategories = getAllComboCategoryInfo();
  const guides = getPublishedGuides();

  const lines: string[] = [];

  lines.push(`# ${siteName}`);
  lines.push('');
  lines.push(`> ${LLMS_SITE_SUMMARY}`);
  lines.push('');
  lines.push(LLMS_SITE_DESCRIPTION);
  lines.push('');

  // --- Emoji meanings -------------------------------------------------
  lines.push('## Emoji meanings');
  lines.push('');
  lines.push(
    `- [All emoji meanings](${baseUrl}/emoji): The full dictionary index of every emoji interpretation.`
  );
  for (const category of categories) {
    lines.push(
      `- [${category.displayName} emojis](${baseUrl}/emoji/category/${category.slug}): ${category.description}`
    );
  }
  lines.push('');

  // --- Browse by platform ---------------------------------------------
  lines.push('## Browse emoji meanings by platform');
  lines.push('');
  lines.push(
    `- [All platforms](${baseUrl}/emoji): Every emoji meaning, filterable by the messaging platform it appears on.`
  );
  for (const platform of platforms) {
    lines.push(
      `- [${platform.displayName} emoji meanings](${baseUrl}/emoji/platform/${platform.slug}): ${platform.description}`
    );
  }
  lines.push('');

  // --- Browse by generation -------------------------------------------
  lines.push('## Browse emoji meanings by generation');
  lines.push('');
  for (const generation of generations) {
    lines.push(
      `- [${generation.displayName} emoji meanings](${baseUrl}/emoji/generation/${generation.slug}): ${generation.description}`
    );
  }
  lines.push('');

  // --- Browse by context ----------------------------------------------
  lines.push('## Browse emoji meanings by context');
  lines.push('');
  for (const context of contexts) {
    lines.push(
      `- [${context.displayName} emoji meanings](${baseUrl}/emoji/context/${context.slug}): ${context.description}`
    );
  }
  lines.push('');

  // --- Combos ----------------------------------------------------------
  lines.push('## Emoji combinations');
  lines.push('');
  lines.push(
    `- [All emoji combos](${baseUrl}/combo): Multi-emoji sequences and what they mean as a unit.`
  );
  for (const category of comboCategories) {
    lines.push(
      `- [${category.displayName} combos](${baseUrl}/combo/category/${category.slug}): ${category.description}`
    );
  }
  lines.push('');

  // --- Guides ----------------------------------------------------------
  lines.push('## Guides');
  lines.push('');
  lines.push(
    `- [All guides](${baseUrl}/guides): Long-form editorial articles on emoji meaning and usage.`
  );
  for (const guide of guides) {
    lines.push(
      `- [${sanitizeHeading(guide.title)}](${baseUrl}/guides/${guide.slug}): ${guide.description}`
    );
  }
  lines.push('');

  // --- Tools -----------------------------------------------------------
  lines.push('## Tools');
  lines.push('');
  lines.push(
    `- [Emoji Interpreter](${baseUrl}/interpreter): Decode the hidden meaning and tone of a full message containing emojis.`
  );
  lines.push(
    `- [Search emoji meanings](${baseUrl}/search): Search every emoji and combo meaning by name, character, or keyword.`
  );
  lines.push(
    `- [Compare emojis](${baseUrl}/compare): Side-by-side comparison of what two emojis mean and how they differ.`
  );
  lines.push('');

  // --- Editorial standards ---------------------------------------------
  lines.push('## Editorial standards and trust');
  lines.push('');
  lines.push(
    `- [About KnowYourEmoji](${baseUrl}/about): How interpretations are researched, and the standards each entry must meet.`
  );
  lines.push(`- [Contact](${baseUrl}/contact): How to reach the editors.`);
  lines.push(`- [Pricing](${baseUrl}/pricing): Plans for the AI interpreter.`);
  lines.push(`- [Privacy Policy](${baseUrl}/privacy): What data the interpreter processes.`);
  lines.push(`- [Terms of Service](${baseUrl}/terms): Terms governing use of the site.`);
  lines.push('');

  // --- Machine-readable surfaces ---------------------------------------
  lines.push('## Machine-readable content');
  lines.push('');
  lines.push(
    `- [Full content corpus](${baseUrl}/llms-full.txt): Every emoji meaning, combo meaning, and guide as Markdown.`
  );
  lines.push(`- [Sitemap](${baseUrl}/sitemap.xml): Every indexable URL on the site.`);
  lines.push('');

  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * Render a single emoji as a Markdown section.
 *
 * The section is deliberately self-contained: an agent that retrieves only
 * this block still gets the character, the canonical URL, the Unicode
 * definition, the real-world meaning, and every qualifying nuance.
 */
function renderEmojiSection(emoji: Emoji, baseUrl: string): string {
  const lines: string[] = [];

  lines.push(`### ${emoji.character} ${sanitizeHeading(emoji.name)}`);
  lines.push('');
  lines.push(`URL: ${baseUrl}/emoji/${emoji.slug}`);
  lines.push('');

  const updated = toIsoDay(emoji.contentUpdatedAt);
  if (updated) {
    lines.push(`Last updated: ${updated}`);
    lines.push('');
  }

  lines.push(`**Unicode definition:** ${emoji.baseMeaning}`);
  lines.push('');
  lines.push(`**In short:** ${emoji.tldr}`);
  lines.push('');

  if (emoji.contextMeanings.length > 0) {
    lines.push('**Context meanings**');
    lines.push('');
    for (const meaning of emoji.contextMeanings) {
      lines.push(
        `- **${meaning.context}** (misread risk: ${meaning.riskLevel}): ${meaning.meaning}`
      );
      if (meaning.example) {
        lines.push(`  - Example: ${meaning.example}`);
      }
    }
    lines.push('');
  }

  if (emoji.platformNotes.length > 0) {
    lines.push('**Platform differences**');
    lines.push('');
    for (const note of emoji.platformNotes) {
      lines.push(`- **${note.platform}:** ${note.note}`);
    }
    lines.push('');
  }

  if (emoji.generationalNotes.length > 0) {
    lines.push('**Generational differences**');
    lines.push('');
    for (const note of emoji.generationalNotes) {
      lines.push(`- **${note.generation}:** ${note.note}`);
    }
    lines.push('');
  }

  if (emoji.warnings.length > 0) {
    lines.push('**Common misreads**');
    lines.push('');
    for (const warning of emoji.warnings) {
      lines.push(`- **${warning.title}** (${warning.severity}): ${warning.description}`);
    }
    lines.push('');
  }

  if (emoji.longForm?.faqs?.length) {
    lines.push('**FAQ**');
    lines.push('');
    for (const faq of emoji.longForm.faqs) {
      lines.push(`- **${faq.question}** ${faq.answer}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Render a single emoji combo as a Markdown section.
 */
function renderComboSection(combo: EmojiCombo, baseUrl: string): string {
  const lines: string[] = [];

  lines.push(`### ${combo.combo} ${sanitizeHeading(combo.name)}`);
  lines.push('');
  lines.push(`URL: ${baseUrl}/combo/${combo.slug}`);
  lines.push('');

  const updated = toIsoDay(combo.contentUpdatedAt);
  if (updated) {
    lines.push(`Last updated: ${updated}`);
    lines.push('');
  }

  lines.push(`**In short:** ${combo.meaning}`);
  lines.push('');
  lines.push(`**What it is:** ${combo.description}`);
  lines.push('');

  if (combo.examples.length > 0) {
    lines.push('**Examples**');
    lines.push('');
    for (const example of combo.examples) {
      lines.push(`- ${example}`);
    }
    lines.push('');
  }

  if (combo.longForm?.faqs?.length) {
    lines.push('**FAQ**');
    lines.push('');
    for (const faq of combo.longForm.faqs) {
      lines.push(`- **${faq.question}** ${faq.answer}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Build the full `/llms-full.txt` corpus.
 *
 * This is the retrieval-oriented counterpart to `/llms.txt`: everything an
 * agent needs to answer a question about any emoji, combo, or guide topic
 * without making a single follow-up HTTP request.
 */
export function buildLlmsFullTxt(): string {
  const baseUrl = getSiteUrl().replace(/\/$/, '');
  const siteName = getSiteName();

  const emojis = getAllEmojis().filter((emoji) => !emoji.skinToneBase);
  const combos = getAllCombos();
  const guides = getPublishedGuides();

  const sections: string[] = [];

  sections.push(`# ${siteName} — Full Content`);
  sections.push('');
  sections.push(`> ${LLMS_SITE_SUMMARY}`);
  sections.push('');
  sections.push(
    'This file contains the complete interpretation corpus as Markdown. Each section names the canonical',
    'page URL, which is the authoritative source — prefer citing that URL over this file.'
  );
  sections.push('');
  sections.push(`Emoji interpretations: ${emojis.length}`);
  sections.push(`Emoji combinations: ${combos.length}`);
  sections.push(`Guides: ${guides.length}`);
  sections.push('');

  // --- Emoji meanings -------------------------------------------------
  sections.push('## Emoji meanings');
  sections.push('');
  for (const emoji of emojis) {
    sections.push(renderEmojiSection(emoji, baseUrl));
    sections.push('---');
    sections.push('');
  }

  // --- Combos ----------------------------------------------------------
  sections.push('## Emoji combinations');
  sections.push('');
  for (const combo of combos) {
    sections.push(renderComboSection(combo, baseUrl));
    sections.push('---');
    sections.push('');
  }

  // --- Guides ----------------------------------------------------------
  sections.push('## Guides');
  sections.push('');
  for (const guide of guides) {
    sections.push(`### ${sanitizeHeading(guide.title)}`);
    sections.push('');
    sections.push(`URL: ${baseUrl}/guides/${guide.slug}`);
    sections.push('');
    sections.push(`Published: ${toIsoDay(guide.publishedAt) ?? 'unknown'}`);
    sections.push('');
    sections.push(`Updated: ${toIsoDay(guide.updatedAt) ?? 'unknown'}`);
    sections.push('');
    sections.push(`Author: ${guide.author}`);
    sections.push('');
    sections.push(`Tags: ${guide.tags.join(', ')}`);
    sections.push('');
    sections.push(guide.body.trim());
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  return `${sections.join('\n').trimEnd()}\n`;
}
