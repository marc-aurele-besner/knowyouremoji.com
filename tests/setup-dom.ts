import { GlobalWindow } from 'happy-dom';

/**
 * DOM globals for the test environment.
 *
 * This module MUST be loaded before any module that pulls in
 * @testing-library/dom (transitively via @testing-library/react or
 * @testing-library/jest-dom). Starting with @testing-library/dom v10, the
 * `screen` object captures `document.body` at module load time and throws
 * if a global `document` is not available yet.
 *
 * @testing-library/dom v10 became a peer dependency of
 * @testing-library/jest-dom v7.0.0, so this comes up whenever that package
 * is upgraded.
 *
 * See https://testing-library.com/s/screen-global-error
 */

/** Captured at load time — tests must not be able to leave window.SyntaxError undefined */
const NativeError = Error;
const NativeTypeError = TypeError;
const NativeSyntaxError = SyntaxError;

// Create a happy-dom window and register its properties globally.
// Disable fetching external CSS — linked stylesheets can trigger happy-dom selector parsing
// bugs under concurrent tests when window.SyntaxError is momentarily inconsistent.
const window = new GlobalWindow({
  url: 'https://localhost:3000/',
  settings: { disableCSSFileLoading: true },
});

function patchWindowConstructors(
  w: { Error?: unknown; TypeError?: unknown; SyntaxError?: unknown } | null | undefined
): void {
  if (!w) return;
  // happy-dom's SelectorParser uses this.window.SyntaxError when validating CSS selectors
  w.Error = NativeError;
  w.TypeError = NativeTypeError;
  w.SyntaxError = NativeSyntaxError;
}

patchWindowConstructors(window);

// Register DOM globals that testing-library needs
Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  location: window.location,
  Error: NativeError,
  TypeError: NativeTypeError,
  SyntaxError: NativeSyntaxError,
  HTMLElement: window.HTMLElement,
  HTMLButtonElement: window.HTMLButtonElement,
  HTMLDivElement: window.HTMLDivElement,
  HTMLHeadingElement: window.HTMLHeadingElement,
  HTMLParagraphElement: window.HTMLParagraphElement,
  HTMLInputElement: window.HTMLInputElement,
  HTMLAnchorElement: window.HTMLAnchorElement,
  Element: window.Element,
  Node: window.Node,
  NodeFilter: window.NodeFilter,
  DocumentFragment: window.DocumentFragment,
  customElements: window.customElements,
  MutationObserver: window.MutationObserver,
  getComputedStyle: window.getComputedStyle.bind(window),
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  Event: window.Event,
  CustomEvent: window.CustomEvent,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  FocusEvent: window.FocusEvent,
  ResizeObserver: window.ResizeObserver,
  IntersectionObserver: window.IntersectionObserver,
});
