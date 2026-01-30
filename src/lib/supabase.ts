/**
 * Supabase Client Module for KnowYourEmoji
 *
 * This module provides Supabase client instances for:
 * - Browser-side authentication (getSupabaseClient)
 * - Server-side API routes (getSupabaseServerClient)
 * - Admin operations with service role (getSupabaseAdminClient)
 *
 * The clients are optional - if Supabase is not configured, all getters
 * gracefully return null without errors.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// CONSTANTS
// ============================================

/**
 * Storage key for Supabase auth session
 * Uses 'kye' (KnowYourEmoji) as namespace prefix
 */
export const SUPABASE_STORAGE_KEY = 'kye-auth-token';

// ============================================
// CLIENT INSTANCES
// ============================================

/** Cached browser client instance */
let browserClient: SupabaseClient | null = null;

/** Cached server client instance */
let serverClient: SupabaseClient | null = null;

/** Cached admin client instance */
let adminClient: SupabaseClient | null = null;

// ============================================
// CONFIGURATION CHECK
// ============================================

/**
 * Check if Supabase is configured with required environment variables
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
  );
}

// ============================================
// CLIENT GETTERS
// ============================================

/**
 * Get the Supabase client for browser-side usage
 * This client is suitable for client components and browser operations
 *
 * @returns Supabase client or null if not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (browserClient === null) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: SUPABASE_STORAGE_KEY,
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }

  return browserClient;
}

/**
 * Get the Supabase client for server-side usage
 * This client is suitable for API routes and server components
 * Has autoRefreshToken disabled as server doesn't manage sessions
 *
 * @returns Supabase client or null if not configured
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (serverClient === null) {
    serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: SUPABASE_STORAGE_KEY,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return serverClient;
}

/**
 * Get the Supabase admin client with service role key
 * This client bypasses RLS policies and should only be used for admin operations
 *
 * WARNING: Never expose this client to the browser
 *
 * @returns Supabase admin client or null if not configured
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (adminClient === null) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all cached Supabase client instances
 * Useful for testing or resetting connections
 */
export function clearSupabaseClients(): void {
  browserClient = null;
  serverClient = null;
  adminClient = null;
}
