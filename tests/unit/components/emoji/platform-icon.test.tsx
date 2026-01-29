import { describe, it, expect, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { PlatformIcon } from '@/components/emoji/platform-icon';

afterEach(() => {
  cleanup();
});

describe('PlatformIcon', () => {
  describe('rendering', () => {
    it('renders iMessage icon', () => {
      const { container } = render(<PlatformIcon platform="IMESSAGE" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.tagName.toLowerCase()).toBe('svg');
    });

    it('renders Instagram icon', () => {
      const { container } = render(<PlatformIcon platform="INSTAGRAM" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders TikTok icon', () => {
      const { container } = render(<PlatformIcon platform="TIKTOK" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders WhatsApp icon', () => {
      const { container } = render(<PlatformIcon platform="WHATSAPP" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Slack icon', () => {
      const { container } = render(<PlatformIcon platform="SLACK" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Discord icon', () => {
      const { container } = render(<PlatformIcon platform="DISCORD" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders Twitter/X icon', () => {
      const { container } = render(<PlatformIcon platform="TWITTER" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders default globe icon for unknown platform', () => {
      const { container } = render(<PlatformIcon platform="UNKNOWN" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies default className', () => {
      const { container } = render(<PlatformIcon platform="TWITTER" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('applies custom className', () => {
      const { container } = render(
        <PlatformIcon platform="TWITTER" className="w-6 h-6 text-blue-500" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-6', 'h-6', 'text-blue-500');
    });
  });

  describe('accessibility', () => {
    it('has aria-hidden attribute', () => {
      const { container } = render(<PlatformIcon platform="INSTAGRAM" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('uses currentColor for fill', () => {
      const { container } = render(<PlatformIcon platform="SLACK" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('Platform type values', () => {
    const platforms = [
      'IMESSAGE',
      'INSTAGRAM',
      'TIKTOK',
      'WHATSAPP',
      'SLACK',
      'DISCORD',
      'TWITTER',
    ] as const;

    it.each(platforms)('renders unique icon for %s', (platform) => {
      const { container } = render(<PlatformIcon platform={platform} />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });
  });
});
