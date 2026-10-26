/**
 * Tone archetypes for skin-tone variant pages.
 *
 * Each Fitzpatrick tone gets its own set of templates. They are not the same
 * paragraph with a different word swapped in: every tone has a different
 * opening move, a different emphasis and a different set of pitfalls, so the
 * five variants of a family read as five distinct pages.
 *
 * Every template receives a `ToneContext` built by the generator from the
 * hand-authored family profile plus the tone metadata below.
 */

import type {
  ContextMeaning,
  ConversationExample,
  EmojiFaq,
  EmojiWarning,
  GenerationalNote,
  PlatformNote,
} from '../../src/types/emoji';
import type { ToneModifier } from './types';

/** How the tone modifier is encoded in the emoji sequence. */
export type RenderKind = 'plain' | 'zwj';

export interface ToneContext {
  /** The toned glyph, e.g. `👮🏻`. */
  glyph: string;
  /** The tone-less glyph, e.g. `👮`. */
  baseGlyph: string;
  /** Full page title, e.g. `Police Officer: Light Skin Tone`. */
  title: string;
  /** Tone-less title, e.g. `Police Officer`. */
  baseTitle: string;
  /** e.g. `light skin tone`. */
  toneLabel: string;
  /** The Fitzpatrick swatch, e.g. `🏻`. */
  toneChar: string;
  tone: ToneModifier;
  /** What the artwork shows. */
  depicts: string;
  /** What the glyph does in a conversation. */
  reads: string;
  /** The most common misread. */
  misread: string;
  /** Two concrete use cases. */
  use1: string;
  use2: string;
  /** The confusable sibling. */
  contrastGlyph: string;
  contrastTitle: string;
  contrastNote: string;
  /** Which part of the artwork the tone recolors. */
  toneLands: 'person' | 'hands' | 'both-hands' | 'body' | 'object';
  /** How the tone modifier is encoded. */
  renderKind: RenderKind;
  /** Family-specific rendering caveat. */
  renderNote: string;
  /** Where the tone sits in a picker and how a finger gets there. */
  picker: string;
  /** What choosing this tone usually signals. */
  signal: string;
  /** The tone-specific trap. */
  caveat: string;
  /** How the tone shifts the register of the emoji. */
  register: string;
  /** How the tone reads in a dating thread. */
  dating: string;
  /** How the tone reads in a work thread. */
  work: string;
  /** Noun phrase for the part of the artwork that gets recolored. */
  toneTarget: string;
}

/**
 * Per-tone metadata.
 *
 * Each field is written for the slot it fills, so the templates can drop them
 * straight into a sentence without repairs:
 *
 * - `picker` — a clause about where the swatch sits in the tone list. It is
 *   why the light tone is picked by default and the dark tone is picked on
 *   purpose.
 * - `signal` — a participial phrase describing what the choice communicates.
 * - `caveat` — a clause naming the specific trap that tone creates.
 * - `register` — a noun phrase for how the tone recolours the gesture.
 * - `dating` and `work` — noun phrases for how the tone reads in those threads.
 */
export const TONE_META: Record<
  ToneModifier,
  {
    label: string;
    char: string;
    picker: string;
    signal: string;
    caveat: string;
    /** Short clause used in the tldr. */
    punch: string;
    /** What the tone does to the register of the emoji, for context meanings. */
    register: string;
    /** How the tone reads in a dating thread. */
    dating: string;
    /** How the tone reads in a work thread. */
    work: string;
  }
> = {
  light: {
    label: 'light skin tone',
    char: '🏻',
    picker:
      'it is the first swatch in the tone list on Apple, Google, WhatsApp and Slack, and the one a thumb lands on without looking',
    signal:
      'chosen by default as often as by intent, which makes it the least loaded of the five choices',
    caveat:
      'because it is the default, it is the tone most likely to be used for someone other than the sender',
    punch: 'Usually the default pick, so it reads as casual rather than deliberate.',
    register: 'a straight rendering with no deliberate tone attached',
    dating: 'a low-stakes, playful choice rather than a considered one',
    work: 'stays safe in a work thread precisely because nobody registers the choice',
  },
  'medium-light': {
    label: 'medium-light skin tone',
    char: '🏼',
    picker:
      'it is the second swatch in the tone list, one position past the default, so it takes a deliberate second tap',
    signal:
      'picked slightly more thoughtfully than the default, and noticeably less often than the middle tones',
    caveat:
      'it is the tone most often chosen as a compromise when the exact match is not obvious to the sender',
    punch: 'One step past the default, so it reads as a considered choice.',
    register: 'a slightly more considered version of the same gesture',
    dating: 'evidence that somebody thought about which swatch to press',
    work: 'passes without comment in a work thread',
  },
  medium: {
    label: 'medium skin tone',
    char: '🏽',
    picker:
      'it is the middle swatch in the tone list, and the one several keyboards land on by default when the tone picker opens',
    signal:
      'often the choice of someone who is not using skin tone to make a point, which is why it reads as the neutral stand-in',
    caveat:
      'because it is treated as the neutral pick, it is the tone most likely to be used to refer to somebody other than the sender',
    punch: 'The middle tone, often standing in for a neutral default.',
    register: 'the neutral version of the emoji, with almost nothing attached',
    dating: 'the safest possible choice, which some senders use on purpose',
    work: 'reads as the unremarkable version in a work thread',
  },
  'medium-dark': {
    label: 'medium-dark skin tone',
    char: '🏾',
    picker:
      'it is the fourth swatch in the tone list, which means it takes an extra tap past the three before it',
    signal:
      'chosen deliberately more often than not, since it is not where a finger lands by accident',
    caveat:
      'it is the tone most often used to represent a person who is not the sender, which is where the misreading starts',
    punch: 'Reached deliberately, so it reads as intentional.',
    register: 'a chosen version rather than a defaulted one',
    dating: 'a deliberate statement about who is being pictured',
    work: 'still reads as intentional, but without the extra weight the darkest tone carries',
  },
  dark: {
    label: 'dark skin tone',
    char: '🏿',
    picker:
      'it is the last swatch in the tone list, so reaching it means scrolling or swiping past four others',
    signal: 'the most deliberately chosen of the five, because getting there is the most work',
    caveat:
      'it is the tone most often used to make a point about someone’s skin, which is why it never travels without context',
    punch: 'Always a deliberate pick, and one that needs context to land.',
    register: 'a deliberate statement with real weight behind it',
    dating: 'a strong statement, and a wrong one lands badly',
    work: 'reads as deliberate enough that the choice itself is noticed',
  },
};

/** Capitalize the first letter of a fragment. */
function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Make sure a fragment ends with a full stop before it is used mid-sentence. */
function stop(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** Which part of the artwork each tone actually recolors. */
export function toneTarget(toneLands: ToneContext['toneLands']): string {
  switch (toneLands) {
    case 'person':
      return 'figure';
    case 'hands':
      return 'hand';
    case 'both-hands':
      return 'hands';
    case 'body':
      return 'skin';
    case 'object':
      return 'metal';
  }
}

/**
 * Family-specific rendering note. This is the detail that makes a tone page
 * honest about what a reader will actually see on their own device.
 */
export function renderNoteFor(
  baseGlyph: string,
  renderKind: RenderKind,
  toneLabel: string
): string {
  if (renderKind === 'zwj') {
    return (
      `${baseGlyph} is a zero-width-joiner sequence rather than a single character, so the ${toneLabel} ` +
      'modifier only renders on clients that support toned job sequences. Several Android and Windows ' +
      'builds drop the modifier and fall back to the untoned figure, and the modifier has to sit directly ' +
      'after the person code point for it to register at all.'
    );
  }
  return (
    `${baseGlyph} is a single code point, so the ${toneLabel} modifier appends cleanly to it and renders ` +
    'as one combined glyph on any client that supports Fitzpatrick modifiers — current iOS, Android, ' +
    'Windows, WhatsApp and Slack builds all do. Older clients and some inboxes simply show the untoned ' +
    'version instead of the tone.'
  );
}

/* ------------------------------------------------------------------ */
/* Long-form templates                                                  */
/* ------------------------------------------------------------------ */

/**
 * Overview — the opening paragraph differs per tone so the five variants of a
 * family open on different ground.
 */
export function overview(ctx: ToneContext): string {
  switch (ctx.tone) {
    case 'light':
      return (
        `${ctx.glyph} is ${ctx.baseTitle} rendered with a light skin tone — ${ctx.depicts}. ` +
        `The gesture itself is doing the same work it does in ${ctx.baseGlyph}, so the reading is ` +
        `${ctx.reads}. What the swatch adds is proximity. ${cap(ctx.picker)}. People press it without ` +
        `thinking, which is exactly why the tone rarely gets read as a statement on its own. That is the ` +
        `useful thing to know about ${ctx.glyph} — it is the tone that disappears into the sentence.\n\n` +
        `The trap with this variant is that it gets borrowed. Because it is the swatch people reach for ` +
        `without looking, ${ctx.glyph} is frequently used to stand in for somebody else — a friend in a ` +
        `screenshot, a character in a story, a figure in a joke. When that happens the tone is doing no ` +
        `work, and the risk is that a reader takes the borrowing as a description of the person who sent it.\n\n` +
        `Where it lands in practice is spelled out below, and the pattern is unremarkable: the gesture ` +
        `does the work and the tone is incidental. It sits next to ${ctx.contrastGlyph} ${ctx.contrastTitle} ` +
        `often enough to be worth separating: ` +
        `${stop(ctx.contrastNote)} And the standard misread for this glyph is worth naming outright — it ` +
        `gets ${stop(ctx.misread)}`
      );

    case 'medium-light':
      return (
        `${ctx.glyph} shows ${ctx.baseTitle} with a medium-light skin tone — ${ctx.depicts}. ` +
        `Underneath the tone, the gesture is unchanged: this is ${ctx.reads}, and it is the same ` +
        `conversation move as ${ctx.baseGlyph}. The swatch is the part that differs.\n\n` +
        `Medium-light sits second in the standard tone list, so it takes one deliberate tap past the ` +
        `default to reach. That small extra effort is what shapes how it lands. ${cap(ctx.signal)}. ` +
        `In practice that means ${ctx.glyph} tends to arrive from someone who looked at the picker rather ` +
        `than someone who fired the emoji out of habit, and it is correspondingly harder to treat as neutral.\n\n` +
        `The practical uses are the family ones, unchanged by the tone. ` +
        `The confusion to watch for is with ${ctx.contrastGlyph} ${ctx.contrastTitle} — ${stop(ctx.contrastNote)} ` +
        `And like every member of this family, ${ctx.glyph} carries one misread more often than the rest: it ` +
        `gets ${stop(ctx.misread)}`
      );

    case 'medium':
      return (
        `There are five skin tones in the Fitzpatrick set and ${ctx.glyph} is the one in the middle of ` +
        `them — ${ctx.baseTitle} with a medium skin tone, ${ctx.depicts}. Because it sits in the middle of ` +
        `the list and several keyboards default to it, it is the variant that most often ends up standing ` +
        `in for "somebody", with no view at all from the sender. ${cap(ctx.signal)}\n\n` +
        `That neutrality is useful and it is also the reason to be careful. ${ctx.glyph} reads as ` +
        `${ctx.reads}, the same job ${ctx.baseGlyph} does. But because the medium swatch is so often ` +
        `pressed by people who are simply not thinking about skin tone, it is also the variant that most ` +
        `often ends up describing somebody who is not the sender — and the most likely to be misread that way.\n\n` +
        `The situations it turns up in are the family ones, unchanged by the tone. ` +
        `It gets mixed up with ${ctx.contrastGlyph} ${ctx.contrastTitle} more than it should — ` +
        `${stop(ctx.contrastNote)} The misread that comes up most often with this glyph is specific enough to ` +
        `name: it gets ${stop(ctx.misread)}`
      );

    case 'medium-dark':
      return (
        `${ctx.glyph} is ${ctx.baseTitle} with a medium-dark skin tone — ${ctx.depicts}. ` +
        `The gesture is the familiar one, doing what it always does: ${ctx.reads}. ` +
        `What makes this variant worth its own page is that the tone is not an accident. ` +
        `${cap(ctx.picker)}, and that effort shows up in how the message lands.\n\n` +
        `The upshot is that ${ctx.glyph} reads as chosen. Where a first-swatch emoji can be waved past, ` +
        `a tone someone had to reach for tends to be read as a small, deliberate piece of information — ` +
        `usually about who the message is coming from, occasionally about who it is about. ` +
        `Neither reading is wrong, but they are not interchangeable, and that is where the confusion with ` +
        `${ctx.contrastGlyph} ${ctx.contrastTitle} comes from: ${stop(ctx.contrastNote)}\n\n` +
        `The situations it turns up in are the family ones, unchanged by the tone. ` +
        `The misread that keeps coming up is this: it gets ${stop(ctx.misread)}`
      );

    case 'dark':
      return (
        `Reaching ${ctx.glyph} takes work, because ${ctx.picker}. ` +
        `That is worth knowing, because it changes what the emoji means in a thread. ${ctx.glyph} is ` +
        `${ctx.baseTitle} with a dark skin tone, ${ctx.depicts}, and it is doing the same job as ` +
        `${ctx.baseGlyph}: ${ctx.reads}.\n\n` +
        `But a tone that someone went looking for is not a tone that gets skimmed. ${cap(ctx.signal)}. ` +
        `In a group chat, ${ctx.glyph} tends to get a second look, and it tends to get one for a reason — ` +
        `either because it genuinely represents the sender, or because the sender wanted it to. ` +
        `The difference between those two is not visible from the emoji alone, which is the single most ` +
        `important thing to understand about this variant.\n\n` +
        `The situations it turns up in are the family ones, unchanged by the tone, and the trap is the ` +
        `same one the rest of the set has: it gets ${stop(ctx.misread)} ` +
        `The neighbouring glyph people reach for instead is ${ctx.contrastGlyph} ${ctx.contrastTitle} — ` +
        `${stop(ctx.contrastNote)}`
      );
  }
}

/** How people actually use it — one scenario list per tone. */
export function howPeopleUseIt(ctx: ToneContext): string {
  const shared =
    `The gesture is the same one ${ctx.baseGlyph} makes, so the family habits carry straight over. ` +
    `What changes with ${ctx.glyph} is who tends to send it and what they are assuming about the reader.`;
  switch (ctx.tone) {
    case 'light':
      return (
        `${shared}\n\n` +
        `Because ${ctx.picker}, ${ctx.glyph} tends to be sent in passing — a reaction to a photo, a ` +
        `half-second addition to a sentence, a mark on the end of a line. It turns up in ${ctx.use1}, and ` +
        `in ${ctx.use2}. It also turns up in screenshots, forwarded messages, and quotes of other people, ` +
        `where the skin tone belongs to whoever was in the original picture rather than to the sender. ` +
        `That is the single most common context for this variant, and the one most likely to be ` +
        `misunderstood as a statement about the person forwarding it.\n\n` +
        `The tone is almost never the point. ${ctx.glyph} reads as ${ctx.register}, which is why it usually ` +
        `gets skimmed the way any other emoji in this family gets skimmed.`
      );
    case 'medium-light':
      return (
        `${shared}\n\n` +
        `Medium-light is reached with one extra tap, and the extra tap shows in the usage pattern. ` +
        `${ctx.glyph} more often appears where somebody was picking a version on purpose — a profile picture ` +
        `caption, an avatar, a signature emoji, a reaction in a thread where the choice was not incidental. ` +
        `You will see it in ${ctx.use1}, and in ${ctx.use2}.\n\n` +
        `It also shows up as a middle path. When the exact tone is not obvious, or when the sender is ` +
        `representing a character rather than themselves, medium-light is the compromise — and that is ` +
        `worth keeping in mind, because a compromise tone reads as deliberately neutral while carrying none ` +
        `of the reassurance of the neutral-sounding default.`
      );
    case 'medium':
      return (
        `${shared}\n\n` +
        `The medium swatch is the workhorse of the set. ${ctx.glyph} is the one people send when they are ` +
        `not trying to make a point about skin tone at all, which makes it the variant most likely to be ` +
        `used as a stand-in for someone unspecified. You will see it in ${ctx.use1}, and in ${ctx.use2}, ` +
        `and in a great many places where the sender simply pressed the emoji that was already selected.\n\n` +
        `The flip side of that ubiquity is that the tone carries almost no signal of its own. ${ctx.glyph} ` +
        `reads as ${ctx.register}, and it tends to disappear into the line it sits on. If the sender wanted ` +
        `the skin tone to mean something, this is the variant that will not deliver it.`
      );
    case 'medium-dark':
      return (
        `${shared}\n\n` +
        `Medium-dark takes an extra tap to reach, and ${ctx.glyph} shows up in the places where that extra ` +
        `tap was made on purpose: profile photos, avatars, introductions, and the emoji people pick for ` +
        `themselves rather than for a situation. It appears in ${ctx.use1}, and in ${ctx.use2}, and it is ` +
        `more likely than the other tones to be the sender's own.\n\n` +
        `It is also the tone that gets borrowed most, because it sits closer to the middle of the list and ` +
        `so reads as a reasonable approximation of a lot of people. When ${ctx.glyph} is used to stand in ` +
        `for somebody else, the tone is quietly doing a job the sender never mentioned.`
      );
    case 'dark':
      return (
        `${shared}\n\n` +
        `Because it is the last swatch, ${ctx.glyph} shows up where the tone was the point: an avatar, a ` +
        `profile picture, an introduction of oneself, a reaction that is meant to carry the sender's own ` +
        `appearance. It appears in ${ctx.use1}, and in ${ctx.use2}.\n\n` +
        `It is also, for the same reason, the tone most likely to be deployed as a joke about someone's skin, ` +
        `which is the context where it stops being harmless. ${ctx.glyph} used about someone other than the ` +
        `sender, with no context, is the version of this emoji that causes real offence — and the reason is ` +
        `not the gesture but the fact that the tone was chosen to make a point.`
      );
  }
}

/** When not to use it — the tone-specific traps. */
export function whenNotToUse(ctx: ToneContext): string {
  const common =
    `The family rule applies first, and it is the one spelled out above: the standard misread of this ` +
    `glyph belongs to ${ctx.baseGlyph} itself, and every tone in this family inherits it.`;
  switch (ctx.tone) {
    case 'light':
      return (
        `${common}\n\n` +
        `The tone-specific rule for ${ctx.glyph} is simpler: do not use it as if it were a description of ` +
        `anyone. Because the light swatch is the default press, it gets attached to people, characters and ` +
        `screenshots constantly without anyone deciding what the skin tone was doing there. If you are ` +
        `writing about a real person, use their name or a neutral emoji instead of defaulting to ` +
        `${ctx.glyph}.\n\n` +
        `Also skip ${ctx.glyph} when the message is about the tone itself — a joke that only works if the ` +
        `reader notices the swatch — because the light tone is too ordinary to be noticed on purpose.`
      );
    case 'medium-light':
      return (
        `${common}\n\n` +
        `For ${ctx.glyph}, the specific trap is the compromise. It is easy to reach for a middle tone as a ` +
        `safe approximation, but a safe approximation is not neutral — it is a guess, and the guess is ` +
        `visible to anyone who has thought about it. If you do not know whose skin tone you are depicting, ` +
        `use ${ctx.baseGlyph} rather than reaching for a swatch that lands in the wrong place.\n\n` +
        `Avoid ${ctx.glyph} when the tone is supposed to be read as deliberate but the rest of the message ` +
        `is casual. A chosen tone pulls the reader's attention to the emoji, and that attention does not ` +
        `transfer to the sentence.`
      );
    case 'medium':
      return (
        `${common}\n\n` +
        `The trap for ${ctx.glyph} is that its neutrality is an illusion. It is chosen by reflex more often ` +
        `than by intent, and a reflex choice is not a statement about the sender. Do not send ${ctx.glyph} ` +
        `expecting it to be read as "this is what I look like" unless that is genuinely why you picked it — ` +
        `the medium swatch is the one most likely to have been selected without a thought at all.\n\n` +
        `And skip it when a specific person is being depicted and you would be guessing at their skin tone. ` +
        `The default-position argument cuts the other way here: the easiest swatch to press is the easiest ` +
        `one to press by accident, and it is the one that looks most like a decision.`
      );
    case 'medium-dark':
      return (
        `${common}\n\n` +
        `The tone-specific rule for ${ctx.glyph} is about borrowed representation. This is the swatch people ` +
        `reach for when they are depicting somebody else, and it is the swatch most likely to be wrong. ` +
        `If you are sending ${ctx.glyph} to stand in for another person, either know that you are doing it ` +
        `deliberately and accept that it will read that way, or use ${ctx.baseGlyph} instead.\n\n` +
        `Also avoid ${ctx.glyph} in professional threads where a chosen skin tone on a neutral emoji can look ` +
        `like a stance the message never made. The tone says the sender chose it, and readers will read ` +
        `the choice even when the sentence does not support it.`
      );
    case 'dark':
      return (
        `${common}\n\n` +
        `The trap for ${ctx.glyph} is the obvious one, and it is worth stating plainly: the darkest swatch ` +
        `is the one most often used as a joke about skin. Because it takes a deliberate scroll to reach, ` +
        `the emoji reads as a statement about somebody, and if the sender is not the somebody, it lands as ` +
        `a comment on their appearance. Do not use ${ctx.glyph} to depict another person without a reason ` +
        `you would be comfortable explaining out loud.\n\n` +
        `Beyond that, skip it when the moment is light enough that a swatch with this much weight will ` +
        `outweigh the sentence. ${ctx.glyph} gets a second look in every thread it lands in, and not every ` +
        `message can afford that.`
      );
  }
}

/** How to reply — tone-aware mirroring guidance. */
export function howToReply(ctx: ToneContext): string {
  switch (ctx.tone) {
    case 'light':
      return (
        `Mirror with ${ctx.baseGlyph} or with another light tone if you want to match without making the ` +
        `swatch a point. Because the light tone is the default press, it is the safest tone to send back: ` +
        `nobody reads anything into it.\n\n` +
        `If the sender is representing themselves with ${ctx.glyph} and you want to acknowledge that ` +
        `specifically, ${ctx.toneChar} with a sentence naming the moment works better than a bare emoji. ` +
        `And if the message is one of the family's usual misfires — the gesture read as something ` +
        `harsher than it was — a plain sentence is usually more effective than any mirrored emoji.`
      );
    case 'medium-light':
      return (
        `Reply with ${ctx.baseGlyph} if you want to match the gesture without adopting a swatch. ` +
        `Matching the tone is only worth doing when the sender was clearly choosing on purpose — in that ` +
        `case, ${ctx.toneChar} back is a real acknowledgement of their choice.\n\n` +
        `If ${ctx.glyph} was a compromise rather than a decision, do not read it as one. Respond to the ` +
        `gesture and the sentence, not to the tone.`
      );
    case 'medium':
      return (
        `The simplest reply is ${ctx.baseGlyph} with the same gesture and no tone commentary, because the ` +
        `medium swatch does not usually carry a message of its own.\n\n` +
        `If the sender was representing themselves, though, ${ctx.toneChar} back is warmer than ${ctx.baseGlyph} ` +
        `— it says you registered what they chose. If they were representing somebody else, match the ` +
        `gesture only.`
      );
    case 'medium-dark':
      return (
        `Matching the swatch is the acknowledging move here. If somebody picks a tone deliberately and you ` +
        `reply with ${ctx.toneChar}, you are telling them you noticed; ${ctx.baseGlyph} reads as though you ` +
        `did not.\n\n` +
        `Keep the reply proportionate otherwise. A sentence that names the moment will land better than a ` +
        `mirrored emoji when the message is the kind that invites a reply — the gesture is a good ` +
        `conversation opener on its own.`
      );
    case 'dark':
      return (
        `Reply with ${ctx.toneChar} if the sender was representing themselves — matching the darkest swatch ` +
        `is one of the more concrete ways to say you saw what they chose. ${ctx.baseGlyph} is fine when the ` +
        `tone was incidental.\n\n` +
        `If the tone was pointed — if ${ctx.glyph} was deployed as a joke about somebody's skin — the ` +
        `reply is a sentence, not an emoji. Nothing mirrors that well, and a mirrored emoji makes the ` +
        `joke land twice.`
      );
  }
}

/** FAQ entries — five per tone, each answering a different question. */
export function faqs(ctx: ToneContext): EmojiFaq[] {
  switch (ctx.tone) {
    case 'light':
      return [
        {
          question: `What does ${ctx.glyph} mean in text?`,
          answer:
            `${ctx.glyph} is ${ctx.baseTitle} drawn with a light skin tone. ` +
            `The gesture still reads as ${ctx.reads}, but because the light swatch is the one most pickers ` +
            `default to, the tone itself rarely gets interpreted.`,
        },
        {
          question: `Does the light skin tone in ${ctx.glyph} mean anything on its own?`,
          answer:
            `Usually not. ${cap(ctx.picker)} — so most senders pick it without deciding to. ` +
            `It starts carrying meaning when somebody chooses it to depict a specific person.`,
        },
        {
          question: `What does ${ctx.glyph} mean from a guy?`,
          answer:
            `Nothing changes about the gesture, so nothing changes about the read. ` +
            `The skin tone is not gendered and does not add a gendered meaning to ${ctx.baseGlyph}.`,
        },
        {
          question: `Is ${ctx.glyph} rude?`,
          answer:
            `The tone is not what makes it rude. ${ctx.baseGlyph} carries the risk on its own, and the light ` +
            `swatch does not make the gesture safer or bolder — it only changes which version of it you sent.`,
        },
        {
          question: `What is the difference between ${ctx.glyph} and ${ctx.baseGlyph}?`,
          answer:
            `Only the skin tone. ${ctx.baseGlyph} is the tone-less version, and it is the one to use when ` +
            `you are not depicting a specific person. ${stop(cap(ctx.contrastNote))}`,
        },
      ];
    case 'medium-light':
      return [
        {
          question: `What does ${ctx.glyph} mean in chat?`,
          answer:
            `${ctx.glyph} is ${ctx.baseTitle} with a medium-light skin tone. ` +
            `It reads as ${ctx.reads}, and the swatch adds a small note of deliberation.`,
        },
        {
          question: `Is ${ctx.glyph} a deliberate choice?`,
          answer:
            `More often than the first swatch. ${cap(ctx.picker)}. ` +
            `That extra step is why ${ctx.glyph} carries a slightly more intentional read than the default tone.`,
        },
        {
          question: `What does ${ctx.glyph} mean from a girl?`,
          answer:
            `The same as it means from anyone else. The gesture is unchanged, and the skin tone ` +
            `does not shift the meaning by itself.`,
        },
        {
          question: `Should I use ${ctx.glyph} to represent someone else?`,
          answer:
            `Carefully. ${ctx.glyph} is a reasonable approximation for a lot of people, which is exactly why ` +
            `it gets borrowed so often. If you are depicting a specific person and you are not certain, ` +
            `use ${ctx.baseGlyph} instead of guessing.`,
        },
        {
          question: `What is the difference between ${ctx.glyph} and ${ctx.contrastGlyph} ${ctx.contrastTitle}?`,
          answer: `${stop(ctx.contrastNote)} The tone does not change that — ${ctx.glyph} is the same gesture in a different swatch.`,
        },
      ];
    case 'medium':
      return [
        {
          question: `What does ${ctx.glyph} mean in text?`,
          answer:
            `${ctx.glyph} is ${ctx.baseTitle} with a medium skin tone. ` +
            `The gesture reads as ${ctx.reads}.`,
        },
        {
          question: `Is the medium skin tone in ${ctx.glyph} a statement?`,
          answer:
            `Rarely on its own. ${cap(ctx.picker)}. ` +
            `It is the variant people pick when they are not thinking about skin tone, so it rarely reads ` +
            `as one.`,
        },
        {
          question: `What does ${ctx.glyph} mean from a guy?`,
          answer:
            `The tone does not change the gesture, so the read is the same. There is no separate gendered ` +
            `reading of ${ctx.baseGlyph}.`,
        },
        {
          question: `Is ${ctx.glyph} rude?`,
          answer:
            `Not because of the swatch. The gesture carries that risk on its own, and the medium tone does ` +
            `not add to it.`,
        },
        {
          question: `What is the difference between ${ctx.glyph} and ${ctx.baseGlyph}?`,
          answer:
            `The swatch, and only the swatch. ${ctx.baseGlyph} is the tone-less version and is the safer ` +
            `choice whenever you are not depicting a specific person.`,
        },
      ];
    case 'medium-dark':
      return [
        {
          question: `What does ${ctx.glyph} mean in chat?`,
          answer:
            `${ctx.glyph} is ${ctx.baseTitle} with a medium-dark skin tone. ` +
            `The gesture reads as ${ctx.reads}, and the tone reads as chosen rather than defaulted to.`,
        },
        {
          question: `Why does ${ctx.glyph} feel more intentional than ${ctx.baseGlyph}?`,
          answer:
            `Because of the picker position. ${cap(ctx.picker)}. ` +
            `A swatch that takes extra taps gets read as a decision.`,
        },
        {
          question: `What does ${ctx.glyph} mean from a girl?`,
          answer:
            `The gesture reads the same as it does from anyone else. The tone does not add a ` +
            `gendered layer to ${ctx.baseGlyph}.`,
        },
        {
          question: `Is it rude to use ${ctx.glyph} to describe someone else?`,
          answer:
            `It can be, and this is the tone where that happens most often. ${cap(ctx.caveat)}. ` +
            `If you are unsure, ${ctx.baseGlyph} avoids the problem entirely.`,
        },
        {
          question: `What is the difference between ${ctx.glyph} and ${ctx.contrastGlyph} ${ctx.contrastTitle}?`,
          answer: `${stop(ctx.contrastNote)}`,
        },
      ];
    case 'dark':
      return [
        {
          question: `What does ${ctx.glyph} mean in text?`,
          answer:
            `${ctx.glyph} is ${ctx.baseTitle} with a dark skin tone. ` +
            `The gesture reads as ${ctx.reads}, and the swatch is the heaviest of the five.`,
        },
        {
          question: `Is ${ctx.glyph} a deliberate choice?`,
          answer:
            `Almost always. ${cap(ctx.picker)}. ` +
            `That is why ${ctx.glyph} gets a second look in a thread while ${ctx.baseGlyph} does not.`,
        },
        {
          question: `What does ${ctx.glyph} mean from a guy?`,
          answer:
            `The gesture reads the same as it does from anyone else. The skin tone is not a ` +
            `gendered signal on ${ctx.baseGlyph}.`,
        },
        {
          question: `Is ${ctx.glyph} offensive?`,
          answer:
            `It can be, and it is the tone most often used as a joke about skin. ${cap(ctx.caveat)}. ` +
            `Used to depict the sender, it is one of the most personal choices in the emoji set.`,
        },
        {
          question: `What is the difference between ${ctx.glyph} and ${ctx.baseGlyph}?`,
          answer:
            `The swatch, and it matters more here than for the other tones. ${ctx.baseGlyph} is the ` +
            `tone-less version, and it is the right pick whenever the sender is not the person being shown.`,
        },
      ];
  }
}

/**
 * Platform notes — tone rendering differs by client.
 *
 * Each tone gets its own set of notes. The rendering facts are shared across
 * the family, but the *interesting* platform detail is not: the light swatch
 * is the one that gets flattened without anyone noticing, while the darkest
 * swatch is the one whose rendering differs most visibly between clients.
 */
export function platformNotes(ctx: ToneContext): PlatformNote[] {
  const zwj = ctx.renderKind === 'zwj';
  switch (ctx.tone) {
    case 'light':
      return [
        {
          platform: 'IMESSAGE',
          note:
            `On iOS ${ctx.glyph} renders as one combined glyph with the tone applied, since Apple has ` +
            `supported Fitzpatrick modifiers since iOS 9.3. The light swatch is also the hardest one to ` +
            `judge on a screen: it sits close enough to the untoned version that most readers do not ` +
            `register a tone at all.`,
        },
        {
          platform: 'WHATSAPP',
          note:
            `WhatsApp applies the tone on current builds and lists the swatches in the same order as ` +
            `every other client, so the light swatch is the first one in the row. Older Android builds ` +
            `fall back to the untoned glyph, which means an old screenshot can show ${ctx.baseGlyph} ` +
            `where a new phone shows ${ctx.glyph}.`,
        },
        {
          platform: 'TWITTER',
          note:
            `Twitter renders through Twemoji, which applies the light modifier consistently to plain ` +
            `emoji. Because the swatch is the default one, a screenshot of a reply rarely carries enough ` +
            `contrast to tell a light variant from an untoned one.`,
        },
        {
          platform: 'SLACK',
          note:
            `Slack uses its own emoji font, and its light swatch renders flatter and slightly paler than ` +
            `the same glyph on a phone. That is a font difference rather than a meaning difference, but ` +
            `it does mean ${ctx.glyph} looks less obviously toned in a Slack thread than in Messages.`,
        },
        {
          platform: 'DISCORD',
          note:
            `Discord also uses Twemoji, so ${ctx.glyph} looks the same there as it does on Twitter. The ` +
            `practical thing to remember is that bots, bridges and older clients in the middle of a ` +
            `chain flatten the tone first, and a light swatch is the one most likely to be flattened ` +
            `without anyone noticing.`,
        },
      ];
    case 'medium-light':
      return [
        {
          platform: 'IMESSAGE',
          note:
            `On iOS ${ctx.glyph} renders as a single toned glyph, and the medium-light swatch is the ` +
            `second one along in Apple's picker. It is far enough from the untoned version to be noticed ` +
            `but close enough that a screenshot taken at small size can still read as untoned.`,
        },
        {
          platform: 'WHATSAPP',
          note:
            `WhatsApp renders the tone correctly on current builds, and its picker puts the ` +
            `medium-light swatch second, so a sender reaches it with one tap past the default. Older ` +
            `Android builds of WhatsApp drop the modifier entirely, and because this is not the swatch ` +
            `people reach for by habit, the fallback is more often noticed than it is with the default.`,
        },
        {
          platform: 'TWITTER',
          note:
            `Twemoji applies the tone to ${ctx.glyph} consistently, and ${
              zwj
                ? 'the zero-width-joiner ' +
                  `sequence is where coverage is patchiest, so the modifier can drop out on an older client `
                : `the modifier is applied to the single code point, so the swatch is preserved `
            }while the ` + `rest of the message does not survive a quote-tweet intact.`,
        },
        {
          platform: 'SLACK',
          note:
            `Slack's own emoji font renders the medium-light swatch a shade warmer than the phone ` +
            `version, which is the usual reason somebody screenshots a Slack message and gets a ` +
            `slightly different looking emoji than the one they sent.`,
        },
        {
          platform: 'DISCORD',
          note:
            `Discord uses Twemoji as well, and its web and mobile clients agree with each other on the ` +
            `medium-light swatch. The risk sits with bots and bridges, which usually pass the tone ` +
            `through only when the emoji survived the trip as a single code point.`,
        },
      ];
    case 'medium':
      return [
        {
          platform: 'IMESSAGE',
          note:
            `On iOS ${ctx.glyph} renders as one combined glyph with the tone applied. The medium swatch ` +
            `is the one several keyboards select when the picker opens, so on a device with that ` +
            `default set, ${ctx.glyph} is often the result of a finger never touching the tone list.`,
        },
        {
          platform: 'WHATSAPP',
          note:
            `WhatsApp applies the medium modifier on current builds and puts the swatch in the middle ` +
            `of the row. It renders the most consistently of the five tones across the clients people ` +
            `actually use, which is part of why the medium variant is the one most often mistaken for ` +
            `a deliberately neutral choice.`,
        },
        {
          platform: 'TWITTER',
          note:
            `Twemoji renders ${ctx.glyph} the same way on every device, which makes the medium swatch ` +
            `the easiest one to identify in a screenshot. The confusion is not visual: it is that a ` +
            `medium tone so often stands in for somebody the sender never asked you to picture.`,
        },
        {
          platform: 'SLACK',
          note:
            `Slack renders the medium swatch slightly flatter than the phone version, in the same way ` +
            `it flattens every swatch. Nothing about ${ctx.glyph} changes meaning in Slack, but a ` +
            `workspace that reacts with it constantly can make the tone look like a signature it never ` +
            `was.`,
        },
        {
          platform: 'DISCORD',
          note:
            `Discord uses Twemoji and applies the modifier cleanly. The medium swatch survives ` +
            `copy-paste and re-posting better than the extremes of the list, which is another reason it ` +
            `has become the default in a lot of servers without anybody deciding on it.`,
        },
      ];
    case 'medium-dark':
      return [
        {
          platform: 'IMESSAGE',
          note:
            `On iOS ${ctx.glyph} renders as a single toned glyph, and the medium-dark swatch is the ` +
            `fourth of the five in Apple's picker — it takes an extra tap past the three before it. ` +
            `Because it is chosen less often, it is also the one a sender is most likely to have ` +
            `picked on purpose.`,
        },
        {
          platform: 'WHATSAPP',
          note:
            `WhatsApp lists the medium-dark swatch fourth and renders it correctly on current builds, ` +
            `but older Android versions of the app fall back to the untoned glyph. In practice the ` +
            `medium-dark variant is one of the tones that loses its meaning most often in forwarded ` +
            `messages, because the fallback removes the part that was deliberate.`,
        },
        {
          platform: 'TWITTER',
          note:
            `Twemoji applies the tone to ${ctx.glyph} consistently. The medium-dark swatch holds its ` +
            `contrast better on a white background than the darkest one does, so it survives ` +
            `screenshotting and re-posting more often than the tone it sits next to.`,
        },
        {
          platform: 'SLACK',
          note:
            `Slack's emoji font renders the medium-dark swatch with less contrast than the phone ` +
            `version does, and the difference is more noticeable here than for the lighter tones. ` +
            `People who picked the swatch to represent themselves can look under-represented in a ` +
            `Slack screenshot for no reason other than the font.`,
        },
        {
          platform: 'DISCORD',
          note:
            `Discord uses Twemoji, so the modifier is preserved, but bots and integrations that rewrite ` +
            `messages are the weak point. The medium-dark swatch is the one most likely to arrive ` +
            `untoned, and the reason it was chosen in the first place is usually the reason it matters.`,
        },
      ];
    case 'dark':
      return [
        {
          platform: 'IMESSAGE',
          note:
            `On iOS ${ctx.glyph} renders as one combined glyph with the tone applied. The dark swatch ` +
            `is the last one in Apple's picker, and it is also the one where the rendering difference ` +
            `between clients is largest: the same emoji can look like a ` +
            `noticeably different person depending on which font drew it.`,
        },
        {
          platform: 'WHATSAPP',
          note:
            `WhatsApp applies the dark modifier on current builds and lists it last, so it takes a ` +
            `deliberate scroll. Older Android builds of WhatsApp fall back to the untoned glyph, and ` +
            `because the dark swatch is the most conspicuous of the five when it does render, the ` +
            `difference between the two is the one people notice.`,
        },
        {
          platform: 'TWITTER',
          note:
            `Twemoji renders ${ctx.glyph} with the dark swatch intact, and it is the tone most often ` +
            `used deliberately on the platform, so it is also the one most likely to be screenshotted ` +
            `out of context and read as a comment on whoever is in the picture.`,
        },
        {
          platform: 'SLACK',
          note:
            `Slack's own emoji font renders the dark swatch with less contrast against the darker ` +
            `themes than the phone version does. On a dark background the tone can lose definition ` +
            `entirely, which is worth knowing before you conclude that somebody sent something else.`,
        },
        {
          platform: 'DISCORD',
          note:
            `Discord uses Twemoji and applies the modifier cleanly. As with the other dark-swatch ` +
            `uses, the interesting failure mode is not rendering but reuse: ${ctx.glyph} forwarded into ` +
            `a channel it was not meant for keeps its meaning as a statement and loses its context.`,
        },
      ];
  }
}

/** Generational notes — how different cohorts pick and read a tone. */
export function generationalNotes(ctx: ToneContext): GenerationalNote[] {
  const notes: GenerationalNote[] = [];
  switch (ctx.tone) {
    case 'light':
      notes.push({
        generation: 'GEN_Z',
        note:
          `Gen Z reaches for ${ctx.glyph} constantly and almost never as a statement, because ${ctx.picker}. ` +
          `What the generation does instead is default to it and then override it later, which is why the ` +
          `light swatch shows up so often in avatars that were meant to be personalised.`,
      });
      notes.push({
        generation: 'MILLENNIAL',
        note:
          `Millennials send ${ctx.glyph} as the safe version of ${ctx.baseGlyph}, particularly in mixed ` +
          `groups where nobody wants to guess at a representation. The tone gets changed deliberately only ` +
          `when the picture is of the sender.`,
      });
      notes.push({
        generation: 'GEN_X',
        note:
          `Gen X tends to treat ${ctx.glyph} as simply ${ctx.baseGlyph} with a face on it, and picks the ` +
          `light swatch because it is first in the list. The tone is rarely interpreted at all in this cohort.`,
      });
      break;
    case 'medium-light':
      notes.push({
        generation: 'GEN_Z',
        note:
          `Gen Z is the cohort most likely to pick ${ctx.glyph} deliberately, because the swatch is ` +
          `familiar enough to reach without hunting and rare enough to feel like a choice. It is used to ` +
          `represent the sender more often than the other four tones.`,
      });
      notes.push({
        generation: 'MILLENNIAL',
        note:
          `Millennials reach for ${ctx.glyph} when a message needs a slightly more personal feel than ` +
          `${ctx.baseGlyph} gives, without the weight of the two darker swatches. It sits in the middle of ` +
          `what this generation is comfortable with.`,
      });
      notes.push({
        generation: 'GEN_X',
        note:
          `Gen X mostly treats ${ctx.glyph} as decoration. The swatch is picked because it was next in the ` +
          `list, not because it carries a message.`,
      });
      break;
    case 'medium':
      notes.push({
        generation: 'GEN_Z',
        note:
          `Gen Z has largely stopped treating the medium swatch as neutral and uses ${ctx.glyph} less than ` +
          `the older tones, because the middle of the Fitzpatrick list no longer reads as a safe default. ` +
          `When it does appear it is usually an unintentional leftover.`,
      });
      notes.push({
        generation: 'MILLENNIAL',
        note:
          `Millennials use ${ctx.glyph} heavily as the neutral middle option — the tone that looks ` +
          `deliberate without looking like a statement. It is one of the most common swatches in messages ` +
          `from this cohort.`,
      });
      notes.push({
        generation: 'GEN_X',
        note:
          `Gen X treats ${ctx.glyph} as a plain ${ctx.baseGlyph}. The medium swatch was the default in the ` +
          `keyboards this cohort grew up with, so it usually reflects the settings rather than the sender.`,
      });
      break;
    case 'medium-dark':
      notes.push({
        generation: 'GEN_Z',
        note:
          `Gen Z reads ${ctx.glyph} as a deliberate choice, because the swatch takes extra taps to reach. ` +
          `This cohort is also the most likely to notice when ${ctx.glyph} has been used to depict somebody ` +
          `else, and to read that as a statement about the person.`,
      });
      notes.push({
        generation: 'MILLENNIAL',
        note:
          `Millennials pick ${ctx.glyph} when representing themselves, and treat it as personal in a way ` +
          `they do not treat the lighter tones. It is also the tone most often borrowed to depict somebody ` +
          `else in this cohort.`,
      });
      notes.push({
        generation: 'GEN_X',
        note:
          `Gen X is less likely to change the tone at all, so ${ctx.glyph} appears mostly in messages where ` +
          `the sender was depicting themselves. The swatch is read as personal rather than political.`,
      });
      break;
    case 'dark':
      notes.push({
        generation: 'GEN_Z',
        note:
          `Gen Z uses ${ctx.glyph} as a clear statement of self, and is also the cohort most alert to its ` +
          `use about other people. Because the swatch is unmistakable, the reaction to a misused ${ctx.glyph} ` +
          `in this cohort is fast and rarely subtle.`,
      });
      notes.push({
        generation: 'MILLENNIAL',
        note:
          `Millennials use ${ctx.glyph} when they are representing themselves, and read the tone as ` +
          `personal. It is also the tone most often borrowed to depict somebody else, which is where it ` +
          `turns from a self-description into a comment on somebody's appearance.`,
      });
      notes.push({
        generation: 'GEN_X',
        note:
          `Gen X rarely changes the tone, so ${ctx.glyph} mostly shows up as self-representation. Older ` +
          `clients in this cohort also flatten it more often, so the glyph a sender saw is not always the ` +
          `glyph a recipient saw.`,
      });
      break;
  }
  return notes;
}

/** Warnings — the tone-specific risks, worded as editorial warnings. */
export function warnings(ctx: ToneContext): EmojiWarning[] {
  const out: EmojiWarning[] = [];
  if (ctx.tone === 'dark') {
    out.push({
      title: 'Do not use the dark swatch as a joke about skin',
      description:
        `${ctx.glyph} is the tone most often used to make a point about somebody's appearance. Used about ` +
        `someone other than the sender, it is read as a comment on their skin rather than as the gesture.`,
      severity: 'HIGH',
    });
  }
  if (ctx.tone === 'medium-dark' || ctx.tone === 'medium') {
    out.push({
      title: 'Borrowed skin tones are the usual failure point',
      description:
        `${ctx.glyph} is frequently used to depict somebody other than its sender, and ${ctx.caveat}. ` +
        `When the person being depicted is in the room, the tone is read as a description of them.`,
      severity: 'MEDIUM',
    });
  }
  if (ctx.tone === 'light') {
    out.push({
      title: 'The default swatch is not a neutral one',
      description:
        `${ctx.glyph} is picked without a decision often enough that it ends up describing people who ` +
        `never chose it. Use ${ctx.baseGlyph} when you are not depicting a specific person.`,
      severity: 'LOW',
    });
  }
  return out;
}

/**
 * Short sample phrases, one set per tone.
 *
 * They are deliberately generic. The family's own wording lives in the
 * overview and in the usage section, and restating it in every sample message
 * is what makes two variants of one emoji read as the same page.
 */
const TONE_PHRASES: Record<
  ToneModifier,
  { slang: string; dating: string; work: string; ironic: string; social: string; family: string }
> = {
  light: {
    slang: 'mm-hm',
    dating: 'say less',
    work: 'on it',
    ironic: 'sure, very calm',
    social: 'ok',
    family: 'alright then',
  },
  'medium-light': {
    slang: 'got it',
    dating: 'careful',
    work: 'understood',
    ironic: 'sure, very normal',
    social: 'right',
    family: 'fine',
  },
  medium: {
    slang: 'copy that',
    dating: 'easy',
    work: 'acknowledged',
    ironic: 'sure, very chill',
    social: 'agreed',
    family: 'okay',
  },
  'medium-dark': {
    slang: 'noted, understood',
    dating: 'hands off',
    work: 'roger',
    ironic: 'sure, very relaxed',
    social: 'indeed',
    family: 'right then',
  },
  dark: {
    slang: 'heard',
    dating: 'back off',
    work: 'confirmed',
    ironic: 'sure, very unbothered',
    social: 'exactly',
    family: 'understood',
  },
};

/**
 * Context meanings — the family's own contexts, re-voiced for the tone.
 *
 * The family's meaning is not restated here. It is set out once, in the
 * overview and in the usage section; what each context adds is how the tone
 * lands inside it.
 */
export function contextMeanings(ctx: ToneContext, types: string[]): ContextMeaning[] {
  const out: ContextMeaning[] = [];
  const phrase = TONE_PHRASES[ctx.tone];
  for (const type of types) {
    switch (type) {
      case 'LITERAL':
        out.push({
          context: 'LITERAL',
          meaning: `Shows the same artwork as the untoned version, with the ${ctx.toneLabel} applied to the ${ctx.toneTarget}.`,
          example: `${ctx.glyph}`,
          riskLevel: 'LOW',
        });
        break;
      case 'SLANG':
        out.push({
          context: 'SLANG',
          meaning: `The gesture reads the same as the untoned version; the ${ctx.toneLabel} makes it ${ctx.register}.`,
          example: `${phrase.slang} ${ctx.glyph}`,
          riskLevel: 'LOW',
        });
        break;
      case 'DATING':
        out.push({
          context: 'DATING',
          meaning: `In a dating thread the gesture is unchanged; the tone makes it ${ctx.dating}.`,
          example: `${phrase.dating} ${ctx.glyph}`,
          riskLevel: 'MEDIUM',
        });
        break;
      case 'WORK':
        out.push({
          context: 'WORK',
          meaning: `In a work thread the gesture is unchanged, and the ${ctx.toneLabel} ${ctx.work}.`,
          example: `${phrase.work} ${ctx.glyph}`,
          riskLevel: 'LOW',
        });
        break;
      case 'IRONIC':
        out.push({
          context: 'IRONIC',
          meaning: `Used ironically to undercut the same reading; the tone choice is part of the joke.`,
          example: `${phrase.ironic} ${ctx.glyph}`,
          riskLevel: 'LOW',
        });
        break;
      case 'PASSIVE_AGGRESSIVE':
        out.push({
          context: 'PASSIVE_AGGRESSIVE',
          meaning:
            `Can carry a passive-aggressive edge when the gesture is aimed at someone rather ` +
            `than described.`,
          example: `${phrase.slang} ${ctx.glyph}`,
          riskLevel: 'MEDIUM',
        });
        break;
      case 'RED_FLAG':
        out.push({
          context: 'RED_FLAG',
          meaning: `The family misread applies here — the one described in the overview.`,
          example: `${phrase.ironic} ${ctx.glyph}`,
          riskLevel: 'HIGH',
        });
        break;
      default:
        out.push({
          context: 'LITERAL',
          meaning: `Shows the same artwork as the untoned version.`,
          example: `${ctx.glyph}`,
          riskLevel: 'LOW',
        });
    }
  }
  return out;
}

/** Conversation examples — five settings, tone-aware messages. */
export function conversationExamples(ctx: ToneContext): ConversationExample[] {
  const phrase = TONE_PHRASES[ctx.tone];
  return [
    {
      setting: 'friends',
      message: `${ctx.use1} ${ctx.glyph}`,
      interpretation:
        `A friend sending ${ctx.glyph} in a chat where the gesture is doing the work. Replying with the ` +
        `same gesture, or with a sentence, both land.`,
    },
    {
      setting: 'dating',
      message: `${ctx.use2} ${ctx.glyph}`,
      interpretation: `A partner message where the tone is doing as much work as the gesture — it is ${ctx.dating}.`,
    },
    {
      setting: 'work',
      message: `${phrase.work} ${ctx.glyph}`,
      interpretation: `A work thread. The ${ctx.toneLabel} ${ctx.work}.`,
    },
    {
      setting: 'family',
      message: `${phrase.family} ${ctx.glyph}`,
      interpretation:
        `A family chat where the emoji is being read literally — the ${ctx.toneLabel} stands for ` +
        `the person in the picture rather than for the tone.`,
    },
    {
      setting: 'social',
      message: `${phrase.social} ${ctx.glyph}`,
      interpretation: `A public post where the gesture is doing the work and the tone is incidental.`,
    },
  ];
}
