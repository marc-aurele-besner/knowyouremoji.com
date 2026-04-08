import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

// Mock next/navigation
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}));

// Mock fetch
const mockFetch = mock(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
);
globalThis.fetch = mockFetch as never;

afterEach(() => {
  cleanup();
  mockFetch.mockClear();
});

describe('ForgotPasswordForm', () => {
  describe('rendering', () => {
    it('renders the form with email input', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    });

    it('renders the send reset link button', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByRole('button', { name: /^send reset link$/i })).toBeInTheDocument();
    });

    it('renders link to sign in page', () => {
      render(<ForgotPasswordForm />);
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when email is empty on submit', async () => {
      render(<ForgotPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      render(<ForgotPasswordForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const form = emailInput.closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('password reset request', () => {
    it('calls fetch with correct email', async () => {
      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        });
      });
    });

    it('shows loading state during submission', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: () => Promise.resolve({ success: true }) } as never),
              100
            )
          )
      );
      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
      });
    });

    it('shows error message on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Database is not configured' }),
      } as never);
      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        expect(screen.getByText(/database is not configured/i)).toBeInTheDocument();
      });
    });

    it('shows success message after email sent', async () => {
      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      });
    });

    it('can try a different email from success message', async () => {
      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /try a different email/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^send reset link$/i })).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', () => {
      render(<ForgotPasswordForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('uses aria-describedby for error messages', async () => {
      render(<ForgotPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/^email$/i);
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });

    it('displays error in accessible alert role', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Test error' }),
      } as never);
      render(<ForgotPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/test error/i);
      });
    });
  });

  describe('error clearing', () => {
    it('clears email error when typing', async () => {
      render(<ForgotPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^send reset link$/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 't' } });

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });
});
