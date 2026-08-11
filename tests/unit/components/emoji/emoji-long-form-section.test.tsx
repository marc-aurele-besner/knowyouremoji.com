import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup, screen } from '@testing-library/react';
import { EmojiLongFormSection } from '@/components/emoji/emoji-long-form-section';
import type { EmojiLongForm } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

const baseLongForm: EmojiLongForm = {
  overview: 'First paragraph of the overview.\n\nSecond paragraph still in overview.',
  howPeopleUseIt: 'It shows up everywhere.',
  whenNotToUse: 'Skip it in formal channels.',
  howToReply: 'Mirror the energy with another skull.',
  faqs: [
    { question: 'What does it mean?', answer: 'It means the sender is amused.' },
    { question: 'Is it flirty?', answer: 'Usually not.' },
  ],
};

describe('EmojiLongFormSection', () => {
  it('renders nothing when the long-form block is empty', () => {
    const { container } = render(<EmojiLongFormSection longForm={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when the long-form block only contains empty strings', () => {
    const { container } = render(
      <EmojiLongFormSection longForm={{ overview: '   ', howPeopleUseIt: '' }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the overview heading and splits paragraphs on blank lines', () => {
    render(<EmojiLongFormSection longForm={{ overview: baseLongForm.overview }} />);
    expect(screen.getByRole('heading', { name: 'Overview', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('First paragraph of the overview.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph still in overview.')).toBeInTheDocument();
  });

  it('renders the how-people-use-it sub-section', () => {
    render(<EmojiLongFormSection longForm={{ howPeopleUseIt: 'It shows up everywhere.' }} />);
    expect(
      screen.getByRole('heading', { name: 'How People Use It', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText('It shows up everywhere.')).toBeInTheDocument();
  });

  it('renders the when-not-to-use sub-section', () => {
    render(<EmojiLongFormSection longForm={{ whenNotToUse: 'Skip it in formal channels.' }} />);
    expect(
      screen.getByRole('heading', { name: 'When Not to Use It', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText('Skip it in formal channels.')).toBeInTheDocument();
  });

  it('renders the how-to-reply sub-section', () => {
    render(<EmojiLongFormSection longForm={{ howToReply: 'Mirror with another skull.' }} />);
    expect(screen.getByRole('heading', { name: 'How to Reply', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Mirror with another skull.')).toBeInTheDocument();
  });

  it('renders the FAQ block when faqs are present', () => {
    render(<EmojiLongFormSection longForm={{ faqs: baseLongForm.faqs }} />);
    expect(
      screen.getByRole('heading', { name: 'Frequently Asked Questions', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'What does it mean?', level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText('It means the sender is amused.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Is it flirty?', level: 3 })).toBeInTheDocument();
  });

  it('renders every sub-section when fully populated', () => {
    render(<EmojiLongFormSection longForm={baseLongForm} />);
    expect(screen.getByRole('heading', { name: 'Overview', level: 2 })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'How People Use It', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'When Not to Use It', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How to Reply', level: 2 })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Frequently Asked Questions', level: 2 })
    ).toBeInTheDocument();
  });

  it('skips the FAQ block when faqs is an empty array', () => {
    render(<EmojiLongFormSection longForm={{ ...baseLongForm, faqs: [] }} />);
    expect(
      screen.queryByRole('heading', { name: 'Frequently Asked Questions', level: 2 })
    ).toBeNull();
  });
});
