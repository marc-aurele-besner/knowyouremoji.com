# Indexing policy (AdSense readiness)

This document is the canonical reference for how we tell crawlers what to do
with each page. The implementation lives in `src/lib/seo-policy.ts` and is
applied via `generateMetadata` in the relevant route files.

> Background: issue **#344 — CONTENT-P1-006 (Publisher trust signals + thin-page
> indexing policy)** under epic **#339 — AdSense readiness**. Google rejected
> KnowYourEmoji for "low-value / thin content" partly because we shipped ~4,000
> near-duplicate emoji pages. The policy below is what stops the same flag from
> firing on the next review.

## TL;DR

| Page type                                        | `robots`          | `canonical`          |
| ------------------------------------------------ | ----------------- | -------------------- |
| Deep editorial emoji page                        | `index, follow`   | self                 |
| Standard emoji page                              | `index, follow`   | self                 |
| Skin-tone variant (e.g. 👋🏽)                      | `noindex, follow` | base emoji (`/wave`) |
| Stub / boilerplate emoji page                    | `noindex, follow` | self                 |
| Category / platform / generation / context       | `index, follow`   | self                 |
| Homepage, About, Contact, Guides, Privacy, Terms | `index, follow`   | self                 |

All pages remain reachable for users regardless of `noindex`. We only opt
pages out of Google Search when they do not carry original editorial value.

## Tier rules

Every emoji page resolves to one of three tiers (`ContentTier = 'thin' | 'standard' | 'deep'`):

1. **Explicit `emoji.contentTier` wins.** Writers / engineering set this in
   the JSON file when a page is enriched.
2. **Skin-tone variants are always `thin`.** The base emoji owns the canonical
   explanation; the variants are duplicate renders that exist only for
   keyboard / platform parity.
3. **Stub fallback.** If an emoji has no `contextMeanings`, no platform /
   generational notes, no `longForm`, and no `conversationExamples`, the page
   is treated as a stub and marked `thin` until someone fills it in.

Tier → `robots` mapping:

| Tier       | `robots`          | `canonical` |
| ---------- | ----------------- | ----------- |
| `deep`     | `index, follow`   | self        |
| `standard` | `index, follow`   | self        |
| `thin`     | `noindex, follow` | self        |

## Skin-tone canonical

A skin-tone variant (`emoji.skinToneBase` set) sets its `canonical` to the base
emoji's URL and ships with `noindex, follow`. The variant page is still
reachable in-app — a user can browse `/wave-medium-dark` and see the same
content as `/wave` — but crawlers should treat the base as the only source of
truth.

## Why we do not blanket-canonical to category / context pages

Category, platform, generation, and context pages do not duplicate any single
emoji's content — they are aggregation surfaces with their own original copy.
We keep them `index, follow` and self-canonical. Adding a `noindex` blanket
would throw away legitimate long-tail traffic and break the sitemap.

## Where this is enforced

- `src/lib/seo-policy.ts` — single source of truth (`getIndexingDecision`,
  `decisionToRobots`, `resolveContentTier`).
- `src/app/emoji/[slug]/page.tsx` — applies the decision via
  `generateMetadata`.

If you add a new route that emits a public page, hook it into `seo-policy.ts`
rather than hand-rolling another `robots` block.

## Operational checklist before reapplying to AdSense

- [x] `/contact` page live (with email + GitHub Issues + response expectation)
- [x] `/about` strengthened (methodology, editorial standards, who operates)
- [x] Privacy + Terms complete, linked sitewide
- [x] Indexing policy implemented in code with a thin-page fallback
- [ ] `ads.txt` only after Google instructs us to publish it (see
      `src/lib/metadata.ts` for the existing `google-adsense-account` meta)
- [ ] Empty ad slots must not be rendered pre-approval — only add `<AdSense/>`
      after the AdSense team returns a publisher ID
