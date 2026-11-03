import { describe, expect, test, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';

mock.module('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
  Instrument_Serif: () => ({ variable: '--font-instrument-serif' }),
}));

describe('Guides layout', () => {
  afterEach(() => {
    cleanup();
  });

  test('scopes the Instrument Serif variable to the guides section', async () => {
    const { default: GuidesLayout } = await import('@/app/guides/layout');

    render(
      <GuidesLayout>
        <p>Guide body</p>
      </GuidesLayout>
    );

    const wrapper = screen.getByText('Guide body').parentElement;
    expect(wrapper).toHaveClass('--font-instrument-serif');
    expect(wrapper).toHaveClass('guides-fonts');
  });
});
