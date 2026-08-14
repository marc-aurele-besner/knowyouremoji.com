# AGENT.md

This file provides guidance to Codex when working with code in this repository.

## Project Overview

KnowYourEmoji.com is a context-aware emoji interpretation platform. It explains what emojis actually mean in real-world usage (social context, platform differences, generational nuance) rather than Unicode definitions. The project includes an AI-powered message interpreter tool.

## Development Commands

```bash
# Install dependencies
bun install

# Development server
bun dev

# Build (runs tests first)
bun run build

# Run all tests with coverage (100% required)
bun test

# Run tests in watch mode
bun test --watch

# Run a single test file
bun test tests/unit/lib/utils.test.ts

# Run E2E tests
bun run test:e2e

# Linting
bun run lint

# Type checking
bun run typecheck
```

## Architecture

### Two-Phase Development

**Phase 1 (MVP/Beta):** Static architecture with no database

- All emoji content stored as JSON files in `/src/data/emojis/` and `/src/data/combos/`
- Client-side rate limiting via localStorage (3 free interpretations/day)
- SSG for all emoji pages

**Phase 2:** Auth, subscriptions, and history via NextAuth + Neon DB + Resend

### Key Directories

- `src/app/` - Next.js App Router pages with route groups: `(marketing)`, `(emoji)`, `(tools)`, `(auth)`, `(dashboard)`
- `src/components/ui/` - Reusable UI primitives (Radix UI + Tailwind)
- `src/components/emoji/` - Emoji display components
- `src/components/interpreter/` - AI interpreter tool components
- `src/lib/` - Core utilities: `emoji-data.ts` (data loader), `rate-limit.ts`, `openai.ts`
- `src/data/` - Static JSON emoji data (Phase 1)
- `src/types/` - TypeScript interfaces for Emoji, EmojiCombo, ContextMeaning, etc.
- `tests/unit/`, `tests/integration/`, `tests/e2e/` - Test files

### Data Flow

1. Emoji pages: JSON files → `emoji-data.ts` loader → SSG pages at `/emoji/[slug]`
2. Interpreter: User input → `/api/interpret` → OpenAI API → streamed response via Vercel AI SDK
3. Rate limiting (Phase 1): localStorage tracks daily usage count

## Testing Requirements

**100% test coverage is mandatory.** CI blocks merges if coverage drops.

- Unit tests: `tests/unit/` - Use `bun:test` with Jest-compatible syntax
- Component tests: Use `@testing-library/react`
- E2E tests: `tests/e2e/` - Playwright
- Run `bun test` before committing

## Tech Stack

- **Runtime:** Bun 1.x
- **Framework:** Next.js 16.1 (App Router), React 19, TypeScript 5.x
- **Styling:** Tailwind CSS, Radix UI, clsx, tailwind-merge
- **AI:** OpenAI API with Vercel AI SDK
- **Auth:** NextAuth v5 (credentials, Google, GitHub OAuth)
- **Database:** Neon Postgres with Drizzle ORM
- **Email:** Resend for transactional emails
- **Testing:** Bun test (unit), Playwright (E2E)

## Writing guides (`content/guides/*.md`)

Guides are the editorial section of the site (lives at `/guides`). They
are long-form Markdown with YAML frontmatter and exist to prove to
AdSense (and human reviewers) that KnowYourEmoji is a real publisher.
See `src/types/guide.ts` for the typed shape and `src/lib/guide-data.ts`
for the loader. The list below covers voice and structure; both matter
because formulaic, AI-tell prose is the single biggest reason these
posts get flagged as auto-generated.

### Voice rules (read these first)

The goal is prose that reads like a thoughtful friend who happens to
know the emoji vocabulary cold. Not a textbook. Not a press release.
Not a listicle.

**Em-dash budget.** At most 2 em-dashes per guide body. Em-dashes are
the single biggest AI tell on the modern web; if you find yourself
reaching for one, reach for a period, a comma, a parenthesis, or a
colon instead. Long parenthetical asides go in `(parentheses)`, never
in `— em-dashes —`. Use the en-dash `-` only for ranges (e.g.
"2018-2020").

**Forbidden AI tells.** These phrases and patterns trigger the
"auto-generated" reflex in human reviewers. Do not use them:

- "delve", "leverage", "robust", "seamless", "navigate the"
- "It's worth noting", "It's important to note", "It is essential"
- "In conclusion", "Ultimately,", "In summary"
- "Here's the thing", "Here's the deal", "Let me explain"
- "Whether X or Y", repeated three-part lists, parallel "X — Y — Z"
  constructions
- The "not just X, but Y" construction (almost always rewrites better
  as two sentences)
- "The [emoji] is doing specific work", "is the [noun] of [noun]"
  sentence templates that read as a Mad Libs

**Sentence variety.** Vary openings. If two consecutive paragraphs both
start with "The [noun]", restructure one. Mix short punchy sentences
with longer explanatory ones. Sentence fragments are fine as long as
they are intentional.

**Distinct voice per post.** Each guide leads with its own thesis (the
"skull is having a midlife crisis" framing, the "🙏 is a platform
fight" framing, etc.). Do not open five posts in a row with "What does
[emoji] mean in texting?" — the index page reads as templated if you
do. Titles are non-formula: prefer "💀 stopped meaning death somewhere
around 2018" over "What does 💀 mean in 2026?".

**Hedging discipline.** Pick a side. "Some people think X, but others
think Y" is the structure of a Wikipedia stub, not a guide. State the
read. If uncertainty matters, name it ("the safest reading strategy
is..."). Avoid passive voice when active voice works.

### Required structure per guide

The PRD in issue #345 (CONTENT-P1-004) calls for this shape. Every
guide must include:

1. Frontmatter (see template below).
2. Compelling H1-equivalent in the frontmatter `title` field plus a
   1-2 sentence lede in the body that states the thesis.
3. At least 3 H2 sections covering: the shift or origin, how to read
   it in different contexts, when it misfires.
4. At least 5 concrete message examples (real or plausible sentences
   the user might actually receive, formatted as quotes).
5. A "common mistakes" / failure-mode section (named whatever fits the
   post — "Where 🙏 reliably fails", "Where 💅 sharpens into a problem",
   etc.).
6. A reply / safe-alternative section that recommends specific
   follow-up emojis or combos.
7. At least 3 internal links to emoji pages (`/emoji/<slug>`) and at
   least 1 internal link to a combo page (`/combo/<slug>`). Use
   combo pages to disambiguate; don't link to combinations that
   don't exist in `src/data/combos/`.
8. Optional FAQ (3-5 questions, "What does X mean on TikTok?"-style)
   for SEO long-tail. Skip it for posts where the body already
   covers the questions.

### Frontmatter template

```yaml
---
title: <non-formula thesis, not "What does X mean in 2026?">
slug: <kebab-case, must match filename>
description: <1 sentence, ≤160 chars, with the emotional hook>
publishedAt: <ISO date>
updatedAt: <ISO date>
author: KnowYourEmoji Editorial
tags: [gen-z, slang, <2-4 more>]
relatedEmojis: [<at least 3 emoji slugs that exist in src/data/emojis/>]
relatedCombos: [<at least 1 combo slug that exists in src/data/combos/>]
heroEmoji: <single emoji glyph>
readingTimeMinutes: <5-9>
seoTitle: <≤60 chars>
seoDescription: <≤160 chars>
draft: false
---
```

### Internal-link sanity check

Before committing, verify every slug you link to resolves:

```bash
bun run -e "
import { getAllGuides } from './src/lib/guide-data';
import { getEmojiBySlug } from './src/lib/emoji-data';
import { getComboBySlug } from './src/lib/combo-data';
for (const g of getAllGuides()) {
  for (const e of g.relatedEmojis ?? []) if (!getEmojiBySlug(e)) console.log('MISSING emoji', g.slug, '->', e);
  for (const c of g.relatedCombos ?? []) if (!getComboBySlug(c)) console.log('MISSING combo', g.slug, '->', c);
}
"
```

### Workflow

1. Claim the topic in the checklist (issue #345) or in a fresh
   issue if a new editorial pillar opens up.
2. Draft in `content/guides/<slug>.md` against this template.
3. Editor pass: read aloud once, count em-dashes, remove AI tells.
4. Cross-link at least 3 emoji slugs and 1 combo slug in
   frontmatter and inline.
5. `bun run test` (coverage must stay above the project thresholds
   even though the loader is exercised through existing tests) and
   `bunx prettier --check content/guides/*.md`.
6. Commit, push, open PR against `main`. Keep PRs to batches of 3-5
   guides when possible.

### Acceptance criteria (matches the issue)

- 20+ guides live, linked from `/guides` and the homepage.
- Each guide is substantively unique (not a thin listicle of glyphs).
- Internal linking graph connects guides to emoji + combo pages.
