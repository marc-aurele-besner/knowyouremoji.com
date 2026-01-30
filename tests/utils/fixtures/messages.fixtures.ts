/**
 * Message fixtures
 *
 * Curated set of test messages for interpreter testing.
 */

import type { InterpretRequest, Platform, RelationshipContext } from '../../../src/types/emoji';

/**
 * Valid interpret requests with various emojis and contexts
 */
export const VALID_INTERPRET_REQUESTS: InterpretRequest[] = [
  {
    message: 'Hey! How are you doing today? 😊 Hope everything is going well!',
    platform: 'IMESSAGE',
    context: 'FRIEND',
  },
  {
    message: 'Thanks for the update on the project 👍 Let me know if you need anything else.',
    platform: 'SLACK',
    context: 'COWORKER',
  },
  {
    message: 'That concert was absolutely amazing! 🔥🔥🔥 We need to go again!',
    platform: 'INSTAGRAM',
    context: 'FRIEND',
  },
  {
    message: "I can't believe what happened in the meeting 💀 I'm still processing",
    platform: 'WHATSAPP',
    context: 'COWORKER',
  },
  {
    message: "Missing you so much today ❤️ Can't wait to see you this weekend",
    platform: 'IMESSAGE',
    context: 'ROMANTIC_PARTNER',
  },
  {
    message: 'Just saw the funniest video 😂😂😂 You have to check it out!',
    platform: 'TIKTOK',
    context: 'FRIEND',
  },
  {
    message: 'Great job on the presentation today! 🎉 The client loved it.',
    platform: 'SLACK',
    context: 'COWORKER',
  },
  {
    message: "Mom said dinner is at 6pm 🍽️ Don't forget to bring the dessert!",
    platform: 'IMESSAGE',
    context: 'FAMILY',
  },
];

/**
 * Invalid interpret requests for testing validation
 */
export const INVALID_INTERPRET_REQUESTS: Partial<InterpretRequest>[] = [
  // Too short message
  {
    message: 'Hi 😊',
    platform: 'IMESSAGE',
    context: 'FRIEND',
  },
  // Empty message
  {
    message: '',
    platform: 'SLACK',
    context: 'COWORKER',
  },
  // Missing platform
  {
    message: 'This is a valid length message with an emoji 😀',
    context: 'FRIEND',
  } as Partial<InterpretRequest>,
  // Missing context
  {
    message: 'This is a valid length message with an emoji 😀',
    platform: 'IMESSAGE',
  } as Partial<InterpretRequest>,
  // Missing message
  {
    platform: 'INSTAGRAM',
    context: 'FRIEND',
  } as Partial<InterpretRequest>,
  // Message too long (would be > 1000 chars)
  {
    message: 'A'.repeat(900) + '😀' + 'B'.repeat(200),
    platform: 'IMESSAGE',
    context: 'FRIEND',
  },
];

/**
 * Edge case messages for testing unicode handling
 */
export const EDGE_CASE_MESSAGES: string[] = [
  // ZWJ sequences (family emoji)
  'Look at this family photo 👨‍👩‍👧‍👦 from last summer!',
  // Variation selector (heart with FE0F)
  'Love you so much ❤️ miss you',
  // Multiple consecutive emojis
  'This is amazing 🔥🔥🔥🔥🔥',
  // Mixed text and emojis
  'So 😊 happy 🎉 about 💯 this!',
  // Skin tone modifier
  'High five! 👋🏽 Great work today!',
  // Flag emoji (regional indicators)
  'Going to Japan soon 🇯🇵 so excited!',
  // Emoji at start
  "😂 I can't believe that happened!",
  // Emoji at end
  'What a great day today 🌟',
  // Only emoji (but still minimum length)
  '😀😀😀😀😀😀😀😀😀😀',
];

/**
 * Messages with multiple different emojis
 */
export const MESSAGES_WITH_MULTIPLE_EMOJIS: string[] = [
  'Had an amazing day! 🎉🔥💯 Everything went perfectly!',
  "The party was 💀😂 I can't even explain how funny it was",
  'Missing you ❤️😢 hope to see you soon 🙏',
  'Work was crazy today 😅💼🏃 but we made it!',
  'New year, new me 🎊✨🌟 Ready for great things!',
];

/**
 * Messages organized by platform
 */
export const MESSAGES_BY_PLATFORM: Record<Platform | 'OTHER', InterpretRequest> = {
  IMESSAGE: {
    message: "Just landed! 🛬 Let me know when you're ready to pick me up",
    platform: 'IMESSAGE',
    context: 'FRIEND',
  },
  INSTAGRAM: {
    message: 'Your new post is 🔥🔥🔥 Looking amazing as always!',
    platform: 'INSTAGRAM',
    context: 'FRIEND',
  },
  TIKTOK: {
    message: 'Did you see that trend? 💀😂 I tried it and failed so hard',
    platform: 'TIKTOK',
    context: 'FRIEND',
  },
  WHATSAPP: {
    message: "Family group says dinner at 7pm 🍕 Don't be late!",
    platform: 'WHATSAPP',
    context: 'FAMILY',
  },
  SLACK: {
    message: "Great standup today team! 👏 Let's keep the momentum going",
    platform: 'SLACK',
    context: 'COWORKER',
  },
  DISCORD: {
    message: 'GG team! 🎮 That was an intense match but we pulled through',
    platform: 'DISCORD',
    context: 'FRIEND',
  },
  TWITTER: {
    message: 'Just announced our new product! 🚀 Check it out in the link',
    platform: 'TWITTER',
    context: 'STRANGER',
  },
  OTHER: {
    message: 'Thanks for reaching out! 😊 Happy to help with your question',
    platform: 'OTHER',
    context: 'STRANGER',
  },
};

/**
 * Messages organized by relationship context
 */
export const MESSAGES_BY_CONTEXT: Record<RelationshipContext, InterpretRequest> = {
  ROMANTIC_PARTNER: {
    message: "Can't stop thinking about our date last night ❤️😍 You're amazing",
    platform: 'IMESSAGE',
    context: 'ROMANTIC_PARTNER',
  },
  FRIEND: {
    message: 'Dude that party was wild 💀🔥 We need to do that again!',
    platform: 'IMESSAGE',
    context: 'FRIEND',
  },
  FAMILY: {
    message: 'Happy birthday mom! 🎂🎉 Love you so much, have a great day!',
    platform: 'WHATSAPP',
    context: 'FAMILY',
  },
  COWORKER: {
    message: 'Thanks for covering the meeting 👍 I really appreciate it!',
    platform: 'SLACK',
    context: 'COWORKER',
  },
  ACQUAINTANCE: {
    message: 'Nice running into you today! 😊 We should catch up sometime',
    platform: 'INSTAGRAM',
    context: 'ACQUAINTANCE',
  },
  STRANGER: {
    message: 'Thanks for the recommendation! 🙏 Will definitely check it out',
    platform: 'TWITTER',
    context: 'STRANGER',
  },
};

/**
 * Get a random valid request
 */
export function getRandomValidRequest(): InterpretRequest {
  const index = Math.floor(Math.random() * VALID_INTERPRET_REQUESTS.length);
  return VALID_INTERPRET_REQUESTS[index];
}

/**
 * Get a random invalid request
 */
export function getRandomInvalidRequest(): Partial<InterpretRequest> {
  const index = Math.floor(Math.random() * INVALID_INTERPRET_REQUESTS.length);
  return INVALID_INTERPRET_REQUESTS[index];
}
