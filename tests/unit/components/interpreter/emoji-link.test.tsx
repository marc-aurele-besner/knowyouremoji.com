import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { EmojiLink } from '@/components/interpreter/emoji-link';

// Mock next/link
mock.module('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe('EmojiLink', () => {
  describe('rendering', () => {
    it('renders the emoji character', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      expect(screen.getByText('👋')).toBeInTheDocument();
    });

    it('renders as a link when slug is provided', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/emoji/waving-hand');
    });

    it('renders as a span when slug is not provided', () => {
      render(<EmojiLink emoji="👋" />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText('👋')).toBeInTheDocument();
    });

    it('renders with the name when provided', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" />);
      expect(screen.getByLabelText(/waving hand/i)).toBeInTheDocument();
    });

    it('uses emoji character for aria-label when name not provided', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      expect(screen.getByLabelText(/👋/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" className="custom-class" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });
  });

  describe('tooltip preview', () => {
    it('shows tooltip on hover when showPreview is true', async () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" showPreview />);
      const link = screen.getByRole('link');

      fireEvent.mouseEnter(link);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('displays emoji name in tooltip', async () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" showPreview />);
      const link = screen.getByRole('link');

      fireEvent.mouseEnter(link);

      await waitFor(() => {
        expect(screen.getByText('Waving Hand')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" showPreview />);
      const link = screen.getByRole('link');

      fireEvent.mouseEnter(link);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(link);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('does not show tooltip when showPreview is false', async () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" showPreview={false} />);
      const link = screen.getByRole('link');

      fireEvent.mouseEnter(link);

      // Wait a bit to ensure tooltip doesn't appear
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not show tooltip when slug is not provided', async () => {
      render(<EmojiLink emoji="👋" name="Waving Hand" showPreview />);
      const element = screen.getByText('👋');

      fireEvent.mouseEnter(element);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('analytics tracking', () => {
    it('calls onLinkClick when link is clicked', () => {
      const mockOnLinkClick = mock(() => {});
      render(<EmojiLink emoji="👋" slug="waving-hand" onLinkClick={mockOnLinkClick} />);

      const link = screen.getByRole('link');
      fireEvent.click(link);

      expect(mockOnLinkClick).toHaveBeenCalledWith('👋', 'waving-hand');
    });

    it('does not call onLinkClick when no slug is provided', () => {
      const mockOnLinkClick = mock(() => {});
      render(<EmojiLink emoji="👋" onLinkClick={mockOnLinkClick} />);

      const element = screen.getByText('👋');
      fireEvent.click(element);

      expect(mockOnLinkClick).not.toHaveBeenCalled();
    });
  });

  describe('keyboard accessibility', () => {
    it('is focusable when it is a link', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      const link = screen.getByRole('link');
      link.focus();
      expect(document.activeElement).toBe(link);
    });

    it('shows tooltip on focus when showPreview is true', async () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" showPreview />);
      const link = screen.getByRole('link');

      fireEvent.focus(link);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on blur', async () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" name="Waving Hand" showPreview />);
      const link = screen.getByRole('link');

      fireEvent.focus(link);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.blur(link);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    it('has hover effect styles when it is a link', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover:scale-110');
    });

    it('applies transition for smooth hover effect', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('transition-transform');
    });

    it('has focus ring for accessibility', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('focus:outline-none');
      expect(link).toHaveClass('focus:ring-2');
    });
  });

  describe('edge cases', () => {
    it('handles empty emoji string gracefully', () => {
      render(<EmojiLink emoji="" slug="empty" />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('handles complex emoji with modifiers', () => {
      render(<EmojiLink emoji="👨‍💻" slug="man-technologist" name="Man Technologist" />);
      expect(screen.getByText('👨‍💻')).toBeInTheDocument();
    });

    it('handles emoji with multiple characters', () => {
      render(<EmojiLink emoji="👋🏻" slug="waving-hand-light-skin-tone" />);
      expect(screen.getByText('👋🏻')).toBeInTheDocument();
    });
  });

  describe('children prop', () => {
    it('renders children instead of emoji when provided', () => {
      render(
        <EmojiLink emoji="👋" slug="waving-hand">
          Learn more →
        </EmojiLink>
      );
      expect(screen.getByText('Learn more →')).toBeInTheDocument();
      expect(screen.queryByText('👋')).not.toBeInTheDocument();
    });

    it('renders children as link content with correct href', () => {
      render(
        <EmojiLink emoji="👋" slug="waving-hand">
          View emoji details
        </EmojiLink>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/emoji/waving-hand');
      expect(link).toHaveTextContent('View emoji details');
    });

    it('renders emoji when children is not provided', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      expect(screen.getByText('👋')).toBeInTheDocument();
    });
  });

  describe('data attributes', () => {
    it('has data-testid for testing', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      expect(screen.getByTestId('emoji-link')).toBeInTheDocument();
    });

    it('includes slug in data attribute when provided', () => {
      render(<EmojiLink emoji="👋" slug="waving-hand" />);
      expect(screen.getByTestId('emoji-link')).toHaveAttribute('data-slug', 'waving-hand');
    });
  });
});
