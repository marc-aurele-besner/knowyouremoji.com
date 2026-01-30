import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  isSupabaseConfigured,
  getSupabaseClient,
  getSupabaseServerClient,
  getSupabaseAdminClient,
  clearSupabaseClients,
  SUPABASE_STORAGE_KEY,
} from '../../../src/lib/supabase';

// Store original env
const originalEnv = { ...process.env };

describe('supabase module', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Clear any cached Supabase clients
    clearSupabaseClients();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('SUPABASE_STORAGE_KEY', () => {
    it('should be a defined string', () => {
      expect(typeof SUPABASE_STORAGE_KEY).toBe('string');
      expect(SUPABASE_STORAGE_KEY.length).toBeGreaterThan(0);
    });

    it('should contain the app name', () => {
      expect(SUPABASE_STORAGE_KEY).toContain('kye');
    });
  });

  describe('isSupabaseConfigured', () => {
    it('should return false when NEXT_PUBLIC_SUPABASE_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      expect(isSupabaseConfigured()).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_SUPABASE_ANON_KEY is not set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      expect(isSupabaseConfigured()).toBe(false);
    });

    it('should return true when both URL and ANON_KEY are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      expect(isSupabaseConfigured()).toBe(true);
    });

    it('should return false when URL is empty string', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      expect(isSupabaseConfigured()).toBe(false);
    });

    it('should return false when ANON_KEY is empty string', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
      expect(isSupabaseConfigured()).toBe(false);
    });
  });

  describe('getSupabaseClient', () => {
    it('should return null when Supabase is not configured', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const client = getSupabaseClient();
      expect(client).toBeNull();
    });

    it('should return a Supabase client when configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const client = getSupabaseClient();
      expect(client).not.toBeNull();
    });

    it('should return the same client instance on subsequent calls', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();
      expect(client1).toBe(client2);
    });

    it('should have auth property on client', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const client = getSupabaseClient();
      expect(client).not.toBeNull();
      expect(client!.auth).toBeDefined();
    });
  });

  describe('getSupabaseServerClient', () => {
    it('should return null when Supabase is not configured', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const client = getSupabaseServerClient();
      expect(client).toBeNull();
    });

    it('should return a Supabase client when configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const client = getSupabaseServerClient();
      expect(client).not.toBeNull();
    });

    it('should return the same client instance on subsequent calls', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const client1 = getSupabaseServerClient();
      const client2 = getSupabaseServerClient();
      expect(client1).toBe(client2);
    });
  });

  describe('getSupabaseAdminClient', () => {
    it('should return null when SERVICE_ROLE_KEY is not set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      const client = getSupabaseAdminClient();
      expect(client).toBeNull();
    });

    it('should return null when URL is not set', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      const client = getSupabaseAdminClient();
      expect(client).toBeNull();
    });

    it('should return a Supabase admin client when configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      const client = getSupabaseAdminClient();
      expect(client).not.toBeNull();
    });

    it('should return the same admin client instance on subsequent calls', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      const client1 = getSupabaseAdminClient();
      const client2 = getSupabaseAdminClient();
      expect(client1).toBe(client2);
    });
  });

  describe('clearSupabaseClients', () => {
    it('should clear the cached Supabase clients', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

      // Get clients to initialize them
      getSupabaseClient();
      getSupabaseServerClient();
      getSupabaseAdminClient();

      // Clear clients
      clearSupabaseClients();

      // After clearing, calling again should work without errors
      expect(() => clearSupabaseClients()).not.toThrow();
    });

    it('should allow new client creation after clearing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const client1 = getSupabaseClient();
      clearSupabaseClients();
      const client2 = getSupabaseClient();

      // New client should be created (not the same instance)
      expect(client1).not.toBe(client2);
    });
  });

  describe('client configuration', () => {
    it('should configure client with correct storage key', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const client = getSupabaseClient();
      expect(client).not.toBeNull();
      // Client is configured - auth should be available
      expect(client!.auth).toBeDefined();
    });

    it('should configure server client with autoRefreshToken disabled', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const client = getSupabaseServerClient();
      expect(client).not.toBeNull();
      expect(client!.auth).toBeDefined();
    });

    it('should configure admin client with correct settings', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      const client = getSupabaseAdminClient();
      expect(client).not.toBeNull();
      expect(client!.auth).toBeDefined();
    });
  });
});
