import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

// Mock next/navigation
const mockPush = mock(() => {});
const mockSearchParams = {
  get: mock((key: string) =>
    key === 'token' ? 'test-token' : key === 'email' ? 'test@example.com' : null
  ),
};
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock fetch
const mockFetch = mock(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
);
globalThis.fetch = mockFetch as never;

afterEach(() => {
  cleanup();
  mockPush.mockClear();
  mockFetch.mockClear();
});

describe('ResetPasswordForm', () => {
  describe('rendering', () => {
    it('renders the form with new password input', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    });

    it('renders the form with confirm password input', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
    });

    it('renders the update password button', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByRole('button', { name: /^update password$/i })).toBeInTheDocument();
    });

    it('renders link to sign in page', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when password is empty on submit', async () => {
      render(<ResetPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'short' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'short' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'password456' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('password update', () => {
    it('calls fetch with correct data', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'test-token',
            email: 'test@example.com',
            password: 'newpassword123',
          }),
        });
      });
    });

    it('shows success message after password update', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password updated/i)).toBeInTheDocument();
      });
    });

    it('redirects to login from success message', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password updated/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('shows error message on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid or expired reset link' }),
      } as never);
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired reset link/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', () => {
      render(<ResetPasswordForm />);
      const passwordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('uses aria-describedby for error messages', async () => {
      render(<ResetPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/^new password$/i);
        expect(passwordInput).toHaveAttribute('aria-describedby');
      });
    });

    it('displays error in accessible alert role', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Test error' }),
      } as never);
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/test error/i);
      });
    });
  });

  describe('error clearing', () => {
    it('clears password error when typing', async () => {
      render(<ResetPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'p' } });

      await waitFor(() => {
        expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
      });
    });

    it('clears confirm password error when typing', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'p' },
      });

      await waitFor(() => {
        expect(screen.queryByText(/please confirm your password/i)).not.toBeInTheDocument();
      });
    });
  });
});
