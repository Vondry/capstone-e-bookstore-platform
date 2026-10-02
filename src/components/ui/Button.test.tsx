import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Add } from '@carbon/icons-react';

describe('Button', () => {
  it('renders primary button by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-interactive');
  });

  it('renders secondary button variant', () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-button-secondary');
  });

  it('renders small size variant', () => {
    render(<Button size="small">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('h-40');
  });

  it('renders default size', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('h-48');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('does not trigger click when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button loading onClick={handleClick}>
        Click me
      </Button>
    );
    const button = screen.getByRole('button', { name: /click me/i });

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders disabled state', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeDisabled();
  });

  it('does not trigger click when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );
    const button = screen.getByRole('button', { name: /click me/i });

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders icon on the right by default', () => {
    render(<Button icon={<Add data-testid="icon" />}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    const icon = screen.getByTestId('icon');

    expect(button).toContainElement(icon);
  });

  it('renders icon on the left when specified', () => {
    render(
      <Button icon={<Add data-testid="icon" />} iconPosition="left">
        Click me
      </Button>
    );

    const icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
  });

  it('hides icon when loading', () => {
    render(
      <Button loading icon={<Add data-testid="icon" />}>
        Click me
      </Button>
    );

    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    button.focus();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('has correct ARIA attributes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toHaveAttribute('type', 'button');
  });

  it('accepts custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toHaveClass('custom-class');
  });

  it('forwards additional props', () => {
    render(<Button data-testid="custom-button">Click me</Button>);
    const button = screen.getByTestId('custom-button');

    expect(button).toBeInTheDocument();
  });
});
