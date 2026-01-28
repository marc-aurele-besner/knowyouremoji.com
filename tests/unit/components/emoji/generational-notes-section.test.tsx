import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  GenerationalNotesSection,
  type GenerationalNoteExtended,
} from '@/components/emoji/generational-notes-section';

afterEach(() => {
  cleanup();
});

const mockNotes: GenerationalNoteExtended[] = [
  {
    generation: 'GEN_Z',
    interpretation:
      'Skull emoji means "I\'m dead" (from laughing) - the ultimate expression of finding something hilarious.',
    example: '"that video has me 💀💀💀"',
    cringeFactor: 'acceptable',
  },
  {
    generation: 'MILLENNIAL',
    interpretation:
      'Often used literally to represent death, danger, or Halloween themes. Also used ironically.',
    example: '"Monday mornings be like 💀"',
    cringeFactor: 'acceptable',
    source: 'Emojipedia Usage Trends 2023',
  },
];

const singleNote: GenerationalNoteExtended[] = [
  {
    generation: 'GEN_Z',
    interpretation: 'Test interpretation',
  },
];

const allGenerationsNotes: GenerationalNoteExtended[] = [
  {
    generation: 'GEN_Z',
    interpretation: 'Gen Z interpretation',
  },
  {
    generation: 'MILLENNIAL',
    interpretation: 'Millennial interpretation',
  },
  {
    generation: 'GEN_X',
    interpretation: 'Gen X interpretation',
  },
  {
    generation: 'BOOMER',
    interpretation: 'Boomer interpretation',
  },
];

const noteWithAllCringeFactors: GenerationalNoteExtended[] = [
  {
    generation: 'GEN_Z',
    interpretation: 'Acceptable usage',
    cringeFactor: 'acceptable',
  },
  {
    generation: 'MILLENNIAL',
    interpretation: 'Slightly cringe usage',
    cringeFactor: 'slightly-cringe',
  },
  {
    generation: 'GEN_X',
    interpretation: 'Very cringe usage',
    cringeFactor: 'very-cringe',
  },
  {
    generation: 'BOOMER',
    interpretation: 'Ironic use only',
    cringeFactor: 'ironic-use',
  },
];

describe('GenerationalNotesSection', () => {
  describe('rendering', () => {
    it('renders the section heading with "Generational Differences" title', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Generational Differences'
      );
    });

    it('renders all notes', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(screen.getByText('Gen Z')).toBeInTheDocument();
      expect(screen.getByText('Millennials')).toBeInTheDocument();
    });

    it('renders interpretation content', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(
        screen.getByText(
          'Skull emoji means "I\'m dead" (from laughing) - the ultimate expression of finding something hilarious.'
        )
      ).toBeInTheDocument();
    });

    it('renders example when provided', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(screen.getByText('"that video has me 💀💀💀"')).toBeInTheDocument();
    });

    it('renders source citation when provided', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(screen.getByText(/Emojipedia Usage Trends 2023/)).toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'gen-notes-heading');
    });

    it('returns null when notes array is empty', () => {
      const { container } = render(<GenerationalNotesSection notes={[]} emojiCharacter="💀" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('generation labels', () => {
    it('displays Gen Z with correct label and years', () => {
      render(<GenerationalNotesSection notes={allGenerationsNotes} emojiCharacter="💀" />);
      expect(screen.getByText('Gen Z')).toBeInTheDocument();
      expect(screen.getByText('1997-2012')).toBeInTheDocument();
    });

    it('displays Millennials with correct label and years', () => {
      render(<GenerationalNotesSection notes={allGenerationsNotes} emojiCharacter="💀" />);
      expect(screen.getByText('Millennials')).toBeInTheDocument();
      expect(screen.getByText('1981-1996')).toBeInTheDocument();
    });

    it('displays Gen X with correct label and years', () => {
      render(<GenerationalNotesSection notes={allGenerationsNotes} emojiCharacter="💀" />);
      expect(screen.getByText('Gen X')).toBeInTheDocument();
      expect(screen.getByText('1965-1980')).toBeInTheDocument();
    });

    it('displays Boomers with correct label and years', () => {
      render(<GenerationalNotesSection notes={allGenerationsNotes} emojiCharacter="💀" />);
      expect(screen.getByText('Boomers')).toBeInTheDocument();
      expect(screen.getByText('1946-1964')).toBeInTheDocument();
    });
  });

  describe('cringe factor', () => {
    it('displays "Acceptable" for acceptable cringe factor', () => {
      render(<GenerationalNotesSection notes={noteWithAllCringeFactors} emojiCharacter="💀" />);
      expect(screen.getByText('Acceptable')).toBeInTheDocument();
    });

    it('displays "Slightly Cringe" for slightly-cringe factor', () => {
      render(<GenerationalNotesSection notes={noteWithAllCringeFactors} emojiCharacter="💀" />);
      expect(screen.getByText('Slightly Cringe')).toBeInTheDocument();
    });

    it('displays "Very Cringe" for very-cringe factor', () => {
      render(<GenerationalNotesSection notes={noteWithAllCringeFactors} emojiCharacter="💀" />);
      expect(screen.getByText('Very Cringe')).toBeInTheDocument();
    });

    it('displays "Ironic Use Only" for ironic-use factor', () => {
      render(<GenerationalNotesSection notes={noteWithAllCringeFactors} emojiCharacter="💀" />);
      expect(screen.getByText('Ironic Use Only')).toBeInTheDocument();
    });

    it('does not display cringe factor when not provided', () => {
      render(<GenerationalNotesSection notes={singleNote} emojiCharacter="💀" />);
      expect(screen.queryByText('Acceptable')).not.toBeInTheDocument();
      expect(screen.queryByText('Slightly Cringe')).not.toBeInTheDocument();
      expect(screen.queryByText('Very Cringe')).not.toBeInTheDocument();
      expect(screen.queryByText('Ironic Use Only')).not.toBeInTheDocument();
    });
  });

  describe('cringe factor styling', () => {
    it('applies green color for acceptable', () => {
      const acceptableNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'acceptable' },
      ];
      render(<GenerationalNotesSection notes={acceptableNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Acceptable');
      expect(badge).toHaveClass('text-green-600');
    });

    it('applies yellow color for slightly-cringe', () => {
      const slightlyCringeNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'slightly-cringe' },
      ];
      render(<GenerationalNotesSection notes={slightlyCringeNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Slightly Cringe');
      expect(badge).toHaveClass('text-yellow-600');
    });

    it('applies red color for very-cringe', () => {
      const veryCringeNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'very-cringe' },
      ];
      render(<GenerationalNotesSection notes={veryCringeNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Very Cringe');
      expect(badge).toHaveClass('text-red-600');
    });

    it('applies purple color for ironic-use', () => {
      const ironicUseNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'ironic-use' },
      ];
      render(<GenerationalNotesSection notes={ironicUseNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Ironic Use Only');
      expect(badge).toHaveClass('text-purple-600');
    });
  });

  describe('collapsible functionality', () => {
    it('renders expand/collapse button', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(screen.getByRole('button', { name: /generational differences/i })).toBeInTheDocument();
    });

    it('starts expanded by default', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /generational differences/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses content when header button is clicked', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /generational differences/i });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands content when header button is clicked again', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /generational differences/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides notes when collapsed', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /generational differences/i });
      fireEvent.click(button);
      expect(screen.queryByText('Gen Z')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'gen-notes-heading');
    });

    it('section has proper ARIA landmark', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('expand button has aria-expanded attribute', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /generational differences/i });
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('example blockquote is properly styled', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const example = screen.getByText('"that video has me 💀💀💀"');
      expect(example.closest('blockquote')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles single note', () => {
      render(<GenerationalNotesSection notes={singleNote} emojiCharacter="💀" />);
      expect(screen.getByText('Gen Z')).toBeInTheDocument();
    });

    it('handles notes without example', () => {
      const noteWithoutExample: GenerationalNoteExtended[] = [
        {
          generation: 'GEN_Z',
          interpretation: 'Test interpretation without example',
        },
      ];
      render(<GenerationalNotesSection notes={noteWithoutExample} emojiCharacter="💀" />);
      expect(screen.getByText('Test interpretation without example')).toBeInTheDocument();
    });

    it('handles notes without cringeFactor', () => {
      render(<GenerationalNotesSection notes={singleNote} emojiCharacter="💀" />);
      expect(screen.getByText('Test interpretation')).toBeInTheDocument();
    });

    it('handles different emoji characters', () => {
      render(<GenerationalNotesSection notes={singleNote} emojiCharacter="😀" />);
      expect(screen.getByText('Gen Z')).toBeInTheDocument();
    });

    it('handles complex emoji characters', () => {
      render(<GenerationalNotesSection notes={singleNote} emojiCharacter="👩‍💻" />);
      expect(screen.getByText('Gen Z')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" className="custom-class" />
      );
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });

    it('renders cards with border styling', () => {
      render(<GenerationalNotesSection notes={singleNote} emojiCharacter="💀" />);
      const noteCard = screen.getByText('Test interpretation').closest('.border');
      expect(noteCard).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('uses grid layout for notes', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      // Find the grid container
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('has md:grid-cols-2 for responsive columns', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });
  });

  describe('dark mode support', () => {
    it('has dark mode classes for card background', () => {
      render(<GenerationalNotesSection notes={singleNote} emojiCharacter="💀" />);
      const noteCard = screen.getByText('Test interpretation').closest('.border');
      expect(noteCard).toHaveClass('dark:bg-card');
    });

    it('has dark mode classes for acceptable cringe factor', () => {
      const acceptableNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'acceptable' },
      ];
      render(<GenerationalNotesSection notes={acceptableNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Acceptable');
      expect(badge).toHaveClass('dark:text-green-400');
    });

    it('has dark mode classes for slightly-cringe factor', () => {
      const slightlyCringeNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'slightly-cringe' },
      ];
      render(<GenerationalNotesSection notes={slightlyCringeNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Slightly Cringe');
      expect(badge).toHaveClass('dark:text-yellow-400');
    });

    it('has dark mode classes for very-cringe factor', () => {
      const veryCringeNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'very-cringe' },
      ];
      render(<GenerationalNotesSection notes={veryCringeNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Very Cringe');
      expect(badge).toHaveClass('dark:text-red-400');
    });

    it('has dark mode classes for ironic-use factor', () => {
      const ironicUseNote: GenerationalNoteExtended[] = [
        { generation: 'GEN_Z', interpretation: 'Test', cringeFactor: 'ironic-use' },
      ];
      render(<GenerationalNotesSection notes={ironicUseNote} emojiCharacter="💀" />);
      const badge = screen.getByText('Ironic Use Only');
      expect(badge).toHaveClass('dark:text-purple-400');
    });
  });

  describe('icons', () => {
    it('renders users icon in the heading', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('renders chevron down icon when expanded', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('renders chevron up icon when collapsed', () => {
      render(<GenerationalNotesSection notes={mockNotes} emojiCharacter="💀" />);
      const button = screen.getByRole('button', { name: /generational differences/i });
      fireEvent.click(button);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });
});
