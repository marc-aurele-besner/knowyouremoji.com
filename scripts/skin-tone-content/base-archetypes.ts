/**
 * Base-page templates for the skin-tone families.
 *
 * Why this exists
 * ---------------
 * The landing page of a skin-tone family — the page at `/emoji/<slug>` that the
 * five tone variants point at with their canonical link — was still carrying
 * the generated "-coded" boilerplate: "Grandpa-coded wisdom, 'sweet grandpa'
 * register, or family-coded comfort." Every family base read the same way,
 * with the emoji name swapped into the gaps.
 *
 * Those pages are the ones search engines index. The five tone variants are
 * `noindex, follow` and canonicalise to the base, so the base is where the
 * family is actually judged.
 *
 * The templates here build a family base page out of the same hand-authored
 * family profile the tone variants use, plus the facts that only the base
 * knows: that it is the neutral drawing, that five tone variants hang off it,
 * and which emoji sits next to it in the picker.
 *
 * Five structural archetypes are rotated across families so that no two pages
 * in the catalog are built the same way round.
 */

import type {
  ContextType,
  ConversationSetting,
  EmojiFaq,
  Generation,
  Platform,
  RiskLevel,
} from '../../src/types/emoji';
import type { FamilyProfile } from './types';

export interface BaseContext {
  profile: FamilyProfile;
  /** The family title, e.g. `Raised Hand`. */
  title: string;
  /** The family glyph, e.g. `✋`. */
  glyph: string;
  /** The family slug, e.g. `raised-hand`. */
  slug: string;
  /** The category label used by the page, e.g. `People & Body`. */
  category: string;
  /** The sub-category label used by the page, e.g. `Hand`. */
  subcategory: string;
  /** The Unicode version the emoji arrived in. */
  unicodeVersion: string;
  /** The slugs of the five tone variants. */
  toneSlugs: string[];
  /** 0-4, the structural archetype this family is rendered with. */
  archetype: number;
}

/** Rotate through a list of options. */
function choose<T>(archetype: number, options: readonly T[]): T {
  return options[archetype % options.length];
}

/** Capitalise the first letter of a fragment so it can start a sentence. */
function capitalise(text: string): string {
  return text.length > 0 ? text[0].toUpperCase() + text.slice(1) : text;
}

/**
 * Rotate a list of paragraphs around the archetype, so that neighbouring
 * families open their sections differently.
 */
function rotate<T>(archetype: number, paragraphs: readonly T[]): T[] {
  const offset = archetype % paragraphs.length;
  return [...paragraphs.slice(offset), ...paragraphs.slice(0, offset)];
}

/**
 * A stable archetype per slug, so re-running the generator keeps the same
 * page shaped the same way.
 */
export function archetypeFor(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 100003;
  }
  return hash % 5;
}

/** The one-line summary shown on cards and at the top of the page. */
export function baseTldr(ctx: BaseContext): string {
  const { glyph, title, profile } = ctx;
  switch (ctx.archetype) {
    case 0:
      return `${glyph} ${title}: ${profile.reads}.`;
    case 1:
      return `${glyph} ${title} — ${profile.reads}.`;
    case 2:
      return `The ${title.toLowerCase()} emoji ${glyph} reads as ${profile.reads}.`;
    case 3:
      return `${title} ${glyph}: ${profile.reads}.`;
    default:
      return `${glyph} ${title}. In a chat it comes across as ${profile.reads}.`;
  }
}

/** The short description used on cards and in listings. */
export function baseMeaning(ctx: BaseContext): string {
  const { profile } = ctx;
  switch (ctx.archetype) {
    case 0:
      return `A drawing of ${profile.depicts}, used as ${profile.reads}.`;
    case 1:
      return `Shows ${profile.depicts}.`;
    case 2:
      return `${capitalise(profile.depicts)} — ${profile.reads}.`;
    case 3:
      return `A ${ctx.title.toLowerCase()} emoji: ${profile.depicts}.`;
    default:
      return `A picture of ${profile.depicts}. Read in a message it lands as ${profile.reads}.`;
  }
}

/** SEO description — family-specific, so it does not read as a near-duplicate. */
export function baseSeoDescription(ctx: BaseContext): string {
  const { profile, glyph, title } = ctx;
  const misread = profile.misread.replace(/\.$/, '');
  switch (ctx.archetype) {
    case 0:
      return (
        `What the ${title.toLowerCase()} emoji ${glyph} means in text: ${profile.reads}. ` +
        `Includes the misread it invites (${misread}) and how to reply.`
      );
    case 1:
      return (
        `${glyph} ${title} explained: what the drawing shows, when people send it, and why it ` +
        `gets misread as something else.`
      );
    case 2:
      return (
        `The meaning of ${glyph} ${title} in texts and DMs, with the ${title.toLowerCase()} ` +
        `readings, the common misread, and the pickers it gets confused with.`
      );
    case 3:
      return (
        `What ${glyph} means when people send it, the ${title.toLowerCase()} reading, and how to ` +
        `answer it without guessing.`
      );
    default:
      return (
        `${glyph} ${title} meaning: ${profile.reads}. How the emoji is used at work, at home and ` +
        `in dating threads, and where it goes wrong.`
      );
  }
}

/** SEO title. */
export function baseSeoTitle(ctx: BaseContext): string {
  const { glyph, title } = ctx;
  switch (ctx.archetype) {
    case 0:
      return `${glyph} ${title} Emoji Meaning - What Does ${glyph} Really Mean?`;
    case 1:
      return `${glyph} ${title} Emoji: Meaning, Uses and Common Misreads`;
    case 2:
      return `What Does the ${title} Emoji ${glyph} Mean? A Full Breakdown`;
    case 3:
      return `${glyph} ${title} Emoji Meaning and How to Use It`;
    default:
      return `${glyph} ${title} Emoji - What It Actually Means in Text`;
  }
}

/** The meaning of the emoji in each context type it shows up in. */
export function baseContextMeanings(ctx: BaseContext): Array<{
  context: ContextType;
  meaning: string;
  example: string;
  riskLevel: RiskLevel;
}> {
  const { profile, glyph } = ctx;
  const literal: ContextType = 'LITERAL';
  const slang: ContextType = 'SLANG';
  const dating: ContextType = 'DATING';
  const work: ContextType = 'WORK';
  const ironic: ContextType = 'IRONIC';

  const meanings: Array<{
    context: ContextType;
    meaning: string;
    example: string;
    riskLevel: RiskLevel;
  }> = [
    {
      context: literal,
      meaning: `The plain reading: ${profile.depicts}. Nothing hidden in the drawing itself.`,
      example: `${capitalise(profile.uses[0])} ${glyph}`,
      riskLevel: 'LOW',
    },
    {
      context: slang,
      meaning: `Borrowed as a reaction, it reads as ${profile.reads}.`,
      example: `${capitalise(profile.uses[1])} ${glyph}`,
      riskLevel: 'LOW',
    },
    {
      context: dating,
      meaning: `In a dating thread the gesture is usually doing the work of a line that was not typed. It arrives as ${profile.reads}, softened by whatever sentence sits next to it.`,
      example: `not me ${glyph}`,
      riskLevel: 'LOW',
    },
    {
      context: work,
      meaning: `In a work channel it is read the same way it is read anywhere else — ${profile.reads} — but the stakes of a misread are higher, because the sender is often talking about somebody's actual work.`,
      example: `noted ${glyph}`,
      riskLevel: 'LOW',
    },
  ];

  if (ctx.archetype % 2 === 1) {
    meanings[2] = {
      context: ironic,
      meaning: `Used sarcastically it is the gesture with the deadpan delivery: ${profile.reads}, said without believing any of it.`,
      example: `sure, sure ${glyph}`,
      riskLevel: 'LOW',
    };
  }

  return rotate(ctx.archetype, meanings);
}

/** What the emoji does on each platform. */
export function basePlatformNotes(ctx: BaseContext): Array<{ platform: Platform; note: string }> {
  const { profile, glyph, title, subcategory } = ctx;
  const notes: Array<{ platform: Platform; note: string }> = [
    {
      platform: 'IMESSAGE',
      note: `On iOS the ${title} ${glyph} renders as the neutral drawing, and the neutral swatch is what most people send without thinking about it. A message like ${profile.uses[0]} is the kind that carries it — the picture lands before the sentence does.`,
    },
    {
      platform: 'WHATSAPP',
      note: `WhatsApp renders ${glyph} exactly as the phone system does, but the keyboard keeps it in the ${subcategory.toLowerCase()} section, where nobody looks unless they are hunting for it. In family threads it tends to accompany a message like ${profile.uses[1]}.`,
    },
    {
      platform: 'INSTAGRAM',
      note: `On Instagram ${glyph} usually arrives as the tail of a caption rather than as a post of its own — a sign-off that reads as ${profile.reads} under a photo, or a reaction somebody left on a story.`,
    },
    {
      platform: 'TIKTOK',
      note: `In TikTok comments ${glyph} is the fastest way to answer a video without typing anything. The gesture stays ${profile.reads}, and the tone of the comment underneath it carries the rest.`,
    },
    {
      platform: 'SLACK',
      note: `In Slack ${glyph} lands in channels where the sentence was supposed to be shorter. It is usually standing in for ${profile.uses[0]}, and a channel where the topic is somebody's workload is where it misreads.`,
    },
    {
      platform: 'DISCORD',
      note: `On Discord ${glyph} is a staple of the reaction bar, which is why it so often arrives stripped of its ${profile.reads} reading — a shape pressed rather than a message sent.`,
    },
    {
      platform: 'TWITTER',
      note: `On X and Twitter ${glyph} does most of its work in replies, where it tags a message like ${profile.uses[1]}. Short enough to survive being the whole post, which is exactly why it is used that way.`,
    },
  ];

  return rotate(ctx.archetype, notes).slice(0, 5);
}

/** How different generations send it. */
export function baseGenerationalNotes(ctx: BaseContext): Array<{
  generation: Generation;
  note: string;
}> {
  const { profile, glyph, title } = ctx;
  const notes: Array<{ generation: Generation; note: string }> = [
    {
      generation: 'GEN_Z',
      note: `Gen Z reaches for ${glyph} to do the work of ${profile.uses[0]}, and treats the neutral drawing as the default rather than as a choice. What they hear first is ${profile.reads}.`,
    },
    {
      generation: 'MILLENNIAL',
      note: `Millennials tend to send ${glyph} deliberately, usually for something like ${profile.uses[1]}, and they read ${profile.reads} into it more often than the older cohorts do.`,
    },
    {
      generation: 'GEN_X',
      note: `Gen X mostly uses ${glyph} literally, as the picture of the gesture itself, and is less likely to read ${profile.reads} into it than younger senders are.`,
    },
    {
      generation: 'BOOMER',
      note: `Older senders use ${glyph} in the most straightforward way, on family and group messages, and are less likely to hear the ${profile.reads} subtext in it.`,
    },
  ];

  return rotate(ctx.archetype, notes);
}

/** The two things that go wrong most often. */
export function baseWarnings(ctx: BaseContext): Array<{
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}> {
  const { profile, glyph } = ctx;
  return [
    {
      title: `${glyph} and ${profile.contrast.glyph} get swapped`,
      description: `The ${profile.contrast.title} ${profile.contrast.glyph} is one tap away in every picker, and it does not carry the same reading — ${profile.contrast.note}. Check which one you actually picked.`,
      severity: 'LOW',
    },
    {
      title: 'The reading it usually gets is not the one it was sent with',
      description: `People take ${glyph} as something else fairly often: it gets ${profile.misread}. The sentence around it is usually what settles the meaning.`,
      severity: 'MEDIUM',
    },
  ];
}

/** A paragraph, written once per archetype so that no two families share one. */
type ParagraphBuilder = (ctx: BaseContext) => string;

/** The paragraph that explains the five tone variants hanging off the family. */
const toneFamilyParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `The drawing on this page is the neutral one. The same ${ctx.title.toLowerCase()} exists in five skin tones, and each of those pages covers how a particular tone gets read by the people who send it. The gesture does not change between them; what changes is who it looks like it is coming from.`,
  (ctx) =>
    `Five other pages sit under this one. The ${ctx.title.toLowerCase()} comes in light, medium-light, medium, medium-dark and dark, and each one is written from the point of view of the person who picked that swatch. The drawing is identical in all five; only the tone moves.`,
  (ctx) =>
    `This page is the untoned drawing. Somewhere below it are five versions of the same ${ctx.title.toLowerCase()} with a skin tone applied, and those pages are about something different: not what the gesture means, but what a particular tone adds to it when it arrives from a particular face.`,
  (ctx) =>
    `There are five tone versions of this emoji, and they are not copies of this page. Each one describes the same gesture from inside a different group, because a tone is read as a signal about the sender before the sentence is read.`,
  (ctx) =>
    `The ${ctx.title.toLowerCase()} also exists in five skin tones. They are separate pages with separate copy, because picking a tone is a decision in a way that picking the plain emoji is not: it says something about who the sender thinks the reader is.`,
];

/** The paragraph about how the same drawing lands in different rooms. */
const roomParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `Where the gesture lands depends on the room. In a family thread ${ctx.glyph} is closer to a sign-off, in a work channel it is a decision or a handover, and in a dating thread it is a way of making a small joke without writing one. The same drawing moves because the people reading it expect different things.\n\nThat is also why the skin-tone versions matter. The five variants under this family cover the same gesture, and the tone you pick says something about you before the sentence is read.`,
  (ctx) =>
    `Rooms change the meaning. ${ctx.glyph} sent to a colleague is a piece of work, ${ctx.glyph} sent to a friend is a joke, and ${ctx.glyph} sent to somebody you are seeing is a small dare. Nobody reads it out of context, and that is exactly why the same emoji is not the same message in each of those threads.\n\nThe tone does the same job in a different register: the five variants of this emoji carry the identical gesture, and the swatch is a quiet statement about the sender.`,
  (ctx) =>
    `The setting does half the work. ${ctx.glyph} used for ${ctx.profile.uses[0]} in a work channel reads as a handover; the same move in a group chat reads as a joke. The emoji is not saying anything different — the audience is.\n\nWhich is also why this family has skin-tone pages. The gesture is the same in all five, and the tone you choose is the only part of the message that says anything about you.`,
  (ctx) =>
    `The same emoji in three rooms: a family thread, a work channel, and a dating app. In the first it closes a conversation, in the second it hands something over, in the third it is a joke with an eyebrow raised. The drawing never changes; the expectation of the reader does.\n\nThat is also the reason the skin-tone variants are written as their own pages rather than as one page with a table of swatches. A tone is not a setting, and it is read differently.`,
  (ctx) =>
    `Context, not the picture, decides how this lands. ${ctx.glyph} in a work thread is ${ctx.profile.uses[1]}; ${ctx.glyph} in a family thread is ${ctx.profile.uses[0]}; ${ctx.glyph} in a thread with somebody you like is a way of saying something you would rather not type out.\n\nThe tone versions of the emoji make the same point from the other side. The gesture is identical in all five, and the swatch says something about the sender before a word is read.`,
];

/** The paragraph about the emoji being sent on its own. */
const replyParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `The habit worth naming is the one where the emoji replaces a reply altogether. Somebody asks a question, and ${ctx.glyph} goes back on its own. It reads as "${ctx.profile.reads}", and it saves the sender a sentence — which is exactly why it is so easy to send something that means less than intended.`,
  (ctx) =>
    `Worth watching: how often ${ctx.glyph} arrives as the entire answer to a question. The sender saves themselves a sentence, and the sentence was where the actual thought was. By the time it reaches the reader, all that is left is a drawing that reads as "${ctx.profile.reads}" for some people and as something else for others.`,
  (ctx) =>
    `There is one habit that turns a small emoji into a misunderstanding. ${ctx.glyph} goes back on its own, with no words around it, and it stands for whatever the sender had in mind — which was ${ctx.profile.reads}. The reader gets the drawing and none of the context that produced it.`,
  (ctx) =>
    `Look at how often ${ctx.glyph} is used to avoid typing. A question goes out, a question comes back, and in between there is a single picture standing in for an answer that would have taken a sentence. It reads as "${ctx.profile.reads}", which is fine until it is not.`,
  (ctx) =>
    `The shortest messages are the risky ones. A lone ${ctx.glyph} is the whole reply, and it is carrying a meaning nobody wrote down — ${ctx.profile.reads} is the intention, but what arrives is a drawing. Everything the sentence would have disambiguated is simply missing.`,
];

/** The paragraph about picking the wrong emoji in the picker. */
const misuseParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `Do not use ${ctx.glyph} when you mean ${ctx.profile.contrast.glyph} ${ctx.profile.contrast.title}. ${capitalise(ctx.profile.contrast.note)}. The two drawings are easy to confuse, and the wrong one changes the message from one thing to a different thing entirely.\n\nAnd do not use it as a reaction to somebody who is upset. A bare ${ctx.glyph} in a thread about a person reads as "${ctx.profile.reads}", which is about the picture and not about them.`,
  (ctx) =>
    `The first thing to check is whether you meant ${ctx.profile.contrast.glyph} ${ctx.profile.contrast.title}. ${capitalise(ctx.profile.contrast.note)}. Those two are close in every picker, and the wrong one does not soften the message, it changes it.\n\nThe second thing to check is whose thread it is. ${ctx.glyph} sent as a reaction to somebody who is upset reads as ${ctx.profile.reads}, and the picture is about the gesture rather than about them.`,
  (ctx) =>
    `Two rules. First, ${ctx.profile.contrast.glyph} ${ctx.profile.contrast.title} is a different message: ${ctx.profile.contrast.note}. Do not send ${ctx.glyph} when you meant that one. Second, a reaction to bad news needs words. A bare ${ctx.glyph} reads as ${ctx.profile.reads}, and nobody in a thread about a person wants to be answered with a drawing of a gesture.`,
  (ctx) =>
    `Watch the picker, and watch the thread. ${ctx.glyph} is easy to send when ${ctx.profile.contrast.glyph} ${ctx.profile.contrast.title} was meant — ${ctx.profile.contrast.note}. And the emoji has no business being the whole reply to somebody who has just told you something bad: it reads as "${ctx.profile.reads}", which is about the gesture rather than about them.`,
  (ctx) =>
    `Leave ${ctx.profile.contrast.glyph} ${ctx.profile.contrast.title} for the other message. ${capitalise(ctx.profile.contrast.note)}. And keep ${ctx.glyph} out of threads where somebody is hurting: it reads as ${ctx.profile.reads} there, because there is nothing in the drawing that says you meant well.`,
];

/** The paragraph about the emoji carrying a message better left to the words. */
const cautionParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `Skip it when the sentence underneath it is the important part. The emoji gets ${ctx.profile.misread}. Once that happens the emoji is carrying the message, and the message has drifted somewhere neither sender intended.\n\nIt is also a poor choice in a first exchange with somebody you do not know. There is no warmth baked into the drawing, and ${ctx.title.toLowerCase()} gestures often collect a slightly superior edge from being used as answers to other people's messages.`,
  (ctx) =>
    `The riskiest use is the one where the picture carries a message the words were carrying better. ${ctx.glyph} gets ${ctx.profile.misread}, and once the emoji is doing the work the message has drifted somewhere neither side intended.\n\nFirst exchanges are worse. There is no warmth in the drawing, and ${ctx.title.toLowerCase()} gestures collect a slightly superior edge from years of being used as answers to other people's messages.`,
  (ctx) =>
    `Not every message survives being turned into a picture. The emoji gets ${ctx.profile.misread}, and the sentence underneath it loses the argument. Once ${ctx.glyph} is carrying the meaning, the meaning has moved without either sender moving it.\n\nWith somebody you have just met, it is worse. ${ctx.glyph} has no warmth in the drawing, and the gesture has picked up an edge of superiority from being used to answer other people.`,
  (ctx) =>
    `The problem is not the emoji, it is the message underneath it. ${ctx.glyph} gets ${ctx.profile.misread}, and the drift happens silently. Nobody notices that the meaning changed, because the change was in a picture.\n\nNor is it a good opener with a stranger. The drawing is cold, and ${ctx.title.toLowerCase()} gestures have collected a faintly superior edge from being used to reply to other people for years.`,
  (ctx) =>
    `Think about what the emoji is replacing. If the sentence under it is doing the real work, ${ctx.glyph} will get ${ctx.profile.misread} instead, and the thread ends up carrying a meaning nobody wrote.\n\nAnd keep it away from first contact. There is nothing warm in the drawing, and a ${ctx.title.toLowerCase()} gesture used to answer other people's messages tends to sound like it is settling a point.`,
];

/** The paragraph about formal settings. */
const formalParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `Finally, leave it out of formal settings where the tone is supposed to be neutral. ${ctx.glyph} in a thread about somebody's performance, or in a message to a client you have never met, buys very little and risks a read of ${ctx.profile.reads} as arrogance.`,
  (ctx) =>
    `And leave it out of the rooms where the tone is supposed to be level. ${ctx.glyph} in a thread about somebody's work, or sent to a client you have not met, says very little and can read as ${ctx.profile.reads} — which sounds like arrogance in a place where arrogance is expensive.`,
  (ctx) =>
    `There is also a place where this emoji does not belong: the professional setting. ${ctx.glyph} under a review, or in a first message to a client, reads as ${ctx.profile.reads}, and in that room the same reading sounds like somebody settling a point.`,
  (ctx) =>
    `Professional settings are the other place to leave it alone. Put ${ctx.glyph} next to somebody's performance, or in a first note to a client, and ${ctx.profile.reads} is the note it reads as — a note that costs more in a workplace than in a group chat.`,
  (ctx) =>
    `Keep it out of the formal register. In a thread about somebody's work, or in a message to somebody you have not met, ${ctx.glyph} reads as ${ctx.profile.reads}, and formality is exactly where that reading does the most damage.`,
];

/** The paragraph about matching the emoji. */
const answerParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `The easy reply is to match it with the same ${ctx.glyph}. That confirms the tone without adding anything, and it works when the original message was a reaction rather than a question.\n\nIf the ${ctx.title.toLowerCase()} was aimed at you — a nudge, a handover, a request for a decision — answer in words. A gesture answering a gesture leaves the actual point unanswered.`,
  (ctx) =>
    `Reply with ${ctx.glyph} itself when the message was a reaction. It confirms the tone and adds nothing, which is what a reaction deserves.\n\nBut when ${ctx.glyph} was pointed at you, do not answer with a picture. A nudge, a handover, a request for a decision — those need a sentence, because a gesture answering a gesture leaves the point unanswered.`,
  (ctx) =>
    `If it was a reaction, ${ctx.glyph} back is a complete answer. It says "same" without writing a word, and the exchange can end there.\n\nIf it was aimed at you, it needs text. ${ctx.glyph} replying to ${ctx.glyph} looks like a conversation between two drawings, and whatever the sender actually asked never gets answered.`,
  (ctx) =>
    `Matching works when the message was a reaction: send ${ctx.glyph} back and the tone is confirmed without a word. It does not work when the message was aimed at you. A request, a handover, a nudge — those want a sentence, because two gestures in a row leave the question open.`,
  (ctx) =>
    `Start by reading what the ${ctx.glyph} was doing. If it was a reaction, react: ${ctx.glyph} back, and the thread is closed. If it was aimed at you, write. The difference matters, because the reply to a reaction can be a picture and the reply to a request cannot.`,
];

/** The paragraph about not being sure which reading is in play. */
const unsureParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `If somebody sends it and you are not sure what register they are in, respond to the sentence rather than to the emoji. The drawing gets ${ctx.profile.misread} — and the sentence is the part that tells you which reading you are dealing with.`,
  (ctx) =>
    `Unsure? Answer the sentence, not the picture. ${ctx.glyph} gets ${ctx.profile.misread}, and the words around it are the only thing that tells you which reading you are in.`,
  (ctx) =>
    `When the register is unclear, the words win. The drawing gets ${ctx.profile.misread}, so the sentence it was sent with is the only reliable guide to what it meant.`,
  (ctx) =>
    `If you cannot tell how the ${ctx.title.toLowerCase()} was meant, read the line above it instead. ${ctx.glyph} gets ${ctx.profile.misread}; the sentence underneath is the part that disambiguates it.`,
  (ctx) =>
    `The safe move in an unclear thread is to answer the text. ${ctx.glyph} gets ${ctx.profile.misread} often enough that the sentence matters more than the picture.`,
];

/** The paragraph about adding warmth back. */
const warmthParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `And when you want the warmth without the ambiguity, add a line of text. A message like ${ctx.profile.uses[0]} almost always needs the sentence, because the picture on its own leaves the reader to guess whether you meant ${ctx.profile.reads} or something sharper.`,
  (ctx) =>
    `For warmth without the ambiguity, write the line as well as sending the picture. A message like ${ctx.profile.uses[0]} needs the sentence: the drawing alone leaves the reader deciding between ${ctx.profile.reads} and something sharper.`,
  (ctx) =>
    `If the intent is warmth, the sentence is the part that carries it. Sending ${ctx.glyph} next to a message like ${ctx.profile.uses[0]} leaves the reader to guess whether it was ${ctx.profile.reads} or something sharper.`,
  (ctx) =>
    `Warmth needs words next to the picture. Something like ${ctx.profile.uses[0]} sent with ${ctx.glyph} on its own is a coin toss between ${ctx.profile.reads} and something sharper, and the sender never gets to pick which one landed.`,
  (ctx) =>
    `And do not send ${ctx.glyph} alone when the message underneath is supposed to be warm. A message like ${ctx.profile.uses[0]} carries the feeling; the picture on its own leaves the reader choosing between ${ctx.profile.reads} and something sharper.`,
];

/** The paragraph that opens the overview by describing the drawing. */
const drawingParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `${ctx.glyph} is the ${ctx.title.toLowerCase()}: ${ctx.profile.depicts}. It arrived in Unicode ${ctx.unicodeVersion}, and it lives in the ${ctx.subcategory.toLowerCase()} part of the emoji set, where the drawing is doing one specific job. Somebody sends it, and the picture either stands in for a sentence or stands in for a mood. Which one it is depends on what is around it.\n\nAt the plain level the gesture reads as ${ctx.profile.reads}. That is the reading most people arrive with, and it is usually the intended one. The picture is doing the same work as the sentence it replaces, which is why it lands faster than a sentence would have landed.`,
  (ctx) =>
    `Start with the drawing: ${ctx.glyph} is ${ctx.profile.depicts}. It came into the emoji set in Unicode ${ctx.unicodeVersion}, under the ${ctx.subcategory.toLowerCase()} heading, and it has been doing one job ever since — standing in for a sentence the sender did not want to type.\n\nThat job is ${ctx.profile.reads}. It is the reading most people arrive with, and it is usually the intended one. The picture carries the same weight as the sentence it replaces, which is why it lands faster than a sentence would have.`,
  (ctx) =>
    `Unicode ${ctx.unicodeVersion} is where ${ctx.glyph} comes from. The drawing shows ${ctx.profile.depicts}, it sits in the ${ctx.subcategory.toLowerCase()} group of the set, and in a conversation it does one thing: it says what a sentence would have said less well.\n\nWhat it says is ${ctx.profile.reads}. That is the reading most people arrive with, and it is usually the intended one — the picture does the same work as the words it replaces, and it gets there faster.`,
  (ctx) =>
    `There is not a lot to the picture. ${ctx.glyph} is ${ctx.profile.depicts}, added in Unicode ${ctx.unicodeVersion} and filed under ${ctx.subcategory.toLowerCase()}. What it does in a message is carry a meaning — here, ${ctx.profile.reads} — without anyone having to write it out.\n\nThat plain reading is the one most people arrive with, and it is usually the intended one. The picture is doing the same work as the sentence it replaces, and it lands first.`,
  (ctx) =>
    `The drawing of ${ctx.glyph} is ${ctx.profile.depicts}. It arrived with Unicode ${ctx.unicodeVersion} in the ${ctx.subcategory.toLowerCase()} section, and in a conversation it does the work of a line somebody left out on purpose.\n\nThe line it stands in for is ${ctx.profile.reads}. That is the reading most people arrive with, and it is usually the intended one — a picture carries the same meaning as the sentence it replaces, and it arrives first.`,
];

/** The paragraph that closes the overview by pointing at the rest of the page. */
const summaryParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `Practically, this is what the page is for: what the ${ctx.title.toLowerCase()} emoji is used for, how it behaves in the places people actually use it, and where the drawing is more confident than the person who sent it. The two jobs it does most often are ${ctx.profile.uses[0]} and ${ctx.profile.uses[1]}, and the sections below break both of them down.`,
  (ctx) =>
    `So: what is the ${ctx.title.toLowerCase()} for? Mostly ${ctx.profile.uses[0]}, and then ${ctx.profile.uses[1]}. The rest of this page covers the drawing, the second reading it invites, and the tone variants, which are written as separate pages because they are read differently.`,
  (ctx) =>
    `The short version. The ${ctx.title.toLowerCase()} is for ${ctx.profile.uses[0]} and for ${ctx.profile.uses[1]}, it gets misread often enough to be worth writing down, and it has five skin-tone versions worth reading on their own. The sections below take those in turn.`,
  (ctx) =>
    `What follows is the useful part: the two things the ${ctx.title.toLowerCase()} is actually for (${ctx.profile.uses[0]} and ${ctx.profile.uses[1]}), the reading it gets when it is not what the sender meant, and the five tone pages that sit under this one.`,
  (ctx) =>
    `In short — the ${ctx.title.toLowerCase()} reads as ${ctx.profile.reads}, it is most often used for ${ctx.profile.uses[0]} or ${ctx.profile.uses[1]}, and the five tone pages under it each say something different about who is sending it. The rest of the page takes those three apart.`,
];

/** The paragraph that opens the "how people use it" section. */
const jobsParagraphs: ParagraphBuilder[] = [
  (ctx) =>
    `The first job ${ctx.glyph} does is ${ctx.profile.uses[0]}. It gets typed at the end of a sentence that already made the point, and it removes the need to explain how the sender wants the message taken. Nobody has to write "you know what I mean", because the picture says it.\n\nThe second is ${ctx.profile.uses[1]}. Here the emoji is doing something different: it is not the punchline, it is the tone. The message could have been sent without it, but it would have read as flat.`,
  (ctx) =>
    `Two jobs, most of the time. The first is ${ctx.profile.uses[0]}: the emoji goes at the end of a line that has already made the point, and it saves the sender from explaining how they want it taken. The second is ${ctx.profile.uses[1]}, and there it is not the punchline but the tone — the message would survive without it, but it would read as flat.`,
  (ctx) =>
    `Start with ${capitalise(ctx.profile.uses[0])}. That is where the ${ctx.title.toLowerCase()} earns its place: it closes a sentence that has already said the thing, and nobody has to add "you know what I mean". The other job is ${ctx.profile.uses[1]}, and there the emoji is not the message but the temperature of the message.`,
  (ctx) =>
    `The common uses are ${ctx.profile.uses[0]} and ${ctx.profile.uses[1]}. The first one is about speed — the picture replaces the explanation, and it lands before the words would have. The second is about tone — the sentence stands on its own, and the emoji is there to change how it reads.`,
  (ctx) =>
    `Put it this way. ${capitalise(ctx.profile.uses[0])} is the job the ${ctx.title.toLowerCase()} does most: it saves a sentence and lands faster than one would have. ${capitalise(ctx.profile.uses[1])} is the job it does second: there the picture is not the point, it is the temperature of the message.`,
];

/** The long-form overview — the article body of the page. */
export function baseOverview(ctx: BaseContext): string {
  const { profile, glyph, title } = ctx;
  const paragraphs = [
    choose(ctx.archetype, drawingParagraphs)(ctx),

    `The complication is that the drawing invites a second reading. It gets ${profile.misread}. In practice that second reading is not rare — it is the one that decides how a message lands, because the sender has usually not thought about it at all.\n\nIt also sits in the crowded part of the picker. The nearest neighbour is ${profile.contrast.glyph} ${profile.contrast.title}: ${profile.contrast.note}. The two are close enough that a fast thumb picks the wrong one, and the message goes out carrying a meaning nobody chose.`,

    choose(ctx.archetype, toneFamilyParagraphs)(ctx),

    choose(ctx.archetype, summaryParagraphs)(ctx),
  ];

  return rotate(ctx.archetype, paragraphs).join('\n\n');
}

/** How people actually send it. */
export function baseHowPeopleUseIt(ctx: BaseContext): string {
  const { profile, glyph, title } = ctx;
  const paragraphs = [
    choose(ctx.archetype, jobsParagraphs)(ctx),

    choose(ctx.archetype, roomParagraphs)(ctx),

    choose(ctx.archetype, replyParagraphs)(ctx),
  ];

  return rotate(ctx.archetype, paragraphs).join('\n\n');
}

/** When not to send it. */
export function baseWhenNotToUse(ctx: BaseContext): string {
  const { profile, glyph, title } = ctx;
  const paragraphs = [
    choose(ctx.archetype, misuseParagraphs)(ctx),

    choose(ctx.archetype, cautionParagraphs)(ctx),

    choose(ctx.archetype, formalParagraphs)(ctx),
  ];

  return rotate(ctx.archetype, paragraphs).join('\n\n');
}

/** How to answer it. */
export function baseHowToReply(ctx: BaseContext): string {
  const { profile, glyph, title } = ctx;
  const paragraphs = [
    choose(ctx.archetype, answerParagraphs)(ctx),

    choose(ctx.archetype, unsureParagraphs)(ctx),

    choose(ctx.archetype, warmthParagraphs)(ctx),
  ];

  return rotate(ctx.archetype, paragraphs).join('\n\n');
}

/** The FAQ block. */
export function baseFaqs(ctx: BaseContext): EmojiFaq[] {
  const { profile, glyph, title } = ctx;
  const faqs: EmojiFaq[] = [
    {
      question: `What does ${glyph} mean in text?`,
      answer: `${glyph} is used for ${profile.reads}. The drawing shows ${profile.depicts}, and that part is not in dispute — what changes is whether the sender is being literal or borrowing the gesture for a reaction.`,
    },
    {
      question: `What is the difference between ${glyph} and ${profile.contrast.glyph}?`,
      answer: `${capitalise(profile.contrast.note)}. The two sit close together in most pickers, so the difference is often about which one the sender pressed rather than about what they meant.`,
    },
    {
      question: `Is ${glyph} rude?`,
      answer: `It can be. The gesture is meant as ${profile.reads}, but it gets ${profile.misread}. The risk is highest when it is the only message in the thread — a sentence gives the picture some context to sit in.`,
    },
    {
      question: `What does ${glyph} mean from a guy?`,
      answer: `Nothing gender-specific. The same reading applies whoever sends it, and the meaning is set by the thread and by what is written next to it rather than by the sender.`,
    },
    {
      question: `What is the difference between ${glyph} and its skin-tone versions?`,
      answer: `The tone variants under ${ctx.title.toLowerCase()} show the same gesture in five different skin tones. The gesture does not change, but the tone is a small signal about who the sender imagines the reader is, and in some groups that signal is read louder than the sentence.`,
    },
  ];

  return rotate(ctx.archetype, faqs);
}

/** The conversation examples, in the order the page shows them. */
export function baseConversationExamples(ctx: BaseContext): Array<{
  setting: ConversationSetting;
  message: string;
  interpretation: string;
}> {
  const { profile, glyph } = ctx;
  const examples: Array<{
    setting: ConversationSetting;
    message: string;
    interpretation: string;
  }> = [
    {
      setting: 'friends',
      message: `${profile.uses[0]} ${glyph}`,
      interpretation: `The everyday use: the picture carries the whole line. It lands as ${profile.reads}, and matching it with the same emoji is a normal reply.`,
    },
    {
      setting: 'work',
      message: `${profile.uses[1]} ${glyph}`,
      interpretation: `A handover or a sign-off in a channel. It reads as ${profile.reads}, and naming the next step in words is usually clearer than leaving it to the gesture.`,
    },
    {
      setting: 'dating',
      message: `there is something you should know ${glyph}`,
      interpretation: `A small joke or a nudge, with the emoji doing the tone work. It gets ${profile.misread} more easily here than it does in a work thread, because the thread is thinner.`,
    },
    {
      setting: 'family',
      message: `${profile.uses[0]} ${glyph}`,
      interpretation: `Family threads are where this lands most naturally. The reading is ${profile.reads}, and nobody in the thread is reading it as anything sharper than that.`,
    },
    {
      setting: 'social',
      message: `that is the whole post ${glyph}`,
      interpretation: `A public sign-off, with the emoji as the full stop. The picture is doing the punctuation, which is why it is sent instead of a sentence.`,
    },
  ];

  return rotate(ctx.archetype, examples);
}
