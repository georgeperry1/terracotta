import { describe, it, expect } from 'vitest';
import { relativeTime } from './time';

const now = new Date('2025-05-07T12:00:00Z');

describe('relativeTime', () => {
  it('returns "just now" for the current moment', () => {
    expect(relativeTime('2025-05-07T12:00:00Z', now)).toBe('just now');
  });

  it('formats minutes', () => {
    expect(relativeTime('2025-05-07T11:55:00Z', now)).toBe('5 minutes ago');
  });

  it('formats hours', () => {
    expect(relativeTime('2025-05-07T08:00:00Z', now)).toBe('4 hours ago');
  });

  it('formats days', () => {
    expect(relativeTime('2025-05-05T12:00:00Z', now)).toBe('2 days ago');
  });

  it('formats months', () => {
    expect(relativeTime('2025-02-07T12:00:00Z', now)).toBe('3 months ago');
  });

  it('formats years', () => {
    expect(relativeTime('2023-05-07T12:00:00Z', now)).toBe('2 years ago');
  });
});
