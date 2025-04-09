import { useCallback } from 'react';
import { trackFeatureUsage as trackFeaturePostHog, trackEngagement as trackEngagementPostHog, trackError as trackErrorPostHog } from '../utils/posthogClient';
import { trackFeatureUsage as trackFeatureHeap, trackEngagement as trackEngagementHeap, trackError as trackErrorHeap } from '../utils/heapClient';

export const useAnalytics = () => {
  // Track feature usage across all analytics platforms
  const trackFeature = useCallback((featureName, properties = {}) => {
    const enrichedProperties = {
      ...properties,
      location: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    // Track in PostHog
    trackFeaturePostHog(featureName, enrichedProperties);
    
    // Track in Heap
    trackFeatureHeap(featureName, enrichedProperties);
  }, []);

  // Track engagement events across all analytics platforms
  const trackEvent = useCallback((action, properties = {}) => {
    const enrichedProperties = {
      ...properties,
      location: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    // Track in PostHog
    trackEngagementPostHog(action, enrichedProperties);
    
    // Track in Heap
    trackEngagementHeap(action, enrichedProperties);
  }, []);

  // Track errors across all analytics platforms
  const trackException = useCallback((errorType, errorDetails = {}) => {
    const enrichedDetails = {
      ...errorDetails,
      location: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Track in PostHog
    trackErrorPostHog(errorType, enrichedDetails);
    
    // Track in Heap
    trackErrorHeap(errorType, enrichedDetails);
  }, []);

  return {
    trackFeature,
    trackEvent,
    trackException
  };
};

export default useAnalytics; 