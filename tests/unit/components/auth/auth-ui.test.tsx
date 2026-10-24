import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { getPasswordStrength, PasswordStrength } from '@/components/auth/auth-ui';
import { AuthShell } from '@/components/auth/auth-shell';

afterEach(() => {
  cleanup();
});

describe('getPasswordStrength', () => {
  it('returns 0 for an empty password', () => {
    expect(getPasswordStrength('')).toBe(0);
  });

  it('never scores a non-empty password below 1', () => {
    expect(getPasswordStrength('abc')).toBe(1);
  });

  it('adds a point for each of length, uppercase, digit and symbol', () => {
    expect(getPasswordStrength('abcdefgh')).toBe(1);
    expect(getPasswordStrength('Abcdefgh')).toBe(2);
    expect(getPasswordStrength('Abcdefg1')).toBe(3);
    expect(getPasswordStrength('Abcdef1!')).toBe(4);
  });
});

describe('PasswordStrength', () => {
  it('renders four segments with no label when empty', () => {
    render(<PasswordStrength password="" />);
    const meter = screen.getByTestId('password-strength');
    expect(meter).toHaveAttribute('data-level', '0');
    expect(meter.querySelectorAll('span.h-1')).toHaveLength(4);
    expect(screen.queryByText(/strength:/i)).not.toBeInTheDocument();
  });

  it('labels and fills segments according to the score', () => {
    render(<PasswordStrength password="Abcdef1!" />);
    const meter = screen.getByTestId('password-strength');
    expect(meter).toHaveAttribute('data-level', '4');
    expect(screen.getByText(/strength: strong/i)).toBeInTheDocument();
    expect(meter.querySelectorAll('.bg-success')).toHaveLength(4);
  });

  it('uses the danger colour for a weak password', () => {
    render(<PasswordStrength password="abc" />);
    const meter = screen.getByTestId('password-strength');
    expect(screen.getByText(/strength: weak/i)).toBeInTheDocument();
    expect(meter.querySelectorAll('.bg-danger')).toHaveLength(1);
    expect(meter.querySelectorAll('.bg-card-border')).toHaveLength(3);
  });
});

describe('AuthShell', () => {
  it('renders the title, description, quote and children', () => {
    render(
      <AuthShell title="Sign in" description="Welcome back" quote="A quote">
        <p>Form here</p>
      </AuthShell>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('A quote')).toBeInTheDocument();
    expect(screen.getByText('Form here')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /knowyouremoji/i })).toHaveAttribute('href', '/');
  });
});
