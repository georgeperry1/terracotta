// Hand-written to mirror supabase/migrations/0001_init.sql.
// Regenerate from the live schema with: `pnpm db:types`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QueueVote = 'up' | 'down';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      movies: {
        Row: {
          tmdb_id: number;
          title: string;
          year: number | null;
          director: string | null;
          poster_path: string | null;
          overview: string | null;
          runtime: number | null;
          genres: string[];
          fetched_at: string;
        };
        Insert: {
          tmdb_id: number;
          title: string;
          year?: number | null;
          director?: string | null;
          poster_path?: string | null;
          overview?: string | null;
          runtime?: number | null;
          genres?: string[];
          fetched_at?: string;
        };
        Update: {
          tmdb_id?: number;
          title?: string;
          year?: number | null;
          director?: string | null;
          poster_path?: string | null;
          overview?: string | null;
          runtime?: number | null;
          genres?: string[];
          fetched_at?: string;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          tmdb_id: number;
          user_id: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tmdb_id: number;
          user_id: string;
          score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tmdb_id?: number;
          user_id?: string;
          score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ratings_tmdb_id_fkey';
            columns: ['tmdb_id'];
            referencedRelation: 'movies';
            referencedColumns: ['tmdb_id'];
          },
          {
            foreignKeyName: 'ratings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      watchlist: {
        Row: {
          id: string;
          tmdb_id: number;
          user_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          tmdb_id: number;
          user_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          tmdb_id?: number;
          user_id?: string;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'watchlist_tmdb_id_fkey';
            columns: ['tmdb_id'];
            referencedRelation: 'movies';
            referencedColumns: ['tmdb_id'];
          },
          {
            foreignKeyName: 'watchlist_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      queue: {
        Row: {
          id: string;
          tmdb_id: number;
          added_by: string;
          added_at: string;
          partner_vote: QueueVote | null;
          partner_voted_at: string | null;
        };
        Insert: {
          id?: string;
          tmdb_id: number;
          added_by: string;
          added_at?: string;
          partner_vote?: QueueVote | null;
          partner_voted_at?: string | null;
        };
        Update: {
          id?: string;
          tmdb_id?: number;
          added_by?: string;
          added_at?: string;
          partner_vote?: QueueVote | null;
          partner_voted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'queue_tmdb_id_fkey';
            columns: ['tmdb_id'];
            referencedRelation: 'movies';
            referencedColumns: ['tmdb_id'];
          },
          {
            foreignKeyName: 'queue_added_by_fkey';
            columns: ['added_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Enums: {
      queue_vote: QueueVote;
    };
  };
}
