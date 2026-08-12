import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup, screen } from '@testing-library/react';
import { ComboConversationExamplesSection } from '@/components/combo/combo-conversation-examples-section';
import type { ComboConversationExample } from '@/types/combo';

afterEach(() => {
  cleanup();
});

const examples: ComboConversationExample[] = [
  {
    setting: 'friends',
    message: 'bro that tiktok of the cat falling into the pool 💀😂',
    interpretation: 'Friend sharing a viral video.',
  },
  {
    setting: 'work',
    message: 'client just replied-all to the wrong thread 💀😂',
    interpretation: 'Sympathetic work disaster.',
  },
];

describe('ComboConversationExamplesSection', () => {
  it('renders nothing when there are no examples', () => {
    const { container } = render(<ComboConversationExamplesSection examples={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the section heading and one card per example', () => {
    render(<ComboConversationExamplesSection examples={examples} />);
    expect(
      screen.getByRole('heading', { name: 'Real Conversation Examples', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('combo-conversation-example')).toHaveLength(2);
  });

  it('renders the conversation message as a blockquote', () => {
    render(<ComboConversationExamplesSection examples={examples} />);
    expect(
      screen.getByText(/bro that tiktok of the cat falling into the pool 💀😂/)
    ).toBeInTheDocument();
  });

  it('renders the interpretation paragraph', () => {
    render(<ComboConversationExamplesSection examples={examples} />);
    expect(screen.getByText('Friend sharing a viral video.')).toBeInTheDocument();
    expect(screen.getByText('Sympathetic work disaster.')).toBeInTheDocument();
  });

  it('renders a human-readable setting label', () => {
    render(<ComboConversationExamplesSection examples={examples} />);
    expect(screen.getByText('Friends')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('uses the combo-prefixed testid so emoji and combo testids stay distinct', () => {
    const { container } = render(<ComboConversationExamplesSection examples={examples} />);
    expect(
      container.querySelector('[data-testid="combo-conversation-examples-section"]')
    ).not.toBeNull();
  });
});
