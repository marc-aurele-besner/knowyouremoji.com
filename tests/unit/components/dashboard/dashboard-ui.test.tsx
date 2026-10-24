import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import {
  DashboardPageHeader,
  EmptyState,
  KpiTile,
  SectionCard,
  SkeletonRows,
  formErrorClass,
  formOkClass,
} from '@/components/dashboard/dashboard-ui';

afterEach(() => {
  cleanup();
});

describe('DashboardPageHeader', () => {
  it('renders title, description and actions', () => {
    render(
      <DashboardPageHeader title="History" description="Past reads" actions={<button>Go</button>} />
    );
    expect(screen.getByRole('heading', { level: 1, name: 'History' })).toBeInTheDocument();
    expect(screen.getByText('Past reads')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('renders the title alone', () => {
    const { container } = render(<DashboardPageHeader title="Only title" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});

describe('EmptyState', () => {
  it('renders a dashed box with emoji, title, description and action', () => {
    const { container } = render(
      <EmptyState
        emoji="🗂️"
        title="Nothing"
        description="Come back later"
        action={<a href="/x">Act</a>}
      />
    );
    expect(container.firstChild).toHaveClass('border-dashed');
    expect(screen.getByRole('heading', { name: 'Nothing' })).toBeInTheDocument();
    expect(screen.getByText('Come back later')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Act' })).toBeInTheDocument();
  });

  it('omits the action row when no action is given', () => {
    render(<EmptyState emoji="🔒" title="Locked" description="Sign in" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('KpiTile', () => {
  it('renders label, value and children', () => {
    render(
      <KpiTile label="Used" value={3} valueTestId="kpi-value">
        <p>today</p>
      </KpiTile>
    );
    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('3');
    expect(screen.getByText('today')).toBeInTheDocument();
  });
});

describe('SectionCard', () => {
  it('uses the neutral border by default', () => {
    render(<SectionCard title="Account">body</SectionCard>);
    const heading = screen.getByRole('heading', { name: 'Account' });
    expect(heading).toHaveClass('text-foreground');
    expect(heading.parentElement).toHaveClass('border-card-border');
  });

  it('uses a red-tinted border and heading for the danger tone', () => {
    render(
      <SectionCard title="Danger Zone" tone="danger">
        body
      </SectionCard>
    );
    const heading = screen.getByRole('heading', { name: 'Danger Zone' });
    expect(heading).toHaveClass('text-danger');
    expect(heading.parentElement).toHaveClass('border-danger/40');
  });
});

describe('SkeletonRows', () => {
  it('renders the requested number of pulsing rows', () => {
    render(<SkeletonRows count={4} testId="sk" />);
    expect(screen.getByTestId('sk').querySelectorAll('.animate-pulse')).toHaveLength(4);
  });
});

describe('banner classes', () => {
  it('use the danger and success tokens', () => {
    expect(formErrorClass).toContain('bg-danger-background');
    expect(formOkClass).toContain('bg-success-background');
  });
});
