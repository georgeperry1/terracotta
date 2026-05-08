import { useQuery } from '@tanstack/react-query';
import { getMovieDetails } from '@/lib/tmdb';

export function useMovieDetails(tmdbId: number | null | undefined) {
  return useQuery({
    queryKey: ['tmdb', 'movie', tmdbId],
    queryFn: () => getMovieDetails(tmdbId as number),
    enabled: typeof tmdbId === 'number' && Number.isFinite(tmdbId),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
