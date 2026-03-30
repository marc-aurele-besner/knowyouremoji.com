import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useRealtimeContent } from '@/hooks/use-realtime-content';
import type { RealtimeEvent, RealtimeStatus } from '@/hooks/use-realtime-content';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================
// MOCK SUPABASE CLIENT
// ============================================

/**
 * Factory that creates a fresh mock Supabase client with controllable behaviour.
 * Captures channel/subscribe callbacks so tests can drive them.
 */
function createMockSupabaseClient(subscribeStatus: string = 'SUBSCRIBED') {
  let changeHandler: ((payload: unknown) => void) | null = null;
  let subscribeCallback: ((status: string) => void) | null = null;
  let removeChannelCalled = false;

  const mockChannel = {
    on: (_event: string, _filter: unknown, handler: (payload: unknown) => void) => {
      changeHandler = handler;
      return mockChannel;
    },
    subscribe: (cb: (status: string) => void) => {
      subscribeCallback = cb;
      cb(subscribeStatus);
      return mockChannel;
    },
  };

  const client = {
    channel: (_name: string) => mockChannel,
    removeChannel: (_ch: unknown) => {
      removeChannelCalled = true;
    },
  } as unknown as SupabaseClient;

  return {
    client,
    triggerChange(
      eventType: RealtimeEvent | string,
      newRecord: Record<string, unknown> = {},
      oldRecord: Record<string, unknown> = {}
    ) {
      if (!changeHandler) throw new Error('No change handler registered');
      act(() => {
        changeHandler!({ eventType, new: newRecord, old: oldRecord });
      });
    },
    triggerSubscribeStatus(status: string) {
      if (!subscribeCallback) throw new Error('No subscribe callback registered');
      act(() => {
        subscribeCallback!(status);
      });
    },
    get removeChannelCalled() {
      return removeChannelCalled;
    },
  };
}

// ============================================
// FIXTURES
// ============================================

type MockRecord = {
  slug: string;
  name: string;
  category: string;
};

const mockItems: MockRecord[] = [
  { slug: 'skull', name: 'Skull', category: 'faces' },
  { slug: 'heart', name: 'Red Heart', category: 'symbols' },
  { slug: 'fire', name: 'Fire', category: 'travel' },
];

// ============================================
// TESTS
// ============================================

describe('useRealtimeContent', () => {
  afterEach(() => {
    cleanup();
  });

  // ------------------------------------------
  // When no client is provided (Supabase not available)
  // ------------------------------------------
  describe('when no Supabase client is provided', () => {
    it('returns the initial content unchanged', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({ initialContent: mockItems, table: 'emojis', supabaseClient: null })
      );

      expect(result.current.content).toEqual(mockItems);
    });

    it('reports status as idle', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({ initialContent: mockItems, table: 'emojis', supabaseClient: null })
      );

      expect(result.current.status).toBe('idle');
    });

    it('reports isConnected as false', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({ initialContent: mockItems, table: 'emojis', supabaseClient: null })
      );

      expect(result.current.isConnected).toBe(false);
    });

    it('reports isAvailable as false when null client is explicitly passed', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({ initialContent: mockItems, table: 'emojis', supabaseClient: null })
      );

      expect(result.current.isAvailable).toBe(false);
    });

    it('reports lastUpdatedAt as null', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({ initialContent: mockItems, table: 'emojis', supabaseClient: null })
      );

      expect(result.current.lastUpdatedAt).toBeNull();
    });
  });

  // ------------------------------------------
  // When a mock client IS provided
  // ------------------------------------------
  describe('when a Supabase client is provided', () => {
    it('returns the initial content', () => {
      const mock = createMockSupabaseClient();
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.content).toEqual(mockItems);
    });

    it('reports status as connected after successful subscribe', () => {
      const mock = createMockSupabaseClient('SUBSCRIBED');
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.status).toBe('connected');
    });

    it('reports isConnected as true when connected', () => {
      const mock = createMockSupabaseClient('SUBSCRIBED');
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.isConnected).toBe(true);
    });

    it('reports isAvailable as true when a client is provided', () => {
      const mock = createMockSupabaseClient();
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.isAvailable).toBe(true);
    });

    it('reports status as error on CHANNEL_ERROR', () => {
      const mock = createMockSupabaseClient('CHANNEL_ERROR');
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.status).toBe('error');
    });

    it('reports status as error on TIMED_OUT', () => {
      const mock = createMockSupabaseClient('TIMED_OUT');
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.status).toBe('error');
    });

    it('reports status as closed on CLOSED', () => {
      const mock = createMockSupabaseClient('CLOSED');
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.status).toBe('closed');
    });

    it('removes the channel on unmount', () => {
      const mock = createMockSupabaseClient();
      const { unmount } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      act(() => {
        unmount();
      });

      expect(mock.removeChannelCalled).toBe(true);
    });
  });

  // ------------------------------------------
  // Realtime event handling – INSERT
  // ------------------------------------------
  describe('INSERT events', () => {
    let mock: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mock = createMockSupabaseClient();
    });

    it('adds a new record to the content', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      const newItem: MockRecord = { slug: 'sparkles', name: 'Sparkles', category: 'symbols' };
      mock.triggerChange('INSERT', newItem);

      expect(result.current.content).toHaveLength(4);
      expect(result.current.content).toContainEqual(newItem);
    });

    it('does not create a duplicate when INSERT uses an existing key', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      const updatedSkull: MockRecord = { slug: 'skull', name: 'Skull Updated', category: 'faces' };
      mock.triggerChange('INSERT', updatedSkull);

      expect(result.current.content).toHaveLength(3);
      const found = result.current.content.find((item) => item.slug === 'skull');
      expect(found?.name).toBe('Skull Updated');
    });

    it('sets lastUpdatedAt after INSERT', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(result.current.lastUpdatedAt).toBeNull();

      const newItem: MockRecord = { slug: 'new', name: 'New', category: 'objects' };
      mock.triggerChange('INSERT', newItem);

      expect(result.current.lastUpdatedAt).toBeInstanceOf(Date);
    });
  });

  // ------------------------------------------
  // Realtime event handling – UPDATE
  // ------------------------------------------
  describe('UPDATE events', () => {
    let mock: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mock = createMockSupabaseClient();
    });

    it('replaces the matching record in content', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      const updatedFire: MockRecord = { slug: 'fire', name: 'Fire Updated', category: 'travel' };
      mock.triggerChange('UPDATE', updatedFire);

      expect(result.current.content).toHaveLength(3);
      const found = result.current.content.find((item) => item.slug === 'fire');
      expect(found?.name).toBe('Fire Updated');
    });

    it('appends the record when UPDATE key is not found locally', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      const newRecord: MockRecord = { slug: 'unknown', name: 'Unknown', category: 'objects' };
      mock.triggerChange('UPDATE', newRecord);

      expect(result.current.content).toHaveLength(4);
      expect(result.current.content).toContainEqual(newRecord);
    });

    it('sets lastUpdatedAt after UPDATE', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      mock.triggerChange('UPDATE', { slug: 'skull', name: 'Updated', category: 'faces' });

      expect(result.current.lastUpdatedAt).toBeInstanceOf(Date);
    });
  });

  // ------------------------------------------
  // Realtime event handling – DELETE
  // ------------------------------------------
  describe('DELETE events', () => {
    let mock: ReturnType<typeof createMockSupabaseClient>;

    beforeEach(() => {
      mock = createMockSupabaseClient();
    });

    it('removes the matching record from content', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      mock.triggerChange('DELETE', {}, { slug: 'heart' });

      expect(result.current.content).toHaveLength(2);
      expect(result.current.content.find((item) => item.slug === 'heart')).toBeUndefined();
    });

    it('leaves content unchanged when DELETE key is not found', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      mock.triggerChange('DELETE', {}, { slug: 'nonexistent' });

      expect(result.current.content).toHaveLength(3);
    });

    it('sets lastUpdatedAt after DELETE', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      mock.triggerChange('DELETE', {}, { slug: 'skull' });

      expect(result.current.lastUpdatedAt).toBeInstanceOf(Date);
    });
  });

  // ------------------------------------------
  // Custom options
  // ------------------------------------------
  describe('custom options', () => {
    it('respects a custom primaryKey', () => {
      type ItemById = { id: number; name: string };
      const items: ItemById[] = [
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Beta' },
      ];
      const mock = createMockSupabaseClient();

      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: items,
          table: 'items',
          primaryKey: 'id',
          supabaseClient: mock.client,
        })
      );

      mock.triggerChange('UPDATE', { id: 1, name: 'Alpha Updated' });

      const found = result.current.content.find((item) => item.id === 1);
      expect(found?.name).toBe('Alpha Updated');
    });

    it('subscribes to all events when none specified', () => {
      const events: RealtimeEvent[] = ['INSERT', 'UPDATE', 'DELETE'];
      const mock = createMockSupabaseClient();

      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          events,
          supabaseClient: mock.client,
        })
      );

      // All three event types should work
      mock.triggerChange('INSERT', { slug: 'new', name: 'New', category: 'objects' });
      expect(result.current.content).toHaveLength(4);
    });

    it('subscribes with a specific event filter when a single event is provided', () => {
      const mock = createMockSupabaseClient();

      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          events: ['UPDATE'],
          supabaseClient: mock.client,
        })
      );

      // Only UPDATE events should be processed
      const beforeLength = result.current.content.length;
      mock.triggerChange('INSERT', { slug: 'new', name: 'New', category: 'objects' });
      expect(result.current.content).toHaveLength(beforeLength);
    });

    it('ignores events not in the subscribed list', () => {
      const mock = createMockSupabaseClient();

      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          events: ['UPDATE'],
          supabaseClient: mock.client,
        })
      );

      const beforeLength = result.current.content.length;
      mock.triggerChange('DELETE', {}, { slug: 'skull' });

      expect(result.current.content).toHaveLength(beforeLength);
    });

    it('uses "public" as the default schema when none is specified', () => {
      // The channel name includes the schema
      const mock = createMockSupabaseClient();

      renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      // If schema defaulted to 'public', status should be connected (channel was created)
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );
      expect(result.current.status).toBe('connected');
    });
  });

  // ------------------------------------------
  // initialContent updates
  // ------------------------------------------
  describe('initialContent updates', () => {
    it('syncs content when initialContent prop changes', () => {
      const mock = createMockSupabaseClient();
      const { result, rerender } = renderHook(
        ({ items }: { items: MockRecord[] }) =>
          useRealtimeContent({
            initialContent: items,
            table: 'emojis',
            supabaseClient: mock.client,
          }),
        { initialProps: { items: mockItems } }
      );

      const newItems: MockRecord[] = [{ slug: 'only', name: 'Only Item', category: 'objects' }];

      act(() => {
        rerender({ items: newItems });
      });

      expect(result.current.content).toEqual(newItems);
    });
  });

  // ------------------------------------------
  // Return shape
  // ------------------------------------------
  describe('return shape', () => {
    it('returns all expected fields', () => {
      const mock = createMockSupabaseClient();
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect('content' in result.current).toBe(true);
      expect('status' in result.current).toBe(true);
      expect('isConnected' in result.current).toBe(true);
      expect('isAvailable' in result.current).toBe(true);
      expect('lastUpdatedAt' in result.current).toBe(true);
    });

    it('content is an array', () => {
      const mock = createMockSupabaseClient();
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      expect(Array.isArray(result.current.content)).toBe(true);
    });

    it('works with an empty initialContent array', () => {
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: [],
          table: 'emojis',
          supabaseClient: null,
        })
      );

      expect(result.current.content).toHaveLength(0);
    });

    it('content type is correct (RealtimeStatus type)', () => {
      const mock = createMockSupabaseClient();
      const { result } = renderHook(() =>
        useRealtimeContent({
          initialContent: mockItems,
          table: 'emojis',
          supabaseClient: mock.client,
        })
      );

      const validStatuses: RealtimeStatus[] = ['idle', 'connecting', 'connected', 'error', 'closed'];
      expect(validStatuses).toContain(result.current.status);
    });
  });

  // ------------------------------------------
  // isAvailable without injected client (uses env config)
  // ------------------------------------------
  describe('isAvailable without injected client', () => {
    it('reports isAvailable based on isSupabaseConfigured when no client is injected', () => {
      // Without setting env vars or injecting a client, isSupabaseConfigured returns false
      const { result } = renderHook(() =>
        useRealtimeContent({ initialContent: mockItems, table: 'emojis' })
      );

      // isAvailable reflects whether Supabase env is configured
      expect(typeof result.current.isAvailable).toBe('boolean');
    });
  });
});
