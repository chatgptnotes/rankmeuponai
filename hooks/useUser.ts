import { useAuthStore } from '@/stores/authStore';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

/**
 * Custom hook to access current user data
 */
export function useUser(): {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  email: string | undefined;
  fullName: string | undefined;
  avatarUrl: string | undefined;
  userId: string | undefined;
} {
  const { user, profile, isLoading, isAuthenticated } = useAuthStore();

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    email: user?.email,
    fullName: profile?.full_name || user?.user_metadata?.full_name,
    avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url,
    userId: user?.id,
  };
}
