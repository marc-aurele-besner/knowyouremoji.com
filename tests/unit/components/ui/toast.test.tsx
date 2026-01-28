import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from '@/components/ui/toast';

afterEach(() => {
  cleanup();
});

describe('Toast', () => {
  it('renders toast with title', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Toast Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toast Title')).toBeInTheDocument();
    });
  });

  it('renders toast with description', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription>This is a description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });
  });

  it('renders toast with action button', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Title</ToastTitle>
          <ToastAction altText="Undo action">Undo</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });
  });

  it('renders toast with close button', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Title</ToastTitle>
          <ToastClose data-testid="close-btn" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('close-btn')).toBeInTheDocument();
    });
  });

  it('applies default toast styling', async () => {
    render(
      <ToastProvider>
        <Toast open={true} data-testid="toast">
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      const toast = screen.getByTestId('toast');
      expect(toast).toHaveClass('rounded-md');
      expect(toast).toHaveClass('border');
      expect(toast).toHaveClass('p-6');
    });
  });

  describe('variants', () => {
    it('applies default variant styling', async () => {
      render(
        <ToastProvider>
          <Toast open={true} data-testid="toast">
            <ToastTitle>Default</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      );

      await waitFor(() => {
        const toast = screen.getByTestId('toast');
        expect(toast).toHaveClass('bg-white');
      });
    });

    it('applies destructive variant styling', async () => {
      render(
        <ToastProvider>
          <Toast open={true} variant="destructive" data-testid="toast">
            <ToastTitle>Error</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      );

      await waitFor(() => {
        const toast = screen.getByTestId('toast');
        expect(toast).toHaveClass('bg-red-600');
        expect(toast).toHaveClass('text-white');
      });
    });

    it('applies success variant styling', async () => {
      render(
        <ToastProvider>
          <Toast open={true} variant="success" data-testid="toast">
            <ToastTitle>Success</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      );

      await waitFor(() => {
        const toast = screen.getByTestId('toast');
        expect(toast).toHaveClass('bg-green-600');
        expect(toast).toHaveClass('text-white');
      });
    });
  });
});

describe('ToastTitle', () => {
  it('applies title styling', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle data-testid="title">Title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-sm');
      expect(title).toHaveClass('font-semibold');
    });
  });
});

describe('ToastDescription', () => {
  it('applies description styling', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription data-testid="desc">Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      const desc = screen.getByTestId('desc');
      expect(desc).toHaveClass('text-sm');
      expect(desc).toHaveClass('opacity-90');
    });
  });
});

describe('ToastAction', () => {
  it('applies action button styling', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Title</ToastTitle>
          <ToastAction altText="Action" data-testid="action">
            Action
          </ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      const action = screen.getByTestId('action');
      expect(action).toHaveClass('inline-flex');
      expect(action).toHaveClass('rounded-md');
    });
  });
});

describe('ToastViewport', () => {
  it('applies viewport styling', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Title</ToastTitle>
        </Toast>
        <ToastViewport data-testid="viewport" />
      </ToastProvider>
    );

    await waitFor(() => {
      const viewport = screen.getByTestId('viewport');
      expect(viewport).toHaveClass('fixed');
      expect(viewport).toHaveClass('bottom-0');
      expect(viewport).toHaveClass('right-0');
      expect(viewport).toHaveClass('z-50');
    });
  });
});

describe('ToastClose', () => {
  it('applies close button styling', async () => {
    render(
      <ToastProvider>
        <Toast open={true}>
          <ToastTitle>Title</ToastTitle>
          <ToastClose data-testid="close" />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );

    await waitFor(() => {
      const close = screen.getByTestId('close');
      expect(close).toHaveClass('absolute');
      expect(close).toHaveClass('right-2');
      expect(close).toHaveClass('top-2');
    });
  });
});
