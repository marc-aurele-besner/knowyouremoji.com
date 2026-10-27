import { buildLlmsTxt } from '@/lib/llms';

/**
 * Serve `/llms.txt` — the curated, agent-facing map of the site.
 *
 * Implements the llmstxt.org convention: an H1 title, a blockquote summary,
 * and a link index grouped by section. AI crawlers and answer engines use
 * this to understand what the site covers and where the canonical content
 * lives before deciding what to retrieve.
 *
 * Prerendered at build time and revalidated hourly, since the underlying
 * content is static JSON and Markdown.
 *
 * @see https://llmstxt.org
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
