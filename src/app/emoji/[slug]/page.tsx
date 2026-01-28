import { notFound } from 'next/navigation';
import { getEmojiBySlug, getAllEmojiSlugs } from '@/lib/emoji-data';
import { EmojiHeader } from '@/components/emoji/emoji-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';
import type { ContextMeaning, PlatformNote, GenerationalNote, EmojiWarning } from '@/types/emoji';

interface EmojiPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all emoji pages at build time
 */
export async function generateStaticParams() {
  const slugs = getAllEmojiSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for the emoji page
 */
export async function generateMetadata({ params }: EmojiPageProps): Promise<Metadata> {
  const { slug } = await params;
  const emoji = getEmojiBySlug(slug);

  if (!emoji) {
    return {};
  }

  return {
    title: emoji.seoTitle,
    description: emoji.seoDescription,
    openGraph: {
      title: `${emoji.character} ${emoji.name} Emoji Meaning`,
      description: emoji.tldr,
    },
  };
}

/**
 * Risk level badge variant mapping
 */
function getRiskBadgeVariant(
  riskLevel: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (riskLevel) {
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Warning severity badge variant mapping
 */
function getSeverityBadgeVariant(
  severity: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity) {
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Context type label mapping
 */
function getContextLabel(context: string): string {
  const labels: Record<string, string> = {
    LITERAL: 'Literal',
    SLANG: 'Slang',
    IRONIC: 'Ironic',
    PASSIVE_AGGRESSIVE: 'Passive-Aggressive',
    DATING: 'Dating',
    WORK: 'Work',
    RED_FLAG: 'Red Flag',
  };
  return labels[context] || context;
}

/**
 * Platform label mapping
 */
function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    IMESSAGE: 'iMessage',
    INSTAGRAM: 'Instagram',
    TIKTOK: 'TikTok',
    WHATSAPP: 'WhatsApp',
    SLACK: 'Slack',
    DISCORD: 'Discord',
    TWITTER: 'Twitter/X',
  };
  return labels[platform] || platform;
}

/**
 * Generation label mapping
 */
function getGenerationLabel(generation: string): string {
  const labels: Record<string, string> = {
    GEN_Z: 'Gen Z',
    MILLENNIAL: 'Millennial',
    GEN_X: 'Gen X',
    BOOMER: 'Boomer',
  };
  return labels[generation] || generation;
}

/**
 * Emoji detail page component
 */
export default async function EmojiPage({ params }: EmojiPageProps) {
  const { slug } = await params;
  const emoji = getEmojiBySlug(slug);

  if (!emoji) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with emoji character, name, and copy button */}
      <EmojiHeader
        emoji={{
          character: emoji.character,
          name: emoji.name,
          unicode: emoji.unicode,
          shortcodes: [`:${emoji.shortName}:`],
        }}
      />

      {/* TL;DR Section */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">TL;DR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{emoji.tldr}</p>
          </CardContent>
        </Card>
      </section>

      {/* Context Meanings Section */}
      {emoji.contextMeanings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Context Meanings
          </h2>
          <div className="space-y-4">
            {emoji.contextMeanings.map((ctx: ContextMeaning, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{getContextLabel(ctx.context)}</Badge>
                    <Badge variant={getRiskBadgeVariant(ctx.riskLevel)}>{ctx.riskLevel} Risk</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{ctx.meaning}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Example: &ldquo;{ctx.example}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Platform Notes Section */}
      {emoji.platformNotes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Platform Notes
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {emoji.platformNotes.map((note: PlatformNote, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Badge variant="secondary">{getPlatformLabel(note.platform)}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{note.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Generational Notes Section */}
      {emoji.generationalNotes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Generational Differences
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {emoji.generationalNotes.map((note: GenerationalNote, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Badge variant="outline">{getGenerationLabel(note.generation)}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{note.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Warnings Section */}
      {emoji.warnings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Warnings</h2>
          <div className="space-y-4">
            {emoji.warnings.map((warning: EmojiWarning, index: number) => (
              <Card key={index} className="border-yellow-200 dark:border-yellow-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⚠️</span>
                    <CardTitle className="text-base">{warning.title}</CardTitle>
                    <Badge variant={getSeverityBadgeVariant(warning.severity)}>
                      {warning.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{warning.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Unicode Info Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Technical Details
        </h2>
        <Card>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Unicode</dt>
                <dd className="text-gray-900 dark:text-gray-100">U+{emoji.unicode}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Version</dt>
                <dd className="text-gray-900 dark:text-gray-100">{emoji.unicodeVersion}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="text-gray-900 dark:text-gray-100 capitalize">{emoji.category}</dd>
              </div>
              {emoji.subcategory && (
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Subcategory</dt>
                  <dd className="text-gray-900 dark:text-gray-100">{emoji.subcategory}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
