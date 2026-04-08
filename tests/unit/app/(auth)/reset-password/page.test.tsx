import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import ResetPasswordPage, { generateMetadata } from '@/app/(auth)/reset-password/page';

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
  useSearchParams: () => ({
    get: mock(() => null),
  }),
}));

describe('ResetPasswordPage', () => {
  describe('rendering', () => {
    it('renders the page heading', () => {
      render(<ResetPasswordPage />);
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    });

    it('renders the page description', () => {
      render(<ResetPasswordPage />);
      expect(screen.getByText(/enter your new password below/i)).toBeInTheDocument();
    });

    it('renders the reset password form', () => {
      render(<ResetPasswordPage />);
      expect(screen.getByRole('button', { name: /^update password$/i })).toBeInTheDocument();
    });
  });

  describe('metadata', () => {
    it('generates correct title', async () => {
      const metadata = await generateMetadata();
      expect(metadata.title).toContain('Reset Password');
    });

    it('generates correct description', async () => {
      const metadata = await generateMetadata();
      expect(metadata.description).toContain('Set a new password');
    });

    it('sets canonical URL', async () => {
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toContain('/reset-password');
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
      expect(openGraph?.url).toContain('/reset-password');
      expect(openGraph?.title).toContain('Reset Password');
    });
  });
});
