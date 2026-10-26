/**
 * Family profiles — part 04.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part04: Record<string, FamilyProfile> = {
  baby: {
    base: 'baby',
    title: 'Baby',
    glyph: '👶',
    depicts: 'a bundled infant with a round face, a curl of hair and a pacifier',
    reads: 'cooing over something small and new',
    misread:
      'assumed to be a literal infant when it is most often a stand-in for whatever the sender is fussing over, because the pacifier makes it read as sweet rather than specific',
    uses: [
      'reacting to a newborn photo in a family chat',
      "calling a friend's new puppy a tiny human",
    ],
    contrast: {
      glyph: '🍼',
      title: 'Baby Bottle',
      note: 'the bottle stands in for the caregiving act, the baby stands in for the small new thing itself',
    },
    toneLands: 'person',
  },

  cartwheeling: {
    base: 'cartwheeling',
    title: 'Person Cartwheeling',
    glyph: '🤸',
    depicts: 'a figure mid-cartwheel, legs split and hands on the floor',
    reads: 'celebrating so hard the sender cannot sit still',
    misread:
      'taken for actual athletic skill when it is mostly a shortcut for glee, since a cartwheel is a thing nobody does on purpose',
    uses: ['announcing a win at work', 'reacting to a friend getting engaged'],
    contrast: {
      glyph: '🏃',
      title: 'Person Running',
      note: 'the runner says someone is late or hurrying, the cartwheel says nobody is going anywhere',
    },
    toneLands: 'person',
  },

  doctor: {
    base: 'doctor',
    title: 'Health Worker',
    glyph: '🧑‍⚕️',
    depicts: 'a figure in a white coat with a stethoscope around the neck',
    reads: 'naming a clinician, a checkup, or a diagnosis',
    misread:
      'assumed to mean a doctor specifically, when the white coat and stethoscope cover nurses, dentists and every other uniformed clinician',
    uses: [
      'describing a checkup appointment on Monday',
      'joking that you need a professional for this',
    ],
    contrast: {
      glyph: '🧑‍🏫',
      title: 'Teacher',
      note: 'the teacher reads schoolroom and instruction, the health worker reads clinic and treatment',
    },
    toneLands: 'person',
  },

  'fist-left': {
    base: 'fist-left',
    title: 'Left-Facing Fist',
    glyph: '🤛',
    depicts: 'a closed fist turned so the knuckles point left',
    reads: 'offering a fist bump toward the left',
    misread:
      'sent as the right half of a fist bump when the sender actually meant the left-facing side, since the two fists are near-mirrors and easy to swap',
    uses: ['pairing with a friend sending the opposite fist', 'marking solidarity in a group chat'],
    contrast: {
      glyph: '🤜',
      title: 'Right-Facing Fist',
      note: 'the right-facing fist is the one most people send first, the left-facing one completes it',
    },
    toneLands: 'hands',
  },

  guard: {
    base: 'guard',
    title: 'Guard',
    glyph: '💂',
    depicts: 'a figure in a red uniform and tall bearskin hat, standing at attention',
    reads: 'watching over something, or standing rigidly on duty',
    misread:
      'taken for a police officer when the tall bearskin hat marks a ceremonial palace guard, so the scarlet uniform reads as royal rather than law',
    uses: [
      'reporting that you are not leaving your post',
      'announcing you are on watch duty tonight',
    ],
    contrast: {
      glyph: '👮',
      title: 'Police Officer',
      note: 'the police officer carries enforcement and authority, the guard carries ceremony and standing still',
    },
    toneLands: 'person',
  },

  'leftwards-hand': {
    base: 'leftwards-hand',
    title: 'Leftwards Hand',
    glyph: '🫲',
    depicts: 'an open hand held out sideways, palm turned toward the left',
    reads: 'handing something over, or receiving it',
    misread:
      'swapped for a pointing hand when the sender wants to show where something is, since both push the eye leftward and look similar at small sizes',
    uses: ['offering a ride or a seat to a friend', 'asking someone to pass the salt back'],
    contrast: {
      glyph: '🫱',
      title: 'Rightwards Hand',
      note: 'the two are mirror images that some keyboards swap, so the direction sent may not be the one shown',
    },
    toneLands: 'hands',
  },

  merperson: {
    base: 'merperson',
    title: 'Merperson',
    glyph: '🧜',
    depicts: 'a bare-chested figure with long hair and a green scaled tail',
    reads: 'bringing in an underwater, mermaid-themed mood',
    misread:
      'assumed to be a woman specifically when the glyph is deliberately gender-neutral, so the tail is the whole point and the chest is incidental',
    uses: ['starting a mermaid-themed pool party chat', 'tagging a beach photo with a sea theme'],
    contrast: {
      glyph: '🧝',
      title: 'Elf',
      note: 'the elf is a land creature with pointed ears, the merperson reads as ocean and swimming',
    },
    toneLands: 'person',
  },

  'older-woman': {
    base: 'older-woman',
    title: 'Old Woman',
    glyph: '👵',
    depicts: 'a small elderly figure with grey hair and round glasses',
    reads: 'referring to a grandmother, a matriarch, or a nagger',
    misread:
      'taken as a warm family joke when it is just as often a sideways jab about nagging or being told what to do, since the folded posture signals authority',
    uses: [
      'replying to a parent who is lecturing you',
      'tagging the grandmother who feeds everyone first',
    ],
    contrast: {
      glyph: '👴',
      title: 'Old Man',
      note: 'the old man reads as harmless and dotty, the old woman reads as sharp and unbothered',
    },
    toneLands: 'person',
  },

  'person-facepalming': {
    base: 'person-facepalming',
    title: 'Person Facepalming',
    glyph: '🤦',
    depicts: 'a figure with one hand slapped across the face',
    reads: 'expressing disbelief, embarrassment, or a slow burn',
    misread:
      'sent as genuine disappointment when it is usually self-directed, since a hand over your own face means you did it to yourself',
    uses: [
      'reacting to a typo in a message you sent',
      'replying to news you should have seen coming',
    ],
    contrast: {
      glyph: '🤷',
      title: 'Person Shrugging',
      note: 'the shrug spreads both palms and shrugs off blame, the facepalm covers the eyes and owns it',
    },
    toneLands: 'person',
  },

  'person-shrugging': {
    base: 'person-shrugging',
    title: 'Person Shrugging',
    glyph: '🤷',
    depicts: 'a figure with both arms raised, palms turned up',
    reads: 'saying nobody knows, or that it does not matter',
    misread:
      'mistaken for an apology when it usually refuses to take responsibility, since the palms-up gesture hands the problem back to the room',
    uses: [
      'answering a question you did not expect',
      'declining to take blame for a group decision',
    ],
    contrast: {
      glyph: '🤨',
      title: 'Face With Raised Eyebrow',
      note: 'the raised eyebrow questions one specific claim, the shrug questions everything and moves on',
    },
    toneLands: 'person',
  },

  'police-officer': {
    base: 'police-officer',
    title: 'Police Officer',
    glyph: '👮',
    depicts: 'a figure in a navy uniform with a peaked cap and radio',
    reads: 'calling for authority, a warning, or a traffic stop',
    misread:
      'played for comedy when the sender is actually asking someone to stop or to handle a problem, since the uniform looks more cartoonish than official',
    uses: ['telling a group chat to calm down', 'announcing you are about to enforce a rule'],
    contrast: {
      glyph: '👷',
      title: 'Construction Worker',
      note: 'the builder reads as manual work, the officer reads as authority and enforcement',
    },
    toneLands: 'person',
  },

  'raised-fist': {
    base: 'raised-fist',
    title: 'Raised Fist',
    glyph: '✊',
    depicts: 'a closed fist held up at shoulder height',
    reads: 'signaling solidarity, resistance, or determination',
    misread:
      'taken for a generic hype or go-for-it fist when the raised knuckle line is political and often landed on protest and mutual aid',
    uses: [
      'posting a solidarity message after a news event',
      'signing off a team win announcement',
    ],
    contrast: {
      glyph: '👍',
      title: 'Thumbs Up',
      note: 'the thumbs up approves and moves on, the raised fist commits and resists',
    },
    toneLands: 'hands',
  },

  selfie: {
    base: 'selfie',
    title: 'Selfie',
    glyph: '🤳',
    depicts: "a hand holding a phone out at arm's length",
    reads: 'marking a photo moment, a pose, or a check-in',
    misread:
      'taken as pure vanity when it usually marks a performance for the camera, because the outstretched arm is the pose being documented',
    uses: ['captioning a photo you just took', 'replying to a friend asking for a pic'],
    contrast: {
      glyph: '📱',
      title: 'Mobile Phone',
      note: 'the phone alone is the device, the selfie hand shows someone holding it out to frame a shot',
    },
    toneLands: 'hands',
  },

  'veil-person': {
    base: 'veil-person',
    title: 'Person with Veil',
    glyph: '👰',
    depicts: 'a smiling figure in a white veil and gown',
    reads: 'marking a wedding, a bride, or a big day',
    misread:
      'read as a literal bride when it is often a stand-in for the person getting married, since the veil carries the whole event in one glyph',
    uses: ['announcing an engagement or wedding date', 'replying to a bridesmaid photo'],
    contrast: {
      glyph: '🧕',
      title: 'Woman with Headscarf',
      note: 'the headscarf covers for faith and modesty, the veil is tied to a wedding',
    },
    toneLands: 'person',
  },

  'writing-hand': {
    base: 'writing-hand',
    title: 'Writing Hand',
    glyph: '✍️',
    depicts: 'a hand holding a pen and writing on a page',
    reads: 'signing off, drafting, or noting something down',
    misread:
      'taken for a literal signature when it is usually the sign-off glyph for any post, because a pen standing in for a signature reads as personal and formal',
    uses: ['signing off a note or a letter', 'saying you are drafting a reply'],
    contrast: {
      glyph: '📝',
      title: 'Memo',
      note: 'the memo shows a pen and paper with no hand, so no skin tone lands on it',
    },
    toneLands: 'hands',
  },
};
