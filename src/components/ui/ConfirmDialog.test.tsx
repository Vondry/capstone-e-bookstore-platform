import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

/** Opener button that disappears when confirmed, like a removed cart line */
function Harness() {
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState(false);
  return (
    <main id="main">
      {!removed && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
        >
          Remove item
        </button>
      )}
      <ConfirmDialog
        open={open}
        title="Remove this book?"
        confirmLabel="Remove"
        onConfirm={() => {
          setRemoved(true);
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </main>
  );
}

describe('ConfirmDialog', () => {
  it('focuses Cancel and keeps Tab inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Remove item' }));

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Remove' });
    expect(cancel).toHaveFocus();
    await user.tab();
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it('returns focus to the opener on cancel', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Remove item' });
    await user.click(opener);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('moves focus to the main region when the opener was removed', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Remove item' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('calls the latest onCancel without re-running focus handling', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <ConfirmDialog open title="T" confirmLabel="OK" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    rerender(
      <ConfirmDialog open title="T" confirmLabel="OK" onConfirm={vi.fn()} onCancel={onCancel} />
    );
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
