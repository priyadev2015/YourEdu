import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel with your project token
export const initMixpanel = () => {
  try {
    mixpanel.init('a6294e8a9a1cf6119fae3e44f7df5040', {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage',
      api_host: "https://api.mixpanel.com",
      cross_subdomain_cookie: true,
      secure_cookie: true,
      ip: false,
      property_blacklist: ['password', 'secret', 'token', 'auth', 'creditCard', 'ssn'],
      mask_all_element_attributes: false,
      mask_all_text: false,
      session_recording: {
        enabled: true,
        maskAllInputs: true,
        maskAllText: false,
        recordCanvas: false,
        collectFonts: true,
        maskTextSelector: '[data-mp-mask]',
        ignoreSelector: '[data-mp-ignore]',
        maskInputOptions: {
          password: true,
          email: true,
          number: true,
          search: true,
          'data-mp-sensitive': true
        }
      }
    });

    // Add debug logging
    if (process.env.NODE_ENV !== 'production') {
      mixpanel.set_config({
        debug: true
      });
      console.log('Mixpanel initialized in debug mode');
    }

    // Start session recording
    startSessionRecording();
  } catch (error) {
    console.error('Failed to initialize Mixpanel:', error);
  }
};

// Session recording controls
let isRecording = false;
let recordingStartTime = null;

export const startSessionRecording = () => {
  try {
    if (!isRecording) {
      isRecording = true;
      recordingStartTime = Date.now();
      
      // Track recording start
      mixpanel.track('Session Recording Started', {
        timestamp: new Date().toISOString()
      });

      // Store session info
      localStorage.setItem('mp_session_start', recordingStartTime.toString());
      localStorage.setItem('mp_session_id', generateSessionId());
    }
  } catch (error) {
    console.error('Error starting session recording:', error);
  }
};

export const stopSessionRecording = () => {
  try {
    if (isRecording) {
      const duration = Math.round((Date.now() - recordingStartTime) / 1000);
      
      // Track recording end
      mixpanel.track('Session Recording Ended', {
        duration_seconds: duration,
        timestamp: new Date().toISOString()
      });

      isRecording = false;
      recordingStartTime = null;
      
      // Clear session info
      localStorage.removeItem('mp_session_start');
      localStorage.removeItem('mp_session_id');
    }
  } catch (error) {
    console.error('Error stopping session recording:', error);
  }
};

// Helper function to generate session ID
const generateSessionId = () => {
  return 'mp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Track link clicks
export const trackLinkClick = (event, linkData) => {
  event.preventDefault();
  
  const { href, text, location } = linkData;
  const isExternal = href.startsWith('http') && !href.includes(window.location.host);
  
  // Track the click with session info
  mixpanel.track(isExternal ? 'External Link Clicked' : 'Navigation Link Clicked', {
    'Link URL': href,
    'Link Text': text,
    'Link Location': location,
    'Session ID': localStorage.getItem('mp_session_id'),
    timestamp: new Date().toISOString()
  });

  // Navigate after tracking
  setTimeout(() => {
    if (isExternal) {
      window.open(href, '_blank');
    } else {
      window.location.href = href;
    }
  }, 300);
};

// Helper function to get element's path in DOM (kept for reference if needed)
const getElementPath = (el) => {
  const path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
    } else if (el.className) {
      selector += `.${el.className.replace(/\s+/g, '.')}`;
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(' > ');
};

// Track page views with time spent
let pageViewStartTime = null;
let currentPageData = null;

// Helper function to parse URL and get structured data
const parseUrlData = (url) => {
  let pathname;
  let searchParams = {};
  
  try {
    // Handle both absolute and relative URLs
    if (url && !url.startsWith('http')) {
      // For relative URLs, construct the full URL
      const baseUrl = window.location.origin;
      url = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    
    const parsedUrl = new URL(url || window.location.href);
    pathname = parsedUrl.pathname;
    searchParams = Object.fromEntries(parsedUrl.searchParams);
  } catch (error) {
    // Fallback for invalid URLs
    console.warn('Error parsing URL:', error);
    pathname = url || window.location.pathname;
    // Try to extract search params from the URL string if present
    const queryIndex = pathname.indexOf('?');
    if (queryIndex !== -1) {
      const searchString = pathname.slice(queryIndex + 1);
      pathname = pathname.slice(0, queryIndex);
      searchParams = Object.fromEntries(
        searchString.split('&').map(param => {
          const [key, value] = param.split('=');
          return [key, decodeURIComponent(value || '')];
        })
      );
    }
  }
  
  // Extract the base path and handle special cases
  const pathParts = pathname.split('/').filter(Boolean);
  const basePath = pathParts[0] || 'home';
  
  // Get the current tab if it exists
  const currentTab = searchParams.tab || null;
  
  // Special handling for different route patterns
  const routeType = getRouteType(pathname);
  const routeParams = getRouteParams(pathname, pathParts);
  
  // Special handling for course search results and other filtered pages
  const pageFilters = getPageFilters(pathname, searchParams);

  return {
    fullUrl: url || window.location.href,
    basePath,
    pathname,
    currentTab,
    routeType,
    routeParams,
    pageFilters,
    queryParams: searchParams,
  };
};

// Helper function to determine route type
const getRouteType = (pathname) => {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.includes('/admin-materials')) return 'admin';
  if (pathname.includes('/course-search')) return 'course-search';
  if (pathname.includes('/ledger')) return 'ledger';
  if (pathname.includes('/my-homeschool')) return 'homeschool';
  if (pathname.includes('/account')) return 'account';
  if (pathname.includes('/course-detail')) return 'course-detail';
  if (pathname.includes('/user-course')) return 'user-course';
  if (pathname.includes('/internships')) return 'internships';
  if (pathname.includes('/provider')) return 'provider';
  if (pathname.includes('/verify')) return 'verification';
  if (pathname.includes('/invitation')) return 'invitation';
  return 'general';
};

// Helper function to extract route parameters
const getRouteParams = (pathname, pathParts) => {
  const params = {};
  
  // Handle dynamic route parameters
  if (pathname.includes('/events/')) params.eventId = pathParts[pathParts.indexOf('events') + 1];
  if (pathname.includes('/groups/')) params.groupId = pathParts[pathParts.indexOf('groups') + 1];
  if (pathname.includes('/course-detail/')) {
    params.college = pathParts[pathParts.indexOf('course-detail') + 1];
    params.courseCode = pathParts[pathParts.indexOf('course-detail') + 2];
  }
  if (pathname.includes('/user-course/')) params.courseId = pathParts[pathParts.indexOf('user-course') + 1];
  if (pathname.includes('/verify/')) params.tokenId = pathParts[pathParts.indexOf('verify') + 1];
  if (pathname.includes('/company/')) params.companyId = pathParts[pathParts.indexOf('company') + 1];
  if (pathname.includes('/provider/')) params.providerId = pathParts[pathParts.indexOf('provider') + 1];
  if (pathname.includes('/student-invitation/')) params.token = pathParts[pathParts.indexOf('student-invitation') + 1];
  if (pathname.includes('/household-invitation/')) params.token = pathParts[pathParts.indexOf('household-invitation') + 1];
  
  return params;
};

// Helper function to get page-specific filters
const getPageFilters = (pathname, searchParams) => {
  const filters = {};
  
  // Course search filters
  if (pathname.includes('/course-search/results')) {
    filters.subjects = searchParams.subjects;
    filters.location = searchParams.location;
    filters.mileRadius = searchParams.mileRadius;
    filters.grade = searchParams.grade;
    filters.provider = searchParams.provider;
    filters.price = searchParams.price;
    filters.format = searchParams.format;
  }
  
  // My homeschool filters
  if (pathname.includes('/my-homeschool')) {
    filters.section = searchParams.section;
    filters.year = searchParams.year;
    filters.semester = searchParams.semester;
  }
  
  // Ledger filters
  if (pathname.includes('/ledger')) {
    filters.type = searchParams.type;
    filters.status = searchParams.status;
    filters.date = searchParams.date;
  }
  
  return Object.keys(filters).length > 0 ? filters : null;
};

// Track page views with session info
export const trackPageView = (url) => {
  const urlData = parseUrlData(url);
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction ? 'app.youredu.school' : 'localhost:3000';
  const sessionId = localStorage.getItem('mp_session_id');

  // Track the page view
  mixpanel.track('Page View', {
    base_path: urlData.basePath,
    full_path: urlData.pathname,
    route_type: urlData.routeType,
    route_params: urlData.routeParams,
    tab: urlData.currentTab,
    page_filters: urlData.pageFilters,
    query_params: urlData.queryParams,
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    referrer: document.referrer,
    base_url: baseUrl,
    environment: process.env.NODE_ENV,
  });
};

// Track total session time
let sessionStartTime = null;

export const startSessionTracking = () => {
  sessionStartTime = Date.now();
  
  // Identify the user if available
  const user = mixpanel.get_distinct_id();
  mixpanel.identify(user);
  
  // Set initial session properties
  mixpanel.people.set({
    'Last Session Start': new Date().toISOString(),
    'Environment': process.env.NODE_ENV,
    'Platform': 'Web',
  });
};

export const trackSessionEnd = () => {
  if (sessionStartTime) {
    const duration = Math.round((Date.now() - sessionStartTime) / 1000); // Convert to seconds
    
    // Track final page duration before session end
    if (pageViewStartTime && currentPageData) {
      const finalPageDuration = Math.round((Date.now() - pageViewStartTime) / 1000);
      mixpanel.track('Page Exit', {
        base_path: currentPageData.basePath,
        full_path: currentPageData.pathname,
        route_type: currentPageData.routeType,
        route_params: currentPageData.routeParams,
        tab: currentPageData.currentTab,
        page_filters: currentPageData.pageFilters,
        query_params: currentPageData.queryParams,
        duration_seconds: finalPageDuration,
        is_final_page: true,
      });
    }

    mixpanel.track('Session End', {
      duration_seconds: duration,
      last_page: currentPageData?.pathname,
      last_tab: currentPageData?.currentTab,
      timestamp: new Date().toISOString(),
    });

    // Update user properties with session data
    mixpanel.people.set({
      'Last Session Duration': duration,
      'Last Session End': new Date().toISOString(),
    });
  }
};

// Track user engagement events
export const trackEngagement = (eventName, properties = {}) => {
  const urlData = parseUrlData();
  
  mixpanel.track(eventName, {
    ...properties,
    current_page: urlData.pathname,
    current_tab: urlData.currentTab,
    timestamp: new Date().toISOString(),
  });
};

// Set user properties
export const setUserProperties = (properties) => {
  mixpanel.people.set({
    ...properties,
    'Last Updated': new Date().toISOString(),
  });
};

// Handle session tracking when user leaves
window.addEventListener('beforeunload', () => {
  stopSessionRecording();
});

export default mixpanel; 