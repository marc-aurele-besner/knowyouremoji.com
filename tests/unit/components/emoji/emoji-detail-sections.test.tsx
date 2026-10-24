import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, within } from '@testing-library/react';
import {
  ContextMeaningCards,
  DetailSection,
  EmojiWarningRows,
  GenerationalNotesGrid,
  PlatformNotesList,
} from '@/components/emoji/emoji-detail-sections';
import type { ContextMeaning, GenerationalNote } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

describe('DetailSection', () => {
  it('renders a labelled section with an h2 and optional extra content', () => {
    render(
      <DetailSection id="demo" title="Demo title" extra={<span>extra</span>} className="custom">
        <p>Body</p>
      </DetailSection>
    );
    const section = screen.getByRole('region', { name: 'Demo title' });
    expect(section).toHaveClass('mt-14', 'custom');
    expect(screen.getByRole('heading', { level: 2, name: 'Demo title' })).toHaveAttribute(
      'id',
      'demo-heading'
    );
    expect(screen.getByText('extra')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});

describe('ContextMeaningCards', () => {
  const meanings: ContextMeaning[] = [
    { context: 'SLANG', meaning: 'Very funny.', example: 'lol 💀', riskLevel: 'LOW' },
    { context: 'LITERAL', meaning: 'A skull.', example: '', riskLevel: 'MEDIUM' },
    { context: 'RED_FLAG', meaning: 'Could be a threat.', example: 'watch out', riskLevel: 'HIGH' },
  ];

  it('renders one card per meaning with anchors for share links', () => {
    render(<ContextMeaningCards meanings={meanings} character="💀" slug="skull" />);
    const cards = screen.getAllByTestId('context-meaning-card');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute('id', 'context-0');
    expect(cards[2]).toHaveAttribute('id', 'context-2');
  });

  it('links contexts that have a hub page and leaves others as plain text', () => {
    render(<ContextMeaningCards meanings={meanings} character="💀" slug="skull" />);
    expect(screen.getByRole('link', { name: 'Slang' })).toHaveAttribute(
      'href',
      '/emoji/context/SLANG'
    );
    expect(screen.queryByRole('link', { name: 'Literal' })).toBeNull();
    expect(screen.getByRole('heading', { level: 3, name: 'Literal' })).toBeInTheDocument();
  });

  it('renders risk badges with status colours', () => {
    render(<ContextMeaningCards meanings={meanings} character="💀" slug="skull" />);
    expect(screen.getByText('low risk')).toHaveClass('text-success');
    expect(screen.getByText('medium risk')).toHaveClass('text-primary-700');
    expect(screen.getByText('high risk')).toHaveClass('text-danger');
  });

  it('renders examples as chat bubbles only when present', () => {
    render(<ContextMeaningCards meanings={meanings} character="💀" slug="skull" />);
    const cards = screen.getAllByTestId('context-meaning-card');
    expect(within(cards[0]).getByText('lol 💀')).toHaveClass('rounded-bl-sm');
    expect(within(cards[1]).queryByText(/Example:/)).toBeNull();
  });

  it('renders copy and share actions for each card', () => {
    render(<ContextMeaningCards meanings={meanings} character="💀" slug="skull" />);
    expect(screen.getByRole('button', { name: 'Copy Slang meaning' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share Slang meaning' })).toBeInTheDocument();
  });
});

describe('EmojiWarningRows', () => {
  it('renders tinted rows, red for HIGH severity', () => {
    render(
      <EmojiWarningRows
        warnings={[
          { title: 'Careful', description: 'Mild issue.', severity: 'LOW' },
          { title: 'Danger', description: 'Serious issue.', severity: 'HIGH' },
        ]}
      />
    );
    const rows = screen.getAllByRole('note');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveClass('bg-primary-50');
    expect(rows[1]).toHaveClass('bg-danger-background');
    expect(within(rows[1]).getByText('high')).toHaveClass('text-danger');
    expect(screen.getByText('Serious issue.')).toBeInTheDocument();
  });
});

describe('PlatformNotesList', () => {
  it('renders each note with a platform hub link and copy button', () => {
    render(
      <PlatformNotesList
        notes={[
          { platform: 'TIKTOK', note: 'Common in comments.' },
          { platform: 'SLACK', note: 'Used as a reaction.' },
        ]}
      />
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'TikTok' })).toHaveAttribute(
      'href',
      '/emoji/platform/TIKTOK'
    );
    expect(screen.getByText('Used as a reaction.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy Slack note' })).toBeInTheDocument();
  });
});

describe('GenerationalNotesGrid', () => {
  it('renders generation cards linking to the generation hubs', () => {
    const notes: GenerationalNote[] = [
      { generation: 'GEN_Z', note: 'Means laughing.' },
      { generation: 'ALPHA' as GenerationalNote['generation'], note: 'Unknown cohort.' },
    ];
    render(<GenerationalNotesGrid notes={notes} />);
    const genZ = screen.getByRole('link', { name: /Gen Z/ });
    expect(genZ).toHaveAttribute('href', '/emoji/generation/GEN_Z');
    expect(genZ).toHaveTextContent('Born 1997–2012');
    const unknown = screen.getByRole('link', { name: /ALPHA/ });
    expect(unknown).not.toHaveTextContent('Born');
  });
});
