import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { EmojiDownloadButton } from '@/components/emoji/emoji-download-button';

// Mock canvas context
const mockFillText = mock(() => {});
const mockClearRect = mock(() => {});
const mockDrawImage = mock(() => {});
const mockGetContext = mock(() => ({
  clearRect: mockClearRect,
  fillText: mockFillText,
  drawImage: mockDrawImage,
  textAlign: '',
  textBaseline: '',
  font: '',
  globalAlpha: 1,
}));

// Mock canvas toBlob
const mockToBlob = mock((callback: (blob: Blob | null) => void) => {
  callback(new Blob(['fake-png'], { type: 'image/png' }));
});

// Mock createElement to intercept canvas and anchor creation
const originalCreateElement = document.createElement.bind(document);
const mockClick = mock(() => {});

// Store original Image constructor
const OriginalImage = globalThis.Image;

// Control whether the logo loads or fails
let logoShouldLoad = true;

beforeEach(() => {
  logoShouldLoad = true;

  // Mock Image constructor for logo loading
  globalThis.Image = class MockImage {
    crossOrigin = '';
    src = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    width = 48;
    height = 48;

    constructor() {
      // Trigger onload/onerror asynchronously after src is set
      const originalSrcDescriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this),
        'src'
      );
      let _src = '';
      Object.defineProperty(this, 'src', {
        get: () => _src,
        set: (value: string) => {
          _src = value;
          // Ignore if not a real property set (avoids recursion from descriptor lookup)
          if (originalSrcDescriptor) return;
          setTimeout(() => {
            if (logoShouldLoad && this.onload) this.onload();
            else if (!logoShouldLoad && this.onerror) this.onerror();
          }, 0);
        },
      });
    }
  } as unknown as typeof Image;

  document.createElement = mock((tag: string) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: mockGetContext,
        toBlob: mockToBlob,
      } as unknown as HTMLCanvasElement;
    }
    if (tag === 'a') {
      const anchor = originalCreateElement('a');
      anchor.click = mockClick;
      return anchor;
    }
    return originalCreateElement(tag);
  }) as typeof document.createElement;

  // Mock URL methods
  globalThis.URL.createObjectURL = mock(() => 'blob:mock-url');
  globalThis.URL.revokeObjectURL = mock(() => {});
});

afterEach(() => {
  cleanup();
  document.createElement = originalCreateElement;
  globalThis.Image = OriginalImage;
  mockFillText.mockClear();
  mockClearRect.mockClear();
  mockDrawImage.mockClear();
  mockGetContext.mockClear();
  mockToBlob.mockClear();
  mockClick.mockClear();
});

describe('EmojiDownloadButton', () => {
  describe('rendering', () => {
    it('renders the download button', () => {
      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      expect(screen.getByRole('button', { name: /download emoji as image/i })).toBeInTheDocument();
    });

    it('displays "Download Image" text', () => {
      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      expect(screen.getByText('Download Image')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<EmojiDownloadButton character="😀" name="Grinning Face" className="custom-class" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('download functionality', () => {
    it('creates a canvas, draws the emoji, and triggers download', async () => {
      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGetContext).toHaveBeenCalledWith('2d');
        expect(mockFillText).toHaveBeenCalledWith('😀', 256, 256);
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it('generates filename from emoji name', async () => {
      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it('revokes object URL after download', async () => {
      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      });
    });
  });

  describe('logo watermark', () => {
    it('continues download when logo fails to load', async () => {
      logoShouldLoad = false;

      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        // Download should still succeed without logo
        expect(mockClick).toHaveBeenCalled();
        expect(mockFillText).toHaveBeenCalledWith('😀', 256, 256);
      });
    });
  });

  describe('edge cases', () => {
    it('handles canvas context returning null', async () => {
      const nullCtxGetContext = mock(() => null);
      document.createElement = mock((tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: nullCtxGetContext,
            toBlob: mockToBlob,
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      }) as typeof document.createElement;

      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(nullCtxGetContext).toHaveBeenCalled();
        // Should not throw - gracefully handles null context
        expect(mockFillText).not.toHaveBeenCalled();
      });
    });

    it('handles toBlob returning null', async () => {
      const nullBlobToBlob = mock((callback: (blob: Blob | null) => void) => {
        callback(null);
      });
      document.createElement = mock((tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: mockGetContext,
            toBlob: nullBlobToBlob,
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      }) as typeof document.createElement;

      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        // Should not trigger download link click
        expect(mockClick).not.toHaveBeenCalled();
      });
    });

    it('handles multi-word emoji names in filename', async () => {
      render(<EmojiDownloadButton character="👨‍💻" name="Man Technologist" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });
    });
  });
});
