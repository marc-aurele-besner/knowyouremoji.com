# Deployment Runbook

This document describes the deployment process for KnowYourEmoji.com.

## Table of Contents

- [Overview](#overview)
- [Environments](#environments)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Process](#deployment-process)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

KnowYourEmoji.com is deployed on Vercel with automatic deployments from the `main` branch. The application uses:

- **Framework**: Next.js 16.1 (App Router)
- **Runtime**: Bun
- **Hosting**: Vercel
- **Error Monitoring**: Sentry
- **Analytics**: Vercel Analytics

## Environments

| Environment | Branch      | URL                       | Purpose     |
| ----------- | ----------- | ------------------------- | ----------- |
| Production  | `main`      | https://knowyouremoji.com | Live site   |
| Preview     | PR branches | `*.vercel.app`            | PR previews |
| Local       | -           | http://localhost:3000     | Development |

## Prerequisites

### Required Accounts

- **Vercel**: For hosting and deployment
- **OpenAI**: For the AI interpreter feature
- **Sentry**: For error monitoring (optional but recommended)

### Required Tools (Local Development)

```bash
# Bun 1.x or later
bun --version

# Git
git --version

# GitHub CLI (for PR workflows)
gh --version
```

## Environment Variables

### Production Environment Variables (Vercel)

Configure these in Vercel Dashboard > Project Settings > Environment Variables:

| Variable                          | Required        | Description                    |
| --------------------------------- | --------------- | ------------------------------ |
| `NEXT_PUBLIC_APP_URL`             | Yes             | `https://knowyouremoji.com`    |
| `NEXT_PUBLIC_APP_NAME`            | No              | `KnowYourEmoji` (default)      |
| `OPENAI_API_KEY`                  | Yes             | OpenAI API key for interpreter |
| `NEXT_PUBLIC_ENABLE_INTERPRETER`  | No              | `true` (default)               |
| `SENTRY_DSN`                      | Recommended     | Sentry DSN (server-side)       |
| `NEXT_PUBLIC_SENTRY_DSN`          | Recommended     | Sentry DSN (client-side)       |
| `SENTRY_ORG`                      | If using Sentry | Sentry organization slug       |
| `SENTRY_PROJECT`                  | If using Sentry | Sentry project slug            |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | No              | Auto-configured by Vercel      |

### Local Development

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in required values (at minimum, `OPENAI_API_KEY` for interpreter testing)

## Deployment Process

### Automatic Deployments

Production deployments happen automatically when:

1. A PR is merged to `main`
2. All CI checks pass
3. Vercel builds and deploys the application

### Manual Deployment (Vercel CLI)

For emergency deployments or debugging:

```bash
# Install Vercel CLI
bun add -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Deployment Flow

```
Push to main
     │
     ▼
CI Pipeline (GitHub Actions)
  ├── Lint
  ├── Type check
  ├── Unit tests (99.5%+ coverage)
  ├── Build
  └── E2E tests
     │
     ▼ (if all pass)
Vercel Build
  ├── bun install
  ├── bun run build (includes test:coverage)
  └── Deploy to production
     │
     ▼
Live at knowyouremoji.com
```

## CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline (`.github/workflows/ci.yml`) runs on:

- Push to `main`
- Pull requests to `main`

**Pipeline Steps:**

1. **Checkout** - Clone repository
2. **Setup Bun** - Install Bun runtime
3. **Install dependencies** - `bun install --frozen-lockfile`
4. **Lint** - `bun run lint`
5. **Format check** - `bun run format:check`
6. **Type check** - `bun run typecheck`
7. **Test with coverage** - `bun run test:coverage` (enforces 99.5%+)
8. **Validate emoji data** - `bun run validate:emojis`
9. **Build** - `bunx next build`
10. **E2E tests** - `bun run test:e2e`

### Preview Deployments

Every PR gets an automatic preview deployment. The preview URL is posted as a PR comment by `.github/workflows/preview-comment.yml`.

## Monitoring

### Sentry Error Tracking

Sentry is configured for:

- **Client-side errors**: Browser exceptions and React errors
- **Server-side errors**: API route and SSR errors
- **Session replays**: (production only, 10% sample rate)
- **Performance traces**: (production: 10%, development: 100%)

Access Sentry dashboard at: https://sentry.io

### Vercel Analytics

Vercel Analytics provides:

- Page views
- Unique visitors
- Performance metrics (Web Vitals)

Access via Vercel Dashboard > Analytics

### Health Checks

The application can be verified by accessing:

- Homepage: `https://knowyouremoji.com`
- API endpoint: `https://knowyouremoji.com/api/interpret` (POST)

## Rollback Procedures

### Via Vercel Dashboard

1. Go to Vercel Dashboard > Project > Deployments
2. Find the last working deployment
3. Click the three-dot menu > "Promote to Production"

### Via Git Revert

```bash
# Identify the problematic commit
git log --oneline

# Revert the commit
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

### Via Vercel CLI

```bash
# List deployments
vercel ls

# Rollback to a specific deployment
vercel rollback <deployment-url>
```

## Troubleshooting

### Build Failures

**Tests failing:**

```bash
# Run tests locally
bun run test

# Check coverage
bun run test:coverage
```

**Type errors:**

```bash
bun run typecheck
```

**Lint errors:**

```bash
bun run lint
bun run lint:fix  # Auto-fix
```

### Deployment Issues

**Environment variables not loading:**

- Verify variables in Vercel Dashboard
- Check `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after changing variables

**Build timeout:**

- Check for infinite loops in build scripts
- Optimize large static generation

**Memory issues:**

- Reduce ISR concurrency
- Optimize image handling

### Runtime Issues

**Interpreter not working:**

- Verify `OPENAI_API_KEY` is set
- Check `NEXT_PUBLIC_ENABLE_INTERPRETER` is `true`
- Check Sentry for API errors

**Pages not updating:**

- ISR revalidates every hour (3600 seconds)
- Force revalidation via Vercel Dashboard > Deployments > Redeploy

### Emergency Contacts

For critical production issues:

1. Check Sentry for error details
2. Review Vercel deployment logs
3. Rollback if necessary
4. Create a GitHub issue for tracking

## Security Headers

The following security headers are configured in `vercel.json`:

| Header                    | Value                                        | Purpose               |
| ------------------------- | -------------------------------------------- | --------------------- |
| X-Content-Type-Options    | nosniff                                      | Prevent MIME sniffing |
| X-Frame-Options           | DENY                                         | Prevent clickjacking  |
| X-XSS-Protection          | 1; mode=block                                | XSS protection        |
| Referrer-Policy           | strict-origin-when-cross-origin              | Control referrer info |
| Permissions-Policy        | camera=(), microphone=(), geolocation=()     | Disable unused APIs   |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | Force HTTPS           |

## Domain Configuration

- Primary domain: `knowyouremoji.com`
- WWW redirect: `www.knowyouremoji.com` → `knowyouremoji.com` (308 permanent)
- HTTPS enforced via HSTS
