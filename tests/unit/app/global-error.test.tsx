import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, cleanup, fireEvent } from '@testing-library/react';

// Mock Sentry
const mockCaptureException = mock(() => 'mock-event-id');

mock.module('@sentry/nextjs', () => ({
  captureException: mockCaptureException,
}));

describe('GlobalError component', () => {
  beforeEach(() => {
    mockCaptureException.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render error message', async () => {
    const GlobalError = (await import('../../../src/app/global-error')).default;
    const error = new Error('Test error') as Error & { digest?: string };
    const reset = mock(() => {});

    const { getByText } = render(<GlobalError error={error} reset={reset} />);

    expect(getByText('Something went wrong!')).not.toBeNull();
    expect(
      getByText('We apologize for the inconvenience. Our team has been notified.')
    ).not.toBeNull();
  });

  it('should call Sentry.captureException on mount', async () => {
    const GlobalError = (await import('../../../src/app/global-error')).default;
    const error = new Error('Test error') as Error & { digest?: string };
    const reset = mock(() => {});

    render(<GlobalError error={error} reset={reset} />);

    // Wait for useEffect to run
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it('should call reset when Try again button is clicked', async () => {
    const GlobalError = (await import('../../../src/app/global-error')).default;
    const error = new Error('Test error') as Error & { digest?: string };
    const reset = mock(() => {});

    const { getByText } = render(<GlobalError error={error} reset={reset} />);

    const button = getByText('Try again');
    fireEvent.click(button);

    expect(reset).toHaveBeenCalled();
  });

  it('should render in the document', async () => {
    const GlobalError = (await import('../../../src/app/global-error')).default;
    const error = new Error('Test error') as Error & { digest?: string };
    const reset = mock(() => {});

    const { container } = render(<GlobalError error={error} reset={reset} />);

    // The component renders and has content
    expect(container.textContent).toContain('Something went wrong!');
  });
});
