import '@testing-library/jest-dom';
import { GlobalWindow } from 'happy-dom';

// Create a happy-dom window and register its properties globally
const window = new GlobalWindow({ url: 'https://localhost:3000/' });

// Register DOM globals that testing-library needs
Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  location: window.location,
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
