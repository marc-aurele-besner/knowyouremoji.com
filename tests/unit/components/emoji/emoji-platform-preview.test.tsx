import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, within } from '@testing-library/react';
import {
  EmojiPlatformPreview,
  type PlatformEmoji,
  type EmojiPlatformPreviewProps,
} from '@/components/emoji/emoji-platform-preview';

afterEach(() => {
  cleanup();
});

const mockPlatformEmojis: PlatformEmoji[] = [
  {
    platform: 'apple',
    imageUrl: '/emojis/apple/skull.png',
    version: '14.0',
  },
  {
    platform: 'google',
    imageUrl: '/emojis/google/skull.png',
    version: 'Android 12',
  },
  {
    platform: 'twitter',
    imageUrl: '/emojis/twitter/skull.svg',
  },
  {
    platform: 'samsung',
    imageUrl: '/emojis/samsung/skull.png',
    version: 'One UI 4.0',
  },
  {
    platform: 'microsoft',
    imageUrl: '/emojis/microsoft/skull.png',
    version: 'Windows 11',
  },
];

const defaultProps: EmojiPlatformPreviewProps = {
  character: '💀',
  platformEmojis: mockPlatformEmojis,
  unicodeVersion: '6.0',
};

describe('EmojiPlatformPreview', () => {
  describe('rendering', () => {
    it('renders the section with correct heading', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('How 💀 looks across platforms');
    });

    it('renders unicode version information', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      expect(screen.getByText(/Unicode 6.0/)).toBeInTheDocument();
    });

    it('renders native device preview section', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      expect(screen.getByText('On your device:')).toBeInTheDocument();
    });

    it('displays the emoji character in native preview', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const nativePreview = screen.getByTestId('native-preview');
      expect(nativePreview).toHaveTextContent('💀');
    });

    it('renders all platform cards', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('Samsung')).toBeInTheDocument();
      expect(screen.getByText('Microsoft')).toBeInTheDocument();
    });

    it('renders platform images with correct alt text', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      expect(screen.getByAltText('💀 on Apple')).toBeInTheDocument();
      expect(screen.getByAltText('💀 on Google')).toBeInTheDocument();
      expect(screen.getByAltText('💀 on Twitter/X')).toBeInTheDocument();
      expect(screen.getByAltText('💀 on Samsung')).toBeInTheDocument();
      expect(screen.getByAltText('💀 on Microsoft')).toBeInTheDocument();
    });

    it('renders version information when available', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      expect(screen.getByText('14.0')).toBeInTheDocument();
      expect(screen.getByText('Android 12')).toBeInTheDocument();
      expect(screen.getByText('One UI 4.0')).toBeInTheDocument();
      expect(screen.getByText('Windows 11')).toBeInTheDocument();
    });

    it('handles platforms without version info', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      // Twitter has no version in our mock data
      const twitterCard = screen.getByText('Twitter/X').closest('div');
      expect(twitterCard).toBeInTheDocument();
      // Verify there's no version text within twitter card
      expect(within(twitterCard!).queryByText(/\d+\.\d+/)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper section with aria-labelledby', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'platforms-heading');
    });

    it('heading has correct id for aria-labelledby', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'platforms-heading');
    });

    it('all platform images have accessible alt text', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      // Get only img elements (excludes span with role="img")
      const images = screen.getByTestId('platform-grid').querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
      // Check each image has non-empty alt text
      for (const img of images) {
        const altText = img.getAttribute('alt');
        expect(altText).not.toBeNull();
        expect(altText).not.toBe('');
      }
    });

    it('native preview has proper accessibility attributes', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const nativePreview = screen.getByTestId('native-preview');
      expect(nativePreview).toHaveAttribute('role', 'img');
      expect(nativePreview).toHaveAttribute('aria-label', '💀 on your device');
    });
  });

  describe('responsive grid layout', () => {
    it('renders grid container with responsive classes', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const gridContainer = screen.getByTestId('platform-grid');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('grid-cols-3');
      expect(gridContainer).toHaveClass('sm:grid-cols-4');
      expect(gridContainer).toHaveClass('md:grid-cols-5');
    });

    it('platform cards are rendered within grid', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const gridContainer = screen.getByTestId('platform-grid');
      expect(gridContainer.children.length).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('handles empty platformEmojis array', () => {
      render(<EmojiPlatformPreview {...defaultProps} platformEmojis={[]} />);
      // Should still render section and native preview
      expect(screen.getByText('On your device:')).toBeInTheDocument();
      expect(screen.getByText(/No platform-specific images available/)).toBeInTheDocument();
    });

    it('handles single platform emoji', () => {
      const singlePlatform: PlatformEmoji[] = [
        {
          platform: 'apple',
          imageUrl: '/emojis/apple/skull.png',
        },
      ];
      render(<EmojiPlatformPreview {...defaultProps} platformEmojis={singlePlatform} />);
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Google')).not.toBeInTheDocument();
    });

    it('handles different emoji characters', () => {
      render(<EmojiPlatformPreview {...defaultProps} character="😀" />);
      expect(screen.getByText('How 😀 looks across platforms')).toBeInTheDocument();
    });

    it('handles complex emoji characters (ZWJ sequences)', () => {
      render(<EmojiPlatformPreview {...defaultProps} character="👩‍💻" />);
      expect(screen.getByText('How 👩‍💻 looks across platforms')).toBeInTheDocument();
    });

    it('handles different unicode versions', () => {
      render(<EmojiPlatformPreview {...defaultProps} unicodeVersion="15.0" />);
      expect(screen.getByText(/Unicode 15.0/)).toBeInTheDocument();
    });

    it('handles facebook platform', () => {
      const facebookPlatform: PlatformEmoji[] = [
        {
          platform: 'facebook',
          imageUrl: '/emojis/facebook/skull.png',
        },
      ];
      render(<EmojiPlatformPreview {...defaultProps} platformEmojis={facebookPlatform} />);
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });
  });

  describe('image loading', () => {
    it('renders images with lazy loading attribute', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      // Get only img elements (excludes span with role="img")
      const images = screen.getByTestId('platform-grid').querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
      for (const img of images) {
        expect(img.getAttribute('loading')).toBe('lazy');
      }
    });

    it('renders images with correct dimensions', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      // Get only img elements (excludes span with role="img")
      const images = screen.getByTestId('platform-grid').querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
      for (const img of images) {
        expect(img.getAttribute('width')).toBe('48');
        expect(img.getAttribute('height')).toBe('48');
      }
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmojiPlatformPreview {...defaultProps} className="custom-class" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has default spacing classes', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });

    it('native preview has highlighted styling', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const nativeContainer = screen.getByTestId('native-preview').parentElement;
      expect(nativeContainer).toHaveClass('bg-muted/50');
      expect(nativeContainer).toHaveClass('rounded-lg');
    });

    it('platform cards have border styling', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);
      const appleCard = screen.getByText('Apple').closest('div');
      expect(appleCard).toHaveClass('border');
      expect(appleCard).toHaveClass('rounded-lg');
    });
  });

  describe('platform labels', () => {
    it('displays correct label for each platform', () => {
      const allPlatforms: PlatformEmoji[] = [
        { platform: 'apple', imageUrl: '/apple.png' },
        { platform: 'google', imageUrl: '/google.png' },
        { platform: 'twitter', imageUrl: '/twitter.png' },
        { platform: 'samsung', imageUrl: '/samsung.png' },
        { platform: 'microsoft', imageUrl: '/microsoft.png' },
        { platform: 'facebook', imageUrl: '/facebook.png' },
      ];
      render(<EmojiPlatformPreview {...defaultProps} platformEmojis={allPlatforms} />);

      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('Samsung')).toBeInTheDocument();
      expect(screen.getByText('Microsoft')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('renders section > heading > description > native preview > grid', () => {
      render(<EmojiPlatformPreview {...defaultProps} />);

      const section = screen.getByRole('region');
      const heading = within(section).getByRole('heading', { level: 2 });
      const nativePreview = within(section).getByTestId('native-preview');
      const platformGrid = within(section).getByTestId('platform-grid');

      expect(section).toContainElement(heading);
      expect(section).toContainElement(nativePreview);
      expect(section).toContainElement(platformGrid);
    });
  });
});
