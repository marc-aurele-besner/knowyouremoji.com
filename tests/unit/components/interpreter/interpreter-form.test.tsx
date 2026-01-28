import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { InterpreterForm } from '@/components/interpreter/interpreter-form';

afterEach(() => {
  cleanup();
});

describe('InterpreterForm', () => {
  const mockOnSubmit = mock(() => Promise.resolve());

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('rendering', () => {
    it('renders textarea for message input', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
    });

    it('renders PlatformSelector', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders ContextSelector', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('radiogroup', { name: /relationship/i })).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: /interpret/i })).toBeInTheDocument();
    });

    it('renders UsageCounter when usage props provided', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} usageRemaining={2} usageMax={3} />);
      expect(screen.getByTestId('usage-counter')).toBeInTheDocument();
    });

    it('does not render UsageCounter when usage props not provided', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      expect(screen.queryByTestId('usage-counter')).not.toBeInTheDocument();
    });
  });

  describe('character counter', () => {
    it('shows character count (0 initially)', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText(/0\s*\/\s*1000/)).toBeInTheDocument();
    });

    it('updates character count as user types', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });

      fireEvent.change(textarea, { target: { value: 'Hello 👋' } });

      expect(screen.getByText(/8\s*\/\s*1000/)).toBeInTheDocument();
    });

    it('shows warning color when near limit', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });

      // Create a message that's close to 1000 chars
      const longMessage = '😀'.repeat(490);
      fireEvent.change(textarea, { target: { value: longMessage } });

      const counter = screen.getByTestId('char-counter');
      expect(counter).toHaveClass('text-yellow-600');
    });

    it('shows error color when at limit', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });

      // Create a message that's exactly 1000 chars
      const maxMessage = '😀'.repeat(500);
      fireEvent.change(textarea, { target: { value: maxMessage } });

      const counter = screen.getByTestId('char-counter');
      expect(counter).toHaveClass('text-red-600');
    });
  });

  describe('form validation', () => {
    it('shows error when message is too short (less than 10 chars)', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      fireEvent.change(textarea, { target: { value: '👋' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when message is too long (more than 1000 chars)', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      const longMessage = '😀'.repeat(501);
      fireEvent.change(textarea, { target: { value: longMessage } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/cannot exceed 1000 characters/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when message does not contain emoji', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      fireEvent.change(textarea, { target: { value: 'Hello there friend' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least one emoji/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when platform is not selected', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/select a platform/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows error when context is not selected', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      // Select a platform
      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/select a relationship/i)).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('clears error when user starts typing valid input', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      fireEvent.change(textarea, { target: { value: '👋' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
      });

      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      await waitFor(() => {
        expect(screen.queryByText(/at least 10 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      // Fill in message
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
        expect(mockOnSubmit).toHaveBeenCalledWith({
          message: 'Hello there 👋',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });
    });

    it('shows loading state during submission', async () => {
      const slowSubmit = mock(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<InterpreterForm onSubmit={slowSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      // Fill in valid form
      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      const contextRadio = screen.getByRole('radio', { name: /friend/i });
      fireEvent.click(contextRadio);

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/interpreting/i)).toBeInTheDocument();
      });
    });

    it('calls onSubmit and shows completion text after submission', async () => {
      // Use a synchronous mock that returns an immediately resolved promise
      const instantSubmit = mock(() => Promise.resolve());
      render(<InterpreterForm onSubmit={instantSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      // Fill in valid form
      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      const contextRadio = screen.getByRole('radio', { name: /friend/i });
      fireEvent.click(contextRadio);

      fireEvent.click(submitButton);

      // Verify the submit was called and button returns to normal state
      await waitFor(() => {
        expect(instantSubmit).toHaveBeenCalled();
        expect(screen.getByText(/interpret message/i)).toBeInTheDocument();
      });
    });
  });

  describe('keyboard shortcuts', () => {
    it('submits form on Cmd/Ctrl+Enter when valid', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });

      // Fill in valid form
      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      const contextRadio = screen.getByRole('radio', { name: /friend/i });
      fireEvent.click(contextRadio);

      // Submit via keyboard shortcut
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('submits form on Ctrl+Enter (Windows)', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });

      // Fill in valid form
      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      const contextRadio = screen.getByRole('radio', { name: /friend/i });
      fireEvent.click(contextRadio);

      // Submit via keyboard shortcut
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('does not submit on regular Enter (allows newlines)', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });

      // Fill in valid form
      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      const contextRadio = screen.getByRole('radio', { name: /friend/i });
      fireEvent.click(contextRadio);

      // Regular enter should not submit
      fireEvent.keyDown(textarea, { key: 'Enter' });

      // Should not have called onSubmit
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables all inputs when disabled prop is true', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} disabled />);

      expect(screen.getByRole('textbox', { name: /message/i })).toBeDisabled();
      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByRole('button', { name: /interpret/i })).toBeDisabled();

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('disables submit when rate limit reached (0 remaining)', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} usageRemaining={0} usageMax={3} />);

      expect(screen.getByRole('button', { name: /interpret/i })).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for all form fields', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: /relationship/i })).toBeInTheDocument();
    });

    it('associates error messages with form fields via aria-describedby', async () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      fireEvent.change(textarea, { target: { value: '👋' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/at least 10 characters/i);
        expect(errorMessage).toHaveAttribute('id');
        expect(textarea).toHaveAttribute('aria-describedby', errorMessage.id);
      });
    });

    it('textarea has minimum touch target size', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      expect(textarea).toHaveClass('min-h-[120px]');
    });
  });

  describe('custom className', () => {
    it('accepts and applies custom className', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} className="custom-form-class" />);
      const form = screen.getByRole('form');
      expect(form).toHaveClass('custom-form-class');
    });
  });

  describe('initial values', () => {
    it('accepts initial message value', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} initialMessage="Hello 👋 there!" />);
      const textarea = screen.getByRole('textbox', { name: /message/i });
      expect(textarea).toHaveValue('Hello 👋 there!');
    });

    it('accepts initial platform value', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} initialPlatform="SLACK" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('Slack');
    });

    it('accepts initial context value', () => {
      render(<InterpreterForm onSubmit={mockOnSubmit} initialContext="COWORKER" />);
      const coworkerRadio = screen.getByRole('radio', { name: /coworker/i });
      expect(coworkerRadio).toHaveAttribute('aria-checked', 'true');
    });
  });
});
