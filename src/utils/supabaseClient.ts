import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types/database.types'
import { debounce } from 'lodash'
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Ensure we have the required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing required environment variables for Supabase connection')
  console.error(`[Supabase] URL: ${supabaseUrl ? 'Available' : 'Missing'}, Key: ${supabaseAnonKey ? 'Available' : 'Missing'}`)
}

// Log environment info
const isProduction = typeof window !== 'undefined' && window.location.hostname === 'app.youredu.school'
console.log(`[Supabase] Environment: ${isProduction ? 'Production' : 'Development'}`)
console.log(`[Supabase] Supabase URL: ${supabaseUrl}`)

// Create a single instance of the Supabase client to be used throughout the app
export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'youredu_supabase_auth',
    storage: localStorage,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'youredu-web-app'
    }
  },
  db: {
    schema: 'public'
  }
})

// Connection state management
let isReconnecting = false
let lastReconnectAttempt = 0
const RECONNECT_COOLDOWN = 2000 // 2 seconds between reconnection attempts
const RECONNECT_DEBOUNCE = 500 // Debounce visibility changes by 500ms

/**
 * Check if the Supabase connection is working
 * This is a lightweight check that can be used to verify connectivity
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('[Supabase] Checking connection status')
    
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('[Supabase] Session error during connection check:', sessionError)
      return false
    }
    
    if (!session) {
      console.log('[Supabase] No active session found')
      return true // Return true for unauthenticated access
    }
    
    console.log('[Supabase] Session found, user ID:', session.user.id)
    
    // Try a simple query to verify connection
    const { error } = await supabase
      .from('account_profiles')
      .select('count')
      .limit(1)
      .single()
    
    if (error) {
      console.error('[Supabase] Connection check failed:', error)
      return false
    }
    
    console.log('[Supabase] Connection check successful')
    return true
  } catch (error) {
    console.error('[Supabase] Connection check failed:', error)
    return false
  }
}

/**
 * Helper function to get the appropriate redirect URL for the current environment
 */
export const getEnvironmentRedirectUrl = (path = '/auth/confirm'): string => {
  const baseUrl = isProduction
    ? 'https://app.youredu.school'
    : window.location.origin
  
  return `${baseUrl}${path}`
}

/**
 * Reconnect to Supabase after a connection loss or tab visibility change
 * This is a simplified approach that focuses on refreshing the session and
 * setting the auth token for realtime connections
 */
export const reconnectSupabase = async (force = false): Promise<boolean> => {
  // Prevent multiple simultaneous reconnection attempts
  const now = Date.now()
  if (isReconnecting && !force) {
    console.log('[Supabase] Already reconnecting, skipping duplicate attempt')
    return false
  }
  
  // Add cooldown between reconnection attempts
  if (!force && now - lastReconnectAttempt < RECONNECT_COOLDOWN) {
    console.log('[Supabase] Reconnection attempt too soon, skipping')
    return false
  }
  
  isReconnecting = true
  lastReconnectAttempt = now
  console.log('[Supabase] Attempting to reconnect at', new Date().toISOString())
  
  try {
    // Check localStorage first
    let localSession = null
    try {
      const storedSession = localStorage.getItem('supabase.auth.token')
      if (storedSession) {
        localSession = JSON.parse(storedSession)?.currentSession
      }
    } catch (e) {
      console.error('[Supabase] Error reading local session:', e)
    }

    // First refresh the session to ensure we have valid tokens
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('[Supabase] Session refresh failed during reconnect:', error)
      
      // If we have a local session and refresh failed, try to recover
      if (localSession?.access_token) {
        console.log('[Supabase] Attempting recovery with local session')
        supabase.realtime.setAuth(localSession.access_token)
        
        // Test the connection with a simple query
        const { error: testError } = await supabase
          .from('account_profiles')
          .select('count')
          .limit(1)
          .single()
        
        if (!testError) {
          console.log('[Supabase] Successfully recovered using local session')
          isReconnecting = false
          return true
        }
      }
      
      isReconnecting = false
      window.dispatchEvent(new CustomEvent('supabase-offline', { 
        detail: { error, timestamp: Date.now() } 
      }))
      return false
    }
    
    // Get the access token
    const accessToken = data?.session?.access_token
    
    if (!accessToken) {
      console.error('[Supabase] No access token available after refresh')
      isReconnecting = false
      window.dispatchEvent(new CustomEvent('supabase-offline', { 
        detail: { error: new Error('No access token'), timestamp: Date.now() } 
      }))
      return false
    }
    
    // Set the auth token for realtime
    supabase.realtime.setAuth(accessToken)
    
    // Remove all existing channels to start fresh
    removeAllChannels()
    
    // Test the connection with a simple query
    const { error: testError } = await supabase
      .from('account_profiles')
      .select('count')
      .limit(1)
      .single()
    
    if (testError) {
      console.error('[Supabase] Connection test failed after reconnect:', testError)
      isReconnecting = false
      window.dispatchEvent(new CustomEvent('supabase-offline', { 
        detail: { error: testError, timestamp: Date.now() } 
      }))
      return false
    }
    
    // Dispatch success event
    window.dispatchEvent(new CustomEvent('supabase-reconnected', { 
      detail: { 
        timestamp: Date.now(),
        userId: data.session?.user?.id || 'unknown',
        sessionExpiry: data.session?.expires_at 
          ? new Date(data.session.expires_at * 1000).toISOString()
          : 'unknown'
      } 
    }))
    
    console.log('[Supabase] Reconnection complete at', new Date().toISOString())
    isReconnecting = false
    return true
  } catch (error) {
    console.error('[Supabase] Error during reconnection:', error)
    isReconnecting = false
    window.dispatchEvent(new CustomEvent('supabase-offline', { 
      detail: { error, timestamp: Date.now() } 
    }))
    return false
  }
}

/**
 * Remove all realtime channels
 */
export const removeAllChannels = () => {
  try {
    if (typeof supabase.removeAllChannels === 'function') {
      // Use the built-in method if available
      supabase.removeAllChannels()
    } else {
      // Manually unsubscribe from all channels
      const channels = supabase.getChannels()
      for (const channel of channels) {
        channel.unsubscribe()
      }
    }
  } catch (error) {
    console.error('[Supabase] Error removing channels:', error)
  }
}

/**
 * Create a new realtime channel for the given user
 */
export const createRealtimeChannel = (userId: string) => {
  if (!userId) {
    console.log('[Supabase] No user ID provided for realtime channel')
    return null
  }
  
  try {
    // Create a new channel with a unique ID
    const channelId = `${userId}-${Date.now()}`
    console.log(`[Supabase] Creating new channel with ID: ${channelId}`)
    
    const channel = supabase.channel(channelId)
    
    // Set up presence
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('[Supabase] Presence sync event received')
      })
      
      // Subscribe to todos changes
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'todos' 
      }, (payload) => {
        console.log('[Supabase] Todos change received:', payload)
        window.dispatchEvent(new CustomEvent('todos-updated', { detail: payload }))
      })
      
      // Subscribe to account_profiles changes
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'account_profiles' 
      }, (payload) => {
        console.log('[Supabase] Account profiles change received:', payload)
        window.dispatchEvent(new CustomEvent('profiles-updated', { detail: payload }))
      })
      
      // Subscribe to cart_items changes
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cart_items' 
      }, (payload) => {
        console.log('[Supabase] Cart items change received:', payload)
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: payload }))
      })
    
    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log(`[Supabase] Channel subscription status: ${status}`)
      
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase] Successfully subscribed to channel')
        window.dispatchEvent(new CustomEvent('supabase-channel-ready', { 
          detail: { channelId, timestamp: Date.now() } 
        }))
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Supabase] Error subscribing to channel')
        window.dispatchEvent(new CustomEvent('supabase-channel-error', { 
          detail: { channelId, timestamp: Date.now() } 
        }))
      }
    })
    
    return channel
  } catch (error) {
    console.error('[Supabase] Error creating realtime channel:', error)
    return null
  }
}

// Debounced version of reconnect to prevent multiple calls
export const debouncedReconnect = debounce(async () => {
  await reconnectSupabase()
}, RECONNECT_DEBOUNCE)

// Set up event listeners for tab visibility changes
if (typeof window !== 'undefined') {
  // Handle tab visibility changes
  document.addEventListener('visibilitychange', async () => {
    const isVisible = document.visibilityState === 'visible'
    const timestamp = new Date().toISOString()
    
    console.log(`[Supabase] Tab visibility changed to ${isVisible ? 'visible' : 'hidden'} at ${timestamp}`)
    
    if (isVisible) {
      // Check if we need to reconnect by checking the session
      try {
        // First check localStorage for existing session
        let hasLocalSession = false
        try {
          const storedSession = localStorage.getItem('supabase.auth.token')
          hasLocalSession = !!storedSession && JSON.parse(storedSession)?.currentSession?.user
        } catch (e) {
          console.error('[Supabase] Error checking local session:', e)
        }

        // If we have a local session, attempt reconnection
        if (hasLocalSession) {
          console.log('[Supabase] Found local session, attempting reconnection')
          await debouncedReconnect()
          return
        }

        // Otherwise check current session
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          console.log('[Supabase] Session exists, attempting reconnection')
          await debouncedReconnect()
        } else {
          console.log('[Supabase] No session found, dispatching auth error event')
          window.dispatchEvent(new CustomEvent('supabase-auth-error', { 
            detail: { reason: 'no-session', timestamp: Date.now() } 
          }))
        }
      } catch (error) {
        console.error('[Supabase] Error during visibility change session check:', error)
        // Dispatch auth error event
        window.dispatchEvent(new CustomEvent('supabase-auth-error', { 
          detail: { error, timestamp: Date.now() } 
        }))
      }
    } else {
      console.log('[Supabase] Tab became hidden, no action needed')
    }
  })
  
  // Handle online/offline events
  window.addEventListener('online', async () => {
    console.log('[Supabase] Browser went online at', new Date().toISOString())
    debouncedReconnect()
  })

  window.addEventListener('offline', () => {
    console.log('[Supabase] Browser went offline at', new Date().toISOString())
    window.dispatchEvent(new CustomEvent('supabase-offline', { 
      detail: { reason: 'browser-offline', timestamp: Date.now() } 
    }))
  })
}

// Export the Supabase client as default
export default supabase 