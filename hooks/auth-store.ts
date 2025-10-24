import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && !userError) {
            const mappedUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              avatar: userData.avatar || undefined,
              userType: userData.user_type,
              isOwner: userData.user_type === 'owner',
              isAdmin: userData.user_type === 'admin',
              isFinder: userData.user_type === 'renter',
              status: userData.status,
              createdAt: userData.created_at,
            };
            setUser(mappedUser);
          }
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          const mappedUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            avatar: userData.avatar || undefined,
            userType: userData.user_type,
            isOwner: userData.user_type === 'owner',
            isAdmin: userData.user_type === 'admin',
            isFinder: userData.user_type === 'renter',
            status: userData.status,
            createdAt: userData.created_at,
          };
          setUser(mappedUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.error('ERROR Login error:', authError);
        
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in. Check your inbox for the confirmation link.');
        } else {
          setError(authError.message || 'Invalid email or password');
        }
        return { success: false };
      }
      
      if (authData.user && !authData.user.email_confirmed_at) {
        console.log('Email not confirmed');
        setError('Please verify your email address before logging in. Check your inbox for the confirmation link.');
        await supabase.auth.signOut();
        return { success: false };
      }
      
      if (authData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (userError || !userData) {
          console.error('ERROR User data error:', JSON.stringify(userError, null, 2));
          console.error('ERROR User data error details:', {
            code: userError?.code,
            message: userError?.message,
            details: userError?.details,
            hint: userError?.hint,
          });
          setError(`Failed to load user data: ${userError?.message || 'Unknown error'}`);
          return { success: false };
        }
        
        const mappedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          avatar: userData.avatar || undefined,
          userType: userData.user_type,
          isOwner: userData.user_type === 'owner',
          isAdmin: userData.user_type === 'admin',
          isFinder: userData.user_type === 'renter',
          status: userData.status,
          createdAt: userData.created_at,
        };
        
        setUser(mappedUser);
        
        return { success: true, user: mappedUser };
      }
      
      setError('Login failed');
      return { success: false };
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData: Partial<User> & { password: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userData.email || !userData.password) {
        setError('Email and password are required');
        return false;
      }
      
      const trimmedEmail = userData.email.trim().toLowerCase();
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: userData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: userData.name || 'New User',
            phone: userData.phone || '',
            user_type: userData.userType || 'renter',
          },
        },
      });
      
      if (authError) {
        console.error('ERROR Signup error:', authError);
        setError(authError.message || 'Signup failed');
        return false;
      }
      
      if (authData.user) {
        console.log('User created successfully:', authData.user.id);
        console.log('Email confirmation required:', !authData.user.email_confirmed_at);
        
        await supabase.auth.signOut();
        
        return true;
      }
      
      setError('Signup failed');
      return false;
    } catch (err) {
      console.error('Signup error:', err);
      setError('Signup failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        setError('Logout failed');
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined,
      });
      
      if (resetError) {
        console.error('Password reset error:', resetError);
        setError(resetError.message || 'Failed to send reset email');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset email');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  }), [user, loading, error, login, signup, logout, resetPassword]);
});
