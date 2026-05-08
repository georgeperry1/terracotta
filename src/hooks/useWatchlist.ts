import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { upsertMovieCache } from '@/lib/movies';
import type { TmdbMovieDetails } from '@/lib/tmdb';
import type { Database } from '@/lib/database.types';

type MovieRow = Database['public']['Tables']['movies']['Row'];
type WatchlistRow = Database['public']['Tables']['watchlist']['Row'];

export interface WatchlistListEntry extends WatchlistRow {
  movies: MovieRow | null;
}

export function watchlistEntryKey(tmdbId: number, userId: string) {
  return ['watchlist', 'entry', tmdbId, userId] as const;
}

export function useIsInWatchlist(tmdbId: number, userId: string | undefined) {
  return useQuery({
    queryKey: ['watchlist', 'entry', tmdbId, userId ?? ''],
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

export function useWatchlistList(userId: string | undefined) {
  return useQuery({
    queryKey: ['watchlist', 'list', userId ?? ''],
    queryFn: async (): Promise<WatchlistListEntry[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('watchlist')
        .select('*, movies(*)')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as WatchlistListEntry[];
    },
    enabled: !!userId,
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

interface RemoveInput {
  tmdbId: number;
  userId: string;
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tmdbId, userId }: RemoveInput) => {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('tmdb_id', tmdbId)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}
