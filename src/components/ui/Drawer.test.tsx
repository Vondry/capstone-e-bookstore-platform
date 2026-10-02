import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

function renderDrawer(open: boolean) {
  const onClose = vi.fn();
  const result = render(
    <Drawer open={open} onClose={onClose} title="Menu">
      <a href="/poetry">Poetry</a>
    </Drawer>
  );
  return { ...result, onClose };
}

describe('Drawer', () => {
  it('is a labelled modal dialog that focuses its close button when opened', () => {
    renderDrawer(true);
    expect(screen.getByRole('dialog', { name: 'Menu' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveFocus();
  });

  it('closes with Escape, the close button and the overlay', async () => {
    const user = userEvent.setup();
    const { onClose, container } = renderDrawer(true);

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    const overlay = container.querySelector('.bg-black\\/50');
    if (!overlay) throw new Error('overlay not rendered');
    await user.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('is hidden and inert while closed, and ignores Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDrawer(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });
});
