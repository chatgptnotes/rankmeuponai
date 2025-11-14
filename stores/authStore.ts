import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setProfile: (profile) =>
    set({ profile }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
    });
  },

  refreshSession: async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });

      if (user) {
        get().fetchProfile();
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: Profile | null };

      set({ profile });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  },
}));

// Initialize auth state on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().refreshSession();

  // Listen for auth changes
  const supabase = createClient();
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setUser(session?.user ?? null);
    if (session?.user) {
      useAuthStore.getState().fetchProfile();
    } else {
      useAuthStore.getState().setProfile(null);
    }
  });
}
