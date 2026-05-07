import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type MovieRow = Database['public']['Tables']['movies']['Row'];

export interface LibraryRating {
  user_id: string;
  score: number;
  updated_at: string;
}

export interface LibraryEntry {
  movie: MovieRow;
  ratings: LibraryRating[];
  lastRatedAt: string;
}

interface RatingWithMovie {
  score: number;
  user_id: string;
  updated_at: string;
  movies: MovieRow | null;
}

// Pure: groups rating rows (already sorted by updated_at desc) into one
// entry per movie. The first row for a given tmdb_id wins lastRatedAt,
// so the returned list is also sorted by recency.
export function groupRatingsByMovie(rows: RatingWithMovie[]): LibraryEntry[] {
  const byMovie = new Map<number, LibraryEntry>();
  for (const row of rows) {
    if (!row.movies) continue;
    const rating: LibraryRating = {
      user_id: row.user_id,
      score: row.score,
      updated_at: row.updated_at,
    };
    const existing = byMovie.get(row.movies.tmdb_id);
    if (existing) {
      existing.ratings.push(rating);
    } else {
      byMovie.set(row.movies.tmdb_id, {
        movie: row.movies,
        ratings: [rating],
        lastRatedAt: rating.updated_at,
      });
    }
  }
  return Array.from(byMovie.values());
}

export function useLibrary() {
  return useQuery({
    queryKey: ['library'],
    queryFn: async (): Promise<LibraryEntry[]> => {
      const { data, error } = await supabase
        .from('ratings')
        .select('score, user_id, updated_at, movies(*)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return groupRatingsByMovie((data ?? []) as RatingWithMovie[]);
    },
  });
}
