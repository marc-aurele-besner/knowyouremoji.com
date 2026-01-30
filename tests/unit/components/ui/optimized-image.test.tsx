import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { OptimizedImage, type OptimizedImageProps } from '@/components/ui/optimized-image';

afterEach(() => {
  cleanup();
});

const defaultProps: OptimizedImageProps = {
  src: '/test-image.png',
  alt: 'Test image',
  width: 100,
  height: 100,
};

describe('OptimizedImage', () => {
  describe('rendering', () => {
    it('renders an image with correct alt text', () => {
      render(<OptimizedImage {...defaultProps} />);
      const img = screen.getByRole('img', { name: 'Test image' });
      expect(img).toBeInTheDocument();
    });

    it('renders with correct dimensions', () => {
      render(<OptimizedImage {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('width', '100');
      expect(img).toHaveAttribute('height', '100');
    });

    it('applies custom className', () => {
      render(<OptimizedImage {...defaultProps} className="custom-class" />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('custom-class');
    });
  });

  describe('loading behavior', () => {
    it('defaults to lazy loading', () => {
      render(<OptimizedImage {...defaultProps} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('supports eager loading when priority is true', () => {
      render(<OptimizedImage {...defaultProps} priority />);
      const img = screen.getByRole('img');
      // When priority is true, loading should be eager
      expect(img).toHaveAttribute('loading', 'eager');
    });
  });

  describe('external URLs', () => {
    it('handles external URLs', () => {
      render(<OptimizedImage {...defaultProps} src="https://example.com/image.png" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('handles http URLs', () => {
      render(<OptimizedImage {...defaultProps} src="http://cdn.example.com/image.png" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('fill mode', () => {
    it('supports fill mode without explicit dimensions', () => {
      render(<OptimizedImage src="/test-image.png" alt="Fill image" fill />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('applies object-fit style with fill', () => {
      render(<OptimizedImage src="/test-image.png" alt="Fill image" fill objectFit="cover" />);
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ objectFit: 'cover' });
    });

    it('applies object-position style with fill', () => {
      render(
        <OptimizedImage src="/test-image.png" alt="Fill image" fill objectPosition="top center" />
      );
      const img = screen.getByRole('img');
      expect(img).toHaveStyle({ objectPosition: 'top center' });
    });
  });

  describe('placeholder', () => {
    it('supports blur placeholder', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          placeholder="blur"
          blurDataURL="data:image/png;base64,abc123"
        />
      );
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('supports empty placeholder', () => {
      render(<OptimizedImage {...defaultProps} placeholder="empty" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('quality', () => {
    it('accepts custom quality value', () => {
      render(<OptimizedImage {...defaultProps} quality={90} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('accepts custom sizes for responsive images', () => {
      render(<OptimizedImage {...defaultProps} sizes="(max-width: 768px) 100vw, 50vw" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
    });
  });

  describe('accessibility', () => {
    it('requires alt text', () => {
      render(<OptimizedImage {...defaultProps} alt="Descriptive alt text" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('supports decorative images with empty alt', () => {
      render(<OptimizedImage {...defaultProps} alt="" />);
      // Empty alt makes image presentational, so we query by presentation role
      const img = screen.getByRole('presentation');
      expect(img).toHaveAttribute('alt', '');
    });
  });

  describe('onLoad and onError callbacks', () => {
    it('accepts onLoad callback', () => {
      const onLoadMock = () => {};
      render(<OptimizedImage {...defaultProps} onLoad={onLoadMock} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });

    it('accepts onError callback', () => {
      const onErrorMock = () => {};
      render(<OptimizedImage {...defaultProps} onError={onErrorMock} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
    });
  });
});
