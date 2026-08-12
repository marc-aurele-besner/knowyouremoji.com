# Emoji Content Guide

How to author emoji JSON pages, including the optional long-form fields
introduced in CONTENT-P1-001.

The JSON loader still requires every page to ship the original "thin" fields
(`unicode`, `slug`, `character`, `name`, `shortName`, `category`,
`unicodeVersion`, `baseMeaning`, `tldr`, `contextMeanings`, `platformNotes`,
`generationalNotes`, `warnings`, `relatedCombos`, `seoTitle`, `seoDescription`).
Everything below this section is optional, but adopting it unlocks the deep
content tier and the richer article layout on `/emoji/[slug]`.

## Field reference (additions)

Add these inside any emoji JSON file. All top-level keys are optional and
backward-compatible.

| Key                    | Type                                  | Notes                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contentTier`          | `"thin"` \| `"standard"` \| `"deep"`  | Marks the page for publishing QA. Leave off (or use `"thin"`) for legacy pages. Use `"standard"` for an enriched page that is not yet ready for the strict deep checks. Use `"deep"` only when every threshold below is met. |
| `contentUpdatedAt`     | ISO date string (e.g. `"2026-01-15"`) | When the content was last meaningfully refreshed.                                                                                                                                                                            |
| `longForm`             | object                                | Article-style body content. See sub-fields below.                                                                                                                                                                            |
| `conversationExamples` | array                                 | Richer, full-message examples grouped by social setting.                                                                                                                                                                     |

### `longForm`

| Key              | Type                            | Notes                                                                                                                       |
| ---------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `overview`       | string                          | 2–4 paragraphs that go beyond the one-line `tldr`. Must read like an article lede, not a paraphrase of the existing fields. |
| `howPeopleUseIt` | string                          | How the emoji shows up in real chat: counts, pairings, captions, the vibe.                                                  |
| `whenNotToUse`   | string                          | The contexts where the emoji is a bad fit — formal, professional, sensitive, or simply misunderstood.                       |
| `howToReply`     | string                          | Practical guidance for someone who just received the emoji and is not sure how to respond.                                  |
| `faqs`           | array of `{ question, answer }` | "People Also Ask" style entries. Answer each one self-contained.                                                            |

### `conversationExamples[]`

| Key              | Type                                                                           | Notes                                                                                      |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `setting`        | `"dating"` \| `"friends"` \| `"work"` \| `"family"` \| `"social"` \| `"other"` | Where the exchange happens. Pick the closest match — do not duplicate one setting.         |
| `message`        | string                                                                         | The full message being interpreted (include the emoji).                                    |
| `interpretation` | string                                                                         | What that message (and emoji) actually means in this setting, plus a hint at how to reply. |

## Deep-tier thresholds

Setting `contentTier: "deep"` opts the page into the strict publishing checks
in `scripts/validate-emojis.ts` (`bun run validate:emojis`). To pass:

- `longForm.overview` must contain **at least 120 words**.
- `conversationExamples` must contain **at least 3 entries**.
- `longForm.faqs` must contain **at least 3 entries**.
- Every `platformNotes[].note` must be **at least 40 characters** AND must not
  match one of the boilerplate patterns in
  `scripts/validate-emojis.ts` (`DEEP_BOILERPLATE_PATTERNS`).

If you cannot meet a threshold yet, keep `contentTier` at `"standard"` (or
omit it) so the validation pipeline does not block the page.

## Anti-boilerplate rules

The most common failure mode for platform and generational notes is generic
copy that could apply to any emoji ("very common in comments", "used in many
contexts"). The validation script rejects notes that match these patterns at
the deep tier.

For each `platformNotes[].note`, write something that names the platform:

- What does the emoji look like in that platform's UI?
- Who is using it (creators, commenters, lurkers)?
- What does it signal in that specific context?

If your note could be copy-pasted into another emoji page, rewrite it.

## Reference example

See `tests/utils/fixtures/emojis.fixtures.ts` → `SKULL_DEEP_EMOJI` for a
passing deep-tier example. It is intentionally verbose so writers can copy
the structure, then rewrite the body for the emoji they are working on.

## Workflow

1. Pick the emoji slug. Open `src/data/emojis/<slug>.json`.
2. Read the existing `tldr`, `contextMeanings`, and `platformNotes`. The new
   content should complement, not duplicate, them.
3. Draft `longForm` paragraphs first. Hit the 120-word overview target.
4. Add at least 3 `conversationExamples` that show distinct settings.
5. Add at least 3 `faqs` readers are likely to type into a search engine.
6. Run `bun run validate:emojis` to catch threshold and boilerplate failures.
7. Set `contentTier: "deep"` and `contentUpdatedAt: <today>` once the page is
   ready for QA.

## When not to use deep tier

- The page is new and only has a few examples. Mark it `"standard"` or omit
  the field.
- The emoji has no slang or generational nuance (e.g. a flag). Skip
  `longForm` entirely; the existing thin layout is more honest.
- You cannot write a 120-word overview without repeating the `tldr`. Keep the
  page thin and ask a writer to revisit.
