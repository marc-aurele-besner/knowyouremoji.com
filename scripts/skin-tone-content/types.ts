/**
 * Shared types for the skin-tone family content generator.
 *
 * Every emoji that ships a set of Fitzpatrick skin-tone variants (👮🏻 👮🏼 👮🏽
 * 👮🏾 👮🏿) is a "family": one tone-less base page plus five variant pages.
 * Historically the variant pages were produced by a generator that swapped the
 * tone word into a fixed sentence template, which made all five pages of a
 * family read as near-identical boilerplate.
 *
 * A `FamilyProfile` is the hand-authored, family-specific half of the copy.
 * The other half — what a particular tone choice signals and how it renders —
 * lives in `tone-archetypes.ts` and is keyed by tone.
 */

export type ToneModifier = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

/** The five Fitzpatrick tones, in the order Unicode and every picker list them. */
export const TONE_ORDER: readonly ToneModifier[] = [
  'light',
  'medium-light',
  'medium',
  'medium-dark',
  'dark',
] as const;

/**
 * What part of the artwork the skin-tone modifier actually recolors.
 *
 * - `person`     — a full figure (👮🏻, 🧑🏽‍🚀)
 * - `hands`      — a single hand (👍🏻, 🤏🏻)
 * - `both-hands` — two hands (👏🏻, 🤲🏻)
 * - `body`       — a detached body part that still has skin (👂🏻, 🦵🏻, 👃🏻)
 * - `object`     — no skin at all; the modifier tints a prosthetic or prop (🦾🏻)
 */
export type ToneLands = 'person' | 'hands' | 'both-hands' | 'body' | 'object';

/** A sibling emoji this one is regularly confused with. */
export interface ContrastEntry {
  /** Glyph of the confusable sibling. */
  glyph: string;
  /** Display name of the confusable sibling. */
  title: string;
  /** How the two differ in practice. */
  note: string;
}

/**
 * The hand-authored, family-specific half of the copy for one emoji family.
 */
export interface FamilyProfile {
  /** Tone-less emoji slug, e.g. `police-officer`. */
  base: string;
  /** Display name of the tone-less emoji, e.g. `Police Officer`. */
  title: string;
  /** The tone-less glyph, e.g. `👮`. */
  glyph: string;
  /** One clause describing only what the artwork shows — no meaning, no vibes. */
  depicts: string;
  /** What the glyph does in a conversation, as a verb phrase. */
  reads: string;
  /** The misread that happens most often, and why it happens. */
  misread: string;
  /** Two concrete situations where this glyph is the right pick. */
  uses: [string, string];
  /** A sibling emoji that gets confused with this one. */
  contrast: ContrastEntry;
  /** Which part of the artwork the tone modifier recolors. */
  toneLands: ToneLands;
  /**
   * Noun phrase for the part that gets recolored, e.g. `ear` or `leg`.
   *
   * Optional: most families fall out of `toneLands` correctly, but a detached
   * body part needs to name the part rather than say "skin".
   */
  toneTarget?: string;
}
