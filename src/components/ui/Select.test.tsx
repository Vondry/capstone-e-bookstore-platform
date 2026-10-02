import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="Country" options={mockOptions} />);

    const select = screen.getByLabelText(/country/i);
    expect(select).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select label="Country" options={mockOptions} />);

    const option1 = screen.getByRole('option', { name: /option 1/i });
    const option2 = screen.getByRole('option', { name: /option 2/i });
    const option3 = screen.getByRole('option', { name: /option 3/i });

    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
    expect(option3).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Select label="Country" options={mockOptions} error="Country is required" />);

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Country is required');
  });

  it('links error to select via aria-describedby', () => {
    render(<Select label="Country" options={mockOptions} error="Country is required" />);

    const select = screen.getByLabelText(/country/i);
    const error = screen.getByRole('alert');

    expect(select).toHaveAttribute('aria-describedby', error.id);
  });

  it('sets aria-invalid when error is present', () => {
    render(<Select label="Country" options={mockOptions} error="Country is required" />);

    const select = screen.getByLabelText(/country/i);
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(<Select label="Country" options={mockOptions} />);

    const select = screen.getByLabelText(/country/i);
    expect(select).toHaveAttribute('aria-invalid', 'false');
  });

  it('handles selection change', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Select label="Country" options={mockOptions} onChange={handleChange} />);

    const select = screen.getByLabelText(/country/i);
    await user.selectOptions(select, 'option2');

    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue('option2');
  });

  it('renders disabled state', () => {
    render(<Select label="Country" options={mockOptions} disabled />);

    const select = screen.getByLabelText(/country/i);
    expect(select).toBeDisabled();
  });

  it('does not allow selection when disabled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Select label="Country" options={mockOptions} disabled onChange={handleChange} />);

    const select = screen.getByLabelText(/country/i);
    await user.selectOptions(select, 'option2');

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<Select label="Country" options={mockOptions} />);

    const select = screen.getByLabelText(/country/i);

    await user.tab();
    expect(select).toHaveFocus();
  });

  it('accepts custom className', () => {
    render(<Select label="Country" options={mockOptions} className="custom-class" />);

    const select = screen.getByLabelText(/country/i);
    expect(select).toHaveClass('custom-class');
  });

  it('forwards additional props', () => {
    render(<Select label="Country" options={mockOptions} data-testid="country-select" required />);

    const select = screen.getByTestId('country-select');
    expect(select).toHaveAttribute('required');
  });

  it('uses provided id', () => {
    render(<Select label="Country" options={mockOptions} id="custom-id" />);

    const select = screen.getByLabelText(/country/i);
    expect(select).toHaveAttribute('id', 'custom-id');
  });

  it('generates unique id when not provided', () => {
    const { container } = render(
      <>
        <Select label="Country 1" options={mockOptions} />
        <Select label="Country 2" options={mockOptions} />
      </>
    );

    const selects = container.querySelectorAll('select');
    expect(selects[0]?.id).not.toBe(selects[1]?.id);
  });

  it('renders chevron icon', () => {
    const { container } = render(<Select label="Country" options={mockOptions} />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('sets default value', () => {
    render(<Select label="Country" options={mockOptions} defaultValue="option2" />);

    const select = screen.getByLabelText(/country/i);
    expect(select).toHaveValue('option2');
  });
});
