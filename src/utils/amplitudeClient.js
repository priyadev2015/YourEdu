// Amplitude Analytics Configuration
export const AMPLITUDE_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY;

// Initialize Amplitude
export const initAmplitude = () => {
  const script = document.createElement('script');
  script.src = `https://cdn.amplitude.com/script/${AMPLITUDE_API_KEY}.js`;
  script.async = true;
  
  script.onload = () => {
    window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
    window.amplitude.init(AMPLITUDE_API_KEY, {
      fetchRemoteConfig: true,
      autocapture: true
    });
  };

  document.head.appendChild(script);
};

// Track custom events
export const trackEvent = (eventName, eventProperties = {}) => {
  if (window.amplitude) {
    window.amplitude.track(eventName, eventProperties);
  }
};

// Track page views
export const trackPageView = (pageName) => {
  if (window.amplitude) {
    window.amplitude.track('Page View', { page: pageName });
  }
}; 