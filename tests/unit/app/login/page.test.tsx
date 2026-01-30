import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import LoginPage, { generateMetadata } from '@/app/(auth)/login/page';

// Mock the supabase module (same as login-form tests)
mock.module('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithPassword: mock(() => Promise.resolve({ data: null, error: null })),
      signInWithOtp: mock(() => Promise.resolve({ data: null, error: null })),
      signInWithOAuth: mock(() => Promise.resolve({ data: null, error: null })),
    },
  }),
  isSupabaseConfigured: () => true,
}));

// Mock next/navigation
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}));

afterEach(() => {
  cleanup();
});

describe('LoginPage', () => {
  describe('rendering', () => {
    it('renders the page title', () => {
      render(<LoginPage />);
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the LoginForm component', () => {
      render(<LoginPage />);
      // Check for elements that are part of the LoginForm
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<LoginPage />);
      expect(screen.getByText(/sign in to your account to access/i)).toBeInTheDocument();
    });
  });

  describe('generateMetadata', () => {
    it('returns correct title', async () => {
      const metadata = await generateMetadata();
      expect(metadata.title).toContain('Sign In');
    });

    it('returns correct description', async () => {
      const metadata = await generateMetadata();
      expect(metadata.description).toContain('Sign in');
    });

    it('includes canonical URL', async () => {
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toContain('/login');
    });

    it('includes Open Graph data', async () => {
      const metadata = await generateMetadata();
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toContain('Sign In');
    });
  });
});
