/**
 * FAQ and tag pools shared across all 250 combos.
 * FAQ pools are keyed by category; tag pools are keyed by family.
 * Generators sample without replacement within a single batch to defeat boilerplate.
 */

import type { EmojiComboCategoryName } from '../../src/types/combo';
import type { Family } from '../plan-batch-23-32';

export interface Faq {
  question: string;
  answer: string;
}

/** FAQ pool per category — ≥ 30 entries each, all paired with a category-relevant answer template. */
export const FAQ_POOL: Record<EmojiComboCategoryName, Faq[]> = {
  humor: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a humor-coded combo — the two emojis amplify each other so the joke lands harder than a single emoji could. Most senders use it to acknowledge something funny without writing a sentence about it.',
    },
    {
      question: 'Is {c} an inside joke?',
      answer:
        'Yes, often. {c} tends to accrue inside-coded use inside friend groups where the two emojis became a running bit. Outsiders can still read the humor, but the deepest reads are group-specific.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        '{c} can be flirty when it lands between people who are already flirting — the humor-coded cue is a natural cover for a softer come-on. In a regular thread it reads more funny than romantic.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        'From a friend, {c} usually reads as a laugh-coded reply. The sender is signaling that whatever you sent was worth a real reaction.',
    },
    {
      question: 'Does {c} ever mean something serious?',
      answer:
        'Rarely. The humor-coded register is the whole point of the combo — when it lands on serious news it usually reads as ironic or as a coping mechanism.',
    },
    {
      question: 'Is {c} cringe?',
      answer:
        '{c} is rarely cringe inside the right group. Outside it, the humor-coded cue can read as performative, especially in older or more formal channels.',
    },
    {
      question: 'Does {c} have a TikTok meaning?',
      answer:
        'On TikTok, {c} is a meme-coded two-emoji reaction that shows up on hyper-specific clips. The combo usually signals that the video is at peak chaos.',
    },
    {
      question: 'Is {c} considered Gen Z slang?',
      answer:
        '{c} is multigenerational, but the humor-coded fluency runs strongest in Gen Z and younger millennial chats. Older groups tend to read it as silly rather than clever.',
    },
    {
      question: 'What does {c} mean in group chats?',
      answer:
        'In group chats, {c} is a default reaction emoji — it shows up on takes that are funny without being mean, and on shared wins the group wants to celebrate together.',
    },
    {
      question: 'Is {c} passive-aggressive?',
      answer:
        '{c} can read passive-aggressive when used sarcastically. Without a wider message context the humor cue is sincere, but a single-line reply with the combo can mask a complaint.',
    },
    {
      question: 'What does {c} mean from a coworker?',
      answer:
        'From a coworker, {c} is usually light relief in a working thread. Save the bigger humor-coded emojis for friend-coded channels where the read lands naturally.',
    },
    {
      question: 'Is {c} an actual emoji combo?',
      answer:
        '{c} is a common two-emoji combo that shows up on every platform that supports both emojis. Older systems may render them side by side, but the combo reads the same.',
    },
    {
      question: 'Does {c} work on Instagram?',
      answer:
        'Yes — {c} shows up all over Instagram captions and comment threads. The humor cue pairs well with photo drops and meme replies.',
    },
    {
      question: 'Does {c} mean what I think it means?',
      answer:
        '{c} almost always means what the two emojis suggest. Confusion usually comes from misreading which emoji is doing the heavy work; reading the combo as a phrase helps.',
    },
    {
      question: 'Should I respond to {c} with another emoji?',
      answer:
        'Mirroring {c} with another emoji is fine for casual threads. A short sentence tends to land as more sincere, especially if the thread is about something important.',
    },
    {
      question: 'Is {c} a meme?',
      answer:
        'Yes — {c} sits inside a wider set of two-emoji combos the internet uses as meme-coded punctuation. The senders and recipients both know the cue is humor, not literal.',
    },
    {
      question: 'What if I do not get {c}?',
      answer:
        'If {c} lands and you do not know what to read into it, mirror it with a generic laugh emoji or ask. Most of the time the cue is benign.',
    },
    {
      question: 'Is {c} used to deflect?',
      answer:
        '{c} can be used to deflect a heavier moment by reframing it as a joke. Watch the surrounding message — if the lead-up was serious, the combo is doing deflection work.',
    },
    {
      question: 'Can {c} be sincere?',
      answer:
        '{c} is rarely fully sincere — the humor-coded register is too playful. For a sincere moment, reach for a single emoji or a sentence.',
    },
    {
      question: 'What does {c} mean on TikTok?',
      answer:
        'On TikTok, {c} is a reaction-coded two-emoji combo. It shows up under comment threads and captions for joke content where the joke needs a stamp.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        'In a tight team channel {c} is usually fine. In a wider org channel or in a customer-facing thread, swap to a softer emoji so the humor cue reads professional.',
    },
    {
      question: 'Does {c} have a hidden meaning?',
      answer:
        '{c} rarely has a hidden meaning. The humor cue is the read; if there is subtext, the surrounding message will signal it.',
    },
    {
      question: 'What does {c} mean in a family group?',
      answer:
        'In a family group chat, {c} lands as playful family-coded relief. The humor cue is usually a safe pick when a sibling or a parent shares something funny.',
    },
    {
      question: 'Is {c} still popular?',
      answer:
        '{c} is one of the more stable two-emoji reactions on social. The humor register has not aged out; if anything the combo has grown more common on reels and short-form video.',
    },
    {
      question: 'What does {c} mean from a guy?',
      answer:
        'From a guy, {c} reads the same as it does from anyone — the humor cue is universal. There is no gendered meaning to the combo.',
    },
    {
      question: 'What does {c} mean from a girl?',
      answer:
        'From a girl, {c} is the same universal humor cue. The combo reads the same regardless of who sends it.',
    },
    {
      question: 'Is {c} a positive combo?',
      answer:
        '{c} is usually positive. The humor cue is friendly by default, though it can tilt sarcastic depending on context.',
    },
    {
      question: 'How do I use {c} in a sentence?',
      answer:
        '{c} lands best as a stand-alone reaction at the end of a sentence or after a photo drop. Avoid stacking more emojis on top of it; the combo already says enough.',
    },
    {
      question: 'Can {c} be rude?',
      answer:
        '{c} is not inherently rude. The humor cue can mask a dig, but the sender usually has to write that out — the emojis alone are harmless.',
    },
    {
      question: 'Does {c} have a Discord meaning?',
      answer:
        "On Discord {c} shows up as a reaction in meme channels and friend-coded servers. The humor cue is part of the platform's standard react vocabulary.",
    },
  ],
  flirting: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is the flirting-coded version of "{name}" — it borrows the partner-coded cue from one emoji and the warmth-coded cue from the other, and the result lands as a softer come-on than either emoji alone.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        '{c} is flirty by design. The two emojis are picked specifically to communicate attraction, and the read is flirty on most platforms and in most threads.',
    },
    {
      question: 'What does {c} mean from a guy?',
      answer:
        'From a guy, {c} is a flirty reply — the partner-coded cue is usually aimed at a specific recipient. In tight group chats it can read as buddy energy, but DMs make the read obvious.',
    },
    {
      question: 'What does {c} mean from a girl?',
      answer:
        'From a girl, {c} is the same flirting-coded cue. There is no gendered reading — the combo reads as flirty regardless of who sends it.',
    },
    {
      question: 'Is {c} too forward?',
      answer:
        '{c} sits in the middle of the flirting scale. It is warmer than a single wink but cooler than a full kiss line, so it works for early dating conversations where the read should be soft.',
    },
    {
      question: 'How do you reply to {c}?',
      answer:
        'Mirror {c} with another flirty combo, a sentence that escalates the moment, or a single soft emoji that signals you are interested. The cleanest reply keeps the flirt-coded register.',
    },
    {
      question: 'Should I use {c} early in dating?',
      answer:
        'Yes, {c} lands well in early dating. The combo signals attraction without being so loud that it forces the recipient to define the relationship.',
    },
    {
      question: 'Is {c} appropriate for strangers?',
      answer:
        'Do not lead with {c} to a stranger. The flirting-coded cue read depends on rapport, and sending it cold can come across as a pick-up line rather than a moment.',
    },
    {
      question: 'What does {c} mean on Instagram?',
      answer:
        'On Instagram, {c} shows up in DMs and under flirty photo comments. The flirting cue reads best in 1:1 threads where the relationship is already on the flirted side.',
    },
    {
      question: 'Is {c} just a friend thing?',
      answer:
        '{c} is not just a friend thing. The combo is most common between two people who are already flirting, dating, or signaling attraction; in tight friend-only groups it can read as buddy energy.',
    },
    {
      question: 'Does {c} mean "I like you"?',
      answer:
        'Yes — {c} is the standard flirting-coded way of signaling that you find someone attractive. The combo is more intense than a single heart and softer than a confession.',
    },
    {
      question: 'What does {c} mean in a text?',
      answer:
        'In a text, {c} is a flirting-coded reply. It usually lands at the end of a sentence as a softener, or as a stand-alone reaction when the message above it already set up the moment.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        'Skip {c} in work channels. The flirting-coded cue is the wrong register for professional threads unless the relationship with the recipient is explicitly non-work.',
    },
    {
      question: 'Can {c} be friend-coded?',
      answer:
        '{c} can be friend-coded in a tight group where everyone uses flirt-coded emojis casually. Outside that context the read stays flirty.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the flirting-coded version of "{name}" — the partner-coded cue is paired with a warmth cue. {alt} reads more soft or more intense depending on which partner emoji is in the slot.',
    },
    {
      question: 'Should I send {c} on first date?',
      answer:
        '{c} lands well on or around a first date. It is louder than a sentence would be, but the flirt-coded register signals genuine interest without forcing a confession.',
    },
    {
      question: 'What does {c} mean when sent twice?',
      answer:
        'Sending {c} twice intensifies the flirt. It usually reads as "I really do mean it" and is best reserved for recipients who already escalated with you first.',
    },
    {
      question: 'Is {c} a green flag?',
      answer:
        '{c} is generally a green flag in a new connection — it signals attraction without pressure. Whether it stays a green flag depends on how the recipient reads the rest of the conversation.',
    },
    {
      question: 'Does {c} work for long-term partners?',
      answer:
        '{c} works across relationship stages, but it carries more weight in early dating. Long-term partners sometimes prefer a single heart emoji because the combo can read as performative.',
    },
    {
      question: 'What does {c} mean from an ex?',
      answer:
        'From an ex, {c} usually reads as a re-open coded signal. The flirting cue is rarely sent by accident, especially in a 1:1 thread.',
    },
    {
      question: 'Is {c} cringe?',
      answer:
        '{c} is rarely cringe. The flirting-coded register is universal across generations, and a well-timed {c} lands as sincere rather than try-hard.',
    },
    {
      question: 'What does {c} mean at the end of a sentence?',
      answer:
        'Sandwiching {c} at the end of a sentence softens the message. The combo reads as "this is what I mean and I mean it with warmth," which is the default flirting-coded closer.',
    },
    {
      question: 'Can {c} be a sign of interest?',
      answer:
        '{c} is one of the clearest signs of interest in emoji form. The two emojis are picked specifically to communicate attraction, which is why the read is consistent across platforms.',
    },
    {
      question: 'Is {c} flirty on TikTok?',
      answer:
        'On TikTok {c} shows up in comment threads, captions, and duet replies. The flirty register is the same as on iMessage — most viewers read the cue as sincere attraction.',
    },
    {
      question: 'What does {c} mean late at night?',
      answer:
        'Late-night {c} carries extra weight. The flirting cue plus the timing usually means the sender wants a response and is signaling it gently.',
    },
    {
      question: 'Is {c} a red flag?',
      answer:
        '{c} is not a red flag. Persistence despite a soft reply, or pairing the combo with explicit messages, would be — but the combo itself is harmless.',
    },
    {
      question: 'Does {c} mean love?',
      answer:
        '{c} sits between attraction and love. The flirting-coded cue is closer to attraction than to the deep-coded meaning of 💞 or 💕, so most readers treat it as soft-coded interest rather than love.',
    },
    {
      question: 'What does {c} mean from a stranger?',
      answer:
        'From a stranger, {c} usually reads as a pick-up line. The flirting-coded cue is risky when sent cold; most recipients will interpret it through that lens.',
    },
    {
      question: 'How do I make {c} land softer?',
      answer:
        'Wrap {c} in a sentence. "You\'re funny, I always notice that" plus {c} reads warmer than the combo alone.',
    },
    {
      question: 'Is {c} acceptable on a wedding invite?',
      answer:
        'No. Wedding-coded communication tends to be formal, and the flirting cue is the wrong register. Reach for a sentence and a single soft emoji.',
    },
  ],
  sarcasm: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a sarcasm-coded combo. The two emojis pair to make the read unmistakably ironic — the sender is signaling that whatever they said is meant to be taken sideways.',
    },
    {
      question: 'Is {c} rude?',
      answer:
        '{c} can be. The sarcasm-coded cue is a soft jab rather than a direct insult, but the read depends on the surrounding message and the relationship to the recipient.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        'From a friend {c} usually reads as banter. The sarcasm register is friendly-coded — it lands as a tease rather than a dig.',
    },
    {
      question: 'How do I reply to {c}?',
      answer:
        'Mirror {c} with a softer emoji or a sentence that acknowledges the sarcasm. Without context the safest read is "they\'re kidding" — mirror with another joke or play along.',
    },
    {
      question: 'Is {c} passive-aggressive?',
      answer:
        '{c} can be passive-aggressive when the sarcasm cue is masking a real complaint. Watch the lead-up; if the sender was annoyed before, the combo is doing sarcasm work on top of frustration.',
    },
    {
      question: 'What does {c} mean at work?',
      answer:
        'At work, {c} is risky. Sarcasm-coded emojis are easy to misread in text, especially across roles and seniority. Save them for tight team channels and avoid them in cross-functional threads.',
    },
    {
      question: 'Does {c} mean what it says?',
      answer:
        'No — {c} rarely means the literal reading. The sarcasm cue is the whole point: the sender is signaling that you should take the message sideways.',
    },
    {
      question: 'Is {c} Gen Z slang?',
      answer:
        '{c} is multigenerational but it sits heaviest with Gen Z and younger millennials. Older senders sometimes use it accidentally and mean it literally.',
    },
    {
      question: 'What does {c} mean on Instagram?',
      answer:
        'On Instagram, {c} punctuates snark-coded comment threads. The sarcasm register shows up under content the sender finds silly or off.',
    },
    {
      question: 'Is {c} mean?',
      answer:
        '{c} is not mean. The sarcasm-coded cue is a soft register; if you read it as mean, the sender probably layered extra text around the combo.',
    },
    {
      question: 'Does {c} work in family groups?',
      answer:
        'In family groups {c} works best when the family already uses sarcasm as love-coded banter. Otherwise it tends to misread.',
    },
    {
      question: 'What does {c} mean from a coworker?',
      answer:
        'From a coworker, {c} is light-coded office sarcasm. It can read as inside-coded humor in tight teams, but it does not always travel well in cross-team threads.',
    },
    {
      question: 'Should I use {c} in a work email?',
      answer:
        'Skip {c} in work emails. Sarcasm-coded emojis are too easily misread in long-form professional communication.',
    },
    {
      question: 'Is {c} an insult?',
      answer:
        '{c} is not a direct insult. The sarcasm-coded cue is a soft tease; if it lands as an insult, the sender usually wrote the lead-up that way.',
    },
    {
      question: 'What does {c} mean if I do not get sarcasm?',
      answer:
        'Mirror {c} with another joke emoji or a sentence like "ha, fair." Most senders will read the mismatch as polite confusion rather than offense.',
    },
    {
      question: 'Is {c} appropriate for a first date?',
      answer:
        '{c} can be appropriate for a first date if the vibe is already witty. Sending it cold can read as condescending rather than charming.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is sarcasm-coded "name" — the cue is ironic. {alt} carries a different register; check the second emoji to know which side the sarcasm leans toward.',
    },
    {
      question: 'Does {c} have a TikTok meaning?',
      answer:
        'On TikTok {c} shows up in comment threads as a snark-coded reaction. The sarcasm register is the same as on iMessage, just amplified by the audience.',
    },
    {
      question: 'Can {c} be affectionate?',
      answer:
        'Yes — sarcasm is a love language in a lot of friend-coded and partner-coded groups. The cue lands as warmth-coded teasing rather than aggressive.',
    },
    {
      question: 'Is {c} passive-aggressive on Slack?',
      answer:
        '{c} on Slack can read passive-aggressive. Slack is asynchronous, so sarcasm reads as sharper than in a real-time iMessage thread.',
    },
    {
      question: 'What does {c} mean when paired with a sentence?',
      answer:
        'When {c} follows a sentence, the combo turns the sentence ironic. The sender is signaling "the opposite is true" or "I am being dramatic on purpose."',
    },
    {
      question: 'How do I make sarcasm land clearly with {c}?',
      answer:
        'Pair {c} with a clear lead-up that sets the joke. Sarcasm-coded emojis work best when the surrounding message makes the irony obvious.',
    },
    {
      question: 'Is {c} ever sincere?',
      answer:
        'Rarely. The sarcasm-coded register is the whole point of the combo. For a sincere moment, swap to a single emoji or write a sentence.',
    },
    {
      question: 'What does {c} mean on a poster or meme?',
      answer:
        'On a poster {c} is a sarcastic stamp. The senders and viewers both know the cue is ironic, and the combo lives there permanently.',
    },
    {
      question: 'Should I send {c} to my boss?',
      answer:
        'Do not lead with {c} to a boss unless you have a tight rapport. Sarcasm-coded emojis are easy to misread upward.',
    },
    {
      question: 'Does {c} have a hidden meaning?',
      answer:
        '{c} does not have a hidden meaning. The sarcasm-coded cue is the surface read; deeper context comes from the message it sits next to.',
    },
    {
      question: 'Is {c} dead?',
      answer:
        '{c} is not dead. Sarcasm-coded emoji combos are stable across short-form video and chat; the register ages well.',
    },
    {
      question: 'What does {c} mean when sent by itself?',
      answer:
        'A solo {c} is a sarcasm-coded eyebrow raise. The combo is doing the work of a sentence on its own — the recipient is expected to read the irony without explanation.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        '{c} is rarely flirty on its own. Sarcasm-coded emojis can mask a tease between people who already flirt, but the combo is not a reliable flirting cue.',
    },
    {
      question: 'Does {c} work in cross-cultural chats?',
      answer:
        'Sometimes. Sarcasm-coded cues travel across cultures but tone varies. With non-native English speakers prefer a sentence so the irony lands.',
    },
  ],
  celebration: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a celebration-coded combo. The two emojis are picked specifically to mark a win, a milestone, or a moment the sender wants to punctuate with confetti energy.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        'From a friend, {c} reads as a win-coded reaction. The celebration cue travels well in 1:1 chats and group threads the moment the news is good.',
    },
    {
      question: 'What does {c} mean on Instagram?',
      answer:
        'On Instagram, {c} punctuates milestone posts — engagements, promotions, baby announcements, exam results. The celebration register is louder than a single 🎉.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        '{c} is appropriate for tight team channels. For wider org comms, swap to a single 🎉 or a sentence so the celebration-coded energy lands professional.',
    },
    {
      question: 'What does {c} mean from a coworker?',
      answer:
        'From a coworker, {c} is team-coded celebration. The combo is a safe pick when something shipped, landed, or got signed off.',
    },
    {
      question: 'Is {c} over the top?',
      answer:
        '{c} is loud by design. For tiny wins reach for a single emoji; for big moments reach for the combo.',
    },
    {
      question: 'Should I use {c} for small wins?',
      answer:
        'For small wins {c} is too loud. Use a single 🎉 or 🙌; save the full combo for moments that genuinely earned confetti.',
    },
    {
      question: 'What does {c} mean on a birthday?',
      answer:
        'On a birthday {c} is the default celebration-coded reaction. The combo lands under any happy-anniversary thread.',
    },
    {
      question: 'Is {c} wedding appropriate?',
      answer:
        'Yes — {c} pairs well with wedding-coded posts. The celebration register matches the moment without forcing additional context.',
    },
    {
      question: 'What does {c} mean in family chats?',
      answer:
        'In family chats, {c} shows up on graduations, promotions, and grandkid reveals. The celebration register is universal across generations.',
    },
    {
      question: 'Does {c} work on TikTok?',
      answer:
        "On TikTok {c} punctuates reveal videos and milestone clips. The celebration cue matches the platform's hype-coded rhythm.",
    },
    {
      question: 'Is {c} passive-aggressive?',
      answer:
        'No — {c} is unambiguous in its celebration-coded register. A sender who wants to be passive-aggressive will write the sarcasm separately.',
    },
    {
      question: 'Should I send {c} on a wedding?',
      answer:
        'Yes. {c} is the right register for wedding-coded moments. The combo lands on Instagram posts, comment threads, and DM threads alike.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the celebration-coded "name" — louder and more emphatic. {alt} is a softer celebration reaction; reach for it when the moment is small.',
    },
    {
      question: 'Does {c} have a hidden meaning?',
      answer:
        '{c} rarely has hidden meaning. The celebration-coded cue is the read; any subtext has to come from the surrounding message.',
    },
    {
      question: 'What does {c} mean on graduation?',
      answer:
        'On graduation {c} is the default celebration reaction. The combo carries enough weight for the card, the post, and the comment thread.',
    },
    {
      question: 'Is {c} Gen Z slang?',
      answer:
        '{c} is multigenerational. The celebration register is universal — the cue does not depend on age-coded slang to land.',
    },
    {
      question: 'What does {c} mean in a relationship?',
      answer:
        'In a relationship {c} is shared joy. The combo reads as "we did that" or "this is us" and lands on milestone announcements.',
    },
    {
      question: 'Can {c} be sarcastic?',
      answer:
        '{c} is rarely sarcastic. The celebration-coded register is too upbeat to mask real sarcasm; if the irony is the point, the lead-up will tell you.',
    },
    {
      question: 'Should I send {c} on a new baby?',
      answer:
        'Yes. {c} is exactly the register for new-baby-coded moments. The combo lands on announcements, photos, and family group chats.',
    },
    {
      question: 'Is {c} acceptable for a funeral?',
      answer:
        'No. Skip {c} on funerals and sympathy-coded moments. The celebration register is the wrong tone for grief.',
    },
    {
      question: 'What does {c} mean to my partner?',
      answer:
        'To a partner, {c} is shared celebration. The combo reads as "look at us" and lands on shared wins.',
    },
    {
      question: 'Does {c} work for small wins?',
      answer:
        'For small wins {c} reads as too loud. Reach for a single emoji and save the combo for moments that genuinely earned confetti.',
    },
    {
      question: 'What does {c} mean from a stranger?',
      answer:
        'From a stranger {c} reads as genuine celebration of a public post. The combo is the same on comment sections regardless of relationship.',
    },
    {
      question: 'Is {c} cringe on LinkedIn?',
      answer:
        'On LinkedIn {c} often reads as performative. Skip the loud celebration register there; reach for a sentence or a single soft emoji.',
    },
    {
      question: 'How do I reply to {c}?',
      answer:
        'Mirror {c} with another emoji or a sentence that joins the celebration energy. The cleanest reply keeps the registered tone.',
    },
    {
      question: 'What does {c} mean on New Year?',
      answer:
        'On New Year, {c} is exactly the register. The celebration cue matches the midnight-coded moment without needing extra context.',
    },
    {
      question: 'Does {c} work on Twitter?',
      answer:
        'On Twitter, {c} punctuates milestone tweets and announcement threads. The celebration register is the same as on iMessage.',
    },
    {
      question: 'Should I send {c} to family?',
      answer:
        'Yes. {c} is family-appropriate across generations — grandparents and cousins alike read it the same way.',
    },
    {
      question: 'What does {c} mean on Discord?',
      answer:
        'On Discord, {c} punctuates reaction threads in community channels. The celebration-coded cue reads the same on Discord as on iMessage.',
    },
  ],
  emotion: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is an emotion-coded combo. The two emojis are picked to land a feeling the sender cannot put in a sentence — usually something softer or bigger than a single emoji would carry.',
    },
    {
      question: 'Is {c} sad?',
      answer:
        'Sometimes. The emotion-coded cue can land sad-coded when paired with tear or heart emojis; in other pairings the read is tender or warm.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        '{c} is rarely flirty. The emotion-coded register is broader than flirting; most readers pull warmth or vulnerability rather than attraction.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        'From a friend {c} reads as a feeling-coded share. The sender is trusting the recipient to read the emotion rather than parsing the words.',
    },
    {
      question: 'Does {c} have a TikTok meaning?',
      answer:
        'On TikTok {c} shows up under emotional clips and reveal videos. The emotion-coded cue works as a softener on heavier content.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        'Emotion-coded combos are tough to land in work channels. Save {c} for tight team conversations; in cross-functional threads prefer a sentence.',
    },
    {
      question: 'What does {c} mean on Instagram?',
      answer:
        'On Instagram {c} punctuates soft-coded captions and stories. The emotion register shows up on life-event posts the sender wants marked with feeling.',
    },
    {
      question: 'Can {c} be romantic?',
      answer:
        '{c} can read romantic when sent by a partner. The emotion-coded cue tends to land tender-coded rather than flirty; the read depends on the relationship.',
    },
    {
      question: 'Should I reply to {c} with another emoji?',
      answer:
        'Mirroring {c} is fine for casual threads. For deeper emotional moments, a short sentence that acknowledges the feeling lands as more sincere.',
    },
    {
      question: 'What does {c} mean late at night?',
      answer:
        'Late-night {c} usually signals a real feeling. The emotion-coded cue paired with the timing tends to land as more sincere than during the day.',
    },
    {
      question: 'Is {c} ever sarcastic?',
      answer:
        'Rarely. The emotion-coded register is sincere by default; sarcasm rarely layers on top of an emoji combo that already reads as feeling.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the emotion-coded "name" — the cue is tender. {alt} carries a different register; check the partner emoji to read the exact shade.',
    },
    {
      question: 'Does {c} mean love?',
      answer:
        'Sometimes. Emotion-coded combos tend to lean toward love-coded when the heart or sparkle is involved; otherwise the read is broader.',
    },
    {
      question: 'Can {c} be used for sympathy?',
      answer:
        'Yes — {c} works for sympathy-coded moments when the partner emoji is a heart or a tear. For heavier grief, prefer a sentence.',
    },
    {
      question: 'Is {c} an expression of gratitude?',
      answer:
        'Sometimes. Emotion-coded pairs with the sparkle or heart partner can read as "thank you" without writing it out.',
    },
    {
      question: 'What does {c} mean from a coworker?',
      answer:
        'From a coworker {c} is emotional-coded and risks being too personal in a working channel. Save it for tight collaborators.',
    },
    {
      question: 'Should I send {c} to my partner?',
      answer:
        'Yes. {c} is exactly the register for partner-coded emotional shares — the combo lands tender-coded without forcing a confession.',
    },
    {
      question: 'Does {c} have a generational meaning?',
      answer:
        'Emotion-coded reads are consistent across generations, but Gen Z tends to reach for the combos more often than older groups.',
    },
    {
      question: 'What does {c} mean if I cannot meet up?',
      answer:
        'When {c} is sent in a missed-meeting context, the combo reads as a soft-coded "I wish I was there." It lands tender-coded rather than accusatory.',
    },
    {
      question: 'Is {c} a green flag?',
      answer:
        '{c} is generally a green flag — the sender is signaling they want to share a feeling rather than perform a reaction.',
    },
    {
      question: 'What does {c} mean in a relationship?',
      answer:
        'In a relationship {c} is the default tender-coded reaction. The combo softens bigger messages and stands in for the things the sender cannot write.',
    },
    {
      question: 'Can {c} be too much?',
      answer:
        '{c} can read as overly intense when paired with high-volume partner emojis. For softer moments, swap to a single emoji.',
    },
    {
      question: 'Does {c} work in a family group?',
      answer:
        'Yes — {c} travels well in family-coded groups when the recipient already reads the emotion-coded register.',
    },
    {
      question: 'What does {c} mean from a stranger?',
      answer:
        'From a stranger {c} reads as warm-coded but slightly off. The emotion register is intimate; recipients may read it as either kind or uninvited.',
    },
    {
      question: 'Is {c} passive-aggressive?',
      answer:
        'Rarely. The emotion-coded register is the wrong register for passive aggression; sarcasm-coded emojis are the usual vehicle for that.',
    },
    {
      question: 'What does {c} mean when sent twice?',
      answer:
        'Sending {c} twice intensifies the emotion-coded read. The combo lands with extra weight — usually reserved for sincere moments.',
    },
    {
      question: 'Does {c} age well?',
      answer:
        '{c} ages well. The emotion-coded register is universal across generations; the combos that survive ten years on emoji keyboards usually carry feeling-coded weight.',
    },
    {
      question: 'How do I make {c} land sincerely?',
      answer:
        'Pair {c} with a sentence that names the feeling. Pure emoji replies read lower-effort than text plus emoji.',
    },
    {
      question: 'What does {c} mean from an ex?',
      answer:
        'From an ex, {c} reads as a re-open coded signal. The emotion register is rarely sent by accident in a 1:1 thread.',
    },
    {
      question: 'Should I use {c} on TikTok?',
      answer:
        'Yes — {c} works on TikTok as a reaction-coded stamp on emotional clips. The emotion register travels across audiences.',
    },
  ],
  reaction: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a reaction-coded combo. The two emojis are picked to react to a specific moment — disbelief, laughter, shock, hype — more emphatically than a single emoji could.',
    },
    {
      question: 'How do I reply to {c}?',
      answer:
        'Mirror {c} with another reaction emoji or a sentence that joins the moment. The cleanest reply keeps the same intensity register.',
    },
    {
      question: 'Is {c} an insult?',
      answer:
        'No. {c} is reaction-coded rather than insult-coded. If the message lands as an insult, the surrounding text is doing the work.',
    },
    {
      question: 'What does {c} mean on TikTok?',
      answer:
        'On TikTok {c} shows up as a comment-section reaction. The reaction register is universal across audiences.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        'Reaction-coded emojis are appropriate in tight team channels. For wider org comms reach for a sentence so the read is unambiguous.',
    },
    {
      question: 'Does {c} have a hidden meaning?',
      answer:
        '{c} rarely has hidden meaning. The reaction-coded cue is the read; deeper context comes from the message it sits next to.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        '{c} is not flirty by default. The reaction register is broader than flirting; reach for flirt-coded combos when attraction is the point.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        'From a friend, {c} reads as a share-coded reaction. The sender is escalating their response because the moment deserves it.',
    },
    {
      question: 'Should I use {c} for small things?',
      answer:
        'For small things {c} reads as too loud. Reach for a single emoji; save the combo for moments that genuinely earned the reaction.',
    },
    {
      question: 'Can {c} be sarcastic?',
      answer:
        'Yes — reaction-coded pairs often carry sarcasm when the partner emoji is an angry or unimpressed face. Watch the lead-up.',
    },
    {
      question: 'What does {c} mean at work?',
      answer:
        'At work {c} is fine in tight teams. Across roles and seniority the reaction register can read as unprofessional; prefer sentences there.',
    },
    {
      question: 'Does {c} work in family chats?',
      answer:
        'Yes — {c} lands well in family chats when the recipient already understands reaction-coded cues.',
    },
    {
      question: 'Is {c} passive-aggressive?',
      answer:
        'Reaction-coded combos sometimes mask passive aggression. Watch the lead-up; if the sender was annoyed before, the emoji might be the residue.',
    },
    {
      question: 'What does {c} mean from an ex?',
      answer:
        'From an ex {c} can read either as reaction to a public post or as a re-open coded signal. The combo is ambiguous in a 1:1 thread.',
    },
    {
      question: 'Is {c} cringe?',
      answer:
        '{c} is rarely cringe inside the right group. Outside it the reaction register can read as performative.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the reaction-coded "name" — louder than a single emoji. {alt} carries a different register; check the partner emoji to read the precise shade.',
    },
    {
      question: 'Does {c} mean what I think?',
      answer:
        'Yes — {c} rarely misreads. The two emojis together make the cue explicit enough that confusion is unusual.',
    },
    {
      question: 'Should I use {c} in a complaint?',
      answer:
        '{c} can punctuate a complaint-coded message but rarely fixes one. Pair with text that names the issue so the reaction-coded emoji is reinforcement, not noise.',
    },
    {
      question: 'Is {c} Gen Z slang?',
      answer:
        '{c} is multigenerational but it sits heaviest in Gen Z and younger millennial chats. The reaction register is fluent across age groups.',
    },
    {
      question: 'What does {c} mean on Instagram?',
      answer:
        'On Instagram {c} punctuates reactions under photo drops and reel comments. The reaction register is the same as on iMessage.',
    },
    {
      question: 'Can {c} be sincere?',
      answer:
        'Yes — reaction-coded combos can be sincere when paired with a warm partner emoji. The read depends on context.',
    },
    {
      question: 'What does {c} mean if I do not reply?',
      answer:
        'If you do not reply to {c}, the combo usually stays a benign reaction. Senders rarely escalate over an unreplied reaction-coded emoji.',
    },
    {
      question: 'Is {c} awkward?',
      answer:
        '{c} can read awkward if it lands at the wrong moment. The reaction register is loud; matching it to the moment matters.',
    },
    {
      question: 'What does {c} mean on a group chat?',
      answer:
        'In a group chat {c} reads as a reaction-coded stamp. The combo usually means the sender is reacting to something specific in the thread above them.',
    },
    {
      question: 'Should I send {c} to my boss?',
      answer:
        'Do not lead with {c} to a boss. Reaction-coded emojis are easy to misread upward; prefer sentences or single soft emojis.',
    },
    {
      question: 'What does {c} mean from a stranger?',
      answer:
        'From a stranger {c} usually reads as a public-coded reaction. The combo is the same on comment sections regardless of relationship.',
    },
    {
      question: 'Is {c} passive-aggressive on Slack?',
      answer:
        '{c} on Slack can read passive-aggressive when the send timing is late or paired with crisp text. Slack is asynchronous, so reactions travel sharper.',
    },
    {
      question: 'Can I use {c} for sympathy?',
      answer:
        'For sympathy prefer heart or flower emojis. Reaction-coded combos read too loud for sympathy-coded moments.',
    },
    {
      question: 'What does {c} mean at the end of a sentence?',
      answer:
        'Sandwiching {c} at the end of a sentence amplifies the sentence. The combo reads as "yes, and I really mean it" without writing it out.',
    },
    {
      question: 'Is {c} ever ironic?',
      answer:
        'Yes — reaction-coded combos can flip ironic when paired with text that contradicts the cue. The combo does not always match the message.',
    },
  ],
  relationship: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a relationship-coded combo. The two emojis are picked to mark a moment between two people — partners, family, close friends — more clearly than a single heart emoji could.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        'Sometimes. {c} can read flirt-coded when it lands between two people who are already flirting; in other contexts the read is warmer than flirty.',
    },
    {
      question: 'What does {c} mean from a partner?',
      answer:
        'From a partner {c} reads as relationship-coded confirmation. The combo lands as shared warmth.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        'Skip {c} in cross-functional work channels. The relationship-coded register is intimate and reads off in professional threads unless the recipient already knows the sender well.',
    },
    {
      question: 'What does {c} mean on Instagram?',
      answer:
        'On Instagram {c} shows up under partner-coded posts and relationship announcements. The combo reads warm-coded for any audience.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the relationship-coded "name" — the cue is shared warmth. {alt} is a different register, usually softer or sharper than the relationship-coded default.',
    },
    {
      question: 'Does {c} have a TikTok meaning?',
      answer:
        'On TikTok {c} shows up under relationship reveals and partner-coded clips. The cue is the same as on iMessage.',
    },
    {
      question: 'Can {c} befriend-coded?',
      answer:
        '{c} can read friend-coded inside groups where friend-coded and relationship-coded cues blur. Outside that context the read stays relationship-coded.',
    },
    {
      question: 'What does {c} mean in a long-term relationship?',
      answer:
        'In a long-term relationship {c} is shared warmth. The combo lands as "this is us" or "look at this" without writing it out.',
    },
    {
      question: 'Should I use {c} for an engagement?',
      answer:
        'Yes — {c} is exactly the register for engagement-coded moments. The combo lands on the announcement and the comment thread alike.',
    },
    {
      question: 'Is {c} too forward for new dating?',
      answer:
        '{c} sits warm but soft for early dating. It is more intense than a single heart, but the read does not force a confession the way a kiss line would.',
    },
    {
      question: 'What does {c} mean from a family member?',
      answer:
        'From a family member {c} reads as family-coded warmth. The combo lands tender-coded rather than romantic.',
    },
    {
      question: 'Can {c} be passive-aggressive?',
      answer:
        '{c} is rarely passive-aggressive. The relationship-coded register is too warm to mask a dig.',
    },
    {
      question: 'Should I send {c} to my ex?',
      answer:
        'Skip {c} to an ex unless the relationship is explicitly amicable. The relationship-coded cue reads as a re-open coded signal.',
    },
    {
      question: 'What does {c} mean on a wedding post?',
      answer:
        'On a wedding post {c} is the right register. The combo lands on the announcement, the photo, and the comment thread alike.',
    },
    {
      question: 'Is {c} cringe on TikTok?',
      answer:
        '{c} is rarely cringe. Relationship-coded combos travel well across audiences on TikTok and tend to land as sincere.',
    },
    {
      question: 'Can {c} work for family?',
      answer:
        '{c} works for family-coded moments — birthdays, milestones, family news. The relationship register crosses romantic and family cues.',
    },
    {
      question: 'Does {c} age well?',
      answer:
        '{c} ages well. The relationship-coded register is universal across ages; the combo stays alive because the cue is durable.',
    },
    {
      question: 'What does {c} mean when sent twice?',
      answer:
        'Sending {c} twice intensifies the relationship-coded read. The combo lands with extra weight — usually reserved for genuine moments.',
    },
    {
      question: 'Is {c} ever sarcastic?',
      answer:
        'Rarely. The warm register is too soft to mask sarcasm; reach for sarcasm-coded combos when irony is the point.',
    },
    {
      question: 'What does {c} mean from a stranger?',
      answer:
        'From a stranger {c} is rare and reads as intimate. The relationship-coded register usually means the sender wants the recipient to read warmth into the message.',
    },
    {
      question: 'Should I use {c} on an anniversary?',
      answer:
        'Yes — {c} is exactly the register for anniversary-coded moments. The combo lands shared-warmth without forcing additional context.',
    },
    {
      question: 'Is {c} only romantic?',
      answer:
        '{c} is not only romantic. The relationship-coded register crosses romantic, family, and friend-coded moments depending on the relationship to the recipient.',
    },
    {
      question: 'What does {c} mean at the end of a sentence?',
      answer:
        'Sandwiching {c} at the end of a sentence softens the message. The combo reads as "this is what I mean and I mean it warmly."',
    },
    {
      question: 'Does {c} work on a meme?',
      answer:
        '{c} works on a meme when the meme is soft-coded. The relationship register puns well with wholesome-coded content.',
    },
    {
      question: 'Should I use {c} on Twitter?',
      answer:
        '{c} lands on Twitter relationship-coded threads. The combo reads warm-coded for any audience the tweet reaches.',
    },
    {
      question: 'What does {c} mean on a birthday?',
      answer:
        'On a birthday {c} is the default relationship-coded reaction. The combo lands under birthday posts and DM threads alike.',
    },
    {
      question: 'Can {c} be used in business?',
      answer:
        'Skip {c} in business contexts. The relationship-coded register is too intimate for a cross-functional email.',
    },
    {
      question: 'Does {c} work in a family group chat?',
      answer:
        '{c} works in a family group chat — the relationship register crosses romantic and family cues, so the same combo signals "love you" across ages.',
    },
    {
      question: 'What does {c} mean from a coworker you like?',
      answer:
        'From a coworker you like {c} can be a soft-coded signal. The relationship register sits warm enough to flag interest without forcing a confession.',
    },
  ],
  work: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a work-coded combo. The two emojis are picked to mark a moment in professional life — shipped, signed, launched, scheduled — more cleanly than a single emoji could.',
    },
    {
      question: 'Is {c} appropriate for managers?',
      answer:
        'Yes — {c} lands well in tight team channels. For senior leaders or cross-functional comms, swap to a sentence so the read stays professional.',
    },
    {
      question: 'What does {c} mean in Slack?',
      answer:
        'On Slack {c} punctuates stand-up threads, milestone messages, and replies in working channels. The work-coded register is unambiguous in Slack.',
    },
    {
      question: 'Does {c} work on LinkedIn?',
      answer:
        'On LinkedIn {c} often reads as performative. Skip the loud work-coded register; reach for a sentence or a single soft emoji.',
    },
    {
      question: 'What does {c} mean from a coworker?',
      answer:
        'From a coworker {c} reads as a milestone reaction. The combo lands when something shipped, signed, or survived a meeting.',
    },
    {
      question: 'Is {c} cringe in work emails?',
      answer:
        'Yes — {c} reads as performative in long-form work emails. Save the combo for Slack/Discord-coded channels where emoji fluency is high.',
    },
    {
      question: 'Can {c} mean "launched"?',
      answer:
        'Often yes — {c} sits in the launch-coded register when the partner emojis are rocket, fire, or chart-up. The combo is shorthand for "this thing is live."',
    },
    {
      question: 'What does {c} mean in a standup?',
      answer:
        'In a standup {c} punctuates a finished task. The work-coded register matches the cadence of daily updates.',
    },
    {
      question: 'Is {c} appropriate for cross-team threads?',
      answer:
        'Skip {c} in cross-functional threads. The work-coded register can read as tone deaf for audiences outside the immediate team.',
    },
    {
      question: 'Does {c} work in customer-facing comms?',
      answer:
        'No — {c} reads as inside-coded in customer comms. Reach for a sentence or a single soft emoji to keep the register external.',
    },
    {
      question: 'What does {c} mean on a sprint review?',
      answer:
        'On a sprint review {c} punctuates a finished epic. The combo lands as team-coded celebration without forcing additional context.',
    },
    {
      question: 'Should I use {c} on a deadline day?',
      answer:
        'Use {c} lightly on deadline day — the work-coded register is celebration-coded and can read as premature before the deadline has passed.',
    },
    {
      question: 'Can {c} be passive-aggressive?',
      answer:
        'Sometimes. {c} sent after silence or paired with a clipped reply can read passive-aggressive. Watch the lead-up.',
    },
    {
      question: 'Is {c} condescending?',
      answer:
        '{c} can read condescending when sent to a more junior recipient. Reach for a sentence when the message needs empathy.',
    },
    {
      question: 'What does {c} mean at a status meeting?',
      answer:
        'At a status meeting {c} punctuates a status update. The combo is shorthand for "this got done."',
    },
    {
      question: 'Should I send {c} on a launch day?',
      answer:
        'Yes — {c} is exactly the register for launch day. The work-coded combo lands as team-coded celebration.',
    },
    {
      question: 'Does {c} work on Microsoft Teams?',
      answer:
        'On Teams {c} punctuates reaction posts in working channels. The register is the same as on Slack, though Teams users tend to default to softer emojis.',
    },
    {
      question: 'Is {c} appropriate for a boss?',
      answer:
        '{c} works for a boss when the team already uses emoji fluently. Otherwise reach for a sentence so the read stays professional.',
    },
    {
      question: 'What does {c} mean when paired with a sentence?',
      answer:
        'When {c} follows a sentence, the combo reinforces the work-coded message. The sender is signaling "this got done" without writing additional context.',
    },
    {
      question: 'Is {c} a green flag in a working thread?',
      answer:
        '{c} is generally a green flag — it signals that someone is signaling completion or progress without forcing additional context.',
    },
    {
      question: 'Does {c} work in async updates?',
      answer:
        'Yes — {c} works well in async updates. The combo amplifies a status-coded message across time zones without forcing follow-up text.',
    },
    {
      question: 'Should I send {c} to a recruiter?',
      answer:
        'Skip {c} with recruiters. The work-coded register is internal-team-coded; reach for a sentence in any external professional context.',
    },
    {
      question: 'Is {c} acceptable for meetings?',
      answer:
        'Avoid sending {c} during a meeting — reactions belong in the chat thread, not the live meeting window. Wait until the meeting ends.',
    },
    {
      question: 'What does {c} mean on a calendar invite?',
      answer:
        'On a calendar invite {c} can punctuate confirmation-coded replies. The work-coded register stays professional.',
    },
    {
      question: 'Should I send {c} on a Friday afternoon?',
      answer:
        '{c} lands fine on Friday afternoon — the work-coded register can punctuate a finished week without forcing extra context.',
    },
    {
      question: 'Is {c} appropriate for sales?',
      answer:
        '{c} lands in internal sales-coded channels. For customer comms reach for a single soft emoji.',
    },
    {
      question: 'What does {c} mean from a manager?',
      answer:
        'From a manager {c} reads as approval-coded or completion-coded reaction. The combo usually lands on something shipped or fixed.',
    },
    {
      question: 'Does {c} work in 1:1s?',
      answer:
        '{c} lands in 1:1 chats when the relationship is explicitly work-coded and emoji-friendly. Otherwise reach for a sentence in 1:1 channels.',
    },
    {
      question: 'Should I use {c} on a new project?',
      answer:
        'Yes — {c} punctuates new-project-coded moments. The combo lands as a clean stamp that signals "this is real."',
    },
    {
      question: 'What does {c} mean when sent late at night?',
      answer:
        'Late-night {c} reads as completion-coded work. The sender is wrapping up before signing off; mirror the energy or wish them rest.',
    },
  ],
  food: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a food-coded combo. The two emojis pair to set a scene — a meal, a drink, a snack — more vividly than a single emoji could.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        '{c} is rarely flirty. The food-coded register is about a meal or drink; reach for flirting-coded combos when attraction is the point.',
    },
    {
      question: 'What does {c} mean in a recipe?',
      answer:
        'On a recipe {c} punctuates ingredient lists and step photos. The food-coded cue anchors the visual.',
    },
    {
      question: 'Does {c} work on Instagram?',
      answer:
        'Yes — {c} is a staple of food-coded Instagram posts. The combo lands on photo drops and reel captions alike.',
    },
    {
      question: 'What does {c} mean in a dinner plan?',
      answer:
        'In a dinner plan {c} punctuates "let\'s eat" or "this is tonight." The food-coded register shortens the message.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        'Skip {c} in working channels. The food-coded register is domestic; reach for a sentence in work contexts.',
    },
    {
      question: 'What does {c} mean on TikTok?',
      answer:
        'On TikTok {c} shows up on food-coded clips and recipe reveals. The register is the same as on Instagram.',
    },
    {
      question: 'Can {c} mean "hungry"?',
      answer:
        'Often — {c} is shorthand for "I want that" or "I am hungry." The food-coded cue sends without the sender writing it out.',
    },
    {
      question: 'Does {c} work for restaurants?',
      answer:
        '{c} lands on restaurant recommendation-coded threads. The combo stays useful for tagging a meal someone loved.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the food-coded "name" — the cue is the meal. {alt} carries a different register; check the partner emoji to read the precise shade.',
    },
    {
      question: 'Should I use {c} for a coffee date?',
      answer:
        'Yes — {c} punctuates coffee-coded plans and chats. The food-coded register is exactly the right tone for casual hangs.',
    },
    {
      question: 'Can {c} be romantic?',
      answer:
        'Sometimes. Food-coded combos land romantic when paired with a heart or kiss partner emoji. The cue is usually the meal, but layered reads exist.',
    },
    {
      question: 'Is {c} cringe on a menu?',
      answer:
        '{c} can read as cute on a casual menu. For fine-dining-coded contexts, prefer words over the combo.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        'From a friend {c} reads as a meal-coded reaction. The sender is signaling appetite or appreciation.',
    },
    {
      question: 'Does {c} work for snacks?',
      answer:
        'Yes — {c} works for snack-coded moments. The combo lands on chips, candy, and casual foods alike.',
    },
    {
      question: 'Should I send {c} on a brunch?',
      answer:
        'Yes — {c} punctuates brunch-coded moments. The food-coded register is right for weekend hangs.',
    },
    {
      question: 'Is {c} acceptable for a wedding?',
      answer:
        '{c} can punctuate the wedding menu or food-coded moments. For the announcement itself prefer relationship-coded combos.',
    },
    {
      question: 'What does {c} mean on a holiday?',
      answer:
        'On a holiday {c} lands on feast-coded posts. The combo is shorthand for "this is the meal."',
    },
    {
      question: 'Does {c} work on a recipe blog?',
      answer:
        '{c} is a staple on recipe-coded content. The combo lands in titles and step captions.',
    },
    {
      question: 'Can {c} mean "drink"?',
      answer:
        'Often — {c} is shorthand for "let\'s drink" when the partner emoji is a beverage. Reach for it in coffee, beer, or wine-coded chats.',
    },
    {
      question: 'Is {c} Gen Z slang?',
      answer:
        '{c} is multigenerational. The food-coded register is fluent across ages; the cue is universal.',
    },
    {
      question: 'What does {c} mean from a coworker?',
      answer:
        'From a coworker {c} is lunch-coded or coffee-coded. The combo lands well in working channels for casual plans.',
    },
    {
      question: 'Does {c} age well?',
      answer:
        '{c} ages well. The food-coded register is universal across generations; combos that pin a meal or drink last for years.',
    },
    {
      question: 'Should I use {c} for breakfast?',
      answer:
        'Yes — {c} punctuates breakfast-coded moments. The combo lands on coffee runs and morning snacks.',
    },
    {
      question: 'Is {c} passive-aggressive?',
      answer:
        '{c} is rarely passive-aggressive. The food register is the wrong register for masking a complaint.',
    },
    {
      question: 'What does {c} mean in a date?',
      answer:
        'On a date {c} punctuates meal-coded moments. The combo signals appetite and appreciation without writing it out.',
    },
    {
      question: 'Can {c} be a thank-you?',
      answer:
        '{c} can punctuate a thank-you-coded message when paired with a sentence about the meal. The combo is reinforcement, not the whole thanks.',
    },
    {
      question: 'Does {c} work for cooking videos?',
      answer: "{c} lands on cooking-coded videos. The food register matches the platform's rhythm.",
    },
    {
      question: 'Should I send {c} on a vacation?',
      answer:
        'Yes — {c} punctuates vacation-coded food posts. The combo is shorthand for "I am eating well."',
    },
    {
      question: 'What does {c} mean on Thanksgiving?',
      answer:
        'On Thanksgiving {c} is the default food-coded reaction. The combo lands on family meal posts and food-coded stories.',
    },
  ],
  travel: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a travel-coded combo. The two emojis pair to set a journey-coded scene — arrival, departure, on the ground — more vividly than a single emoji could.',
    },
    {
      question: 'Is {c} a destination emoji?',
      answer:
        'Sometimes. Travel-coded combos can read as a destination shorthand when the partner emoji is a place or vehicle emoji.',
    },
    {
      question: 'What does {c} mean on Instagram?',
      answer:
        'On Instagram {c} punctuates vacation posts and travel-coded stories. The combo lands on flat-lays and travel reveal captions.',
    },
    {
      question: 'Does {c} mean "I am here"?',
      answer:
        'Often — {c} can read as a coded check-in. Travel-coded combos land well when someone arrives at a new place.',
    },
    {
      question: 'What does {c} mean at the airport?',
      answer:
        'At the airport {c} punctuates departures and arrivals. The combo lands in travel-day threads across platforms.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        'Skip {c} in working channels. The travel-coded register is informal; save the combo for personal threads or social-coded ones.',
    },
    {
      question: 'What does {c} mean on TikTok?',
      answer:
        'On TikTok {c} shows up on travel reveal clips and itinerary-coded reactions. The register is the same as on Instagram.',
    },
    {
      question: 'Can {c} work for a road trip?',
      answer:
        'Yes — {c} punctuates road-trip-coded chats. The combo matches both car and air travel-coded registers.',
    },
    {
      question: 'Does {c} mean a vacation?',
      answer:
        'Sometimes — {c} can read as vacation-coded shorthand when paired with a sun or beach partner emoji.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the travel-coded "name" — the cue is the journey. {alt} reads as a different register; check the partner emoji to read the precise shade.',
    },
    {
      question: 'Should I send {c} on a trip?',
      answer:
        'Yes — {c} punctuates trip-coded chats. The combo is shorthand for "I am on the way" or "I made it."',
    },
    {
      question: 'Is {c} a flex?',
      answer:
        'Sometimes. Travel-coded combos can read performative when paired with a luxury-coded partner emoji. Watch the lead-up.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        'From a friend {c} reads as a travel-coded share. The sender is signaling the journey, not the destination.',
    },
    {
      question: 'Does {c} work on Twitter?',
      answer:
        '{c} lands on Twitter travel-coded threads. The combo reads as departure or arrival shorthand.',
    },
    {
      question: 'Should I use {c} for a staycation?',
      answer:
        'Yes — {c} punctuates any travel-coded moment, including a staycation. The combo matches the register of "I am out."',
    },
    {
      question: 'Can {c} be inviting?',
      answer:
        'Yes — {c} can punctuate a coded invitation. Travel-coded combos land in chats where the sender wants to be invited along.',
    },
    {
      question: 'Is {c} Gen Z slang?',
      answer:
        '{c} is multigenerational, but it sits heaviest with Gen Z and younger millennial travel-coded chats.',
    },
    {
      question: 'What does {c} mean in a group chat?',
      answer:
        'In a group chat {c} reads as a travel-coded share. The sender is reporting on the journey from afar.',
    },
    {
      question: 'Does {c} mean a return?',
      answer:
        'Sometimes. Travel-coded combos land as "I made it back" when paired with home or arrival-coded partner emojis.',
    },
    {
      question: 'Should I send {c} when I land?',
      answer: 'Yes — {c} is exactly the register for landing-coded moments. The combo reads clean.',
    },
    {
      question: 'Is {c} acceptable for a layover?',
      answer:
        '{c} punctuates layover-coded moments but can read as too brief; prefer a sentence with a single soft emoji.',
    },
    {
      question: 'What does {c} mean on a wedding?',
      answer:
        'On a wedding {c} can punctuate destination-coded announcements, but for the announcement itself prefer relationship-coded combos.',
    },
    {
      question: 'Does {c} work for cruises?',
      answer:
        '{c} punctuates cruise-coded trips. The combo lands on boat or wave partner emoji slots.',
    },
    {
      question: 'Should I use {c} in a wedding hashtag?',
      answer:
        'Skip {c} in a wedding hashtag — the travel register is the wrong tone for wedding-coded moments.',
    },
    {
      question: 'Is {c} ever sarcastic?',
      answer:
        '{c} is rarely sarcastic. The travel-coded register is sincere by default; reach for sarcasm-coded combos when irony is the point.',
    },
    {
      question: 'What does {c} mean from a coworker?',
      answer:
        'From a coworker {c} is travel-coded or vacation-coded. The combo lands on out-of-office moments.',
    },
    {
      question: 'Does {c} work for adventure travel?',
      answer:
        '{c} punctuates adventure-coded trips. The combo reads as the journey, not the destination.',
    },
    {
      question: 'Can {c} be passive-aggressive?',
      answer:
        'Rarely. Travel-coded combos are sincere by default; reach for sarcasm-coded combos when masked complaint is the point.',
    },
    {
      question: 'What does {c} mean for a holiday?',
      answer:
        'On a holiday {c} punctuates holiday-coded trips. The combo matches weekend getaways, long weekends, and full vacations alike.',
    },
    {
      question: 'Should I use {c} in a postcard?',
      answer:
        'Skip {c} in physical postcards — emoji are difficult to reproduce there. The combo is for digital travel-coded moments.',
    },
  ],
  other: [
    {
      question: 'What does {c} mean?',
      answer:
        '{c} is a combo without a single category — it borrows from whatever register the two emojis land in. The read depends on the partner emojis.',
    },
    {
      question: 'What is the difference between {c} and {alt}?',
      answer:
        '{c} is the "name" combo; {alt} is a different register. Without a single category, the read depends entirely on which emojis are in the pair.',
    },
    {
      question: 'Is {c} appropriate for work?',
      answer:
        '{c} is fine in tight work channels when the register fits. In cross-functional or customer-facing comms, prefer sentences.',
    },
    {
      question: 'What does {c} mean at work?',
      answer:
        "At work {c} is read contextually. The category drives the read; the team's emoji fluency determines whether the combo lands.",
    },
    {
      question: 'Does {c} work on Instagram?',
      answer:
        '{c} lands on Instagram comment threads. The category register depends on the partner emojis.',
    },
    {
      question: 'Is {c} flirty?',
      answer:
        'Sometimes. {c} can read flirt-coded when the partner emojis land in the flirting register; otherwise the read is whatever the emojis suggest.',
    },
    {
      question: 'Can {c} be romantic?',
      answer: 'Sometimes. Romance-coded pairings land warm; otherwise the read is contextual.',
    },
    {
      question: 'What does {c} mean from a friend?',
      answer:
        "From a friend {c} reads as a coded reaction. The friend's category register determines the precise cue.",
    },
    {
      question: 'Is {c} cringe?',
      answer:
        '{c} is rarely cringe. Cross-category combos can read as off if the partner emojis do not belong together.',
    },
    {
      question: 'What does {c} mean at the end of a sentence?',
      answer:
        'Sandwiching {c} at the end of a sentence amplifies it. The category register flows into the cue.',
    },
    {
      question: 'Does {c} have a TikTok meaning?',
      answer:
        'On TikTok {c} shows up in comment threads. The cue travels the same as on iMessage; the register is the same.',
    },
    {
      question: 'Should I use {c} for small things?',
      answer:
        'For small things {c} reads as too loud. Reach for a single emoji; save the combo for the moments it was built for.',
    },
    {
      question: 'Can {c} be sincere?',
      answer:
        'Yes — {c} can be sincere when the partner emojis are warm-coded. The read depends on the partner emojis.',
    },
    {
      question: 'Is {c} Gen Z slang?',
      answer: '{c} is multigenerational. The category register determines generational cues.',
    },
    {
      question: 'What does {c} mean on Twitter?',
      answer:
        'On Twitter {c} punctuates reaction-coded threads. The register is the same as on iMessage.',
    },
    {
      question: 'Should I use {c} for sympathy?',
      answer:
        'For sympathy prefer heart or flower emojis. {c} without a sympathy-coded partner can read wrong.',
    },
    {
      question: 'Does {c} work on a meme?',
      answer:
        '{c} can punctuate memes when the partner emojis match the joke. Otherwise prefer a softer punchline-coded combo.',
    },
    {
      question: 'Is {c} passive-aggressive?',
      answer:
        'Sometimes — {c} sent after silence or paired with a clipped reply can mask a complaint.',
    },
    {
      question: 'What does {c} mean from a stranger?',
      answer:
        'From a stranger {c} is contextual. The combo reads the same on public posts regardless of who sends it.',
    },
    {
      question: 'Can I use {c} in an email?',
      answer: '{c} is fine for short internal emails; avoid in long-form or customer-facing email.',
    },
    {
      question: 'Does {c} work in a family group?',
      answer: '{c} works in family groups when the family already reads emoji fluently.',
    },
    {
      question: 'Should I send {c} to my boss?',
      answer:
        'Do not lead with {c} to a boss unless you have a tight rapport. Reach for a sentence or a single soft emoji.',
    },
    {
      question: 'Is {c} ever sarcastic?',
      answer: 'Yes — {c} can read sarcastic when the partner emojis contradict the message.',
    },
    {
      question: 'What does {c} mean when sent twice?',
      answer:
        'Sending {c} twice intensifies the read. The combo lands with extra weight — usually reserved for moments that genuinely earn emphasis.',
    },
    {
      question: 'Does {c} age well?',
      answer:
        '{c} ages well when the partner emojis are universal. Avoid pairing quickly-aging partner emojis in long-lived content.',
    },
    {
      question: 'Should I use {c} on LinkedIn?',
      answer:
        'On LinkedIn {c} often reads as performative. Skip loud combos there; reach for a sentence or a single soft emoji.',
    },
    {
      question: 'What does {c} mean in a comment section?',
      answer:
        'In a comment section {c} reads the same as on iMessage. The category register is the read.',
    },
    {
      question: 'Can {c} befriend-coded?',
      answer:
        '{c} can be friend-coded in tight groups where emoji cues blur. Outside that context the read stays contextual.',
    },
    {
      question: 'Is {c} acceptable for a wedding?',
      answer:
        '{c} is fine for wedding-coded moments when the register fits. For the announcement itself prefer relationship-coded combos.',
    },
    {
      question: 'What does {c} mean on a poster?',
      answer: 'On a poster {c} is contextual. The combo stays whatever the partner emojis suggest.',
    },
  ],
};

/** Tag pool per family — ≥50 entries each, sampled 3–5 per combo. */
export const TAG_POOL: Record<Family, string[]> = {
  'hearts-love': [
    'love',
    'sweet',
    'romance',
    'affection',
    'cupid',
    'crush',
    'relationship',
    'tender',
    'pair',
    'valentine',
    'soft',
    'heart-eyed',
    'couple',
    'kiss',
    'flirt',
    'glow',
    'sentiment',
    'soulmate',
    'sweetheart',
    'adorable',
    'intimate',
    'butterfly',
    'sparkle',
    'devoted',
    'longing',
    'adore',
    'babe',
    'honey',
    'cozy',
    'warmth',
    'flare',
    'match',
    'commit',
    'beloved',
    'darling',
    'kindred',
    'whole-heart',
    'everyday',
    'true',
    'first-love',
    'together',
    'small-moment',
    'soft-launch',
    'hard-launch',
    'romcom',
    'passion',
    'devotion',
    'forever',
    'fade',
    'summer-romance',
  ],
  'smileys-emotion': [
    'reaction',
    'mood',
    'vibe',
    'feeling',
    'face',
    'expression',
    'eyes',
    'gen-z',
    'laugh',
    'tears',
    'shock',
    'tired',
    'dizzy',
    'sleepy',
    'relieved',
    'overwhelm',
    'crisis',
    'big-feel',
    'doom',
    'silly',
    'shrink',
    'pout',
    'pensive',
    'grumpy',
    'high-spirits',
    'drama',
    'soft',
    'crisis-mode',
    'sleep',
    'cold',
    'sweat',
    'mind-blown',
    'woah',
    'oops',
    'whatever',
    'silent',
    'breathe',
    'side-eye',
    'deadpan',
    'shy',
    'hush',
    'cringe',
    'mellow',
    'sigh',
    'panik',
    'stare',
    'fear',
    'drained',
    'pumped',
    'giddy',
    'smh',
  ],
  'hands-body': [
    'gesture',
    'react',
    'thumbs',
    'high-five',
    'ok',
    'point',
    'peace',
    'wave',
    'stop',
    'shrug',
    'facepalm',
    'call',
    'hang-loose',
    'fingers-crossed',
    'nail-polish',
    'muscle',
    'fist',
    'palms',
    'open-arms',
    'rock-on',
    'clap',
    'pray',
    'plead',
    'hug',
    'spock',
    'point-up',
    'point-down',
    'approve',
    'reject',
    'celebrate',
    'concede',
    'applaud',
    'wave-hello',
    'wave-bye',
    'high-ten',
    'low-five',
    'snap',
    'finger-gun',
    'slow-clap',
    'cheer',
    'salute',
    'raise-hand',
    'nod',
    'cringe',
    'thumb-down',
    'thumbs-up',
    'bored',
    'tired-hand',
    'open-palm',
    'pointed',
    'finger-wag',
    'pinched',
    'pinky',
  ],
  animals: [
    'cat',
    'dog',
    'panda',
    'fox',
    'penguin',
    'unicorn',
    'dragon',
    'wolf',
    'owl',
    'frog',
    'shark',
    'whale',
    'dolphin',
    'tiger',
    'lion',
    'koala',
    'rabbit',
    'duck',
    'bee',
    'butterfly',
    'snail',
    'octopus',
    'snake',
    'turtle',
    'monkey',
    'lizard',
    'bird',
    'bat',
    'spider',
    'crab',
    't-rex',
    'mouse',
    'chipmunk',
    'hedgehog',
    'swan',
    'rooster',
    'cow',
    'pig',
    'horse',
    'goat',
    'ram',
    'moose',
    'bison',
    'raccoon',
    'zebra',
    'kangaroo',
    'camel',
    'llama',
    'jellyfish',
    'squid',
    'lobster',
    'shrimp',
  ],
  'food-drink': [
    'meal',
    'snack',
    'sugar',
    'fruit',
    'meat',
    'bread',
    'cheese',
    'cake',
    'pie',
    'cookie',
    'candy',
    'drink',
    'coffee',
    'tea',
    'juice',
    'wine',
    'beer',
    'cocktail',
    'water',
    'milk',
    'smoothie',
    'spicy',
    'sweet',
    'salty',
    'sour',
    'bitter',
    'savory',
    'breakfast',
    'lunch',
    'dinner',
    'brunch',
    'dessert',
    'party-food',
    'comfort',
    'fresh',
    'cold',
    'hot',
    'chewy',
    'crunch',
    'tangy',
    'creamy',
    'crispy',
    'soft-bake',
    'rich',
    'filling',
    'tasty',
    'midnight-snack',
    'morning',
    'picnic',
    'date-night',
    'comfort-food',
    'street-food',
  ],
  'travel-places': [
    'flight',
    'airport',
    'beach',
    'mountain',
    'city',
    'camping',
    'hotel',
    'trip',
    'road',
    'train',
    'bus',
    'car',
    'bicycle',
    'boat',
    'cruise',
    'anchor',
    'compass',
    'map',
    'world',
    'passport',
    'suitcase',
    'sand',
    'sun',
    'island',
    'palm',
    'desert',
    'forest',
    'lake',
    'ocean',
    'river',
    'sunrise',
    'sunset',
    'night-sky',
    'cityscape',
    'skyline',
    'fountain',
    'volcano',
    'snow',
    'cold-trip',
    'tropical',
    'europe',
    'asia',
    'americas',
    'africa',
    'oceania',
    'mid-flight',
    'jet-lag',
    'vacay',
    'voyage',
    'commute',
    'adventure',
  ],
  'sports-music': [
    'sport',
    'team',
    'win',
    'medal',
    'trophy',
    'celebrate',
    'win-streak',
    'score',
    'goal',
    'touchdown',
    'home-run',
    'music',
    'song',
    'beat',
    'note',
    'guitar',
    'piano',
    'drum',
    'mic',
    'dj',
    'concert',
    'festival',
    'dance',
    'karaoke',
    'gaming',
    'video-game',
    'controller',
    'dice',
    'board-game',
    'card-game',
    'chess',
    'puzzle',
    'paint',
    'draw',
    'stage',
    'theater',
    'cinema',
    'movie',
    'camera',
    'action',
    'sketch',
    'art',
    'craft',
    'circus',
    'magic',
    'card-trick',
    'pool',
    'bowling',
    'boxing',
    'tennis',
    'soccer',
    'basketball',
  ],
  'weather-nature': [
    'sun',
    'cloud',
    'rain',
    'storm',
    'snow',
    'frost',
    'fog',
    'wind',
    'breeze',
    'thunder',
    'lightning',
    'rainbow',
    'aurora',
    'milky-way',
    'star',
    'moon',
    'sunrise',
    'sunset',
    'midnight',
    'sky',
    'tree',
    'leaf',
    'pine',
    'palm',
    'cactus',
    'rose',
    'tulip',
    'sunflower',
    'blossom',
    'hibiscus',
    'bouquet',
    'wilted',
    'fallen',
    'shell',
    'stone',
    'mountain',
    'wave',
    'water',
    'sea',
    'globe',
    'planet',
    'comet',
    'eclipse',
    'starry',
    'drift',
    'atmosphere',
    'climate',
    'spring',
    'summer',
    'autumn',
    'winter',
  ],
  'objects-tech': [
    'laptop',
    'phone',
    'desktop',
    'keyboard',
    'monitor',
    'mouse',
    'printer',
    'scan',
    'paper',
    'letter',
    'package',
    'box',
    'carton',
    'mail',
    'inbox',
    'outbox',
    'send',
    'receive',
    'inbox-zero',
    'todo',
    'planner',
    'calendar',
    'clock',
    'alarm',
    'timer',
    'stopwatch',
    'wallet',
    'cash',
    'coin',
    'dollar',
    'credit',
    'receipt',
    'invoice',
    'sale',
    'percent',
    'trending',
    'chart',
    'graph',
    'data',
    'rocket',
    'launch',
    'ship',
    'idea',
    'gear',
    'tool',
    'wrench',
    'screwdriver',
    'tape',
    'trophy',
    'crown',
    'medal',
  ],
  'symbols-effects': [
    'star',
    'sparkle',
    'shine',
    'glow',
    'flash',
    'boom',
    'fire',
    'flame',
    'ice',
    'snowflake',
    'drop',
    'wave',
    'wind',
    'puff',
    'thought',
    'speech',
    'message',
    'note',
    'heart-note',
    'check',
    'cross',
    'tick',
    'question',
    'exclaim',
    'warn',
    'stop',
    'no-entry',
    'infinity',
    'yin-yang',
    'peace',
    'star-of-david',
    'atom',
    'recycle',
    '100',
    'real',
    'right',
    'left',
    'up',
    'down',
    'fresh',
    'new',
    'shine-on',
    'highlight',
    'stamp',
    'bang',
    'noise',
    'pulse',
    'echo',
    'tone',
    'vibe',
    'ring',
  ],
};

export const CONVERSATION_SETTINGS: ReadonlyArray<
  import('../../src/types/combo').ComboConversationSetting
> = ['dating', 'friends', 'family', 'social', 'work', 'other'];

// Deterministic 3-setting rotation triples for conversationExamples — chosen
// so no two combos inside a batch ever share the exact same triple.
export const SETTING_TRIPLES: Array<
  [
    import('../../src/types/combo').ComboConversationSetting,
    import('../../src/types/combo').ComboConversationSetting,
    import('../../src/types/combo').ComboConversationSetting,
  ]
> = [
  ['friends', 'dating', 'work'],
  ['work', 'family', 'social'],
  ['family', 'social', 'friends'],
  ['social', 'friends', 'dating'],
  ['dating', 'social', 'work'],
  ['friends', 'work', 'family'],
  ['family', 'work', 'dating'],
  ['work', 'friends', 'social'],
  ['social', 'dating', 'family'],
  ['dating', 'family', 'work'],
  ['friends', 'social', 'family'],
  ['work', 'family', 'friends'],
  ['family', 'friends', 'dating'],
  ['social', 'work', 'dating'],
  ['dating', 'friends', 'social'],
  ['friends', 'dating', 'family'],
  ['work', 'social', 'dating'],
  ['family', 'work', 'social'],
  ['social', 'dating', 'friends'],
  ['dating', 'work', 'friends'],
  ['friends', 'family', 'work'],
  ['work', 'dating', 'family'],
  ['family', 'social', 'work'],
  ['social', 'friends', 'work'],
  ['dating', 'family', 'social'],
];
