/**
 * Family profiles — part 08.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part08: Record<string, FamilyProfile> = {
  'basketball-player': {
    base: 'basketball-player',
    title: 'Person Bouncing Ball',
    glyph: '⛹️',
    depicts: 'a figure crouched with one hand pushing a basketball down to the floor',
    reads: 'showing off a sport, usually to claim competence',
    misread:
      'taken for genuine athletic pride when it is usually a joke about being bad at the sport — the crouch is the giveaway',
    uses: ['announcing you are heading to the gym', 'joking about your terrible free throws'],
    contrast: {
      glyph: '🏀',
      title: 'Basketball',
      note: 'the ball is the object being played with, the figure is the person handling it',
    },
    toneLands: 'person',
  },

  'construction-worker': {
    base: 'construction-worker',
    title: 'Construction Worker',
    glyph: '👷',
    depicts: 'a figure in an orange hard hat and yellow safety vest, smiling',
    reads: 'announcing work, repairs, or a job in progress',
    misread:
      'mistaken for a property-dispute warning when it is usually pride in doing the work — the vest signals builder, not menace',
    uses: ['announcing a renovation you just started', 'thanking the crew that fixed the leak'],
    contrast: {
      glyph: '🧑‍🔧',
      title: 'Mechanic',
      note: 'the mechanic reads as repair and troubleshooting, the construction worker reads as building and the site',
    },
    toneLands: 'person',
  },

  fairy: {
    base: 'fairy',
    title: 'Fairy',
    glyph: '🧚',
    depicts: 'a small winged figure in a pointed cap holding a wand',
    reads: 'asking for a small wish or some luck',
    misread:
      'treated as sincerely magical when it is nearly always a joking plea for something — the wand is decorative, the request is real',
    uses: ['pleading for one small favor', 'wishing someone a lucky day'],
    contrast: {
      glyph: '✨',
      title: 'Sparkles',
      note: 'sparkles are pure decoration with no request attached, the fairy arrives asking for something',
    },
    toneLands: 'person',
  },

  foot: {
    base: 'foot',
    title: 'Foot',
    glyph: '🦶',
    depicts: 'a bare human foot with visible toes, drawn in profile',
    reads: 'marking a trip, a walk, or a dance',
    misread:
      'assumed to be a crude joke when it is usually the neutral shorthand for going somewhere on foot — the warmth comes from the pun about long journeys',
    uses: ['saying you are heading out on foot', 'quoting the foot-in-mouth idiom'],
    contrast: {
      glyph: '👣',
      title: 'Footprints',
      note: 'footprints show the trail someone left, the bare foot shows the walker themselves',
    },
    toneLands: 'body',
    toneTarget: 'foot',
  },

  'horse-racing': {
    base: 'horse-racing',
    title: 'Horse Racing',
    glyph: '🏇',
    depicts: 'a jockey crouched low over a galloping horse, both mid-stride',
    reads: 'speeding up, pushing hard, or chasing a finish',
    misread:
      'assumed to be about horses when the gallop almost always means speed — people send it when something is racing toward a deadline',
    uses: ['saying you are racing a deadline', 'announcing a fast ride to somewhere'],
    contrast: {
      glyph: '🐎',
      title: 'Horse',
      note: 'the horse alone is the animal, the rider on its back makes it a race with a finish line',
    },
    toneLands: 'person',
  },

  mage: {
    base: 'mage',
    title: 'Mage',
    glyph: '🧙',
    depicts: 'a figure in a wide pointed hat and long robe holding a staff',
    reads: 'asking for help from something with real power',
    misread:
      'treated as a spooky caster when it is usually a polite request aimed upward — the robe and hat are theater for wanting a favor',
    uses: ['begging the universe for a good outcome', 'casting a wish in a group chat'],
    contrast: {
      glyph: '🪄',
      title: 'Magic Wand',
      note: 'the wand is the tool alone, the mage brings a person and a request',
    },
    toneLands: 'person',
  },

  ninja: {
    base: 'ninja',
    title: 'Ninja',
    glyph: '🥷',
    depicts: 'a figure in black with a headband and a scarf across the face',
    reads: 'slipping in quietly, hiding, or asking for secrecy',
    misread:
      'mistaken for a cool martial-arts pose when it is really about discretion — people send it when something should stay between them',
    uses: ['asking a friend to keep a secret', 'slipping into a plan without announcing it'],
    contrast: {
      glyph: '🕵️',
      title: 'Detective',
      note: 'the detective investigates and reports back, the ninja moves without leaving a trail',
    },
    toneLands: 'person',
  },

  'palms-together': {
    base: 'palms-together',
    title: 'Palms Up Together',
    glyph: '🤲',
    depicts: 'two open hands held forward, palms turned up and cupped',
    reads: 'offering something, receiving it, or asking to receive',
    misread:
      'taken for a plea to a higher power when it is usually a plain offer — the cupped palms put something in front of you',
    uses: ['handing over the last slice', 'asking a friend to pass something over'],
    contrast: {
      glyph: '🙏',
      title: 'Folded Hands',
      note: 'folded hands are pressed together in thanks or prayer, open palms are held out to give or take',
    },
    toneLands: 'both-hands',
  },

  'person-in-bed': {
    base: 'person-in-bed',
    title: 'Person in Bed',
    glyph: '🛌',
    depicts: 'a figure lying under a blanket, head on a pillow, asleep',
    reads: 'signing off, going to sleep, calling it a night',
    misread:
      'assumed to mean actual sleep when it mostly marks the end of a conversation — people send it while still awake and very much online',
    uses: ['ending a chat for the night', 'posting a bed photo before work'],
    contrast: {
      glyph: '😴',
      title: 'Sleeping Face',
      note: 'the face shows drowsiness while awake, the bed shows being physically in bed and unavailable',
    },
    toneLands: 'person',
  },

  'pinched-fingers': {
    base: 'pinched-fingers',
    title: 'Pinched Fingers',
    glyph: '🤌',
    depicts: 'a hand with thumb and fingertips pinched together, other fingers raised',
    reads: 'asking what you want, or signalling something is perfect',
    misread:
      'used to mean "what do you want?" when the intended meaning is often approval — the pinch reads as a request for specifics but lands as a compliment',
    uses: ['asking what someone actually wants to eat', 'marking a meal as exactly right'],
    contrast: {
      glyph: '👌',
      title: 'OK Hand',
      note: 'the pinched fingertips mean questioning or perfect, the OK hand signals approval outright',
    },
    toneLands: 'hands',
  },

  'punch-fist': {
    base: 'punch-fist',
    title: 'Oncoming Fist',
    glyph: '👊',
    depicts: 'a closed fist driving forward, knuckles toward the viewer',
    reads: 'a punch, a fist bump, or a bro greeting',
    misread:
      'taken as a threat of violence when it is usually a friendly bump — online, a fist rarely lands as anything but a greeting',
    uses: ['greeting a friend in a group chat', 'celebrating a win with a fist punch'],
    contrast: {
      glyph: '✊',
      title: 'Raised Fist',
      note: 'the raised fist is a held-up solidarity sign, the oncoming fist is a punch landing on you',
    },
    toneLands: 'hands',
  },

  rowboat: {
    base: 'rowboat',
    title: 'Person Rowing Boat',
    glyph: '🚣',
    depicts: 'a figure seated in a narrow boat, one oar pulled through the water',
    reads: 'rowing, keeping pace, or working through something slowly',
    misread:
      'assumed to be a quiet boating scene when it is usually about effort — the long stroke suggests grinding through something at a steady pace',
    uses: ['saying you are working through a slow week', 'keeping pace with a long task'],
    contrast: {
      glyph: '🛶',
      title: 'Canoe',
      note: 'the canoe is an empty vessel for leisure, the rowboat always shows a person putting in the work',
    },
    toneLands: 'person',
  },

  'hand-with-fingers-splayed': {
    base: 'hand-with-fingers-splayed',
    title: 'Hand with Fingers Splayed',
    glyph: '🖐️',
    depicts:
      'a palm turned toward the reader with the fingers spread wide apart, the gaps between them clearly drawn',
    reads: 'holding someone back, asking for a pause, or putting a hand up in a group',
    misread:
      'read as a wave or a high five because the drawing sits next to the plain raised hand, when the wide gaps between the fingers are what make it read as a barrier',
    uses: [
      'asking a group chat to wait for your turn',
      'holding a conversation back while you think of the words',
    ],
    contrast: {
      glyph: '✋',
      title: 'Raised Hand',
      note: 'the plain raised hand volunteers or greets, the splayed fingers are drawn as a barrier',
    },
    toneLands: 'hands',
  },

  'thumbs-up': {
    base: 'thumbs-up',
    title: 'Thumbs Up',
    glyph: '👍',
    depicts: 'a closed fist turned sideways with the thumb raised straight up',
    reads: 'approving something, quickly and without much ceremony',
    misread:
      'taken at face value as genuine approval when it is often a low-effort acknowledgment — the flat thumb shows approval without enthusiasm',
    uses: ['approving a plan in a hurry', 'acknowledging a message without typing more'],
    contrast: {
      glyph: '👎',
      title: 'Thumbs Down',
      note: 'the thumbs down is a clear verdict against, the thumbs up is a soft yes that stays open to argument',
    },
    toneLands: 'hands',
  },

  'waving-hand': {
    base: 'waving-hand',
    title: 'Waving Hand',
    glyph: '👋',
    depicts: 'an open hand tilted sideways, fingers and thumb spread apart',
    reads: 'greeting someone, or a friendly sign-off',
    misread:
      'assumed to be a cheerful hello when it is just as often a soft goodbye — people send it while actually leaving the conversation',
    uses: ['opening a message to someone new', 'signing off a thread without typing bye'],
    contrast: {
      glyph: '🙋',
      title: 'Person Raising Hand',
      note: 'the raised hand volunteers or asks a question, the waving hand is a greeting or goodbye',
    },
    toneLands: 'hands',
  },
};
