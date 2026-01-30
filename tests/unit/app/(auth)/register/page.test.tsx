import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import RegisterPage, { generateMetadata } from '@/app/(auth)/register/page';

afterEach(() => {
  cleanup();
});

// Mock the supabase module
mock.module('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      signUp: mock(() => Promise.resolve({ data: null, error: null })),
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

describe('RegisterPage', () => {
  describe('rendering', () => {
    it('renders the page heading', () => {
      render(<RegisterPage />);
      expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    });

    it('renders the page description', () => {
      render(<RegisterPage />);
      expect(screen.getByText(/sign up to save your interpretation history/i)).toBeInTheDocument();
    });

    it('renders the register form', () => {
      render(<RegisterPage />);
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
    });
  });

  describe('metadata', () => {
    it('generates correct title', async () => {
      const metadata = await generateMetadata();
      expect(metadata.title).toContain('Create Account');
    });

    it('generates correct description', async () => {
      const metadata = await generateMetadata();
      expect(metadata.description).toContain('Create your');
      expect(metadata.description).toContain('account');
    });

    it('sets canonical URL', async () => {
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toContain('/register');
    });

    it('sets robots to noindex', async () => {
      const metadata = await generateMetadata();
      expect(metadata.robots).toEqual({
        index: false,
        follow: true,
      });
    });

    it('generates openGraph metadata', async () => {
      const metadata = await generateMetadata();
      const openGraph = metadata.openGraph as {
        type?: string;
        locale?: string;
        siteName?: string;
        title?: string;
        description?: string;
        url?: string;
      };
      expect(openGraph?.type).toBe('website');
      expect(openGraph?.url).toContain('/register');
      expect(openGraph?.title).toContain('Create Account');
    });
  });
});
