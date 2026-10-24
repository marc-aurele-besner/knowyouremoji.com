import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { ComboCard } from '@/components/combo/combo-card';

afterEach(() => {
  cleanup();
});

const combo = {
  slug: 'skull-laughing',
  combo: '💀😂',
  name: 'Dead Laughing',
  meaning: 'Something is so funny that you are dead from laughing.',
};

describe('ComboCard', () => {
  it('links to the combo page with the name as accessible label by default', () => {
    render(<ComboCard combo={combo} />);
    const link = screen.getByRole('link', { name: 'Dead Laughing' });
    expect(link).toHaveAttribute('href', '/combo/skull-laughing');
    expect(link).toHaveClass('rounded-2xl');
    expect(link).toHaveClass('bg-card');
  });

  it('renders glyph, name heading and clamped meaning', () => {
    render(<ComboCard combo={combo} />);
    expect(screen.getByText('💀😂')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Dead Laughing' })).toBeInTheDocument();
    expect(screen.getByText(combo.meaning)).toHaveClass('line-clamp-3');
  });

  it('accepts a custom aria-label, heading level and className', () => {
    render(
      <ComboCard
        combo={combo}
        ariaLabel="Dead Laughing combo"
        headingLevel="h2"
        className="extra"
      />
    );
    const link = screen.getByRole('link', { name: 'Dead Laughing combo' });
    expect(link).toHaveClass('extra');
    expect(screen.getByRole('heading', { level: 2, name: 'Dead Laughing' })).toBeInTheDocument();
  });

  it('renders the category badge only when a label is given', () => {
    const { rerender } = render(<ComboCard combo={combo} />);
    expect(screen.queryByText('Humor')).toBeNull();
    rerender(<ComboCard combo={combo} categoryLabel="Humor" />);
    expect(screen.getByText('Humor')).toBeInTheDocument();
  });
});
