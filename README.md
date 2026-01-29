# KnowYourEmoji.com

> Not what the emoji is supposed to mean, but what the person sending it probably meant.

KnowYourEmoji.com is a context-aware emoji interpretation platform that explains what emojis actually mean in real-world usage, not just their Unicode definitions.

## What We Do

Unlike static emoji dictionaries, KnowYourEmoji.com provides:

- **Social context** - How emojis are used in dating, work, friendships
- **Platform differences** - Meaning variations across iMessage, Instagram, TikTok, Slack
- **Emotional subtext** - Sarcasm, passive-aggression, hidden meanings
- **Cultural & generational nuance** - Gen Z vs Millennial usage, regional differences
- **Red flag detection** - When emoji usage signals something concerning

## Features

### Emoji Detail Pages

Every emoji has a dedicated page with:

- TLDR meaning (human-readable summary)
- Context breakdowns (literal, slang, ironic, passive-aggressive, dating, work)
- Platform-specific meanings
- Generational and cultural notes
- Common emoji combinations
- Warnings and misuse scenarios

### Emoji Combo Pages

Dedicated pages for common emoji sequences like `💀😂` or `🙂👍` with contextual explanations.

### AI Emoji Interpreter Tool

Paste any message and get an AI-powered breakdown including:

- Overall emotional tone
- Intended meaning
- Sarcasm probability
- Passive-aggression indicators
- Red flag detection
- Suggested response tone

**Free tier:** 3 interpretations per day
**Premium:** Unlimited interpretations

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 16.1 (App Router), React 19, TypeScript 5.x
- **Styling:** Tailwind CSS, Radix UI
- **AI:** OpenAI API with Vercel AI SDK
- **Database:** Supabase (Phase 2)
- **Hosting:** Vercel
- **Testing:** Bun test (unit), Playwright (E2E)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.x or later
- Node.js 18+ (for some tooling)

### Installation

```bash
# Clone the repository
git clone https://github.com/marc-aurele-besner/knowyouremoji.com.git
cd knowyouremoji.com

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable                          | Required | Description                        |
| --------------------------------- | -------- | ---------------------------------- |
| `NEXT_PUBLIC_APP_URL`             | No       | App URL (default: localhost:3000)  |
| `NEXT_PUBLIC_APP_NAME`            | No       | App name (default: KnowYourEmoji)  |
| `OPENAI_API_KEY`                  | Yes\*    | OpenAI API key for interpreter     |
| `NEXT_PUBLIC_ENABLE_INTERPRETER`  | No       | Enable interpreter (default: true) |
| `SENTRY_DSN`                      | No       | Sentry DSN for error monitoring    |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | No       | Vercel Analytics ID                |

\*Required if interpreter feature is enabled

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
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Landing, about, pricing pages
│   ├── (emoji)/            # Emoji detail pages
│   ├── (tools)/            # Interpreter tool
│   ├── (auth)/             # Authentication (Phase 2)
│   └── (dashboard)/        # User dashboard (Phase 2)
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── emoji/              # Emoji display components
│   └── interpreter/        # AI interpreter components
├── lib/                    # Core utilities
│   ├── emoji-data.ts       # Data loader
│   ├── rate-limit.ts       # Rate limiting
│   └── openai.ts           # AI integration
├── data/                   # Static JSON emoji data
│   ├── emojis/             # Individual emoji data
│   └── combos/             # Emoji combination data
└── types/                  # TypeScript interfaces

tests/
├── unit/                   # Unit tests
├── integration/            # Integration tests
└── e2e/                    # Playwright E2E tests

scripts/
└── ralph-loop.sh           # Automated AI issue worker
```

## Architecture

### Phase 1: MVP/Beta (Static-First)

- All emoji content stored as JSON files
- Static site generation with ISR (Incremental Static Regeneration) for emoji, combo, and category pages (1-hour revalidation)
- Client-side rate limiting via localStorage
- No database required
- Focus on content quality and SEO

### Phase 2: Growth (Database Integration)

- Supabase integration for auth and subscriptions
- User accounts and interpretation history
- Server-side rate limiting
- Premium subscription via Stripe
- Content management interface

## Deployment

### Vercel Deployment

The project is configured for deployment on Vercel with automatic builds and deployments.

### Custom Domain Setup

To configure the custom domain `knowyouremoji.com`:

1. **Add domain in Vercel Dashboard**
   - Go to your project's Settings → Domains
   - Add `knowyouremoji.com` as the primary domain
   - Add `www.knowyouremoji.com` as an alias (auto-redirects to apex)

2. **Configure DNS at your registrar**
   - For apex domain (`knowyouremoji.com`): Add an `A` record pointing to `76.76.21.21`
   - For www subdomain: Add a `CNAME` record pointing to `cname.vercel-dns.com`

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates via Let's Encrypt
   - HSTS is enabled in `vercel.json` for enhanced security

4. **Verify Configuration**
   - Both domains should resolve to your Vercel deployment
   - `www.knowyouremoji.com` redirects to `knowyouremoji.com` (301)
   - SSL should show as valid with HSTS enabled

## Testing Requirements

**100% test coverage is mandatory.** CI blocks merges if coverage drops.

- Unit tests for all utilities, services, and hooks
- Component tests for all UI components
- Integration tests for all API routes
- E2E tests for all critical user flows

```bash
# Run tests with coverage report
bun run test
```

## Automated Development

This project includes `ralph-loop.sh`, an automated issue worker that:

1. Syncs with main branch
2. Picks the next unassigned issue (by priority)
3. Creates a feature branch
4. Uses AI (Claude or Codex) to implement the solution
5. Validates code (lint, typecheck, tests)
6. Reviews and updates CI/CD workflows
7. Creates a pull request
8. Waits for merge, then loops to next issue

```bash
# Run with Claude Code
./scripts/ralph-loop.sh claude

# Run with Codex
./scripts/ralph-loop.sh codex

# Single issue mode (no loop)
./scripts/ralph-loop.sh claude --single
```

## Contributing

1. Check open issues for available tasks
2. Issues are prioritized: P0 (critical) > P1 (important) > P2 (nice-to-have)
3. All code must have 100% test coverage
4. Follow existing code conventions (see `CLAUDE.md` or `AGENT.md`)
5. PRs require passing CI checks before merge

## Target Audience

**Primary:** 18-40 year olds, heavy messaging users, dating app users, social media enthusiasts

**Secondary:** Workplace communicators, content moderators, social media managers

## Roadmap

- **Phase 1 (MVP):** 500+ emoji pages, 30+ combo pages, working interpreter
- **Phase 2 (Growth):** User accounts, premium subscriptions, interpretation history
- **Phase 3 (Scale):** Public API, localization, B2B offerings

## License

[MIT](LICENSE)

---

Built with context-awareness in mind. Because `🙂` doesn't always mean someone is smiling.
