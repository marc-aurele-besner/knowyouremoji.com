/**
 * Family profiles — part 01.
 *
 * One hand-authored profile per emoji family that ships skin-tone variants.
 * See `../types.ts` for the shape of a profile.
 */

import type { FamilyProfile } from '../types';

export const part01: Record<string, FamilyProfile> = {
  angel: {
    base: 'angel',
    title: 'Baby Angel',
    glyph: '👼',
    depicts: 'a small winged figure with a gold halo and a white robe',
    reads: 'an innocent, blessed, or "angel on earth" reference',
    misread:
      'taken as a sincere compliment when it is more often deployed ironically to mark a spectacular mess-up — the halo is doing sarcastic work',
    uses: [
      'teasing a friend who just dropped something in public',
      'signing off a good-news photo with a blessing',
    ],
    contrast: {
      glyph: '👻',
      title: 'Ghost',
      note: 'the ghost reads spooky or "just vanished", the angel reads sweet or ironic',
    },
    toneLands: 'person',
  },

  'call-me-hand': {
    base: 'call-me-hand',
    title: 'Call Me Hand',
    glyph: '🤙',
    depicts: 'a hand in profile with the thumb and little finger stretched apart',
    reads: 'asking to be called back, or signing off casual',
    misread:
      'taken for a hang-loose shaka or a generic chill cue, when the thumb and pinky are stretched to make a phone and the sign is literally asking to be called',
    uses: ['asking someone to ring you later', 'signing off a message with a laid-back flourish'],
    contrast: {
      glyph: '👌',
      title: 'OK Hand',
      note: 'the ok hand confirms approval or perfection, the call me hand only asks to be contacted',
    },
    toneLands: 'hands',
  },

  'crossed-fingers': {
    base: 'crossed-fingers',
    title: 'Crossed Fingers',
    glyph: '🤞',
    depicts: 'an upright hand with the index finger laid across the middle finger',
    reads: 'hoping for a good outcome, out loud',
    misread:
      'assumed to be a promise rather than a hedge, when the crossed fingers actually show the speaker doubting the outcome — the real sign is meant to be hidden behind the back',
    uses: ['wishing a friend luck before an exam', 'hedging that you think a plan will fail'],
    contrast: {
      glyph: '✌️',
      title: 'Victory Hand',
      note: 'the victory sign announces a win, the crossed fingers quietly hope for one — same two fingers, opposite claim',
    },
    toneLands: 'hands',
  },

  farmer: {
    base: 'farmer',
    title: 'Farmer',
    glyph: '🧑‍🌾',
    depicts: 'a head and shoulders with a sheaf of wheat rising behind them',
    reads: 'working the land, or grinding through a hard stretch',
    misread:
      'often mistaken for a literal job title, when the wheat usually stands in for the grind itself — someone hustling, grinding, or farming XP in a game',
    uses: ['grinding through a work backlog', 'announcing a game farming session'],
    contrast: {
      glyph: '👨‍🌾',
      title: 'Man Farmer',
      note: 'the gendered farmer pins the role to one man, the neutral farmer covers whoever is doing the work',
    },
    toneLands: 'person',
  },

  genie: {
    base: 'genie',
    title: 'Genie',
    glyph: '🧞',
    depicts: 'a purple-skinned figure with crossed arms, the lower body trailing into smoke',
    reads: 'granting a wish, or conjuring something impossible',
    misread:
      'understood as a magic helper who grants requests, when the figure more often works as a wish marker — pointing at the thing you want and hoping it appears',
    uses: [
      'making a wish about a result you want',
      'tagging someone as the one who fixes everything',
    ],
    contrast: {
      glyph: '🧙',
      title: 'Mage',
      note: 'the mage is a full human with a hat and staff, the genie is a torso trailing into smoke',
    },
    toneLands: 'person',
  },

  'index-pointing-you': {
    base: 'index-pointing-you',
    title: 'Index Pointing at the Viewer',
    glyph: '🫵',
    depicts: 'a foreshortened hand with the index finger extended straight at the reader',
    reads: 'singling you out, right now',
    misread:
      'often assumed to be an accusation or a call-out, when the finger is more often just grabbing attention — it points at whoever is reading, not at a fault',
    uses: ['calling out a friend who left a mess', 'tagging the person who owes you an answer'],
    contrast: {
      glyph: '☝️',
      title: 'Index Pointing Up',
      note: 'the up-pointing finger signals agreement or the number one, this one comes at you across the screen',
    },
    toneLands: 'hands',
  },

  man: {
    base: 'man',
    title: 'Man',
    glyph: '👨',
    depicts: 'a smiling man with short blond hair, cropped at the shoulders',
    reads: 'referring to a man, often a third party',
    misread:
      'used as a generic stand-in for a person, when the base emoji is explicitly male and a separate neutral option exists — a mismatch can quietly put words in the men’s mouths',
    uses: ['mentioning a friend, a dad, or a coworker', 'replying to a thread about a man'],
    contrast: {
      glyph: '🧑',
      title: 'Person',
      note: 'the neutral person covers anyone, the man emoji is one man and gets read as gendered by default',
    },
    toneLands: 'person',
  },

  nose: {
    base: 'nose',
    title: 'Nose',
    glyph: '👃',
    depicts: 'a bare nose with nostrils, floating with no face attached',
    reads: 'suspicion, or a sharp sense of smell',
    misread:
      'taken to mean a literal sniff or a smell, when the floating nose with no face is a stock cartoon for nosiness — the snooping-dog pose repurposed for people',
    uses: ['flagging that someone is being nosy', 'saying you can smell a lie coming'],
    contrast: {
      glyph: '🐽',
      title: 'Pig Nose',
      note: 'the pig snout is animal and comic, the human nose signals suspicion — people swap them for jokes about smell',
    },
    toneLands: 'body',
    toneTarget: 'nose',
  },

  'person-biking': {
    base: 'person-biking',
    title: 'Person Biking',
    glyph: '🚴',
    depicts: 'a helmeted rider in yellow shorts leaning forward over a road bike',
    reads: 'going for a ride, or logging the miles',
    misread:
      'interpreted as a fitness claim, when it mostly marks a ride that happened — a weekend out, a trip to the shop, the bike itself as a thing worth wanting',
    uses: ['announcing a weekend ride on a sunny day', 'adding the bike to a photo of the ride'],
    contrast: {
      glyph: '🚲',
      title: 'Bicycle',
      note: 'the bicycle shows the machine with nobody on it, the rider shows the person in motion',
    },
    toneLands: 'person',
  },

  'person-pouting': {
    base: 'person-pouting',
    title: 'Person Pouting',
    glyph: '🙎',
    depicts: 'a face with a downturned mouth and lowered brows, in a grey top',
    reads: 'annoyance, sulking, or mild disappointment',
    misread:
      'looks like an angry or hostile jab, when the drawn face is a pout — sulking, huffy, self-pitying — usually posted about your own bad luck rather than aimed at anyone',
    uses: ['sulking about a small inconvenience', 'showing you are put out by a delay'],
    contrast: {
      glyph: '☹️',
      title: 'Frowning Face',
      note: 'the plain frowning face is a cartoon symbol, the pouting person is a character with an actual mood',
    },
    toneLands: 'person',
  },

  'pinching-hand': {
    base: 'pinching-hand',
    title: 'Pinching Hand',
    glyph: '🤏',
    depicts: 'a hand in profile with the thumb and index finger held a hair apart',
    reads: 'a small amount, or something barely worth mentioning',
    misread:
      'taken literally as a measurement, when the pinch is really about scale and judgement — how little something is, how thin an excuse, how small the change was',
    uses: ['saying the repair was a tiny patch', 'asking for a small extra portion'],
    contrast: {
      glyph: '🤌',
      title: 'Pinched Fingers',
      note: 'the pinched fingers close completely with no gap, the pinching hand keeps a sliver of space between thumb and finger',
    },
    toneLands: 'hands',
  },

  'push-left': {
    base: 'push-left',
    title: 'Leftwards Pushing Hand',
    glyph: '🫷',
    depicts:
      'a flat hand in profile, fingers together, palm turned leftward as if shoving something aside',
    reads: 'pushing something away, or setting a boundary',
    misread:
      'mistaken for an aggressive swipe, when the palm-out pose is usually gentler than it looks — it redirects a conversation, sends something back, or closes a thread',
    uses: ['pushing a suggestion away in a group chat', 'telling a thread you are done with it'],
    contrast: {
      glyph: '🫸',
      title: 'Rightwards Pushing Hand',
      note: 'the leftwards hand moves things out of your path, the rightwards one shoves them toward the other person',
    },
    toneLands: 'hands',
  },

  santa: {
    base: 'santa',
    title: 'Santa Claus',
    glyph: '🎅',
    depicts: 'a bearded face under a red hat with white trim and a pom-pom',
    reads: 'gift-giving, Christmas cheer, or the year’s end',
    misread:
      'often read as a jolly, sincere Santa, when the beard and red hat mostly stand in for the gifts — the parcel, the surprise, or the friend who is not buying this year',
    uses: ['announcing a present for someone', 'signing off a holiday card'],
    contrast: {
      glyph: '🎄',
      title: 'Christmas Tree',
      note: 'the tree sets the holiday scene, Santa names the giver, so one marks the holiday and the other the presents',
    },
    toneLands: 'person',
  },

  superhero: {
    base: 'superhero',
    title: 'Superhero',
    glyph: '🦸',
    depicts: 'a masked figure in a red suit and purple cape, with a chest emblem',
    reads: 'being the one who fixes it, heroically or ironically',
    misread:
      'usually taken for a sincere compliment, when the cape and the chest mark are almost always self-applied — you are claiming to be the hero of your own small disaster',
    uses: ['announcing you handled a hard problem', 'signing off a messy project you saved'],
    contrast: {
      glyph: '🦹',
      title: 'Supervillain',
      note: 'the villain points the mask at someone else, the hero wears the same costume as a claim on itself',
    },
    toneLands: 'person',
  },

  troll: {
    base: 'troll',
    title: 'Troll',
    glyph: '🧌',
    depicts: 'a grey-blue creature with shaggy hair, small tusks, and a wooden staff',
    reads: 'griefing someone, or lurking in the replies',
    misread:
      'treated as the internet-troll joke, when it more often lands as the fantasy version of that behaviour — the tusks and the coarse face make it a character rather than a complaint',
    uses: ['griefing a friend mid-game', 'replying to bait with a deadpan troll face'],
    contrast: {
      glyph: '👹',
      title: 'Ogre',
      note: 'the ogre is a green giant with a club, the troll is grey-blue and tusked — same slot, different build',
    },
    toneLands: 'person',
  },

  'weight-lifter': {
    base: 'weight-lifter',
    title: 'Person Lifting Weights',
    glyph: '🏋️',
    depicts: 'a figure pressing a barbell overhead, in a white tank top and knee sleeves',
    reads: 'showing strength, or grinding at a hard task',
    misread:
      'usually taken to mean a workout, when it more often stands in for handling something heavy and unwieldy — a deadline, a workload, a decision you barely managed',
    uses: ['announcing you finally cleared a heavy task', 'bragging about a workout session'],
    contrast: {
      glyph: '🤼',
      title: 'People Wrestling',
      note: 'the wrestlers are two people locked together on the mat, the lifter is one person alone under a bar',
    },
    toneLands: 'person',
  },
};
