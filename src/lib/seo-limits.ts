/**
 * Title and description budgets.
 *
 * A search engine shows roughly the first 60 characters of a `<title>`
 * and the first 160 of a meta description before truncating. The root
 * layout appends `" | KnowYourEmoji"` to every title, so the title budget
 * has to cover the brand as well as the page's own words — otherwise the
 * brand is what gets cut, and the page ends up with a different rendered
 * title than the one that was authored.
 *
 * The content generators write titles that carry a second, explanatory
 * clause (`👮 Police Officer Emoji Meaning - What Does 👮 Really Mean?`).
 * That clause is worth keeping in the body, but it pushes the title over
 * the line, so it is dropped from the title only.
 *
 * Nothing here invents copy and nothing truncates mid-word: a title that
 * still does not fit is returned unchanged, because a mangled title is
 * worse than a long one.
 *
 * Two families of title are deliberately left alone:
 *
 * - Guide headlines. Each guide's `seoTitle` is written by a human in the
 *   guide's frontmatter, and the headline *is* the promise the guide
 *   makes. Cutting it to fit would remove the part that makes someone
 *   click, and the search term sits in the first clause anyway.
 * - Skin-tone variant titles. Those pages are `noindex` (see
 *   `src/lib/seo-policy.ts`), so no search engine ever renders their
 *   title, and the long form reads better on a social card.
 */

/** Characters a search engine shows before truncating a `<title>`. */
export const TITLE_MAX_LENGTH = 60;

/** Characters a search engine shows before truncating a meta description. */
export const DESCRIPTION_MAX_LENGTH = 160;

/**
 * Trailing clauses the content generators append to a title.
 *
 * These are stripped only when the title does not fit the budget, and
 * only from the end, so the head term — the one people search for — is
 * always what survives.
 *
 * The order matters: the first pattern that matches wins, and the loop
 * restarts after each strip. The specific clauses come before the generic
 * `Meaning` one so that a title like `… Emoji Meaning and How to Use It`
 * loses the whole phrase rather than just its last word.
 *
 * The patterns remove the explanatory clause only. The word `Emoji` is
 * left in place, because it is part of the term people search for.
 */
const TRAILING_TITLE_CLAUSES: RegExp[] = [
  / - What Does .+? Really Mean\?$/,
  / - What Does .+? Mean\?$/,
  / - What It Actually Means in Text$/,
  / A Full Breakdown$/,
  / Meaning, Uses and Common Misreads$/,
  / Meaning and How to Use It$/,
  // The hub pages spell out a tail that only repeats the display name
  // they already carry: "Red Flag Emoji Meanings - Emojis for Red Flag
  // Context". The tail costs characters and adds no new term.
  / - Emojis for .+? Context$/,
  / - What Emojis Mean to .+?$/,
  / - What Emojis Really Mean on .+?$/,
  / - Best .+? Combos Explained$/,
  / - What Do They Really Mean\?$/,
  // Last, because it is the most general: it matches any title ending in
  // "Meaning", so it has to lose to every specific clause above it.
  / Meaning$/,
];

/**
 * Wrappers the content generators put around the whole title.
 *
 * `What Does the Backhand Index Pointing Left Emoji 👈 Mean?` says the
 * same thing as `Backhand Index Pointing Left Emoji 👈`, only it spends
 * twelve characters on the framing. The wrapper is removed as a unit —
 * unwrapping the prefix on its own would leave a dangling `Mean?`.
 */
const TITLE_WRAPPERS: RegExp[] = [/^What Does the (.+) Mean\?$/];

/**
 * Fit a page title to the budget a search engine will actually show.
 *
 * The suffix is the text the root layout appends (the brand). It counts
 * against the budget, because what gets truncated is the rendered title,
 * suffix included.
 *
 * @param rawTitle The authored title, without the brand suffix.
 * @param suffix   The text appended to the title when it is rendered.
 * @returns A title that fits the budget, or the original when it cannot
 *          be shortened without mangling it.
 */
export function fitSeoTitle(rawTitle: string, suffix: string): string {
  let title = rawTitle.trim();
  const budget = TITLE_MAX_LENGTH - suffix.length;
  if (budget <= 0 || title.length <= budget) return title;

  // Strip a trailing clause and unwrap the title, repeatedly, until the
  // title fits or nothing more can be taken off it. The order inside one
  // pass matters: a title can carry both a wrapper and a trailing clause
  // ("What Does the X Emoji 👈 Mean? A Full Breakdown"), and the clause
  // has to come off before the wrapper can be seen.
  let changed = true;
  while (changed && title.length > budget) {
    changed = false;

    for (const pattern of TRAILING_TITLE_CLAUSES) {
      const shortened = title.replace(pattern, '').trim();
      if (shortened !== title && shortened.length > 0) {
        title = shortened;
        changed = true;
        break;
      }
    }
    if (changed) continue;

    for (const wrapper of TITLE_WRAPPERS) {
      const unwrapped = title.replace(wrapper, '$1').trim();
      if (unwrapped !== title && unwrapped.length > 0) {
        title = unwrapped;
        changed = true;
        break;
      }
    }
  }

  // Stripping a clause can leave a dangling separator behind ("Call Me
  // Hand Emoji:"). A trailing colon or dash reads as a truncated title.
  return title.replace(/[\s:—–-]+$/, '');
}

/**
 * Fit a meta description to the budget a search engine will actually show.
 *
 * The cut lands on a sentence boundary when there is one inside the
 * budget, so the snippet reads as a finished thought rather than a
 * fragment. Failing that it lands on a word boundary and adds an ellipsis.
 *
 * @param description The authored description.
 * @returns A description that fits the budget, or the original when it
 *          already fits.
 */
export function fitSeoDescription(description: string): string {
  const text = description.trim();
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;

  const window = text.slice(0, DESCRIPTION_MAX_LENGTH);

  // Prefer the last complete sentence that fits.
  let sentenceEnd: number | null = null;
  for (const match of window.matchAll(/[.!?](?:\s|$)/g)) {
    sentenceEnd = match.index! + 1;
  }
  if (sentenceEnd !== null) return window.slice(0, sentenceEnd).trim();

  // Otherwise cut on a word boundary and mark the truncation.
  const lastSpace = window.lastIndexOf(' ');
  const cut = lastSpace > 0 ? window.slice(0, lastSpace) : window;
  return `${cut.replace(/[\s,;:—–-]+$/, '')}…`;
}
