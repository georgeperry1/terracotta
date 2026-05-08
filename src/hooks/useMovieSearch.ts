import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/lib/tmdb';

export function useMovieSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['tmdb', 'search', trimmed],
    queryFn: () => searchMovies(trimmed),
    enabled: trimmed.length >= 2,
  });
}
