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

# Run tests with coverage enforcement (fails if < 100%)
bun run test:coverage

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
- SSG with ISR (Incremental Static Regeneration) for emoji, combo, and category pages (1-hour revalidation)

**Phase 2:** Supabase integration for auth, subscriptions, and history

- Redis caching via Upstash for interpretation results (reduces OpenAI API calls)

### Key Directories

- `src/app/` - Next.js App Router pages with route groups: `(marketing)`, `(emoji)`, `(tools)`, `(auth)`, `(dashboard)`
- `src/components/ui/` - Reusable UI primitives (Radix UI + Tailwind)
- `src/components/layout/` - Layout components (Header, Footer, MobileNav, Breadcrumbs)
- `src/components/emoji/` - Emoji display components
- `src/components/combo/` - Combo display components (ComboHeader)
- `src/components/interpreter/` - AI interpreter tool components
- `src/components/seo/` - SEO components (JSON-LD structured data)
- `src/components/share/` - Share components (ShareButtons for Twitter, Facebook, copy link)
- `src/components/not-found/` - 404 page components (NotFoundSearch)
- `src/hooks/` - Custom React hooks: `useEmojiSearch` (client-side emoji search/filtering), `useRateLimit` (reactive rate limit state), `useStreamingInterpret` (streaming AI interpretation)
- `src/lib/` - Core utilities: `env.ts` (environment config), `emoji-data.ts` (emoji loader), `combo-data.ts` (combo loader), `rate-limit.ts`, `openai.ts` (OpenAI client), `interpreter.ts` (interpreter service), `cache.ts` (Redis caching with Upstash), `theme.ts` (design tokens), `metadata.ts` (site metadata/SEO defaults), `sentry.ts` (error tracking utilities), `analytics.ts` (analytics service for tracking custom events to GA and PostHog)
- `src/data/` - Static JSON emoji data (Phase 1)
- `src/types/` - TypeScript interfaces for Emoji, EmojiCombo, ContextMeaning, etc.
- `scripts/` - Utility scripts including `validate-emojis.ts` for data validation and `check-coverage.ts` for coverage enforcement
- `tests/unit/`, `tests/integration/`, `tests/e2e/` - Test files
- `tests/utils/` - Test utilities: mock factories (`createEmoji`, `createEmojiCombo`, etc.), validation helpers (`isValidEmoji`, `assertValidEmoji`, etc.), and curated fixtures for emojis, combos, and messages

### Data Flow

1. Emoji pages: JSON files → `emoji-data.ts` loader → SSG/ISR pages at `/emoji/[slug]`
2. Combo pages: JSON files → `combo-data.ts` loader → SSG/ISR pages at `/combo/[slug]`
3. Interpreter: User input → `/api/interpret` → `interpreter.ts` service → Redis cache check → OpenAI API (on miss) → `InterpretationResult`
4. Streaming Interpreter: User input → `/api/interpret/stream` → Vercel AI SDK streamText → Progressive text stream
5. Rate limiting (Phase 1): localStorage tracks daily usage count

## Testing Requirements

**99.4%+ line coverage and 99.5%+ function coverage are mandatory.** CI blocks merges if coverage drops below threshold. The slight allowance (vs 100%) accommodates third-party SDK integration code and SSR-specific callbacks (e.g., useSyncExternalStore) that cannot be unit tested without actual service/hydration setup.

- Unit tests: `tests/unit/` - Use `bun:test` with Jest-compatible syntax
- Component tests: Use `@testing-library/react`
- E2E tests: `tests/e2e/` - Playwright
- Run `bun run test` before committing

## Tech Stack

- **Runtime:** Bun 1.x
- **Framework:** Next.js 16.1 (App Router), React 19, TypeScript 5.x
- **Styling:** Tailwind CSS, Radix UI, clsx, tailwind-merge
- **AI:** OpenAI API with Vercel AI SDK
- **Monitoring:** Sentry for error tracking, PostHog for product analytics
- **Database (Phase 2):** Supabase (PostgreSQL + Auth)
- **Caching (Phase 2):** Upstash Redis for interpretation result caching
- **Testing:** Bun test (unit), Playwright (E2E)
