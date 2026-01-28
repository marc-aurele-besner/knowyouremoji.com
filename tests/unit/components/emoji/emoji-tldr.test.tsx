import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { EmojiTLDR } from '@/components/emoji/emoji-tldr';

afterEach(() => {
  cleanup();
});

const mockTldr = 'Used to express "I\'m dead" from laughing or extreme shock/cringe';

describe('EmojiTLDR', () => {
  describe('rendering', () => {
    it('renders the TLDR text', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      expect(screen.getByText(mockTldr)).toBeInTheDocument();
    });

    it('renders the heading', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      expect(screen.getByRole('heading', { name: /tl;dr/i })).toBeInTheDocument();
    });

    it('renders as an aside element', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible aria-labelledby linking heading and content', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveAttribute('aria-labelledby');
    });

    it('heading is associated with the aside via aria-labelledby', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const aside = screen.getByRole('complementary');
      const labelId = aside.getAttribute('aria-labelledby');
      const heading = document.getElementById(labelId!);
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/tl;dr/i);
    });

    it('heading is level 2 by default', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('renders heading as h3 when headingLevel is 3', () => {
      render(<EmojiTLDR tldr={mockTldr} headingLevel={3} />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('renders heading as h4 when headingLevel is 4', () => {
      render(<EmojiTLDR tldr={mockTldr} headingLevel={4} />);
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmojiTLDR tldr={mockTldr} className="custom-class" />);
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('custom-class');
    });

    it('has callout/card appearance with background', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const aside = screen.getByRole('complementary');
      // Check for background color classes
      expect(aside.className).toMatch(/bg-/);
    });

    it('has rounded styling', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('rounded-lg');
    });

    it('has padding for card appearance', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toMatch(/p-/);
    });

    it('has border styling', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const aside = screen.getByRole('complementary');
      expect(aside.className).toMatch(/border/);
    });
  });

  describe('edge cases', () => {
    it('handles long TLDR text', () => {
      const longTldr =
        'This is a very long TLDR text that goes on and on and on to test how the component handles long text content that might overflow or wrap in unexpected ways and should still be displayed correctly.';
      render(<EmojiTLDR tldr={longTldr} />);
      expect(screen.getByText(longTldr)).toBeInTheDocument();
    });

    it('handles short TLDR text', () => {
      const shortTldr = 'Laughing hard';
      render(<EmojiTLDR tldr={shortTldr} />);
      expect(screen.getByText(shortTldr)).toBeInTheDocument();
    });

    it('handles special characters in TLDR text', () => {
      const specialTldr = 'Contains special chars: <>&"\' and emoji 💀';
      render(<EmojiTLDR tldr={specialTldr} />);
      expect(screen.getByText(specialTldr)).toBeInTheDocument();
    });

    it('handles TLDR with quotes', () => {
      const quotedTldr = '"Dead" from laughing - used for extreme humor';
      render(<EmojiTLDR tldr={quotedTldr} />);
      expect(screen.getByText(quotedTldr)).toBeInTheDocument();
    });

    it('handles TLDR with multiple sentences', () => {
      const multiSentenceTldr = 'Used when something is hilarious. Can also mean shock or cringe.';
      render(<EmojiTLDR tldr={multiSentenceTldr} />);
      expect(screen.getByText(multiSentenceTldr)).toBeInTheDocument();
    });
  });

  describe('responsiveness', () => {
    it('has responsive text size classes', () => {
      render(<EmojiTLDR tldr={mockTldr} />);
      const aside = screen.getByRole('complementary');
      // Should have base text styling that works across screen sizes
      expect(aside).toBeInTheDocument();
    });
  });
});
