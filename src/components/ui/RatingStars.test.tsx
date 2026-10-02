import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RatingStars, RatingStarsInput } from './RatingStars';

function ControlledInput({ error }: Readonly<{ error?: string }>) {
  const [value, setValue] = useState(0);
  return (
    <>
      <RatingStarsInput value={value} onChange={setValue} error={error} />
      <output>{value}</output>
    </>
  );
}

describe('RatingStars', () => {
  it('announces the rating as a single image', () => {
    render(<RatingStars value={4.4} />);
    expect(screen.getByRole('img', { name: 'Rated 4.4 out of 5' })).toBeInTheDocument();
  });

  it('clamps out-of-range values', () => {
    render(<RatingStars value={7} />);
    expect(screen.getByRole('img', { name: 'Rated 7.0 out of 5' })).toBeInTheDocument();
  });
});

describe('RatingStarsInput', () => {
  it('renders a labelled radio group with five options', () => {
    render(<ControlledInput />);
    expect(screen.getByRole('group', { name: 'Your rating' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: '1 star' })).not.toBeChecked();
  });

  it('selects a rating by click', async () => {
    const user = userEvent.setup();
    render(<ControlledInput />);
    await user.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(screen.getByRole('radio', { name: '4 stars' })).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('4');
  });

  it('changes the rating with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<ControlledInput />);
    await user.click(screen.getByRole('radio', { name: '2 stars' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();
  });

  it('links the error message to the group', () => {
    render(<ControlledInput error="Please choose a rating" />);
    expect(screen.getByRole('group', { name: 'Your rating' })).toHaveAccessibleDescription(
      'Please choose a rating'
    );
  });
});
