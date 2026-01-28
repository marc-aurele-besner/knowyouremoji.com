import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EmojiContextCard } from '@/components/emoji/emoji-context-card';
import type { ContextMeaning } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

const mockContext: ContextMeaning = {
  context: 'SLANG',
  meaning: 'Used to indicate something is extremely funny, so funny you are "dead" from laughing',
  example: 'That joke had me 💀💀💀',
  riskLevel: 'LOW',
};

const mockHighRiskContext: ContextMeaning = {
  context: 'RED_FLAG',
  meaning: 'Can be interpreted as a veiled threat or warning',
  example: "You're dead to me 💀",
  riskLevel: 'HIGH',
};

const mockMediumRiskContext: ContextMeaning = {
  context: 'PASSIVE_AGGRESSIVE',
  meaning: 'Sometimes used to express mild annoyance or displeasure',
  example: 'Sure, whatever you say 💀',
  riskLevel: 'MEDIUM',
};

describe('EmojiContextCard', () => {
  describe('rendering', () => {
    it('renders the context title', () => {
      render(<EmojiContextCard context={mockContext} />);
      expect(screen.getByText('Slang')).toBeInTheDocument();
    });

    it('renders the context meaning when expanded', () => {
      render(<EmojiContextCard context={mockContext} defaultExpanded />);
      expect(screen.getByText(mockContext.meaning)).toBeInTheDocument();
    });

    it('renders the example usage when expanded', () => {
      render(<EmojiContextCard context={mockContext} defaultExpanded />);
      expect(screen.getByText(`"${mockContext.example}"`)).toBeInTheDocument();
    });

    it('renders the risk level badge', () => {
      render(<EmojiContextCard context={mockContext} />);
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
    });

    it('does not show content when collapsed', () => {
      render(<EmojiContextCard context={mockContext} />);
      expect(screen.queryByText(mockContext.meaning)).not.toBeInTheDocument();
    });

    it('shows content when defaultExpanded is true', () => {
      render(<EmojiContextCard context={mockContext} defaultExpanded />);
      expect(screen.getByText(mockContext.meaning)).toBeInTheDocument();
    });
  });

  describe('context type formatting', () => {
    it('formats SLANG context type correctly', () => {
      render(<EmojiContextCard context={mockContext} />);
      expect(screen.getByText('Slang')).toBeInTheDocument();
    });

    it('formats LITERAL context type correctly', () => {
      const literalContext: ContextMeaning = {
        ...mockContext,
        context: 'LITERAL',
      };
      render(<EmojiContextCard context={literalContext} />);
      expect(screen.getByText('Literal')).toBeInTheDocument();
    });

    it('formats IRONIC context type correctly', () => {
      const ironicContext: ContextMeaning = {
        ...mockContext,
        context: 'IRONIC',
      };
      render(<EmojiContextCard context={ironicContext} />);
      expect(screen.getByText('Ironic')).toBeInTheDocument();
    });

    it('formats PASSIVE_AGGRESSIVE context type correctly', () => {
      render(<EmojiContextCard context={mockMediumRiskContext} />);
      expect(screen.getByText('Passive Aggressive')).toBeInTheDocument();
    });

    it('formats DATING context type correctly', () => {
      const datingContext: ContextMeaning = {
        ...mockContext,
        context: 'DATING',
      };
      render(<EmojiContextCard context={datingContext} />);
      expect(screen.getByText('Dating')).toBeInTheDocument();
    });

    it('formats WORK context type correctly', () => {
      const workContext: ContextMeaning = {
        ...mockContext,
        context: 'WORK',
      };
      render(<EmojiContextCard context={workContext} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('formats RED_FLAG context type correctly', () => {
      render(<EmojiContextCard context={mockHighRiskContext} />);
      expect(screen.getByText('Red Flag')).toBeInTheDocument();
    });
  });

  describe('risk level badges', () => {
    it('displays LOW risk with success styling', () => {
      render(<EmojiContextCard context={mockContext} />);
      const badge = screen.getByText('Low Risk');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('displays MEDIUM risk with warning styling', () => {
      render(<EmojiContextCard context={mockMediumRiskContext} />);
      const badge = screen.getByText('Medium Risk');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('displays HIGH risk with destructive styling', () => {
      render(<EmojiContextCard context={mockHighRiskContext} />);
      const badge = screen.getByText('High Risk');
      expect(badge).toHaveClass('bg-red-100');
    });
  });

  describe('expand/collapse functionality', () => {
    it('expands when trigger is clicked', () => {
      render(<EmojiContextCard context={mockContext} />);

      // Content should not be visible initially
      expect(screen.queryByText(mockContext.meaning)).not.toBeInTheDocument();

      // Click to expand
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Content should now be visible
      expect(screen.getByText(mockContext.meaning)).toBeInTheDocument();
    });

    it('collapses when trigger is clicked again', () => {
      render(<EmojiContextCard context={mockContext} defaultExpanded />);

      // Content should be visible initially
      expect(screen.getByText(mockContext.meaning)).toBeInTheDocument();

      // Click to collapse
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Content should no longer be visible
      expect(screen.queryByText(mockContext.meaning)).not.toBeInTheDocument();
    });

    it('updates aria-expanded attribute on toggle', () => {
      render(<EmojiContextCard context={mockContext} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('accessibility', () => {
    it('has accessible button trigger', () => {
      render(<EmojiContextCard context={mockContext} />);
      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('trigger is keyboard accessible', () => {
      render(<EmojiContextCard context={mockContext} />);
      const trigger = screen.getByRole('button');
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
    });

    it('has aria-expanded attribute', () => {
      render(<EmojiContextCard context={mockContext} />);
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('renders as an article element', () => {
      render(<EmojiContextCard context={mockContext} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmojiContextCard context={mockContext} className="custom-class" />);
      const article = screen.getByRole('article');
      expect(article).toHaveClass('custom-class');
    });

    it('has hover effect classes', () => {
      render(<EmojiContextCard context={mockContext} />);
      const article = screen.getByRole('article');
      expect(article).toHaveClass('hover:shadow-md');
    });

    it('has border and rounded styling', () => {
      render(<EmojiContextCard context={mockContext} />);
      const article = screen.getByRole('article');
      expect(article).toHaveClass('border');
      expect(article).toHaveClass('rounded-lg');
    });

    it('displays example in blockquote style', () => {
      render(<EmojiContextCard context={mockContext} defaultExpanded />);
      const blockquote = screen.getByRole('blockquote');
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveClass('border-l-4');
    });
  });

  describe('edge cases', () => {
    it('handles long meaning text', () => {
      const longMeaningContext: ContextMeaning = {
        ...mockContext,
        meaning:
          'This is a very long meaning that goes on and on and on to test how the component handles long text content that might overflow or wrap in unexpected ways.',
      };
      render(<EmojiContextCard context={longMeaningContext} defaultExpanded />);
      expect(screen.getByText(longMeaningContext.meaning)).toBeInTheDocument();
    });

    it('handles long example text', () => {
      const longExampleContext: ContextMeaning = {
        ...mockContext,
        example:
          'This is a very long example message that contains a lot of text to test how the component handles long example content 💀💀💀',
      };
      render(<EmojiContextCard context={longExampleContext} defaultExpanded />);
      expect(screen.getByText(`"${longExampleContext.example}"`)).toBeInTheDocument();
    });

    it('handles special characters in meaning', () => {
      const specialCharContext: ContextMeaning = {
        ...mockContext,
        meaning: 'Contains special chars: <>&"\'',
      };
      render(<EmojiContextCard context={specialCharContext} defaultExpanded />);
      expect(screen.getByText(specialCharContext.meaning)).toBeInTheDocument();
    });

    it('handles emojis in example text', () => {
      const emojiExampleContext: ContextMeaning = {
        ...mockContext,
        example: '😀😀😀 Multiple emojis 💀💀💀',
      };
      render(<EmojiContextCard context={emojiExampleContext} defaultExpanded />);
      expect(screen.getByText(`"${emojiExampleContext.example}"`)).toBeInTheDocument();
    });
  });
});
