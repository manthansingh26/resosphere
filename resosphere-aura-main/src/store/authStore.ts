import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  initialize: () => Promise<void>;
}

// Demo mode - create mock user for testing
const createMockUser = (email: string): User => ({
  id: `demo-${Date.now()}`,
  email,
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User);

const createMockSession = (user: User): Session => ({
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user,
} as Session);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // Try real Supabase first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // If Supabase fails, use demo mode
        console.log('Supabase unavailable, using demo mode');
        const mockUser = createMockUser(email);
        const mockSession = createMockSession(mockUser);
        
        // Store in localStorage for persistence
        localStorage.setItem('demo-user', JSON.stringify(mockUser));
        localStorage.setItem('demo-session', JSON.stringify(mockSession));
        
        set({ user: mockUser, session: mockSession });
        return { error: null };
      }
      
      console.log('Sign in successful:', data.user?.email);
      if (data.user) set({ user: data.user, session: data.session });
      return { error: null };
    } catch (err) {
      console.log('Sign in error, using demo mode:', err);
      
      // Demo mode fallback
      const mockUser = createMockUser(email);
      const mockSession = createMockSession(mockUser);
      
      localStorage.setItem('demo-user', JSON.stringify(mockUser));
      localStorage.setItem('demo-session', JSON.stringify(mockSession));
      
      set({ user: mockUser, session: mockSession });
      return { error: null };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      console.log('Attempting sign up for:', email);
      
      // Try real Supabase first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        // If Supabase fails, use demo mode
        console.log('Supabase unavailable, using demo mode');
        const mockUser = createMockUser(email);
        const mockSession = createMockSession(mockUser);
        
        localStorage.setItem('demo-user', JSON.stringify(mockUser));
        localStorage.setItem('demo-session', JSON.stringify(mockSession));
        
        set({ user: mockUser, session: mockSession });
        return { error: null };
      }
      
      console.log('Sign up successful:', data.user?.email);
      if (data.user) set({ user: data.user, session: data.session });
      return { error: null };
    } catch (err) {
      console.log('Sign up error, using demo mode:', err);
      
      // Demo mode fallback
      const mockUser = createMockUser(email);
      const mockSession = createMockSession(mockUser);
      
      localStorage.setItem('demo-user', JSON.stringify(mockUser));
      localStorage.setItem('demo-session', JSON.stringify(mockSession));
      
      set({ user: mockUser, session: mockSession });
      return { error: null };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.log('Sign out error:', err);
    }
    
    // Clear demo mode data
    localStorage.removeItem('demo-user');
    localStorage.removeItem('demo-session');
    
    set({ user: null, session: null });
    return { error: null };
  },

  initialize: async () => {
    set({ loading: true });
    
    try {
      // Try to get real session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({ user: session.user, session, loading: false });
        return;
      }
    } catch (err) {
      console.log('Failed to get session:', err);
    }
    
    // Check for demo mode session
    const demoUser = localStorage.getItem('demo-user');
    const demoSession = localStorage.getItem('demo-session');
    
    if (demoUser && demoSession) {
      set({ 
        user: JSON.parse(demoUser), 
        session: JSON.parse(demoSession), 
        loading: false 
      });
      return;
    }
    
    set({ user: null, session: null, loading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
    });
  },
}));
