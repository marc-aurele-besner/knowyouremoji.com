// IMPORTANT: setup-dom must be imported BEFORE @testing-library/jest-dom.
// Starting with @testing-library/dom v10, the `screen` object captures
// `document.body` at module load time and throws if a global `document` is
// not available yet. See https://testing-library.com/s/screen-global-error
//
// @testing-library/dom v10 became a (peer) dependency of
// @testing-library/jest-dom v7.0.0 — before that, jest-dom did not pull in
// @testing-library/dom at all, so the load order didn't matter.
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
