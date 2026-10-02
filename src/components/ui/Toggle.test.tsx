import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders a switch with label, description and state', () => {
    render(
      <Toggle
        label="Redeem gift points"
        description="Available: 120 points"
        checked
        onChange={vi.fn()}
      />
    );
    const toggle = screen.getByRole('switch', { name: 'Redeem gift points' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAccessibleDescription('Available: 120 points');
  });

  it('calls onChange with the opposite value on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Redeem gift points" checked={false} onChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('works from the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Redeem gift points" checked onChange={onChange} />);
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does nothing when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Redeem gift points" checked={false} onChange={onChange} disabled />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
