'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * global-error replaces the root layout, so globals.css and the Tailwind
 * theme are not loaded here. The styles below are a self-contained copy of
 * the warm-neutral tokens (light + dark via the OS colour scheme).
 */
const styles = `
  .kye-ge{--bg:#fafaf9;--fg:#0c0a09;--card:#fff;--border:#e7e5e4;--muted:#57534e;--ring:#f59e0b;
    min-height:100vh;margin:0;display:flex;align-items:center;justify-content:center;padding:24px 16px;
    background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
  @media (prefers-color-scheme:dark){.kye-ge{--bg:#0c0a09;--fg:#fafaf9;--card:#161311;--border:#2b2724;--muted:#a8a29e}}
  .kye-ge-box{max-width:480px;width:100%;text-align:center;border:1px dashed var(--border);border-radius:16px;padding:48px 24px}
  .kye-ge-emoji{font-size:56px;line-height:1;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
  .kye-ge h1{font-size:32px;font-weight:600;letter-spacing:-0.02em;margin:20px 0 8px}
  .kye-ge p{color:var(--muted);margin:0 0 28px;line-height:1.5}
  .kye-ge-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .kye-ge-btn{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 20px;border-radius:999px;
    font:500 15px/1 inherit;font-family:inherit;cursor:pointer;text-decoration:none;border:1px solid var(--border);background:var(--card);color:var(--fg)}
  .kye-ge-btn.primary{background:var(--fg);border-color:var(--fg);color:var(--bg)}
  .kye-ge-btn:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
`;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="kye-ge">
        <style>{styles}</style>
        <main className="kye-ge-box">
          <div className="kye-ge-emoji" aria-hidden="true">
            😵‍💫
          </div>
          <h1>Something went wrong!</h1>
          <p>We apologize for the inconvenience. Our team has been notified.</p>
          <div className="kye-ge-row">
            <button type="button" onClick={reset} className="kye-ge-btn primary">
              Try again
            </button>
            <Link href="/" className="kye-ge-btn">
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
