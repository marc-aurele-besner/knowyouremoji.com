import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ShareCardDialog } from '@/components/share/share-card-dialog';

afterEach(() => {
  cleanup();
});

const props = {
  character: '💀',
  name: 'Skull',
  tldr: "Means 'I'm dead' from laughing.",
  url: 'https://knowyouremoji.com/emoji/skull',
};

describe('ShareCardDialog', () => {
  it('renders a Share trigger and keeps the dialog closed initially', () => {
    render(<ShareCardDialog {...props} triggerClassName="extra" />);
    expect(screen.getByRole('button', { name: 'Share' })).toHaveClass('extra');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a dialog with a preview card and share buttons', () => {
    render(<ShareCardDialog {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    const dialog = screen.getByRole('dialog', { name: 'Share this meaning' });
    expect(dialog).toBeInTheDocument();
    const preview = screen.getByTestId('share-card-preview');
    expect(preview).toHaveTextContent('Skull');
    expect(preview).toHaveTextContent("Means 'I'm dead' from laughing.");
    expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /download card image/i })).toBeNull();
  });

  it('offers the card image download when an image URL is given', () => {
    render(
      <ShareCardDialog
        {...props}
        imageUrl="https://knowyouremoji.com/og/emoji/skull.png"
        imageFileName="skull-meaning.png"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    const link = screen.getByRole('link', { name: /download card image/i });
    expect(link).toHaveAttribute('href', 'https://knowyouremoji.com/og/emoji/skull.png');
    expect(link).toHaveAttribute('download', 'skull-meaning.png');
  });

  it('closes from the close button', () => {
    render(<ShareCardDialog {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
