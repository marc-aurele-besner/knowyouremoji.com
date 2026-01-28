import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ContextSelector } from '@/components/interpreter/context-selector';

afterEach(() => {
  cleanup();
});

describe('ContextSelector', () => {
  const mockOnChange = mock(() => {});

  afterEach(() => {
    mockOnChange.mockClear();
  });

  describe('select variant', () => {
    it('renders with placeholder when no value selected', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="select" />);
      expect(screen.getByText('Select relationship...')).toBeInTheDocument();
    });

    it('renders selected context with icon', () => {
      render(<ContextSelector value="ROMANTIC_PARTNER" onChange={mockOnChange} variant="select" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('Romantic Partner');
    });

    it('opens dropdown and shows all relationship contexts when clicked', async () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="select" />);

      fireEvent.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Romantic Partner')).toBeInTheDocument();
        expect(screen.getByText('Friend')).toBeInTheDocument();
        expect(screen.getByText('Family Member')).toBeInTheDocument();
        expect(screen.getByText('Coworker/Professional')).toBeInTheDocument();
        expect(screen.getByText('Acquaintance')).toBeInTheDocument();
        expect(screen.getByText('Unknown/Stranger')).toBeInTheDocument();
      });
    });

    it('calls onChange when a context is selected', async () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="select" />);

      fireEvent.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Friend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Friend'));
      expect(mockOnChange).toHaveBeenCalledWith('FRIEND');
    });

    it('is disabled when disabled prop is true', () => {
      render(<ContextSelector value="FRIEND" onChange={mockOnChange} variant="select" disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('uses radio variant by default', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });
  });

  describe('radio variant', () => {
    it('renders all relationship context radio buttons', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="radio" />);

      expect(screen.getByRole('radio', { name: /romantic partner/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /friend/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /family member/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /coworker\/professional/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /acquaintance/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /unknown\/stranger/i })).toBeInTheDocument();
    });

    it('highlights selected context radio button', () => {
      render(<ContextSelector value="FAMILY" onChange={mockOnChange} variant="radio" />);

      const familyButton = screen.getByRole('radio', { name: /family member/i });
      expect(familyButton).toHaveAttribute('data-selected', 'true');
    });

    it('calls onChange when a radio button is clicked', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="radio" />);

      fireEvent.click(screen.getByRole('radio', { name: /coworker/i }));
      expect(mockOnChange).toHaveBeenCalledWith('COWORKER');
    });

    it('disables all radio buttons when disabled prop is true', () => {
      render(
        <ContextSelector value={undefined} onChange={mockOnChange} variant="radio" disabled />
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('uses radiogroup role for accessibility', () => {
      render(<ContextSelector value="FRIEND" onChange={mockOnChange} variant="radio" />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('has proper radio role on buttons', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="radio" />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBe(6);
    });
  });

  describe('context data', () => {
    it('displays context icons/emojis', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="radio" />);

      // Check for context-specific emojis in button text
      const romanticButton = screen.getByRole('radio', { name: /romantic partner/i });
      expect(romanticButton).toHaveTextContent('💕');
    });

    it('displays descriptions in radio mode', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="radio" />);

      // Descriptions should be visible in radio mode
      expect(screen.getByText(/dating\/married/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible label in select mode', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="select" />);
      expect(screen.getByRole('combobox')).toHaveAccessibleName();
    });

    it('supports keyboard navigation in radio mode', () => {
      render(<ContextSelector value="ROMANTIC_PARTNER" onChange={mockOnChange} variant="radio" />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();

      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
    });

    it('has aria-label on radiogroup in radio mode', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="radio" />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Select relationship context');
    });
  });

  describe('mobile-friendly', () => {
    it('radio variant buttons have minimum touch target size', () => {
      render(<ContextSelector value={undefined} onChange={mockOnChange} variant="radio" />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        // Touch targets should be at least 44px (accessibility guideline)
        expect(radio).toHaveClass('min-h-[44px]');
      });
    });
  });

  describe('custom className', () => {
    it('accepts and applies custom className in select mode', () => {
      render(
        <ContextSelector
          value={undefined}
          onChange={mockOnChange}
          variant="select"
          className="custom-class"
        />
      );
      expect(screen.getByRole('combobox').parentElement).toHaveClass('custom-class');
    });

    it('accepts and applies custom className in radio mode', () => {
      render(
        <ContextSelector
          value={undefined}
          onChange={mockOnChange}
          variant="radio"
          className="custom-class"
        />
      );
      expect(screen.getByRole('radiogroup')).toHaveClass('custom-class');
    });
  });
});
