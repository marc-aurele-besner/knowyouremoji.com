import { describe, it, expect } from 'bun:test';
import {
  buildLlmsTxt,
  buildLlmsFullTxt,
  LLMS_SITE_SUMMARY,
  LLMS_SITE_DESCRIPTION,
} from '@/lib/llms';
import { getAllEmojis } from '@/lib/emoji-data';
import { getSiteUrl } from '@/lib/metadata';
import { getAllCombos } from '@/lib/combo-data';
import { getPublishedGuides } from '@/lib/guide-data';

const baseUrl = getSiteUrl().replace(/\/$/, '');

describe('buildLlmsTxt', () => {
  const txt = buildLlmsTxt();

  it('starts with the site name as a level-one heading', () => {
    expect(txt.startsWith('# KnowYourEmoji')).toBe(true);
  });

  it('carries the summary as a blockquote directly under the heading', () => {
    expect(txt).toContain(`> ${LLMS_SITE_SUMMARY}`);
  });

  it('includes the prose description', () => {
    expect(txt).toContain(LLMS_SITE_DESCRIPTION.split('\n')[0]);
  });

  it('indexes the emoji, platform, generation, and context sections', () => {
    expect(txt).toContain('## Emoji meanings');
    expect(txt).toContain('## Browse emoji meanings by platform');
    expect(txt).toContain('## Browse emoji meanings by generation');
    expect(txt).toContain('## Browse emoji meanings by context');
  });

  it('indexes the combos and guides sections', () => {
    expect(txt).toContain('## Emoji combinations');
    expect(txt).toContain('## Guides');
  });

  it('indexes the tools, editorial standards, and machine-readable sections', () => {
    expect(txt).toContain('## Tools');
    expect(txt).toContain('## Editorial standards and trust');
    expect(txt).toContain('## Machine-readable content');
  });

  it('links the interpreter, search, and compare tools', () => {
    expect(txt).toContain(`${baseUrl}/interpreter`);
    expect(txt).toContain(`${baseUrl}/search`);
    expect(txt).toContain(`${baseUrl}/compare`);
  });

  it('links every category hub page', () => {
    expect(txt).toContain(`${baseUrl}/emoji/category/faces`);
    expect(txt).toContain(`${baseUrl}/emoji/category/animals`);
  });

  it('links the machine-readable corpus and the sitemap', () => {
    expect(txt).toContain(`${baseUrl}/llms-full.txt`);
    expect(txt).toContain(`${baseUrl}/sitemap.xml`);
  });

  it('never renders a raw protocol-relative or double-slashed URL', () => {
    expect(txt).not.toContain(`${baseUrl}//`);
    expect(txt).not.toContain('](//');
  });

  it('ends with a single trailing newline', () => {
    expect(txt.endsWith('\n')).toBe(true);
    expect(txt.endsWith('\n\n')).toBe(false);
  });
});

describe('buildLlmsFullTxt', () => {
  const txt = buildLlmsFullTxt();
  const emojis = getAllEmojis().filter((emoji) => !emoji.skinToneBase);
  const combos = getAllCombos();
  const guides = getPublishedGuides();

  it('starts with a level-one heading naming the corpus', () => {
    expect(txt.startsWith('# KnowYourEmoji — Full Content')).toBe(true);
  });

  it('reports the corpus counts it contains', () => {
    expect(txt).toContain(`Emoji interpretations: ${emojis.length}`);
    expect(txt).toContain(`Emoji combinations: ${combos.length}`);
    expect(txt).toContain(`Guides: ${guides.length}`);
  });

  it('renders a canonical URL for every emoji it includes', () => {
    for (const emoji of emojis.slice(0, 25)) {
      expect(txt).toContain(`URL: ${baseUrl}/emoji/${emoji.slug}`);
    }
  });

  it('renders the unicode definition and the short interpretation for every emoji', () => {
    for (const emoji of emojis.slice(0, 25)) {
      expect(txt).toContain(`**Unicode definition:** ${emoji.baseMeaning}`);
      expect(txt).toContain(`**In short:** ${emoji.tldr}`);
    }
  });

  it('renders a canonical URL for every combo it includes', () => {
    for (const combo of combos.slice(0, 25)) {
      expect(txt).toContain(`URL: ${baseUrl}/combo/${combo.slug}`);
    }
  });

  it('excludes skin-tone variants, which canonicalize to their base emoji', () => {
    const skinToneBase = getAllEmojis().filter((emoji) => emoji.skinToneBase);
    if (skinToneBase.length === 0) return;

    const first = skinToneBase[0];
    expect(txt).not.toContain(`URL: ${baseUrl}/emoji/${first.slug}`);
  });

  it('renders the guides section with publication metadata', () => {
    expect(txt).toContain('## Guides');
    if (guides.length === 0) return;

    const guide = guides[0];
    expect(txt).toContain(`URL: ${baseUrl}/guides/${guide.slug}`);
    expect(txt).toContain(`Author: ${guide.author}`);
    expect(txt).toContain(`Tags: ${guide.tags.join(', ')}`);
  });

  it('ends with a single trailing newline', () => {
    expect(txt.endsWith('\n')).toBe(true);
    expect(txt.endsWith('\n\n')).toBe(false);
  });
});
