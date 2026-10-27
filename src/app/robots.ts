import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/metadata';

/**
 * User agents used by AI crawlers, answer engines, and AI-focused search
 * indexes.
 *
 * KnowYourEmoji is a publisher whose content exists to be read and cited.
 * Blocking these agents would remove the site from AI answers entirely, so
 * they are explicitly allowed — both the search/citation crawlers and the
 * training crawlers.
 *
 * Listing them explicitly (rather than relying on the wildcard rule) does
 * three things:
 *
 * 1. It documents the intent, so a future change to the wildcard rule does
 *    not silently de-index the site from AI answers.
 * 2. It makes the policy auditable — you can see exactly which agents may
 *    read the content.
 * 3. It gives us a single list to maintain if the policy ever needs to
 *    become stricter.
 */
export const AI_CRAWLER_USER_AGENTS = [
  // OpenAI — search index, user-triggered fetches, and training.
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic — search index, user-triggered fetches, and training.
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  // Perplexity — search index and user-triggered fetches.
  'PerplexityBot',
  'Perplexity-User',
  // Google — Gemini grounding and Vertex AI training. Does not affect
  // Google Search crawling, which is handled by Googlebot.
  'Google-Extended',
  // Apple — Apple Intelligence grounding.
  'Applebot-Extended',
  // Other AI answer engines and training crawlers.
  'Amazonbot',
  'meta-externalagent',
  'Bytespider',
  'CCBot',
] as const;

/**
 * Paths that serve machine-readable content for agents.
 *
 * These are explicitly allowed so the intent is visible in robots.txt
 * rather than being an implicit consequence of the wildcard rule.
 */
export const AGENT_CONTENT_PATHS = ['/llms.txt', '/llms-full.txt'] as const;

/**
 * Generate robots.txt configuration for crawler directives.
 *
 * Public marketing, editorial, and tooling surfaces remain crawlable.
 * Private / dynamic app surfaces (API endpoints, authenticated
 * dashboards and admin tooling) are disallowed. Public authentication
 * pages remain crawlable so search engines can read their noindex tags;
 * blocking them here could leave URL-only entries in search results.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * @see issue #355 (SEO-P1-001 sitemap / robots / thin-page alignment)
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/admin'],
      },
      {
        // AI crawlers and answer engines. Explicitly allowed so they can
        // read, quote, and cite the interpretation content.
        userAgent: [...AI_CRAWLER_USER_AGENTS],
        allow: ['/', ...AGENT_CONTENT_PATHS],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
