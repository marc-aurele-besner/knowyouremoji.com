import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { ComboBrowser, type ComboBrowserGroup } from '@/components/combo/combo-browser';

afterEach(() => {
  cleanup();
});

const groups: ComboBrowserGroup[] = [
  {
    slug: 'humor',
    displayName: 'Humor',
    combos: [
      {
        slug: 'skull-laughing',
        combo: '💀😂',
        name: 'Dead Laughing',
        meaning: 'So funny I died',
        category: 'humor',
      },
      {
        slug: 'clown-face',
        combo: '🤡🤡',
        name: 'Clown Behavior',
        meaning: 'Acting foolish',
        category: 'humor',
      },
    ],
  },
  {
    slug: 'flirting',
    displayName: 'Flirting',
    combos: [
      {
        slug: 'shy-fingers',
        combo: '👉👈',
        name: 'Shy Fingers',
        meaning: 'Nervous and hopeful',
        category: 'flirting',
      },
    ],
  },
];

function comboLinkNames() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href')?.startsWith('/combo/'))
    .map((link) => link.getAttribute('aria-label'));
}

describe('ComboBrowser', () => {
  it('renders every combo grouped by category by default', () => {
    render(<ComboBrowser groups={groups} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Humor' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Flirting' })).toBeInTheDocument();
    expect(comboLinkNames()).toEqual(['Dead Laughing', 'Clown Behavior', 'Shy Fingers']);
    expect(screen.getByRole('button', { name: 'By category' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('renders the filters slot', () => {
    render(<ComboBrowser groups={groups} filters={<p>Filter row</p>} className="extra" />);
    expect(screen.getByText('Filter row')).toBeInTheDocument();
    expect(screen.getByTestId('combo-browser')).toHaveClass('extra');
  });

  it('flattens and sorts A–Z when the A–Z sort is chosen', () => {
    render(<ComboBrowser groups={groups} />);
    fireEvent.click(screen.getByRole('button', { name: 'A–Z' }));
    expect(screen.getByRole('button', { name: 'A–Z' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('heading', { level: 2, name: 'Humor' })).toBeNull();
    expect(comboLinkNames()).toEqual(['Clown Behavior', 'Dead Laughing', 'Shy Fingers']);
    expect(screen.getByRole('status')).toHaveTextContent('All 3 combos, A–Z');
    // Flat cards carry their category badge
    expect(screen.getAllByText('Humor')).toHaveLength(2);
  });

  it('filters by query and shows the result count', () => {
    render(<ComboBrowser groups={groups} />);
    fireEvent.change(screen.getByRole('searchbox', { name: /search combos/i }), {
      target: { value: 'shy' },
    });
    expect(comboLinkNames()).toEqual(['Shy Fingers']);
    expect(screen.getByRole('status')).toHaveTextContent('1 combo for “shy”');
  });

  it('pluralises the count for multiple matches', () => {
    render(<ComboBrowser groups={groups} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'a' } });
    expect(screen.getByRole('status')).toHaveTextContent('3 combos for “a”');
  });

  it('shows an empty state with a clear button when nothing matches', () => {
    render(<ComboBrowser groups={groups} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(screen.getByText('No combos match “zzzz”')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(input).toHaveValue('');
    expect(screen.getByRole('heading', { level: 2, name: 'Humor' })).toBeInTheDocument();
  });

  it('does not submit the search form', () => {
    render(<ComboBrowser groups={groups} />);
    const form = screen.getByRole('search');
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(within(form).getByRole('searchbox')).toBeInTheDocument();
  });
});
