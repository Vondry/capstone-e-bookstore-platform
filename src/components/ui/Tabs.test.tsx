import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, type TabsProps } from './Tabs';

const tabs = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
] as const;

type Id = (typeof tabs)[number]['id'];

function Harness({ orientation }: Readonly<Pick<TabsProps<Id>, 'orientation'>>) {
  const [value, setValue] = useState<Id>('a');
  return (
    <Tabs
      label="Letters"
      tabs={[...tabs]}
      value={value}
      onChange={setValue}
      orientation={orientation}
    >
      <p>Panel {value}</p>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders an accessible tablist with the selected panel', () => {
    render(<Harness />);
    expect(screen.getByRole('tablist', { name: 'Letters' })).toHaveAttribute(
      'aria-orientation',
      'horizontal'
    );
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('aria-selected', 'true');
    expect(alpha).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('tabindex', '-1');
    const panel = screen.getByRole('tabpanel', { name: 'Alpha' });
    expect(panel).toHaveTextContent('Panel a');
    expect(alpha).toHaveAttribute('aria-controls', panel.id);
  });

  it('selects a tab on click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel c');
  });

  it('moves focus and selection with arrow keys, wrapping around', async () => {
    const user = userEvent.setup();
    render(<Harness orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports Home and End and ignores other keys', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();
    await user.keyboard('x');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });
});
