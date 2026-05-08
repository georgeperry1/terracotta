// Thin TMDB v3 client. Uses the v4 read-access bearer token.
// Docs: https://developer.themoviedb.org/reference/intro/getting-started

const token = import.meta.env.VITE_TMDB_TOKEN;
const BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

if (!token) {
  // Surface late rather than at boot so unit tests don't need a token.
  // The first request will throw a clear error.
}

async function request<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!token) {
    throw new Error('Missing VITE_TMDB_TOKEN. Set it in .env.local.');
  }
  const url = new URL(`${BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status} on ${path}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbCrewMember {
  id: number;
  job: string;
  name: string;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  release_date: string;
  runtime: number | null;
  poster_path: string | null;
  overview: string;
  genres: { id: number; name: string }[];
  credits?: { crew: TmdbCrewMember[] };
}

export function searchMovies(query: string, page = 1) {
  return request<TmdbSearchResponse>('/search/movie', {
    query,
    page: String(page),
    include_adult: 'false',
  });
}

export function getMovieDetails(tmdbId: number) {
  return request<TmdbMovieDetails>(`/movie/${tmdbId}`, {
    append_to_response: 'credits',
  });
}

export function posterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' = 'w342') {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

export function directorOf(details: TmdbMovieDetails): string | null {
  return details.credits?.crew.find((m) => m.job === 'Director')?.name ?? null;
}

export function yearOf(releaseDate: string): number | null {
  if (!releaseDate) return null;
  const y = Number(releaseDate.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}
