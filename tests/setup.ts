// IMPORTANT: setup-dom must be imported BEFORE @testing-library/jest-dom.
// Starting with @testing-library/dom v10, the `screen` object captures
// `document.body` at module load time and throws if a global `document` is
// not available yet. See https://testing-library.com/s/screen-global-error
//
// @testing-library/dom v10 became a (peer) dependency of
// @testing-library/jest-dom v7.0.0 — before that, jest-dom did not pull in
// @testing-library/dom at all, so the load order didn't matter.

import fs from 'fs';

// `import path from 'path'` would shadow the local `const path = require('path')`
// further down in this file, so alias the import to `nodePath` here.
import nodePath from 'path';

import type { Emoji } from '@/types/emoji';
import type { EmojiCombo } from '@/types/combo';

import { __setEmojiCacheForTesting, __setEmojiFsLoaderForTesting } from '@/lib/emoji-data';
import { __setComboCacheForTesting, __setComboFsLoaderForTesting } from '@/lib/combo-data';

/**
 * Reads every JSON file in `dir` and parses it as `T`. Filters out files
 * matching the optional `fileFilter` predicate (e.g. to skip duplicate-naming
 * files). Mirrors what `import.meta.glob` would resolve at build time.
 */
function loadJsonDir<T>(dir: string, fileFilter: (name: string) => boolean = () => true): T[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json') && fileFilter(name))
    .map((name) => JSON.parse(fs.readFileSync(nodePath.join(dir, name), 'utf-8')) as T);
}

const emojisDir = nodePath.join(process.cwd(), 'src', 'data', 'emojis');
const combosDir = nodePath.join(process.cwd(), 'src', 'data', 'combos');

// Prime the data loader caches before any test code runs. The data loaders use
// `import.meta.glob` for production builds (Turbopack resolves the pattern
// statically), but Bun's test runner doesn't implement `import.meta.glob`, so
// these hooks inject the parsed data at preload time.
//
// We also register a synchronous filesystem loader so that tests which call
// `clearEmojiCache()` / `clearComboCache()` in `beforeEach` can reload real
// data on the next `getAllEmojis()` / `getAllCombos()` call.
__setEmojiCacheForTesting(loadJsonDir<Emoji>(emojisDir, (name) => !name.endsWith('-emoji.json')));
__setComboCacheForTesting(loadJsonDir<EmojiCombo>(combosDir));

__setEmojiFsLoaderForTesting(() =>
  loadJsonDir<Emoji>(emojisDir, (name) => !name.endsWith('-emoji.json'))
);
__setComboFsLoaderForTesting(() => loadJsonDir<EmojiCombo>(combosDir));

import './setup-dom';

// Bun's test runner loads @testing-library/dom before any preload runs, which
// causes its `screen` object to capture `document.body` while it's still
// undefined. After setup-dom has installed the DOM globals, drop the cached
// copy of @testing-library/dom so the next import evaluates `screen` against
// the live happy-dom document.
const path = require('path') as typeof import('path'); // eslint-disable-line @typescript-eslint/no-require-imports
const domResolved = require.resolve('@testing-library/dom');
if (require.cache[domResolved]) {
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}@testing-library${path.sep}dom${path.sep}`)) {
      delete require.cache[key];
    }
  }
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/dom');

import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'bun:test';

const NativeError = Error;
const NativeTypeError = TypeError;
const NativeSyntaxError = SyntaxError;

function patchWindowConstructors(
  w: { Error?: unknown; TypeError?: unknown; SyntaxError?: unknown } | null | undefined
): void {
  if (!w) return;
  // happy-dom's SelectorParser uses this.window.SyntaxError when validating CSS selectors
  w.Error = NativeError;
  w.TypeError = NativeTypeError;
  w.SyntaxError = NativeSyntaxError;
}

beforeEach(() => {
  globalThis.Error = NativeError;
  globalThis.TypeError = NativeTypeError;
  globalThis.SyntaxError = NativeSyntaxError;
  patchWindowConstructors(globalThis.window);
});

afterEach(() => {
  globalThis.Error = NativeError;
  globalThis.TypeError = NativeTypeError;
  globalThis.SyntaxError = NativeSyntaxError;
  patchWindowConstructors(globalThis.window);
});
