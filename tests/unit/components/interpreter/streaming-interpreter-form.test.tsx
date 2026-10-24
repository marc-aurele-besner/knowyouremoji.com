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

const originalFetch = global.fetch;

const streamState: { text: string; isLoading: boolean; error: Error | null } = {
  text: '',
  isLoading: false,
  error: null,
};

mock.module('@/hooks/use-streaming-interpret', () => ({
  useStreamingInterpret: () => ({
    ...streamState,
    interpret: mockInterpret,
    stop: mockStop,
    reset: mockReset,
  }),
}));

async function fillAndSubmit() {
  fireEvent.change(screen.getByRole('textbox', { name: /message/i }), {
    target: { value: 'sure, whatever works 🙂' },
  });
  fireEvent.click(screen.getByText('iMessage'));
  fireEvent.click(screen.getByRole('radio', { name: /friend/i }));
  fireEvent.click(screen.getByRole('button', { name: /interpret/i }));
  await waitFor(() => expect(screen.getByTestId('streaming-result')).toBeInTheDocument());
}

const fullResult = {
  id: 'int_1',
  message: 'sure, whatever works 🙂',
  emojis: [{ character: '🙂', meaning: 'Polite but cool', slug: 'slightly-smiling-face' }],
  interpretation: 'Reads as mildly annoyed.',
  metrics: {
    sarcasmProbability: 40,
    passiveAggressionProbability: 55,
    overallTone: 'negative',
    confidence: 80,
  },
  redFlags: [],
  timestamp: '2026-01-01T00:00:00.000Z',
};

describe('StreamingInterpreterForm', () => {
  afterEach(() => {
    streamState.text = '';
    streamState.isLoading = false;
    streamState.error = null;
    global.fetch = originalFetch;
    mockInterpret.mockClear();
    mockStop.mockClear();
    mockReset.mockClear();
  });

  describe('rendering', () => {
    it('renders the interpreter form', () => {
      render(<StreamingInterpreterForm />);

      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: /platform/i })).toBeInTheDocument();
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

  describe('result states', () => {
    it('prefills the message from initialMessage', () => {
      render(<StreamingInterpreterForm initialMessage="ok sure 🙂" />);
      expect(screen.getByRole('textbox', { name: /message/i })).toHaveValue('ok sure 🙂');
    });

    it('streams by default and shows the message bubble and context line', async () => {
      render(<StreamingInterpreterForm />);
      await fillAndSubmit();
      expect(mockInterpret).toHaveBeenCalledWith({
        message: 'sure, whatever works 🙂',
        platform: 'IMESSAGE',
        context: 'FRIEND',
      });
      expect(screen.getByText('iMessage · Friend')).toBeInTheDocument();
    });

    it('shows the skeleton with typing dots while waiting for the first words', async () => {
      const { rerender } = render(<StreamingInterpreterForm />);
      await fillAndSubmit();
      streamState.isLoading = true;
      rerender(<StreamingInterpreterForm />);
      expect(screen.getByTestId('interpret-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('typing-dots')).toBeInTheDocument();
    });

    it('shows streamed text with a stop button, then copy and clear', async () => {
      const { rerender } = render(<StreamingInterpreterForm />);
      await fillAndSubmit();
      streamState.isLoading = true;
      streamState.text = 'Reads as';
      rerender(<StreamingInterpreterForm />);
      expect(screen.getByTestId('streaming-text')).toHaveTextContent('Reads as');
      fireEvent.click(screen.getByTestId('stop-button'));
      expect(mockStop).toHaveBeenCalled();

      streamState.isLoading = false;
      streamState.text = 'Reads as mildly annoyed.';
      rerender(<StreamingInterpreterForm />);
      fireEvent.click(screen.getByTestId('reset-button'));
      expect(mockReset).toHaveBeenCalled();
      expect(screen.queryByTestId('streaming-result')).not.toBeInTheDocument();
    });

    it('renders errors in the empty-state pattern with a retry', async () => {
      const { rerender } = render(<StreamingInterpreterForm />);
      await fillAndSubmit();
      streamState.error = new Error('Rate limit exceeded');
      rerender(<StreamingInterpreterForm />);
      expect(screen.getByTestId('streaming-error')).toHaveTextContent('Rate limit exceeded');
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(mockReset).toHaveBeenCalled();
    });

    it('requests the full analysis when streaming is turned off', async () => {
      const onComplete = mock(() => {});
      const fetchMock = mock(() =>
        Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(fullResult) })
      );
      global.fetch = fetchMock as unknown as typeof fetch;
      render(<StreamingInterpreterForm onComplete={onComplete} />);
      fireEvent.click(screen.getByRole('checkbox', { name: /stream the answer/i }));
      await fillAndSubmit();

      await waitFor(() => expect(screen.getByTestId('tone-badge')).toHaveTextContent('Negative'));
      expect(fetchMock).toHaveBeenCalledWith('/api/interpret', expect.anything());
      expect(mockInterpret).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledWith('Reads as mildly annoyed.');
      expect(screen.getByTestId('passive-aggression-meter')).toHaveAttribute('data-danger', 'true');

      fireEvent.click(screen.getByRole('button', { name: /new message/i }));
      expect(screen.queryByTestId('streaming-result')).not.toBeInTheDocument();
    });

    it('shows API errors from the full analysis', async () => {
      const onError = mock(() => {});
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: 'Rate limit exceeded. Please try again later.' }),
        })
      ) as unknown as typeof fetch;
      render(<StreamingInterpreterForm onError={onError} />);
      fireEvent.click(screen.getByRole('checkbox', { name: /stream the answer/i }));
      await fillAndSubmit();

      await waitFor(() =>
        expect(screen.getByTestId('streaming-error')).toHaveTextContent(/rate limit exceeded/i)
      );
      expect(onError).toHaveBeenCalled();
    });
  });
});
