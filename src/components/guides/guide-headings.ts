/**
 * Helpers for the "In this guide" table of contents on guide articles.
 *
 * Guide bodies are Markdown rendered to HTML by `marked`, which emits bare
 * `<h2>` tags without ids. `withHeadingAnchors` gives each top-level section
 * heading a stable, unique id and returns the list so the page can render a
 * table of contents that links to them.
 */

export interface GuideHeading {
  /** Anchor id injected on the `<h2>` */
  id: string;
  /** Plain-text heading label */
  text: string;
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/** Strip tags and decode the handful of entities `marked` emits. */
export function headingText(innerHtml: string): string {
  return innerHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .trim();
}

/** Turn a heading label into a URL-safe slug (falls back to "section"). */
export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
  return slug || 'section';
}

/**
 * Add ids to every attribute-less `<h2>` in `html` and collect them.
 * Duplicate labels get a numeric suffix so ids stay unique.
 */
export function withHeadingAnchors(html: string): { html: string; headings: GuideHeading[] } {
  const headings: GuideHeading[] = [];
  const seen = new Map<string, number>();

  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_match, inner: string) => {
    const text = headingText(inner);
    const base = `section-${slugifyHeading(text)}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return { html: out, headings };
}
