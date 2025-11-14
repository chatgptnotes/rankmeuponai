import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAuthErrorMessage } from '@/lib/auth/errors';
import type { Profile } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, profile, isLoading, isAuthenticated, signOut } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return { success: false, error };
      }

      if (data.user) {
        toast.success('Welcome back!');
        router.push('/dashboard');
        router.refresh();
        return { success: true, user: data.user };
      }

      return { success: false };
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      return { success: false, error };
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return { success: false, error };
      }

      if (data.user) {
        toast.success('Account created! Please check your email to verify your account.');
        router.push('/verify-email');
        return { success: true, user: data.user };
      }

      return { success: false };
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return { success: false, error };
      }

      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      return { success: false, error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return { success: false, error };
      }

      toast.success('Password updated successfully!');
      return { success: true };
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      return { success: false, error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update(updates as never)
        .eq('id', user.id);

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return { success: false, error };
      }

      toast.success('Profile updated successfully!');
      useAuthStore.getState().fetchProfile();
      return { success: true };
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
      return { success: false, error };
    }
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
  };
}
