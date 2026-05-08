import { supabase } from './supabase';
import { directorOf, yearOf, type TmdbMovieDetails } from './tmdb';
import type { Database } from './database.types';

type MovieInsert = Database['public']['Tables']['movies']['Insert'];

export function tmdbToMovieRow(details: TmdbMovieDetails): MovieInsert {
  return {
    tmdb_id: details.id,
    title: details.title,
    year: yearOf(details.release_date),
    director: directorOf(details),
    poster_path: details.poster_path,
    overview: details.overview,
    runtime: details.runtime,
    genres: details.genres.map((g) => g.name),
  };
}

export async function upsertMovieCache(details: TmdbMovieDetails) {
  const row = { ...tmdbToMovieRow(details), fetched_at: new Date().toISOString() };
  const { error } = await supabase
    .from('movies')
    .upsert(row, { onConflict: 'tmdb_id' });
  if (error) throw error;
}
