import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';

// Mock next-themes
const mockSetTheme = mock(() => {});
let mockTheme = 'light';
let mockMounted = true;

mock.module('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

// Mock react's useSyncExternalStore to control mounted state
mock.module('react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const originalModule = require('react');
  return {
    ...originalModule,
    useSyncExternalStore: () => {
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
  mockTheme = 'light';
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
    mockTheme = 'light';
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('renders sun icon in dark mode', () => {
    mockTheme = 'dark';
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('calls setTheme with dark when clicking in light mode', () => {
    mockTheme = 'light';
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with light when clicking in dark mode', () => {
    mockTheme = 'dark';
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
});
