import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('toggles between hidden and visible text', async () => {
    render(<PasswordInput label="Password" />);
    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: 'Show password' });

    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('links helper text, and the error instead when there is one', () => {
    const { rerender } = render(
      <PasswordInput label="Password" helperText="At least 8 characters" />
    );
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('At least 8 characters');

    rerender(
      <PasswordInput
        label="Password"
        helperText="At least 8 characters"
        error="Use at least 8 characters"
      />
    );
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'Use at least 8 characters'
    );
    expect(screen.queryByText('At least 8 characters')).not.toBeInTheDocument();
  });
});
