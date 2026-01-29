import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

afterEach(() => {
  cleanup();
});

describe('Tooltip', () => {
  describe('rendering', () => {
    it('renders trigger content', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('tooltip content is hidden by default', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('shows tooltip on hover', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      await user.hover(screen.getByText('Hover me'));
      await waitFor(() => {
        // Radix UI creates both visible content and ARIA hidden span
        expect(screen.getAllByText('Tooltip content').length).toBeGreaterThan(0);
      });
    });

    it('tooltip content is initially not present', async () => {
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="hide-test-tooltip">Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      // Tooltip should not be visible initially
      expect(screen.queryByTestId('hide-test-tooltip')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies base styling classes to content', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content">Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      await user.hover(screen.getByText('Hover me'));
      await waitFor(() => {
        const content = screen.getByTestId('tooltip-content');
        expect(content).toHaveClass('z-50');
        expect(content).toHaveClass('rounded-md');
        expect(content).toHaveClass('bg-gray-900');
      });
    });

    it('merges custom className', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent data-testid="tooltip-content" className="custom-class">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      await user.hover(screen.getByText('Hover me'));
      await waitFor(() => {
        expect(screen.getByTestId('tooltip-content')).toHaveClass('custom-class');
      });
    });
  });

  describe('positioning', () => {
    it('accepts side prop', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent side="bottom" data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      await user.hover(screen.getByText('Hover me'));
      await waitFor(() => {
        expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      });
    });

    it('accepts sideOffset prop', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent sideOffset={10} data-testid="tooltip-content">
              Tooltip content
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      await user.hover(screen.getByText('Hover me'));
      await waitFor(() => {
        expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('trigger is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Hover me</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const button = screen.getByRole('button');
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('asChild', () => {
    it('trigger works with asChild prop', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button data-testid="custom-trigger">Custom button</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('custom-trigger').tagName).toBe('BUTTON');
    });
  });
});
