/**
 * Family profiles — part 05.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part05: Record<string, FamilyProfile> = {
  'backhand-index-pointing-left': {
    base: 'backhand-index-pointing-left',
    title: 'Backhand Index Pointing Left',
    glyph: '👈',
    depicts: 'a hand seen from behind, index finger extended toward the left',
    reads: 'pointing back at something already said',
    misread:
      'taken as pointing at whoever is next to you when it usually points back at an earlier message, because the hand reads as a physical direction',
    uses: [
      'naming whoever said the thing being quoted',
      'pairing with a right-pointing finger for a reply',
    ],
    contrast: {
      glyph: '👉',
      title: 'Index Pointing Right',
      note: 'pointing right aims at someone else, the backhand finger folds back toward the sender',
    },
    toneLands: 'hands',
  },

  chef: {
    base: 'chef',
    title: 'Cook',
    glyph: '🧑‍🍳',
    depicts: 'a figure in a tall white toque and jacket, holding a cooking pan',
    reads: 'cooking, feeding people, or taking charge of the kitchen',
    misread:
      'assumed to be a restaurant line cook when it is usually shorthand for whoever feeds the group, whether that is a sibling or a group chat',
    uses: ['announcing you are making dinner tonight', 'crediting whoever handled the food'],
    contrast: {
      glyph: '👨‍🍳',
      title: 'Man Cook',
      note: 'the man cook names a specific person, the neutral cook stands in for anyone at the stove',
    },
    toneLands: 'person',
  },

  ear: {
    base: 'ear',
    title: 'Ear',
    glyph: '👂',
    depicts: 'a single human ear in side profile, the inner folds curved inward',
    reads: 'listening, hearing something, or paying attention',
    misread:
      'taken as "sounds good" when it usually means "I am listening to you right now", because the ear alone signals attention rather than agreement',
    uses: [
      'telling a friend you are on a call listening',
      'reacting when someone says something surprising',
    ],
    contrast: {
      glyph: '🦻',
      title: 'Ear with Hearing Aid',
      note: 'the hearing aid version adds the device behind the ear and gets used when hearing itself is the subject',
    },
    toneLands: 'body',
    toneTarget: 'ear',
  },

  'fist-right': {
    base: 'fist-right',
    title: 'Right-Facing Fist',
    glyph: '🤜',
    depicts: 'a clenched fist with the knuckles facing right, thumb folded across',
    reads: 'offering a fist bump or a gesture of solidarity',
    misread:
      'often taken for a punch being thrown because the knuckles are prominent, though in practice it is nearly always the bump offered before or after',
    uses: ['a fist bump after a shared win', 'signing off a hard week with solidarity'],
    contrast: {
      glyph: '✊',
      title: 'Raised Fist',
      note: 'the raised fist signals triumph or protest, the sideways fist is aimed at a partner for a bump',
    },
    toneLands: 'hands',
  },

  handball: {
    base: 'handball',
    title: 'Person Playing Handball',
    glyph: '🤾',
    depicts: 'a figure mid-stride with one arm raised, holding a small blue ball',
    reads: 'competing hard as part of a team',
    misread:
      'taken for a general sports picture when it is really a handball-specific one, so players who mean a different sport have to add a word to explain themselves',
    uses: ['a team trying to set a competitive tone', 'someone going hard at a busy week'],
    contrast: {
      glyph: '🏀',
      title: 'Basketball',
      note: 'basketball brings a hoop and a court, handball brings a smaller ball thrown and smacked indoors',
    },
    toneLands: 'person',
  },

  leg: {
    base: 'leg',
    title: 'Leg',
    glyph: '🦵',
    depicts: 'a leg from thigh to bare foot, the foot angled slightly outward',
    reads: 'walking, running, or a leg day at the gym',
    misread:
      'used to mean "going for a run" when it is more often shorthand for legs as a body part, appearing in injury reports and gym posts alike',
    uses: ['posting about leg day at the gym', 'reporting a leg injury to a friend'],
    contrast: {
      glyph: '🦶',
      title: 'Foot',
      note: 'the foot stands alone for walking or bare feet, the leg always drags the thigh and knee along with it',
    },
    toneLands: 'body',
    toneTarget: 'leg',
  },

  'middle-finger': {
    base: 'middle-finger',
    title: 'Middle Finger',
    glyph: '🖕',
    depicts: 'a hand with the middle finger extended and the other fingers curled down',
    reads: 'insulting someone, read as a flat "f*** you"',
    misread:
      'sent jokingly between close friends who treat it as a bit, while to a stranger it lands as a genuine attack and can get a person removed from a room',
    uses: [
      'a mutual friend group trading inside jokes',
      'answering a confidently wrong bot in a group chat',
    ],
    contrast: {
      glyph: '👍',
      title: 'Thumbs Up',
      note: 'the thumbs up is approval, and sending the finger instead of the thumb is the whole point of the joke',
    },
    toneLands: 'hands',
  },

  'open-hands': {
    base: 'open-hands',
    title: 'Open Hands',
    glyph: '👐',
    depicts: 'two open hands held forward, palms up and fingers spread wide',
    reads: 'receiving, giving up, or asking for a hug',
    misread:
      'taken for celebration or applause when it more often reads as open palms waiting to be handed something, because the hands are cupped upward',
    uses: ['asking a friend to hand over the last snack', 'signalling a big group hug photo'],
    contrast: {
      glyph: '🙏',
      title: 'Folded Hands',
      note: 'the folded hands ask or give thanks, the open palms are already out waiting to receive',
    },
    toneLands: 'both-hands',
  },

  'person-gesturing-no': {
    base: 'person-gesturing-no',
    title: 'Person Gesturing No',
    glyph: '🙅',
    depicts: 'a figure with both forearms crossed in an X before the body',
    reads: 'rejecting an offer or flatly refusing something',
    misread:
      'taken as a general dislike when it is aimed at a specific offer, and the crossed arms can look like the person is merely uncomfortable',
    uses: ['turning down a plan you do not want', 'marking a task as declined at work'],
    contrast: {
      glyph: '🙆',
      title: 'Person Gesturing OK',
      note: 'the OK gesture is a thumbs up, the no gesture is crossed arms, and swapping them flips the meaning',
    },
    toneLands: 'person',
  },

  'person-swimming': {
    base: 'person-swimming',
    title: 'Person Swimming',
    glyph: '🏊',
    depicts: 'a swimmer in a cap and goggles, one arm extended forward in the water',
    reads: 'doing laps, going through the motions, staying afloat',
    misread:
      'read as a serious athlete or race effort when it is more often someone treading water through a slow week, since the cap and goggles look official',
    uses: ['a weekly swim set done on autopilot', 'saying you are keeping your head above water'],
    contrast: {
      glyph: '🏄',
      title: 'Person Surfing',
      note: 'the surfer rides a wave standing up, the swimmer is head-down in a pool doing laps',
    },
    toneLands: 'person',
  },

  'pregnant-person': {
    base: 'pregnant-person',
    title: 'Pregnant Woman',
    glyph: '🤰',
    depicts: 'a woman standing with one hand resting on her rounded belly',
    reads: 'announcing or celebrating a pregnancy',
    misread:
      'used as a generic celebration picture though it is really a pregnancy announcement, so sending it as filler for a new job or a graduation lands wrong',
    uses: [
      'a first pregnancy announcement to family',
      'congratulating a friend who just shared news',
    ],
    contrast: {
      glyph: '👶',
      title: 'Baby',
      note: 'the baby is the new arrival, the pregnancy is the wait, and the two get swapped in timelines',
    },
    toneLands: 'person',
  },

  'raised-hand': {
    base: 'raised-hand',
    title: 'Raised Hand',
    glyph: '✋',
    depicts: 'an open hand held upright, palm forward, fingers spread wide',
    reads: 'stopping someone, or volunteering to answer',
    misread:
      'taken for a high five when it is more often a stop or a claim on attention, since the palm-out pose is the one a teacher uses',
    uses: ['calling a meeting agenda back on track', 'jumping in to answer a question'],
    contrast: {
      glyph: '🖐️',
      title: 'Hand with Fingers Splayed',
      note: 'the two look nearly identical on most platforms, so people send whichever one their keyboard produced',
    },
    toneLands: 'hands',
  },

  'sign-of-horns': {
    base: 'sign-of-horns',
    title: 'Sign of the Horns',
    glyph: '🤘',
    depicts: 'a hand with index and little fingers extended, thumb pinning the middle two down',
    reads: 'rocking out, approving something, or jokingly claiming toughness',
    misread:
      'treated as a music reference when it is really just a stubborn or defiant gesture, and plenty of people have no idea where it came from',
    uses: ['announcing a gig you are heading to', 'signing off a stubborn reply in a chat'],
    contrast: {
      glyph: '🤙',
      title: 'Call Me Hand',
      note: 'the call me hand extends thumb and pinky sideways, the horns points index and pinky straight up',
    },
    toneLands: 'hands',
  },

  teacher: {
    base: 'teacher',
    title: 'Teacher',
    glyph: '🧑‍🏫',
    depicts: 'a figure beside a whiteboard, holding a pointer in one hand',
    reads: 'teaching, grading, or being in charge of a lesson',
    misread:
      'taken for any education worker when the artwork specifically reads as classroom instruction, so a tutor or a professor ends up looking like a school teacher',
    uses: ['a classroom photo caption', 'asking a coworker to explain something again'],
    contrast: {
      glyph: '🧑‍💻',
      title: 'Technologist',
      note: 'the technologist sits at a screen, the teacher stands at a board with a pointer in hand',
    },
    toneLands: 'person',
  },

  'victory-hand': {
    base: 'victory-hand',
    title: 'Victory Hand',
    glyph: '✌️',
    depicts: 'a hand with the index and middle fingers raised in a V shape',
    reads: 'celebrating a win, or marking peace',
    misread:
      'taken as a peace sign when it started life as victory, and most people now use it for photos and captions instead of an actual win',
    uses: ['marking a small personal win', 'saying peace in a casual sign-off'],
    contrast: {
      glyph: '🤟',
      title: 'Love-You Gesture',
      note: 'the love sign adds a thumb across the curled fingers, the victory hand leaves them all open',
    },
    toneLands: 'hands',
  },

  zombie: {
    base: 'zombie',
    title: 'Zombie',
    glyph: '🧟',
    depicts: 'a grey-green figure with sunken eyes, torn clothes and one arm out',
    reads: 'exhaustion, Monday dread, or deadpan humour',
    misread:
      'taken for genuine horror when it is nearly always tiredness or a deadpan joke, so a grim status update never reads as a threat',
    uses: ['a status update about a sleepless night', 'replying to bad news with deadpan humour'],
    contrast: {
      glyph: '💀',
      title: 'Skull',
      note: 'the skull is dead and gone with nothing left to say, the zombie is still upright and complaining',
    },
    toneLands: 'person',
  },
};
