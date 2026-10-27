/**
 * Family profiles — part 06.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part06: Record<string, FamilyProfile> = {
  'backhand-index-pointing-right': {
    base: 'backhand-index-pointing-right',
    title: 'Backhand Index Pointing Right',
    glyph: '👉',
    depicts: 'a hand with the index finger extended, pointing right with the palm turned inward',
    reads: 'directing attention at something beside you',
    misread:
      'taken as an accusation when it is nearly always a nudge toward a link, a name, or a person — the sideways orientation makes it feel less pointed than a face-on finger',
    uses: [
      'linking to the article someone just posted',
      'pointing out the person who should answer this',
    ],
    contrast: {
      glyph: '🫵',
      title: 'Index Pointing at the Viewer',
      note: 'the viewer-facing finger reads as pointing at you, the rightward one reads as pointing at something off-screen',
    },
    toneLands: 'hands',
  },

  clapping: {
    base: 'clapping',
    title: 'Clapping Hands',
    glyph: '👏',
    depicts: 'two hands meeting at the wrist, short motion lines at the sides',
    reads: 'applauding, or marking that a thing deserves notice',
    misread:
      'assumed to be sincere applause when the single-emoji version is more often ironic applause — praise for something everyone knows was a mess, and a lone clap gives it away',
    uses: ['congratulating someone on a win', 'reacting to a post that deserves a slow clap'],
    contrast: {
      glyph: '🙌',
      title: 'Raising Hands',
      note: 'raised hands read as celebration and relief, clapping hands read as judgment or acknowledgement of something just shown',
    },
    toneLands: 'both-hands',
  },

  'ear-hearing': {
    base: 'ear-hearing',
    title: 'Ear with Hearing Aid',
    glyph: '🦻',
    depicts: 'a side view of an ear with a small hearing aid hooked behind it',
    reads: 'marking careful listening, or the hearing aid itself',
    misread:
      'used casually for "I am listening" by people who have no hearing aid, which drains the access meaning it was added for — the aid is a specific prop, not a symbol for attention',
    uses: ['saying you are listening properly now', 'marking deaf awareness or hearing aid use'],
    contrast: {
      glyph: '👂',
      title: 'Ear',
      note: 'the plain ear is a body part, the hearing aid version carries disability context and support',
    },
    toneLands: 'body',
    toneTarget: 'ear',
  },

  'flexed-biceps': {
    base: 'flexed-biceps',
    title: 'Flexed Biceps',
    glyph: '💪',
    depicts: 'a bent arm held up with the fist clenched, bicep tensed',
    reads: 'signalling strength, effort, or encouragement',
    misread:
      'taken for a claim about physical strength when it is nearly always used as a joke or a pep talk, sometimes from a person who has never lifted anything',
    uses: ['encouraging a friend before a hard task', 'joking about your own gym streak'],
    contrast: {
      glyph: '🦾',
      title: 'Mechanical Arm',
      note: 'the mechanical arm reads as prosthetic or sci-fi strength, the bicep reads as ordinary human effort',
    },
    toneLands: 'hands',
  },

  handshake: {
    base: 'handshake',
    title: 'Handshake',
    glyph: '🤝',
    depicts: 'two hands clasped together, one reaching in from each side',
    reads: 'marking a deal, an agreement, or a truce',
    misread:
      'assumed to mean the parties are close, when most often it just closes a negotiation without ceremony — in group chats it is also used to end an argument rather than celebrate one',
    uses: ['closing a deal with a client', 'signalling a truce after a group argument'],
    contrast: {
      glyph: '💼',
      title: 'Briefcase',
      note: 'the handshake closes the deal in the air, the briefcase stands for the contract and the money behind it',
    },
    toneLands: 'hands',
  },

  'lotus-position': {
    base: 'lotus-position',
    title: 'Person in Lotus Position',
    glyph: '🧘',
    depicts: 'a figure seated cross-legged with hands resting on the knees',
    reads: 'marking a pause for calm, rest, or balance',
    misread:
      'read as a wellness-ritual stamp when it is more often just a way of saying "stepping away for a moment" — the seated figure gets borrowed for breaks and screen-time excuses',
    uses: ['signing off before a long break', 'marking a pause between meetings'],
    contrast: {
      glyph: '🧎',
      title: 'Person Kneeling',
      note: 'kneeling reads as respect or submission, the lotus sits level and suggests calm instead of hierarchy',
    },
    toneLands: 'person',
  },

  'mountain-biker': {
    base: 'mountain-biker',
    title: 'Person Mountain Biking',
    glyph: '🚵',
    depicts: 'a figure on a knobby-tired bicycle, riding over uneven ground',
    reads: 'marking trail riding, weekends, or a hard climb',
    misread:
      'assumed to mean mountain biking as a sport when it is usually a stand-in for a weekend away from a city, a dusty commute, or an excuse to be outdoors',
    uses: ['planning a weekend off in the hills', 'bragging about a rough downhill run'],
    contrast: {
      glyph: '🏍️',
      title: 'Motorcycle',
      note: 'the motorbike reads speed and traffic, the mountain biker reads rough ground and no engine',
    },
    toneLands: 'person',
  },

  'palm-down': {
    base: 'palm-down',
    title: 'Palm Down Hand',
    glyph: '🫳',
    depicts: 'a single hand held flat with the palm facing the floor, fingers extended forward',
    reads: 'marking "go ahead" or asking a room to settle',
    misread:
      'read as the palm-up offering gesture because the two hands sit next to each other in every picker, so it gets sent when someone means to hand something over — the drawing shows the opposite',
    uses: ['letting someone else go first', 'asking a chat to stop spiralling'],
    contrast: {
      glyph: '🫴',
      title: 'Palm Up Hand',
      note: 'the palm-up hand reads as offering or receiving, the palm-down hand reads as pushing forward or holding things down',
    },
    toneLands: 'hands',
  },

  'person-gesturing-ok': {
    base: 'person-gesturing-ok',
    title: 'Person Gesturing OK',
    glyph: '🙆',
    depicts: 'a standing figure with one arm raised overhead making an O shape',
    reads: 'signalling all clear, approval, or celebration',
    misread:
      'taken as a cheerful "good" when it is more often "nothing to worry about" — the circle sits high above the head, so it reads as celebration rather than the low chest-level OK',
    uses: ['signing off that a plan is approved', 'celebrating a small win out loud'],
    contrast: {
      glyph: '👌',
      title: 'OK Hand',
      note: 'the small hand OK is a compact sign at chest level, the figure version raises the same circle overhead',
    },
    toneLands: 'person',
  },

  'person-tipping-hand': {
    base: 'person-tipping-hand',
    title: 'Person Tipping Hand',
    glyph: '💁',
    depicts: 'a figure with one palm turned up, arm out to the side',
    reads: 'offering a service, or shrugging off a problem',
    misread:
      'often taken for a friendly "what can I do for you" when it is deployed far more often as a sarcastic shrug at someone else being incompetent — the flat palm does the dismissing',
    uses: ['answering "how can I help" at work', 'dismissing a decision somebody else made'],
    contrast: {
      glyph: '🤷',
      title: 'Person Shrugging',
      note: 'the shrugging person raises both shoulders, the tipping hand pushes one palm outward in a service gesture',
    },
    toneLands: 'person',
  },

  prince: {
    base: 'prince',
    title: 'Prince',
    glyph: '🤴',
    depicts: 'a figure in a gold crown and a purple-trimmed cape',
    reads: 'calling someone royal, spoiled, or worth spoiling',
    misread:
      'read as a straightforward compliment about treating someone well, when the crown mostly registers as "spoiled" — the joke lands when a partner is being indulged far past what they earned',
    uses: ['spoiling a partner on a birthday', 'mocking a friend who is being pampered'],
    contrast: {
      glyph: '👑',
      title: 'Crown',
      note: 'the crown alone marks the royal thing, the prince adds a person wearing it and carries the spoiling joke',
    },
    toneLands: 'person',
  },

  'raising-hands': {
    base: 'raising-hands',
    title: 'Raising Hands',
    glyph: '🙌',
    depicts: 'two open hands raised high above the head, fingers spread',
    reads: 'marking celebration, relief, or praise',
    misread:
      'assumed to be shared joy when it is often posted as gratitude or as a plea for attention — with no context it usually means "look what happened" rather than applause',
    uses: [
      'announcing that a deadline slipped but survived',
      'celebrating a result you barely earned',
    ],
    contrast: {
      glyph: '🤲',
      title: 'Palms Up Together',
      note: 'palms up together read as prayer or offering, the raised hands read as noise and celebration',
    },
    toneLands: 'both-hands',
  },

  singer: {
    base: 'singer',
    title: 'Singer',
    glyph: '🧑‍🎤',
    depicts: 'a figure singing into a microphone with a headset mic',
    reads: 'marking performance, music taste, or karaoke night',
    misread:
      'taken for a professional stage performer when it is usually just someone announcing they are going to sing, which is why it shows up as a playful sign-off rather than as music talk',
    uses: ['signing off a voice note with a song', 'claiming the aux cord at a party'],
    contrast: {
      glyph: '🎤',
      title: 'Microphone',
      note: 'the microphone stands for the act itself, the singer adds a person doing it',
    },
    toneLands: 'person',
  },

  technologist: {
    base: 'technologist',
    title: 'Technologist',
    glyph: '🧑‍💻',
    depicts: 'a figure hunched over an open laptop, hands on the keyboard',
    reads: 'marking coding, deep work, or screen time',
    misread:
      'assumed to mean "I write code" when it is far more often a stand-in for "I am heads-down, do not disturb" — the laptop and the hunch say busy rather than skilled',
    uses: ['announcing a long afternoon of debugging', 'claiming a cafe table for a work block'],
    contrast: {
      glyph: '👨‍💻',
      title: 'Man Technologist',
      note: 'same pose, but the man-coded version is read as a stereotype, the neutral one as any colleague at a laptop',
    },
    toneLands: 'person',
  },

  'vulcan-salute': {
    base: 'vulcan-salute',
    title: 'Vulcan Salute',
    glyph: '🖖',
    depicts: 'a hand held up with the palm forward, fingers split between two and three',
    reads: 'signalling a Star Trek salute or sci-fi greeting',
    misread:
      'sent by people with no connection to Star Trek at all, as a generic "live long and prosper" sign-off, which is why it can read as obscure rather than as a reference',
    uses: [
      'signing off a message with a sci-fi flourish',
      'answering a salute someone else started',
    ],
    contrast: {
      glyph: '🖐️',
      title: 'Raised Hand',
      note: 'the plain raised hand reads as a stop or high five, the split fingers mark the salute',
    },
    toneLands: 'hands',
  },
};
