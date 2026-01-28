import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/layout/breadcrumbs';

afterEach(() => {
  cleanup();
});

describe('Breadcrumbs', () => {
  const defaultItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Emojis', href: '/emoji' },
    { label: '😀 Grinning Face' },
  ];

  it('renders breadcrumbs navigation', () => {
    render(<Breadcrumbs items={defaultItems} />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('renders all breadcrumb items', () => {
    render(<Breadcrumbs items={defaultItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Emojis')).toBeInTheDocument();
    expect(screen.getByText('😀 Grinning Face')).toBeInTheDocument();
  });

  it('renders items with href as links', () => {
    render(<Breadcrumbs items={defaultItems} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Emojis' })).toHaveAttribute('href', '/emoji');
  });

  it('renders last item without href as text (not link)', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const lastItem = screen.getByText('😀 Grinning Face');
    expect(lastItem.tagName).not.toBe('A');
  });

  it('renders separators between items', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const separators = screen.getAllByText('/');
    expect(separators).toHaveLength(2);
  });

  it('marks last item as current with aria-current', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const lastItem = screen.getByText('😀 Grinning Face');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('applies custom className', () => {
    render(<Breadcrumbs items={defaultItems} className="custom-breadcrumbs" />);
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav).toHaveClass('custom-breadcrumbs');
  });

  it('renders empty when no items provided', () => {
    render(<Breadcrumbs items={[]} />);
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(nav.querySelector('ol')?.children.length).toBe(0);
  });

  it('renders single item correctly', () => {
    render(<Breadcrumbs items={[{ label: 'Home' }]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  it('uses ordered list structure', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
  });

  it('renders list items for each breadcrumb', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const listItems = screen.getAllByRole('listitem');
    // 3 items + 2 separators = 5 list items, or if separators are not in li, then 3
    expect(listItems.length).toBeGreaterThanOrEqual(3);
  });

  it('has appropriate styling for interactive items', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveClass('hover:text-blue-600');
  });

  it('has muted styling for current/last item', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const lastItem = screen.getByText('😀 Grinning Face');
    expect(lastItem).toHaveClass('text-gray-500');
  });
});
