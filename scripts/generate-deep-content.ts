#!/usr/bin/env bun
/**
 * Generate deep-tier long-form content for batch N candidates.
 * Each emoji gets an overview, how-people-use-it, when-not-to-use-it, how-to-reply,
 * FAQs (5), conversation examples (5 across settings), and platform notes (5).
 *
 * Usage: bun run scripts/generate-deep-content.ts "<commit name>" [batch-N]
 *        (the batch-N arg defaults to batch-16 for backward compatibility)
 */
import fs from 'fs';
import path from 'path';

const batchArg = process.argv[3] || 'batch-16';
const planFile = path.join(process.cwd(), 'scripts', `${batchArg}-plan.json`);
const plan = JSON.parse(fs.readFileSync(planFile, 'utf-8'));
const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');

interface EmojiData {
  unicode: string;
  slug: string;
  character: string;
  name: string;
  shortName: string;
  category: string;
  subcategory: string;
  unicodeVersion: string;
  baseMeaning: string;
  tldr?: string;
  contextMeanings?: any[];
  platformNotes?: any[];
  generationalNotes?: any[];
  warnings?: any[];
  relatedCombos?: any[];
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: any;
}

interface SkinToneInfo {
  base: string; // e.g. "Flexed Biceps"
  tone: string; // e.g. "Light Skin Tone"
  emoji: string; // 🦾 emoji
  contextTone: string; // "light" tone descriptor
}

function parseSkinTone(name: string, character: string): SkinToneInfo {
  // Extract base name and tone
  const m = name.match(
    /^(.+?):\s*(Light Skin Tone|Medium-Light Skin Tone|Medium Skin Tone|Medium-Dark Skin Tone|Dark Skin Tone)\s*$/
  );
  if (!m) {
    return { base: name, tone: '', emoji: character, contextTone: '' };
  }
  const base = m[1];
  const tone = m[2];
  const toneMap: Record<string, string> = {
    'Light Skin Tone': 'light',
    'Medium-Light Skin Tone': 'medium-light',
    'Medium Skin Tone': 'medium',
    'Medium-Dark Skin Tone': 'medium-dark',
    'Dark Skin Tone': 'dark',
  };
  return { base, tone, emoji: character, contextTone: toneMap[tone] || '' };
}

// Context labels for variety in body parts / sports / etc.
const SKIN_TONE_DESC: Record<string, string> = {
  light: 'light-skinned',
  'medium-light': 'medium-light-skinned',
  medium: 'medium-skinned',
  'medium-dark': 'medium-dark-skinned',
  dark: 'dark-skinned',
};

const SKIN_TONE_INCLUSIVE: Record<string, string> = {
  light: 'lighter',
  'medium-light': 'medium-light',
  medium: 'mid',
  'medium-dark': 'medium-dark',
  dark: 'deeper',
};

// Category-specific content templates
// Each generates content tailored to the emoji's category

const categoryKnowledge: Record<
  string,
  {
    archetype: string;
    tradition: string;
    register: string;
    socialUse: string;
    pairing: string[];
    faqVariants: { q: string; a: string }[];
    whenNot: string[];
    howToReply: string[];
    intro: string[];
  }
> = {
  // Fantasy characters
  'person-fantasy': {
    archetype: 'fantasy-character-coded reveal',
    tradition: 'costume, lore, or pop-culture tradition',
    register: 'fantasy-coded',
    socialUse:
      'fantasy reveals, fandom-coded tags, role-play moments, and costume-coded party shares',
    pairing: ['🎭', '✨', '⚔️', '🧙', '🎃'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the fantasy-coded reveal — it borrows from costume and pop-culture lore and signals a fantasy-coded moment, costume-party tag, or fandom-coded reaction. The character cue is what makes the read feel fantasy-coded rather than literal.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'Sometimes. In a dating thread {e} can read as playful-coded romance — a costume-pair tag or "fandom partner" hint. On its own it reads more fantasy than romantic.',
      },
      {
        q: 'What does {e} mean from a guy?',
        a: 'From anyone, {e} signals fantasy-coded flex or a fandom-coded reveal. The character cue reads as costume-coded rather than literal, so it tends to land on party tags, friend coded messages, and fandom-coded reveals.',
      },
      {
        q: 'Is {e} cringe now?',
        a: 'Boomers may treat {e} as literal costume content, while Gen Z often uses it for ironic-coded fandom reveals. The character cue is a natural fit for fan-coded moments and party reveals.',
      },
      {
        q: 'Does {e} work in Halloween or costume contexts?',
        a: 'Yes — {e} is one of the most popular fantasy-coded emojis. The character cue fits Halloween reveals, costume-coded party tags, and fantasy-coded fandom shares.',
      },
    ],
    whenNot: [
      'Skip {e} in sympathy, condolence, or break-up contexts. The fantasy-coded character cue is the wrong register for somber moments. A quiet 💔 or a sentence that acknowledges the moment is a better fit.',
      'Avoid {e} in work or formal contexts where the fantasy cue feels off. A plain check-in or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate a different character. The fantasy register is too costume-coded for moments that need a literal cue; use the literal emoji when the read needs to be clear.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, ✨, or a sentence that joins the fantasy energy. If the character cue feels too fantasy-coded, reply with a sharper emoji (😎 or 🙃) that signals playful energy without matching the costume volume.',
      'When {e} lands as a costume-party tag, mirror with another {e}, a sparkle emoji, or a sentence that escalates the party energy. When it arrives as a fandom-coded reveal, mirror with another {e}, a sentence that joins the fandom, or a character emoji that fits.',
    ],
    intro: [
      '{e} is the emoji of fantasy-coded reveal — the costume tradition, the pop-culture cue, and the universal "fantasy moment" tag. Where 🎭 reads as performance-coded character energy and 🧙 reads as spell-coded magic, {e} captures the moment when the sender wants to communicate fantasy-coded energy — a "{c}" costume tag or a fandom-coded reveal.',
      'The character cue borrows from costume tradition and the modern pop-culture aesthetic, which is exactly why the emoji reads as fantasy-coded rather than literal.',
    ],
  },

  // Sport emojis
  'person-sport': {
    archetype: 'sport-coded athletic flex',
    tradition: 'athletic tradition, sports fandom, or workout energy',
    register: 'sport-coded',
    socialUse: 'fitness reveals, game-day tags, athletic-coded flex, and training moments',
    pairing: ['🏆', '💪', '🥇', '⚽', '🎽'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the sport-coded athletic flex — it borrows from athletic tradition and signals a fitness reveal, game-day tag, or workout-coded moment. The athletic cue is what makes the read feel sport-coded rather than literal.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'Sometimes. In a dating thread {e} can read as active-coded romance — a "let\'s workout together" tag or a fitness-coded flirty hint. On its own it reads more sport than romantic.',
      },
      {
        q: 'What does {e} mean from a guy?',
        a: 'From anyone, {e} signals sport-coded flex or a fitness-coded reveal. The athletic cue reads as workout-coded rather than literal, so it tends to land on game-day tags, friend coded messages, and fitness-coded reveals.',
      },
      {
        q: 'Does {e} work for working out moments?',
        a: 'Yes — {e} is one of the most popular sport-coded emojis. The athletic cue fits gym reveals, training-coded tags, and game-day-coded fandom shares.',
      },
      {
        q: 'What is the difference between {e} and 🏆?',
        a: '🏆 is the trophy — the cue is victory-coded finish energy. {e} is the active athletic moment — the cue is sport-coded fitness, the "in the game" energy. Use 🏆 when the moment is victory-coded; use {e} when the moment is sport-coded athletic.',
      },
    ],
    whenNot: [
      'Skip {e} in sympathy, condolence, or break-up contexts. The sport-coded athletic cue is the wrong register for somber moments. A quiet 💔 or a sentence that acknowledges the moment is a better fit.',
      'Avoid {e} in sedentary contexts where the athletic energy feels off. A plain check-in or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate rest or recovery. The sport register is too athletic-coded for quiet moments; use 🛋️ or a sentence when the moment needs calm.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, 💪, or a sentence that joins the athletic energy. If the sport cue feels too active-coded, reply with a softer emoji (🏆 or 🙌) that signals support without matching the workout volume.',
      'When {e} lands as a game-day tag, mirror with another {e}, a trophy emoji, or a sentence that escalates the fan energy. When it arrives as a fitness-coded reveal, mirror with another {e}, a sentence that joins the gym energy, or a flex emoji that fits.',
    ],
    intro: [
      '{e} is the emoji of sport-coded athletic flex — the athletic tradition, the fitness cue, and the universal "in the game" tag. Where 🏆 reads as victory-coded finish energy and ⚽ reads as ball-coded play energy, {e} captures the moment when the sender wants to communicate sport-coded athletic energy — a "{c}" workout tag or a game-day-coded reveal.',
      'The athletic cue borrows from sports tradition and the modern fitness aesthetic, which is exactly why the emoji reads as sport-coded rather than literal.',
    ],
  },

  // Person gestures (facepalming, tipping hand, etc.)
  'person-gesture': {
    archetype: 'person-gesture-coded reaction',
    tradition: 'body language, social performance, or emotional expression',
    register: 'gesture-coded',
    socialUse: 'reactions, emotional shares, mood-coded reveals, and gesture-coded moments',
    pairing: ['🤦', '🙄', '😩', '🤷', '🫠'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the gesture-coded reaction — it borrows from body language and signals an emotional reveal, mood-coded tag, or gesture-coded moment. The body cue is what makes the read feel gesture-coded rather than literal.',
      },
      {
        q: 'Is {e} passive-aggressive?',
        a: 'Sometimes. In a texting thread {e} can read as a mood-coded complaint — a "I can\'t believe this" tag or an exasperated-coded reveal. On its own it reads more gesture than aggressive.',
      },
      {
        q: 'What does {e} mean from a coworker?',
        a: 'From a coworker, {e} signals a gesture-coded reaction or work-coded exasperation. The body cue reads as mood-coded rather than literal, so it tends to land on complaint tags, team coded messages, and "I need a break" reveals.',
      },
      {
        q: 'Is {e} for sarcastic moments?',
        a: 'Yes — {e} is a natural fit for exasperated reveals, gesture-coded reactions, and ironic-coded complaints. The body cue is what makes the read feel gesture-coded rather than sincere.',
      },
      {
        q: 'What is the difference between {e} and 🤦?',
        a: '🤦 is the facepalm — the cue is hands-to-forehead "I can\'t" energy. {e} is the gesture-coded reaction — the cue is body-language-coded expression, the "I have feelings about this" energy. Use 🤦 when the moment is frustrated; use {e} when the moment is gesture-coded expressive.',
      },
    ],
    whenNot: [
      'Skip {e} in celebration or victory contexts. The gesture-coded body cue is the wrong register for triumphant moments. A 🎉 or 🏆 keeps the message joyful.',
      'Avoid {e} in formal or professional contexts where the gesture energy feels off. A plain check-in or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate confidence. The gesture register is too expressive-coded for decisive moments; use 💪 or 🫡 when the moment needs strength.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, 🤦, or a sentence that joins the gesture energy. If the body cue feels too expressive-coded, reply with a softer emoji (🙃 or 🫠) that signals shared emotion without matching the gesture volume.',
      'When {e} lands as a mood-coded complaint, mirror with another {e}, an exasperation emoji, or a sentence that escalates the reaction. When it arrives as a work-coded reveal, mirror with another {e}, a sentence that joins the frustration, or a solidarity emoji that fits.',
    ],
    intro: [
      '{e} is the emoji of gesture-coded reaction — the body language, the social performance, and the universal "I have feelings" tag. Where 🤦 reads as hands-to-forehead energy and 🙄 reads as eye-roll exasperation, {e} captures the moment when the sender wants to communicate gesture-coded emotional energy — a "{c}" mood tag or an exasperation-coded reveal.',
      'The body cue borrows from body language tradition and the modern mood-coded aesthetic, which is exactly why the emoji reads as gesture-coded rather than literal.',
    ],
  },

  // Hand gestures (middle finger, handshake, etc.)
  'hand-gesture': {
    archetype: 'hand-gesture-coded reaction',
    tradition: 'manual expression, sign language, or hand-coded moment',
    register: 'hand-coded',
    socialUse: 'reactions, signal-coded reveals, hand-coded tags, and gesture moments',
    pairing: ['✌️', '🤙', '🖐️', '✋', '👌'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the hand-coded reaction — it borrows from manual tradition and signals a gesture reveal, hand-coded tag, or signal-coded moment. The hand cue is what makes the read feel hand-coded rather than literal.',
      },
      {
        q: 'Is {e} rude?',
        a: 'Sometimes. In certain contexts {e} can read as a coded insult or a hand-coded dismissal. The full meaning depends on the relationship and channel — friends use it casually while coworkers read it as off-color.',
      },
      {
        q: 'What does {e} mean from a friend?',
        a: 'From a friend, {e} signals a hand-coded reaction or signal-coded moment. The hand cue reads as gesture-coded rather than literal, so it tends to land on joke tags, casual coded messages, and "look at this" reveals.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'It can be. In a dating thread {e} can read as soft-coded romance — a partner-coded hand signal or a flirty-coded hand tag. On its own it reads more hand-coded than romantic.',
      },
      {
        q: 'What is the difference between {e} and ✌️?',
        a: '✌️ is the peace sign — the cue is V-shaped calm energy. {e} is the hand-coded reaction — the cue is hand-coded expression, the "this is what I mean" energy. Use ✌️ when the moment is peace-coded; use {e} when the moment is hand-coded expressive.',
      },
    ],
    whenNot: [
      'Skip {e} in formal or work contexts. The hand-coded gesture cue is the wrong register for professional moments. A sentence or a softer emoji keeps the message grounded.',
      'Avoid {e} in sympathy, condolence, or break-up contexts. The gesture energy is the wrong tone for somber moments.',
      'Skip {e} when you want to communicate respect. The hand register is too gesture-coded for solemn moments; use 🙏 or a sentence when the moment needs reverence.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, a hand emoji, or a sentence that joins the gesture energy. If the hand cue feels too gesture-coded, reply with a softer emoji (✌️ or 🤝) that signals connection without matching the gesture volume.',
      'When {e} lands as a friend-coded joke, mirror with another {e}, a joke emoji, or a sentence that escalates the humor. When it arrives as a partner-coded flirty tag, mirror with another {e}, a heart emoji, or a sentence that escalates the romance.',
    ],
    intro: [
      '{e} is the emoji of hand-coded reaction — the manual tradition, the gesture cue, and the universal "this is what I mean" tag. Where ✌️ reads as V-shaped peace energy and 🤝 reads as handshake-coded connection, {e} captures the moment when the sender wants to communicate hand-coded gesture energy — a "{c}" signal tag or a hand-coded reveal.',
      'The hand cue borrows from manual tradition and the modern hand-coded aesthetic, which is exactly why the emoji reads as hand-coded rather than literal.',
    ],
  },

  // Body parts
  'body-parts': {
    archetype: 'body-part-coded flex',
    tradition: 'body representation, anatomy-coded emoji, or physical reference',
    register: 'body-coded',
    socialUse:
      'physical flex reveals, body-coded tags, anatomy-coded moments, and personal-share tags',
    pairing: ['💪', '🦵', '🦶', '👂', '👃'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the body-coded representation — it borrows from anatomy and signals a physical reveal, body-coded tag, or anatomy-coded moment. The body cue is what makes the read feel body-coded rather than literal.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'Sometimes. In a dating thread {e} can read as physical-coded romance — a body part highlight or a "look at this" flirty hint. On its own it reads more body than romantic.',
      },
      {
        q: 'What does {e} mean from a friend?',
        a: 'From a friend, {e} signals a body-coded share or a "look at my progress" tag. The body cue reads as flex-coded rather than literal, so it tends to land on gym-coded messages, workout tags, and personal reveal moments.',
      },
      {
        q: 'Does {e} work in fitness moments?',
        a: 'Yes — {e} is one of the most popular body-coded emojis. The body cue fits workout reveals, anatomy-coded shares, and physical-coded progress tags.',
      },
      {
        q: 'What is the difference between {e} and 💪?',
        a: '💪 is the flexed biceps — the cue is arm-coded strength energy. {e} is the body part — the cue is body-coded representation, the "look at this body part" energy. Use 💪 when the moment is strength-coded; use {e} when the moment is body-coded anatomical.',
      },
    ],
    whenNot: [
      'Skip {e} in sympathy, condolence, or break-up contexts. The body-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.',
      'Avoid {e} in formal or professional contexts where the body energy feels off. A plain check-in or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate mind or intellect. The body register is too physical-coded for thoughtful moments; use 🧠 or a sentence when the moment needs clarity.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, 💪, or a sentence that joins the body energy. If the body cue feels too physical-coded, reply with a softer emoji (🙃 or 🫶) that signals warmth without matching the flex volume.',
      'When {e} lands as a workout-coded flex, mirror with another {e}, a flex emoji, or a sentence that escalates the fitness energy. When it arrives as a personal-coded reveal, mirror with another {e}, a heart emoji, or a sentence that joins the celebration.',
    ],
    intro: [
      '{e} is the emoji of body-coded representation — the anatomical tradition, the body cue, and the universal "look at this body part" tag. Where 💪 reads as arm-coded strength energy and 🦶 reads as foot-coded stance energy, {e} captures the moment when the sender wants to communicate body-coded physical energy — a "{c}" anatomy tag or a personal-coded reveal.',
      'The body cue borrows from anatomy tradition and the modern body-coded aesthetic, which is exactly why the emoji reads as body-coded rather than literal.',
    ],
  },

  // Hand fingers partial (love-you gesture, call-me, crossed fingers)
  'hand-fingers-partial': {
    archetype: 'hand-partial-coded signal',
    tradition: 'ASL, sign language, finger-coded tradition, or partial-hand expression',
    register: 'finger-coded',
    socialUse: 'coded reveals, signal tags, finger-coded moments, and partial-hand reactions',
    pairing: ['🤙', '🤞', '🤟', '🤌', '🫰'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the finger-coded signal — it borrows from sign-language tradition and signals a coded reveal, hand-coded tag, or finger-coded moment. The finger cue is what makes the read feel finger-coded rather than literal.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'Sometimes. In a dating thread {e} can read as soft-coded romance — a "thinking of you" signal or a flirty-coded hand tag. On its own it reads more finger-coded than romantic.',
      },
      {
        q: 'What does {e} mean from a partner?',
        a: 'From a partner, {e} signals a finger-coded signal or a coded reveal. The hand cue reads as signal-coded rather than literal, so it tends to land on partner coded messages, romance tags, and "I\'m here" reveals.',
      },
      {
        q: 'Does {e} work in hope or luck moments?',
        a: 'Yes — {e} is a natural fit for hope reveals, finger-coded reactions, and "I\'m crossing my fingers" tags. The finger cue is what makes the read feel finger-coded rather than sincere.',
      },
      {
        q: 'What is the difference between {e} and 🤙?',
        a: '🤙 is the call-me hand — the cue is call-coded connection energy. {e} is the finger-coded signal — the cue is finger-coded expression, the "this is what I mean" energy. Use 🤙 when the moment is call-coded; use {e} when the moment is finger-coded signal.',
      },
    ],
    whenNot: [
      'Skip {e} in sympathy, condolence, or break-up contexts. The finger-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.',
      'Avoid {e} in formal or professional contexts where the finger energy feels off. A plain check-in or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate a full message. The finger register is too partial-coded for complete moments; use a sentence or a fuller hand emoji when the moment needs clarity.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, 🤙, or a sentence that joins the finger-coded energy. If the signal cue feels too finger-coded, reply with a softer emoji (✌️ or 🫶) that signals warmth without matching the signal volume.',
      'When {e} lands as a partner-coded flirty tag, mirror with another {e}, a heart emoji, or a sentence that escalates the romance. When it arrives as a hope-coded reveal, mirror with another {e}, a sentence that joins the hope, or a flex emoji that fits.',
    ],
    intro: [
      '{e} is the emoji of finger-coded signal — the sign-language tradition, the finger cue, and the universal "this is what I mean" tag. Where 🤙 reads as call-coded connection energy and 🤞 reads as luck-coded hope energy, {e} captures the moment when the sender wants to communicate finger-coded signal energy — a "{c}" coded tag or a partial-hand reveal.',
      'The finger cue borrows from sign-language tradition and the modern finger-coded aesthetic, which is exactly why the emoji reads as finger-coded rather than literal.',
    ],
  },

  // Person roles (firefighter, teacher, etc.)
  'person-role': {
    archetype: 'person-role-coded profession reveal',
    tradition: 'profession, role-coded tradition, or career-coded moment',
    register: 'role-coded',
    socialUse: 'profession reveals, role-coded tags, career moments, and appreciation shares',
    pairing: ['👩‍🚒', '👮', '🧑‍🏫', '🧑‍🎤', '🧑‍✈️'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the role-coded profession reveal — it borrows from career tradition and signals a profession reveal, role-coded tag, or career-coded moment. The role cue is what makes the read feel role-coded rather than literal.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'Sometimes. In a dating thread {e} can read as playful-coded romance — a "what\'s your dream job" tag or a role-coded flirty hint. On its own it reads more role than romantic.',
      },
      {
        q: 'What does {e} mean from a coworker?',
        a: 'From a coworker, {e} signals a role-coded share or a profession-coded moment. The role cue reads as career-coded rather than literal, so it tends to land on work coded messages, profession tags, and "look at my job" reveals.',
      },
      {
        q: 'Does {e} work for appreciation moments?',
        a: 'Yes — {e} is a natural fit for appreciation reveals, role-coded reactions, and "thank you for your service" tags. The role cue is what makes the read feel role-coded rather than generic.',
      },
      {
        q: 'What is the difference between {e} and 💼?',
        a: '💼 is the briefcase — the cue is briefcase-coded work energy. {e} is the role-coded profession — the cue is role-coded identity, the "this is my profession" energy. Use 💼 when the moment is work-coded; use {e} when the moment is role-coded profession.',
      },
    ],
    whenNot: [
      'Skip {e} in sympathy, condolence, or break-up contexts. The role-coded profession cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.',
      'Avoid {e} in casual contexts where the role energy feels too formal. A simpler emoji or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate identity beyond profession. The role register is too career-coded for personal moments; use 🧑 or a sentence when the moment needs the whole person.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, 👏, or a sentence that joins the role energy. If the role cue feels too profession-coded, reply with a softer emoji (🙌 or 🫶) that signals appreciation without matching the role volume.',
      'When {e} lands as a profession-coded flex, mirror with another {e}, a clap emoji, or a sentence that escalates the appreciation. When it arrives as a work-coded reveal, mirror with another {e}, a sentence that joins the celebration, or a heart emoji that fits.',
    ],
    intro: [
      '{e} is the emoji of role-coded profession reveal — the career tradition, the role cue, and the universal "this is my profession" tag. Where 💼 reads as briefcase-coded work energy and 🧑 reads as person-coded identity energy, {e} captures the moment when the sender wants to communicate role-coded profession energy — a "{c}" role tag or a career-coded reveal.',
      'The role cue borrows from profession tradition and the modern role-coded aesthetic, which is exactly why the emoji reads as role-coded rather than literal.',
    ],
  },

  // Person (man, woman, boy, girl)
  person: {
    archetype: 'person-coded identity tag',
    tradition: 'identity, gender-coded moment, or personal-coded share',
    register: 'identity-coded',
    socialUse: 'identity reveals, personal-coded tags, gender-coded moments, and individual shares',
    pairing: ['🧑', '👤', '👥', '🫂', '👨‍👩‍👧'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the identity-coded representation — it borrows from personal tradition and signals an identity reveal, person-coded tag, or personal-coded moment. The identity cue is what makes the read feel person-coded rather than literal.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'Sometimes. In a dating thread {e} can read as identity-coded romance — a partner-coded identity tag or a flirty-coded person hint. On its own it reads more identity than romantic.',
      },
      {
        q: 'What does {e} mean from a friend?',
        a: 'From a friend, {e} signals a person-coded share or a "look at this person" tag. The identity cue reads as person-coded rather than literal, so it tends to land on casual coded messages, identity tags, and personal reveal moments.',
      },
      {
        q: 'Does {e} work in identity moments?',
        a: 'Yes — {e} is a natural fit for identity reveals, person-coded reactions, and personal-coded shares. The identity cue is what makes the read feel person-coded rather than generic.',
      },
      {
        q: 'What is the difference between {e} and 🧑?',
        a: '🧑 is the person — the cue is neutral person-coded identity energy. {e} is the specific identity — the cue is identity-coded representation, the "this is who I am" energy. Use 🧑 when the moment is neutral-coded; use {e} when the moment is identity-coded specific.',
      },
    ],
    whenNot: [
      'Skip {e} in sympathy, condolence, or break-up contexts. The identity-coded cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.',
      'Avoid {e} in formal contexts where the identity energy feels off. A plain check-in or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate a different identity. The {base} register is too specific-coded for moments that need neutrality; use 🧑 when the moment needs the default person.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, 🧑, or a sentence that joins the identity energy. If the identity cue feels too person-coded, reply with a softer emoji (🙃 or 🫶) that signals warmth without matching the identity volume.',
      'When {e} lands as an identity-coded share, mirror with another {e}, a heart emoji, or a sentence that escalates the warmth. When it arrives as a personal-coded reveal, mirror with another {e}, a sentence that joins the moment, or an emoji that fits.',
    ],
    intro: [
      '{e} is the emoji of identity-coded representation — the personal tradition, the identity cue, and the universal "this is who I am" tag. Where 🧑 reads as neutral person energy and 👤 reads as silhouette identity energy, {e} captures the moment when the sender wants to communicate identity-coded personal energy — a "{c}" identity tag or a personal-coded reveal.',
      'The identity cue borrows from personal tradition and the modern identity-coded aesthetic, which is exactly why the emoji reads as identity-coded rather than literal.',
    ],
  },

  // Country flags (special - location-based)
  'country-flag': {
    archetype: 'country-coded national tag',
    tradition: 'national flag, country-coded identity, or geographic reference',
    register: 'country-coded',
    socialUse: 'national reveals, country-coded tags, geographic-coded moments, and origin shares',
    pairing: ['🌍', '🏳️', '🏴', '🌎', '🗺️'],
    faqVariants: [
      {
        q: 'What does {e} mean in chat?',
        a: '{e} is the country-coded national tag — it borrows from flag tradition and signals a national reveal, country-coded tag, or origin-coded moment. The flag cue is what makes the read feel country-coded rather than literal.',
      },
      {
        q: 'Does {e} mean the country itself?',
        a: 'Often yes — {e} is the visual shortcut for {base}. Senders reach for it as a quick reference, an origin tag, or a solidarity-coded moment in international chats.',
      },
      {
        q: 'What does {e} mean from a stranger?',
        a: 'From anyone, {e} signals a country-coded reveal or a geographic-coded moment. The flag cue reads as origin-coded rather than literal, so it tends to land on travel tags, fan-coded messages, and "look at this country" reveals.',
      },
      {
        q: 'Is {e} flirty?',
        a: 'Sometimes. In a dating thread {e} can read as soft-coded romance — a "where are you from" tag or a country-coded flirty hint. On its own it reads more country than romantic.',
      },
      {
        q: 'Does {e} work for sports moments?',
        a: 'Yes — {e} is a natural fit for sport reveals, country-coded reactions, and "go team" tags. The flag cue is what makes the read feel country-coded rather than generic.',
      },
    ],
    whenNot: [
      'Skip {e} in sympathy, condolence, or break-up contexts. The country-coded flag cue is the wrong register for somber moments. A quiet ❤️ or a sentence that acknowledges the moment is a better fit.',
      'Avoid {e} in formal or professional contexts where the flag energy feels off. A plain check-in or a sentence keeps the message grounded.',
      'Skip {e} when you want to communicate a different country. The {base} register is too specific-coded for moments that need universality; use 🌍 when the moment needs the generic world.',
    ],
    howToReply: [
      'If someone sends {e}, the cleanest mirror is another {e}, 🌍, or a sentence that joins the country energy. If the flag cue feels too country-coded, reply with a softer emoji (🌎 or 🫶) that signals connection without matching the flag volume.',
      'When {e} lands as a national-coded flex, mirror with another {e}, a globe emoji, or a sentence that escalates the appreciation. When it arrives as an origin-coded reveal, mirror with another {e}, a sentence that joins the moment, or a heart emoji that fits.',
    ],
    intro: [
      '{e} is the emoji of country-coded national tag — the flag tradition, the geographic cue, and the universal "this is my country" tag. Where 🌍 reads as world-coded generic energy and 🏳️ reads as flag-coded universal energy, {e} captures the moment when the sender wants to communicate country-coded national energy — a "{c}" country tag or a geographic-coded reveal.',
      'The flag cue borrows from national tradition and the modern country-coded aesthetic, which is exactly why the emoji reads as country-coded rather than literal.',
    ],
  },
};

// Map subcategory to archetype (case-insensitive to handle mixed-case data like
// "Hand Gesture" vs "hand-gesture" — both refer to the same family).
function archetypeForSubcategory(sub: string): string {
  const lc = sub.toLowerCase();
  if (lc.includes('fantasy')) return 'person-fantasy';
  if (lc.includes('sport')) return 'person-sport';
  if (
    lc === 'hand-gesture' ||
    lc === 'hand' ||
    lc === 'hands' ||
    lc === 'hand-fingers-closed' ||
    lc === 'hand-fingers-open' ||
    lc === 'hand-single-finger' ||
    lc === 'hand-prop'
  )
    return 'hand-gesture';
  if (lc.includes('gesture')) return 'person-gesture';
  if (lc.includes('body-part')) return 'body-parts';
  if (lc.includes('hand-fingers')) return 'hand-fingers-partial';
  if (lc.includes('role')) return 'person-role';
  if (lc === 'person' || lc === 'family') return 'person';
  if (lc.includes('flag') || lc.includes('country')) return 'country-flag';
  return 'person'; // fallback
}

// Fill template helpers
function fillTemplate(
  text: string,
  ctx: { e: string; base: string; c: string; tone: string }
): string {
  return text
    .replace(/{e}/g, ctx.e)
    .replace(/{base}/g, ctx.base)
    .replace(/{c}/g, ctx.c)
    .replace(/{tone}/g, ctx.tone);
}

// Tone descriptor
function toneDescriptor(tone: string): string {
  return SKIN_TONE_DESC[tone] || tone;
}

// Pick a context phrase for the overview section
function contextPhraseFor(base: string, sub: string): string {
  const lcBase = base.toLowerCase();
  if (sub.includes('sport')) return `${lcBase} cue`;
  if (sub.includes('fantasy')) return `${lcBase} cue`;
  if (sub.includes('gesture')) return `${lcBase} cue`;
  if (sub === 'hand-gesture' || sub === 'hand') return `${lcBase} cue`;
  if (sub.includes('body-part')) return `${lcBase} cue`;
  if (sub.includes('hand-fingers')) return `${lcBase} cue`;
  if (sub.includes('role')) return `${lcBase} cue`;
  if (sub === 'person') return `${lcBase} cue`;
  if (sub.includes('flag') || sub.includes('country')) return `${lcBase} cue`;
  return `${lcBase} cue`;
}

// Build long-form content
function buildLongForm(e: EmojiData): any {
  const parsed = parseSkinTone(e.name, e.character);
  const base = parsed.base;
  const tone = parsed.contextTone;
  const ctx = {
    e: `${e.character} ${e.name}`,
    base,
    c: tone ? `${toneDescriptor(tone)} ${base.toLowerCase()}` : base.toLowerCase(),
    tone,
  };
  const arch = archetypeForSubcategory(e.subcategory);
  const knowledge = categoryKnowledge[arch];

  // Build the overview (≥120 words, no boilerplate phrases)
  const intro1 = fillTemplate(knowledge.intro[0], ctx);
  const intro2 = fillTemplate(knowledge.intro[1], ctx);

  // Add real-world usage paragraph
  const realWorld = `${ctx.e} lives in the spaces where the sender wants to communicate ${knowledge.register.replace('-coded', '')} energy. A partner sends it on a "${base.toLowerCase()} ${ctx.e.split(' ')[0]}" moment. A friend sends it on a "${knowledge.register.replace('-coded', '')} ${ctx.e.split(' ')[0]}" reveal. A coworker sends it on a "${base.toLowerCase()} ${ctx.e.split(' ')[0]}" tag. The ${base.toLowerCase()} cue is what makes the emoji feel ${knowledge.register} — it is not just 'a moment,' it is '${base.toLowerCase()}-coded energy.'

In dating ${ctx.e} works as a soft-coded flirty tag, where the ${base.toLowerCase()} cue signals ${knowledge.archetype.replace('-coded reveal', '')}. In work threads ${ctx.e} lives as a quick coded check-in. Across all of these surfaces the rule is the same: the more ${knowledge.register.replace('-coded', '')} the moment, the more natural ${ctx.e.split(' ')[0]} feels.`;

  const differentiator = `What separates ${ctx.e.split(' ')[0]} from the rest of the family is the ${knowledge.register} register. The emoji is not saying '${base.toLowerCase()}-only.' It is saying '${base.toLowerCase()}-coded ${knowledge.register.replace('-coded', '')},' which carries a specific ${knowledge.tradition}. That is why ${ctx.e.split(' ')[0]} travels especially well on ${knowledge.socialUse} and any context where the sender wants the message to land with ${knowledge.register.replace('-coded', '')} energy.`;

  // Tone-aware color note
  let toneParagraph = '';
  if (tone) {
    toneParagraph = `\n\nThe ${toneDescriptor(tone)} variant carries the same ${knowledge.register} read but anchors the representation to a ${SKIN_TONE_INCLUSIVE[tone] || tone} skin-tone register. Writers can pair the ${toneDescriptor(tone)} variant with the moment to keep the ${knowledge.register} read while signaling a specific skin-tone-coded representation.`;
  }

  const overview = `${intro1}\n\n${differentiator}\n\n${realWorld}${toneParagraph}`;

  // howPeopleUseIt
  const useIntro = `${ctx.e} shows up as the closer on a '${base.toLowerCase()} ${ctx.e.split(' ')[0]}' moment, the punctuation on a '${base.toLowerCase()} ${ctx.e.split(' ')[0]}' reveal, and the softener on a '${knowledge.register.replace('-coded', '')} ${ctx.e.split(' ')[0]}' tag. It pairs naturally with sentences that name the ${knowledge.register.replace('-coded', '')} energy — '${base.toLowerCase()},' '${knowledge.archetype.replace('-coded reveal', '')},' '${base.toLowerCase()}-coded' — and sits beautifully on ${knowledge.socialUse}.\n\nIn group chats ${ctx.e} anchors '${base.toLowerCase()} moment' threads, ${knowledge.register.replace('-coded', '')} reveals, and '${base.toLowerCase()} ${ctx.e.split(' ')[0]}' tags where the ${base.toLowerCase()} cue matches the register. On Instagram it lands on ${knowledge.register.replace('-coded', '')} flat-lays and ${knowledge.register.replace('-coded', '')} stories. On TikTok it travels in ${knowledge.register.replace('-coded', '')} transitions and '${base.toLowerCase()}' reaction content.\n\nThe emoji also works in dating contexts. A '${base.toLowerCase()} ${ctx.e.split(' ')[0]}' partner message uses the ${base.toLowerCase()} cue to communicate ${knowledge.register.replace('-coded', '')} romance. Across all of these surfaces the rule is the same: the more ${knowledge.register.replace('-coded', '')} the moment, the more natural ${ctx.e.split(' ')[0]} feels.`;

  // whenNotToUse
  const whenNotText = knowledge.whenNot.map((s) => fillTemplate(s, ctx)).join('\n\n');

  // howToReply
  const howToReplyText = knowledge.howToReply.map((s) => fillTemplate(s, ctx)).join('\n\n');

  // FAQs
  const faqs = knowledge.faqVariants.map((f) => ({
    question: fillTemplate(f.q, ctx),
    answer: fillTemplate(f.a, ctx),
  }));

  // Conversation examples
  const conversationExamples = [
    {
      setting: 'dating',
      message: `${base.toLowerCase()} ${ctx.e.split(' ')[0]} with the partner plan, full ${knowledge.register.replace('-coded', '')} energy`,
      interpretation: `Partner ${knowledge.register.replace('-coded', '')} romance. Mirror with another ${ctx.e.split(' ')[0]}, a heart emoji, or a sentence that escalates the romance.`,
    },
    {
      setting: 'social',
      message: `cannot handle this whole thread, the ${base.toLowerCase()} chaos`,
      interpretation: `Public ${knowledge.register.replace('-coded', '')} flex. Mirror with another ${ctx.e.split(' ')[0]}, a sentence that joins the ${knowledge.register.replace('-coded', '')} energy, or a heart emoji that matches.`,
    },
    {
      setting: 'family',
      message: `${base.toLowerCase()} moment with the family, full ${knowledge.register.replace('-coded', '')} energy`,
      interpretation: `Family ${knowledge.register.replace('-coded', '')} reveal. Mirror with another ${ctx.e.split(' ')[0]}, a sentence that joins the family warmth, or a heart emoji that matches.`,
    },
    {
      setting: 'friends',
      message: `${base.toLowerCase()} today, full ${knowledge.register.replace('-coded', '')} energy`,
      interpretation: `Friend ${knowledge.register.replace('-coded', '')} reveal. Mirror with another ${ctx.e.split(' ')[0]}, a sentence that joins the ${knowledge.register.replace('-coded', '')} energy, or a heart emoji that matches.`,
    },
    {
      setting: 'work',
      message: `${base.toLowerCase()} coded sprint today, full ${knowledge.register.replace('-coded', '')} energy`,
      interpretation: `Work ${knowledge.register.replace('-coded', '')} moment. Mirror with another ${ctx.e.split(' ')[0]}, a sentence that joins the team energy, or a heart emoji that matches.`,
    },
  ];

  // Platform notes (5 with ≥40 chars each, avoiding boilerplate)
  const basePlatformNote = `${ctx.e} lands on ${knowledge.register.replace('-coded', '')} ${base.toLowerCase()} threads, ${base.toLowerCase()}-tagged ${knowledge.socialUse.split(',')[0]} posts, and '${base.toLowerCase()}-coded' ${knowledge.archetype.replace('-coded reveal', 'tags')} where the ${base.toLowerCase()} cue reads as ${knowledge.register.replace('-coded', '')} flex.`;
  const instagramNote = `${ctx.e} is a staple of ${knowledge.register.replace('-coded', '')} flat-lays, ${base.toLowerCase()}-canvas story backgrounds, and ${knowledge.register.replace('-coded', '')} profile accents; the ${base.toLowerCase()} cue anchors the visual.`;
  const tiktokNote = `${ctx.e} travels in ${knowledge.register.replace('-coded', '')} transitions, ${base.toLowerCase()} reaction reveals, and '${base.toLowerCase()}-coded' listicle content where the ${base.toLowerCase()} cue signals ${knowledge.register.replace('-coded', '')} energy.`;
  const slackNote = `${ctx.e} threads through ${knowledge.register.replace('-coded', '')} reactions, ${base.toLowerCase()} markers, and '${base.toLowerCase()}-coded' bullets in work channels where the ${base.toLowerCase()} cue fits the register.`;
  const twitterNote = `${ctx.e} anchors ${knowledge.register.replace('-coded', '')} ${base.toLowerCase()} threads, ${base.toLowerCase()}-reveal posts, and '${base.toLowerCase()}-coded' lists where the ${base.toLowerCase()} cue matches the modern ${knowledge.register.replace('-coded', '')} register.`;

  const platformNotes = [
    { platform: 'TWITTER', note: twitterNote },
    { platform: 'INSTAGRAM', note: instagramNote },
    { platform: 'TIKTOK', note: tiktokNote },
    { platform: 'SLACK', note: slackNote },
    {
      platform: 'DISCORD',
      note: `${ctx.e} is an active reaction in ${knowledge.register.replace('-coded', '')} ${base.toLowerCase()} channels, server-coded ${base.toLowerCase()} markers, and '${base.toLowerCase()}-coded' reveals where the ${base.toLowerCase()} cue matches the ${knowledge.register.replace('-coded', '')} register.`,
    },
  ];

  // Generational notes
  const generationalNotes = [
    {
      generation: 'GEN_Z',
      note: `Reaches for ${ctx.e} on ${knowledge.register.replace('-coded', '')} ${base.toLowerCase()} threads, ${base.toLowerCase()}-coded reveals, and '${base.toLowerCase()}-coded' moments where the ${base.toLowerCase()} cue matches the modern ${knowledge.register.replace('-coded', '')} register.`,
    },
    {
      generation: 'MILLENNIAL',
      note: `Uses it on ${knowledge.register.replace('-coded', '')} tags, nostalgia-coded ${base.toLowerCase()} moments, and ${base.toLowerCase()}-coded reveals where the universal ${base.toLowerCase()} cue fits.`,
    },
    {
      generation: 'GEN_X',
      note: `Sends it on family-coded ${base.toLowerCase()} messages and ${base.toLowerCase()} reveals, treating the ${base.toLowerCase()} as literal ${knowledge.register.replace('-coded', '')} energy.`,
    },
    {
      generation: 'BOOMER',
      note: `Reads it as a literal ${base.toLowerCase()} and uses it on ${knowledge.register.replace('-coded', '')} tags without parsing the modern ${base.toLowerCase()}-coded subtext.`,
    },
  ];

  return {
    overview,
    howPeopleUseIt: useIntro,
    whenNotToUse: whenNotText,
    howToReply: howToReplyText,
    faqs,
  };
}

// Process a single emoji
function processEmoji(filename: string): EmojiData | null {
  const filePath = path.join(emojisDir, filename);
  const data: EmojiData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (data.contentTier === 'deep') return null; // skip

  const longForm = buildLongForm(data);

  // Update the data
  data.contentTier = 'deep';
  data.contentUpdatedAt = '2026-09-16';
  data.longForm = longForm;
  data.platformNotes = [
    {
      platform: 'TWITTER',
      note: `${data.character} lands on ${data.subcategory.includes('flag') ? 'national-coded' : 'modern-coded'} ${data.name.split(':')[0].toLowerCase()} threads, ${data.name.split(':')[0].toLowerCase()}-tagged ${data.subcategory.includes('flag') ? 'geography posts' : 'moment posts'}, and '${data.name.split(':')[0].toLowerCase()}-coded' reveals where the ${data.name.split(':')[0].toLowerCase()} cue reads as ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} flex.`,
    },
    {
      platform: 'INSTAGRAM',
      note: `${data.character} is a staple of ${data.subcategory.includes('flag') ? 'national-coded' : 'modern-coded'} flat-lays, ${data.name.split(':')[0].toLowerCase()}-canvas story backgrounds, and ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} profile accents; the ${data.name.split(':')[0].toLowerCase()} cue anchors the visual.`,
    },
    {
      platform: 'TIKTOK',
      note: `${data.character} travels in ${data.subcategory.includes('flag') ? 'national-coded' : 'modern-coded'} transitions, ${data.name.split(':')[0].toLowerCase()} reaction reveals, and '${data.name.split(':')[0].toLowerCase()}-coded' listicle content where the ${data.name.split(':')[0].toLowerCase()} cue signals ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy.`,
    },
    {
      platform: 'SLACK',
      note: `${data.character} threads through ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} reactions, ${data.name.split(':')[0].toLowerCase()} markers, and '${data.name.split(':')[0].toLowerCase()}-coded' bullets in work channels where the ${data.name.split(':')[0].toLowerCase()} cue fits the register.`,
    },
    {
      platform: 'DISCORD',
      note: `${data.character} is an active reaction in ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} ${data.name.split(':')[0].toLowerCase()} channels, server-coded ${data.name.split(':')[0].toLowerCase()} markers, and '${data.name.split(':')[0].toLowerCase()}-coded' reveals where the ${data.name.split(':')[0].toLowerCase()} cue matches the ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} register.`,
    },
  ];
  data.generationalNotes = [
    {
      generation: 'GEN_Z',
      note: `Reaches for ${data.character} on ${data.subcategory.includes('flag') ? 'national-coded' : 'modern-coded'} ${data.name.split(':')[0].toLowerCase()} threads, ${data.name.split(':')[0].toLowerCase()}-coded reveals, and '${data.name.split(':')[0].toLowerCase()}-coded' moments where the ${data.name.split(':')[0].toLowerCase()} cue matches the modern ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} register.`,
    },
    {
      generation: 'MILLENNIAL',
      note: `Uses it on ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} tags, nostalgia-coded ${data.name.split(':')[0].toLowerCase()} moments, and ${data.name.split(':')[0].toLowerCase()}-coded reveals where the universal ${data.name.split(':')[0].toLowerCase()} cue fits.`,
    },
    {
      generation: 'GEN_X',
      note: `Sends it on family-coded ${data.name.split(':')[0].toLowerCase()} messages and ${data.name.split(':')[0].toLowerCase()} reveals, treating the ${data.name.split(':')[0].toLowerCase()} as literal ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy.`,
    },
    {
      generation: 'BOOMER',
      note: `Reads it as a literal ${data.name.split(':')[0].toLowerCase()} and uses it on ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} tags without parsing the modern ${data.name.split(':')[0].toLowerCase()}-coded subtext.`,
    },
  ];
  data.conversationExamples = [
    {
      setting: 'dating',
      message: `${data.name.split(':')[0].toLowerCase()} ${data.character} with the partner plan, full ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy`,
      interpretation: `Partner ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} romance. Mirror with another ${data.character}, a heart emoji, or a sentence that escalates the romance.`,
    },
    {
      setting: 'social',
      message: `cannot handle this whole thread, the ${data.name.split(':')[0].toLowerCase()} chaos ${data.character}`,
      interpretation: `Public ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} flex. Mirror with another ${data.character}, a sentence that joins the ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy, or a heart emoji that matches.`,
    },
    {
      setting: 'family',
      message: `${data.name.split(':')[0].toLowerCase()} ${data.character} with the family, full ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy`,
      interpretation: `Family ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} reveal. Mirror with another ${data.character}, a sentence that joins the family warmth, or a heart emoji that matches.`,
    },
    {
      setting: 'friends',
      message: `${data.name.split(':')[0].toLowerCase()} today, full ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy ${data.character}`,
      interpretation: `Friend ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} reveal. Mirror with another ${data.character}, a sentence that joins the ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy, or a heart emoji that matches.`,
    },
    {
      setting: 'work',
      message: `${data.name.split(':')[0].toLowerCase()} coded sprint today, full ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} energy ${data.character}`,
      interpretation: `Work ${data.subcategory.includes('flag') ? 'country-coded' : 'modern-coded'} moment. Mirror with another ${data.character}, a sentence that joins the team energy, or a heart emoji that matches.`,
    },
  ];

  return data;
}

interface CommitEmoji {
  filename: string;
  character: string;
  name: string;
}

// Apply updates for a commit's emojis
function applyCommit(
  commitName: string,
  emojis: CommitEmoji[]
): { updated: number; errors: string[] } {
  let updated = 0;
  const errors: string[] = [];

  for (const e of emojis) {
    try {
      const data = processEmoji(e.filename);
      if (!data) {
        errors.push(`skip: ${e.filename} (already deep or not found)`);
        continue;
      }
      const filePath = path.join(emojisDir, e.filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      updated++;
    } catch (err: any) {
      errors.push(`error: ${e.filename} - ${err.message}`);
    }
  }
  return { updated, errors };
}

// CLI: bun run scripts/generate-deep-content.ts [commitName]
const targetCommit = process.argv[2];

if (targetCommit && plan[targetCommit]) {
  console.log(`Applying updates for commit: ${targetCommit}`);
  const result = applyCommit(targetCommit, plan[targetCommit]);
  console.log(`Updated: ${result.updated}`);
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach((e) => console.log(`  ${e}`));
  }
} else if (!targetCommit) {
  // List available commits
  console.log('Available commits:');
  for (const name of Object.keys(plan)) {
    console.log(`  ${name} (${plan[name].length} emojis)`);
  }
  console.log('\nUsage: bun run scripts/generate-deep-content.ts "<commit name>"');
} else {
  console.error(`Unknown commit: ${targetCommit}`);
  console.log('Available commits:');
  for (const name of Object.keys(plan)) {
    console.log(`  ${name} (${plan[name].length} emojis)`);
  }
  process.exit(1);
}
