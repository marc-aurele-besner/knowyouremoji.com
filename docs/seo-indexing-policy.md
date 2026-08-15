# Indexing policy (AdSense readiness)

This document is the canonical reference for how we tell crawlers what to do
with each page. The implementation lives in `src/lib/seo-policy.ts` and
`src/lib/sitemap-entries.ts`, and is applied via `generateMetadata` in the
relevant route files plus the Next.js `sitemap.ts` and `robots.ts` shims.

> Background: issue **#344 — CONTENT-P1-006 (Publisher trust signals + thin-page
> indexing policy)** under epic **#339 — AdSense readiness**. Google rejected
> KnowYourEmoji for "low-value / thin content" partly because we shipped ~4,000
> near-duplicate emoji pages. The policy below is what stops the same flag from
> firing on the next review. Issue **#355 — SEO-P1-001** extends that policy to
> the sitemap, robots.txt, and the (then-missing) combo metadata.

## TL;DR

| Page type                                                                                     | `robots`                      | `canonical`          | In sitemap?    |
| --------------------------------------------------------------------------------------------- | ----------------------------- | -------------------- | -------------- |
| Deep editorial emoji page                                                                     | `index, follow`               | self                 | yes (0.85)     |
| Standard emoji page                                                                           | `index, follow`               | self                 | yes (0.75)     |
| Skin-tone variant (e.g. 👋🏽)                                                                   | `noindex, follow`             | base emoji (`/wave`) | no             |
| Stub / boilerplate emoji page                                                                 | `noindex, follow`             | self                 | no             |
| Deep combo page                                                                               | `index, follow`               | self                 | yes (0.85)     |
| Standard combo page                                                                           | `index, follow`               | self                 | yes (0.75)     |
| Thin combo page                                                                               | `noindex, follow`             | self                 | no             |
| Category / platform / generation / context                                                    | `index, follow`               | self                 | yes (0.6–0.7)  |
| Combo category hubs                                                                           | `index, follow`               | self                 | yes (0.6)      |
| Compare pages                                                                                 | `index, follow`               | self                 | yes (0.6)      |
| Guides index + per-guide pages                                                                | `index, follow`               | self                 | yes (0.85–0.9) |
| Homepage, About, Contact, Pricing, Privacy, Terms, Search, `/emoji`, `/combo`, `/interpreter` | `index, follow`               | self                 | yes (0.6–1.0)  |
| `/api/`, `/dashboard`, `/admin`, `/login`, `/register`, `/forgot-password`, `/reset-password` | n/a (blocked in `robots.txt`) | n/a                  | no             |

All pages remain reachable for users regardless of `noindex`. We only opt
pages out of Google Search when they do not carry original editorial value.

## Sitemap ↔ robots � page-meta invariants

1. **The sitemap must never list a URL that is `noindex` on the page.**
   Listing `noindex` URLs in the sitemap wastes crawl budget and tells
   Google to crawl a page we don't want indexed.
2. **The `robots.txt` disallow list must cover every private surface**
   (API, authenticated areas, admin). Per-page `robots: { index: false }`
   stays in place as a belt-and-suspenders complement.
3. **`lastModified` must be content-derived**, not "always now". For
   emoji and combo pages we prefer `contentUpdatedAt`; for guides we use
   `updatedAt || publishedAt`. Trust pages / hub pages use build time,
   which is fine because they change rarely.
4. **Deep editorial content outranks stub directories.** Priority is a
   soft signal but keeps the intent visible: deep emoji / deep combo
   (0.85) > standard (0.75) > category / combo-category / facet hubs
   (0.6–0.7) > trust pages (0.6).

## Tier rules

### Emoji

Every emoji page resolves to one of three tiers (`ContentTier = 'thin' | 'standard' | 'deep'`):

1. **Explicit `emoji.contentTier` wins.** Writers / engineering set this in
   the JSON file when a page is enriched.
2. **Skin-tone variants are always `thin`.** The base emoji owns the canonical
   explanation; the variants are duplicate renders that exist only for
   keyboard / platform parity.
3. **Stub fallback.** If an emoji has no `contextMeanings`, no platform /
   generational notes, no `longForm`, and no `conversationExamples`, the page
   is treated as a stub and marked `thin` until someone fills it in.

### Combo

Combos use the same taxonomy (`ComboContentTier = 'thin' | 'standard' | 'deep'`):

1. **Explicit `combo.contentTier` wins.**
2. **`deep` if `longForm` has any prose field filled in.** That means any
   of `overview`, `howPeopleUseIt`, `whenNotToUse`, `howToReply`, or
   non-empty `faqs`.
3. **`standard` if the combo has any `conversationExamples`.**
4. **Otherwise `thin`** — bare `meaning` / `description` / `examples` is
   not enough to justify an indexable publisher page. Writers should
   promote thin combos to standard via `contentTier` or by adding
   `longForm` / `conversationExamples`.

Tier → `robots` mapping (applies to both emoji and combo):

| Tier       | `robots`          | `canonical` | In sitemap? |
| ---------- | ----------------- | ----------- | ----------- |
| `deep`     | `index, follow`   | self        | yes (0.85)  |
| `standard` | `index, follow`   | self        | yes (0.75)  |
| `thin`     | `noindex, follow` | self        | no          |

## Skin-tone canonical

A skin-tone variant (`emoji.skinToneBase` set) sets its `canonical` to the base
emoji's URL and ships with `noindex, follow`. The variant page is still
reachable in-app — a user can browse `/wave-medium-dark` and see the same
content as `/wave` — but crawlers should treat the base as the only source of
truth. Skin-tone variants are also omitted from the sitemap.

## Why we do not blanket-canonical to category / context pages

Category, platform, generation, and context pages do not duplicate any single
emoji's content — they are aggregation surfaces with their own original copy.
We keep them `index, follow` and self-canonical. Adding a `noindex` blanket
would throw away legitimate long-tail traffic and break the sitemap.

## Where this is enforced

- `src/lib/seo-policy.ts` — single source of truth for `getIndexingDecision`
  (emoji), `getComboIndexingDecision`, `resolveContentTier`,
  `resolveComboContentTier`, `decisionToRobots`.
- `src/lib/sitemap-entries.ts` — builds sitemap entries with the per-surface
  rules: filters `noindex` URLs, surfaces trust / hub / facet pages, picks
  content-derived `lastModified`, applies priority differentiation.
- `src/app/emoji/[slug]/page.tsx` — applies the decision via `generateMetadata`.
- `src/app/combo/[slug]/page.tsx` — applies the combo decision via
  `generateMetadata`.
- `src/app/sitemap.ts` — thin wrapper that calls `buildSitemap()`.
- `src/app/robots.ts` — disallows `/api/`, `/dashboard`, `/admin`, plus
  the auth routes under `(auth)/`.

If you add a new route that emits a public page:

1. Apply `getIndexingDecision` (or `getComboIndexingDecision`) inside
   `generateMetadata`.
2. Make sure the route is included in `src/lib/sitemap-entries.ts` if
   the URL should appear in the sitemap (with the right priority and
   `lastModified`).
3. Add or extend the matching test in `tests/unit/lib/seo-policy.test.ts`
   and/or `tests/unit/lib/sitemap-entries.test.ts`.

## Operational checklist before reapplying to AdSense

- [x] `/contact` page live (with email + GitHub Issues + response expectation)
- [x] `/about` strengthened (methodology, editorial standards, who operates)
- [x] Privacy + Terms complete, linked sitewide
- [x] Indexing policy implemented in code with a thin-page fallback
- [x] Sitemap excludes skin-tone and thin combo URLs (#355)
- [x] Sitemap includes trust, hub, and facet pages (#355)
- [x] Combo `generateMetadata` honors `contentTier` (#355)
- [x] `robots.txt` blocks private surfaces (#355)
- [ ] `ads.txt` only after Google instructs us to publish it (see
      `src/lib/metadata.ts` for the existing `google-adsense-account` meta)
- [ ] Empty ad slots must not be rendered pre-approval — only add `<AdSense/>`
      after the AdSense team returns a publisher ID

## Rollout caution

If a future content sweep promotes ~3k pages from `standard` to `thin`, the
sitemap and indexing change happens at the same time. That is the correct
end state for AdSense quality, but it is a large indexing delta. Prefer
omitting a page from the sitemap immediately and ship the `noindex` change
in the same PR so the signals stay aligned.
