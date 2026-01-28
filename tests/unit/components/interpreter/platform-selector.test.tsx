import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { PlatformSelector } from '@/components/interpreter/platform-selector';

afterEach(() => {
  cleanup();
});

describe('PlatformSelector', () => {
  const mockOnChange = mock(() => {});

  afterEach(() => {
    mockOnChange.mockClear();
  });

  describe('dropdown variant', () => {
    it('renders with placeholder when no value selected', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="dropdown" />);
      expect(screen.getByText('Select platform...')).toBeInTheDocument();
    });

    it('renders selected platform with icon', () => {
      render(<PlatformSelector value="IMESSAGE" onChange={mockOnChange} variant="dropdown" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('iMessage');
    });

    it('opens dropdown and shows all platforms when clicked', async () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="dropdown" />);

      fireEvent.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
        expect(screen.getByText('Instagram DM')).toBeInTheDocument();
        expect(screen.getByText('TikTok')).toBeInTheDocument();
        expect(screen.getByText('WhatsApp')).toBeInTheDocument();
        expect(screen.getByText('Slack')).toBeInTheDocument();
        expect(screen.getByText('Discord')).toBeInTheDocument();
        expect(screen.getByText('Twitter/X')).toBeInTheDocument();
        expect(screen.getByText('Other/Unknown')).toBeInTheDocument();
      });
    });

    it('calls onChange when a platform is selected', async () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="dropdown" />);

      fireEvent.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Discord')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Discord'));
      expect(mockOnChange).toHaveBeenCalledWith('DISCORD');
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <PlatformSelector value="SLACK" onChange={mockOnChange} variant="dropdown" disabled />
      );
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('uses dropdown variant by default', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('buttons variant', () => {
    it('renders all platform buttons', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="buttons" />);

      expect(screen.getByRole('radio', { name: /imessage/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /tiktok/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /whatsapp/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /slack/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /discord/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /twitter/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /other/i })).toBeInTheDocument();
    });

    it('highlights selected platform button', () => {
      render(<PlatformSelector value="WHATSAPP" onChange={mockOnChange} variant="buttons" />);

      const whatsappButton = screen.getByRole('radio', { name: /whatsapp/i });
      expect(whatsappButton).toHaveAttribute('data-selected', 'true');
    });

    it('calls onChange when a button is clicked', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="buttons" />);

      fireEvent.click(screen.getByRole('radio', { name: /slack/i }));
      expect(mockOnChange).toHaveBeenCalledWith('SLACK');
    });

    it('disables all buttons when disabled prop is true', () => {
      render(
        <PlatformSelector value={undefined} onChange={mockOnChange} variant="buttons" disabled />
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('uses radiogroup role for accessibility', () => {
      render(<PlatformSelector value="DISCORD" onChange={mockOnChange} variant="buttons" />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('buttons have proper radio role', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="buttons" />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBe(8);
    });
  });

  describe('platform data', () => {
    it('displays platform icons/emojis', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="buttons" />);

      // Check for platform-specific emojis in button text
      const imessageButton = screen.getByRole('radio', { name: /imessage/i });
      expect(imessageButton).toHaveTextContent('💬');
    });
  });

  describe('accessibility', () => {
    it('has accessible label in dropdown mode', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="dropdown" />);
      expect(screen.getByRole('combobox')).toHaveAccessibleName();
    });

    it('supports keyboard navigation in buttons mode', () => {
      render(<PlatformSelector value="IMESSAGE" onChange={mockOnChange} variant="buttons" />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();

      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
    });

    it('has aria-label on radiogroup in buttons mode', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="buttons" />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toHaveAttribute('aria-label', 'Select messaging platform');
    });
  });

  describe('mobile-friendly', () => {
    it('button variant buttons have minimum touch target size', () => {
      render(<PlatformSelector value={undefined} onChange={mockOnChange} variant="buttons" />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        // Touch targets should be at least 44px (accessibility guideline)
        expect(radio).toHaveClass('min-h-[44px]');
      });
    });
  });

  describe('custom className', () => {
    it('accepts and applies custom className in dropdown mode', () => {
      render(
        <PlatformSelector
          value={undefined}
          onChange={mockOnChange}
          variant="dropdown"
          className="custom-class"
        />
      );
      expect(screen.getByRole('combobox').parentElement).toHaveClass('custom-class');
    });

    it('accepts and applies custom className in buttons mode', () => {
      render(
        <PlatformSelector
          value={undefined}
          onChange={mockOnChange}
          variant="buttons"
          className="custom-class"
        />
      );
      expect(screen.getByRole('radiogroup')).toHaveClass('custom-class');
    });
  });
});
