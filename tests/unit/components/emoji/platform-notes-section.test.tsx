import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PlatformNotesSection } from '@/components/emoji/platform-notes-section';
import type { PlatformNoteExtended } from '@/components/emoji/platform-notes-section';

afterEach(() => {
  cleanup();
});

const mockNotes: PlatformNoteExtended[] = [
  {
    platform: 'IMESSAGE',
    note: 'The pistol emoji was changed from a realistic gun to a water gun in iOS 10.',
    importance: 'critical',
    version: 'iOS 10',
    date: '2016-08-01',
  },
  {
    platform: 'TWITTER',
    note: 'Twitter uses Twemoji which displays a more neutral style.',
    importance: 'info',
  },
  {
    platform: 'WHATSAPP',
    note: 'WhatsApp uses its own design which may differ from other platforms.',
    importance: 'warning',
    version: '2.19',
  },
];

const singleNote: PlatformNoteExtended[] = [
  {
    platform: 'DISCORD',
    note: 'Discord uses its own emoji design.',
    importance: 'info',
  },
];

const notesWithImageComparison: PlatformNoteExtended[] = [
  {
    platform: 'IMESSAGE',
    note: 'Changed from pistol to water gun.',
    importance: 'critical',
    imageComparison: {
      before: '/images/pistol-before.png',
      after: '/images/pistol-after.png',
    },
  },
];

describe('PlatformNotesSection', () => {
  describe('rendering', () => {
    it('renders the section heading with emoji and count', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        '🔫 Platform-Specific notes'
      );
    });

    it('renders singular form for single note', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="🔫" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        '🔫 Platform-Specific note'
      );
    });

    it('renders all notes', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      expect(screen.getByText('iMessage')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    });

    it('renders note content', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      expect(
        screen.getByText(
          'The pistol emoji was changed from a realistic gun to a water gun in iOS 10.'
        )
      ).toBeInTheDocument();
    });

    it('renders version information when provided', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      expect(screen.getByText('(iOS 10)')).toBeInTheDocument();
      expect(screen.getByText('(2.19)')).toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'platform-notes-heading');
    });

    it('returns null when notes array is empty', () => {
      const { container } = render(<PlatformNotesSection notes={[]} emojiCharacter="🔫" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('importance styling', () => {
    it('renders info notes with blue styling', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="🔫" />);
      const noteText = screen.getByText('Discord uses its own emoji design.');
      // Find the outermost card container with border and rounded classes
      const noteCard = noteText.closest('.border.rounded-lg');
      expect(noteCard).toHaveClass('bg-blue-50', 'border-blue-200');
    });

    it('renders warning notes with yellow styling', () => {
      const warningNote: PlatformNoteExtended[] = [
        {
          platform: 'SLACK',
          note: 'Warning note content',
          importance: 'warning',
        },
      ];
      render(<PlatformNotesSection notes={warningNote} emojiCharacter="🔫" />);
      const noteText = screen.getByText('Warning note content');
      const noteCard = noteText.closest('.border.rounded-lg');
      expect(noteCard).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });

    it('renders critical notes with red styling', () => {
      const criticalNote: PlatformNoteExtended[] = [
        {
          platform: 'IMESSAGE',
          note: 'Critical note content',
          importance: 'critical',
        },
      ];
      render(<PlatformNotesSection notes={criticalNote} emojiCharacter="🔫" />);
      const noteText = screen.getByText('Critical note content');
      const noteCard = noteText.closest('.border.rounded-lg');
      expect(noteCard).toHaveClass('bg-red-50', 'border-red-200');
    });

    it('defaults to info importance when not specified', () => {
      const noteWithoutImportance: PlatformNoteExtended[] = [
        {
          platform: 'TIKTOK',
          note: 'Note without importance',
        },
      ];
      render(<PlatformNotesSection notes={noteWithoutImportance} emojiCharacter="🔫" />);
      const noteText = screen.getByText('Note without importance');
      const noteCard = noteText.closest('.border.rounded-lg');
      expect(noteCard).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });

  describe('platform name formatting', () => {
    it('formats IMESSAGE as iMessage', () => {
      render(
        <PlatformNotesSection
          notes={singleNote.map((n) => ({ ...n, platform: 'IMESSAGE' }))}
          emojiCharacter="🔫"
        />
      );
      expect(screen.getByText('iMessage')).toBeInTheDocument();
    });

    it('formats TWITTER as Twitter', () => {
      const twitterNote: PlatformNoteExtended[] = [
        { platform: 'TWITTER', note: 'Test', importance: 'info' },
      ];
      render(<PlatformNotesSection notes={twitterNote} emojiCharacter="🔫" />);
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('formats WHATSAPP as WhatsApp', () => {
      const whatsappNote: PlatformNoteExtended[] = [
        { platform: 'WHATSAPP', note: 'Test', importance: 'info' },
      ];
      render(<PlatformNotesSection notes={whatsappNote} emojiCharacter="🔫" />);
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    });

    it('formats TIKTOK as TikTok', () => {
      const tiktokNote: PlatformNoteExtended[] = [
        { platform: 'TIKTOK', note: 'Test', importance: 'info' },
      ];
      render(<PlatformNotesSection notes={tiktokNote} emojiCharacter="🔫" />);
      expect(screen.getByText('TikTok')).toBeInTheDocument();
    });

    it('formats DISCORD as Discord', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="🔫" />);
      expect(screen.getByText('Discord')).toBeInTheDocument();
    });

    it('formats SLACK as Slack', () => {
      const slackNote: PlatformNoteExtended[] = [
        { platform: 'SLACK', note: 'Test', importance: 'info' },
      ];
      render(<PlatformNotesSection notes={slackNote} emojiCharacter="🔫" />);
      expect(screen.getByText('Slack')).toBeInTheDocument();
    });

    it('formats INSTAGRAM as Instagram', () => {
      const instagramNote: PlatformNoteExtended[] = [
        { platform: 'INSTAGRAM', note: 'Test', importance: 'info' },
      ];
      render(<PlatformNotesSection notes={instagramNote} emojiCharacter="🔫" />);
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('renders info icon for info importance', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="🔫" />);
      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('renders warning icon for warning importance', () => {
      const warningNote: PlatformNoteExtended[] = [
        { platform: 'SLACK', note: 'Test', importance: 'warning' },
      ];
      render(<PlatformNotesSection notes={warningNote} emojiCharacter="🔫" />);
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('renders critical icon for critical importance', () => {
      const criticalNote: PlatformNoteExtended[] = [
        { platform: 'SLACK', note: 'Test', importance: 'critical' },
      ];
      render(<PlatformNotesSection notes={criticalNote} emojiCharacter="🔫" />);
      expect(screen.getByTestId('critical-icon')).toBeInTheDocument();
    });
  });

  describe('collapsible functionality', () => {
    it('renders collapse/expand button when content is long', () => {
      const longNote: PlatformNoteExtended[] = [
        {
          platform: 'IMESSAGE',
          note: 'This is a very long note '.repeat(50),
          importance: 'info',
        },
      ];
      render(<PlatformNotesSection notes={longNote} emojiCharacter="🔫" />);
      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });

    it('expands content when show more is clicked', () => {
      const longNote: PlatformNoteExtended[] = [
        {
          platform: 'IMESSAGE',
          note: 'This is a very long note that should be truncated initially. '.repeat(20),
          importance: 'info',
        },
      ];
      render(<PlatformNotesSection notes={longNote} emojiCharacter="🔫" />);

      fireEvent.click(screen.getByRole('button', { name: /show more/i }));
      expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument();
    });

    it('collapses content when show less is clicked', () => {
      const longNote: PlatformNoteExtended[] = [
        {
          platform: 'IMESSAGE',
          note: 'This is a very long note that should be truncated initially. '.repeat(20),
          importance: 'info',
        },
      ];
      render(<PlatformNotesSection notes={longNote} emojiCharacter="🔫" />);

      fireEvent.click(screen.getByRole('button', { name: /show more/i }));
      fireEvent.click(screen.getByRole('button', { name: /show less/i }));
      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });
  });

  describe('image comparison', () => {
    it('renders before/after images when imageComparison is provided', () => {
      render(<PlatformNotesSection notes={notesWithImageComparison} emojiCharacter="🔫" />);
      const beforeImage = screen.getByAltText('Before change');
      const afterImage = screen.getByAltText('After change');
      expect(beforeImage).toBeInTheDocument();
      expect(afterImage).toBeInTheDocument();
    });

    it('renders only after image when only after is provided', () => {
      const noteWithOnlyAfter: PlatformNoteExtended[] = [
        {
          platform: 'IMESSAGE',
          note: 'Changed design.',
          importance: 'info',
          imageComparison: {
            after: '/images/after.png',
          },
        },
      ];
      render(<PlatformNotesSection notes={noteWithOnlyAfter} emojiCharacter="🔫" />);
      expect(screen.getByAltText('After change')).toBeInTheDocument();
      expect(screen.queryByAltText('Before change')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'platform-notes-heading');
    });

    it('section has proper ARIA landmark', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('images have alt text', () => {
      render(<PlatformNotesSection notes={notesWithImageComparison} emojiCharacter="🔫" />);
      expect(screen.getByAltText('Before change')).toHaveAttribute('alt');
      expect(screen.getByAltText('After change')).toHaveAttribute('alt');
    });
  });

  describe('edge cases', () => {
    it('handles single note', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="🔫" />);
      expect(screen.getByText('Discord')).toBeInTheDocument();
    });

    it('handles many notes', () => {
      const manyNotes: PlatformNoteExtended[] = Array.from({ length: 10 }, (_, i) => ({
        platform: 'TWITTER' as const,
        note: `Note ${i + 1}`,
        importance: 'info' as const,
      }));
      render(<PlatformNotesSection notes={manyNotes} emojiCharacter="🔫" />);
      expect(screen.getAllByText('Twitter')).toHaveLength(10);
    });

    it('handles different emoji characters', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="😀" />);
      expect(screen.getByText('Discord')).toBeInTheDocument();
    });

    it('handles complex emoji characters', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="👩‍💻" />);
      expect(screen.getByText('Discord')).toBeInTheDocument();
    });

    it('handles notes without optional fields', () => {
      const minimalNote: PlatformNoteExtended[] = [
        {
          platform: 'SLACK',
          note: 'Minimal note',
        },
      ];
      render(<PlatformNotesSection notes={minimalNote} emojiCharacter="🔫" />);
      expect(screen.getByText('Slack')).toBeInTheDocument();
      expect(screen.getByText('Minimal note')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" className="custom-class" />
      );
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });
  });

  describe('dark mode support', () => {
    it('has dark mode classes for info notes', () => {
      render(<PlatformNotesSection notes={singleNote} emojiCharacter="🔫" />);
      const noteText = screen.getByText('Discord uses its own emoji design.');
      const noteCard = noteText.closest('.border.rounded-lg');
      expect(noteCard).toHaveClass('dark:bg-blue-950', 'dark:border-blue-800');
    });

    it('has dark mode classes for warning notes', () => {
      const warningNote: PlatformNoteExtended[] = [
        { platform: 'SLACK', note: 'Warning note', importance: 'warning' },
      ];
      render(<PlatformNotesSection notes={warningNote} emojiCharacter="🔫" />);
      const noteText = screen.getByText('Warning note');
      const noteCard = noteText.closest('.border.rounded-lg');
      expect(noteCard).toHaveClass('dark:bg-yellow-950', 'dark:border-yellow-800');
    });

    it('has dark mode classes for critical notes', () => {
      const criticalNote: PlatformNoteExtended[] = [
        { platform: 'SLACK', note: 'Critical note', importance: 'critical' },
      ];
      render(<PlatformNotesSection notes={criticalNote} emojiCharacter="🔫" />);
      const noteText = screen.getByText('Critical note');
      const noteCard = noteText.closest('.border.rounded-lg');
      expect(noteCard).toHaveClass('dark:bg-red-950', 'dark:border-red-800');
    });
  });

  describe('responsive layout', () => {
    it('renders notes in a vertical stack', () => {
      render(<PlatformNotesSection notes={mockNotes} emojiCharacter="🔫" />);
      const notesContainer = screen.getByRole('region').querySelector('.space-y-4');
      expect(notesContainer).toBeInTheDocument();
    });
  });
});
