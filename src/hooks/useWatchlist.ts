import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { upsertMovieCache } from '@/lib/movies';
import type { TmdbMovieDetails } from '@/lib/tmdb';

export function watchlistEntryKey(tmdbId: number, userId: string) {
  return ['watchlist', tmdbId, userId] as const;
}

export function useIsInWatchlist(tmdbId: number, userId: string | undefined) {
  return useQuery({
    queryKey: ['watchlist', tmdbId, userId ?? ''],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('watchlist')
        .select('id')
        .eq('tmdb_id', tmdbId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: Number.isFinite(tmdbId) && !!userId,
  });
}

interface ToggleInput {
  details: TmdbMovieDetails;
  userId: string;
  desired: boolean;
}

export function useToggleWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details, userId, desired }: ToggleInput) => {
      if (desired) {
        await upsertMovieCache(details);
        const { error } = await supabase
          .from('watchlist')
          .insert({ tmdb_id: details.id, user_id: userId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('tmdb_id', details.id)
          .eq('user_id', userId);
        if (error) throw error;
      }
    },
    onSuccess: (_data, { details, userId }) => {
      void queryClient.invalidateQueries({
        queryKey: watchlistEntryKey(details.id, userId),
      });
      void queryClient.invalidateQueries({ queryKey: ['watchlist', 'list'] });
    },
  });
}
