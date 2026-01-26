# KnowYourEmoji.com - Technical Specification

**Version:** 1.0
**Based on:** MasterDocument.md v1.0

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Data Models](#4-data-models)
5. [Feature Breakdown & Tickets](#5-feature-breakdown--tickets)
6. [API Routes](#6-api-routes)
7. [Components](#7-components)
8. [Pages](#8-pages)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [Environment Variables](#10-environment-variables)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment](#12-deployment)

---

## 1. Project Overview

### 1.1 Purpose

A context-aware emoji interpretation platform that explains what emojis mean in real-world usage, with AI-powered message interpretation.

### 1.2 Architecture Philosophy

**Phase 1 (MVP/Beta):** Fully static architecture
- No database required
- All content as version-controlled JSON files
- Client-side rate limiting
- Fastest possible page loads
- 100% test coverage from day one

**Phase 2 (Growth):** Database integration with Supabase
- User authentication
- Subscription management
- Interpretation history
- Server-side rate limiting

### 1.3 Core Features

**Phase 1:**
- Emoji detail pages with contextual meanings (static)
- Emoji combo pages (static)
- AI-powered emoji interpreter tool
- SEO-optimized static pages
- Client-side search

**Phase 2:**
- User accounts and authentication
- Premium subscription system
- Interpretation history
- Content admin interface

---

## 2. Tech Stack

### 2.1 Runtime & Package Manager

| Technology | Version | Purpose |
|------------|---------|---------|
| Bun | 1.x | JavaScript runtime, package manager, bundler, test runner |

**Why Bun:**
- Significantly faster package installation than npm/yarn/pnpm
- Native TypeScript support without transpilation
- Built-in test runner (replaces Jest for unit tests)
- Faster cold starts for serverless functions
- Drop-in replacement for Node.js with npm compatibility

### 2.2 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1 | App Router, SSG, Server Actions |
| React | 19.x | UI Components |
| TypeScript | 5.x | Type Safety |

### 2.3 Styling

| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Utility-first styling |
| tailwind-merge | Class merging |
| clsx | Conditional classes |
| Radix UI | Accessible primitives |

### 2.4 Database & Content

#### Phase 1 (Static)
| Technology | Purpose |
|------------|---------|
| JSON Files | Static emoji data in `/src/data/` |
| localStorage | Client-side rate limiting |

#### Phase 2 (Database Integration)
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database, Auth, Storage, Realtime |
| Upstash Redis | Caching, server-side rate limiting |

**Why Supabase:**
- Integrated PostgreSQL with automatic API generation
- Built-in authentication (OAuth, Email, Magic Link)
- Row Level Security (RLS) for data protection
- Realtime subscriptions for live updates
- Storage for user-generated content
- Generous free tier for MVP

### 2.5 Authentication & Payments (Phase 2)

| Technology | Purpose |
|------------|---------|
| Supabase Auth | Authentication (OAuth, Email, Magic Link) |
| Stripe | Payment processing |

*Note: Phase 1 operates without authentication. All features are available anonymously with client-side rate limiting.*

### 2.6 AI & APIs

| Technology | Purpose |
|------------|---------|
| OpenAI API | Emoji interpretation |
| Vercel AI SDK | Streaming responses |

### 2.7 Analytics & Monitoring

| Technology | Purpose |
|------------|---------|
| Vercel Analytics | Web analytics |
| PostHog | Product analytics |
| Sentry | Error tracking |

### 2.8 Development Tools

| Technology | Purpose |
|------------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| Husky | Git hooks |
| Bun Test | Unit testing (built-in) |
| Playwright | E2E testing |

---

## 3. Project Structure

```
knowyouremoji.com/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── about/page.tsx
│   │   │   └── pricing/page.tsx
│   │   ├── (emoji)/
│   │   │   ├── emoji/
│   │   │   │   └── [slug]/page.tsx         # Emoji detail page
│   │   │   └── emoji-combo/
│   │   │       └── [slug]/page.tsx         # Combo page
│   │   ├── (tools)/
│   │   │   └── interpreter/
│   │   │       └── page.tsx                # Interpreter tool
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── page.tsx
│   │   │       ├── history/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── interpret/route.ts
│   │   │   ├── webhooks/stripe/route.ts
│   │   │   └── emoji/
│   │   │       └── [id]/route.ts
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── ui/                             # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── skeleton.tsx
│   │   ├── emoji/
│   │   │   ├── emoji-header.tsx
│   │   │   ├── emoji-tldr.tsx
│   │   │   ├── emoji-context-card.tsx
│   │   │   ├── emoji-platform-preview.tsx
│   │   │   ├── emoji-combo-list.tsx
│   │   │   ├── emoji-warnings.tsx
│   │   │   ├── emoji-copy-button.tsx
│   │   │   └── emoji-search.tsx
│   │   ├── interpreter/
│   │   │   ├── interpreter-form.tsx
│   │   │   ├── interpreter-result.tsx
│   │   │   ├── context-selector.tsx
│   │   │   ├── platform-selector.tsx
│   │   │   └── usage-counter.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── marketing/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── pricing-card.tsx
│   │   │   └── testimonials.tsx
│   │   └── shared/
│   │       ├── seo-head.tsx
│   │       ├── share-buttons.tsx
│   │       └── loading-spinner.tsx
│   ├── lib/
│   │   ├── supabase.ts                     # Supabase client (Phase 2)
│   │   ├── redis.ts                        # Redis client (Phase 2)
│   │   ├── stripe.ts                       # Stripe config (Phase 2)
│   │   ├── openai.ts                       # OpenAI client
│   │   ├── rate-limit.ts                   # Rate limiting (localStorage Phase 1, Redis Phase 2)
│   │   ├── emoji-data.ts                   # Static emoji data loader
│   │   └── utils.ts                        # Utilities
│   ├── services/
│   │   ├── emoji.service.ts
│   │   ├── interpreter.service.ts
│   │   ├── subscription.service.ts
│   │   └── analytics.service.ts
│   ├── hooks/
│   │   ├── use-emoji-search.ts
│   │   ├── use-interpreter.ts
│   │   ├── use-subscription.ts
│   │   └── use-copy-to-clipboard.ts
│   ├── types/
│   │   ├── emoji.ts
│   │   ├── interpreter.ts
│   │   ├── user.ts
│   │   ├── api.ts
│   │   └── supabase.ts                    # Generated: bunx supabase gen types (Phase 2)
│   ├── constants/
│   │   ├── platforms.ts
│   │   ├── contexts.ts
│   │   ├── risk-levels.ts
│   │   └── seo.ts
│   └── data/
│       ├── emojis/                         # Static emoji data
│       │   ├── skull.json
│       │   └── ...
│       └── combos/                         # Static combo data
│           └── ...
├── supabase/                              # Phase 2 - Database
│   ├── migrations/                        # SQL migrations
│   ├── seed.sql                           # Seed data
│   └── config.toml                        # Supabase config
├── public/
│   ├── emoji-renders/                      # Platform-specific renders
│   │   ├── apple/
│   │   ├── google/
│   │   └── twitter/
│   ├── og/                                 # OG images
│   └── icons/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                               # Run with: bun run scripts/<name>.ts
│   ├── generate-emoji-pages.ts
│   ├── import-emoji-data.ts
│   └── generate-sitemap.ts
├── .env.example
├── .env.local
├── bunfig.toml                            # Bun configuration
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── bun.lockb                              # Bun lockfile (binary)
└── README.md
```

---

## 4. Data Models

### 4.1 Phase 1: Static JSON Schema

In Phase 1, all emoji data is stored as static JSON files. No database required.

**File Structure:**
```
src/data/
├── emojis/
│   ├── index.ts              # Exports all emojis
│   ├── skull.json
│   ├── smiling-face.json
│   └── ...
├── combos/
│   ├── index.ts              # Exports all combos
│   ├── skull-laughing.json
│   └── ...
└── categories.json           # Category metadata
```

**Example Emoji JSON:**
```json
// src/data/emojis/skull.json
{
  "unicode": "1F480",
  "slug": "skull",
  "character": "💀",
  "name": "Skull",
  "shortName": "skull",
  "category": "faces",
  "subcategory": "face-negative",
  "unicodeVersion": "6.0",
  "baseMeaning": "A human skull, often used to represent death or danger.",
  "tldr": "Usually means 'that's so funny I'm dead' or ironic disbelief, not death.",
  "contextMeanings": [
    {
      "context": "LITERAL",
      "meaning": "Represents death, danger, or poison.",
      "example": "☠️💀 Danger zone ahead",
      "riskLevel": "LOW"
    },
    {
      "context": "SLANG",
      "meaning": "Something is extremely funny - 'I'm dead' from laughing.",
      "example": "That meme 💀💀💀",
      "riskLevel": "LOW"
    }
  ],
  "platformNotes": [
    {
      "platform": "TIKTOK",
      "note": "Almost exclusively used for humor. Rarely literal."
    }
  ],
  "generationalNotes": [
    {
      "generation": "GEN_Z",
      "note": "Primary meaning is 'I'm dead (laughing)'. Almost never literal."
    }
  ],
  "warnings": [],
  "relatedCombos": ["skull-laughing", "skull-eyes"],
  "seoTitle": "💀 Skull Emoji Meaning - What Does 💀 Really Mean?",
  "seoDescription": "Learn what the skull emoji 💀 actually means in texts. From Gen Z humor to dating contexts, understand the real meaning behind 💀."
}
```

### 4.2 Phase 2: Supabase Schema

Database tables for Phase 2 (user accounts, subscriptions, history).

```sql
-- supabase/migrations/001_initial_schema.sql

-- ============ PROFILES (extends Supabase Auth) ============

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============ SUBSCRIPTIONS ============

CREATE TYPE subscription_status AS ENUM ('FREE', 'ACTIVE', 'CANCELED', 'PAST_DUE');

CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status subscription_status DEFAULT 'FREE',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============ INTERPRETATIONS ============

CREATE TYPE relationship_context AS ENUM ('DATING', 'FRIENDS', 'WORK', 'FAMILY', 'UNKNOWN');
CREATE TYPE platform_type AS ENUM ('IMESSAGE', 'INSTAGRAM', 'TIKTOK', 'WHATSAPP', 'SLACK', 'DISCORD', 'TWITTER');

CREATE TABLE interpretations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  input_message TEXT NOT NULL,
  platform platform_type,
  relationship_context relationship_context,

  output_tone TEXT,
  output_meaning TEXT,
  sarcasm_score DECIMAL(5,2),
  passive_aggr_score DECIMAL(5,2),
  red_flag_indicators JSONB DEFAULT '[]',
  suggested_response TEXT,

  processing_time_ms INTEGER,
  model_used TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interpretations_user_id ON interpretations(user_id);
CREATE INDEX idx_interpretations_created_at ON interpretations(created_at DESC);

ALTER TABLE interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interpretations"
  ON interpretations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interpretations"
  ON interpretations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============ FUNCTIONS ============

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4.3 TypeScript Types

```typescript
// src/types/emoji.ts

export interface Emoji {
  id: string;
  unicode: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  subcategory?: string;
  unicodeVersion: string;
  baseMeaning: string;
  tldr: string;
  contextMeanings: ContextMeaning[];
  platformNotes: PlatformNote[];
  generationalNotes: GenerationalNote[];
  warnings: EmojiWarning[];
  combos: EmojiComboPreview[];
}

export interface ContextMeaning {
  context: ContextType;
  meaning: string;
  example: string;
  riskLevel: RiskLevel;
}

export type ContextType =
  | 'LITERAL'
  | 'SLANG'
  | 'IRONIC'
  | 'PASSIVE_AGGRESSIVE'
  | 'DATING'
  | 'WORK'
  | 'RED_FLAG';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PlatformNote {
  platform: Platform;
  note: string;
}

export type Platform =
  | 'IMESSAGE'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'WHATSAPP'
  | 'SLACK'
  | 'DISCORD'
  | 'TWITTER';

export interface GenerationalNote {
  generation: Generation;
  note: string;
}

export type Generation = 'GEN_Z' | 'MILLENNIAL' | 'GEN_X' | 'BOOMER';

export interface EmojiWarning {
  title: string;
  description: string;
  severity: RiskLevel;
}

export interface EmojiComboPreview {
  slug: string;
  emojis: string[];
  name: string;
  tldr: string;
}
```

```typescript
// src/types/interpreter.ts

export interface InterpretRequest {
  message: string;
  platform?: Platform;
  relationshipContext?: RelationshipContext;
}

export interface InterpretResponse {
  id: string;
  emotionalTone: string;
  intendedMeaning: string;
  sarcasmProbability: number;
  passiveAggressionProbability: number;
  redFlagIndicators: RedFlagIndicator[];
  suggestedResponseTone?: string;
  emojisDetected: EmojiAnalysis[];
}

export interface RedFlagIndicator {
  type: string;
  description: string;
  severity: RiskLevel;
}

export interface EmojiAnalysis {
  emoji: string;
  meaningInContext: string;
  link: string;
}

export type RelationshipContext =
  | 'DATING'
  | 'FRIENDS'
  | 'WORK'
  | 'FAMILY'
  | 'UNKNOWN';
```

---

## 5. Feature Breakdown & Tickets

### 5.1 Project Setup - Phase 1 (Foundation)

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| SETUP-001 | Initialize Next.js 16.1 project with Bun | `bunx create-next-app@latest` with Next.js 16.1, Bun, App Router, TypeScript, Tailwind CSS, React 19 | P0 |
| SETUP-002 | Configure ESLint & Prettier | Set up linting rules, formatting config, husky pre-commit hooks (via bun) | P0 |
| SETUP-003 | Set up test infrastructure | Configure Bun test with 100% coverage requirements, Playwright for E2E | P0 |
| SETUP-004 | Configure environment variables | Create .env.example, document all required env vars | P0 |
| SETUP-005 | Create static data structure | Set up `/src/data/` folder with emoji/combo JSON schema and loaders | P0 |
| SETUP-006 | Create base UI components | Button, Card, Input, Select, Badge, Dialog using Radix UI | P0 |
| SETUP-007 | Set up Tailwind theme | Configure colors, typography, spacing for brand | P0 |
| SETUP-008 | Create layout components | Header, Footer, MobileNav, Breadcrumbs | P0 |
| SETUP-009 | Implement client-side rate limiting | localStorage-based rate limiting for interpreter (3/day) | P0 |

### 5.2 Authentication System (Phase 2)

*Deferred to Phase 2. Phase 1 operates without authentication.*

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| AUTH-001 | Configure Supabase Auth | Set up Supabase client, auth providers (Google, GitHub, Email) | P2 |
| AUTH-002 | Create login page | Email/password form, OAuth buttons, magic link option | P2 |
| AUTH-003 | Create registration page | Sign up form with email verification | P2 |
| AUTH-004 | Create forgot password flow | Password reset via Supabase Auth | P2 |
| AUTH-005 | Add auth middleware | Protect dashboard routes using Supabase session | P2 |
| AUTH-006 | Create user profile page | Display user info, subscription status | P2 |
| AUTH-007 | Set up profile trigger | Auto-create profile on Supabase user signup | P2 |

### 5.3 Emoji Data & Content System - Phase 1 (Static)

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| EMOJI-001 | Define emoji TypeScript types | Create comprehensive type definitions for emoji data | P0 |
| EMOJI-002 | Create emoji JSON schema | Define JSON structure with validation | P0 |
| EMOJI-003 | Build emoji data loader | Utility to load and type emoji JSON files | P0 |
| EMOJI-004 | Create first 50 emoji JSON files | Manual curation of high-traffic emojis | P0 |
| EMOJI-005 | Build emoji search (client-side) | Search across static JSON data | P0 |
| EMOJI-006 | Create emoji validation script | Validate all JSON files against schema | P0 |
| EMOJI-007 | Build AI content generation script | Generate emoji content drafts for review | P1 |
| EMOJI-008 | Create next 150 emoji JSON files | Expand to 200 total emojis | P0 |
| EMOJI-009 | Create remaining 300+ emoji files | Complete coverage of common emojis | P1 |

### 5.3b Emoji Content System - Phase 2 (Database)

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| EMOJI-P2-001 | Create Supabase emoji tables | Migrate schema to Supabase | P2 |
| EMOJI-P2-002 | Build migration script | Import JSON data to Supabase | P2 |
| EMOJI-P2-003 | Create emoji admin interface | CRUD UI for content editors | P2 |
| EMOJI-P2-004 | Add real-time content updates | Enable live editing without redeploy | P2 |

### 5.4 Emoji Detail Pages

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| PAGE-001 | Create emoji detail page route | Dynamic route /emoji/[slug] with SSG | P0 |
| PAGE-002 | Build EmojiHeader component | Emoji character, name, copy button, Unicode info | P0 |
| PAGE-003 | Build EmojiTLDR component | Short meaning summary with styled callout | P0 |
| PAGE-004 | Build EmojiContextCard component | Individual context meaning with example, risk badge | P0 |
| PAGE-005 | Build context meanings section | Grid/list of all context cards, collapsible | P0 |
| PAGE-006 | Build EmojiPlatformPreview component | Show emoji renders from iOS, Android, Twitter | P0 |
| PAGE-007 | Build platform notes section | Platform-specific meaning differences | P0 |
| PAGE-008 | Build generational notes section | Gen Z vs Millennial usage differences | P1 |
| PAGE-009 | Build EmojiComboList component | Related combos with links | P1 |
| PAGE-010 | Build EmojiWarnings component | Misuse warnings with severity indicators | P1 |
| PAGE-011 | Add copy emoji functionality | Copy to clipboard with toast notification | P0 |
| PAGE-012 | Implement related emojis section | Similar emojis by category or meaning | P2 |
| PAGE-013 | Add structured data (JSON-LD) | Schema.org markup for SEO | P0 |
| PAGE-014 | Create emoji OG image generator | Dynamic OG images for social sharing | P1 |

### 5.5 Emoji Combo Pages - Phase 1 (Static)

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| COMBO-001 | Define combo TypeScript types | Type definitions for combo data | P0 |
| COMBO-002 | Create combo detail page route | Dynamic route /emoji-combo/[slug] with SSG | P0 |
| COMBO-003 | Build combo header component | Show all emojis in sequence, copy button | P0 |
| COMBO-004 | Build combo meaning section | Explanation, examples, context | P0 |
| COMBO-005 | Create top 30 combo JSON files | Manual curation of popular combos | P0 |
| COMBO-006 | Add combo search (client-side) | Search combos by emoji or meaning | P1 |
| COMBO-007 | Internal linking: emoji to combos | Link emojis to their related combos | P0 |
| COMBO-008 | Internal linking: combos to emojis | Link combos back to individual emoji pages | P0 |

### 5.6 Emoji Interpreter Tool

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| INTERP-001 | Create interpreter page | Base page layout at /interpreter | P0 |
| INTERP-002 | Build InterpreterForm component | Message input, platform/context selectors | P0 |
| INTERP-003 | Build PlatformSelector component | Dropdown/buttons for platform selection | P0 |
| INTERP-004 | Build ContextSelector component | Relationship context radio/select | P0 |
| INTERP-005 | Create interpret API route | POST /api/interpret with validation | P0 |
| INTERP-006 | Integrate OpenAI API | Configure client, create interpretation prompt | P0 |
| INTERP-007 | Build interpreter service | Business logic for interpretation | P0 |
| INTERP-008 | Build InterpretResult component | Display tone, meaning, probabilities | P0 |
| INTERP-009 | Add sarcasm probability meter | Visual indicator (0-100%) | P1 |
| INTERP-010 | Add passive-aggression meter | Visual indicator (0-100%) | P1 |
| INTERP-011 | Build red flag indicators | Warning badges for concerning patterns | P1 |
| INTERP-012 | Add suggested response tone | Optional recommendation | P2 |
| INTERP-013 | Implement streaming response | Use Vercel AI SDK for streaming | P1 |
| INTERP-014 | Add loading states | Skeleton loaders, progress indicators | P0 |
| INTERP-015 | Link detected emojis | Link to emoji detail pages in results | P1 |

### 5.7 Rate Limiting & Usage Tracking

#### Phase 1 (Client-Side)
| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| RATE-001 | Implement localStorage rate limiter | Client-side rate limiting (3/day) with date tracking | P0 |
| RATE-002 | Build UsageCounter component | Show remaining free interpretations | P0 |
| RATE-003 | Create upgrade prompt | Show when limit reached (links to pricing) | P0 |
| RATE-004 | Handle rate limit UI | Disable form, show countdown to reset | P0 |

#### Phase 2 (Server-Side)
| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| RATE-P2-001 | Implement Redis rate limiter | Server-side rate limiting via Upstash | P2 |
| RATE-P2-002 | Add authenticated usage tracking | Track by Supabase user ID | P2 |
| RATE-P2-003 | Implement premium bypass | Unlimited for paid subscribers | P2 |

### 5.8 Subscription & Payments (Phase 2)

*Deferred to Phase 2. Phase 1 is free with client-side rate limiting.*

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| PAY-001 | Configure Stripe | Set up Stripe client, products, prices | P2 |
| PAY-002 | Create subscription Supabase table | Subscription table with RLS policies | P2 |
| PAY-003 | Build pricing page | Display pricing tiers, feature comparison | P1 |
| PAY-004 | Create checkout session endpoint | POST /api/checkout with Supabase user | P2 |
| PAY-005 | Build checkout redirect flow | Redirect to Stripe Checkout | P2 |
| PAY-006 | Create Stripe webhook handler | Handle subscription events, update Supabase | P2 |
| PAY-007 | Handle subscription activation | Update Supabase subscription status | P2 |
| PAY-008 | Handle subscription cancellation | Update status, retain access until period end | P2 |
| PAY-009 | Build subscription management UI | Cancel, update payment method | P2 |
| PAY-010 | Create customer portal redirect | Link to Stripe billing portal | P2 |
| PAY-011 | Add subscription status checks | Middleware/utility for feature gating | P2 |
| PAY-012 | Implement trial period | 7-day free trial option | P2 |

*Note: PAY-003 (Pricing Page) is P1 as it's needed for Phase 1 to show future plans.*

### 5.9 User Dashboard (Phase 2)

*Deferred to Phase 2. Requires authentication.*

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| DASH-001 | Create dashboard layout | Sidebar navigation, responsive | P2 |
| DASH-002 | Build dashboard home page | Usage stats, quick actions | P2 |
| DASH-003 | Build interpretation history page | List past interpretations from Supabase | P2 |
| DASH-004 | Add history pagination | Load more/infinite scroll | P2 |
| DASH-005 | Build history detail view | Expand to see full interpretation | P2 |
| DASH-006 | Create settings page | Profile, preferences, subscription | P2 |
| DASH-007 | Add delete account functionality | GDPR compliance, Supabase data deletion | P2 |

### 5.10 SEO & Marketing Pages

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| SEO-001 | Configure metadata defaults | Title, description, OG tags in layout | P0 |
| SEO-002 | Create dynamic sitemap | Generate sitemap.xml for all emoji pages | P0 |
| SEO-003 | Create robots.txt | Configure crawler directives | P0 |
| SEO-004 | Build homepage | Hero, features, CTA, sample emojis | P0 |
| SEO-005 | Build about page | Mission, how it works, trust signals | P1 |
| SEO-006 | Create category index pages | /emoji/category/[category] | P1 |
| SEO-007 | Add canonical URLs | Prevent duplicate content issues | P0 |
| SEO-008 | Implement breadcrumbs | With Schema.org markup | P1 |
| SEO-009 | Add internal linking strategy | Related emojis, combos, categories | P1 |
| SEO-010 | Create 404 page | Custom not found with search | P1 |
| SEO-011 | Create search page | /search with results | P2 |

### 5.11 Share & Viral Features

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| SHARE-001 | Build ShareButtons component | Twitter, Facebook, copy link | P1 |
| SHARE-002 | Create shareable interpretation cards | Visual card for sharing results | P2 |
| SHARE-003 | Generate share images | Dynamic image generation for results | P2 |
| SHARE-004 | Add share tracking | Analytics for shared content | P2 |

### 5.12 Analytics & Monitoring

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| ANAL-001 | Set up Vercel Analytics | Basic web analytics | P0 |
| ANAL-002 | Integrate PostHog | Product analytics, feature flags | P1 |
| ANAL-003 | Set up Sentry | Error tracking, performance monitoring | P0 |
| ANAL-004 | Create analytics service | Track custom events | P1 |
| ANAL-005 | Build admin analytics dashboard | View counts, popular emojis | P2 |
| ANAL-006 | Track conversion events | Upgrade clicks, successful payments | P1 |

### 5.13 Performance & Caching

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| PERF-001 | Configure ISR for emoji pages | Revalidate on content updates | P0 |
| PERF-002 | Implement Redis caching | Cache emoji data, interpretations | P1 |
| PERF-003 | Optimize images | Use next/image, WebP, lazy loading | P0 |
| PERF-004 | Add service worker | Offline emoji page caching | P2 |
| PERF-005 | Implement API response caching | Cache-Control headers | P1 |
| PERF-006 | Bundle optimization | Analyze and reduce JS bundle | P1 |

### 5.14 Testing (100% Coverage Required)

**CRITICAL:** All code must have 100% test coverage. No exceptions. No merges without passing tests.

| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| TEST-001 | Set up Bun test with coverage enforcement | Configure 100% coverage threshold, fail CI if not met | P0 |
| TEST-002 | Set up Playwright for E2E | E2E test configuration (runs via bun) | P0 |
| TEST-003 | Write UI component tests | Test all components in /components/ui/ | P0 |
| TEST-004 | Write emoji component tests | Test all emoji-related components | P0 |
| TEST-005 | Write interpreter component tests | Test all interpreter components | P0 |
| TEST-006 | Write layout component tests | Test header, footer, nav components | P0 |
| TEST-007 | Write emoji data loader tests | Test JSON loading and validation | P0 |
| TEST-008 | Write rate limit utility tests | Test localStorage rate limiting logic | P0 |
| TEST-009 | Write utility function tests | Test all functions in /lib/utils.ts | P0 |
| TEST-010 | Write hook tests | Test all custom React hooks | P0 |
| TEST-011 | Write API route tests | Test all API endpoints | P0 |
| TEST-012 | Create E2E: Homepage flow | Navigate, verify hero, search, featured emojis | P0 |
| TEST-013 | Create E2E: Emoji page flow | Navigate to emoji, verify all sections render | P0 |
| TEST-014 | Create E2E: Interpreter flow | Submit message, verify results display | P0 |
| TEST-015 | Create E2E: Rate limit flow | Exhaust free uses, verify limit message | P0 |
| TEST-016 | Create E2E: Search flow | Search emojis, verify results | P0 |
| TEST-017 | Set up CI pipeline | GitHub Actions: lint, typecheck, test (100% coverage), E2E | P0 |
| TEST-018 | Add pre-commit hooks | Block commits without passing tests | P0 |
| TEST-019 | Create test utilities | Mock factories, test helpers, fixtures | P0 |

### 5.15 Deployment & Infrastructure

#### Phase 1 (Static Site)
| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| DEPLOY-001 | Configure Vercel project | Connect repo, set env vars (OpenAI only) | P0 |
| DEPLOY-002 | Configure custom domain | DNS, SSL certificate | P0 |
| DEPLOY-003 | Set up staging environment | Preview deployments for PRs | P0 |
| DEPLOY-004 | Configure Sentry | Error tracking and monitoring | P0 |
| DEPLOY-005 | Set up Vercel Analytics | Web analytics | P0 |
| DEPLOY-006 | Create deployment documentation | Runbook for deployments | P1 |

#### Phase 2 (Database Integration)
| Ticket ID | Title | Description | Priority |
|-----------|-------|-------------|----------|
| DEPLOY-P2-001 | Set up Supabase project | Create project, configure auth providers | P2 |
| DEPLOY-P2-002 | Run Supabase migrations | Apply schema to production | P2 |
| DEPLOY-P2-003 | Set up Upstash Redis | Provision for rate limiting | P2 |
| DEPLOY-P2-004 | Configure Stripe webhooks | Production webhook endpoints | P2 |
| DEPLOY-P2-005 | Set up database backups | Configure Supabase backup schedule | P2 |

---

## 6. API Routes

### 6.1 Phase 1 API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/interpret` | Interpret message (OpenAI) | No |
| GET | `/api/emoji/search` | Search static emoji data | No |

*Note: In Phase 1, emoji data is loaded from static JSON files. No emoji CRUD API needed.*

### 6.2 Phase 2 API Routes

#### Authentication (Supabase)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/callback` | Supabase OAuth callback | - |

#### Interpreter
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/interpret` | Interpret message (enhanced) | Optional |
| GET | `/api/interpret/history` | Get user's history | User |
| GET | `/api/interpret/[id]` | Get interpretation by ID | User |

#### Subscription
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/checkout` | Create Stripe checkout session | User |
| POST | `/api/webhooks/stripe` | Stripe webhook handler | Stripe |
| GET | `/api/subscription` | Get subscription status | User |
| POST | `/api/billing/portal` | Create Stripe billing portal session | User |

#### User
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/me` | Get current user profile | User |
| PUT | `/api/user/me` | Update user profile | User |
| DELETE | `/api/user/me` | Delete account (GDPR) | User |

#### Admin (Phase 2+)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/emoji` | Create emoji | Admin |
| PUT | `/api/admin/emoji/[id]` | Update emoji | Admin |
| DELETE | `/api/admin/emoji/[id]` | Delete emoji | Admin |

---

## 7. Components

### 7.1 UI Components (src/components/ui/)

| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | variant, size, disabled, loading | Primary action button |
| `Card` | className, children | Container with shadow |
| `Input` | type, placeholder, error | Form input field |
| `Select` | options, value, onChange | Dropdown selector |
| `Badge` | variant, children | Status/label indicator |
| `Collapsible` | open, onOpenChange, children | Expandable section |
| `Dialog` | open, onOpenChange, children | Modal dialog |
| `Toast` | message, type, duration | Notification toast |
| `Skeleton` | width, height | Loading placeholder |

### 7.2 Emoji Components (src/components/emoji/)

| Component | Props | Description |
|-----------|-------|-------------|
| `EmojiHeader` | emoji, onCopy | Main emoji display with metadata |
| `EmojiTLDR` | tldr | Quick meaning summary |
| `EmojiContextCard` | context, meaning, example, riskLevel | Single context meaning |
| `EmojiPlatformPreview` | platforms[] | Platform render comparison |
| `EmojiComboList` | combos[] | Related emoji combinations |
| `EmojiWarnings` | warnings[] | Usage warnings |
| `EmojiCopyButton` | emoji | Copy emoji to clipboard |
| `EmojiSearch` | onSelect | Search and select emoji |

### 7.3 Interpreter Components (src/components/interpreter/)

| Component | Props | Description |
|-----------|-------|-------------|
| `InterpreterForm` | onSubmit, isLoading | Message input form |
| `InterpreterResult` | result, isStreaming | Interpretation display |
| `ContextSelector` | value, onChange | Relationship context picker |
| `PlatformSelector` | value, onChange | Platform picker |
| `UsageCounter` | remaining, max | Usage indicator |
| `ProbabilityMeter` | label, value | Visual probability bar |
| `RedFlagBadge` | indicator | Warning indicator |

### 7.4 Layout Components (src/components/layout/)

| Component | Props | Description |
|-----------|-------|-------------|
| `Header` | user | Site header with nav |
| `Footer` | - | Site footer |
| `MobileNav` | isOpen, onClose | Mobile navigation drawer |
| `Breadcrumbs` | items[] | Navigation breadcrumbs |
| `Sidebar` | items[], activeItem | Dashboard sidebar |

---

## 8. Pages

### 8.1 Phase 1 Pages

#### Marketing Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Homepage | Hero, features, popular emojis, CTA |
| `/about` | About | How it works, mission, team |
| `/pricing` | Pricing | Plans comparison, FAQ (coming soon teaser) |

#### Emoji Pages (Static)
| Route | Page | Description |
|-------|------|-------------|
| `/emoji/[slug]` | Emoji Detail | Full emoji information (SSG) |
| `/emoji-combo/[slug]` | Combo Detail | Emoji combination explanation (SSG) |
| `/emoji/category/[category]` | Category Index | Emojis by category (SSG) |

#### Tool Pages
| Route | Page | Description |
|-------|------|-------------|
| `/interpreter` | Interpreter | AI interpretation tool (client-side rate limit) |

#### Utility Pages
| Route | Page | Description |
|-------|------|-------------|
| `/search` | Search Results | Client-side search across static data |
| `/sitemap.xml` | Sitemap | Generated at build time |
| `/404` | Not Found | Custom 404 with search |

### 8.2 Phase 2 Pages (Database Required)

#### Auth Pages
| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Supabase Auth sign in |
| `/register` | Register | Supabase Auth sign up |
| `/auth/callback` | Auth Callback | OAuth redirect handler |

#### Dashboard Pages
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard Home | Usage stats, quick actions |
| `/dashboard/history` | History | Past interpretations from Supabase |
| `/dashboard/settings` | Settings | Profile, preferences |
| `/dashboard/billing` | Billing | Stripe subscription management |

---

## 9. Third-Party Integrations

### 9.1 OpenAI (Phase 1)

**Purpose:** AI-powered emoji interpretation

**Implementation:**
```typescript
// src/lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const INTERPRETATION_MODEL = 'gpt-4-turbo-preview';
```

**Prompt Structure:**
```
You are an expert at interpreting emoji usage in digital communication.
Given a message with emojis, analyze:
1. Overall emotional tone
2. Intended meaning
3. Sarcasm probability (0-100)
4. Passive-aggression probability (0-100)
5. Any red flags

Context: {platform}, {relationship}
Message: {message}
```

### 9.2 Supabase (Phase 2)

**Purpose:** Database, Authentication, Storage

**Implementation:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Client-side (browser)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side (API routes)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Auth Providers:**
- Google OAuth
- GitHub OAuth
- Email/Password
- Magic Link

### 9.3 Stripe (Phase 2)

**Products:**
- `price_monthly` - $9/month
- `price_yearly` - $70/year

**Webhook Events:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 9.4 Redis / Upstash (Phase 2)

**Purpose:** Server-side rate limiting

**Keys:**
- `rate:ip:{ip}` - Rate limit by IP
- `rate:user:{userId}` - Rate limit by authenticated user

---

## 10. Environment Variables

### Phase 1 (Minimal)

```env
# App
NEXT_PUBLIC_APP_URL=https://knowyouremoji.com
NEXT_PUBLIC_APP_NAME=KnowYourEmoji

# OpenAI (required for interpreter)
OPENAI_API_KEY=sk-...

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
SENTRY_DSN=https://...

# Feature Flags
NEXT_PUBLIC_ENABLE_INTERPRETER=true
```

### Phase 2 (Full)

```env
# App
NEXT_PUBLIC_APP_URL=https://knowyouremoji.com
NEXT_PUBLIC_APP_NAME=KnowYourEmoji

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...

# Feature Flags
NEXT_PUBLIC_ENABLE_INTERPRETER=true
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_PREMIUM=true
```

### 10.1 Bun Configuration

```toml
# bunfig.toml

[install]
# Avoid peer dependency warnings
peer = false

[install.lockfile]
# Save lockfile
save = true

[test]
# Enable coverage with 100% threshold (MANDATORY)
coverage = true
coverageDir = "coverage"
coverageThreshold = { line = 100, branch = 100, function = 100, statement = 100 }
coverageReporters = ["text", "lcov", "html"]

# Test file patterns
root = "."
preload = ["./tests/setup.ts"]

# Fail on first error in CI
bail = true
```

**Important:** The 100% coverage threshold is enforced. Tests will fail if any file has less than 100% coverage.

---

## 11. Testing Strategy

### 11.0 Coverage Requirements

**MANDATORY: 100% test coverage for all code.**

- No PR merges without 100% line coverage
- No PR merges without 100% branch coverage
- No PR merges without 100% function coverage
- CI pipeline enforces coverage thresholds
- Pre-commit hooks run tests locally

### 11.1 Unit Tests (Bun Test)

Bun's built-in test runner provides Jest-compatible syntax with faster execution.

**Configuration:** `bunfig.toml`
```toml
[test]
coverage = true
coverageDir = "coverage"
coverageThreshold = { line = 100, branch = 100, function = 100 }
coverageReporters = ["text", "lcov", "html"]
```

**Test File Structure:**
```
tests/
├── unit/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.test.tsx
│   │   │   ├── card.test.tsx
│   │   │   └── ...
│   │   ├── emoji/
│   │   │   ├── emoji-header.test.tsx
│   │   │   └── ...
│   │   └── interpreter/
│   │       └── ...
│   ├── lib/
│   │   ├── emoji-data.test.ts
│   │   ├── rate-limit.test.ts
│   │   └── utils.test.ts
│   ├── hooks/
│   │   ├── use-emoji-search.test.ts
│   │   └── ...
│   └── services/
│       ├── emoji.service.test.ts
│       └── interpreter.service.test.ts
├── integration/
│   └── api/
│       ├── interpret.test.ts
│       └── emoji.test.ts
└── e2e/
    ├── homepage.spec.ts
    ├── emoji-page.spec.ts
    ├── interpreter.spec.ts
    └── rate-limit.spec.ts
```

**Example Component Test:**
```typescript
import { describe, it, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { EmojiHeader } from '@/components/emoji/emoji-header';
import { mockEmoji } from '@/tests/fixtures/emoji';

describe('EmojiHeader', () => {
  it('renders emoji character', () => {
    render(<EmojiHeader emoji={mockEmoji} />);
    expect(screen.getByText('💀')).toBeInTheDocument();
  });

  it('renders emoji name', () => {
    render(<EmojiHeader emoji={mockEmoji} />);
    expect(screen.getByText('Skull')).toBeInTheDocument();
  });

  it('renders copy button', () => {
    render(<EmojiHeader emoji={mockEmoji} />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('calls onCopy when copy button clicked', async () => {
    const onCopy = vi.fn();
    render(<EmojiHeader emoji={mockEmoji} onCopy={onCopy} />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(onCopy).toHaveBeenCalledWith('💀');
  });
});
```

**Example Utility Test:**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { RateLimiter } from '@/lib/rate-limit';

describe('RateLimiter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows requests under limit', () => {
    const limiter = new RateLimiter({ maxRequests: 3 });
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('blocks requests over limit', () => {
    const limiter = new RateLimiter({ maxRequests: 3 });
    limiter.recordRequest();
    limiter.recordRequest();
    limiter.recordRequest();
    expect(limiter.canMakeRequest()).toBe(false);
  });

  it('resets after 24 hours', () => {
    const limiter = new RateLimiter({ maxRequests: 3 });
    // ... test reset logic
  });

  it('returns remaining count', () => {
    const limiter = new RateLimiter({ maxRequests: 3 });
    limiter.recordRequest();
    expect(limiter.getRemainingRequests()).toBe(2);
  });
});
```

### 11.2 Integration Tests

**API Route Tests (Phase 1):**
- Interpret endpoint: valid request, invalid request, missing fields
- Emoji endpoint: get by slug, not found, search

**API Route Tests (Phase 2):**
- Auth flows with Supabase
- Subscription status checks
- Webhook processing

### 11.3 E2E Tests (Playwright)

**Phase 1 Critical Paths:**
1. Homepage loads with featured emojis
2. Emoji search returns results
3. Emoji detail page renders all sections
4. Combo page renders correctly
5. Interpreter accepts input and returns results
6. Rate limit enforces 3/day limit
7. Rate limit resets after 24 hours
8. Mobile navigation works correctly
9. SEO metadata renders correctly
10. 404 page displays for invalid routes

**Phase 2 Critical Paths:**
11. User can sign up via OAuth
12. User can sign in/out
13. User can subscribe via Stripe
14. Subscribed user has unlimited interpretations
15. User can view interpretation history

---

## 12. Deployment

### 12.1 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "installCommand": "bun install",
  "buildCommand": "bun run build",
  "crons": [
    {
      "path": "/api/cron/sitemap",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 12.2 Database Migrations (Phase 2)

```bash
# Link to Supabase project
bunx supabase link --project-ref <project-id>

# Create new migration
bunx supabase migration new <migration-name>

# Apply migrations locally
bunx supabase db push

# Apply migrations to production
bunx supabase db push --linked

# Generate TypeScript types from schema
bunx supabase gen types typescript --linked > src/types/supabase.ts

# Reset local database
bunx supabase db reset
```

### 12.3 Build Commands

```bash
# Install dependencies
bun install

# Development server
bun dev

# Build for production
bun run build

# Start production server
bun run start

# Run tests
bun test

# Run E2E tests
bun run test:e2e

# Lint
bun run lint

# Format
bun run format

# Run scripts
bun run scripts/import-emoji-data.ts
bun run scripts/generate-emoji-pages.ts
```

### 12.4 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "bun run test && next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "bun test --coverage",
    "test:watch": "bun test --watch",
    "test:ci": "bun test --coverage --bail",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "bun run test && bun run test:e2e",
    "validate": "bun run typecheck && bun run lint && bun run test",
    "validate:emoji": "bun run scripts/validate-emoji-data.ts",
    "generate:emoji": "bun run scripts/generate-emoji-content.ts",
    "db:migrate": "supabase migration new",
    "db:push": "supabase db push",
    "db:types": "supabase gen types typescript --linked > src/types/supabase.ts",
    "db:studio": "supabase studio",
    "prepare": "husky install"
  }
}
```

**Note:** The `build` script runs tests before building. Build will fail if tests don't pass with 100% coverage.

### 12.5 Pre-deployment Checklist

#### Phase 1
- [ ] Bun version specified in package.json engines
- [ ] All tests passing with 100% coverage (`bun test`)
- [ ] E2E tests passing (`bun run test:e2e`)
- [ ] Type check passing (`bun run typecheck`)
- [ ] Lint passing (`bun run lint`)
- [ ] Emoji data validated (`bun run validate:emoji`)
- [ ] Environment variables set (OPENAI_API_KEY, SENTRY_DSN)
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Sentry error tracking configured
- [ ] Vercel Analytics enabled
- [ ] Vercel configured with Bun install/build commands

#### Phase 2 (Additional)
- [ ] Supabase project created and configured
- [ ] Supabase migrations applied
- [ ] Supabase Auth providers configured
- [ ] Upstash Redis provisioned
- [ ] Stripe products/prices created
- [ ] Stripe webhooks configured
- [ ] Environment variables set (all Phase 2 vars)

---

## Appendix A: Ticket Priority Legend

| Priority | Phase | Description |
|----------|-------|-------------|
| P0 | Phase 1 | Critical for MVP/Beta launch |
| P1 | Phase 1 | Important for Phase 1 completeness |
| P2 | Phase 2 | Requires database (Supabase) |

## Appendix B: Estimation Notes

All tickets are scoped to 1-2 hours of focused work. If a ticket exceeds 2 hours, it should be broken down further.

**Phase 1 (MVP/Beta):**
- P0 tickets: ~60
- P1 tickets: ~15
- Total Phase 1: ~75 tickets

**Phase 2 (Growth):**
- P2 tickets: ~45
- Total Phase 2: ~45 tickets

**Testing is P0:** All test tickets are P0 because 100% coverage is mandatory for Phase 1.

## Appendix C: Phase Summary

### Phase 1 - Static Architecture
- No database required
- All emoji content as JSON files
- Client-side rate limiting (localStorage)
- OpenAI integration for interpreter
- 100% test coverage enforced
- SEO-optimized static pages

### Phase 2 - Database Integration
- Supabase for PostgreSQL + Auth
- User accounts and profiles
- Stripe subscriptions
- Server-side rate limiting (Redis)
- Interpretation history
- Content admin interface
