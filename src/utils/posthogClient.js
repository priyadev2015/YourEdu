import posthog from 'posthog-js';

// Track initialization state
let isInitialized = false;
let identifiedUserId = null;

// Helper function to determine if we're in production
export const isProduction = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'app.youredu.school' || hostname.endsWith('youredu.school') || hostname.includes('vercel.app');
};

// Check if PostHog is available and initialized
export const isPostHogAvailable = () => {
  return window.posthog && (window.posthog._loaded || typeof window.posthog.capture === 'function');
};

// Wait for PostHog to be initialized
export const waitForPostHog = () => {
  return new Promise((resolve) => {
    if (window.posthogInitialized || isPostHogAvailable()) {
      resolve();
      return;
    }

    // Listen for the initialization event
    window.addEventListener('posthog_initialized', () => {
      resolve();
    }, { once: true });

    // Fallback timeout after 5 seconds
    setTimeout(() => {
      if (!window.posthogInitialized && !isPostHogAvailable()) {
        console.warn('[PostHog] Timed out waiting for PostHog initialization');
      }
      resolve();
    }, 5000);
  });
};

// Initialize PostHog with proper configuration
export const initPostHog = async (user = null) => {
  try {
    // If already initialized, just identify the user if provided
    if (isInitialized) {
      console.log('[PostHog] PostHog already initialized');
      if (user) {
        await identifyUser(user);
      }
      return;
    }

    console.log('[PostHog] Checking PostHog initialization status');
    
    // If we're in development, don't try to use PostHog
    if (!isProduction()) {
      console.log('[PostHog] Development environment detected, skipping PostHog operations');
      isInitialized = true;
      return;
    }
    
    // Wait for PostHog to be available (initialized by HTML snippet)
    await waitForPostHog();
    
    // Check if PostHog is available
    if (isPostHogAvailable()) {
      console.log('[PostHog] PostHog initialized and available');
      isInitialized = true;
      
      // If we have a user, identify them
      if (user) {
        await identifyUser(user);
      }
      
      return;
    }
    
    // If PostHog is not available after waiting, log a warning
    console.warn('[PostHog] PostHog not initialized by HTML snippet. This is unexpected.');
    console.warn('[PostHog] Please check that the PostHog snippet is properly included in index.html');
  } catch (error) {
    console.error('[PostHog] Critical error in PostHog initialization check:', error);
  }
};

// Reset PostHog for logout
export const resetPostHog = () => {
  try {
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot reset - PostHog not initialized');
      return;
    }
    
    console.log('[PostHog] Resetting PostHog');
    
    // Stop recording if it's active
    if (isRecording()) {
      stopRecording();
    }
    
    // Reset the user
    if (typeof window.posthog.reset === 'function') {
      window.posthog.reset(true); // true = also reset device ID
      console.log('[PostHog] PostHog reset complete');
      
      // Clear our tracking of identified user
      identifiedUserId = null;
    } else {
      console.warn('[PostHog] reset function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error resetting PostHog:', error);
  }
};

// Identify user for analytics with enhanced properties
export const identifyUser = async (user) => {
  try {
    // Check if user is provided
    if (!user || !user.id) {
      console.warn('[PostHog] Cannot identify user - Invalid user object');
      return;
    }
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot identify user - PostHog not initialized');
      return;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log('[PostHog] Not identifying user in development environment');
      return;
    }
    
    // If we've already identified this user, don't do it again
    if (identifiedUserId === user.id) {
      console.log('[PostHog] User already identified:', user.id);
      return;
    }
    
    console.log('[PostHog] Identifying user:', user.id);
    
    // Get additional user properties from Supabase if available
    let enhancedProperties = {
      email: user.email || '',
      name: user.email || '', // Set email as name for display purposes
      display_name: user.email || '', // Explicitly set display name as email
      full_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email || '',
      id: user.id,
      created_at: user.created_at || new Date().toISOString(),
      role: user.user_metadata?.role || 'user',
      user_type: user.user_metadata?.user_type || localStorage.getItem('userType') || 'unknown',
      last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
      provider: user.app_metadata?.provider || 'email',
      is_confirmed: user.email_confirmed_at ? true : false,
      is_anonymous: false,
    };
    
    // Add profile data if available
    if (user.profile) {
      enhancedProperties = {
        ...enhancedProperties,
        first_name: user.profile.first_name || '',
        last_name: user.profile.last_name || '',
        profile_id: user.profile.id || '',
        profile_user_type: user.profile.user_type || '',
        // If we have profile data, use it for display name
        display_name: user.profile.first_name && user.profile.last_name ? 
          `${user.profile.first_name} ${user.profile.last_name}` : user.email,
        name: user.profile.first_name && user.profile.last_name ? 
          `${user.profile.first_name} ${user.profile.last_name}` : user.email,
      };
    }
    
    // Try to get additional profile data from localStorage or other sources
    try {
      const userType = localStorage.getItem('userType');
      if (userType) {
        enhancedProperties.user_type = userType;
      }
      
      // Add any other relevant properties from localStorage
      const isPilotUser = localStorage.getItem('isPilotUser');
      if (isPilotUser) {
        enhancedProperties.is_pilot_user = isPilotUser === 'true';
      }
    } catch (e) {
      console.warn('[PostHog] Error getting additional properties from localStorage:', e);
    }
    
    // Identify the user with enhanced properties
    if (typeof window.posthog.identify === 'function') {
      // First set the person properties to ensure display name is set
      if (typeof window.posthog.setPersonProperties === 'function') {
        window.posthog.setPersonProperties(enhancedProperties);
        console.log('[PostHog] Person properties set successfully');
      }
      
      // Then identify the user
      window.posthog.identify(user.id, enhancedProperties);
      console.log('[PostHog] User identified successfully with enhanced properties');
      
      // Track that we've identified this user
      identifiedUserId = user.id;
      
      // After identifying, check if we need to start recording
      setTimeout(() => {
        if (!isRecording()) {
          console.log('[PostHog] Starting recording after user identification');
          startRecording();
        }
      }, 500);
    } else {
      console.warn('[PostHog] identify function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error identifying user:', error);
  }
};

// Track custom event
export const trackEvent = (eventName, properties = {}) => {
  try {
    // Check if event name is provided
    if (!eventName) {
      console.warn('[PostHog] Cannot track event - No event name provided');
      return;
    }
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot track event - PostHog not initialized');
      return;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log(`[PostHog] Not tracking event "${eventName}" in development environment`);
      return;
    }
    
    console.log(`[PostHog] Tracking event: ${eventName}`, properties);
    
    // Track the event
    if (typeof window.posthog.capture === 'function') {
      window.posthog.capture(eventName, {
        ...properties,
        environment: 'production'
      });
      console.log(`[PostHog] Event "${eventName}" tracked successfully`);
    } else {
      console.warn('[PostHog] capture function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error tracking event:', error);
  }
};

// Track page view
export const trackPageView = (pageName, properties = {}) => {
  try {
    // Check if page name is provided
    if (!pageName) {
      console.warn('[PostHog] Cannot track page view - No page name provided');
      return;
    }
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot track page view - PostHog not initialized');
      return;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log(`[PostHog] Not tracking page view "${pageName}" in development environment`);
      return;
    }
    
    console.log(`[PostHog] Tracking page view: ${pageName}`, properties);
    
    // Track the page view
    if (typeof window.posthog.capture === 'function') {
      window.posthog.capture('$pageview', {
        $current_url: window.location.href,
        page_name: pageName,
        ...properties,
        environment: 'production'
      });
      console.log(`[PostHog] Page view "${pageName}" tracked successfully`);
    } else {
      console.warn('[PostHog] capture function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error tracking page view:', error);
  }
};

// Track feature usage
export const trackFeatureUsage = (featureName, properties = {}) => {
  try {
    // Check if feature name is provided
    if (!featureName) {
      console.warn('[PostHog] Cannot track feature usage - No feature name provided');
      return;
    }
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot track feature usage - PostHog not initialized');
      return;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log(`[PostHog] Not tracking feature usage "${featureName}" in development environment`);
      return;
    }
    
    console.log(`[PostHog] Tracking feature usage: ${featureName}`, properties);
    
    // Track the feature usage
    if (typeof window.posthog.capture === 'function') {
      window.posthog.capture('feature_used', {
        feature_name: featureName,
        ...properties,
        environment: 'production'
      });
      console.log(`[PostHog] Feature usage "${featureName}" tracked successfully`);
    } else {
      console.warn('[PostHog] capture function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error tracking feature usage:', error);
  }
};

// Track user engagement
export const trackEngagement = (action, properties = {}) => {
  try {
    // Check if action is provided
    if (!action) {
      console.warn('[PostHog] Cannot track engagement - No action provided');
      return;
    }
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot track engagement - PostHog not initialized');
      return;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log(`[PostHog] Not tracking engagement "${action}" in development environment`);
      return;
    }
    
    console.log(`[PostHog] Tracking engagement: ${action}`, properties);
    
    // Track the engagement
    if (typeof window.posthog.capture === 'function') {
      window.posthog.capture('user_engagement', {
        action,
        ...properties,
        timestamp: new Date().toISOString(),
        environment: 'production'
      });
      console.log(`[PostHog] Engagement "${action}" tracked successfully`);
    } else {
      console.warn('[PostHog] capture function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error tracking engagement:', error);
  }
};

// Track error events
export const trackError = (errorType, errorDetails = {}) => {
  try {
    // Check if error type is provided
    if (!errorType) {
      console.warn('[PostHog] Cannot track error - No error type provided');
      return;
    }
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot track error - PostHog not initialized');
      return;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log(`[PostHog] Not tracking error "${errorType}" in development environment`);
      return;
    }
    
    console.log(`[PostHog] Tracking error: ${errorType}`, errorDetails);
    
    // Track the error
    if (typeof window.posthog.capture === 'function') {
      window.posthog.capture('error_occurred', {
        error_type: errorType,
        ...errorDetails,
        timestamp: new Date().toISOString(),
        environment: 'production'
      });
      console.log(`[PostHog] Error "${errorType}" tracked successfully`);
    } else {
      console.warn('[PostHog] capture function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error tracking error event:', error);
  }
};

// Start session recording
export const startRecording = () => {
  try {
    console.log('[PostHog] Attempting to start session recording');
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot start recording - PostHog not initialized');
      return;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log('[PostHog] Not starting recording in development environment');
      return;
    }
    
    // Check if recording is already active
    if (isRecording()) {
      console.log('[PostHog] Session recording already active, no need to start');
      return;
    }
    
    // Start recording
    if (typeof window.posthog.startSessionRecording === 'function') {
      window.posthog.startSessionRecording();
      console.log('[PostHog] Session recording started successfully');
      
      // Verify that recording started
      setTimeout(() => {
        const recordingActive = isRecording();
        console.log(`[PostHog] Session recording verification: ${recordingActive ? 'Active' : 'Inactive'}`);
        
        if (!recordingActive) {
          console.log('[PostHog] Retrying session recording start');
          window.posthog.startSessionRecording();
        }
      }, 1000);
    } else {
      console.warn('[PostHog] startSessionRecording function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error starting session recording:', error);
  }
};

// For backward compatibility
export const startPostHogRecording = startRecording;

// Stop session recording
export const stopRecording = () => {
  try {
    console.log('[PostHog] Attempting to stop session recording');
    
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot stop recording - PostHog not initialized');
      return;
    }
    
    // Check if recording is active
    if (!isRecording()) {
      console.log('[PostHog] Session recording not active, no need to stop');
      return;
    }
    
    // Stop recording
    if (typeof window.posthog.stopSessionRecording === 'function') {
      window.posthog.stopSessionRecording();
      console.log('[PostHog] Session recording stopped successfully');
    } else {
      console.warn('[PostHog] stopSessionRecording function not available');
    }
  } catch (error) {
    console.error('[PostHog] Error stopping session recording:', error);
  }
};

// For backward compatibility
export const stopPostHogRecording = stopRecording;

// Check if session recording is active
export const isRecording = () => {
  try {
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot check recording status - PostHog not initialized');
      return false;
    }
    
    // Check recording status
    if (typeof window.posthog.get_session_recording_enabled === 'function') {
      const isEnabled = window.posthog.get_session_recording_enabled();
      return isEnabled;
    } else {
      console.warn('[PostHog] get_session_recording_enabled function not available');
      return false;
    }
  } catch (error) {
    console.error('[PostHog] Error checking session recording status:', error);
    return false;
  }
};

// For backward compatibility
export const isPostHogRecording = isRecording;

// Get session replay URL for debugging
export const getSessionReplayUrl = () => {
  try {
    // Check if PostHog is initialized
    if (!isPostHogAvailable()) {
      console.warn('[PostHog] Cannot get session replay URL - PostHog not initialized');
      return null;
    }
    
    // Check if we're in production
    if (!isProduction()) {
      console.log('[PostHog] Session replay URLs not available in development');
      return null;
    }
    
    // Get the session ID
    if (typeof window.posthog.get_session_id === 'function') {
      const sessionId = window.posthog.get_session_id();
      if (!sessionId) {
        console.warn('[PostHog] No active session ID found');
        return null;
      }
      
      // Construct the replay URL
      const projectId = 'phc_siJIQFcoAOCjoSVKMoLjLI5Qoz0xSJ08AZrwUXF4Iko'.split('_')[1];
      const replayUrl = `https://us.i.posthog.com/replay/${projectId}?sessionId=${sessionId}`;
      console.log('[PostHog] Session replay URL:', replayUrl);
      return replayUrl;
    } else {
      console.warn('[PostHog] get_session_id function not available');
      return null;
    }
  } catch (error) {
    console.error('[PostHog] Error getting session replay URL:', error);
    return null;
  }
};

// For backward compatibility
export const getPostHogSessionReplayUrl = getSessionReplayUrl; 