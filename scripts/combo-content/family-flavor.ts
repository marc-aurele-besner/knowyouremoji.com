/**
 * One-paragraph family-specific flavor text per emoji family.
 * Each paragraph slots into the overview, after the variant opener,
 * to anchor the combo in its emoji family's natural habitat.
 */

import type { Family } from '../plan-batch-23-32';

type FlavorEntry = {
  /** Sentence opener — what this combo does inside its family. */
  habitat: string;
  /** Second-sentence development. */
  contrast: string;
  /** Third-sentence real-world channel note. */
  channel: string;
};

export const FAMILY_FLAVOR: Record<Family, FlavorEntry> = {
  'hearts-love': {
    habitat:
      'combos in the Hearts & Love family live in the warm space between affection, flirtation, and tenderness — every pairing here reads as a feeling the sender wants the recipient to feel too.',
    contrast:
      'where a single ❤️ is a default, the combos in this family are the moves that pick a shade of love — soft, fierce, hopeful, healing, or playfully flirty.',
    channel:
      'on iMessage, Instagram DMs, and Valentine-coded posts the family carries the most weight, and on TikTok the right pairing turns a one-line caption into a relationship mood board.',
  },
  'smileys-emotion': {
    habitat:
      'combos in the Smileys & Emotion family are the most-used expressiveness layer of the keyboard — they turn a face emoji into a scene, a moment, or a whole mood.',
    contrast:
      'where a single face emoji reads as one feeling, the combos here stack two feelings together to capture the messy, contradictory way people actually experience an emotion.',
    channel:
      'on Twitter, TikTok, iMessage, and Discord the family does the heavy lifting for reactions that plain text cannot land — disbelief plus laughter, melting plus fire, terror plus tears.',
  },
  'hands-body': {
    habitat:
      'combos in the Hands & Body family are body-language shortcuts — they turn reactions into gestures the recipient can see even without seeing their face.',
    contrast:
      'where a single hand emoji reads as a polite signal, the combos in this family pair gesture with punctuation to upgrade a reaction, mock a reaction, or seal a reaction.',
    channel:
      'on Slack and Discord they punctuate quiet threads with agree/disagree signals, on iMessage they close friend-coded messages with shared energy, and on Twitter they double as comic punctuation.',
  },
  animals: {
    habitat:
      'combos in the Animals & Creatures family borrow the pet, wild, or mythical creature as a stand-in for a human mood — soft, silly, savage, or awe-struck.',
    contrast:
      'where a single animal emoji reads as a creature, the combos in this family pair it with an emotion or scene emoji to make the animal the protagonist of a vibe.',
    channel:
      'on TikTok the family is meme-coded, on Instagram captions they tag warm or weird pet moments, and on iMessage they show up when a friend shares a pet video.',
  },
  'food-drink': {
    habitat:
      'combos in the Food & Drink family live where appetite meets atmosphere — coffee at sunrise, pizza with beer, cake on a birthday, mango in summer.',
    contrast:
      'where a single food emoji reads as a snack, the combos in this family pair it with a partner emoji to set a scene: cozy, celebratory, romantic, or just hungry.',
    channel:
      'on Instagram the family anchors food-story posts, on iMessage it punctuates dinner plans, and on TikTok the right pairing fuels recipe-coded content.',
  },
  'travel-places': {
    habitat:
      'combos in the Travel & Places family carry the wanderlust-coded part of emoji — planes, beaches, sunsets, cityscapes, and the journeys between them.',
    contrast:
      'where a single place emoji reads as a destination, the combos in this family pair place with weather, light, or transport to capture arrival, departure, or a moment on the ground.',
    channel:
      'on Instagram the family carries vacation flat-lays, on Twitter the combos punctuate travel-news reactions, and on TikTok the right pairing fuels travel reveal content.',
  },
  'sports-music': {
    habitat:
      'combos in the Sports, Music & Activities family carry the win-coded, beat-coded, and game-coded parts of the keyboard — trophies, trophies, music notes, guitar, dice, controller.',
    contrast:
      'where a single sport or music emoji reads as one event, the combos in this family pair the activity with a reaction emoji to mark a moment of victory, performance, or shared fun.',
    channel:
      'on Twitter the family punctuates game-day threads, on TikTok it fuels music and gaming reveals, and on Instagram it closes posts about achievements or nights out.',
  },
  'weather-nature': {
    habitat:
      'combos in the Weather, Nature & Seasons family borrow the sky, the season, or the element as a tone-setter — sunny, rainy, snowy, fall, storm, calm.',
    contrast:
      'where a single weather emoji reads as a forecast, the combos in this family pair it with a face or symbol to mark a mood that the weather best fits.',
    channel:
      'on iMessage the family opens emotional weather conversations, on Instagram it anchors nature-coded flat-lays, and on Twitter it punctuates national-news reactions.',
  },
  'objects-tech': {
    habitat:
      'combos in the Objects, Tools & Tech family live in the productivity-coded part of emoji — laptop, briefcase, calendar, chart, rocket, gear — where work, launch, and progress get expressed.',
    contrast:
      'where a single object emoji reads as an item, the combos in this family pair it with a partner emoji to mark a moment of work, win, or repeat task.',
    channel:
      'on Slack and Discord they punctuate work threads, on Twitter they punctuate launch announcements, and on LinkedIn-friendly DMs the family carries the most weight.',
  },
  'symbols-effects': {
    habitat:
      'combos in the Symbols, Sparkles & Effects family are pure punctuation — sparkles, fire, hundred-points, exclamation marks, plus the symbols that turn a message from text into a sound.',
    contrast:
      'where a single symbol emoji reads as a stamp, the combos in this family pair it with another symbol or reaction to layer emphasis on emphasis.',
    channel:
      'on Twitter, TikTok, and iMessage the family tags hype-coded replies, on Instagram it punctuates milestone captions, and in casual chat it closes every other joke.',
  },
};

export function familyFlavor(family: Family, rand: () => number): string {
  const f = FAMILY_FLAVOR[family];
  // Order 0/1/2: habitat → channel → contrast, or scramble based on rand
  const order = Math.floor(rand() * 6);
  switch (order) {
    case 0:
      return `${f.habitat} ${f.contrast} ${f.channel}`;
    case 1:
      return `${f.habitat} ${f.channel} ${f.contrast}`;
    case 2:
      return `${f.contrast} ${f.habitat} ${f.channel}`;
    case 3:
      return `${f.contrast} ${f.channel} ${f.habitat}`;
    case 4:
      return `${f.channel} ${f.habitat} ${f.contrast}`;
    default:
      return `${f.channel} ${f.contrast} ${f.habitat}`;
  }
}
