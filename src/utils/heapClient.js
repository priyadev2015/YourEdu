// Heap Analytics Client
const HEAP_ENV_ID = process.env.REACT_APP_HEAP_ENV_ID || '850231054';

export const initHeap = () => {
  try {
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;

    // Initialize Heap
    window.heapReadyCb = window.heapReadyCb || [];
    window.heap = window.heap || [];
    window.heap.load = function(e, t) {
      window.heap.envId = e;
      window.heap.clientConfig = t = t || {};
      window.heap.clientConfig.shouldFetchServerConfig = false;
      var a = document.createElement("script");
      a.type = "text/javascript";
      a.async = true;
      a.src = "https://cdn.us.heap-api.com/config/" + e + "/heap_config.js";
      var r = document.getElementsByTagName("script")[0];
      r.parentNode.insertBefore(a, r);
      var n = ["init", "startTracking", "stopTracking", "track", "resetIdentity", "identify", 
               "getSessionId", "getUserId", "getIdentity", "addUserProperties", "addEventProperties", 
               "removeEventProperty", "clearEventProperties", "addAccountProperties", "addAdapter",
               "addTransformer", "addTransformerFn", "onReady", "addPageviewProperties",
               "removePageviewProperty", "clearPageviewProperties", "trackPageview"];
      var i = function(e) {
        return function() {
          var t = Array.prototype.slice.call(arguments, 0);
          window.heapReadyCb.push({
            name: e,
            fn: function() {
              window.heap[e] && window.heap[e].apply(window.heap, t);
            }
          });
        };
      };
      for (var p = 0; p < n.length; p++) window.heap[n[p]] = i(n[p]);
    };

    window.heap.load(HEAP_ENV_ID);

    // Add debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Heap initialized successfully');
    }

  } catch (error) {
    console.error('Error initializing Heap:', error);
  }
};

// Track page views
export const trackPageView = (pathname, properties = {}) => {
  try {
    if (!window.heap) {
      console.warn('Heap not loaded. Skipping page view tracking.');
      return;
    }

    const pageProperties = {
      path: pathname,
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      ...properties
    };

    window.heap.track('Pageview', pageProperties);
  } catch (error) {
    console.error('Error tracking page view in Heap:', error);
  }
};

// Identify user
export const identifyUser = (userId, userProperties = {}) => {
  try {
    if (!window.heap) {
      console.warn('Heap not loaded. Skipping user identification.');
      return;
    }

    if (!userId) {
      console.warn('No userId provided for Heap identification.');
      return;
    }

    window.heap.identify(userId);
    window.heap.addUserProperties({
      ...userProperties,
      first_seen: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error identifying user in Heap:', error);
  }
};

// Track feature usage
export const trackFeatureUsage = (featureName, properties = {}) => {
  try {
    if (!window.heap) return;
    window.heap.track(`Feature Used - ${featureName}`, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error tracking feature usage in Heap (${featureName}):`, error);
  }
};

// Track user engagement
export const trackEngagement = (action, properties = {}) => {
  try {
    if (!window.heap) return;
    window.heap.track(`Engagement - ${action}`, {
      ...properties,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error tracking engagement in Heap (${action}):`, error);
  }
};

// Track errors
export const trackError = (errorType, errorDetails = {}) => {
  try {
    if (!window.heap) return;
    window.heap.track('Error Occurred', {
      error_type: errorType,
      ...errorDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking error event in Heap:', error);
  }
}; 