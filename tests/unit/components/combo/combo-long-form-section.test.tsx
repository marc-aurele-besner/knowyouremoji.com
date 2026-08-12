import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup, screen } from '@testing-library/react';
import { ComboLongFormSection } from '@/components/combo/combo-long-form-section';
import type { ComboLongForm } from '@/types/combo';

afterEach(() => {
  cleanup();
});

const baseLongForm: ComboLongForm = {
  overview: 'First paragraph of the combo overview.\n\nSecond paragraph still in overview.',
  howPeopleUseIt: 'It shows up in hype threads.',
  whenNotToUse: 'Skip it in professional channels.',
  howToReply: 'Mirror the energy with another combo.',
  faqs: [
    { question: 'What does it mean?', answer: 'It means the sender thinks it is flawless.' },
    { question: 'Is it flirty?', answer: 'Usually not.' },
  ],
};

describe('ComboLongFormSection', () => {
  it('renders nothing when the long-form block is empty', () => {
    const { container } = render(<ComboLongFormSection longForm={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when the long-form block only contains empty strings', () => {
    const { container } = render(
      <ComboLongFormSection longForm={{ overview: '   ', howPeopleUseIt: '' }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the overview heading and splits paragraphs on blank lines', () => {
    render(<ComboLongFormSection longForm={{ overview: baseLongForm.overview }} />);
    expect(screen.getByRole('heading', { name: 'Overview', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('First paragraph of the combo overview.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph still in overview.')).toBeInTheDocument();
  });

  it('renders the how-people-use-it sub-section', () => {
    render(<ComboLongFormSection longForm={{ howPeopleUseIt: 'It shows up in hype threads.' }} />);
    expect(
      screen.getByRole('heading', { name: 'How People Use It', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText('It shows up in hype threads.')).toBeInTheDocument();
  });

  it('renders the when-not-to-use sub-section', () => {
    render(
      <ComboLongFormSection longForm={{ whenNotToUse: 'Skip it in professional channels.' }} />
    );
    expect(
      screen.getByRole('heading', { name: 'When Not to Use It', level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText('Skip it in professional channels.')).toBeInTheDocument();
  });

  it('renders the how-to-reply sub-section', () => {
    render(<ComboLongFormSection longForm={{ howToReply: 'Mirror with another combo.' }} />);
    expect(screen.getByRole('heading', { name: 'How to Reply', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Mirror with another combo.')).toBeInTheDocument();
  });

  it('renders the FAQ block when faqs are present', () => {
    render(<ComboLongFormSection longForm={{ faqs: baseLongForm.faqs }} />);
    expect(
      screen.getByRole('heading', { name: 'Frequently Asked Questions', level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'What does it mean?', level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText('It means the sender thinks it is flawless.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Is it flirty?', level: 3 })).toBeInTheDocument();
  });

  it('renders every sub-section when fully populated', () => {
    render(<ComboLongFormSection longForm={baseLongForm} />);
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
    render(<ComboLongFormSection longForm={{ ...baseLongForm, faqs: [] }} />);
    expect(
      screen.queryByRole('heading', { name: 'Frequently Asked Questions', level: 2 })
    ).toBeNull();
  });

  it('uses the combo-prefixed testid so emoji and combo testids stay distinct', () => {
    const { container } = render(<ComboLongFormSection longForm={baseLongForm} />);
    expect(container.querySelector('[data-testid="combo-long-form-section"]')).not.toBeNull();
  });
});
