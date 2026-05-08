import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { upsertMovieCache } from '@/lib/movies';
import type { TmdbMovieDetails } from '@/lib/tmdb';
import type { Database } from '@/lib/database.types';

export type Rating = Database['public']['Tables']['ratings']['Row'];

export function ratingsQueryKey(tmdbId: number) {
  return ['ratings', tmdbId] as const;
}

export function useMovieRatings(tmdbId: number) {
  return useQuery({
    queryKey: ratingsQueryKey(tmdbId),
    queryFn: async (): Promise<Rating[]> => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('tmdb_id', tmdbId);
      if (error) throw error;
      return data;
    },
    enabled: Number.isFinite(tmdbId),
  });
}

interface RateInput {
  details: TmdbMovieDetails;
  userId: string;
  score: number;
}

export function useRateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details, userId, score }: RateInput) => {
      await upsertMovieCache(details);
      const { error } = await supabase.from('ratings').upsert(
        {
          tmdb_id: details.id,
          user_id: userId,
          score,
        },
        { onConflict: 'tmdb_id,user_id' },
      );
      if (error) throw error;
    },
    onSuccess: (_data, { details }) => {
      void queryClient.invalidateQueries({
        queryKey: ratingsQueryKey(details.id),
      });
      // First rating triggers DB-side queue removal; refresh the queue too.
      void queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

interface ClearInput {
  tmdbId: number;
  userId: string;
}

export function useClearRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tmdbId, userId }: ClearInput) => {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('tmdb_id', tmdbId)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: (_data, { tmdbId }) => {
      void queryClient.invalidateQueries({ queryKey: ratingsQueryKey(tmdbId) });
    },
  });
}
