/**
 * Family profiles — part 07.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part07: Record<string, FamilyProfile> = {
  climbing: {
    base: 'climbing',
    title: 'Person Climbing',
    glyph: '🧗',
    depicts: 'a figure with both hands on a rock face, mid-climb',
    reads: 'grappling with something hard, one move at a time',
    misread:
      'assumed to be an invite to work out when it is mostly a stand-in for grinding through something tedious — the strained pose reads as effort and people import a gym meaning',
    uses: ['bracing for a hard week of work', 'describing a wall you cannot get over'],
    contrast: {
      glyph: '🏔️',
      title: 'Snow-Capped Mountain',
      note: 'the mountain names the terrain, the climber names the struggle',
    },
    toneLands: 'person',
  },

  elf: {
    base: 'elf',
    title: 'Elf',
    glyph: '🧝',
    depicts: 'a figure with pointed ears, a green cap, and a green tunic',
    reads: 'marking something festive, playful, or slightly magical',
    misread:
      'assumed to be a serious fantasy character when it is mostly a stand-in for holiday cheer and office joking — the green hat arrives carrying a whole Christmas register',
    uses: [
      'naming the colleague who fixes everything quietly',
      'wishing a festive season in a group thread',
    ],
    contrast: {
      glyph: '🧚',
      title: 'Fairy',
      note: 'the fairy is tiny and winged, the elf is full sized with a hat and a job',
    },
    toneLands: 'person',
  },

  'folded-hands': {
    base: 'folded-hands',
    title: 'Folded Hands',
    glyph: '🙏',
    depicts: 'two hands pressed palm to palm, fingertips pointing upward',
    reads: 'asking nicely, giving thanks, or praying',
    misread:
      'assumed to be real religious prayer when it is far more often a polite please or a virtual high-five — people reuse the clasped shape for anything soft and deferential',
    uses: ['begging for an extension in a work chat', 'sending prayers for a sick friend'],
    contrast: {
      glyph: '🤲',
      title: 'Palms Up Together',
      note: 'the clasped hands point upward in prayer, the open palms face upward to receive',
    },
    toneLands: 'hands',
  },

  'heart-hands': {
    base: 'heart-hands',
    title: 'Heart Hands',
    glyph: '🫶',
    depicts: 'two hands curved together, thumbs and fingers forming a heart',
    reads: 'sending love, gratitude, or a fan scream',
    misread:
      'sent as pure romantic love when it is mostly how people say thank you — the heart shape pushes everything into the romantic register, including applause and support',
    uses: ['thanking a friend who actually helped', 'showing love for a band or an idol'],
    contrast: {
      glyph: '❤️',
      title: 'Red Heart',
      note: 'the plain heart names the feeling, the hand heart shows who is sending it',
    },
    toneLands: 'both-hands',
  },

  'love-you-gesture': {
    base: 'love-you-gesture',
    title: 'Love-You Gesture',
    glyph: '🤟',
    depicts: 'a hand with thumb, index finger, and pinky extended, other fingers folded',
    reads: 'saying I love you, or hyping something up',
    misread:
      'mistaken for the rock horns sign, so the message lands as party talk rather than affection — the two shapes share a silhouette and the pinky is easy to overlook',
    uses: ['texting love to a partner or a close friend', 'hyping a song before you press play'],
    contrast: {
      glyph: '🤘',
      title: 'Sign of the Horns',
      note: 'the horns sign is a rock handshape, the pinky-out version is the ASL love sign',
    },
    toneLands: 'hands',
  },

  'nail-polish': {
    base: 'nail-polish',
    title: 'Nail Polish',
    glyph: '💅',
    depicts: 'a hand with splayed fingers, painted nails, and a small brush',
    reads: 'showing off fresh nails, or waving off a problem',
    misread:
      'meant as genuinely unbothered when it is usually a performance of unbothered — the painted nails do the talking, so the caption has to carry the sarcasm',
    uses: ['announcing a manicure to the group chat', 'signalling you are done with that topic'],
    contrast: {
      glyph: '💄',
      title: 'Lipstick',
      note: 'the lipstick says polished for the night, the nails say effort spent on yourself',
    },
    toneLands: 'hands',
  },

  'palm-up': {
    base: 'palm-up',
    title: 'Palm Up Hand',
    glyph: '🫴',
    depicts: 'a single hand held up, palm facing up, fingers pointing skyward',
    reads: 'holding a hand out to catch or take something',
    misread:
      'taken for a request when it is more often a hand held out to receive — one open palm asks for a thing, and the plain version skips the two-handed plea',
    uses: ['asking a friend to pass something over', 'holding your hand out for a handshake'],
    contrast: {
      glyph: '🫳',
      title: 'Palm Down Hand',
      note: 'the palm up hand receives, the palm down hand sweeps something away',
    },
    toneLands: 'hands',
  },

  'person-in-bath': {
    base: 'person-in-bath',
    title: 'Person Taking Bath',
    glyph: '🛀',
    depicts: 'a person sunk in a bathtub with only their head showing',
    reads: 'signalling a rare moment of rest and self care',
    misread:
      'assumed to be a cute spa reference when it is most often a shrug about being buried in work — the sunken figure reads as not coming out of there',
    uses: ['hiding from your inbox for an afternoon', 'announcing you are done with the week'],
    contrast: {
      glyph: '🛁',
      title: 'Bathtub',
      note: 'the empty tub is the bathroom, the person in it is the state of mind',
    },
    toneLands: 'person',
  },

  pilot: {
    base: 'pilot',
    title: 'Pilot',
    glyph: '🧑‍✈️',
    depicts: 'a figure in uniform with a peaked cap and shoulder epaulettes',
    reads: 'taking the controls, or flying somewhere',
    misread:
      'understood as literal flying when it is mostly a way of saying you are handling something — the uniform borrows the calm competence of an aircraft deck',
    uses: [
      'announcing you are handling a difficult task',
      'saying you are about to travel somewhere',
    ],
    contrast: {
      glyph: '🧑‍🚀',
      title: 'Astronaut',
      note: 'the pilot takes the controls on a plane, the astronaut goes along for the ride',
    },
    toneLands: 'person',
  },

  princess: {
    base: 'princess',
    title: 'Princess',
    glyph: '👸',
    depicts: 'a figure in a gown wearing a small crown',
    reads: 'calling someone pampered, or treating them like royalty',
    misread:
      'used sincerely as a compliment when it usually carries a jab — the tiara and gown make spoiled the more available reading, so a real endearment can land as a tease',
    uses: ['teasing a friend who is being fussed over', 'sending a royal nickname to your partner'],
    contrast: {
      glyph: '👰',
      title: 'Bride With Veil',
      note: 'the bride is a real day you attended, the princess is a nickname you assign',
    },
    toneLands: 'person',
  },

  'rightwards-hand': {
    base: 'rightwards-hand',
    title: 'Rightwards Hand',
    glyph: '🫱',
    depicts: 'a hand extended sideways, palm facing down, fingers pointing right',
    reads: 'handing something over, or passing the turn',
    misread:
      'read as pointing at something when it is more often about moving a task along — the sideways hand resembles the pointing finger but stays flat and open',
    uses: ['passing a task to the next person', 'handing over the last slice of pizza'],
    contrast: {
      glyph: '👉',
      title: 'Backhand Index Pointing Right',
      note: 'the pointing finger singles out a target, the flat hand sweeps the offer across',
    },
    toneLands: 'hands',
  },

  snowboarder: {
    base: 'snowboarder',
    title: 'Snowboarder',
    glyph: '🏂',
    depicts: 'a rider leaning into a carve on a single snowboard',
    reads: 'describing speed, a cold trip, or a wipeout',
    misread:
      'assumed to be skiing when the board makes it a different sport entirely — one plank under both feet reads as surfing and the sideways lean sells speed',
    uses: ['bragging about a weekend in the mountains', 'describing a turn nobody else noticed'],
    contrast: {
      glyph: '⛷️',
      title: 'Skier',
      note: 'the skier stands upright on two skis with poles, the rider carves sideways on one board',
    },
    toneLands: 'person',
  },

  'thumbs-down': {
    base: 'thumbs-down',
    title: 'Thumbs Down',
    glyph: '👎',
    depicts: 'a closed fist with the thumb pointing down',
    reads: 'rejecting, rating badly, or disapproving',
    misread:
      'treated as a hard no or a personal attack when it is usually the mildest possible rating — a bare thumb carries no heat until a caption adds it',
    uses: ['rating a restaurant or a pitch one star', 'quietly rejecting a plan in a group chat'],
    contrast: {
      glyph: '🖕',
      title: 'Middle Finger',
      note: 'the middle finger aims at a person, the thumbs down aims at a thing',
    },
    toneLands: 'hands',
  },

  'water-polo': {
    base: 'water-polo',
    title: 'Person Playing Water Polo',
    glyph: '🤽',
    depicts: 'a player in a cap raising a ball over the water',
    reads: 'staying afloat in something demanding',
    misread:
      'mistaken for a swimming emoji when the ball and the cap announce a specific, contact heavy sport — people reach for the wrong water picture and assume it is just a swim',
    uses: ['joking about being overwhelmed at work', 'naming a water polo match or tournament'],
    contrast: {
      glyph: '🏊',
      title: 'Person Swimming',
      note: 'the swimmer is alone and calm, the polo player has a ball and an opposing team',
    },
    toneLands: 'person',
  },
};
