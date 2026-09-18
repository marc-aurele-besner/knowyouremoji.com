/** Validate the production output, without the unit-test preload or data mocks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getAllEmojis } from '../src/lib/emoji-data';
import { getAllCombos } from '../src/lib/combo-data';
import { buildSitemap } from '../src/lib/sitemap-entries';
import { getSiteName } from '../src/lib/metadata';

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

const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
assert(
  home.includes(`<title>${getSiteName()} - Decode What Emojis Really Mean</title>`),
  'Homepage title must not repeat the site name'
);
assert(/href="\/emoji\/[^"/]+"/.test(home), 'Homepage must render crawlable emoji links');
assert(!home.includes('/og-image.png'), 'Homepage must not reference the missing social image');
assert(fs.existsSync(path.join(process.cwd(), 'public/logo.png')));

const robots = fs.readFileSync(path.join(output, 'robots.txt.body'), 'utf8');
for (const route of ['login', 'register', 'forgot-password', 'reset-password']) {
  assert(!robots.includes(`Disallow: /${route}`), `${route} must be crawlable`);
  const html = fs.readFileSync(path.join(output, `${route}.html`), 'utf8');
  assert(html.includes('name="robots" content="noindex, follow"'), `${route} must remain noindex`);
}

console.log(
  `SEO build checks passed: ${emojis.length} emojis, ${combos.length} combos, ${actualPaths.length} sitemap URLs.`
);
