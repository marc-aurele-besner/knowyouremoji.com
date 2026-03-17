import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { ShareSection } from '@/components/share/share-section';

afterEach(() => {
  cleanup();
});

describe('ShareSection', () => {
  const defaultProps = {
    url: 'https://knowyouremoji.com/emoji/fire',
    title: 'Check out what 🔥 really means!',
  };

  it('renders share label', () => {
    render(<ShareSection {...defaultProps} />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders share buttons', () => {
    render(<ShareSection {...defaultProps} />);
    expect(screen.getByRole('group', { name: /share/i })).toBeInTheDocument();
  });

  it('renders desktop platforms when navigator.share is not available', () => {
    // navigator.share is undefined in test environment by default
    render(<ShareSection {...defaultProps} />);
    expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share on facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ShareSection {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('passes hashtags to ShareButtons', () => {
    render(<ShareSection {...defaultProps} hashtags={['emoji', 'fire']} />);
    // Just verify it renders without error - hashtags passed through
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('hides labels on buttons', () => {
    render(<ShareSection {...defaultProps} />);
    // Labels should be hidden in ShareSection (showLabels=false)
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
  });
});
