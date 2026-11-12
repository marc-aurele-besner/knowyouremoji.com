/** Validate the production output, without the unit-test preload or data mocks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getAllEmojis } from '../src/lib/emoji-data';
import { getAllCombos } from '../src/lib/combo-data';
import { buildSitemap } from '../src/lib/sitemap-entries';
import { getSiteName } from '../src/lib/metadata';
import { isEmojiTemplated } from '../src/lib/emoji-boilerplate';

const output = path.join(process.cwd(), '.next/server/app');
const emojis = getAllEmojis();
const combos = getAllCombos();
assert(emojis.length > 0, 'The production emoji catalog must not be empty');
assert(combos.length > 0, 'The production combo catalog must not be empty');

const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml.body'), 'utf8');
const actualPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, url]) => new URL(url).pathname
);
const expectedPaths = buildSitemap().map(({ url }) => new URL(url).pathname);
assert.deepEqual(
  actualPaths.sort(),
  expectedPaths.sort(),
  'Built sitemap must include the full indexable catalog'
);
assert(actualPaths.includes('/emoji/skull'), 'Sitemap must include emoji detail pages');
assert(
  actualPaths.some((url) => /^\/combo\/[^/]+$/.test(url)),
  'Sitemap must include combo detail pages'
);
// Editorial routes must be generated; tools such as /interpreter render on demand.
for (const route of actualPaths.filter((url) => /^\/(emoji|combo|guides|compare)\//.test(url))) {
  const file = `${route.slice(1)}.html`;
  assert(fs.existsSync(path.join(output, file)), `Sitemap route must be prerendered: ${route}`);
}

/**
 * The template phrases a batch-generated emoji page carries. See issue #480:
 * a page whose body still contains one of these was never written about its
 * own emoji, so it must not be in the sitemap.
 */
const TEMPLATE_PHRASES = ['is a natural fit for', 'is the emoji of'];

// Every emoji URL in the sitemap must be about its own emoji. This is the
// crawl the issue asks for: no indexable URL may carry the template.
const sitemapEmojiRoutes = actualPaths.filter((url) => /^\/emoji\/[^/]+$/.test(url));
for (const route of sitemapEmojiRoutes) {
  const html = fs.readFileSync(path.join(output, `${route.slice(1)}.html`), 'utf8');
  for (const phrase of TEMPLATE_PHRASES) {
    assert(
      !html.toLowerCase().includes(phrase),
      `Sitemap emoji page must not carry the template phrase "${phrase}": ${route}`
    );
  }
}

// The pages that still carry the template are kept online for readers, so
// they have to answer with noindex rather than 404.
const templatedEmojis = emojis.filter((emoji) => isEmojiTemplated(emoji));
for (const emoji of templatedEmojis) {
  const route = `/emoji/${emoji.slug}`;
  assert(
    !actualPaths.includes(route),
    `Templated emoji page must stay out of the sitemap: ${route}`
  );

  const file = path.join(output, `${route.slice(1)}.html`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  assert(
    html.includes('name="robots" content="noindex, follow"'),
    `Templated emoji page must answer with noindex: ${route}`
  );
}

// The hand-written pages stay indexable, so the fix has not cost the site
// the pages that are worth ranking.
for (const slug of ['skull']) {
  const route = `/emoji/${slug}`;
  assert(actualPaths.includes(route), `Hand-written emoji page must stay in the sitemap: ${route}`);
  const html = fs.readFileSync(path.join(output, `${route.slice(1)}.html`), 'utf8');
  assert(
    html.includes('name="robots" content="index, follow"'),
    `Hand-written emoji page must stay indexable: ${route}`
  );
}

const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
assert(
  home.includes(`<title>${getSiteName()} - Decode What Emojis Really Mean</title>`),
  'Homepage title must not repeat the site name'
);
assert(/href="\/emoji\/[^"/]+"/.test(home), 'Homepage must render crawlable emoji links');
assert(home.includes('/og-image.png'), 'Homepage must use the static social image');
assert(
  fs.existsSync(path.join(process.cwd(), 'public/og-image.png')),
  'Static social image must exist at public/og-image.png'
);
assert(fs.existsSync(path.join(process.cwd(), 'public/logo.png')));

const robots = fs.readFileSync(path.join(output, 'robots.txt.body'), 'utf8');
for (const route of ['login', 'register', 'forgot-password', 'reset-password']) {
  assert(!robots.includes(`Disallow: /${route}`), `${route} must be crawlable`);
  const html = fs.readFileSync(path.join(output, `${route}.html`), 'utf8');
  assert(html.includes('name="robots" content="noindex, follow"'), `${route} must remain noindex`);
}

console.log(
  `SEO build checks passed: ${emojis.length} emojis, ${combos.length} combos, ` +
    `${actualPaths.length} sitemap URLs, ${sitemapEmojiRoutes.length} indexable emoji pages, ` +
    `${templatedEmojis.length} templated emoji pages held back.`
);
