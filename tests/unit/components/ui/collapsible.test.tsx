import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

afterEach(() => {
  cleanup();
});

describe('Collapsible', () => {
  it('renders trigger button', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('hides content by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden Content</CollapsibleContent>
      </Collapsible>
    );
    // When closed, Radix keeps the content in DOM but hidden
    const content = screen.queryByText('Hidden Content');
    if (content) {
      expect(content).not.toBeVisible();
    } else {
      // Content is not rendered when closed, which is expected
      expect(content).toBeNull();
    }
  });

  it('shows content when open is true', async () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible Content</CollapsibleContent>
      </Collapsible>
    );

    await waitFor(() => {
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });
  });

  it('toggles content visibility when trigger is clicked', async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Toggleable Content</CollapsibleContent>
      </Collapsible>
    );

    // Initially not visible (may not be in DOM)
    expect(screen.queryByText('Toggleable Content')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(screen.getByText('Toggle'));
    await waitFor(() => {
      expect(screen.getByText('Toggleable Content')).toBeInTheDocument();
    });

    // Click to close
    fireEvent.click(screen.getByText('Toggle'));
    await waitFor(() => {
      expect(screen.queryByText('Toggleable Content')).not.toBeInTheDocument();
    });
  });

  it('calls onOpenChange when toggled', async () => {
    const onOpenChange = mock(() => {});
    render(
      <Collapsible onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    fireEvent.click(screen.getByText('Toggle'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('supports controlled open state', async () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Controlled Content</CollapsibleContent>
      </Collapsible>
    );

    await waitFor(() => {
      expect(screen.getByText('Controlled Content')).toBeInTheDocument();
    });
  });

  it('supports defaultOpen prop', async () => {
    render(
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Default Open Content</CollapsibleContent>
      </Collapsible>
    );

    await waitFor(() => {
      expect(screen.getByText('Default Open Content')).toBeInTheDocument();
    });
  });

  it('supports disabled state', () => {
    render(
      <Collapsible disabled>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );

    const trigger = screen.getByText('Toggle');
    expect(trigger).toHaveAttribute('data-disabled');
  });
});

describe('CollapsibleTrigger', () => {
  it('renders as button by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Trigger</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('passes through custom className', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger className="custom-trigger" data-testid="trigger">
          Trigger
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByTestId('trigger')).toHaveClass('custom-trigger');
  });

  it('supports asChild prop', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <span data-testid="custom-trigger">Custom Trigger</span>
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByTestId('custom-trigger').tagName).toBe('SPAN');
  });
});

describe('CollapsibleContent', () => {
  it('applies overflow hidden class', async () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent data-testid="content">Content</CollapsibleContent>
      </Collapsible>
    );

    await waitFor(() => {
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('overflow-hidden');
    });
  });

  it('merges custom className', async () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent className="custom-content" data-testid="content">
          Content
        </CollapsibleContent>
      </Collapsible>
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toHaveClass('custom-content');
    });
  });

  it('renders children correctly', async () => {
    render(
      <Collapsible open={true}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>
          <div data-testid="child">Child Content</div>
        </CollapsibleContent>
      </Collapsible>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });
});
