import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { EmojiSectionNav } from '@/components/emoji/emoji-section-nav';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

const sections = [
  { id: 'meaning', label: 'Meaning' },
  { id: 'platforms', label: 'Platforms & generations' },
  { id: 'related', label: 'Related' },
];

/** Add target elements whose top offsets we control. */
function addTargets(tops: Record<string, number>) {
  for (const [id, top] of Object.entries(tops)) {
    const el = document.createElement('div');
    el.id = id;
    el.getBoundingClientRect = () => ({ top }) as DOMRect;
    document.body.appendChild(el);
  }
}

describe('EmojiSectionNav', () => {
  it('renders nothing without sections', () => {
    const { container } = render(<EmojiSectionNav sections={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders anchor links for every section', () => {
    render(<EmojiSectionNav sections={sections} className="mt-8" />);
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(nav).toHaveClass('sticky', 'mt-8');
    expect(screen.getByRole('link', { name: 'Meaning' })).toHaveAttribute('href', '#meaning');
    expect(screen.getByRole('link', { name: 'Related' })).toHaveAttribute('href', '#related');
  });

  it('marks the first section as current when nothing has scrolled past', () => {
    render(<EmojiSectionNav sections={sections} />);
    expect(screen.getByRole('link', { name: 'Meaning' })).toHaveAttribute(
      'aria-current',
      'location'
    );
    expect(screen.getByRole('link', { name: 'Related' })).not.toHaveAttribute('aria-current');
  });

  it('updates the current section on scroll (scroll-spy)', () => {
    addTargets({ meaning: -400, platforms: 100, related: 900 });
    render(<EmojiSectionNav sections={sections} />);
    expect(screen.getByRole('link', { name: 'Platforms & generations' })).toHaveAttribute(
      'aria-current',
      'location'
    );

    // Scroll further: related reaches the top offset
    document.getElementById('related')!.getBoundingClientRect = () => ({ top: 50 }) as DOMRect;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('link', { name: 'Related' })).toHaveAttribute(
      'aria-current',
      'location'
    );
  });

  it('highlights a section immediately when its link is clicked', () => {
    render(<EmojiSectionNav sections={sections} />);
    const related = screen.getByRole('link', { name: 'Related' });
    fireEvent.click(related);
    expect(related).toHaveAttribute('aria-current', 'location');
  });

  it('removes its listeners on unmount', () => {
    const { unmount } = render(<EmojiSectionNav sections={sections} />);
    unmount();
    // Dispatching after unmount must not throw
    window.dispatchEvent(new Event('resize'));
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
