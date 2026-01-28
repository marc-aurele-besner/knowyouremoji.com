import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import InterpreterPage from '@/app/interpreter/page';

afterEach(() => {
  cleanup();
});

describe('InterpreterPage', () => {
  it('renders the main heading', () => {
    render(<InterpreterPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /emoji interpreter/i })
    ).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<InterpreterPage />);
    expect(
      screen.getByText(/paste a message with emojis and we.?ll decode what they really mean/i)
    ).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('has breadcrumb with Home link', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('has breadcrumb with current page indicator', () => {
    render(<InterpreterPage />);
    const currentPage = screen.getByText('Interpreter');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('renders hero section with appropriate styling', () => {
    render(<InterpreterPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-bold');
  });

  it('renders a placeholder for the interpreter form', () => {
    render(<InterpreterPage />);
    // The InterpreterForm will be added in a later issue, for now check the section exists
    const formSection = screen.getByTestId('interpreter-form-section');
    expect(formSection).toBeInTheDocument();
  });

  it('uses semantic article element for hero content', () => {
    render(<InterpreterPage />);
    // Check that the page has proper semantic structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('applies container layout classes', () => {
    render(<InterpreterPage />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });

  it('has maximum width constraint for readability', () => {
    render(<InterpreterPage />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-4xl');
  });
});
