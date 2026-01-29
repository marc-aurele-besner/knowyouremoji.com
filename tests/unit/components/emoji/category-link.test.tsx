import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { CategoryLink } from '@/components/emoji/category-link';

afterEach(() => {
  cleanup();
});

describe('CategoryLink', () => {
  describe('rendering', () => {
    it('renders the category name', () => {
      render(<CategoryLink category="faces" />);
      expect(screen.getByText('Smileys & Faces')).toBeInTheDocument();
    });

    it('renders as a link element', () => {
      render(<CategoryLink category="faces" />);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('links to the correct category page', () => {
      render(<CategoryLink category="faces" />);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/faces');
    });

    it('renders category icon', () => {
      render(<CategoryLink category="faces" />);
      expect(screen.getByTestId('category-icon')).toBeInTheDocument();
    });
  });

  describe('different categories', () => {
    it('renders faces category correctly', () => {
      render(<CategoryLink category="faces" />);
      expect(screen.getByText('Smileys & Faces')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/faces');
    });

    it('renders people category correctly', () => {
      render(<CategoryLink category="people" />);
      expect(screen.getByText('People & Body')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/people');
    });

    it('renders animals category correctly', () => {
      render(<CategoryLink category="animals" />);
      expect(screen.getByText('Animals & Nature')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/animals');
    });

    it('renders food category correctly', () => {
      render(<CategoryLink category="food" />);
      expect(screen.getByText('Food & Drink')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/food');
    });

    it('renders travel category correctly', () => {
      render(<CategoryLink category="travel" />);
      expect(screen.getByText('Travel & Places')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/travel');
    });

    it('renders activities category correctly', () => {
      render(<CategoryLink category="activities" />);
      expect(screen.getByText('Activities')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/activities');
    });

    it('renders objects category correctly', () => {
      render(<CategoryLink category="objects" />);
      expect(screen.getByText('Objects')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/objects');
    });

    it('renders symbols category correctly', () => {
      render(<CategoryLink category="symbols" />);
      expect(screen.getByText('Symbols')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/symbols');
    });

    it('renders flags category correctly', () => {
      render(<CategoryLink category="flags" />);
      expect(screen.getByText('Flags')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/flags');
    });

    it('handles unknown category gracefully', () => {
      render(<CategoryLink category="unknown" />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/emoji/category/unknown');
    });
  });

  describe('accessibility', () => {
    it('has accessible link text', () => {
      render(<CategoryLink category="faces" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName(/smileys & faces/i);
    });

    it('link is keyboard accessible', () => {
      render(<CategoryLink category="faces" />);
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<CategoryLink category="faces" className="custom-class" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('has hover styles', () => {
      render(<CategoryLink category="faces" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover:underline');
    });

    it('has proper text styling', () => {
      render(<CategoryLink category="faces" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-primary');
    });
  });

  describe('showIcon prop', () => {
    it('shows icon by default', () => {
      render(<CategoryLink category="faces" />);
      expect(screen.getByTestId('category-icon')).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(<CategoryLink category="faces" showIcon={false} />);
      expect(screen.queryByTestId('category-icon')).not.toBeInTheDocument();
    });

    it('shows icon when showIcon is true', () => {
      render(<CategoryLink category="faces" showIcon={true} />);
      expect(screen.getByTestId('category-icon')).toBeInTheDocument();
    });
  });

  describe('dark mode', () => {
    it('has dark mode text color', () => {
      render(<CategoryLink category="faces" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('dark:text-primary');
    });
  });
});
