import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { RegisterForm } from '@/components/auth/register-form';

// Mock next-auth/react
const mockSignIn = mock(() => Promise.resolve({ error: null }));
mock.module('next-auth/react', () => ({
  signIn: mockSignIn,
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// Mock next/navigation
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}));

// Mock fetch for registration
const mockFetch = mock(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
);
globalThis.fetch = mockFetch as never;

afterEach(() => {
  cleanup();
  mockSignIn.mockClear();
  mockFetch.mockClear();
});

describe('RegisterForm', () => {
  describe('rendering', () => {
    it('renders the registration form with email input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    });

    it('renders the registration form with password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('renders the registration form with confirm password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the create account submit button', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
    });

    it('renders link to login page', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when email is empty on submit', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is empty on submit', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'short' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'short' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password456' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      render(<RegisterForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });

      const form = emailInput.closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('email/password registration', () => {
    it('calls fetch with correct data', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        });
      });
    });

    it('shows email verification message on successful registration', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      });
    });

    it('shows error message on registration failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'An account with this email already exists' }),
      } as never);
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/an account with this email already exists/i)).toBeInTheDocument();
      });
    });

    it('can return to registration form from success message', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /back to sign up/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
      });
    });
  });

  describe('OAuth sign up', () => {
    it('calls signIn for Google', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
      });
    });

    it('calls signIn for GitHub', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with github/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/dashboard' });
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', () => {
      render(<RegisterForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('uses aria-describedby for error messages', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

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
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/test error/i);
      });
    });
  });

  describe('error clearing', () => {
    it('clears email error when typing', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

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
