import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EmojiWarnings, type EmojiWarningExtended } from '@/components/emoji/emoji-warnings';

afterEach(() => {
  cleanup();
});

const mockWarnings: EmojiWarningExtended[] = [
  {
    title: 'Generational misunderstanding',
    description:
      'Can be misinterpreted as morbid by older generations who may not understand the "I\'m dead" slang.',
    severity: 'LOW',
  },
  {
    title: 'Professional context',
    description: 'Avoid using in formal work communications as it may seem unprofessional.',
    severity: 'MEDIUM',
  },
];

const singleWarning: EmojiWarningExtended[] = [
  {
    title: 'Test warning',
    description: 'This is a test warning description.',
    severity: 'LOW',
  },
];

const allSeverityWarnings: EmojiWarningExtended[] = [
  {
    title: 'Low severity warning',
    description: 'This is a low severity warning.',
    severity: 'LOW',
  },
  {
    title: 'Medium severity warning',
    description: 'This is a medium severity warning.',
    severity: 'MEDIUM',
  },
  {
    title: 'High severity warning',
    description: 'This is a high severity warning.',
    severity: 'HIGH',
  },
];

describe('EmojiWarnings', () => {
  describe('rendering', () => {
    it('renders the section heading with "Warnings" title', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Warnings');
    });

    it('renders warning icon in the heading', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    it('renders all warnings', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByText('Generational misunderstanding')).toBeInTheDocument();
      expect(screen.getByText('Professional context')).toBeInTheDocument();
    });

    it('renders warning titles', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByText('Generational misunderstanding')).toBeInTheDocument();
    });

    it('renders warning descriptions', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(
        screen.getByText(
          'Can be misinterpreted as morbid by older generations who may not understand the "I\'m dead" slang.'
        )
      ).toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'warnings-heading');
    });

    it('returns null when warnings array is empty', () => {
      const { container } = render(<EmojiWarnings warnings={[]} emojiCharacter="💀" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('severity levels', () => {
    it('displays LOW severity badge', () => {
      render(<EmojiWarnings warnings={allSeverityWarnings} emojiCharacter="💀" />);
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
    });

    it('displays MEDIUM severity badge', () => {
      render(<EmojiWarnings warnings={allSeverityWarnings} emojiCharacter="💀" />);
      expect(screen.getByText('Medium Risk')).toBeInTheDocument();
    });

    it('displays HIGH severity badge', () => {
      render(<EmojiWarnings warnings={allSeverityWarnings} emojiCharacter="💀" />);
      expect(screen.getByText('High Risk')).toBeInTheDocument();
    });
  });

  describe('severity styling', () => {
    it('applies yellow/amber styling for LOW severity', () => {
      const lowWarning: EmojiWarningExtended[] = [
        { title: 'Low warning', description: 'Test', severity: 'LOW' },
      ];
      render(<EmojiWarnings warnings={lowWarning} emojiCharacter="💀" />);
      const badge = screen.getByText('Low Risk');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-800');
    });

    it('applies orange styling for MEDIUM severity', () => {
      const mediumWarning: EmojiWarningExtended[] = [
        { title: 'Medium warning', description: 'Test', severity: 'MEDIUM' },
      ];
      render(<EmojiWarnings warnings={mediumWarning} emojiCharacter="💀" />);
      const badge = screen.getByText('Medium Risk');
      expect(badge).toHaveClass('bg-orange-100');
      expect(badge).toHaveClass('text-orange-800');
    });

    it('applies red styling for HIGH severity', () => {
      const highWarning: EmojiWarningExtended[] = [
        { title: 'High warning', description: 'Test', severity: 'HIGH' },
      ];
      render(<EmojiWarnings warnings={highWarning} emojiCharacter="💀" />);
      const badge = screen.getByText('High Risk');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });
  });

  describe('card styling based on severity', () => {
    it('applies yellow border for LOW severity card', () => {
      const lowWarning: EmojiWarningExtended[] = [
        { title: 'Low warning', description: 'Test', severity: 'LOW' },
      ];
      render(<EmojiWarnings warnings={lowWarning} emojiCharacter="💀" />);
      const card = screen.getByText('Low warning').closest('.border');
      expect(card).toHaveClass('border-yellow-200');
    });

    it('applies orange border for MEDIUM severity card', () => {
      const mediumWarning: EmojiWarningExtended[] = [
        { title: 'Medium warning', description: 'Test', severity: 'MEDIUM' },
      ];
      render(<EmojiWarnings warnings={mediumWarning} emojiCharacter="💀" />);
      const card = screen.getByText('Medium warning').closest('.border');
      expect(card).toHaveClass('border-orange-200');
    });

    it('applies red border for HIGH severity card', () => {
      const highWarning: EmojiWarningExtended[] = [
        { title: 'High warning', description: 'Test', severity: 'HIGH' },
      ];
      render(<EmojiWarnings warnings={highWarning} emojiCharacter="💀" />);
      const card = screen.getByText('High warning').closest('.border');
      expect(card).toHaveClass('border-red-200');
    });
  });

  describe('collapsible functionality', () => {
    it('renders expand/collapse button', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByRole('button', { name: /warnings/i })).toBeInTheDocument();
    });

    it('starts expanded by default', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /warnings/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses content when header button is clicked', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /warnings/i });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands content when header button is clicked again', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /warnings/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides warnings when collapsed', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /warnings/i });
      fireEvent.click(button);
      expect(screen.queryByText('Generational misunderstanding')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'warnings-heading');
    });

    it('section has proper ARIA landmark', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('expand button has aria-expanded attribute', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /warnings/i });
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('warning cards have proper alert role', () => {
      render(<EmojiWarnings warnings={singleWarning} emojiCharacter="💀" />);
      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('handles single warning', () => {
      render(<EmojiWarnings warnings={singleWarning} emojiCharacter="💀" />);
      expect(screen.getByText('Test warning')).toBeInTheDocument();
    });

    it('handles different emoji characters', () => {
      render(<EmojiWarnings warnings={singleWarning} emojiCharacter="😀" />);
      expect(screen.getByText('Test warning')).toBeInTheDocument();
    });

    it('handles complex emoji characters', () => {
      render(<EmojiWarnings warnings={singleWarning} emojiCharacter="👩‍💻" />);
      expect(screen.getByText('Test warning')).toBeInTheDocument();
    });

    it('handles warnings with special characters in description', () => {
      const specialCharWarning: EmojiWarningExtended[] = [
        {
          title: 'Special chars',
          description: 'Contains "quotes" & <tags> and other special chars!',
          severity: 'LOW',
        },
      ];
      render(<EmojiWarnings warnings={specialCharWarning} emojiCharacter="💀" />);
      expect(
        screen.getByText('Contains "quotes" & <tags> and other special chars!')
      ).toBeInTheDocument();
    });

    it('handles long descriptions', () => {
      const longWarning: EmojiWarningExtended[] = [
        {
          title: 'Long warning',
          description:
            'This is a very long description that goes on and on and on to test how the component handles longer text content that might wrap to multiple lines in the UI.',
          severity: 'LOW',
        },
      ];
      render(<EmojiWarnings warnings={longWarning} emojiCharacter="💀" />);
      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" className="custom-class" />
      );
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });

    it('renders cards with border styling', () => {
      render(<EmojiWarnings warnings={singleWarning} emojiCharacter="💀" />);
      const warningCard = screen.getByText('Test warning').closest('.border');
      expect(warningCard).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('uses space-y-4 for stacking warnings', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const container = screen.getByRole('region').querySelector('.space-y-4');
      expect(container).toBeInTheDocument();
    });
  });

  describe('dark mode support', () => {
    it('has dark mode classes for card background (LOW)', () => {
      const lowWarning: EmojiWarningExtended[] = [
        { title: 'Low warning', description: 'Test', severity: 'LOW' },
      ];
      render(<EmojiWarnings warnings={lowWarning} emojiCharacter="💀" />);
      const card = screen.getByText('Low warning').closest('.border');
      expect(card).toHaveClass('dark:bg-yellow-950');
      expect(card).toHaveClass('dark:border-yellow-800');
    });

    it('has dark mode classes for card background (MEDIUM)', () => {
      const mediumWarning: EmojiWarningExtended[] = [
        { title: 'Medium warning', description: 'Test', severity: 'MEDIUM' },
      ];
      render(<EmojiWarnings warnings={mediumWarning} emojiCharacter="💀" />);
      const card = screen.getByText('Medium warning').closest('.border');
      expect(card).toHaveClass('dark:bg-orange-950');
      expect(card).toHaveClass('dark:border-orange-800');
    });

    it('has dark mode classes for card background (HIGH)', () => {
      const highWarning: EmojiWarningExtended[] = [
        { title: 'High warning', description: 'Test', severity: 'HIGH' },
      ];
      render(<EmojiWarnings warnings={highWarning} emojiCharacter="💀" />);
      const card = screen.getByText('High warning').closest('.border');
      expect(card).toHaveClass('dark:bg-red-950');
      expect(card).toHaveClass('dark:border-red-800');
    });

    it('has dark mode classes for severity badge (LOW)', () => {
      const lowWarning: EmojiWarningExtended[] = [
        { title: 'Low warning', description: 'Test', severity: 'LOW' },
      ];
      render(<EmojiWarnings warnings={lowWarning} emojiCharacter="💀" />);
      const badge = screen.getByText('Low Risk');
      expect(badge).toHaveClass('dark:bg-yellow-900');
      expect(badge).toHaveClass('dark:text-yellow-200');
    });

    it('has dark mode classes for severity badge (MEDIUM)', () => {
      const mediumWarning: EmojiWarningExtended[] = [
        { title: 'Medium warning', description: 'Test', severity: 'MEDIUM' },
      ];
      render(<EmojiWarnings warnings={mediumWarning} emojiCharacter="💀" />);
      const badge = screen.getByText('Medium Risk');
      expect(badge).toHaveClass('dark:bg-orange-900');
      expect(badge).toHaveClass('dark:text-orange-200');
    });

    it('has dark mode classes for severity badge (HIGH)', () => {
      const highWarning: EmojiWarningExtended[] = [
        { title: 'High warning', description: 'Test', severity: 'HIGH' },
      ];
      render(<EmojiWarnings warnings={highWarning} emojiCharacter="💀" />);
      const badge = screen.getByText('High Risk');
      expect(badge).toHaveClass('dark:bg-red-900');
      expect(badge).toHaveClass('dark:text-red-200');
    });
  });

  describe('icons', () => {
    it('renders alert triangle icon in the heading', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    it('renders chevron up icon when expanded', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('renders chevron down icon when collapsed', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /warnings/i });
      fireEvent.click(button);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('renders severity icon in each warning card', () => {
      render(<EmojiWarnings warnings={singleWarning} emojiCharacter="💀" />);
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });
  });

  describe('warning count', () => {
    it('displays singular "warning" text when there is one warning', () => {
      render(<EmojiWarnings warnings={singleWarning} emojiCharacter="💀" />);
      expect(screen.getByText('(1 warning)')).toBeInTheDocument();
    });

    it('displays plural "warnings" text when there are multiple warnings', () => {
      render(<EmojiWarnings warnings={mockWarnings} emojiCharacter="💀" />);
      expect(screen.getByText('(2 warnings)')).toBeInTheDocument();
    });
  });
});
