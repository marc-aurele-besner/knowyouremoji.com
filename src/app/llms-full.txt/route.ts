import { buildLlmsFullTxt } from '@/lib/llms';

/**
 * Serve `/llms-full.txt` — the complete interpretation corpus as Markdown.
 *
 * This is the retrieval-oriented counterpart to `/llms.txt`: every emoji
 * meaning, every emoji combo meaning, and every published guide, rendered
 * as plain Markdown with the canonical page URL attached to each entry so
 * an agent can attribute a quote back to a real page.
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
  return new Response(buildLlmsFullTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
