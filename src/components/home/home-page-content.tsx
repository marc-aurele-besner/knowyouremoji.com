import Link from 'next/link';
import {
  getEmojiCount,
  getAllCategoryInfo,
  getEmojiSummaries,
  getContextDisplayName,
  getContextDescription,
} from '@/lib/emoji-data';
import { getComboCount } from '@/lib/combo-data';
import { getPublishedGuideCount } from '@/lib/guide-data';
import { Button } from '@/components/ui/button';
import { GuideCard } from '@/components/guides/guide-card';
import { BookBanner } from '@/components/layout/book-banner';
import { Omnibox } from '@/components/home/omnibox';
import type { ContextType, EmojiSummary } from '@/types/emoji';
import type { EmojiComboSummary } from '@/types/combo';
import type { GuideSummary } from '@/types/guide';

const tickerEmojiChars = [
  '😂',
  '❤️',
  '🔥',
  '✨',
  '🤔',
  '💀',
  '🥺',
  '💯',
  '😭',
  '🙏',
  '😍',
  '🤡',
  '👀',
  '💅',
  '🫠',
  '😈',
  '🥰',
  '🤝',
  '💕',
  '🎯',
];

/** Contexts featured in the "Meaning depends on where you are" strip. */
const contextStrip: { context: ContextType; emojis: string }[] = [
  { context: 'SLANG', emojis: '💀🔥' },
  { context: 'DATING', emojis: '😏🥺' },
  { context: 'WORK', emojis: '👍🙏' },
  { context: 'IRONIC', emojis: '🙂🙃' },
];

const categoryEmoji: Record<string, string> = {
  faces: '😀',
  people: '👋',
  animals: '🐶',
  nature: '🌿',
  food: '🍕',
  travel: '✈️',
  activities: '⚽',
  objects: '💡',
  symbols: '❤️',
  flags: '🏁',
  'smileys-emotion': '😀',
  'people-body': '👋',
  'animals-nature': '🐶',
  'food-drink': '🍕',
  'travel-places': '✈️',
};

const numberFormat = new Intl.NumberFormat('en-US');

const sectionTitle = 'text-2xl font-semibold tracking-tight text-foreground md:text-[28px]';
const sectionLink =
  'text-sm font-medium text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded';
const tile =
  'rounded-2xl border border-card-border bg-card text-foreground transition hover:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

function SectionHead({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <span className="eyebrow mb-1 block">{eyebrow}</span>}
        <h2 className={sectionTitle}>{title}</h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className={sectionLink}>
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export interface HomePageContentProps {
  /** Emojis shown in the Trending grid (typically top 12 by Neon view counts when configured). */
  emojiSummaries: EmojiSummary[];
  /** Combos shown in the Popular combos section. */
  comboSummaries: EmojiComboSummary[];
  /** Latest published guides shown in the Editorial section (top 3). */
  guideSummaries: GuideSummary[];
}

/**
 * Homepage layout: omnibox hero, emoji ticker, book banner, trending emojis,
 * context strip, latest guides, popular combos, categories and interpreter CTA.
 */
export function HomePageContent({
  emojiSummaries,
  comboSummaries,
  guideSummaries,
}: HomePageContentProps) {
  const allSummaries = getEmojiSummaries();
  const emojiCount = getEmojiCount();
  const comboCount = getComboCount();
  const guideCount = getPublishedGuideCount();
  const categories = getAllCategoryInfo();

  const summaryByChar = new Map(allSummaries.map((s) => [s.character, s]));
  const tickerEmojis = tickerEmojiChars
    .map((char) => summaryByChar.get(char))
    .filter((s): s is (typeof allSummaries)[number] => s != null);

  return (
    <>
      <section className="pb-8 pt-16 text-center md:pt-24">
        <div className="container mx-auto px-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden="true" />
            {numberFormat.format(emojiCount)} emojis · {numberFormat.format(comboCount)} combos ·{' '}
            {guideCount} guides
          </span>

          <h1 className="mx-auto mb-4 mt-5 max-w-[860px] text-[40px] font-semibold leading-[1.04] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[68px]">
            What does that emoji <em className="accent-serif">actually</em> mean?
          </h1>
          <p className="mx-auto mb-9 max-w-[580px] text-base text-muted-foreground md:text-lg">
            Look up any emoji, or paste the whole message. We read context, tone and generation —
            not the Unicode label.
          </p>

          <Omnibox />
        </div>

        {tickerEmojis.length > 0 && (
          <div
            aria-label="Popular emojis"
            className="emoji-ticker mt-14 overflow-hidden border-y border-card-border py-3.5"
          >
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
              {[...tickerEmojis, ...tickerEmojis].map((item, i) => (
                <Link
                  key={i}
                  href={`/emoji/${item.slug}`}
                  aria-label={item.name}
                  tabIndex={i >= tickerEmojis.length ? -1 : undefined}
                  className="inline-block select-none text-[28px] opacity-75 transition hover:scale-110 hover:opacity-100 focus-visible:opacity-100"
                >
                  {item.character}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <section className="mt-8">
          <BookBanner variant="wide" />
        </section>

        <section className="mt-14" aria-labelledby="home-trending">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow mb-1 block">Explore</span>
              <h2 id="home-trending" className={sectionTitle}>
                Trending this week
              </h2>
            </div>
            <Link href="/emoji" className={sectionLink}>
              View all {numberFormat.format(emojiCount)} emojis <span aria-hidden="true">→</span>
            </Link>
          </div>
          {emojiSummaries.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {emojiSummaries.map((emoji) => (
                <Link
                  key={emoji.slug}
                  href={`/emoji/${emoji.slug}`}
                  data-testid="emoji-card"
                  className={`${tile} emoji-card-hover flex min-h-[150px] flex-col gap-2 p-4 text-left`}
                >
                  <span className="emoji-char text-[40px] leading-none" aria-hidden="true">
                    {emoji.character}
                  </span>
                  <span className="truncate text-[14.5px] font-semibold">{emoji.name}</span>
                  <span className="line-clamp-3 text-[13px] leading-snug text-muted-foreground">
                    {emoji.tldr}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No emojis available yet.</p>
          )}
        </section>

        <section className="mt-14">
          <SectionHead title="Meaning depends on where you are" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contextStrip.map(({ context, emojis }) => (
              <Link
                key={context}
                href={`/emoji/context/${context}`}
                data-testid="context-card"
                className={`${tile} flex flex-col gap-1.5 p-[18px]`}
              >
                <span className="text-[22px] tracking-[4px]" aria-hidden="true">
                  {emojis}
                </span>
                <span className="text-[15px] font-semibold">{getContextDisplayName(context)}</span>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  {getContextDescription(context)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {guideSummaries.length > 0 && (
          <section className="mt-14">
            <SectionHead
              eyebrow="Editorial"
              title="Latest guides"
              href="/guides"
              linkLabel={`All ${guideCount} guides`}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guideSummaries.slice(0, 3).map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-14">
          <SectionHead
            title="Popular combos"
            href="/combo"
            linkLabel={`All ${numberFormat.format(comboCount)} combos`}
          />
          {comboSummaries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {comboSummaries.map((combo) => (
                <Link
                  key={combo.slug}
                  href={`/combo/${combo.slug}`}
                  data-testid="combo-card"
                  className={`${tile} flex flex-col gap-2 p-[18px] hover:shadow-soft`}
                >
                  <span className="emoji-char text-[34px] tracking-[4px]" aria-hidden="true">
                    {combo.combo}
                  </span>
                  <span className="text-[15px] font-semibold">{combo.name}</span>
                  <span className="line-clamp-3 text-[13.5px] leading-snug text-muted-foreground">
                    {combo.meaning}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No combos available yet.</p>
          )}
        </section>

        <section className="mt-14">
          <SectionHead title="Browse by category" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.slug}
                href={`/emoji/category/${category.slug}`}
                className={`${tile} flex flex-col gap-1 px-[18px] py-4`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {categoryEmoji[category.slug] ?? '✨'}
                </span>
                <span className="mt-2 text-[15px] font-semibold">{category.displayName}</span>
                <span className="text-[13px] text-muted-foreground">
                  {category.emojiCount} emojis
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-foreground p-8 text-background md:mt-[72px] md:p-12">
          <div>
            <h2 className="text-[28px] font-semibold tracking-tight md:text-[34px]">
              Got a text you can’t read?
            </h2>
            <p className="mt-1.5 opacity-75">
              Paste it in. 3 free interpretations a day, no sign-up.
            </p>
          </div>
          <Button asChild variant="brand" size="lg">
            <Link href="/interpreter">
              Open the interpreter <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
