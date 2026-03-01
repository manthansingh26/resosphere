import { useEffect, useState } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type Match = Database['public']['Tables']['matches']['Row'];

export function useMatches(userId?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMatches(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('matches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMatches((prev) => [payload.new as Match, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMatches((prev) =>
              prev.map((match) =>
                match.id === payload.new.id ? (payload.new as Match) : match
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMatches((prev) => prev.filter((match) => match.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const createMatch = async (match: Database['public']['Tables']['matches']['Insert']) => {
    const { data, error } = await supabase
      .from('matches')
      .insert(match)
      .select()
      .single();

    return { data, error };
  };

  return {
    matches,
    loading,
    error,
    createMatch,
  };
}
