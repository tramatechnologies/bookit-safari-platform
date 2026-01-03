import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Represents the current authentication state
 * @interface AuthState
 * @property {User|null} user - Current authenticated user or null
 * @property {Session|null} session - Current user session or null
 * @property {boolean} loading - Whether authentication state is being loaded
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Custom hook for managing authentication
 * Handles user sign in, sign up, sign out, and password reset
 * Automatically refreshes session and listens for auth state changes
 *
 * @hook useAuth
 * @returns {Object} Auth methods and state
 * @returns {User|null} user - Current authenticated user
 * @returns {Session|null} session - Current user session
 * @returns {boolean} loading - Loading state
 * @returns {Function} signIn - Sign in with email and password
 * @returns {Function} signUp - Create new account
 * @returns {Function} signOut - Sign out current user
 * @returns {Function} resetPassword - Request password reset email
 * @returns {Function} updateProfile - Update user profile data
 * @returns {Function} refreshSession - Manually refresh session
 *
 * @example
 * const { user, loading, signIn } = useAuth();
 * if (loading) return <div>Loading...</div>;
 * if (!user) return <div>Please sign in</div>;
 * return <div>Welcome {user.email}</div>;
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle user deletion or account disabled
      if (event === 'SIGNED_OUT') {
        // Clear local state when user is signed out or deleted
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      } else {
        // Update state with current session
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Use production URL for email redirects, fallback to current origin for local dev
    const redirectUrl = import.meta.env.PROD 
      ? 'https://bookitsafari.com/auth/verify?redirect=/dashboard'
      : `${window.location.origin}/auth/verify?redirect=/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    // Use production URL for email redirects, fallback to current origin for local dev
    const redirectUrl = import.meta.env.PROD 
      ? 'https://bookitsafari.com/auth/reset'
      : `${window.location.origin}/auth/reset`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
  };

  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return;
    }
    
    setAuthState({
      user: session?.user ?? null,
      session,
      loading: false,
    });
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
  };
};

