import { describe, it, expect } from 'bun:test';
import {
  LIMITS,
  capitalizeFirst,
  countJargon,
  findTemplateMarkers,
  mergeIntoEmoji,
  normalizeWritten,
  validateWritten,
  writtenProse,
  type WrittenEmoji,
} from '../../../scripts/emoji-content/validate';
import {
  buildEmojiPrompt,
  ANGLES,
  EMOJI_JARGON_WORDS,
} from '../../../scripts/emoji-content/prompt';
import type { Emoji } from '../../../src/types/emoji';

const baseEmoji: Emoji = {
  unicode: '1F921',
  slug: 'clown-face',
  character: '🤡',
  name: 'Clown Face',
  shortName: 'clown face',
  category: 'smileys-emotion',
  unicodeVersion: '9.0',
  baseMeaning: 'A clown face.',
  tldr: 'Old tldr.',
  contextMeanings: [],
  platformNotes: [],
  generationalNotes: [],
  warnings: [],
  relatedCombos: [],
  seoTitle: 'Old title',
  seoDescription: 'Old description',
  longForm: { overview: 'Old overview.' },
};

const goodWritten: WrittenEmoji = {
  tldr: 'Marks a foolish move, usually your own, sometimes a blunt verdict on someone else’s bad call.',
  contextMeanings: [
    {
      context: 'LITERAL',
      meaning: '🤡 can still refer to an actual clown or a circus.',
      example: 'the circus has a real clown doing balloon animals today 🤡',
      riskLevel: 'LOW',
    },
    {
      context: 'SLANG',
      meaning: '🤡 mocks a mistake while admitting the sender knows it was foolish.',
      example: 'i just sent the screenshot to the person it was about 🤡',
      riskLevel: 'LOW',
    },
    {
      context: 'DATING',
      meaning: '🤡 makes an embarrassing romantic message playful.',
      example: 'i reread your last text eleven times before answering 🤡',
      riskLevel: 'MEDIUM',
    },
    {
      context: 'WORK',
      meaning: '🤡 in a professional message reads as mockery or insubordination.',
      example: 'that meeting could have gone better 🤡',
      riskLevel: 'HIGH',
    },
  ],
  platformNotes: [
    {
      platform: 'TIKTOK',
      note: 'On TikTok, 🤡 often works as a short verdict attached to a clip or comment.',
    },
    {
      platform: 'TWITTER',
      note: 'Twitter helped establish the modern use of 🤡 for calling out absurd takes.',
    },
    {
      platform: 'INSTAGRAM',
      note: 'On Instagram, 🤡 can close a caption or appear in a direct message after a slip.',
    },
    {
      platform: 'SLACK',
      note: 'Slack is usually a poor home for 🤡, especially in a wide work channel.',
    },
  ],
  generationalNotes: [
    {
      generation: 'GEN_Z',
      note: 'Gen Z commonly uses 🤡 as a self-roast after doing something foolish.',
    },
    {
      generation: 'MILLENNIAL',
      note: 'Millennials often read 🤡 more literally as a clown or a circus.',
    },
    {
      generation: 'GEN_X',
      note: 'Gen X may need more surrounding context to recognize the self-deprecating slang.',
    },
  ],
  warnings: [
    {
      title: 'Making real pain a punchline',
      description: 'Do not use 🤡 around mental health, addiction, or another serious crisis.',
      severity: 'HIGH',
    },
  ],
  longForm: {
    overview:
      '🤡 began as a literal picture of a clown, not a joke about being foolish. That older meaning survives in children’s entertainment and circus references, but online use shifted during the late 2010s, especially on Twitter. People began attaching it to indefensible celebrity, fan, or stranger posts. In that context, 🤡 was sharper than a general laugh and more pointed than facepalm: it named the take as absurd and invited everyone else to notice.\n\nBy the early 2020s, the dominant move was to aim the joke at yourself. A clown following a bad decision says, ‘I know, laugh at me.’ The emoji can also judge another person’s blunder, ask whether you are the one making a fool of yourself, or turn an embarrassing dating message into something playful. Stacking it intensifies the roast, while pairing it with 💀 adds a ‘this is so absurd’ reaction. The key distinction is direction: aimed at yourself, 🤡 usually invites laughter; aimed at someone else, it can sound like mockery.',
    howPeopleUseIt:
      '🤡 usually appears after the sender has made the mistake, wants others to recognize how foolish it was, and offers the story as a joke. ‘i sent the resignation email to the wrong person 🤡’ is a self-own: the sender is inviting the group to laugh because they know they deserved it. Asking whether you are the clown creates a similar request for a verdict, often answered with another 🤡.\n\nThe emoji also appears after someone else’s questionable decision. In a group chat, one 🤡 can turn a bad text or screenshot into a shared moment of disbelief. Repeating it makes the judgment louder, and adding 💀 turns the situation into ‘I cannot believe this happened.’ In dating chats, 🤡 can soften embarrassment by admitting that the sender acted nervous or foolish without asking for a serious response.',
    whenNotToUse:
      'Skip 🤡 when someone has just embarrassed themselves by accident. Even an accurate clown comment can feel like punching down, especially if the recipient is already hurting. If they want sympathy, try 😭 or 🥲 instead. Also keep it away from mental health, addiction, and other serious crises; treating those subjects as clown material can make the message cruel.\n\nAvoid work email, a wide Slack channel, or any professional thread. Under a manager’s message, 🤡 reads as mockery; under a coworker’s, it can look like bullying, and even self-directed clowning may look unprofessional. If the recipient takes themselves seriously or you are unsure of the joke, a plain sentence is safer than assuming the emoji will be understood as playful.',
    howToReply:
      'If someone sends 🤡, another 🤡 is the cleanest answer when the point is ‘you really are the clown.’ Use 💀 for an ‘I’m dead’ reaction, or 🤡🎪 when you want to call the whole situation a circus. A short reassurance such as ‘you’re fine, honestly’ can also defuse a moment if the sender is embarrassed and the bit has gone on too long.\n\nIf 🤡 appears under your own post, treat it as an invitation to laugh with the group unless the message felt personal or the context was sensitive. You can answer with ‘fair 🤡’ to join the joke, or ask ‘too far?’ if you are unsure. When someone asks whether they are the clown, a direct answer is kinder than leaving them to interpret the emoji.',
    faqs: [
      {
        question: 'What does 🤡 mean from a guy?',
        answer:
          'In a dating chat, 🤡 often shows that he knows he seemed foolish, nervous, or overly eager. It can be playful, but the reply will determine whether he wanted reassurance or judgment.',
      },
      {
        question: 'Is 🤡 flirty?',
        answer:
          'Yes, 🤡 can be flirty when it admits an embarrassing romantic mistake, such as sounding too eager. It works best as a joke the recipient is willing to join.',
      },
      {
        question: 'What does 🤡 mean on TikTok?',
        answer:
          'On TikTok, 🤡 usually marks a foolish action or an absurd claim. People often use it on themselves after a bad decision, but it can sound harsher when aimed at another creator.',
      },
      {
        question: 'Does 🤡 mean someone is calling me dumb?',
        answer:
          'It can. When aimed at someone else, 🤡 is often a verdict on their judgment or behavior, even when the message appears in a joking group chat.',
      },
    ],
  },
  conversationExamples: [
    {
      setting: 'dating',
      message: 'i reread your last text eleven times before answering 🤡',
      interpretation:
        'He is admitting that he was nervous and eager, using the emoji to make it charming.',
    },
    {
      setting: 'friends',
      message: 'i locked myself out of the car again and my spare key is inside 🤡',
      interpretation:
        'A familiar self-own: the sender wants the group to laugh with them. Another 🤡 would match the joke.',
    },
    {
      setting: 'work',
      message: 'ugh sent the client report to the wrong team again 🤡',
      interpretation:
        'In a private chat this may work as light self-deprecation; in a wide channel, describe the mistake plainly.',
    },
    {
      setting: 'family',
      message: 'dad said the family circus starts when i wear this 🤡',
      interpretation:
        'Here 🤡 may be literal, referring to a clown costume or a family performance. It is harmless and playful.',
    },
    {
      setting: 'social',
      message: 'bro really put that on main and thought it was smart 🤡',
      interpretation:
        'The sender is publicly calling someone’s post foolish. One 🤡 adds a dry verdict, several make it harsher.',
    },
  ],
  seoTitle: '🤡 Clown Face Emoji Meaning',
  seoDescription:
    'What does 🤡 mean? It marks a foolish move: self-roast, a blunt verdict on someone else’s bad call, or playful embarrassment in a dating chat.',
};

describe('emoji-content/validate', () => {
  describe('countJargon', () => {
    it('counts a jargon word', () => {
      expect(countJargon('it carries an approval register')).toBe(1);
    });

    it('counts a hyphenated compound once', () => {
      expect(countJargon('clown-face-coded energy')).toBe(1);
    });

    it('returns zero for clean prose', () => {
      expect(countJargon('a plain sentence about a clown')).toBe(0);
    });
  });

  describe('writtenProse', () => {
    it('gathers every reader-visible string', () => {
      const prose = writtenProse(goodWritten);
      expect(prose).toContain('Marks a foolish move');
      expect(prose).toContain('self-own');
      expect(prose).toContain('i locked myself out');
    });
  });

  describe('findTemplateMarkers', () => {
    it('returns nothing for clean copy', () => {
      expect(findTemplateMarkers(goodWritten)).toEqual([]);
    });

    it('catches the template opening in the overview', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.overview = `🤡 is the emoji of clown-face-coded silly. ${'word '.repeat(40)}`;
      expect(findTemplateMarkers(written)).toContain('page contains "is the emoji of"');
    });

    it('catches the template phrasing in a FAQ answer', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.faqs = [
        { question: 'Is it for clown moments?', answer: 'It is a natural fit for clown moments.' },
        ...goodWritten.longForm!.faqs!.slice(1),
      ];
      expect(findTemplateMarkers(written)).toContain('page contains "is a natural fit for"');
    });

    it('catches the template phrasing outside the overview and the FAQs', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.howPeopleUseIt =
        'It is a natural fit for a friend\u2019s driving test, where the feeling is luck.';
      expect(findTemplateMarkers(written)).toContain('page contains "is a natural fit for"');
    });

    it('catches a page saturated with coded compounds', () => {
      const written = {
        ...goodWritten,
        longForm: { ...goodWritten.longForm! },
      };
      written.longForm!.overview = Array.from({ length: 11 }, (_, i) => `thing-${i}-coded`).join(
        ' '
      );
      expect(
        findTemplateMarkers(written).some((marker) => marker.includes('"-coded" compounds'))
      ).toBe(true);
    });
  });

  describe('validateWritten', () => {
    it('accepts a well-formed page', () => {
      expect(validateWritten(goodWritten, 'clown-face')).toEqual([]);
    });

    it('rejects a short tldr', () => {
      const issues = validateWritten({ ...goodWritten, tldr: 'Clown.' }, 'clown-face');
      expect(issues.some((issue) => issue.field === 'tldr')).toBe(true);
    });

    it('rejects a long tldr', () => {
      const issues = validateWritten(
        { ...goodWritten, tldr: 'word '.repeat(LIMITS.tldrMax + 5) },
        'clown-face'
      );
      expect(issues.some((issue) => issue.field === 'tldr')).toBe(true);
    });

    it('rejects a short overview', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.overview = 'Too short.';
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'longForm.overview')).toBe(true);
    });

    it('rejects a long overview', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.overview = 'word '.repeat(LIMITS.overviewMax + 20);
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'longForm.overview')).toBe(true);
    });

    it('rejects a short section', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.whenNotToUse = 'Skip it.';
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'longForm.whenNotToUse')).toBe(true);
    });

    it('rejects a long section', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.howToReply = 'word '.repeat(LIMITS.sectionMax + 20);
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'longForm.howToReply')).toBe(true);
    });

    it('rejects too few FAQs', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.faqs = goodWritten.longForm!.faqs!.slice(0, 2);
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'longForm.faqs')).toBe(true);
    });

    it('rejects too few conversation examples', () => {
      const issues = validateWritten(
        { ...goodWritten, conversationExamples: goodWritten.conversationExamples!.slice(0, 2) },
        'clown-face'
      );
      expect(issues.some((issue) => issue.field === 'conversationExamples')).toBe(true);
    });

    it('rejects too few context meanings', () => {
      const issues = validateWritten(
        { ...goodWritten, contextMeanings: goodWritten.contextMeanings!.slice(0, 2) },
        'clown-face'
      );
      expect(issues.some((issue) => issue.field === 'contextMeanings')).toBe(true);
    });

    it('rejects too few platform notes', () => {
      const issues = validateWritten(
        { ...goodWritten, platformNotes: goodWritten.platformNotes!.slice(0, 2) },
        'clown-face'
      );
      expect(issues.some((issue) => issue.field === 'platformNotes')).toBe(true);
    });

    it('rejects too few generational notes', () => {
      const issues = validateWritten(
        { ...goodWritten, generationalNotes: goodWritten.generationalNotes!.slice(0, 2) },
        'clown-face'
      );
      expect(issues.some((issue) => issue.field === 'generationalNotes')).toBe(true);
    });

    it('rejects a page full of jargon', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.overview = `This page carries the register and the cadence and the cue and the read. ${'word '.repeat(30)}`;
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'jargon')).toBe(true);
    });

    it('rejects a seoDescription of the wrong length', () => {
      const issues = validateWritten(
        { ...goodWritten, seoDescription: 'Too short.' },
        'clown-face'
      );
      expect(issues.some((issue) => issue.field === 'seoDescription')).toBe(true);
    });

    it('rejects a missing seoTitle', () => {
      const issues = validateWritten({ ...goodWritten, seoTitle: '' }, 'clown-face');
      expect(issues.some((issue) => issue.field === 'seoTitle')).toBe(true);
    });

    it('rejects an invented context type', () => {
      const written = {
        ...goodWritten,
        contextMeanings: goodWritten.contextMeanings!.map((c, i) =>
          i === 0 ? { ...c, context: 'FUNNY' as never } : c
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'contextMeanings[0].context')).toBe(true);
    });

    it('rejects an invented risk level', () => {
      const written = {
        ...goodWritten,
        contextMeanings: goodWritten.contextMeanings!.map((c, i) =>
          i === 0 ? { ...c, riskLevel: 'HUGE' as never } : c
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'contextMeanings[0].riskLevel')).toBe(true);
    });

    it('rejects an invented platform', () => {
      const written = {
        ...goodWritten,
        platformNotes: goodWritten.platformNotes!.map((p, i) =>
          i === 0 ? { ...p, platform: 'MYSPACE' as never } : p
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'platformNotes[0].platform')).toBe(true);
    });

    it('rejects an invented generation', () => {
      const written = {
        ...goodWritten,
        generationalNotes: goodWritten.generationalNotes!.map((g, i) =>
          i === 0 ? { ...g, generation: 'GEN_OMEGA' as never } : g
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'generationalNotes[0].generation')).toBe(true);
    });

    it('rejects an invented severity', () => {
      const written = {
        ...goodWritten,
        warnings: goodWritten.warnings!.map((w, i) =>
          i === 0 ? { ...w, severity: 'CATASTROPHIC' as never } : w
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'warnings[0].severity')).toBe(true);
    });

    it('rejects a warning without a title', () => {
      const written = {
        ...goodWritten,
        warnings: goodWritten.warnings!.map((w, i) => (i === 0 ? { ...w, title: '' } : w)),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'warnings[0].title')).toBe(true);
    });

    it('rejects a warning without a description', () => {
      const written = {
        ...goodWritten,
        warnings: goodWritten.warnings!.map((w, i) => (i === 0 ? { ...w, description: '' } : w)),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'warnings[0].description')).toBe(true);
    });

    it('rejects a FAQ without a question', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.faqs = goodWritten.longForm!.faqs!.map((faq, index) =>
        index === 0 ? { ...faq, question: '' } : faq
      );
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'longForm.faqs[0].question')).toBe(true);
    });

    it('rejects a FAQ without an answer', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.faqs = goodWritten.longForm!.faqs!.map((faq, index) =>
        index === 0 ? { ...faq, answer: '' } : faq
      );
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'longForm.faqs[0].answer')).toBe(true);
    });

    it('rejects a conversation example without a message', () => {
      const written = {
        ...goodWritten,
        conversationExamples: goodWritten.conversationExamples!.map((e, i) =>
          i === 0 ? { ...e, message: '' } : e
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'conversationExamples[0].message')).toBe(true);
    });

    it('rejects a conversation example without an interpretation', () => {
      const written = {
        ...goodWritten,
        conversationExamples: goodWritten.conversationExamples!.map((e, i) =>
          i === 0 ? { ...e, interpretation: '' } : e
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'conversationExamples[0].interpretation')).toBe(
        true
      );
    });

    it('rejects an invented conversation setting', () => {
      const written = {
        ...goodWritten,
        conversationExamples: goodWritten.conversationExamples!.map((e, i) =>
          i === 0 ? { ...e, setting: 'classroom' as never } : e
        ),
      };
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'conversationExamples[0].setting')).toBe(true);
    });

    it('rejects a template marker', () => {
      const written = { ...goodWritten, longForm: { ...goodWritten.longForm! } };
      written.longForm!.overview = `🤡 is the emoji of clown-face-coded silly. ${'word '.repeat(40)}`;
      const issues = validateWritten(written, 'clown-face');
      expect(issues.some((issue) => issue.field === 'template')).toBe(true);
    });
  });

  describe('normalizeWritten', () => {
    it('maps the long-form key the model reaches for', () => {
      const normalized = normalizeWritten({
        longForm: {
          overview: 'a',
          howPeopleUseIt: 'b',
          whenNotToUseIt: 'c',
          howToReply: 'd',
        } as never,
      });
      expect(normalized.longForm?.whenNotToUse).toBe('c');
    });

    it('keeps the lists the model wrote', () => {
      const normalized = normalizeWritten({
        contextMeanings: goodWritten.contextMeanings,
        platformNotes: goodWritten.platformNotes,
        generationalNotes: goodWritten.generationalNotes,
        warnings: goodWritten.warnings,
        conversationExamples: goodWritten.conversationExamples,
      } as never);

      expect(normalized.contextMeanings).toHaveLength(goodWritten.contextMeanings!.length);
      expect(normalized.platformNotes).toHaveLength(goodWritten.platformNotes!.length);
      expect(normalized.generationalNotes).toHaveLength(goodWritten.generationalNotes!.length);
      expect(normalized.warnings).toHaveLength(goodWritten.warnings!.length);
      expect(normalized.conversationExamples).toHaveLength(
        goodWritten.conversationExamples!.length
      );
    });

    it('replaces a list field that is not a list with an empty list', () => {
      const normalized = normalizeWritten({
        contextMeanings: 'not a list',
        platformNotes: 42,
        generationalNotes: null,
        warnings: { nope: true },
        conversationExamples: 'also not a list',
      } as never);

      expect(normalized.contextMeanings).toEqual([]);
      expect(normalized.platformNotes).toEqual([]);
      expect(normalized.generationalNotes).toEqual([]);
      expect(normalized.warnings).toEqual([]);
      expect(normalized.conversationExamples).toEqual([]);
    });

    it('moves faqs out of the top level into the long form', () => {
      const normalized = normalizeWritten({ faqs: [{ question: 'q', answer: 'a' }] } as never);
      expect(normalized.longForm?.faqs).toHaveLength(1);
    });

    it('capitalizes FAQ questions', () => {
      const normalized = normalizeWritten({
        longForm: { faqs: [{ question: 'what does it mean', answer: 'a' }] },
      });
      expect(normalized.longForm?.faqs?.[0].question).toBe('What does it mean');
    });

    it('defaults the lists to empty arrays', () => {
      const normalized = normalizeWritten({});
      expect(normalized.contextMeanings).toEqual([]);
      expect(normalized.platformNotes).toEqual([]);
      expect(normalized.generationalNotes).toEqual([]);
      expect(normalized.warnings).toEqual([]);
      expect(normalized.conversationExamples).toEqual([]);
      expect(normalized.longForm?.faqs).toEqual([]);
    });
  });

  describe('capitalizeFirst', () => {
    it('capitalizes the first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
    });

    it('leaves an empty string alone', () => {
      expect(capitalizeFirst('')).toBe('');
    });
  });

  describe('mergeIntoEmoji', () => {
    it('keeps the record identity and takes the new prose', () => {
      const merged = mergeIntoEmoji(baseEmoji, goodWritten, '2026-11-02');
      expect(merged.unicode).toBe('1F921');
      expect(merged.slug).toBe('clown-face');
      expect(merged.character).toBe('🤡');
      expect(merged.tldr).toBe(goodWritten.tldr);
      expect(merged.longForm?.overview).toBe(goodWritten.longForm?.overview);
      expect(merged.contentTier).toBe('deep');
      expect(merged.contentUpdatedAt).toBe('2026-11-02');
    });

    it('keeps the old content date when none is given', () => {
      const merged = mergeIntoEmoji(baseEmoji, goodWritten);
      expect(merged.contentUpdatedAt).toBeUndefined();
    });
  });

  describe('prompt', () => {
    it('carries the guide excerpts and the field list into the prompt', () => {
      const grounding = {
        slug: 'clown-face',
        character: '🤡',
        name: 'Clown Face',
        baseMeaning: 'A clown face.',
        category: 'smileys-emotion',
        subcategory: 'face-emotion',
        unicodeVersion: '9.0',
        excerpts: [
          {
            guideSlug: 'what-does-clown-face-mean',
            guideTitle: 'Clown face guide',
            heading: 'How it became a verb',
            text: '🤡 became the default emoji for a bad call.',
          },
        ],
        guideSlugs: ['what-does-clown-face-mean'],
      };

      const prompt = buildEmojiPrompt(baseEmoji, grounding, {
        angle: ANGLES[0],
        styleReference: 'OVERVIEW:\nSomething handwritten.',
      });

      expect(prompt.user).toContain('🤡 became the default emoji for a bad call.');
      expect(prompt.user).toContain('ANGLE FOR THIS PAGE');
      expect(prompt.user).toContain('OVERVIEW:\nSomething handwritten.');
      expect(prompt.system).toContain('single JSON object');
    });

    it('bans the abstract vocabulary', () => {
      for (const word of ['register', 'cadence', 'the cue', 'the read', '-coded']) {
        expect(EMOJI_JARGON_WORDS).toContain(word);
      }
    });

    it('leaves out the style note when there is no style reference', () => {
      const grounding = {
        slug: 'clown-face',
        character: '🤡',
        name: 'Clown Face',
        baseMeaning: 'A clown face.',
        category: 'smileys-emotion',
        subcategory: 'face-emotion',
        unicodeVersion: '9.0',
        excerpts: [],
        guideSlugs: [],
      };

      const prompt = buildEmojiPrompt(baseEmoji, grounding, { angle: ANGLES[0] });
      expect(prompt.user).not.toContain('Here is a hand-written page');
    });

    it('notes the sibling pages when there are any', () => {
      const grounding = {
        slug: 'clown-face',
        character: '🤡',
        name: 'Clown Face',
        baseMeaning: 'A clown face.',
        category: 'smileys-emotion',
        subcategory: 'face-emotion',
        unicodeVersion: '9.0',
        excerpts: [],
        guideSlugs: [],
      };

      const prompt = buildEmojiPrompt(baseEmoji, grounding, {
        angle: ANGLES[0],
        siblings: ['Clown'],
      });
      expect(prompt.user).toContain('other pages cover the same emoji (Clown)');
    });
  });
});
