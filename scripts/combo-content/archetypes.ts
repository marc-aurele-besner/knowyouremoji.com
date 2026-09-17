/**
 * Archetype template sets. 3 variants × 11 categories = 33 templates.
 * Each variant generates the long-form fields for a combo given a context object.
 *
 * `getArchetype(category, variant)` returns the right template set.
 */

import {
  fillTemplate,
  pick,
  pickN,
  type SegmentOverrides,
  pad,
  hashUnit,
  takeLines,
} from './archetypes-helpers';
import type { EmojiComboCategoryName } from '../../src/types/combo';
import type { ComboPlanEntry } from '../plan-batch-23-32';

/* ------------------ HUMOR ------------------ */
const HUMOR_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `Two-emoji reaction pack for the joke-coded moment. ${ctx.c} leans on a single punchline register and pairs naturally with stand-alone replies.`,
    meaning: (ctx) =>
      `Used to signal a real laugh without writing a sentence. ${ctx.c} shows up on jokes, takes, and shared chaos-coded moments. Most senders treat it as shorthand for "that was actually funny."`,
    overview: (ctx) =>
      `${ctx.c} is a humor-coded reaction — the two emojis do the joke work together, and the combo lands harder than either emoji could alone. ${pick(
        [
          'shows up wherever the feeling fits',
          'lands wherever a single emoji would land softer',
          'carries the moment the way the two emojis suggest',
          'reads the way the two characters together suggest',
          'is the move when a single emoji would underdeliver',
          'travels across most platforms with the same read',
          'sits in the warm middle between subtle and loud',
          'lands the same on iMessage, Instagram, and TikTok',
        ],
        hashUnit(ctx.c)
      )} The ${ctx.a} register is fluent across audiences, which is why ${ctx.c} tends to travel without losing the read.`,
    howPeopleUseIt: (ctx) =>
      fillTemplate(
        pick(
          [
            '{c} shows up in 1:1 threads between two people who already share the register, and in group chats when a moment lands that everyone reads the same way. The combo is shorthand for the kind of feeling the two emojis together make clear. On Instagram and TikTok the combo punctuates photo drops, story shares, and comment threads in the same {a} register. Across all of these surfaces the rule is the same: the more {a} the moment, the more natural {c} feels.',
            '{c} lives in spaces where the sender wants the two-emoji register to land at once — under a photo drop, in a tight friend thread, on a milestone-coded chat. The combination is shorthand for the moment, and the moment reads {a} across audiences. On Discord and Slack the same combo lands in {a} channels without forcing additional context. The combo does not need a sentence around it — a stand-alone {c} carries the full register.',
            '{c} appears as the closer on a {a} moment, the punctuation on a {a} reveal, and the softener on a {a} tag. The two emojis together fit the same {a} register across friend-coded chats, family groups, and {a} DMs alike. In tight groups it carries the most warmth; across wider audiences the combo reads without forcing extra context. The {a} register travels across most platforms without losing meaning.',
          ],
          hashUnit(ctx.c, 1)
        ),
        ctx
      ),
    whenNotToUse: (ctx) =>
      pick(
        [
          'Skip it in sympathy or condolence-coded moments — the register is wrong for grief and reads as tone deaf. A single heart or a sentence that acknowledges the moment is a better fit.',
          'Avoid it in formal or cross-functional work channels where the read can be misread. A sentence or a softer single emoji keeps the message grounded in professional contexts.',
          'Do not default to it when the moment is mixed or serious on both sides. The two emojis together read louder than either alone, and the volume can overshadow the harder part of the message.',
          'Skip it when the sender wants to communicate a different register — the {a} cue is too specific-coded for moments that need a more neutral read; reach for a single emoji or a sentence.',
        ],
        hashUnit(ctx.c, 2)
      ).replace(/{a}/g, ctx.a),
    howToReply: (ctx) =>
      fillTemplate(
        pick(
          [
            'The cleanest mirror is another {c} if you want to match the energy. A short sentence that names the moment lands as more sincere than another emoji when the read should be specific-coded.',
            'Mirroring {c} with another emoji is fine for casual threads. For deeper moments, a sentence that acknowledges the feeling lands as more {a} than another combo.',
            'Mirror {c} with another combo or escalate with a sentence. If the register feels too loud, a single softer emoji will register as agreement without matching the volume.',
          ],
          hashUnit(ctx.c, 3)
        ),
        ctx
      ),
    examples: (ctx, rand) =>
      pickN(
        [
          `cannot believe she said that ${ctx.c}`,
          `me every Monday morning ${ctx.c}`,
          `${ctx.c} that's the entire tweet`,
          `this group chat ${ctx.c}`,
          `current mood: ${ctx.c}`,
          `me pretending to focus ${ctx.c}`,
          `iconic ${ctx.c}`,
          `the chaos ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} did you see that reply`,
            interpretation: `Friend sharing a take. Mirror with another ${ctx.c} or a sentence that joins the joke.`,
          },
          {
            setting: 'social',
            message: `this whole thread is ${ctx.c}`,
            interpretation: `Public reaction to a chaotic post. Mirror with another ${ctx.c} or a sentence that keeps the joke moving.`,
          },
          {
            setting: 'family',
            message: `dad just texted the group chat ${ctx.c}`,
            interpretation: `Family-coded laugh. Mirror with another ${ctx.c} or a sentence that acknowledges the joke.`,
          },
          {
            setting: 'work',
            message: `meeting ran 30 min over ${ctx.c}`,
            interpretation: `Team-coded sigh. Mirror with another ${ctx.c} in tight channels; prefer a sentence in wider threads.`,
          },
          {
            setting: 'dating',
            message: `you told my mom that? ${ctx.c}`,
            interpretation: `Flirty reaction. Mirror with another ${ctx.c} or a sentence that keeps the joke alive.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Meaning & How To Use It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} humor-coded combo explained with examples, replies, and how people use it in chat.`,
    tones: ['soft-coded', 'medium-volume', 'high-volume'],
  },
  {
    description: (ctx) =>
      `${ctx.c} is the punchline emoji reaction — the cue lands as a quick laugh without writing a sentence. The two emojis together make the joke read clean.`,
    meaning: (ctx) =>
      `Used to react to something funny in chat. ${ctx.c} reads as "ok that was actually funny" and shows up on takes, photos, and shared chaos. The combo is shorthand for a real laugh.`,
    overview: (ctx) =>
      `${ctx.c} is what joke-coded reactions look like in two emojis — the ${ctx.a} register is the combo's whole point, and the two characters share the work of the punchline. The reading lands the same on iMessage, TikTok, and Instagram comment threads, which is why ${ctx.c} appears on takes that need a stamp without writing a single word.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} shows up on joke-coded replies, on shared takes in tight threads, and on friend group chats where the punchline lands clean. The ${ctx.a} register is the same regardless of the platform; the combo carries the joke without forcing extra context. In work-coded Slack channels the combo reads as light relief; on Instagram and TikTok the same combo puns on photo drops and reels.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments — the joke register is the wrong tone for grief. A single heart or a sentence that acknowledges the moment is the right register. Also avoid ${ctx.c} in customer-facing work comms where the read can be misread as performative rather than funny.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the joke going. For higher-sincerity moments prefer a sentence that names the joke or escalate with a related emoji that matches the ${ctx.a} register.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `cannot stop laughing ${ctx.c}`,
          `${ctx.c} this is fine`,
          `me reading that thread ${ctx.c}`,
          `the group chat at 2am ${ctx.c}`,
          `${ctx.c} honestly iconic`,
          `this whole week has been ${ctx.c}`,
          `mood ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} the look on her face`,
            interpretation: `Friend sharing a moment. Mirror with another ${ctx.c} or a sentence that escalates the joke.`,
          },
          {
            setting: 'social',
            message: `today in ${ctx.c}`,
            interpretation: `Public reaction to a chaotic feed. Mirror with another ${ctx.c} or a sentence that keeps the energy moving.`,
          },
          {
            setting: 'family',
            message: `${ctx.c} your brother just called me`,
            interpretation: `Family laugh. Mirror with another ${ctx.c} or a sentence that catches the joke.`,
          },
          {
            setting: 'work',
            message: `finally over ${ctx.c}`,
            interpretation: `Team-coded relief. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'dating',
            message: `you're trouble ${ctx.c}`,
            interpretation: `Flirty tease. Mirror with another ${ctx.c} or a sentence that joins the joke.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Combo Meaning & When To Use It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean in chat? A ${ctx.a} humor-coded reaction explained with examples, replies, and platform notes.`,
    tones: ['medium-volume', 'high-volume', 'soft-coded'],
  },
  {
    description: (ctx) =>
      `${ctx.c} pairs two emojis to do the joke work in one move. The combo reads as a quick laugh on takes, photos, and shared chaos-coded moments.`,
    meaning: (ctx) =>
      `Signals a laugh-coded reaction without writing a sentence. ${ctx.c} is shorthand for "ok that landed" and shows up across friend threads, family groups, and comment sections.`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the partnership cue from the other, and the result lands as a two-character punchline. The combo reads the same on TikTok, Instagram, and iMessage, which is why ${ctx.c} shows up on takes that need a stamp. The ${ctx.a} cue makes the joke register explicit; without it the read would soften to a single-emoji laugh.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates jokes and shared chaos in friend threads, family groups, and tight Slack channels. The combo carries the laugh without forcing the sender to write a sentence. In customer-facing work comms prefer a sentence or a single emoji so the joke register does not overperform.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy, condolence, or mixed-news moments — the laugh register is the wrong tone. Also avoid it on cold work channels where the joke can land wrong. For heavier moments reach for a heart or a sentence.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the joke moving. For higher-sincerity moments prefer a sentence that names the joke or escalate with a related emoji that fits the ${ctx.a} register.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `me trying to act normal ${ctx.c}`,
          `cannot unsee ${ctx.c}`,
          `the audacity ${ctx.c}`,
          `${ctx.c} thread lore`,
          `iconic ${ctx.c}`,
          `this energy ${ctx.c}`,
          `state of me ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} omg you read that too`,
            interpretation: `Friend-coded joke. Mirror with another ${ctx.c} or a sentence that keeps the laugh going.`,
          },
          {
            setting: 'social',
            message: `state of the timeline ${ctx.c}`,
            interpretation: `Public-coded joke. Mirror with another ${ctx.c} or a sentence that matches the mood.`,
          },
          {
            setting: 'family',
            message: `${ctx.c} mom sent another minion meme`,
            interpretation: `Family laugh. Mirror with another ${ctx.c} or a sentence that matches the joke.`,
          },
          {
            setting: 'work',
            message: `final reply was ${ctx.c}`,
            interpretation: `Team-coded joke. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'dating',
            message: `your sense of humor ${ctx.c}`,
            interpretation: `Flirty-coded approval. Mirror with another ${ctx.c} or a sentence that escalates the joke.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} humor-coded reaction explained with example messages and replies.`,
    tones: ['low-volume', 'medium-volume', 'high-volume'],
  },
];

/* ------------------ FLIRTING ------------------ */
const FLIRTING_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the flirting-coded close — the partner cue is paired with a warmth cue, and the combo lands as a softer come-on than either emoji alone.`,
    meaning: (ctx) =>
      `Signals attraction-coded interest. ${ctx.c} shows up between two people who are already flirting, and it reads the same across platforms. Most senders treat it as a soft-coded line that warms the message without forcing a confession.`,
    overview: (ctx) =>
      `${ctx.c} lives where flirt-coded relationships do — in 1:1 DMs, on Instagram flirty threads, and in early-dating chats where the read should be warm without being forward. The two emojis share the work: the partner cue signals attraction, the warmth cue signals caring, and the result lands as a softer come-on than either emoji could carry alone. Across audiences the ${ctx.a} register is consistent, which is why ${ctx.c} travels from iMessage to TikTok without losing the read.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} shows up on flirty-coded replies, in 1:1 DMs, and on early-dating chats where a sentence would feel like too much and a single emoji would feel too little. The ${ctx.a} register keeps the read soft-coded without dropping the flirt. In Instagram DMs the combo punctuates flirty photo comments; on TikTok it lands in duet replies and caption-coded flirt bursts. The combo does not need a sentence — a stand-alone ${ctx.c} carries the full register.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in work channels where the read can misread as romantic. Avoid it as a cold opener to a stranger — the flirt register requires rapport. And avoid ${ctx.c} on milestone moments that need a softer relationship-coded default; reach for a single heart or a sentence.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} or escalate with a sentence that names the flirt. If the read feels too forward for you, drop to a single softer emoji that registers as friendly without matching the volume.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `you look amazing tonight ${ctx.c}`,
          `${ctx.c} I saw your message`,
          `thinking of you ${ctx.c}`,
          `you make me smile ${ctx.c}`,
          `date idea? ${ctx.c}`,
          `good morning ${ctx.c}`,
          `cute ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `had such a good time last night ${ctx.c}`,
            interpretation: `Dating-coded warmth. Mirror with another ${ctx.c} or a follow-up sweet line.`,
          },
          {
            setting: 'friends',
            message: `that new crush of yours ${ctx.c}`,
            interpretation: `Friend asking for details. Mirror with another ${ctx.c} or a sentence about the crush.`,
          },
          {
            setting: 'social',
            message: `${ctx.c} reading your caption`,
            interpretation: `Public-coded wink. Mirror with another ${ctx.c} or a sentence that flirts back.`,
          },
          {
            setting: 'family',
            message: `you met someone? ${ctx.c}`,
            interpretation: `Family warmth. Mirror with another ${ctx.c} or a sentence that fills in.`,
          },
          {
            setting: 'work',
            message: `team happy hour tonight ${ctx.c}`,
            interpretation: `Casual-coded work plan. Mirror with another ${ctx.c} in tight channels; prefer a sentence in wider threads.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Combo Meaning & Flirting Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean in dating? A ${ctx.a} flirting-coded combo explained with replies and platform notes.`,
    tones: ['soft-coded', 'medium-volume', 'high-volume'],
  },
  {
    description: (ctx) =>
      `${ctx.c} pairs two emojis to land a softer come-on. The combo shows up between two people who are already flirting, and the read is consistent.`,
    meaning: (ctx) =>
      `Used to send a softer come-on. ${ctx.c} reads warm-coded across platforms, and the two emojis share the work of signaling attraction. Most senders use it as a stand-alone reaction or at the end of a sentence.`,
    overview: (ctx) =>
      `${ctx.c} is the ${ctx.a} register of "I like you." The combo pairs a partner cue with a warmth cue, and the result lands as a softer line than a single heart could carry. Across audiences the read is consistent — early-dating chats, flirty-coded DMs, and warm-coded friend groups use the same ${ctx.c} to punctuate the moment. The flirt-coded register does not require rapport to read, but it usually requires it to land.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates flirty-coded DMs, warm-coded early-dating chats, and friend-coded replies between two people who already share the register. The combo reads the same across iMessage, Instagram, and TikTok; the ${ctx.a} register is the constant. The sender usually picks it to signal attraction without forcing additional context.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in work or customer-facing channels where the read can misread as romantic. Avoid it as a cold opener to a stranger, and avoid it on heavier relationship moments that need a more neutral default.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the moment going. For higher-sincerity replies prefer a sentence that names the moment or escalate with a related emoji that matches the ${ctx.a} register.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `you looked unreal ${ctx.c}`,
          `${ctx.c} I had a feeling`,
          `ok that's smooth ${ctx.c}`,
          `you free this weekend? ${ctx.c}`,
          `thinking about you ${ctx.c}`,
          `${ctx.c} save me a dance`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `${ctx.c} you always say the right thing`,
            interpretation: `Partner-coded warmth. Mirror with another ${ctx.c} or a sentence that escalates the romance.`,
          },
          {
            setting: 'friends',
            message: `ok tell me everything ${ctx.c}`,
            interpretation: `Friend-coded curiosity. Mirror with another ${ctx.c} or a sentence that catches the moment.`,
          },
          {
            setting: 'social',
            message: `${ctx.c} reading the comments`,
            interpretation: `Public-coded wink. Mirror with another ${ctx.c} or a sentence that flirts back.`,
          },
          {
            setting: 'family',
            message: `${ctx.c} someone sounds happy`,
            interpretation: `Family-coded warmth. Mirror with another ${ctx.c} or a sentence that fills in.`,
          },
          {
            setting: 'work',
            message: `casual friday drinks? ${ctx.c}`,
            interpretation: `Casual-coded work plan. Mirror with another ${ctx.c} in tight channels only.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Meaning & How To Use It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} flirting-coded combo explained with example messages and replies.`,
    tones: ['medium-volume', 'high-volume', 'soft-coded'],
  },
  {
    description: (ctx) =>
      `${ctx.c} is the warm-coded close of a flirty moment. The combo lands as a softer come-on, and the ${ctx.a} register is consistent across audiences.`,
    meaning: (ctx) =>
      `Signals attraction with a softer cover. ${ctx.c} shows up between two people who are already flirting, and most senders treat it as a stand-alone reaction or a sentence-closer.`,
    overview: (ctx) =>
      `${ctx.c} carries the ${ctx.a} register of a two-emoji flirt — the partner cue and the warmth cue share the work, and the result lands as warmer than a single heart and softer than a confession. The read is consistent across platforms: iMessage, Instagram, TikTok, and even Discord all use the combo as shorthand for "I like you, gently." The ${ctx.a} register carries the moment without forcing it.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} shows up in early-dating chats, on flirty DMs, and in tight friend threads between two people who already share the register. The combo reads the same on every platform; the ${ctx.a} register does not need adaptation. In work-coded channels drop the combo for a softer single emoji so the read stays professional.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in cold work channels or in customer-facing comms. Avoid it as an opener to a stranger, and avoid it on milestone relationship moments that need a heavier default. Reach for a single heart or a sentence in those contexts.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving. For higher-sincerity replies escalate with a sentence that names the flirt, or drop to a single emoji if the volume feels too high.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `you sounded amazing on the phone ${ctx.c}`,
          `${ctx.c} you already know`,
          `cute ${ctx.c}`,
          `saving this for later ${ctx.c}`,
          `you owe me a date ${ctx.c}`,
          `${ctx.c} tonight`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `${ctx.c} good morning handsome`,
            interpretation: `Morning-coded warmth. Mirror with another ${ctx.c} or a flirty-coded reply.`,
          },
          {
            setting: 'friends',
            message: `${ctx.c} he's into you`,
            interpretation: `Friend-coded encouragement. Mirror with another ${ctx.c} or a sentence that asks for more.`,
          },
          {
            setting: 'social',
            message: `feeling cute ${ctx.c}`,
            interpretation: `Public-coded confidence. Mirror with another ${ctx.c} or a sentence that flirts back.`,
          },
          {
            setting: 'family',
            message: `${ctx.c} tell me more`,
            interpretation: `Family-coded curiosity. Mirror with another ${ctx.c} or a sentence that fills in.`,
          },
          {
            setting: 'work',
            message: `friday drinks ${ctx.c}`,
            interpretation: `Casual work plan. Mirror with another ${ctx.c} in tight channels; prefer a sentence in cross-functional threads.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Flirting Read & Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean in dating? A ${ctx.a} flirting-coded combo explained with replies and platform notes.`,
    tones: ['soft-coded', 'soft-coded', 'soft-coded'],
  },
];

/* ------------------ SARCASM ------------------ */
const SARCASM_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the sarcasm-coded close — the two emojis pair to make the read unmistakably ironic. The sender is signaling that the surrounding message is meant sideways.`,
    meaning: (ctx) =>
      `Used to layer irony on top of a sentence. ${ctx.c} punctuates jokes, eye-roll takes, and deadpan replies. Most senders treat it as a ${ctx.a} soft jab.`,
    overview: (ctx) =>
      `${ctx.c} is what sarcasm looks like in two emojis — the ${ctx.a} register is the combo's whole point, and the two characters together make the read unmistakably ironic. The combo lands on Twitter replies, in tight friend threads, and on TikTok comment sections where irony travels as much as the punchline does.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} shows up on sarcasm-coded takes, in eye-roll replies, and on banter-coded friend threads. The combo does the sarcasm work without forcing the sender to spell it out. In customer-facing comms prefer a sentence so the irony does not overperform.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments — the sarcasm register is the wrong tone for grief. Avoid it on cold work channels where sarcasm reads sharper than on iMessage. For heavier moments reach for a heart or a sentence.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the banter going. For higher-sincerity replies escalate with a sentence that names the irony or drop to a single emoji if the sarcasm lands as too sharp.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `oh fantastic ${ctx.c}`,
          `thanks I hate it ${ctx.c}`,
          `thrilled obviously ${ctx.c}`,
          `just great ${ctx.c}`,
          `oh you were serious ${ctx.c}`,
          `wow ${ctx.c}`,
          `my hero ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `oh you picked the restaurant ${ctx.c}`,
            interpretation: `Banter-coded jab. Mirror with another ${ctx.c} or a sentence that escalates the joke.`,
          },
          {
            setting: 'work',
            message: `another monday ${ctx.c}`,
            interpretation: `Team-coded sigh. Mirror with another ${ctx.c} in tight channels only.`,
          },
          {
            setting: 'social',
            message: `state of the group chat ${ctx.c}`,
            interpretation: `Public eye-roll. Mirror with another ${ctx.c} or a sentence that matches the irony.`,
          },
          {
            setting: 'family',
            message: `dad just used that word again ${ctx.c}`,
            interpretation: `Family-coded sarcasm. Mirror with another ${ctx.c} or a sentence that catches the joke.`,
          },
          {
            setting: 'dating',
            message: `oh you're cooking tonight ${ctx.c}`,
            interpretation: `Flirty-coded jab. Mirror with another ${ctx.c} or a sentence that joins the joke.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Sarcasm Meaning & How To Read It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} sarcasm-coded combo explained with examples, replies, and platform notes.`,
    tones: ['dry', 'soft', 'sharp'],
  },
  {
    description: (ctx) =>
      `${ctx.c} lives in the irony-coded space — the two emojis together make the sarcasm register explicit.`,
    meaning: (ctx) =>
      `Used to send an ironic-coded reply. ${ctx.c} lives on Twitter, in tight friend threads, and on TikTok comment sections.`,
    overview: (ctx) =>
      `${ctx.c} uses two emojis to do sarcasm work that text alone would land clumsier. The ${ctx.a} register is fluent across platforms, which is why the combo shows up everywhere a deadpan-coded reply would fit.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates sarcasm-coded replies, deadpan takes, and banter-coded threads. The combo carries the irony without forcing extra context.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments. Avoid it in cross-functional work channels where sarcasm reads sharper. For heavier moments reach for a sentence.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the banter alive. For higher-sincerity replies escalate with a sentence.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `${ctx.c} can't wait`,
          `thrilled ${ctx.c}`,
          `just what I needed ${ctx.c}`,
          `amazing ${ctx.c}`,
          `oh sure ${ctx.c}`,
          `my favorite ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} can't wait to be ignored again`,
            interpretation: `Friend-coded jab. Mirror with another ${ctx.c} or a sentence that escalates the joke.`,
          },
          {
            setting: 'work',
            message: `great meeting could've been an email ${ctx.c}`,
            interpretation: `Team-coded eye-roll. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'social',
            message: `this takes the cake ${ctx.c}`,
            interpretation: `Public-coded irony. Mirror with another ${ctx.c} or a sentence that joins the jab.`,
          },
          {
            setting: 'family',
            message: `oh the family group chat ${ctx.c}`,
            interpretation: `Family-coded irony. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `wow what a gentleman ${ctx.c}`,
            interpretation: `Flirty-coded sarcasm. Mirror with another ${ctx.c} or a sentence that escalates.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} sarcasm-coded combo explained with example messages and replies.`,
    tones: ['soft', 'sharp', 'dry'],
  },
  {
    description: (ctx) =>
      `${ctx.c} pairs two emojis to land a sarcasm-coded reply. The combo reads as a soft jab without writing a sentence.`,
    meaning: (ctx) =>
      `Signals an ironic-coded reply without writing a sentence. ${ctx.c} is shorthand for "obviously not" or "you know what you did."`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the eye-roll cue from the other. The combo reads the same on Twitter, in tight friend threads, and on TikTok comment sections. The ${ctx.a} cue makes the sarcasm register explicit.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates sarcasm-coded replies, deadpan takes, and banter threads. In customer-facing work comms prefer a sentence.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments. Avoid it on cold work channels. Reach for a sentence for heavier moments.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the banter alive. For higher-sincerity replies escalate with a sentence.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `oh wow ${ctx.c}`,
          `obviously ${ctx.c}`,
          `cool cool cool ${ctx.c}`,
          `just peachy ${ctx.c}`,
          `yeah that's what I wanted ${ctx.c}`,
          `no it's fine ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} spilled coffee again huh`,
            interpretation: `Friend-coded sarcasm. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `${ctx.c} now we wait`,
            interpretation: `Team-coded sigh. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'social',
            message: `oh that's the take? ${ctx.c}`,
            interpretation: `Public-coded eye-roll. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `hi mom ${ctx.c}`,
            interpretation: `Family-coded sarcasm. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `you forgot again ${ctx.c}`,
            interpretation: `Flirty-coded sarcasm. Mirror with another ${ctx.c} or a sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Sarcasm Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} sarcasm-coded combo explained with example messages.`,
    tones: ['dry', 'soft', 'sharp'],
  },
];

/* ------------------ CELEBRATION ------------------ */
const CELEBRATION_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the celebration-coded close — the two emojis pair to mark a win, a milestone, or a moment the sender wants punctuated with confetti energy.`,
    meaning: (ctx) =>
      `Used to celebrate wins, milestones, and good news. ${ctx.c} shows up on engagement announcements, grad photos, and team-coded wins. Most senders treat it as a louder alternative to a single 🎉.`,
    overview: (ctx) =>
      `${ctx.c} is what winning looks like in two emojis — the ${ctx.a} register is the combo's whole point, and the two characters together make the milestone read unmistakably celebratory. The combo lands on Twitter, in tight friend threads, on Instagram captions, and on TikTok comment sections without losing the read.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates win-coded threads, milestone posts, and tight friend-coded chats. The combo carries the celebration without forcing extra text. In wide org comms prefer a single emoji or a sentence so the loud register does not overperform.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments — the loud register is the wrong tone for grief. Avoid it on customer-facing comms where the volume can read as performative.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the celebration moving. For higher-sincerity replies escalate with a sentence that names the win.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `we did it ${ctx.c}`,
          `say yes ${ctx.c}`,
          `she graduated ${ctx.c}`,
          `first day at the new job ${ctx.c}`,
          `best news all week ${ctx.c}`,
          `i am shaking ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `we got the apartment ${ctx.c}`,
            interpretation: `Friend-coded win. Mirror with another ${ctx.c} or a sentence that matches the energy.`,
          },
          {
            setting: 'family',
            message: `baby is here ${ctx.c}`,
            interpretation: `Family-coded celebration. Mirror with another ${ctx.c} or a sentence that fills in.`,
          },
          {
            setting: 'work',
            message: `we shipped it ${ctx.c}`,
            interpretation: `Team-coded win. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'dating',
            message: `we're official ${ctx.c}`,
            interpretation: `Couple-coded win. Mirror with another ${ctx.c} or a follow-up sweet line.`,
          },
          {
            setting: 'social',
            message: `album drops at midnight ${ctx.c}`,
            interpretation: `Public-coded hype. Mirror with another ${ctx.c} or a sentence that escalates.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Celebration Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} celebration-coded combo explained with replies and platform notes.`,
    tones: ['loud', 'medium', 'loud'],
  },
  {
    description: (ctx) =>
      `${ctx.c} punctuates wins and milestones. The combo reads as the louder alternative to a single 🎉.`,
    meaning: (ctx) =>
      `Used to mark a moment the sender wants punctuated with confetti. ${ctx.c} shows up on big news — engagements, grad photos, new jobs, new houses.`,
    overview: (ctx) =>
      `${ctx.c} uses two emojis to celebrate what one alone wouldn't carry. The ${ctx.a} register is consistent across audiences — iMessage, Instagram, TikTok all use the combo on milestone-coded content.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} shows up on celebration-coded posts and milestone tags. The combo carries the moment without forcing extra context.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments. Avoid it on customer-facing comms where the loud register reads as performative.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the celebration alive. For higher-sincerity replies prefer a sentence.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `we did the thing ${ctx.c}`,
          `forever ${ctx.c}`,
          `the news is real ${ctx.c}`,
          `it's happening ${ctx.c}`,
          `so proud ${ctx.c}`,
          `ring secured ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} girl you did it`,
            interpretation: `Friend-coded celebration. Mirror with another ${ctx.c} or a warm sentence.`,
          },
          {
            setting: 'family',
            message: `graduation ceremony done ${ctx.c}`,
            interpretation: `Family-coded milestone. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `signed the contract ${ctx.c}`,
            interpretation: `Team-coded win. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'dating',
            message: `met your mom she loved me ${ctx.c}`,
            interpretation: `Partner-coded celebration. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'social',
            message: `team won ${ctx.c}`,
            interpretation: `Public-coded hype. Mirror with another ${ctx.c} or a hyped sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Meaning & When To Use It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean in chat? A ${ctx.a} celebration-coded combo explained with replies.`,
    tones: ['loud', 'loud', 'medium'],
  },
  {
    description: (ctx) =>
      `${ctx.c} marks a moment the sender wants punctuated with confetti. The combo reads as the louder sibling of a single 🎉.`,
    meaning: (ctx) =>
      `Signals celebration-coded energy without writing a sentence. ${ctx.c} shows up on milestone posts and tight friend threads.`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the noise cue from the other. The combo reads the same on iMessage, Instagram, and TikTok.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates win-coded threads, milestone posts, and tight friend-coded chats.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments. Avoid it on cold work comms.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the celebration moving. Escalate with a sentence for higher sincerity.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `saying yes ${ctx.c}`,
          `grandkids are here ${ctx.c}`,
          `best day ever ${ctx.c}`,
          `i can't believe it ${ctx.c}`,
          `officially moving ${ctx.c}`,
          `we made it ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} you earned it`,
            interpretation: `Friend-coded celebration. Mirror with another ${ctx.c} or a warm sentence.`,
          },
          {
            setting: 'family',
            message: `she said yes ${ctx.c}`,
            interpretation: `Family-coded milestone. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `signed off ${ctx.c}`,
            interpretation: `Team-coded win. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'dating',
            message: `one year ${ctx.c}`,
            interpretation: `Couple-coded milestone. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'social',
            message: `we won ${ctx.c}`,
            interpretation: `Public-coded hype. Mirror with another ${ctx.c} or a hyped sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} celebration-coded combo explained with example messages.`,
    tones: ['loud', 'medium', 'soft'],
  },
];

/* ------------------ EMOTION ------------------ */
const EMOTION_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the emotion-coded close — the two emojis together carry a feeling the sender cannot put in a sentence.`,
    meaning: (ctx) =>
      `Used to express feeling-coded moments. ${ctx.c} shows up on tender replies, share-coded messages, and softer-coded chats.`,
    overview: (ctx) =>
      `${ctx.c} lives in the emotion-coded space — the ${ctx.a} register is the combo's whole point, and the two characters together carry the feeling the sender cannot easily write.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates tender replies, share-coded messages, and softer-coded chats. The combo carries the feeling without forcing the sender to spell it out.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in work channels where the emotion register reads off. Avoid it on cold professional threads. For heavier moments reach for a heart or a sentence.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another emoji or escalate with a sentence that names the feeling.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `today was a lot ${ctx.c}`,
          `i miss you ${ctx.c}`,
          `this is everything ${ctx.c}`,
          `i'm okay ${ctx.c}`,
          `just got the news ${ctx.c}`,
          `i needed this ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `thinking of you today ${ctx.c}`,
            interpretation: `Partner-coded tenderness. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'friends',
            message: `it's been a hard week ${ctx.c}`,
            interpretation: `Friend-coded share. Mirror with another ${ctx.c} or a sentence that acknowledges.`,
          },
          {
            setting: 'family',
            message: `mom had a good day ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence that fills in.`,
          },
          {
            setting: 'social',
            message: `she needed this ${ctx.c}`,
            interpretation: `Public-coded tender. Mirror with another ${ctx.c} or a sentence that matches.`,
          },
          {
            setting: 'work',
            message: `it's been a day ${ctx.c}`,
            interpretation: `Team-coded tiredness. Mirror with another ${ctx.c} in tight channels.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Emotion Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} emotion-coded combo explained with replies and platform notes.`,
    tones: ['tender', 'soft', 'warm'],
  },
  {
    description: (ctx) =>
      `${ctx.c} lives in the emotion-coded space. The two emojis carry a feeling-coded reaction without a sentence.`,
    meaning: (ctx) =>
      `Used to share a feeling. ${ctx.c} shows up on tender replies, share-coded messages, and softer chats.`,
    overview: (ctx) =>
      `${ctx.c} pairs two emojis to carry an emotion the sender cannot easily write. The ${ctx.a} register is consistent across audiences.`,
    howPeopleUseIt: (ctx) => `${ctx.c} punctuates tender replies and share-coded messages.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} in work channels where the emotion register reads off.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another emoji or escalate with a sentence.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `it was beautiful ${ctx.c}`,
          `i cried ${ctx.c}`,
          `this means everything ${ctx.c}`,
          `rough day ${ctx.c}`,
          `soft spot ${ctx.c}`,
          `safe ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `${ctx.c} you make it easy`,
            interpretation: `Partner-coded warmth. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'friends',
            message: `${ctx.c} hard but glad i told you`,
            interpretation: `Friend-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `home safe ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `${ctx.c} we needed this news`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `long day ${ctx.c}`,
            interpretation: `Team-coded tiredness. Mirror with another ${ctx.c} in tight channels.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Meaning & When To Use It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} emotion-coded combo explained with example messages.`,
    tones: ['soft', 'warm', 'tender'],
  },
  {
    description: (ctx) =>
      `${ctx.c} carries an emotion-coded reaction. The two emojis together do the feeling work.`,
    meaning: (ctx) =>
      `Signals an emotion-coded reaction. ${ctx.c} is shorthand for a feeling the sender cannot write in a sentence.`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the warmth cue from the other. The combo reads the same on iMessage, Instagram, and TikTok.`,
    howPeopleUseIt: (ctx) => `${ctx.c} shows up in tender replies and share-coded messages.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} in work channels. Avoid it in cold professional threads.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another emoji or escalate with a sentence.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `needed this today ${ctx.c}`,
          `safe and sound ${ctx.c}`,
          `feeling held ${ctx.c}`,
          `i'm so proud of us ${ctx.c}`,
          `held back tears ${ctx.c}`,
          `whole heart ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `i needed you tonight ${ctx.c}`,
            interpretation: `Partner-coded tenderness. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'friends',
            message: `i'm okay but ${ctx.c}`,
            interpretation: `Friend-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `first day at school ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `we needed this ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `long week ${ctx.c}`,
            interpretation: `Team-coded tiredness. Mirror with another ${ctx.c} in tight channels.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Emotion Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} emotion-coded combo explained with example messages.`,
    tones: ['warm', 'tender', 'soft'],
  },
];

/* ------------------ REACTION ------------------ */
const REACTION_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the reaction-coded close — the two emojis pair to react to a specific moment more emphatically than a single emoji could.`,
    meaning: (ctx) =>
      `Used to react to a moment the sender wants punctuated. ${ctx.c} shows up on disbelief, laughter, shock, hype, and other share-coded reactions.`,
    overview: (ctx) =>
      `${ctx.c} lives in the reaction-coded space — the ${ctx.a} register is the combo's whole point, and the two characters together make the reaction read unmistakably specific.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates disbelief-coded reveals, laugh-coded moments, and hype-coded replies. The combo carries the reaction without forcing extra text.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments. Avoid it in cold work channels where the loud register reads as performative.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the reaction moving. Escalate with a sentence that names the moment.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `cannot believe it ${ctx.c}`,
          `wait what ${ctx.c}`,
          `i screamed ${ctx.c}`,
          `i'm done ${ctx.c}`,
          `wow ${ctx.c}`,
          `actually iconic ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} he actually said that`,
            interpretation: `Friend-coded reaction. Mirror with another ${ctx.c} or a sentence that escalates.`,
          },
          {
            setting: 'work',
            message: `meeting cancelled ${ctx.c}`,
            interpretation: `Team-coded relief. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'social',
            message: `this thread ${ctx.c}`,
            interpretation: `Public-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `dad just ${ctx.c}`,
            interpretation: `Family-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `you actually remembered ${ctx.c}`,
            interpretation: `Dating-coded reaction. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Reaction Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} reaction-coded combo explained with replies and platform notes.`,
    tones: ['loud', 'medium', 'soft'],
  },
  {
    description: (ctx) =>
      `${ctx.c} lives in the reaction-coded space — the two emojis together make the share-coded moment explicit.`,
    meaning: (ctx) =>
      `Used to react to a specific moment. ${ctx.c} shows up on disbelief, laughter, shock, hype.`,
    overview: (ctx) =>
      `${ctx.c} uses two emojis to do reaction work one alone wouldn't carry. The ${ctx.a} register is consistent across platforms.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates disbelief-coded reveals and hype-coded replies. The combo carries the reaction without forcing extra text.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments. Avoid it on cold work channels.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the reaction moving. Escalate with a sentence.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `stop ${ctx.c}`,
          `wait really ${ctx.c}`,
          `lol ${ctx.c}`,
          `waittt ${ctx.c}`,
          `done ${ctx.c}`,
          `screaming ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} i just saw`,
            interpretation: `Friend-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `release shipped ${ctx.c}`,
            interpretation: `Team-coded relief. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'social',
            message: `this is the one ${ctx.c}`,
            interpretation: `Public-coded hype. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `you saw that? ${ctx.c}`,
            interpretation: `Family-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `no way ${ctx.c}`,
            interpretation: `Dating-coded reaction. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Reaction Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} reaction-coded combo explained with example messages.`,
    tones: ['medium', 'loud', 'soft'],
  },
  {
    description: (ctx) =>
      `${ctx.c} punctuates a reaction-coded moment more emphatically than a single emoji could.`,
    meaning: (ctx) =>
      `Signals a reaction-coded reply. ${ctx.c} is shorthand for "this surprised me" or "I'm reacting."`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the cue from the other. The combo reads the same on iMessage, Instagram, and TikTok.`,
    howPeopleUseIt: (ctx) => `${ctx.c} shows up on disbelief-coded reveals and hype replies.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments. Avoid it on cold work channels.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the reaction moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `no way ${ctx.c}`,
          `stunned ${ctx.c}`,
          `actually shocked ${ctx.c}`,
          `unreal ${ctx.c}`,
          `i can't ${ctx.c}`,
          `done ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} are you serious`,
            interpretation: `Friend-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `finally ${ctx.c}`,
            interpretation: `Team-coded relief. Mirror with another ${ctx.c} in tight channels.`,
          },
          {
            setting: 'social',
            message: `the comments ${ctx.c}`,
            interpretation: `Public-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `i saw it ${ctx.c}`,
            interpretation: `Family-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `look at you ${ctx.c}`,
            interpretation: `Dating-coded reaction. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Reaction Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} reaction-coded combo explained with example messages.`,
    tones: ['soft', 'medium', 'loud'],
  },
];

/* ------------------ RELATIONSHIP ------------------ */
const RELATIONSHIP_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the relationship-coded close — the two emojis pair to mark a moment between two people more clearly than a single heart could.`,
    meaning: (ctx) =>
      `Used to mark a moment between two people. ${ctx.c} shows up on partner-coded chats, family-coded messages, and tight friend threads.`,
    overview: (ctx) =>
      `${ctx.c} lives in the relationship-coded space — the ${ctx.a} register is the combo's whole point, and the two characters together make the moment read unmistakably shared.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates partner-coded chats, family-coded messages, and tight friend threads. The combo carries the moment without forcing extra text.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in work channels where the relationship register reads off. Avoid it on cold professional threads.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving. Escalate with a sentence that names the moment.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `i love us ${ctx.c}`,
          `thinking of us ${ctx.c}`,
          `you and me ${ctx.c}`,
          `forever ${ctx.c}`,
          `us against the world ${ctx.c}`,
          `i choose you ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `${ctx.c} happy anniversary`,
            interpretation: `Anniversary-coded warmth. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'family',
            message: `love you mom ${ctx.c}`,
            interpretation: `Family-coded warmth. Mirror with another ${ctx.c} or a warm reply.`,
          },
          {
            setting: 'friends',
            message: `friendship of 10 years ${ctx.c}`,
            interpretation: `Friend-coded warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `my person ${ctx.c}`,
            interpretation: `Public-coded warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `team love ${ctx.c}`,
            interpretation: `Team-coded warmth. Mirror with another ${ctx.c} in tight channels.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Relationship Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} relationship-coded combo explained with replies and platform notes.`,
    tones: ['warm', 'tender', 'soft'],
  },
  {
    description: (ctx) =>
      `${ctx.c} lives in the relationship-coded space. The two emojis together mark a shared moment.`,
    meaning: (ctx) =>
      `Used to mark a shared moment. ${ctx.c} shows up on partner-coded chats, family-coded messages, and tight friend threads.`,
    overview: (ctx) =>
      `${ctx.c} uses two emojis to do relationship work one alone wouldn't carry. The ${ctx.a} register is consistent across audiences.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates partner-coded chats, family-coded messages, and tight friend threads.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} in work channels where the register reads off.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `love you always ${ctx.c}`,
          `together ${ctx.c}`,
          `side by side ${ctx.c}`,
          `in this together ${ctx.c}`,
          `my family ${ctx.c}`,
          `home ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `one year in ${ctx.c}`,
            interpretation: `Anniversary warmth. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'family',
            message: `best brothers ${ctx.c}`,
            interpretation: `Family warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'friends',
            message: `day one friends ${ctx.c}`,
            interpretation: `Friend warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `my whole heart ${ctx.c}`,
            interpretation: `Public warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `best team ${ctx.c}`,
            interpretation: `Team warmth. Mirror with another ${ctx.c} in tight channels.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Meaning & When To Use It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} relationship-coded combo explained with example messages.`,
    tones: ['tender', 'warm', 'soft'],
  },
  {
    description: (ctx) =>
      `${ctx.c} marks a moment between two people. The two emojis together carry the warmth the sender wants the recipient to feel.`,
    meaning: (ctx) =>
      `Signals a moment between two people. ${ctx.c} is shorthand for shared warmth.`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the partner cue from the other. The combo reads the same on iMessage, Instagram, and TikTok.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} shows up on partner-coded chats, family-coded messages, and tight friend threads.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} in work channels where the register reads off.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `all in ${ctx.c}`,
          `us ${ctx.c}`,
          `my people ${ctx.c}`,
          `always ${ctx.c}`,
          `true love ${ctx.c}`,
          `kindred ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'dating',
            message: `${ctx.c} you feel like home`,
            interpretation: `Partner warmth. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'family',
            message: `love you guys ${ctx.c}`,
            interpretation: `Family warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'friends',
            message: `ride or die ${ctx.c}`,
            interpretation: `Friend warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `my person ${ctx.c}`,
            interpretation: `Public warmth. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `team ${ctx.c}`,
            interpretation: `Team warmth. Mirror with another ${ctx.c} in tight channels.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Relationship Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} relationship-coded combo explained with example messages.`,
    tones: ['soft', 'warm', 'tender'],
  },
];

/* ------------------ WORK ------------------ */
const WORK_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the work-coded close — the two emojis pair to mark a moment in professional life more cleanly than a single emoji could.`,
    meaning: (ctx) =>
      `Used to mark a moment in professional life. ${ctx.c} shows up on shipped, signed, launched, scheduled, and other work-coded wins.`,
    overview: (ctx) =>
      `${ctx.c} lives in the work-coded space — the ${ctx.a} register is the combo's whole point, and the two characters together make the moment read unmistakably professional.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates stand-up threads, milestone messages, and replies in working channels. The combo carries the moment without forcing extra text.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in customer-facing comms where the work register reads as inside-coded. Avoid it on cold professional threads where the volume is too loud.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving. Escalate with a sentence for higher sincerity.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `shipped ${ctx.c}`,
          `launched ${ctx.c}`,
          `signed off ${ctx.c}`,
          `done ${ctx.c}`,
          `meeting over ${ctx.c}`,
          `ready for review ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'work',
            message: `release is live ${ctx.c}`,
            interpretation: `Team-coded win. Mirror with another ${ctx.c} or a sentence that closes the thread.`,
          },
          {
            setting: 'social',
            message: `new job ${ctx.c}`,
            interpretation: `Public-coded celebration. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'friends',
            message: `i got the offer ${ctx.c}`,
            interpretation: `Friend-coded celebration. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `promoted ${ctx.c}`,
            interpretation: `Family-coded win. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `big day at work ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Work Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean at work? A ${ctx.a} work-coded combo explained with replies and platform notes.`,
    tones: ['professional', 'productive', 'casual'],
  },
  {
    description: (ctx) =>
      `${ctx.c} lives in the work-coded space. The two emojis together mark a moment in professional life.`,
    meaning: (ctx) =>
      `Used to mark a moment in professional life. ${ctx.c} shows up on shipped, signed, launched, scheduled.`,
    overview: (ctx) =>
      `${ctx.c} uses two emojis to do work-coded punctuation one alone wouldn't carry. The ${ctx.a} register is consistent across platforms.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates stand-up threads, milestone messages, and replies in working channels.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in customer-facing comms where the register reads as inside-coded.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `friday ${ctx.c}`,
          `phew ${ctx.c}`,
          `lunch ${ctx.c}`,
          `meeting time ${ctx.c}`,
          `standing by ${ctx.c}`,
          `all good ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'work',
            message: `${ctx.c} standup done`,
            interpretation: `Team-coded completion. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `big week ahead ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'friends',
            message: `got the offer ${ctx.c}`,
            interpretation: `Friend-coded win. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `first day ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `big week ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Work Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} work-coded combo explained with example messages.`,
    tones: ['productive', 'professional', 'casual'],
  },
  {
    description: (ctx) =>
      `${ctx.c} punctuates a moment in professional life. The two emojis carry the register together.`,
    meaning: (ctx) =>
      `Signals a professional-coded moment. ${ctx.c} is shorthand for shipped, signed, scheduled.`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the partner cue from the other. The combo reads the same on Slack, Teams, and Discord.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} shows up on stand-up threads, milestone messages, and replies in working channels.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} in customer-facing comms.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `queued ${ctx.c}`,
          `ready when you are ${ctx.c}`,
          `pull request up ${ctx.c}`,
          `on it ${ctx.c}`,
          `in review ${ctx.c}`,
          `all hands ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'work',
            message: `${ctx.c} ready when you are`,
            interpretation: `Team-coded stand-by. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `just promoted ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'friends',
            message: `shipped it ${ctx.c}`,
            interpretation: `Friend-coded win. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `got the role ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `big day ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Work Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean at work? A ${ctx.a} work-coded combo explained with example messages.`,
    tones: ['casual', 'productive', 'professional'],
  },
];

/* ------------------ FOOD ------------------ */
const FOOD_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the food-coded close — the two emojis pair to set a scene more vividly than a single emoji could.`,
    meaning: (ctx) =>
      `Used to mark a meal, drink, or snack. ${ctx.c} shows up on food-coded posts, dinner plans, and snack-coded reactions.`,
    overview: (ctx) =>
      `${ctx.c} lives in the food-coded space — the ${ctx.a} register is the combo's whole point, and the two characters together make the moment read unmistakably edible.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates food-coded posts, dinner plans, and snack-coded reactions. The combo carries the moment without forcing extra text.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments where the food register reads off. Avoid it on cold work channels.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving. Escalate with a sentence that names the meal.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `dinner tonight ${ctx.c}`,
          `so good ${ctx.c}`,
          `made this ${ctx.c}`,
          `lunch break ${ctx.c}`,
          `snack time ${ctx.c}`,
          `treat yourself ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} tried this new place`,
            interpretation: `Friend-coded food share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `dinner? ${ctx.c}`,
            interpretation: `Dating-coded plan. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'family',
            message: `sunday dinner ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `made from scratch ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `lunch and learn ${ctx.c}`,
            interpretation: `Work-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Food Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} food-coded combo explained with replies and platform notes.`,
    tones: ['cozy', 'daily', 'indulgent'],
  },
  {
    description: (ctx) =>
      `${ctx.c} lives in the food-coded space. The two emojis together set a meal scene.`,
    meaning: (ctx) =>
      `Used to mark a meal, drink, or snack. ${ctx.c} shows up on food-coded posts and dinner plans.`,
    overview: (ctx) =>
      `${ctx.c} uses two emojis to do food-coded punctuation one alone wouldn't carry. The ${ctx.a} register is consistent across platforms.`,
    howPeopleUseIt: (ctx) => `${ctx.c} punctuates food-coded posts and snack-coded reactions.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} in sympathy or condolence moments.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `midnight snack ${ctx.c}`,
          `made it ${ctx.c}`,
          `so hungry ${ctx.c}`,
          `i want this ${ctx.c}`,
          `best bite ${ctx.c}`,
          `cheers ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} happy hour?`,
            interpretation: `Friend-coded plan. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `i made this ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'family',
            message: `sunday roast ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `snack mood ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `team lunch ${ctx.c}`,
            interpretation: `Work-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Food Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} food-coded combo explained with example messages.`,
    tones: ['daily', 'cozy', 'indulgent'],
  },
  {
    description: (ctx) =>
      `${ctx.c} sets a meal-coded scene. The two emojis together carry the food register.`,
    meaning: (ctx) =>
      `Signals a food-coded moment. ${ctx.c} is shorthand for "this is what's on the table."`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the food cue from the other. The combo reads the same on iMessage, Instagram, and TikTok.`,
    howPeopleUseIt: (ctx) => `${ctx.c} shows up on food-coded posts and dinner plans.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} in sympathy or condolence moments.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `so satisfying ${ctx.c}`,
          `ice cream weather ${ctx.c}`,
          `fresh ${ctx.c}`,
          `happy hour ${ctx.c}`,
          `cheers ${ctx.c}`,
          `mid afternoon pick-me-up ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} i want this`,
            interpretation: `Friend-coded want. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `dinner ready ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'family',
            message: `cookie time ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `recipe below ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `treat day ${ctx.c}`,
            interpretation: `Work-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Food Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} food-coded combo explained with example messages.`,
    tones: ['indulgent', 'cozy', 'daily'],
  },
];

/* ------------------ TRAVEL ------------------ */
const TRAVEL_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is the travel-coded close — the two emojis pair to set a journey-coded scene more vividly than a single emoji could.`,
    meaning: (ctx) =>
      `Used to mark a journey, arrival, departure, or moment on the ground. ${ctx.c} shows up on vacation posts, plane rides, and travel-coded reactions.`,
    overview: (ctx) =>
      `${ctx.c} lives in the travel-coded space — the ${ctx.a} register is the combo's whole point, and the two characters together make the moment read unmistakably on-the-road.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates vacation posts, plane rides, and travel-coded reactions. The combo carries the moment without forcing extra text.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} on cold work channels where the travel register reads as off-topic. Avoid it as a deflection from real work.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving. Escalate with a sentence that names the trip.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `made it ${ctx.c}`,
          `travel day ${ctx.c}`,
          `beach mode ${ctx.c}`,
          `road trip ${ctx.c}`,
          `next stop ${ctx.c}`,
          `so good to be here ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `booked the trip ${ctx.c}`,
            interpretation: `Friend-coded plan. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `we made it ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `take me back ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'social',
            message: `view from the hotel ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `out of office ${ctx.c}`,
            interpretation: `Work-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Travel Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} travel-coded combo explained with replies and platform notes.`,
    tones: ['wanderlust', 'casual', 'big-trip'],
  },
  {
    description: (ctx) =>
      `${ctx.c} lives in the travel-coded space. The two emojis together set a journey-coded scene.`,
    meaning: (ctx) =>
      `Used to mark a journey, arrival, departure, or moment on the ground. ${ctx.c} shows up on vacation posts and travel-coded reactions.`,
    overview: (ctx) =>
      `${ctx.c} uses two emojis to do travel-coded punctuation one alone wouldn't carry. The ${ctx.a} register is consistent across platforms.`,
    howPeopleUseIt: (ctx) => `${ctx.c} punctuates vacation posts and travel-coded reactions.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} on cold work channels.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `made it home ${ctx.c}`,
          `airport mode ${ctx.c}`,
          `one bag ${ctx.c}`,
          `crossing borders ${ctx.c}`,
          `weekend trip ${ctx.c}`,
          `so good ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} layover stop`,
            interpretation: `Friend-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `arrived ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `wish you were here ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'social',
            message: `first sunset ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `back online ${ctx.c}`,
            interpretation: `Work-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Travel Read`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} travel-coded combo explained with example messages.`,
    tones: ['casual', 'wanderlust', 'big-trip'],
  },
  {
    description: (ctx) =>
      `${ctx.c} sets a travel-coded scene. The two emojis together carry the on-the-road register.`,
    meaning: (ctx) =>
      `Signals a travel-coded moment. ${ctx.c} is shorthand for "I'm on my way" or "I made it."`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the partner cue from the other. The combo reads the same on iMessage, Instagram, and TikTok.`,
    howPeopleUseIt: (ctx) => `${ctx.c} shows up on vacation posts and travel-coded reactions.`,
    whenNotToUse: (ctx) => `Skip ${ctx.c} on cold work channels.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the moment moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `next adventure ${ctx.c}`,
          `wheels up ${ctx.c}`,
          `sunset views ${ctx.c}`,
          `headed out ${ctx.c}`,
          `weekend vibes ${ctx.c}`,
          `bucket list ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} weekend trip?`,
            interpretation: `Friend-coded plan. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `home again ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `next time together ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
          {
            setting: 'social',
            message: `travelgram ${ctx.c}`,
            interpretation: `Public-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `travel day ${ctx.c}`,
            interpretation: `Work-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Travel Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} travel-coded combo explained with example messages.`,
    tones: ['big-trip', 'casual', 'wanderlust'],
  },
];

/* ------------------ OTHER ------------------ */
const OTHER_ARCH: SegmentOverrides[] = [
  {
    description: (ctx) =>
      `${ctx.c} is a cross-category combo — the read depends on which two emojis the sender chose.`,
    meaning: (ctx) =>
      `Used to mark a moment the sender wants to punctuate. ${ctx.c} shows up across categories; the register depends on the partner emojis.`,
    overview: (ctx) =>
      `${ctx.c} pairs two emojis to mark a specific moment. The ${ctx.a} register is set by whichever emoji takes the lead; the partner emoji sharpens it.`,
    howPeopleUseIt: (ctx) =>
      `${ctx.c} punctuates share-coded messages and reaction-coded replies. The combo carries the moment without forcing extra text.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments unless the partner emojis are sympathy-coded. Avoid it on cold work channels where the read is ambiguous.`,
    howToReply: (ctx) =>
      `Mirror ${ctx.c} with another ${ctx.c} to keep the register moving. Escalate with a sentence that names the moment.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `just saw ${ctx.c}`,
          `this is good ${ctx.c}`,
          `made my day ${ctx.c}`,
          `wait what ${ctx.c}`,
          `loved this ${ctx.c}`,
          `unexpected ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} ok but wait`,
            interpretation: `Friend-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `just shipped ${ctx.c}`,
            interpretation: `Team-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `this is the post ${ctx.c}`,
            interpretation: `Public-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `love you ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `look at us ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} cross-category combo explained with replies and platform notes.`,
    tones: ['cross-category', 'mixed', 'contextual'],
  },
  {
    description: (ctx) =>
      `${ctx.c} is a cross-category combo. The two emojis together set the register.`,
    meaning: (ctx) =>
      `Used to mark a moment the sender wants to punctuate. The register depends on the partner emojis.`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from the leading emoji and the supporting cue from the other. The combo reads the same on iMessage, Instagram, and TikTok.`,
    howPeopleUseIt: (ctx) => `${ctx.c} punctuates share-coded messages.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments unless the partner emojis are sympathy-coded.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the register moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `soft spot ${ctx.c}`,
          `can't help it ${ctx.c}`,
          `this energy ${ctx.c}`,
          `me right now ${ctx.c}`,
          `felt this ${ctx.c}`,
          `sigh ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} wait listen`,
            interpretation: `Friend-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `shipping it ${ctx.c}`,
            interpretation: `Team-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `iconic ${ctx.c}`,
            interpretation: `Public-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `remember ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `made for this ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Read & When To Use It`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} cross-category combo explained with example messages.`,
    tones: ['mixed', 'contextual', 'cross-category'],
  },
  {
    description: (ctx) =>
      `${ctx.c} pairs two emojis for a moment the sender wants to punctuate. The register depends on the partner emojis.`,
    meaning: (ctx) =>
      `Signals a moment the sender wants to punctuate. The cross-category register shifts with the partner emojis.`,
    overview: (ctx) =>
      `${ctx.c} borrows the ${ctx.a} register from one emoji and the supporting cue from the other. The combo reads the same across platforms.`,
    howPeopleUseIt: (ctx) => `${ctx.c} punctuates share-coded messages.`,
    whenNotToUse: (ctx) =>
      `Skip ${ctx.c} in sympathy or condolence moments unless the partner emojis are sympathy-coded.`,
    howToReply: (ctx) => `Mirror ${ctx.c} with another ${ctx.c} to keep the register moving.`,
    examples: (ctx, rand) =>
      pickN(
        [
          `made my week ${ctx.c}`,
          `felt that ${ctx.c}`,
          `soft ${ctx.c}`,
          `real ${ctx.c}`,
          `gentle reminder ${ctx.c}`,
          `in my feelings ${ctx.c}`,
        ],
        3 + Math.floor(rand() * 3),
        rand
      ),
    conversationLines: (ctx, rand) =>
      takeLines(
        [
          {
            setting: 'friends',
            message: `${ctx.c} you get it`,
            interpretation: `Friend-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'work',
            message: `done ${ctx.c}`,
            interpretation: `Team-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'social',
            message: `pin this ${ctx.c}`,
            interpretation: `Public-coded reaction. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'family',
            message: `miss this ${ctx.c}`,
            interpretation: `Family-coded share. Mirror with another ${ctx.c} or a sentence.`,
          },
          {
            setting: 'dating',
            message: `you saw me ${ctx.c}`,
            interpretation: `Dating-coded share. Mirror with another ${ctx.c} or a sweet reply.`,
          },
        ],
        rand
      ),
    seoTitle: (ctx) => `${ctx.c} Combo Meaning`,
    seoDescription: (ctx) =>
      `What does ${ctx.c} mean? A ${ctx.a} cross-category combo explained with example messages.`,
    tones: ['contextual', 'cross-category', 'mixed'],
  },
];

/* ------------------ selector ------------------ */

export function getArchetype(
  category: EmojiComboCategoryName,
  variant: 0 | 1 | 2
): SegmentOverrides {
  switch (category) {
    case 'humor':
      return HUMOR_ARCH[variant];
    case 'flirting':
      return FLIRTING_ARCH[variant];
    case 'sarcasm':
      return SARCASM_ARCH[variant];
    case 'celebration':
      return CELEBRATION_ARCH[variant];
    case 'emotion':
      return EMOTION_ARCH[variant];
    case 'reaction':
      return REACTION_ARCH[variant];
    case 'relationship':
      return RELATIONSHIP_ARCH[variant];
    case 'work':
      return WORK_ARCH[variant];
    case 'food':
      return FOOD_ARCH[variant];
    case 'travel':
      return TRAVEL_ARCH[variant];
    case 'other':
    default:
      return OTHER_ARCH[variant];
  }
}

/** Build the context object used by archetype templates. */
export function buildCtx(
  name: string,
  combo: string,
  variant: 0 | 1 | 2,
  tonePool: [string, string, string]
): Record<string, string> {
  return {
    c: combo,
    name,
    a: tonePool[variant],
  };
}

export { pad };
export type { SegmentOverrides, ComboPlanEntry };
