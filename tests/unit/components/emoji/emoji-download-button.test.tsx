import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { EmojiDownloadButton } from '@/components/emoji/emoji-download-button';

// Mock canvas context
const mockFillText = mock(() => {});
const mockClearRect = mock(() => {});
const mockGetContext = mock(() => ({
  clearRect: mockClearRect,
  fillText: mockFillText,
  textAlign: '',
  textBaseline: '',
  font: '',
}));

// Mock canvas toBlob
const mockToBlob = mock((callback: (blob: Blob | null) => void) => {
  callback(new Blob(['fake-png'], { type: 'image/png' }));
});

// Mock createElement to intercept canvas and anchor creation
const originalCreateElement = document.createElement.bind(document);
const mockClick = mock(() => {});

beforeEach(() => {
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
  mockFillText.mockClear();
  mockClearRect.mockClear();
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

    it('tracks download analytics when slug is provided', async () => {
      const mockEmojiDownload = mock(() => {});
      const analyticsModule = await import('@/lib/analytics');
      const originalDownload = analyticsModule.emojiEvents.download;
      analyticsModule.emojiEvents.download = mockEmojiDownload;

      render(<EmojiDownloadButton character="😀" name="Grinning Face" slug="grinning-face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockEmojiDownload).toHaveBeenCalledWith('😀', 'grinning-face');
      });

      analyticsModule.emojiEvents.download = originalDownload;
    });

    it('does not track analytics when slug is not provided', async () => {
      const mockEmojiDownload = mock(() => {});
      const analyticsModule = await import('@/lib/analytics');
      const originalDownload = analyticsModule.emojiEvents.download;
      analyticsModule.emojiEvents.download = mockEmojiDownload;

      render(<EmojiDownloadButton character="😀" name="Grinning Face" />);
      const button = screen.getByRole('button', { name: /download emoji as image/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });

      expect(mockEmojiDownload).not.toHaveBeenCalled();

      analyticsModule.emojiEvents.download = originalDownload;
    });
  });
});
