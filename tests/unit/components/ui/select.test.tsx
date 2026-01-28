import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';

afterEach(() => {
  cleanup();
});

describe('Select', () => {
  it('renders trigger button', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('opens dropdown when trigger is clicked', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
          <SelectItem value="opt2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  it('selects an item when clicked', async () => {
    const onValueChange = mock(() => {});
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Option 1'));
    expect(onValueChange).toHaveBeenCalledWith('option1');
  });

  it('displays selected value', async () => {
    render(
      <Select defaultValue="option1">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Option 1');
  });

  it('supports controlled value', () => {
    render(
      <Select value="option2">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Option 2');
  });

  it('disables select when disabled prop is true', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('SelectTrigger', () => {
  it('applies default styling', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('flex');
    expect(trigger).toHaveClass('h-10');
    expect(trigger).toHaveClass('w-full');
    expect(trigger).toHaveClass('rounded-md');
    expect(trigger).toHaveClass('border');
  });

  it('merges custom className', () => {
    render(
      <Select>
        <SelectTrigger className="custom-class" data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByTestId('trigger')).toHaveClass('custom-class');
  });
});

describe('SelectContent', () => {
  it('renders with proper styling when open', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent data-testid="content">
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    await waitFor(() => {
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('rounded-md');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('bg-white');
    });
  });
});

describe('SelectItem', () => {
  it('renders item text', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Test Item</SelectItem>
        </SelectContent>
      </Select>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('applies item styling', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" data-testid="item">
            Item
          </SelectItem>
        </SelectContent>
      </Select>
    );

    await waitFor(() => {
      const item = screen.getByTestId('item');
      expect(item).toHaveClass('relative');
      expect(item).toHaveClass('flex');
      expect(item).toHaveClass('cursor-default');
    });
  });

  it('disables item when disabled prop is true', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" disabled data-testid="item">
            Disabled Item
          </SelectItem>
        </SelectContent>
      </Select>
    );

    await waitFor(() => {
      const item = screen.getByTestId('item');
      expect(item).toHaveAttribute('data-disabled');
    });
  });
});

describe('SelectGroup and SelectLabel', () => {
  it('renders grouped items with label', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
    });
  });

  it('applies label styling', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel data-testid="label">Category</SelectLabel>
            <SelectItem value="item">Item</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    await waitFor(() => {
      const label = screen.getByTestId('label');
      expect(label).toHaveClass('py-1.5');
      expect(label).toHaveClass('font-semibold');
    });
  });
});

describe('SelectSeparator', () => {
  it('renders separator line', async () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
          <SelectSeparator data-testid="separator" />
          <SelectItem value="item2">Item 2</SelectItem>
        </SelectContent>
      </Select>
    );

    await waitFor(() => {
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('-mx-1');
      expect(separator).toHaveClass('my-1');
      expect(separator).toHaveClass('h-px');
      expect(separator).toHaveClass('bg-gray-200');
    });
  });
});
