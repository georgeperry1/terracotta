import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { upsertMovieCache } from '@/lib/movies';
import type { TmdbMovieDetails } from '@/lib/tmdb';
import type { Database } from '@/lib/database.types';

export type QueueRow = Database['public']['Tables']['queue']['Row'];

export function useQueueEntry(tmdbId: number) {
  return useQuery({
    queryKey: ['queue', 'entry', tmdbId],
    queryFn: async (): Promise<QueueRow | null> => {
      const { data, error } = await supabase
        .from('queue')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Number.isFinite(tmdbId),
  });
}

interface AddToQueueInput {
  details: TmdbMovieDetails;
  userId: string;
}

export function useAddToQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details, userId }: AddToQueueInput) => {
      await upsertMovieCache(details);
      const { error } = await supabase
        .from('queue')
        .insert({ tmdb_id: details.id, added_by: userId });
      if (error) throw error;
    },
    onSuccess: (_data, { details }) => {
      void queryClient.invalidateQueries({
        queryKey: ['queue', 'entry', details.id],
      });
      void queryClient.invalidateQueries({ queryKey: ['queue', 'list'] });
    },
  });
}
