'use client';

import { useEffect } from 'react';

export function EmojiViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch('/api/emojis/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Silently ignore — view tracking is best-effort
    });
  }, [slug]);

  return null;
}
