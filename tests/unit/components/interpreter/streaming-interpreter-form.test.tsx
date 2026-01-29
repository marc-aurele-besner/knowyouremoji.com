import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { StreamingInterpreterForm } from '@/components/interpreter/streaming-interpreter-form';

afterEach(() => {
  cleanup();
});

// Mock the useStreamingInterpret hook
const mockInterpret = mock(() => {});
const mockStop = mock(() => {});
const mockReset = mock(() => {});

mock.module('@/hooks/use-streaming-interpret', () => ({
  useStreamingInterpret: () => ({
    text: '',
    isLoading: false,
    error: null,
    interpret: mockInterpret,
    stop: mockStop,
    reset: mockReset,
  }),
}));

describe('StreamingInterpreterForm', () => {
  afterEach(() => {
    mockInterpret.mockClear();
    mockStop.mockClear();
    mockReset.mockClear();
  });

  describe('rendering', () => {
    it('renders the interpreter form', () => {
      render(<StreamingInterpreterForm />);

      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /interpret/i })).toBeInTheDocument();
    });

    it('does not show streaming result initially', () => {
      render(<StreamingInterpreterForm />);

      expect(screen.queryByTestId('streaming-result')).not.toBeInTheDocument();
    });

    it('accepts className prop', () => {
      const { container } = render(<StreamingInterpreterForm className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('passes usage props to InterpreterForm', () => {
      render(<StreamingInterpreterForm usageRemaining={2} usageMax={3} />);

      expect(screen.getByTestId('usage-counter')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('shows streaming result card after submission', async () => {
      // Re-render with the form
      render(<StreamingInterpreterForm />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      // Fill in valid form
      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      // Select platform
      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      // Select context
      const contextRadio = screen.getByRole('radio', { name: /friend/i });
      fireEvent.click(contextRadio);

      // Submit
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('streaming-result')).toBeInTheDocument();
      });
    });
  });

  describe('callbacks', () => {
    it('accepts onComplete callback', () => {
      const onComplete = mock(() => {});
      render(<StreamingInterpreterForm onComplete={onComplete} />);

      // Callback is registered but not called until streaming completes
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('accepts onError callback', () => {
      const onError = mock(() => {});
      render(<StreamingInterpreterForm onError={onError} />);

      // Callback is registered but not called until an error occurs
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
