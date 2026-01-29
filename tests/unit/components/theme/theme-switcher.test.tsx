import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';

// Mock next-themes
const mockSetTheme = mock(() => {});
let mockResolvedTheme = 'light';
let mockMounted = true;

// Capture the useSyncExternalStore callbacks for testing
let capturedSubscribe: (() => () => void) | null = null;
let capturedGetSnapshot: (() => boolean) | null = null;
let capturedGetServerSnapshot: (() => boolean) | null = null;

mock.module('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

// Mock react's useSyncExternalStore to control mounted state
mock.module('react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const originalModule = require('react');
  return {
    ...originalModule,
    useSyncExternalStore: (
      subscribe: () => () => void,
      getSnapshot: () => boolean,
      getServerSnapshot: () => boolean
    ) => {
      // Capture the callbacks for testing
      capturedSubscribe = subscribe;
      capturedGetSnapshot = getSnapshot;
      capturedGetServerSnapshot = getServerSnapshot;
      // Return mockMounted to control the mounted state in tests
      return mockMounted;
    },
  };
});

afterEach(() => {
  cleanup();
  mockSetTheme.mockClear();
});

beforeEach(() => {
  mockResolvedTheme = 'light';
  mockMounted = true;
});

describe('ThemeSwitcher', () => {
  it('renders a button with toggle theme label', () => {
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('renders moon icon in light mode', () => {
    mockResolvedTheme = 'light';
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('renders sun icon in dark mode', () => {
    mockResolvedTheme = 'dark';
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('calls setTheme with dark when clicking in light mode', () => {
    mockResolvedTheme = 'light';
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with light when clicking in dark mode', () => {
    mockResolvedTheme = 'dark';
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('applies ghost variant to button', () => {
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-gray-100');
  });

  it('renders placeholder button when not mounted', () => {
    mockMounted = false;
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    // Should have a placeholder span instead of an SVG
    expect(button.querySelector('svg')).not.toBeInTheDocument();
    expect(button.querySelector('span.h-5')).toBeInTheDocument();
  });

  describe('useIsMounted hook callbacks', () => {
    it('subscribe returns a no-op unsubscribe function', () => {
      render(<ThemeSwitcher />);
      expect(capturedSubscribe).toBeDefined();
      const unsubscribe = capturedSubscribe!();
      expect(typeof unsubscribe).toBe('function');
      // Call unsubscribe to ensure it doesn't throw
      unsubscribe();
    });

    it('getSnapshot returns true (client-side)', () => {
      render(<ThemeSwitcher />);
      expect(capturedGetSnapshot).toBeDefined();
      expect(capturedGetSnapshot!()).toBe(true);
    });

    it('getServerSnapshot returns false (server-side)', () => {
      render(<ThemeSwitcher />);
      expect(capturedGetServerSnapshot).toBeDefined();
      expect(capturedGetServerSnapshot!()).toBe(false);
    });
  });
});
