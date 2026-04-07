import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render } from '@testing-library/react';
import { EmojiViewTracker } from '@/components/emoji/emoji-view-tracker';

const mockFetch = mock(() => Promise.resolve(new Response(JSON.stringify({ ok: true }))));

describe('EmojiViewTracker', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mockFetch.mockClear();
  });

  it('fires a POST request to /api/emojis/view on mount', async () => {
    globalThis.fetch = mockFetch as unknown as typeof globalThis.fetch;
    render(<EmojiViewTracker slug="fire" />);

    // Wait for the useEffect to fire
    await new Promise((r) => setTimeout(r, 10));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toBe('/api/emojis/view');
    expect(call[1].method).toBe('POST');
    expect(JSON.parse(call[1].body as string)).toEqual({ slug: 'fire' });
  });

  it('renders nothing', () => {
    globalThis.fetch = mockFetch as unknown as typeof globalThis.fetch;
    const { container } = render(<EmojiViewTracker slug="fire" />);
    expect(container.innerHTML).toBe('');
  });

  it('does not throw when fetch fails', async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error('network error'))
    ) as unknown as typeof globalThis.fetch;
    render(<EmojiViewTracker slug="fire" />);
    await new Promise((r) => setTimeout(r, 10));
    // No error thrown — test passes
  });
});
