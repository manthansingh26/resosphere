import { useEffect, useState } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type Vibe = Database['public']['Tables']['vibes']['Row'];

export function useVibes(userId?: string) {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchVibes = async () => {
      try {
        const { data, error } = await supabase
          .from('vibes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVibes(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchVibes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('vibes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vibes',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVibes((prev) => [payload.new as Vibe, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setVibes((prev) =>
              prev.map((vibe) =>
                vibe.id === payload.new.id ? (payload.new as Vibe) : vibe
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setVibes((prev) => prev.filter((vibe) => vibe.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const createVibe = async (vibe: Database['public']['Tables']['vibes']['Insert']) => {
    const { data, error } = await supabase
      .from('vibes')
      .insert(vibe)
      .select()
      .single();

    return { data, error };
  };

  return {
    vibes,
    loading,
    error,
    createVibe,
  };
}
