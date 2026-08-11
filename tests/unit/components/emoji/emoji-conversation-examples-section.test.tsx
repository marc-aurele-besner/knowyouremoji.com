import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup, screen } from '@testing-library/react';
import { EmojiConversationExamplesSection } from '@/components/emoji/emoji-conversation-examples-section';
import type { ConversationExample } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

const examples: ConversationExample[] = [
  {
    setting: 'friends',
    message: 'bro i just tripped into the projector at work 💀',
    interpretation: 'Sender is laughing at their own embarrassment.',
  },
  {
    setting: 'work',
    message: 'reminder: all-hands at 8am tomorrow 💀',
    interpretation: 'Sarcastic exhaustion about an early meeting.',
  },
];

describe('EmojiConversationExamplesSection', () => {
  it('renders nothing when there are no examples', () => {
    const { container } = render(<EmojiConversationExamplesSection examples={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the section heading and one card per example', () => {
    render(<EmojiConversationExamplesSection examples={examples} />);
    expect(
      screen.getByRole('heading', { name: 'Real Conversation Examples', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('conversation-example')).toHaveLength(2);
  });

  it('renders the conversation message as a blockquote', () => {
    render(<EmojiConversationExamplesSection examples={examples} />);
    // Blockquote wraps the message with curly quotes — match the inner substring.
    expect(
      screen.getByText(/bro i just tripped into the projector at work 💀/)
    ).toBeInTheDocument();
  });

  it('renders the interpretation paragraph', () => {
    render(<EmojiConversationExamplesSection examples={examples} />);
    expect(screen.getByText('Sender is laughing at their own embarrassment.')).toBeInTheDocument();
    expect(screen.getByText('Sarcastic exhaustion about an early meeting.')).toBeInTheDocument();
  });

  it('renders a human-readable setting label', () => {
    render(<EmojiConversationExamplesSection examples={examples} />);
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('falls back to the raw setting when the value is not in the label map', () => {
    render(
      <EmojiConversationExamplesSection
        examples={[{ setting: 'other', message: '💀', interpretation: 'test' }]}
      />
    );
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
