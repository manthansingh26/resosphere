import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      vibes: {
        Row: {
          id: string;
          user_id: string;
          mood_score: number;
          text: string | null;
          audio_url: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood_score: number;
          text?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood_score?: number;
          text?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          matched_user_id: string;
          resonance_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          matched_user_id: string;
          resonance_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          matched_user_id?: string;
          resonance_score?: number;
          created_at?: string;
        };
      };
    };
  };
};
