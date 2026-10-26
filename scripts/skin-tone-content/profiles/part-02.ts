/**
 * Family profiles — part 02.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part02: Record<string, FamilyProfile> = {
  artist: {
    base: 'artist',
    title: 'Artist',
    glyph: '🧑‍🎨',
    depicts: "a figure holding a painter's palette and a brush, brush raised",
    reads: 'standing in for creative work or a creative persona',
    misread:
      'taken as a self-congratulatory badge when it is nearly always used as a signature for something specific, so the figure reads as the maker rather than the mood',
    uses: [
      'signing a post about a design or illustration',
      'marking a teammate as the one who built it',
    ],
    contrast: {
      glyph: '🎨',
      title: 'Artist Palette',
      note: 'the palette is the tool alone, the artist emoji adds the person who used it',
    },
    toneLands: 'person',
  },

  boy: {
    base: 'boy',
    title: 'Boy',
    glyph: '👦',
    depicts: 'a young boy with short hair and a plain shirt, facing forward',
    reads: 'signalling a younger brother, a kid, or playful youth',
    misread:
      'taken literally as a child when it is more often used to talk about a younger male friend, a brother, or a joke about behaving immaturely',
    uses: [
      'calling out a younger brother in a family photo',
      'naming the friend who acts the youngest in the group',
    ],
    contrast: {
      glyph: '👧',
      title: 'Girl',
      note: 'both are youth figures with similar proportions, but one codes male and the other female',
    },
    toneLands: 'person',
  },

  'deaf-person': {
    base: 'deaf-person',
    title: 'Deaf Person',
    glyph: '🧏',
    depicts: 'a figure with a hand cupped against the ear, head turned slightly',
    reads: 'flagging deafness, sign language, or a missed conversation',
    misread:
      'used as a mock "I cannot hear you" joke far more often than it acknowledges a real person, because the cupped ear reads as a cartoon of not listening',
    uses: [
      'naming a deaf creator or signer in a thread',
      'marking a video that has captions and sign language',
    ],
    contrast: {
      glyph: '🙉',
      title: 'Face With Hand Over Mouth',
      note: 'the covered mouth reads as shock or secrecy, the cupped ear reads as hearing or deafness',
    },
    toneLands: 'person',
  },

  fencing: {
    base: 'fencing',
    title: 'Person Fencing',
    glyph: '🤺',
    depicts: 'a figure in a mask lunging with a thin sabre extended forward',
    reads: 'marking a duel, a challenge, or a precise competition',
    misread:
      'read as a generic athletic emoji when the blade and mask point somewhere narrower, so it lands on formal competition and verbal sparring rather than exercise',
    uses: [
      'answering a challenge with a "touche" reply',
      'posting a score from a fencing tournament',
    ],
    contrast: {
      glyph: '🥋',
      title: 'Martial Arts',
      note: 'both show a low fighting stance, but the martial arts figure is bare-handed while the fencer holds a blade',
    },
    toneLands: 'person',
  },

  girl: {
    base: 'girl',
    title: 'Girl',
    glyph: '👧',
    depicts: 'a young girl with dark hair and a simple top, facing forward',
    reads: 'signalling a younger sister, a kid, or girlish playfulness',
    misread:
      'mistaken for a grown woman when the sender means a child, because the rounded face and small frame read as young rather than adult',
    uses: ['mentioning a younger sister in a family thread', 'marking a photo of kids at a party'],
    contrast: {
      glyph: '🧒',
      title: 'Child',
      note: 'the child glyph is a neutral kid, the girl adds a female read that also carries the school-age connotation',
    },
    toneLands: 'person',
  },

  'index-thumb-crossed': {
    base: 'index-thumb-crossed',
    title: 'Hand with Index Finger and Thumb Crossed',
    glyph: '🫰',
    depicts: 'a hand with the index finger and thumb crossed to form a tiny heart',
    reads: 'signalling a small, cute, low-key act of affection',
    misread:
      'read as a full romantic declaration when it is closer to a playful K-pop fan salute, since the gesture is tiny and looks more like a hand sign than a love note',
    uses: [
      'reacting to a K-pop idol comeback with quiet love',
      'signing off a friend photo with a mini heart',
    ],
    contrast: {
      glyph: '🤞',
      title: 'Crossed Fingers',
      note: 'crossed fingers mean luck or hope, the finger heart means affection and reads as deliberate',
    },
    toneLands: 'hands',
  },

  'mechanical-arm': {
    base: 'mechanical-arm',
    title: 'Mechanical Arm',
    glyph: '🦾',
    depicts: 'a segmented metal robotic arm ending in a mechanical hand',
    reads: 'signalling strength, cyborg capability, or a prosthetic limb',
    misread:
      'read as a superhero power fantasy when it is more often about hardware and access, so the metal arm lands on engineering rather than superhuman strength',
    uses: [
      'announcing a new prosthetic or assistive device',
      'joking a deadline is too much for one human arm',
    ],
    contrast: {
      glyph: '🦿',
      title: 'Mechanical Leg',
      note: 'the leg version reads as walking and mobility, the arm version reads as grip, tooling and upper-body work',
    },
    toneLands: 'object',
    toneTarget: 'arm',
  },

  'ok-hand': {
    base: 'ok-hand',
    title: 'OK Hand',
    glyph: '👌',
    depicts: 'a hand with thumb and index finger touching in a circle, three fingers up',
    reads: 'signalling approval, or that something is exactly right',
    misread:
      'treated as a friendlier thumbs-up when it is really a neutral approval mark, and in a few countries it doubles as a white-supremacist salute, which is why some people avoid it entirely',
    uses: ['approving a plan or a design tweak', 'answering a question with a quick all-good'],
    contrast: {
      glyph: '👍',
      title: 'Thumbs Up',
      note: 'the thumbs up is a blunt yes, the OK hand is a more polished all-good that people read as warmer',
    },
    toneLands: 'hands',
  },

  'person-bowing': {
    base: 'person-bowing',
    title: 'Person Bowing',
    glyph: '🙇',
    depicts: 'a figure bent forward at the waist in a deep bow',
    reads: 'apologising, thanking, or deferring to someone senior',
    misread:
      'read as a defeat or total collapse when it is usually a small courtesy, since the bowing pose carries humility rather than sadness',
    uses: [
      'apologising for a slow reply or a small mistake',
      'thanking someone who covered for you',
    ],
    contrast: {
      glyph: '🙏',
      title: 'Folded Hands',
      note: 'the folded hands say please or thanks in one quick tap, the bowing figure is a whole-body apology',
    },
    toneLands: 'person',
  },

  'person-raising-hand': {
    base: 'person-raising-hand',
    title: 'Person Raising Hand',
    glyph: '🙋',
    depicts: 'a figure with one arm raised high and an open hand',
    reads: 'volunteering, asking to speak, or claiming the win',
    misread:
      'read as a request for attention in a meeting when it is more often playful claiming in chat, so the raised hand marks eagerness rather than politeness',
    uses: [
      'claiming a task before anyone else volunteers',
      'answering a question with a raised hand',
    ],
    contrast: {
      glyph: '✋',
      title: 'Raised Hand',
      note: 'the raised hand is a stop or high-five signal, the full figure means volunteering and asking',
    },
    toneLands: 'person',
  },

  'pointing-down': {
    base: 'pointing-down',
    title: 'Backhand Index Pointing Down',
    glyph: '👇',
    depicts: 'a hand with the index finger extended straight down',
    reads: 'pointing the reader at something below',
    misread:
      'taken as pointing at the sender when it is almost always aimed at the content, because in a thread it sits above the link it introduces',
    uses: ['introducing a link under a tweet', 'telling people to check the comments'],
    contrast: {
      glyph: '👆',
      title: 'Backhand Index Pointing Up',
      note: 'the upward finger moves the conversation to the thread above, the downward one points at what comes next',
    },
    toneLands: 'hands',
  },

  'push-right': {
    base: 'push-right',
    title: 'Rightwards Pushing Hand',
    glyph: '🫸',
    depicts: 'a hand held flat with the palm pressing toward the right',
    reads: 'pushing forward, moving on, or shoving something away',
    misread:
      'read as a neutral directional cue when the force in the pose is dismissive, so people take it as "not my problem" rather than "next"',
    uses: ['dismissing a drama thread with a next', 'signalling a decision to move forward'],
    contrast: {
      glyph: '👉',
      title: 'Backhand Index Pointing Right',
      note: 'the pointing finger indicates a direction, the pushing hand adds force and usually means let it go',
    },
    toneLands: 'hands',
  },

  sauna: {
    base: 'sauna',
    title: 'Person in Steamy Room',
    glyph: '🧖',
    depicts: 'a figure with a towel wrapped around the head, steam rising around them',
    reads: 'signalling heat, overheating, or a spa break',
    misread:
      'taken as a calm wellness moment when it is nearly always a complaint about being too hot, because the towel and steam read as discomfort',
    uses: ['saying the meeting room is unbearably hot', 'posting a spa or sauna trip'],
    contrast: {
      glyph: '🧘',
      title: 'Person in Lotus Position',
      note: 'the lotus figure reads as calm and centred, the steaming figure reads as overwhelmed and overheating',
    },
    toneLands: 'person',
  },

  supervillain: {
    base: 'supervillain',
    title: 'Supervillain',
    glyph: '🦹',
    depicts: 'a grinning figure in a dark cape and mask, with a high collar',
    reads: 'performing villainy, mischief, or a villain era',
    misread:
      'taken literally as a threat when it is nearly always self-directed mockery, so the cape marks the sender as the bad one rather than anyone else',
    uses: [
      'announcing a villain era after a messy week',
      'playing the bad guy when plans fall through',
    ],
    contrast: {
      glyph: '🦸',
      title: 'Superhero',
      note: 'both have a cape and mask, but the superhero reads as virtuous and the grinning figure as gleefully bad',
    },
    toneLands: 'person',
  },

  'tuxedo-person': {
    base: 'tuxedo-person',
    title: 'Person in Tuxedo',
    glyph: '🤵',
    depicts: 'a figure in a black tuxedo with a bow tie and pocket square',
    reads: 'marking formal wear, a wedding, or a milestone',
    misread:
      'assumed to signal a marriage announcement when it is far more often used for any life upgrade, from a new job to a first apartment',
    uses: ['announcing a wedding or engagement', 'posting about a job offer or promotion'],
    contrast: {
      glyph: '🕴️',
      title: 'Person in Suit Levitating',
      note: 'the levitating suit is a suit with no visible person, the tuxedo figure shows who is wearing it',
    },
    toneLands: 'person',
  },

  woman: {
    base: 'woman',
    title: 'Woman',
    glyph: '👩',
    depicts: 'a woman with shoulder-length hair, shown from the chest up',
    reads: 'marking a female speaker or a group of women',
    misread:
      'used as a stand-in for "me" in a group chat, which turns a self-reference into a comment about women generally, and it also reads as a partner reference',
    uses: ['saying hi to a group chat of friends', 'quoting a woman in a story she told'],
    contrast: {
      glyph: '🧑',
      title: 'Person',
      note: 'the neutral person is used when gender is irrelevant, the woman is picked deliberately to signal the speaker',
    },
    toneLands: 'person',
  },
};
