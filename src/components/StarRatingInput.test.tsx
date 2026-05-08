import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  StarRatingDisplay,
  StarRatingInput,
} from './StarRatingInput';

describe('StarRatingInput', () => {
  it('exposes 20 half-step radio buttons covering 0.5 to 10', () => {
    render(<StarRatingInput value={null} onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(20);
    expect(screen.getByRole('radio', { name: 'Rate 0.5 out of 10' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Rate 10 out of 10' })).toBeInTheDocument();
  });

  it('marks the current value as checked', () => {
    render(<StarRatingInput value={7.5} onChange={() => {}} />);
    expect(
      screen.getByRole('radio', { name: 'Rate 7.5 out of 10' }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Rate 8 out of 10' }),
    ).not.toBeChecked();
  });

  it('emits the half-step value when the left half of a star is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRatingInput value={null} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Rate 6.5 out of 10' }));
    expect(onChange).toHaveBeenCalledWith(6.5);
  });

  it('emits the whole value when the right half of a star is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRatingInput value={null} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: 'Rate 7 out of 10' }));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRatingInput value={null} onChange={onChange} disabled />);
    await user.click(screen.getByRole('radio', { name: 'Rate 5 out of 10' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('StarRatingDisplay', () => {
  it('uses an unrated label when value is null', () => {
    render(<StarRatingDisplay value={null} />);
    expect(screen.getByLabelText('Not rated')).toBeInTheDocument();
  });

  it('reports the score in its accessible label', () => {
    render(<StarRatingDisplay value={8.5} />);
    expect(screen.getByLabelText('8.5 out of 10')).toBeInTheDocument();
  });
});
