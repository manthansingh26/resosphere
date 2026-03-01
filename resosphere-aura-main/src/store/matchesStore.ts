import { create } from 'zustand';
import { supabase, Database } from '@/supabase/client';

type Match = Database['public']['Tables']['matches']['Row'];
type MatchInsert = Database['public']['Tables']['matches']['Insert'];

interface MatchesState {
  matches: Match[];
  loading: boolean;
  error: Error | null;
  fetchMatches: (userId: string) => Promise<void>;
  createMatch: (match: MatchInsert) => Promise<{ data: Match | null; error: any }>;
}

export const useMatchesStore = create<MatchesState>((set) => ({
  matches: [],
  loading: false,
  error: null,

  fetchMatches: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ matches: data || [], loading: false });
    } catch (err) {
      set({ error: err as Error, loading: false });
    }
  },

  createMatch: async (match: MatchInsert) => {
    const { data, error } = await supabase
      .from('matches')
      .insert(match)
      .select()
      .single();

    if (data && !error) {
      set((state) => ({ matches: [data, ...state.matches] }));
    }

    return { data, error };
  },
}));
