import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

afterEach(() => {
  cleanup();
});

describe('Dialog', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
  });

  it('closes dialog when close button is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  it('supports controlled open state', async () => {
    const onOpenChange = mock(() => {});
    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
  });

  it('renders dialog with all subcomponents', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Full Dialog</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogHeader>
          <div>Content goes here</div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open'));
    await waitFor(() => {
      expect(screen.getByText('Full Dialog')).toBeInTheDocument();
      expect(screen.getByText('This is a description')).toBeInTheDocument();
      expect(screen.getByText('Content goes here')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });
});

describe('DialogContent', () => {
  it('applies default styling', async () => {
    render(
      <Dialog open={true}>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('bg-white');
      expect(content).toHaveClass('rounded-lg');
    });
  });

  it('merges custom className', async () => {
    render(
      <Dialog open={true}>
        <DialogContent className="custom-class" data-testid="dialog-content">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dialog-content')).toHaveClass('custom-class');
    });
  });
});

describe('DialogHeader', () => {
  it('renders children', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Header Content</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });
  });

  it('applies header styling', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
    });
  });
});

describe('DialogTitle', () => {
  it('renders title text', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>My Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });
  });

  it('applies title styling', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle data-testid="title">Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
    });
  });
});

describe('DialogDescription', () => {
  it('renders description text', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description text here</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      expect(screen.getByText('Description text here')).toBeInTheDocument();
    });
  });

  it('applies description styling', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription data-testid="desc">Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      const desc = screen.getByTestId('desc');
      expect(desc).toHaveClass('text-sm');
      expect(desc).toHaveClass('text-gray-500');
    });
  });
});

describe('DialogFooter', () => {
  it('renders footer content', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter data-testid="footer">Footer content</DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  it('applies footer styling', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter data-testid="footer">Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await waitFor(() => {
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('sm:justify-end');
    });
  });
});
