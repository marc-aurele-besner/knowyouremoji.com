import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import ForgotPasswordPage, { generateMetadata } from '@/app/(auth)/forgot-password/page';

afterEach(() => {
  cleanup();
});

// Mock next/navigation
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}));

describe('ForgotPasswordPage', () => {
  describe('rendering', () => {
    it('renders the page heading', () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('renders the page description', () => {
      render(<ForgotPasswordPage />);
      expect(
        screen.getByText(/enter your email address and we'll send you a link/i)
      ).toBeInTheDocument();
    });

    it('renders the forgot password form', () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByRole('button', { name: /^send reset link$/i })).toBeInTheDocument();
    });
  });

  describe('metadata', () => {
    it('generates correct title', async () => {
      const metadata = await generateMetadata();
      expect(metadata.title).toContain('Forgot Password');
    });

    it('generates correct description', async () => {
      const metadata = await generateMetadata();
      expect(metadata.description).toContain('Reset your');
    });

    it('sets canonical URL', async () => {
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toContain('/forgot-password');
    });

    it('sets robots to noindex', async () => {
      const metadata = await generateMetadata();
      expect(metadata.robots).toEqual({ index: false, follow: true });
    });

    it('generates openGraph metadata', async () => {
      const metadata = await generateMetadata();
      const openGraph = metadata.openGraph as {
        type?: string;
        url?: string;
        title?: string;
      };
      expect(openGraph?.type).toBe('website');
      expect(openGraph?.url).toContain('/forgot-password');
      expect(openGraph?.title).toContain('Forgot Password');
    });
  });
});
