import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_key';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          aura_color: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          aura_color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          aura_color?: string | null;
          created_at?: string;
        };
      };
      vibes: {
        Row: {
          id: string;
          user_id: string;
          energy: number;
          calm: number;
          creative: number;
          focus: number;
          joy: number;
          text: string | null;
          audio_url: string | null;
          image_url: string | null;
          insight: string | null;
          orb_color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          energy: number;
          calm: number;
          creative: number;
          focus: number;
          joy: number;
          text?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          insight?: string | null;
          orb_color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          energy?: number;
          calm?: number;
          creative?: number;
          focus?: number;
          joy?: number;
          text?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          insight?: string | null;
          orb_color?: string | null;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          resonance_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id: string;
          resonance_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string;
          resonance_score?: number;
          created_at?: string;
        };
      };
    };
  };
};
