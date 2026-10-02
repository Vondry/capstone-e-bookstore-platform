import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuantityStepper } from './QuantityStepper';

describe('QuantityStepper', () => {
  it('renders a labelled group with the current value', () => {
    render(<QuantityStepper value={2} onChange={vi.fn()} itemLabel="Godaan" />);
    const group = screen.getByRole('group', { name: 'Quantity for Godaan' });
    expect(group).toHaveTextContent('2');
  });

  it('calls onChange with value + 1 and value − 1', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantityStepper value={2} onChange={onChange} itemLabel="Godaan" />);
    await user.click(screen.getByRole('button', { name: 'Increase quantity of Godaan' }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.click(screen.getByRole('button', { name: 'Decrease quantity of Godaan' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('allows going down to the minimum (0) so the caller can confirm removal', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantityStepper value={1} onChange={onChange} itemLabel="Godaan" />);
    await user.click(screen.getByRole('button', { name: /decrease/i }));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('disables the buttons at min and max', () => {
    const { rerender } = render(
      <QuantityStepper value={0} onChange={vi.fn()} itemLabel="Godaan" />
    );
    expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled();
    rerender(<QuantityStepper value={10} max={10} onChange={vi.fn()} itemLabel="Godaan" />);
    expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled();
  });

  it('works from the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantityStepper value={1} onChange={onChange} itemLabel="Godaan" />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /increase/i })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
