import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from './TextInput';
import { Search } from '@carbon/icons-react';

describe('TextInput', () => {
  it('renders with label', () => {
    render(<TextInput label="Email" />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<TextInput label="Email" placeholder="Enter your email" />);

    const input = screen.getByPlaceholderText(/enter your email/i);
    expect(input).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<TextInput label="Email" error="Email is required" />);

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Email is required');
  });

  it('links error to input via aria-describedby', () => {
    render(<TextInput label="Email" error="Email is required" />);

    const input = screen.getByLabelText(/email/i);
    const error = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  it('sets aria-invalid when error is present', () => {
    render(<TextInput label="Email" error="Email is required" />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(<TextInput label="Email" />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders with icon', () => {
    render(<TextInput label="Search" icon={<Search data-testid="search-icon" />} />);

    const icon = screen.getByTestId('search-icon');
    expect(icon).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<TextInput label="Email" />);

    const input = screen.getByLabelText(/email/i);
    await user.type(input, 'test@example.com');

    expect(input).toHaveValue('test@example.com');
  });

  it('handles onChange event', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TextInput label="Email" onChange={handleChange} />);

    const input = screen.getByLabelText(/email/i);
    await user.type(input, 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders disabled state', () => {
    render(<TextInput label="Email" disabled />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toBeDisabled();
  });

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup();
    render(<TextInput label="Email" disabled />);

    const input = screen.getByLabelText(/email/i);
    await user.type(input, 'test');

    expect(input).toHaveValue('');
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<TextInput label="Email" />);

    const input = screen.getByLabelText(/email/i);

    await user.tab();
    expect(input).toHaveFocus();
  });

  it('accepts custom className', () => {
    render(<TextInput label="Email" className="custom-class" />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('custom-class');
  });

  it('forwards additional props', () => {
    render(<TextInput label="Email" type="email" autoComplete="email" data-testid="email-input" />);

    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('uses provided id', () => {
    render(<TextInput label="Email" id="custom-id" />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('generates unique id when not provided', () => {
    const { container } = render(
      <>
        <TextInput label="Email 1" />
        <TextInput label="Email 2" />
      </>
    );

    const inputs = container.querySelectorAll('input');
    expect(inputs[0]?.id).not.toBe(inputs[1]?.id);
  });
});
