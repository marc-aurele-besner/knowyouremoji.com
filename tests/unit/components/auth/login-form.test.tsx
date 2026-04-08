import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/login-form';

// Mock next-auth/react
const mockSignIn = mock((): Promise<{ error: string | null }> => Promise.resolve({ error: null }));
mock.module('next-auth/react', () => ({
  signIn: mockSignIn,
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// Mock next/navigation
const mockPush = mock(() => {});
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}));

// Mock fetch for magic link
const mockFetch = mock(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
);
globalThis.fetch = mockFetch as never;

afterEach(() => {
  cleanup();
  mockSignIn.mockClear();
  mockPush.mockClear();
  mockFetch.mockClear();
});

describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders the login form with email input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    });

    it('renders the login form with password input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders the sign in submit button', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('renders the forgot password link', () => {
      render(<LoginForm />);
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
    });

    it('renders magic link toggle option', () => {
      render(<LoginForm />);
      expect(
        screen.getByRole('button', { name: /sign in with magic link instead/i })
      ).toBeInTheDocument();
    });

    it('renders link to registration page', () => {
      render(<LoginForm />);
      expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when email is empty on submit', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is empty on submit', async () => {
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      render(<LoginForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const form = emailInput.closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSignIn).not.toHaveBeenCalled();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('email/password sign in', () => {
    it('calls signIn with correct credentials', async () => {
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('shows loading state during sign in', async () => {
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      );
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      });
    });

    it('shows error message on sign in failure', async () => {
      mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' });
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('redirects to dashboard on successful sign in', async () => {
      mockSignIn.mockResolvedValue({ error: null });
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('magic link sign in', () => {
    it('shows magic link form when toggle is clicked', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });
    });

    it('calls fetch for magic link', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        });
      });
    });

    it('shows success message after magic link sent', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('can return to sign in from magic link success', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
      });
    });
  });

  describe('OAuth sign in', () => {
    it('calls signIn for Google', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
      });
    });

    it('calls signIn for GitHub', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with github/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/dashboard' });
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', () => {
      render(<LoginForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/password/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('uses aria-describedby for error messages', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/^email$/i);
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });

    it('displays error in accessible alert role', async () => {
      mockSignIn.mockResolvedValue({ error: 'CredentialsSignin' });
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i);
      });
    });
  });
});
