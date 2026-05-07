import { describe, it, expect } from 'vitest';
import { directorOf, posterUrl, yearOf, type TmdbMovieDetails } from './tmdb';

describe('directorOf', () => {
  it('returns the crew member with job "Director"', () => {
    const details = {
      credits: {
        crew: [
          { id: 1, job: 'Producer', name: 'Producer P' },
          { id: 2, job: 'Director', name: 'Director D' },
          { id: 3, job: 'Writer', name: 'Writer W' },
        ],
      },
    } as unknown as TmdbMovieDetails;
    expect(directorOf(details)).toBe('Director D');
  });

  it('returns null when no director is credited', () => {
    const details = {
      credits: { crew: [{ id: 1, job: 'Producer', name: 'Pat' }] },
    } as unknown as TmdbMovieDetails;
    expect(directorOf(details)).toBeNull();
  });

  it('returns null when credits are missing entirely', () => {
    expect(directorOf({} as TmdbMovieDetails)).toBeNull();
  });
});

describe('yearOf', () => {
  it('parses the year from an ISO release date', () => {
    expect(yearOf('1999-03-31')).toBe(1999);
  });

  it('returns null for an empty release date', () => {
    expect(yearOf('')).toBeNull();
  });
});

describe('posterUrl', () => {
  it('builds a w342 URL by default', () => {
    expect(posterUrl('/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w342/abc.jpg',
    );
  });

  it('honours the requested size', () => {
    expect(posterUrl('/abc.jpg', 'w185')).toBe(
      'https://image.tmdb.org/t/p/w185/abc.jpg',
    );
  });

  it('returns null when no poster path is given', () => {
    expect(posterUrl(null)).toBeNull();
  });
});
