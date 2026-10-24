import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { ComboCategoryChips } from '@/components/combo/combo-category-chips';

afterEach(() => {
  cleanup();
});

const categories = [
  { slug: 'humor', displayName: 'Humor', comboCount: 12 },
  { slug: 'flirting', displayName: 'Flirting', comboCount: 5 },
];

describe('ComboCategoryChips', () => {
  it('renders an All chip plus one chip per category with counts', () => {
    render(<ComboCategoryChips categories={categories} totalCount={17} />);
    const nav = screen.getByRole('navigation', { name: /combo categories/i });
    expect(nav.querySelectorAll('a')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /all\s*17/i })).toHaveAttribute('href', '/combo');
    expect(screen.getByRole('link', { name: /humor\s*12/i })).toHaveAttribute(
      'href',
      '/combo/category/humor'
    );
  });

  it('marks All as current when no category is active', () => {
    render(<ComboCategoryChips categories={categories} totalCount={17} />);
    const all = screen.getByRole('link', { name: /all/i });
    expect(all).toHaveAttribute('aria-current', 'page');
    expect(all).toHaveClass('bg-foreground');
    expect(screen.getByRole('link', { name: /humor/i })).not.toHaveAttribute('aria-current');
  });

  it('marks the active category as current', () => {
    render(
      <ComboCategoryChips
        categories={categories}
        totalCount={17}
        activeSlug="flirting"
        className="extra"
      />
    );
    expect(screen.getByRole('link', { name: /flirting/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /all/i })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('navigation')).toHaveClass('extra');
  });
});
