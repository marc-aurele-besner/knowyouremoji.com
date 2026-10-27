/**
 * Family profiles — part 03.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part03: Record<string, FamilyProfile> = {
  astronaut: {
    base: 'astronaut',
    title: 'Astronaut',
    glyph: '🧑‍🚀',
    depicts: 'a figure in a white spacesuit with a gold-visored helmet and a life-support pack',
    reads: 'going to the moon, literally or financially',
    misread:
      'assumed to be a genuine space reference when it is usually borrowed for crypto and stock hype, where the suit stands in for unrealistic upside',
    uses: [
      'calling a coin or a share price to the moon',
      'marking the launch of something wildly overhyped',
    ],
    contrast: {
      glyph: '🚀',
      title: 'Rocket',
      note: 'the rocket is the vehicle and the trip itself, the astronaut is the person flying and feeling it',
    },
    toneLands: 'person',
  },

  detective: {
    base: 'detective',
    title: 'Detective',
    glyph: '🕵️',
    depicts: 'a figure in a tan trench coat and fedora, peering with a magnifying glass',
    reads: 'looking into something, or acting like you are',
    misread:
      'often heard as an accusation of snooping when it is really a playful nod at harmless nosiness about a detail someone left out',
    uses: [
      'nudging a friend who omitted an interesting detail',
      'flagging a suspicious gap in a story',
    ],
    contrast: {
      glyph: '🥷',
      title: 'Ninja',
      note: 'the ninja implies stealth and threat, the detective implies curiosity and a magnifying glass',
    },
    toneLands: 'person',
  },

  firefighter: {
    base: 'firefighter',
    title: 'Firefighter',
    glyph: '🧑‍🚒',
    depicts: 'a figure in a yellow turnout coat with reflective bands and a red helmet',
    reads: 'rushing in to handle a crisis',
    misread:
      'taken as a compliment about bravery when it more often means someone is putting out your messes, one problem after another',
    uses: [
      "offering to fix a colleague's overdue mess",
      'summoning help when a deadline goes sideways',
    ],
    contrast: {
      glyph: '🚒',
      title: 'Fire Engine',
      note: 'the engine is the vehicle arriving, the firefighter is the person who does the work',
    },
    toneLands: 'person',
  },

  golfer: {
    base: 'golfer',
    title: 'Person Golfing',
    glyph: '🏌️',
    depicts: 'a figure mid-swing, club arced over the shoulder on a fairway',
    reads: 'playing golf, or making an awkward swing at something',
    misread:
      'mistaken for a calm country-club image when it is nearly always the setup for a joke about someone swinging at something and missing entirely',
    uses: [
      'teasing a friend for missing an easy shot',
      'marking a lazy day with nothing scheduled',
    ],
    contrast: {
      glyph: '⛳',
      title: 'Flag in Hole',
      note: 'the flag names the target and the scoring, the golfer names the person taking the swing',
    },
    toneLands: 'person',
  },

  juggling: {
    base: 'juggling',
    title: 'Person Juggling',
    glyph: '🤹',
    depicts: 'a figure with several balls suspended in the air above both hands',
    reads: 'keeping several things going at once',
    misread:
      'confused with a "doing it all" productivity boast, when it usually points the other way, at someone juggling too much and about to drop something',
    uses: ['announcing far too many tasks this week', 'showing a schedule finally slipping'],
    contrast: {
      glyph: '🎪',
      title: 'Circus Tent',
      note: 'the tent marks the venue and the spectacle, the juggler marks the person keeping it all up',
    },
    toneLands: 'person',
  },

  'mechanical-leg': {
    base: 'mechanical-leg',
    title: 'Mechanical Leg',
    glyph: '🦿',
    depicts: 'a metal prosthetic leg with jointed segments and a mechanical ankle',
    reads: 'pushing forward, or getting around a limitation',
    misread:
      'treated as a boast about being unstoppable when it is more often literal, marking a real prosthetic or an injury and the work of adapting to it',
    uses: [
      'saying you are getting back on your feet',
      'marking recovery after an injury or surgery',
    ],
    contrast: {
      glyph: '🦾',
      title: 'Mechanical Arm',
      note: 'the arm covers an upper-limb impairment, the leg covers walking and getting places on foot',
    },
    toneLands: 'object',
    toneTarget: 'leg',
  },

  'older-man': {
    base: 'older-man',
    title: 'Old Man',
    glyph: '👴',
    depicts: 'an older figure with swept grey hair and round spectacles',
    reads: 'grandfatherly, or a knowing old head',
    misread:
      'picked up as warm family nostalgia when it is just as often a way of claiming authority, borrowing the grandfather voice for advice nobody asked for',
    uses: ['quoting a piece of old-fashioned advice', 'calling someone a harmless old-timer'],
    contrast: {
      glyph: '👵',
      title: 'Old Woman',
      note: 'the two are near-identical apart from gender, and neither one is the neutral older-person emoji',
    },
    toneLands: 'person',
  },

  'person-crown': {
    base: 'person-crown',
    title: 'Person with Crown',
    glyph: '🫅',
    depicts: 'a figure wearing a small golden crown on top of the head',
    reads: 'claiming the top spot, often playfully',
    misread:
      'taken for a literal royal claim when it is mostly a joke about being number one, so the crown marks the bragging rather than any real status',
    uses: [
      'declaring yourself the best in the group chat',
      'marking a friendly winner of a small bet',
    ],
    contrast: {
      glyph: '👑',
      title: 'Crown',
      note: 'the crown is the prize itself, the crowned person is whoever is wearing it',
    },
    toneLands: 'person',
  },

  'person-running': {
    base: 'person-running',
    title: 'Person Running',
    glyph: '🏃',
    depicts: 'a figure in mid-stride, arms bent, moving across the frame',
    reads: 'rushing, hurrying, or getting away from something',
    misread:
      'read as fitness talk when it is usually about time, and about escape, since running is the fastest way out of a situation',
    uses: ['saying you are late to something', 'signalling a clean exit from a chat'],
    contrast: {
      glyph: '🚶',
      title: 'Person Walking',
      note: 'the walker is neutral and unhurried, the runner always carries speed or flight',
    },
    toneLands: 'person',
  },

  'pointing-up': {
    base: 'pointing-up',
    title: 'Index Pointing Up',
    glyph: '☝️',
    depicts: 'a hand with the index finger extended straight upward',
    reads: 'making a point, or calling for attention',
    misread:
      'heard as an aggressive "you" when it usually just flags that a point is coming, the finger lifts without aiming at anyone',
    uses: ['introducing the point you actually made', 'announcing the first item on a list'],
    contrast: {
      glyph: '👆',
      title: 'Backhand Index Pointing Up',
      note: 'the two are near mirrors of each other, and pickers swap them constantly with nobody noticing',
    },
    toneLands: 'hands',
  },

  'raised-back-hand': {
    base: 'raised-back-hand',
    title: 'Raised Back of Hand',
    glyph: '🤚',
    depicts: 'a hand held up with the back of it turned toward the reader, the knuckles showing',
    reads: 'showing empty hands, or waving without the warmth of a palm-forward wave',
    misread:
      'taken for the palm-forward raised hand because the two sit next to each other in every picker, so a hands-up gesture arrives as a greeting and a sign-off arrives as a high five',
    uses: [
      'answering an accusation with a clean pair of hands',
      'signing off from a thread you are done with',
    ],
    contrast: {
      glyph: '✋',
      title: 'Raised Hand',
      note: 'the palm-forward raised hand reads as a greeting or a high five, the turned one reads as hands-up or a sign-off',
    },
    toneLands: 'hands',
  },

  scientist: {
    base: 'scientist',
    title: 'Scientist',
    glyph: '🧑‍🔬',
    depicts: 'a figure in a white lab coat holding up a glass flask',
    reads: 'examining something closely, or explaining it',
    misread:
      'mistaken for a doctor or a teacher because of the coat and glasses, when it is nearly always a claim about doing the careful, methodical work',
    uses: ['announcing the results of a long test', 'explaining a process step by step'],
    contrast: {
      glyph: '👨‍⚕️',
      title: 'Man Health Worker',
      note: 'the health worker is a clinical stethoscope cue, the scientist is a flask and a lab coat',
    },
    toneLands: 'person',
  },

  surfer: {
    base: 'surfer',
    title: 'Person Surfing',
    glyph: '🏄',
    depicts: 'a figure standing sideways on a surfboard riding a breaking wave',
    reads: 'going with the flow, or chasing a big moment',
    misread:
      'taken for a laid-back beach holiday when it is really about a single committed ride, one wave and no interest in what happens after',
    uses: ['announcing you are leaving the group chat', 'signing off a difficult stretch of work'],
    contrast: {
      glyph: '🏊',
      title: 'Person Swimming',
      note: 'the swimmer is head-down exertion, the surfer is upright balance on something much faster',
    },
    toneLands: 'person',
  },

  vampire: {
    base: 'vampire',
    title: 'Vampire',
    glyph: '🧛',
    depicts: 'a pale figure with pointed fangs, dark hair, and a high black cape',
    reads: 'draining you dry, or a spooky costume mood',
    misread:
      'usually taken as a Halloween joke when it is really about taking more than you give back, and about people who are up much later than everyone else',
    uses: ['calling someone the office vampire', 'posting a late-night mood'],
    contrast: {
      glyph: '🧟',
      title: 'Zombie',
      note: 'the zombie is shambling and green, the vampire is composed and dressed for the night out',
    },
    toneLands: 'person',
  },

  wrestlers: {
    base: 'wrestlers',
    title: 'People Wrestling',
    glyph: '🤼',
    depicts: 'two figures locked in a hold, and a skin tone applied to both at once',
    reads: 'grappling with someone, or with a problem',
    misread:
      'taken as a friendly sporting bout when it is nearly always a stand-in for a messy dispute, two people locked together and nobody winning',
    uses: [
      'describing a heated argument you just had',
      'saying the workload is too much to handle',
    ],
    contrast: {
      glyph: '🥊',
      title: 'Boxing Glove',
      note: 'the glove is a single fighter and a punch, the pair is two bodies and a struggle',
    },
    toneLands: 'person',
  },
};
