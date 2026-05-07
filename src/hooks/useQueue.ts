import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { upsertMovieCache } from '@/lib/movies';
import type { TmdbMovieDetails } from '@/lib/tmdb';
import type { Database, QueueVote } from '@/lib/database.types';

export type QueueRow = Database['public']['Tables']['queue']['Row'];
type MovieRow = Database['public']['Tables']['movies']['Row'];

export interface QueueListEntry extends QueueRow {
  movies: MovieRow | null;
}

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

export function useQueueList() {
  return useQuery({
    queryKey: ['queue', 'list'],
    queryFn: async (): Promise<QueueListEntry[]> => {
      const { data, error } = await supabase
        .from('queue')
        .select('*, movies(*)')
        .order('added_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as QueueListEntry[];
    },
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

interface SetPartnerVoteInput {
  queueId: string;
  vote: QueueVote | null;
}

export function useSetPartnerVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ queueId, vote }: SetPartnerVoteInput) => {
      const { error } = await supabase
        .from('queue')
        .update({
          partner_vote: vote,
          partner_voted_at: vote == null ? null : new Date().toISOString(),
        })
        .eq('id', queueId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}

export function useRemoveFromQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (queueId: string) => {
      const { error } = await supabase.from('queue').delete().eq('id', queueId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
}
