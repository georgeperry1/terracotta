import { describe, it, expect } from 'vitest';
import { groupRatingsByMovie } from './useLibrary';

const matrix = {
  tmdb_id: 603,
  title: 'The Matrix',
  year: 1999,
  director: 'Lana Wachowski',
  poster_path: '/m.jpg',
  overview: '',
  runtime: 136,
  genres: ['Action'],
  fetched_at: '2025-01-01T00:00:00Z',
};

const dune = {
  tmdb_id: 438631,
  title: 'Dune',
  year: 2021,
  director: 'Denis Villeneuve',
  poster_path: '/d.jpg',
  overview: '',
  runtime: 155,
  genres: ['Science Fiction'],
  fetched_at: '2025-01-01T00:00:00Z',
};

describe('groupRatingsByMovie', () => {
  it('preserves recency order from the input rows', () => {
    const rows = [
      { score: 9, user_id: 'g', updated_at: '2025-05-07T12:00:00Z', movies: dune },
      { score: 8, user_id: 'g', updated_at: '2025-05-06T12:00:00Z', movies: matrix },
      { score: 8.5, user_id: 'i', updated_at: '2025-05-05T12:00:00Z', movies: dune },
    ];
    const out = groupRatingsByMovie(rows);
    expect(out.map((e) => e.movie.tmdb_id)).toEqual([dune.tmdb_id, matrix.tmdb_id]);
  });

  it('collects every rating per movie', () => {
    const rows = [
      { score: 9, user_id: 'g', updated_at: '2025-05-07T12:00:00Z', movies: dune },
      { score: 8.5, user_id: 'i', updated_at: '2025-05-05T12:00:00Z', movies: dune },
    ];
    const [entry] = groupRatingsByMovie(rows);
    expect(entry.ratings).toHaveLength(2);
    expect(entry.ratings.map((r) => r.user_id).sort()).toEqual(['g', 'i']);
  });

  it('uses the first (most recent) rating timestamp as lastRatedAt', () => {
    const rows = [
      { score: 9, user_id: 'g', updated_at: '2025-05-07T12:00:00Z', movies: dune },
      { score: 8.5, user_id: 'i', updated_at: '2025-05-05T12:00:00Z', movies: dune },
    ];
    const [entry] = groupRatingsByMovie(rows);
    expect(entry.lastRatedAt).toBe('2025-05-07T12:00:00Z');
  });

  it('skips rows with a missing movie join', () => {
    const rows = [
      { score: 9, user_id: 'g', updated_at: '2025-05-07T12:00:00Z', movies: null },
      { score: 8, user_id: 'g', updated_at: '2025-05-06T12:00:00Z', movies: matrix },
    ];
    const out = groupRatingsByMovie(rows);
    expect(out).toHaveLength(1);
    expect(out[0].movie.tmdb_id).toBe(matrix.tmdb_id);
  });
});
