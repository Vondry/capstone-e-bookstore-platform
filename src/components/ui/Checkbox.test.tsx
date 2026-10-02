import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox with a visible label', () => {
    render(<Checkbox label="Use Saved Address" checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Use Saved Address' })).not.toBeChecked();
    expect(screen.getByText('Use Saved Address')).toBeVisible();
  });

  it('calls onChange when the label is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Use Saved Address" checked={false} onChange={onChange} />);
    await user.click(screen.getByText('Use Saved Address'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles with the space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Use Saved Address" checked onChange={onChange} />);
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('can be disabled', () => {
    render(<Checkbox label="Use Saved Address" checked={false} onChange={vi.fn()} disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
