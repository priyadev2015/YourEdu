import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase, reconnectSupabase, createRealtimeChannel } from './supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'
import { initPostHog, resetPostHog, identifyUser, startRecording, stopRecording } from './posthogClient'
import { Box, CircularProgress, Typography } from '@mui/material'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const authInitialized = useRef(false)
  const posthogInitialized = useRef(false)
  const initialAuthCheckComplete = useRef(false)
  const currentChannel = useRef(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true)
        console.log('[Auth] Checking for existing session')
        
        // Reduce timeout to 5 seconds and add better error handling
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        })

        // Try to get session from localStorage first as fallback
        let fallbackSession = null
        try {
          console.log('[Auth] Checking for fallback session in localStorage')
          const storedSession = localStorage.getItem('supabase.auth.token')
          if (storedSession) {
            fallbackSession = JSON.parse(storedSession)?.currentSession
            console.log('[Auth] Found fallback session:', fallbackSession ? 'yes' : 'no')
          }
        } catch (e) {
          console.error('[Auth] Error reading fallback session:', e)
        }

        // Add timestamp for performance tracking
        const startTime = Date.now()
        console.log('[Auth] Starting Supabase session check at:', new Date(startTime).toISOString())
        
        const sessionPromise = supabase.auth.getSession()
        const { data, error } = await Promise.race([timeoutPromise, sessionPromise])
        
        const endTime = Date.now()
        console.log('[Auth] Session check completed in:', endTime - startTime, 'ms')
        
        if (error) {
          console.error('[Auth] Error getting session:', error)
          // If we have a fallback session and the error was a timeout, use the fallback
          if (error.message === 'Auth check timeout' && fallbackSession?.user) {
            console.log('[Auth] Using fallback session after timeout')
            setUser(fallbackSession.user)
            setupRealtimeConnection(fallbackSession.user.id)
            setLoading(false)
            return
          }
          throw error
        }

        if (data?.session) {
          console.log('[Auth] Found existing session, user:', data.session.user.id)
          setUser(data.session.user)
          setupRealtimeConnection(data.session.user.id)
          
          // Initialize PostHog and identify user
          try {
            await initPostHog(data.session.user)
          } catch (analyticsError) {
            console.error('[Auth] Error initializing PostHog:', analyticsError)
          }
        } else {
          console.log('[Auth] No session found')
          setUser(null)
          
          // Initialize PostHog without user
          try {
            await initPostHog(null)
          } catch (analyticsError) {
            console.error('[Auth] Error initializing PostHog:', analyticsError)
          }
        }
      } catch (error) {
        console.error('[Auth] Error in checkUser:', error)
        setUser(null)
      } finally {
        setLoading(false)
        initialAuthCheckComplete.current = true
      }
    }
    
    checkUser()
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Auth state changed: ${event}`)
      
      // Reset loading state for relevant auth events
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
        setLoading(false)
      }
      
      if (event === 'SIGNED_IN' && session) {
        console.log('[Auth] User signed in:', session.user.id)
        setUser(session.user)
        
        // Set up real-time connection for newly authenticated user
        setupRealtimeConnection(session.user.id)
        
        // Identify user in PostHog
        try {
          console.log('[Auth] Identifying newly signed in user in PostHog')
          await identifyUser(session.user)
        } catch (analyticsError) {
          console.error('[Auth] Error identifying user in PostHog:', analyticsError)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out')
        setUser(null)
        
        // Clean up real-time connection
        cleanupRealtimeConnection()
        
        // Reset PostHog
        try {
          console.log('[Auth] Resetting PostHog for signed out user')
          resetPostHog()
        } catch (analyticsError) {
          console.error('[Auth] Error resetting PostHog:', analyticsError)
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('[Auth] Token refreshed for user:', session.user.id)
        setUser(session.user)
        
        // Reconnect to ensure we have fresh tokens for realtime
        await reconnectSupabase()
      }
    })

    // Add visibility change handler
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('[Auth] Tab became visible, checking session')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!error && session) {
          setUser(session.user)
          await reconnectSupabase(true)
        } else if (!error && !session) {
          setUser(null)
        }
        
        setLoading(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      console.log('[Auth] Cleaning up auth listener and visibility handler')
      authListener?.subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Set up real-time connection
  const setupRealtimeConnection = (userId) => {
    if (!userId) {
      console.log('[Auth] No user ID provided for real-time connection')
      return
    }
    
    // Clean up any existing channel first
    cleanupRealtimeConnection()
    
    // Create a new channel
    const channel = createRealtimeChannel(userId)
    if (channel) {
      currentChannel.current = channel
    }
  }
  
  // Clean up real-time connection
  const cleanupRealtimeConnection = () => {
    if (currentChannel.current) {
      try {
        currentChannel.current.unsubscribe()
        console.log('[Auth] Unsubscribed from channel')
      } catch (error) {
        console.error('[Auth] Error unsubscribing from channel:', error)
      }
      currentChannel.current = null
    }
  }

  // Helper function to clear all auth-related data
  const clearAuthData = () => {
    console.log('🧹 Clearing all auth-related data')
    
    // Clear localStorage items
    const authKeys = [
      'userType',
      'selectedStudent',
      'lastViewedCourse',
      'lastViewedSection',
      'youredu_supabase_auth',
      'supabase-auth',
      'supabase.auth.token',
      'lastActiveTime',
      'isPilotUser',
      'onboardingProgress',
      'onboardingHidden',
      'navbarCollapsed'
    ]
    
    authKeys.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error(`Error removing ${key} from localStorage:`, e)
      }
    })
    
    // Clear sessionStorage items
    try {
      sessionStorage.clear()
    } catch (e) {
      console.error('Error clearing sessionStorage:', e)
    }
    
    // Clear any cookies related to auth
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=')
      if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
  }

  const login = async (email, password) => {
    try {
      console.log('🔵 Attempting login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      if (!data?.user) {
        console.error('❌ No user data returned from login');
        throw new Error('No user data returned');
      }

      console.log('✅ Auth successful, user:', data.user.id);
      console.log('🔵 Current userType:', localStorage.getItem('userType'));

      // Check profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, email')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error fetching user profile:', profileError);
      }

      // If no profile in profiles table, check account_profiles
      if (!profileData) {
        console.log('🔵 No profile found in profiles table, checking account_profiles...');
        const { data: accountProfileData, error: accountProfileError } = await supabase
          .from('account_profiles')
          .select('account_type, email')
          .eq('id', data.user.id)
          .single();

        if (accountProfileError && accountProfileError.code !== 'PGRST116') {
          console.error('❌ Error fetching account profile:', accountProfileError);
        }

        // If no profile exists in either table, create one
        if (!accountProfileData) {
          console.log('🔵 No profile found in either table, creating new profile...');
          const userType = localStorage.getItem('userType') || 'parent';
          
          // Create profile in both tables to ensure consistency
          const profilePromises = [
            supabase.from('profiles').upsert({
              id: data.user.id,
              email: email,
              user_type: userType,
              created_at: new Date(),
              updated_at: new Date()
            }),
            supabase.from('account_profiles').upsert({
              id: data.user.id,
              email: email,
              account_type: userType,
              created_at: new Date(),
              updated_at: new Date()
            })
          ];

          try {
            await Promise.all(profilePromises);
            console.log('✅ Created new profiles successfully');
          } catch (createError) {
            console.error('❌ Error creating profiles:', createError);
          }
        }
      }

      // Set up realtime connection
      setupRealtimeConnection(data.user.id);

      // Update user state
      setUser(data.user);
      return data.user;

    } catch (error) {
      console.error('❌ Login process failed:', error);
      throw error;
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      console.log('🔵 Starting registration process for:', email);
      const fullName = `${firstName} ${lastName}`.trim();
      const userType = localStorage.getItem('userType') || 'parent';
      
      console.log(`🔵 Registering user with type: ${userType}`);

      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: fullName,
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
          },
        },
      });

      if (authError) {
        console.error('❌ Auth error during signup:', authError);
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('✅ User created successfully:', authData.user.id);

      // Create profiles in both tables
      const profileData = {
        id: authData.user.id,
        email: email,
        name: fullName,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Create in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          ...profileData,
          user_type: userType
        });

      if (profileError) {
        console.error('❌ Error creating profile in profiles table:', profileError);
      }

      // Create in account_profiles table
      const { error: accountProfileError } = await supabase
        .from('account_profiles')
        .upsert({
          ...profileData,
          account_type: userType
        });

      if (accountProfileError) {
        console.error('❌ Error creating profile in account_profiles table:', accountProfileError);
      }

      // Return the user and a flag indicating email confirmation is needed
      return {
        user: authData.user,
        needsEmailConfirmation: true
      };

    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔵 Starting logout process...')
      
      // First stop recording and reset analytics
      console.log('🔵 Stopping PostHog session recording...')
      stopRecording();
      
      console.log('🔵 Resetting PostHog...')
      resetPostHog();
      
      // Explicitly reset with device ID to ensure complete reset
      try {
        if (window.posthog && typeof window.posthog.reset === 'function') {
          window.posthog.reset(true); // true = also reset device ID
          console.log('✅ PostHog reset with device ID reset');
        }
      } catch (resetError) {
        console.error('❌ Error during PostHog reset with device ID:', resetError);
      }
      
      // Clean up real-time connection
      cleanupRealtimeConnection()
      
      // Clear all auth-related data
      clearAuthData()
      
      // Clear user state
      setUser(null)
      
      // Sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        if (error) {
          console.error('❌ Supabase signOut error:', error)
        } else {
          console.log('✅ User successfully logged out from Supabase')
        }
      } catch (signOutError) {
        console.error('❌ Error during Supabase signOut:', signOutError)
      }
      
      // Force a complete page reload to clear all state
      console.log('🔄 Forcing page reload to complete logout')
      setTimeout(() => {
        window.location.replace('/login-selection')
      }, 100)
      
      return true
    } catch (error) {
      console.error('❌ Logout error:', error)
      
      // Even if there's an error, try to force logout
      clearAuthData()
      console.log('🔄 Forcing page reload despite error')
      setTimeout(() => {
        window.location.replace('/login-selection')
      }, 100)
      
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('🔵 Starting Google sign-in process...')
      console.log('Current origin:', window.location.origin)
      console.log('Current hostname:', window.location.hostname)
      
      // Determine the correct redirect URL based on the environment
      const isProduction = window.location.hostname === 'app.youredu.school';
      const redirectUrl = isProduction 
        ? 'https://app.youredu.school/auth/callback'
        : `${window.location.origin}/auth/callback`;
      
      // Force the site URL to match the current environment
      const siteUrl = isProduction 
        ? 'https://app.youredu.school'
        : window.location.origin;
      
      console.log('Using redirect URL:', redirectUrl);
      console.log('Using site URL:', siteUrl);
      
      // First, get the user's email from Google without signing them in
      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
          skipBrowserRedirect: true, // Don't redirect yet
        },
      })
      
      if (authError) {
        console.error('❌ Google auth error:', authError)
        throw authError
      }
      
      // Redirect to Google for authentication
      if (authData?.url) {
        console.log('OAuth URL:', authData.url)
        
        // If in production, ensure the state parameter has the correct site_url
        if (isProduction) {
          try {
            // Extract the state parameter from the URL
            const url = new URL(authData.url);
            const stateParam = url.searchParams.get('state');
            
            if (stateParam) {
              // Decode the state parameter
              const stateObj = JSON.parse(atob(stateParam.split('.')[1]));
              
              // Check if site_url is localhost
              if (stateObj.site_url && stateObj.site_url.includes('localhost')) {
                console.log('⚠️ Found localhost in state parameter, redirecting to production URL');
                // Redirect to the production login page instead
                window.location.href = 'https://app.youredu.school/login';
                return null;
              }
            }
          } catch (e) {
            console.error('Error parsing state parameter:', e);
            // Continue with normal flow if parsing fails
          }
        }
        
        window.location.href = authData.url
      }
      
      return authData
    } catch (error) {
      console.error('❌ Google sign-in error:', error)
      throw error
    }
  }

  const handleGoogleSignup = async () => {
    try {
      console.log('🔵 Starting Google signup process...')
      console.log('Current userType:', localStorage.getItem('userType'))
      console.log('Current origin:', window.location.origin)
      console.log('Current hostname:', window.location.hostname)
      
      // Determine the correct redirect URL based on the environment
      const isProduction = window.location.hostname === 'app.youredu.school';
      const redirectUrl = isProduction 
        ? 'https://app.youredu.school/auth/callback'
        : `${window.location.origin}/auth/callback`;
      
      // Force the site URL to match the current environment
      const siteUrl = isProduction 
        ? 'https://app.youredu.school'
        : window.location.origin;
      
      console.log('Using redirect URL:', redirectUrl);
      console.log('Using site URL:', siteUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile',
          data: {
            user_type: localStorage.getItem('userType') || 'parent',
            is_new_user: true, // Flag to indicate this is a new user signup
          },
        },
      })

      if (error) {
        console.error('❌ Google signup error:', error)
        throw error
      }

      // Log the OAuth URL for debugging
      console.log('✅ Google signup initiated successfully')
      console.log('OAuth URL:', data?.url)
      
      // If in production, ensure the state parameter has the correct site_url
      if (isProduction && data?.url) {
        try {
          // Extract the state parameter from the URL
          const url = new URL(data.url);
          const stateParam = url.searchParams.get('state');
          
          if (stateParam) {
            // Decode the state parameter
            const stateObj = JSON.parse(atob(stateParam.split('.')[1]));
            
            // Check if site_url is localhost
            if (stateObj.site_url && stateObj.site_url.includes('localhost')) {
              console.log('⚠️ Found localhost in state parameter, redirecting to production URL');
              // Redirect to the production login page instead
              window.location.href = 'https://app.youredu.school/login';
              return null;
            }
          }
        } catch (e) {
          console.error('Error parsing state parameter:', e);
          // Continue with normal flow if parsing fails
        }
      }
      
      // Redirect to Google for authentication
      if (data?.url) {
        window.location.href = data.url
      }

      return data
    } catch (error) {
      console.error('❌ Google signup error:', error)
      throw error
    }
  }

  // Prevent rendering until initial auth check is complete
  if (loading) {
    console.log('[Auth] Still loading, showing spinner');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log('[Auth] Rendering auth provider children, user:', user ? 'present' : 'null');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        signInWithGoogle,
        handleGoogleSignup,
        clearAuthData
      }}
    >
      {!initialAuthCheckComplete.current ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Box>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export default AuthProvider