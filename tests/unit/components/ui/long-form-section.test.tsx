import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup, screen } from '@testing-library/react';
import { LongFormSection } from '@/components/ui/long-form-section';
import type { LongFormContent } from '@/components/ui/long-form-section';

afterEach(() => {
  cleanup();
});

const baseLongForm: LongFormContent = {
  overview: 'First paragraph.\n\nSecond paragraph.',
  howPeopleUseIt: 'It shows up everywhere.',
  whenNotToUse: 'Skip it in formal channels.',
  howToReply: 'Mirror the energy.',
  faqs: [{ question: 'What does it mean?', answer: 'It means the sender is amused.' }],
};

describe('LongFormSection', () => {
  it('renders nothing when the long-form block is empty', () => {
    const { container } = render(<LongFormSection longForm={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('uses the default testid when none is provided', () => {
    const { container } = render(<LongFormSection longForm={{ overview: 'paragraph' }} />);
    expect(container.querySelector('[data-testid="long-form-section"]')).not.toBeNull();
  });

  it('honors a custom testid when one is provided', () => {
    const { container } = render(
      <LongFormSection longForm={{ overview: 'paragraph' }} testId="custom-test-id" />
    );
    expect(container.querySelector('[data-testid="custom-test-id"]')).not.toBeNull();
  });

  it('renders the overview heading and splits paragraphs on blank lines', () => {
    render(<LongFormSection longForm={{ overview: baseLongForm.overview }} />);
    expect(screen.getByRole('heading', { name: 'Overview', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
  });

  it('renders every sub-section when fully populated', () => {
    render(<LongFormSection longForm={baseLongForm} />);
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
    render(<LongFormSection longForm={{ ...baseLongForm, faqs: [] }} />);
    expect(
      screen.queryByRole('heading', { name: 'Frequently Asked Questions', level: 2 })
    ).toBeNull();
  });
});
