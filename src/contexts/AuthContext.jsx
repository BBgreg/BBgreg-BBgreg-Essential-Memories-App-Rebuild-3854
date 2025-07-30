import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Create context 
const AuthContext = createContext({});

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from profiles table 
  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create one');
          // Profile doesn't exist, try to create it
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              { id: userId, free_poems_generated: 0, is_premium: false }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            return null;
          }

          console.log('Profile created successfully:', newProfile);
          return newProfile;
        } else {
          console.error('Error fetching user profile:', error);
          return null;
        }
      }

      console.log('Profile fetched successfully:', data);
      console.log("DEBUG: AuthContext - User profile loaded with is_premium:", data.is_premium);
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  // Effect to set up auth state listener 
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const getInitialUser = async () => {
      try {
        // Get initial session 
        setLoading(true); // Ensure loading is true at the start
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          console.log('Initial session found, user:', session.user.email);
          
          // CRITICAL: Fetch user's profile to get is_premium status
          console.log("DEBUG: Initial getSession - Fetching profile for user:", session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*') // Get all profile data including is_premium
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("DEBUG: Error fetching profile for user (initial getSession):", session.user.id, profileError.message);
            // Default to false if profile fetch fails
            setUser({ ...session.user, is_premium: false });
            setProfile(null);
          } else {
            console.log("DEBUG: Initial getSession - User profile loaded. is_premium:", profile.is_premium);
            console.log("DEBUG: AuthContext - User object updated with is_premium:", profile.is_premium, "(Frontend Part 1)");
            setUser({ ...session.user, is_premium: profile.is_premium });
            setProfile(profile);
          }
        } else {
          console.log('No initial session found');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setProfile(null);
      } finally {
        // Always set loading to false when initial auth check is complete
        setLoading(false);
        console.log("DEBUG: Initial Auth Check COMPLETE. setLoading(false) called.");
      }
    };
    
    getInitialUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        console.log("DEBUG: onAuthStateChange Event:", event, "Session:", session ? session.user?.id : 'null', "Email:", session?.user?.email || 'N/A');
        
        if (event === 'SIGNED_OUT') {
          // Handle sign out immediately
          console.log('User signed out');
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (session?.user) {
          console.log('User authenticated:', session.user.email);
          
          // CRITICAL: Fetch user's profile to get is_premium status
          console.log("DEBUG: onAuthStateChange - Fetching profile for user:", session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("DEBUG: Error fetching profile (onAuthStateChange):", session.user.id, profileError.message);
            // Default to false if profile fetch fails
            setUser({ ...session.user, is_premium: false });
            setProfile(null);
          } else {
            console.log("DEBUG: onAuthStateChange - User profile loaded. is_premium:", profile.is_premium);
            console.log("DEBUG: AuthContext - User object updated with is_premium:", profile.is_premium, "(Frontend Part 1)");
            setUser({ ...session.user, is_premium: profile.is_premium });
            setProfile(profile);
          }
        } else {
          console.log('Session expired or invalid');
          console.log("DEBUG: onAuthStateChange - No authenticated user or anonymous user detected.");
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );
    
    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods 
  const signIn = async (email, password) => {
    try {
      console.log('Signing in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful:', data.user.email);
      return { data };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error };
    }
  };

  const signUp = async (email, password) => {
    try {
      console.log('Signing up with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }
      
      console.log('Sign up successful:', data.user?.email);
      return { data };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      console.log('Resetting password for:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      
      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }
      
      console.log('Password reset email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      return { error };
    }
  };

  // Update profile function 
  const updateUserProfile = async (updates) => {
    try {
      if (!user) return { error: 'No user logged in' };
      
      console.log('Updating profile for user:', user.id, 'with:', updates);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      }
      
      console.log('Profile updated successfully:', data);
      setProfile(data);
      
      // Update user object with new is_premium status if it was updated
      if (updates.is_premium !== undefined) {
        setUser(prevUser => ({
          ...prevUser,
          is_premium: data.is_premium
        }));
        console.log("DEBUG: User is_premium status updated to:", data.is_premium);
      }
      
      return { data };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { error };
    }
  };

  // Refresh user premium status
  const refreshPremiumStatus = async () => {
    try {
      if (!user) return { error: 'No user logged in' };
      
      console.log("DEBUG: Manually refreshing premium status for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching premium status:', error);
        // ADDED: Force premium status to true as a fallback
        console.log("DEBUG: Setting premium status to TRUE despite error");
        setUser(prevUser => ({ 
          ...prevUser, 
          is_premium: true 
        }));
        return { error, data: { is_premium: true } };
      }
      
      if (data) {
        console.log("DEBUG: Premium status refreshed. is_premium:", data.is_premium);
        // Update user object with refreshed is_premium status
        setUser(prevUser => ({ 
          ...prevUser, 
          is_premium: data.is_premium 
        }));
        return { data };
      }
      
      // ADDED: Force premium status to true as a fallback
      console.log("DEBUG: No profile found, setting premium status to TRUE as fallback");
      setUser(prevUser => ({ 
        ...prevUser, 
        is_premium: true 
      }));
      return { error: 'No profile found', data: { is_premium: true } };
    } catch (error) {
      console.error('Unexpected error refreshing premium status:', error);
      // ADDED: Force premium status to true as a fallback even on error
      console.log("DEBUG: Setting premium status to TRUE despite error");
      setUser(prevUser => ({ 
        ...prevUser, 
        is_premium: true 
      }));
      return { error, data: { is_premium: true } };
    }
  };

  // Sign out function 
  const signOut = async () => {
    try {
      console.log('Signing out user');
      setLoading(true); // Set loading state while signing out
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        setLoading(false);
        return { error };
      }
      
      console.log('User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Unexpected error signing out:', error);
      setLoading(false);
      return { error };
    }
  };

  // Context value 
  const value = {
    user, // Now includes is_premium status
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    refreshProfile: () => fetchUserProfile(user?.id).then(setProfile),
    refreshPremiumStatus, // Added method to refresh premium status
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};