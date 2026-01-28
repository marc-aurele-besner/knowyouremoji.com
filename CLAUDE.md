# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
bun run test

# Run tests in watch mode
bun run test:watch

# Run a single test file
bun test tests/unit/lib/utils.test.ts

# Run E2E tests
bun run test:e2e

# Linting
bun run lint

# Type checking
bun run typecheck

# Validate emoji data files
bun run validate:emojis
```

## Architecture

### Two-Phase Development

**Phase 1 (MVP/Beta):** Static architecture with no database

- All emoji content stored as JSON files in `/src/data/emojis/` and `/src/data/combos/`
- Client-side rate limiting via localStorage (3 free interpretations/day)
- SSG for all emoji pages

**Phase 2:** Supabase integration for auth, subscriptions, and history

### Key Directories

- `src/app/` - Next.js App Router pages with route groups: `(marketing)`, `(emoji)`, `(tools)`, `(auth)`, `(dashboard)`
- `src/components/ui/` - Reusable UI primitives (Radix UI + Tailwind)
- `src/components/layout/` - Layout components (Header, Footer, MobileNav, Breadcrumbs)
- `src/components/emoji/` - Emoji display components
- `src/components/combo/` - Combo display components (ComboHeader)
- `src/components/interpreter/` - AI interpreter tool components
- `src/components/seo/` - SEO components (JSON-LD structured data)
- `src/lib/` - Core utilities: `env.ts` (environment config), `emoji-data.ts` (emoji loader), `combo-data.ts` (combo loader), `rate-limit.ts`, `openai.ts`, `theme.ts` (design tokens)
- `src/data/` - Static JSON emoji data (Phase 1)
- `src/types/` - TypeScript interfaces for Emoji, EmojiCombo, ContextMeaning, etc.
- `scripts/` - Utility scripts including `validate-emojis.ts` for data validation
- `tests/unit/`, `tests/integration/`, `tests/e2e/` - Test files

### Data Flow

1. Emoji pages: JSON files → `emoji-data.ts` loader → SSG pages at `/emoji/[slug]`
2. Combo pages: JSON files → `combo-data.ts` loader → SSG pages at `/combo/[slug]`
3. Interpreter: User input → `/api/interpret` → OpenAI API → streamed response via Vercel AI SDK
4. Rate limiting (Phase 1): localStorage tracks daily usage count

## Testing Requirements

**100% test coverage is mandatory.** CI blocks merges if coverage drops.

- Unit tests: `tests/unit/` - Use `bun:test` with Jest-compatible syntax
- Component tests: Use `@testing-library/react`
- E2E tests: `tests/e2e/` - Playwright
- Run `bun run test` before committing

## Tech Stack

- **Runtime:** Bun 1.x
- **Framework:** Next.js 16.1 (App Router), React 19, TypeScript 5.x
- **Styling:** Tailwind CSS, Radix UI, clsx, tailwind-merge
- **AI:** OpenAI API with Vercel AI SDK
- **Database (Phase 2):** Supabase (PostgreSQL + Auth)
- **Testing:** Bun test (unit), Playwright (E2E)
