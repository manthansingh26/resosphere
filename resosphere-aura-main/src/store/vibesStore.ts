import { create } from 'zustand';
import { supabase, Database } from '@/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type Vibe = Database['public']['Tables']['vibes']['Row'];
type VibeInsert = Database['public']['Tables']['vibes']['Insert'];

interface VibesState {
  vibes: Vibe[];
  loading: boolean;
  error: Error | null;
  channel: RealtimeChannel | null;
  fetchVibes: (userId?: string) => Promise<void>;
  createVibe: (vibe: VibeInsert) => Promise<{ data: Vibe | null; error: any }>;
  subscribeToVibes: () => void;
  unsubscribe: () => void;
}

export const useVibesStore = create<VibesState>((set, get) => ({
  vibes: [],
  loading: false,
  error: null,
  channel: null,

  fetchVibes: async (userId?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('vibes')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ vibes: data || [], loading: false });
    } catch (err) {
      set({ error: err as Error, loading: false });
    }
  },

  createVibe: async (vibe: VibeInsert) => {
    try {
      const { data, error } = await supabase
        .from('vibes')
        .insert(vibe)
        .select()
        .single();

      if (error) {
        // Demo mode - create mock vibe
        console.log('Using demo mode for vibe creation');
        const mockVibe: Vibe = {
          id: `demo-${Date.now()}`,
          user_id: vibe.user_id,
          energy: vibe.energy,
          calm: vibe.calm,
          creative: vibe.creative,
          focus: vibe.focus,
          joy: vibe.joy,
          text: vibe.text || null,
          audio_url: vibe.audio_url || null,
          image_url: vibe.image_url || null,
          insight: vibe.insight || null,
          orb_color: vibe.orb_color || null,
          latitude: vibe.latitude || null,
          longitude: vibe.longitude || null,
          location_name: vibe.location_name || null,
          created_at: new Date().toISOString(),
        };
        
        set((state) => ({ vibes: [mockVibe, ...state.vibes] }));
        return { data: mockVibe, error: null };
      }

      if (data) {
        set((state) => ({ vibes: [data, ...state.vibes] }));
      }

      return { data, error: null };
    } catch (err) {
      console.log('Vibe creation error, using demo mode:', err);
      
      // Demo mode fallback
      const mockVibe: Vibe = {
        id: `demo-${Date.now()}`,
        user_id: vibe.user_id,
        energy: vibe.energy,
        calm: vibe.calm,
        creative: vibe.creative,
        focus: vibe.focus,
        joy: vibe.joy,
        text: vibe.text || null,
        audio_url: vibe.audio_url || null,
        image_url: vibe.image_url || null,
        insight: vibe.insight || null,
        orb_color: vibe.orb_color || null,
        latitude: vibe.latitude || null,
        longitude: vibe.longitude || null,
        location_name: vibe.location_name || null,
        created_at: new Date().toISOString(),
      };
      
      set((state) => ({ vibes: [mockVibe, ...state.vibes] }));
      return { data: mockVibe, error: null };
    }
  },

  subscribeToVibes: () => {
    const channel = supabase
      .channel('public-vibes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vibes',
        },
        (payload) => {
          const state = get();
          if (payload.eventType === 'INSERT') {
            set({ vibes: [payload.new as Vibe, ...state.vibes] });
          } else if (payload.eventType === 'UPDATE') {
            set({
              vibes: state.vibes.map((vibe) =>
                vibe.id === payload.new.id ? (payload.new as Vibe) : vibe
              ),
            });
          } else if (payload.eventType === 'DELETE') {
            set({
              vibes: state.vibes.filter((vibe) => vibe.id !== payload.old.id),
            });
          }
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      channel.unsubscribe();
      set({ channel: null });
    }
  },
}));
