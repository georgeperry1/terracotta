import { describe, it, expect } from 'vitest';
import { tmdbToMovieRow } from './movies';
import type { TmdbMovieDetails } from './tmdb';

const baseDetails: TmdbMovieDetails = {
  id: 603,
  title: 'The Matrix',
  release_date: '1999-03-31',
  runtime: 136,
  poster_path: '/abc.jpg',
  overview: 'A hacker discovers the truth.',
  genres: [
    { id: 28, name: 'Action' },
    { id: 878, name: 'Science Fiction' },
  ],
  credits: {
    crew: [
      { id: 1, job: 'Director', name: 'Lana Wachowski' },
      { id: 2, job: 'Director', name: 'Lilly Wachowski' },
      { id: 3, job: 'Producer', name: 'Joel Silver' },
    ],
  },
};

describe('tmdbToMovieRow', () => {
  it('maps a full TMDB response to a movies row', () => {
    expect(tmdbToMovieRow(baseDetails)).toEqual({
      tmdb_id: 603,
      title: 'The Matrix',
      year: 1999,
      director: 'Lana Wachowski',
      poster_path: '/abc.jpg',
      overview: 'A hacker discovers the truth.',
      runtime: 136,
      genres: ['Action', 'Science Fiction'],
    });
  });

  it('handles missing credits, runtime, year, and genres', () => {
    const sparse: TmdbMovieDetails = {
      id: 1,
      title: 'Untitled',
      release_date: '',
      runtime: null,
      poster_path: null,
      overview: '',
      genres: [],
    };
    expect(tmdbToMovieRow(sparse)).toEqual({
      tmdb_id: 1,
      title: 'Untitled',
      year: null,
      director: null,
      poster_path: null,
      overview: '',
      runtime: null,
      genres: [],
    });
  });
});
