'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { SupabaseClient, RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

/** Realtime event types from Supabase Postgres changes */
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

/** Connection status for the realtime subscription */
export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

export interface UseRealtimeContentOptions<T extends Record<string, unknown>> {
  /** Initial content to display before any realtime updates */
  initialContent: T[];
  /** Database table name to subscribe to */
  table: string;
  /** Database schema (default: 'public') */
  schema?: string;
  /**
   * Key used to identify and match records for UPDATE/DELETE operations.
   * Must be a property name present on T (default: 'slug').
   */
  primaryKey?: keyof T & string;
  /** Events to listen to (default: all events) */
  events?: RealtimeEvent[];
  /**
   * Optional Supabase client to use for realtime subscriptions.
   * When provided, this client is used directly and Supabase configuration
   * checks are bypassed. Useful for testing and server-side rendering.
   */
  supabaseClient?: SupabaseClient | null;
}

export interface UseRealtimeContentReturn<T> {
  /** Current content (may be updated by realtime events) */
  content: T[];
  /** Connection status of the realtime subscription */
  status: RealtimeStatus;
  /** Whether realtime is actively connected */
  isConnected: boolean;
  /** Whether Supabase is configured and realtime is available */
  isAvailable: boolean;
  /** Timestamp of the most recent realtime update, or null if no updates received */
  lastUpdatedAt: Date | null;
}

// ============================================
// HOOK
// ============================================

/**
 * Custom hook for subscribing to real-time content updates via Supabase Realtime.
 *
 * Enables live content editing without a redeploy by listening to Postgres
 * change events (INSERT, UPDATE, DELETE) on a given table and keeping
 * local state in sync.
 *
 * Falls back gracefully to \`initialContent\` when Supabase is not configured.
 *
 * @example
 * \`\`\`tsx
 * // Subscribe to emoji table changes
 * const { content: emojis, isConnected } = useRealtimeContent({
 *   initialContent: staticEmojis,
 *   table: 'emojis',
 * });
 *
 * // Subscribe only to UPDATE events on combos
 * const { content: combos } = useRealtimeContent({
 *   initialContent: staticCombos,
 *   table: 'combos',
 *   events: ['UPDATE'],
 *   primaryKey: 'slug',
 * });
 * \`\`\`
 */
export function useRealtimeContent<T extends Record<string, unknown>>({
  initialContent,
  table,
  schema = 'public',
  primaryKey = 'slug',
  events = ['INSERT', 'UPDATE', 'DELETE'],
  supabaseClient: injectedClient,
}: UseRealtimeContentOptions<T>): UseRealtimeContentReturn<T> {
  const [content, setContent] = useState<T[]>(initialContent);
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // Keep a ref to the channel so we can remove it on cleanup
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Keep a ref to the latest content so handlers always see the current value
  const contentRef = useRef<T[]>(initialContent);

  // Sync content ref whenever state changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Update content when initialContent prop changes (e.g., SSR → client hydration)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      const eventType = payload.eventType as RealtimeEvent;

      // Ignore events that are not in the subscribed list
      if (!events.includes(eventType)) {
        return;
      }

      setContent((prev) => {
        if (eventType === 'INSERT') {
          const newRecord = payload.new as T;
          // Avoid duplicates: replace if key already exists, otherwise append
          const exists = prev.some((item) => item[primaryKey] === newRecord[primaryKey]);
          if (exists) {
            return prev.map((item) =>
              item[primaryKey] === newRecord[primaryKey] ? newRecord : item
            );
          }
          return [...prev, newRecord];
        }

        if (eventType === 'UPDATE') {
          const updatedRecord = payload.new as T;
          const existsForUpdate = prev.some(
            (item) => item[primaryKey] === updatedRecord[primaryKey]
          );
          if (existsForUpdate) {
            return prev.map((item) =>
              item[primaryKey] === updatedRecord[primaryKey] ? updatedRecord : item
            );
          }
          // Record not found locally – append it
          return [...prev, updatedRecord];
        }

        // eventType === 'DELETE'
        const deletedRecord = payload.old as Partial<T>;
        return prev.filter((item) => item[primaryKey] !== deletedRecord[primaryKey]);
      });

      setLastUpdatedAt(new Date());
    },
    [events, primaryKey]
  );

  useEffect(() => {
    // Resolve the Supabase client: use injected client if provided, otherwise
    // fall back to the default browser client (requires Supabase to be configured).
    const supabase = injectedClient !== undefined ? injectedClient : getSupabaseClient();

    // If no client is available, stay in idle state with initial content
    if (!supabase) {
      return;
    }

    setStatus('connecting');

    const channelName = `realtime-content-${schema}-${table}`;

    // Build event filter – Supabase accepts '*' for all events or specific ones
    const eventFilter = events.length === 3 ? '*' : events[0];

    const channel = supabase
      .channel(channelName)
      .on<T>(
        'postgres_changes',
        { event: eventFilter as '*', schema, table },
        handleChange
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          setStatus('connected');
        } else if (subscribeStatus === 'CHANNEL_ERROR') {
          setStatus('error');
        } else if (subscribeStatus === 'TIMED_OUT') {
          setStatus('error');
        } else if (subscribeStatus === 'CLOSED') {
          setStatus('closed');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setStatus('closed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, schema, injectedClient]);

  // isAvailable: true when an explicit client was provided or Supabase env is configured
  const isAvailable = injectedClient !== undefined ? Boolean(injectedClient) : isSupabaseConfigured();
  const isConnected = status === 'connected';

  return {
    content,
    status,
    isConnected,
    isAvailable,
    lastUpdatedAt,
  };
}
