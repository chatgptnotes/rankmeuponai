/**
 * Session management utilities
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Get current session (client-side)
 */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user (client-side)
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session (server-side)
 */
export async function getServerSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user (server-side)
 */
export async function getServerUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Refresh session
 */
export async function refreshSession() {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }

  return session;
}

/**
 * Check if user is authenticated (client-side)
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isServerAuthenticated() {
  const session = await getServerSession();
  return !!session;
}

/**
 * Sign out and clear session
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Get session expiration time
 */
export async function getSessionExpiration() {
  const session = await getSession();
  if (!session) return null;

  return new Date(session.expires_at! * 1000);
}

/**
 * Check if session is expiring soon (within 5 minutes)
 */
export async function isSessionExpiringSoon() {
  const expiration = await getSessionExpiration();
  if (!expiration) return false;

  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  return expiration <= fiveMinutesFromNow;
}

/**
 * Auto-refresh session if expiring soon
 */
export async function autoRefreshSession() {
  const isExpiring = await isSessionExpiringSoon();

  if (isExpiring) {
    return await refreshSession();
  }

  return await getSession();
}

/**
 * Set up session auto-refresh interval (call this once on app initialization)
 */
export function setupSessionAutoRefresh(intervalMinutes: number = 10) {
  if (typeof window === 'undefined') return;

  const interval = setInterval(async () => {
    await autoRefreshSession();
  }, intervalMinutes * 60 * 1000);

  return () => clearInterval(interval);
}
