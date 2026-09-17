/**
 * Small helpers for combo content generation.
 */

/** Seeded RNG (mulberry32). Deterministic and stable across runs. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function rand() {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string into a uint32 seed. */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Reseed per slug for unique, deterministic combos. */
export function rngForSlug(slug: string, salt: string = ''): () => number {
  return mulberry32(hashSeed(`${slug}::${salt}`));
}

/** Pick a stable index into an array from a 0..1 random value. */
export function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

/** Fisher–Yates shuffle (in place) for variety-from-pick. */
export function shuffle<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick n unique items from a pool in deterministic order (no replacement). */
export function pickN<T>(pool: readonly T[], n: number, rand: () => number): T[] {
  const copy = pool.slice();
  shuffle(copy, rand);
  return copy.slice(0, Math.min(n, copy.length));
}

/** Replace placeholders like `{e}` or `{c}` in a template string. */
export function fillTemplate(text: string, ctx: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) =>
    ctx[key] !== undefined ? String(ctx[key]) : `{${key}}`
  );
}

/** Whitespace-delimited word count. */
export function countWords(text: string): number {
  if (typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Title-case arbitrary text, used for case-fixed header lines. */
export function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}
