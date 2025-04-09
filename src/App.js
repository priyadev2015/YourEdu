import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useAuth } from './utils/AuthContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Box, CircularProgress, Typography } from '@mui/material'
import { theme } from './theme/theme'
import { PublicAccessProvider } from './contexts/PublicAccessContext'
import logo from './assets/youredu-2.png'
import capLogo from './assets/youredu-cap.png'
import { updateOnboardingProgress } from './utils/onboardingUtils'
import {
  initPostHog,
  trackPageView as trackPageViewPostHog,
  identifyUser as identifyUserPostHog,
  startRecording as startPostHogRecording,
  isRecording as isPostHogRecording,
  getSessionReplayUrl as getPostHogSessionReplayUrl,
} from './utils/posthogClient'
import { initHeap, trackPageView as trackPageViewHeap, identifyUser as identifyUserHeap } from './utils/heapClient'
import { initGoogleAnalytics, trackPageView as trackPageViewGA } from './utils/googleAnalyticsClient'
import { useAnalytics } from './hooks/useAnalytics'
import ScrollToTop from './components/ScrollToTop'
import TopBar from './components/TopBar'
import Navbar from './components/Navbar'
import NavbarStudent from './components/NavBar-Student'
import CollegeNavbar from './components/CollegeNavbar'
import LAFireNavbar from './components/LAFireNavbar'
import ConnectionStatus from './components/ConnectionStatus'
import Login from './pages/Login'
import LoginSelection from './pages/LoginSelection'
import Home from './pages/Home'
import HomeParentAcademics from './pages/Home-Parent-Academics'
import HomeCollege from './pages/Home-College'
import LAFireHome from './pages/LAFireHome'
import CourseSearch from './pages/CourseSearch'
import LACourseSearch from './pages/LACourseSearch'
import RecordKeeping from './pages/RecordKeeping'
import SchoolPhilosophy from './pages/SchoolPhilosophy'
import GuidanceLetter from './pages/GuidanceCounselorLetter'
import CourseDescription from './pages/CourseDescriptions'
import GradingRubric from './pages/GradingRubric'
import Transcript from './pages/Transcript'
import StateComplianceFiling from './pages/StateComplianceFiling'
import NewYorkComplianceFiling from "./pages/NewYorkCompliaceFiling"
import CaliforniaPSA from './pages/CaliforniaPSA'
import NewyorkPSA from './pages/NewyorkPSA'
import CaliforniaPSAVerify from './pages/CaliforniaPSAVerify'
import IdGeneration from './pages/IdGeneration'
import WorkPermit from './pages/WorkPermits'
import AdminMaterials from './pages/AdminMaterials'
import MyCourses from './pages/MyCourses'
import CourseDetail from './pages/CourseDetail'
import CoursePlanning from './pages/CoursePlanning'
import Extracurriculars from './pages/Extracurriculars'
import Scholarships from './pages/Scholarships'
import Colleges from './pages/Colleges'
import Internships from './pages/Internships'
import StateRegulationOverview from './pages/StateRegulationOverview'
import StateFundingOpportunities from './pages/StateFundingOpportunities'
import IdGenerationView from './pages/IdGenerationView'
import WorkPermitsView from './pages/WorkPermitsView'
import Community from './pages/Community'
import Groups from './pages/Groups'
import GroupPage from './pages/GroupPage'
import Events from './pages/Events'
import Marketplace from './pages/Marketplace'
import Registration from './pages/Registration'
import CollegePrep from './pages/CollegePrep'
import StudentMaterials from './pages/StudentMaterials'
import CareerExploration from './pages/CareerExploration'
import NewMyCoursesSchedule from './components/NewMyCoursesSchedule'
import MyAccount from './pages/MyAccount'
import TestingResources from './pages/TestingResources'
import Support from './pages/Support'
import HomeStudent from './pages/Home-Student'
import PublicEvent from './pages/PublicEvent'
import Pricing from './pages/Pricing'
import CoursePage from './pages/CoursePage'
import Ledger from './pages/Ledger'
import UserCoursePage from './pages/UserCoursePage'
import MarketplaceDetail from './pages/MarketplaceDetail'
import MyHomeschool from './pages/MyHomeschool'
import Compliance from './pages/Compliance'
import College from './pages/College'
import Careers from './pages/Careers'
import CourseMarketplace from './pages/CourseMarketplace'
import ProviderPage from './pages/ProviderPage'
import CartPage from './pages/NewCartPage'
import CourseCheckout from './pages/CourseCheckout'
import MathCourseDetail from './pages/MathCourseDetail'
import AccountProfile from './pages/AccountProfile'
import AccountSettings from './pages/AccountSettings'
import HouseholdManagement from './pages/HouseholdManagement'
import NotificationSettings from './pages/NotificationSettings'
import BillingSubscriptions from './pages/BillingSubscriptions'
import CompanyPage from './pages/CompanyPage'
import CommonAppLanding from './pages/CommonAppLanding'
import StudentInvitation from './pages/StudentInvitation'
import VerifyCredential from './pages/VerifyCredential'
import HouseholdInvitation from './pages/HouseholdInvitation'
import SierraCollegeAEForm from './pages/SierraCollegeAEForm'
import SierraCollegeAdmissionGuide from './pages/SierraCollegeAdmissionGuide'
import SierraCollegeEnrollmentGuide from './pages/SierraCollegeEnrollmentGuide'
import YoureduAdmin from './pages/YoureduAdmin'
import AdminLogin from './pages/AdminLogin'
import MyGoogleCalendar from './pages/MyGoogleCalendar'
import ModuleView from './pages/ModuleView'
import AddStudent from './pages/AddStudent'
import RecordOfAttendance from './pages/RecordOfAttendance'
import GoogleCalendarAndTodos from './components/GoogleCalendarAndTodos'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import CoursePlanningDetail from './pages/CoursePlanningDetail'
import UserTypeTest from './pages/UserTypeTest'
import { supabase, checkSupabaseConnection, reconnectSupabase } from './utils/supabaseClient'
import StudentDashboard from './pages/StudentDashboard'
import AuthConfirm from './pages/AuthConfirm'
import UpdatePassword from './pages/UpdatePassword'
import Resume from './pages/Resume'
import CampusCollegeGuide from './pages/CampusCollegeGuide'
import LoginFirstTime from './pages/LoginFirstTime'
import Terms from './pages/Terms'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndPrivacy from './pages/TermsAndPrivacy'

// Helper to check if we're in production
const isProduction = () => {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'app.youredu.school' || hostname.endsWith('youredu.school')
}

// Helper to determine the environment type: 'development', 'preview', or 'production'
export const getEnvironmentType = () => {
  if (typeof window === 'undefined') return 'development'

  const hostname = window.location.hostname

  // Check for production environment
  if (hostname === 'app.youredu.school' || hostname.endsWith('youredu.school')) {
    return 'production'
  }

  // Check for local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development'
  }

  // If not production or local development, assume it's a Vercel preview deployment
  // Vercel preview URLs typically contain 'vercel.app' or have random generated subdomains
  return 'preview'
}

// Helper to check if feature should be visible (in development or preview, but not production)
export const isFeatureVisible = () => {
  const environment = getEnvironmentType()
  return environment === 'development' || environment === 'preview'
}

// Separate component for the app content that needs Router context
const AppContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { trackException } = useAnalytics()
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false)
  const [navbarCollapsed, setNavbarCollapsed] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [onboardingVisible, setOnboardingVisible] = useState(true)
  const appInitialized = useRef(false)
  const connectionCheckInterval = useRef(null)

  console.log('[App Debug] Rendering AppContent, user:', user ? 'present' : 'null', 'path:', location.pathname)

  const isModuleViewPage = location.pathname === '/module-view'
  const isCheckoutPage = location.pathname === '/checkout'
  const isAuthPage = [
    '/login',
    '/login-selection',
    '/login/parent',
    '/login/student',
    '/login/microschool',
    '/login-first-time',
    '/youredu-admin',
    '/admin-login',
    '/auth/confirm',
    '/auth/callback',
    '/update-password',
    '/terms-and-privacy',
  ].includes(location.pathname)
  const isPublicPage = true
  const isInvitationPage =
    location.pathname.startsWith('/student-invitation/') || location.pathname.startsWith('/household-invitation/')

  // Get userType from localStorage whenever we need it
  const getUserType = () => localStorage.getItem('userType')

  // Initialize app
  useEffect(() => {
    if (appInitialized.current) {
      console.log('[App Debug] App already initialized, skipping')
      return
    }

    console.log('[App Debug] Initializing app')
    appInitialized.current = true

    // Add unload listener to help debug refresh issues
    window.addEventListener('beforeunload', () => {
      console.log('[App Debug] Page is being unloaded (refresh or close)')
    })

    // Add error listener to catch unhandled errors
    window.addEventListener('error', (event) => {
      console.error('[App Debug] Unhandled error:', event.error)
    })

    // Add promise rejection listener
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[App Debug] Unhandled promise rejection:', event.reason)
    })

    // Add listener for Supabase auth errors
    window.addEventListener('supabase-auth-error', (event) => {
      console.error('[App Debug] Supabase auth error:', event.detail)

      // If we're not already on the login page, redirect there
      if (!location.pathname.includes('/login')) {
        navigate('/login')
      }
    })

    console.log('[App Debug] App initialization complete')
  }, [])

  // Initialize analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      if (!analyticsInitialized) {
        try {
          console.log('[App Debug] Initializing analytics platforms')

          // Initialize PostHog first
          await initPostHog(user)

          if (user) {
            console.log('[App Debug] User available for identification')

            // Fetch additional user data from Supabase if needed
            let enhancedUser = { ...user }

            try {
              // Get user profile data from Supabase for more complete identification
              const { data: profileData, error: profileError } = await supabase
                .from('account_profiles')
                .select('*')
                .eq('id', user.id)
                .single()

              if (!profileError && profileData) {
                console.log('[App Debug] Found additional profile data for user')
                enhancedUser = {
                  ...user,
                  profile: profileData,
                }

                // Identify user with enhanced data - this will only run if not already identified
                await identifyUserPostHog(enhancedUser)
              }
            } catch (profileError) {
              console.error('[App Debug] Error fetching user profile:', profileError)
            }
          } else {
            console.log('[App Debug] No user available for identification')
          }

          // Initialize other analytics platforms
          initHeap()
          initGoogleAnalytics()
          setAnalyticsInitialized(true)
          console.log('[App Debug] All analytics platforms initialized')
        } catch (error) {
          console.error('[App Debug] Failed to initialize analytics:', error)
          setAnalyticsInitialized(true) // Mark as initialized anyway to prevent retries
        }
      }
    }

    initializeAnalytics()
  }, [analyticsInitialized, user])

  // Track page views - only if analytics is initialized and we're in production
  useEffect(() => {
    if (analyticsInitialized && location && isProduction()) {
      const { pathname, search } = location

      if (user || isPublicPage) {
        console.log(`[App Debug] Tracking page view: ${pathname}`)
        try {
          trackPageViewPostHog(pathname, search)
          trackPageViewHeap(pathname, { search })
          trackPageViewGA(pathname)
        } catch (error) {
          console.error('[App Debug] Error tracking page view:', error)
        }
      }
    }
  }, [location, analyticsInitialized, user, isPublicPage])

  // Check navbar state
  useEffect(() => {
    const checkNavbarState = () => {
      console.log('[App Debug] Checking navbar state')
      const isCollapsed = localStorage.getItem('navbarCollapsed') === 'true'
      setNavbarCollapsed(isCollapsed)
    }

    checkNavbarState()
    window.addEventListener('storage', checkNavbarState)

    return () => {
      window.removeEventListener('storage', checkNavbarState)
    }
  }, [])

  // Listen for navbar toggle
  useEffect(() => {
    const handleNavbarToggle = (event) => {
      console.log('[App Debug] Navbar toggle event received')
      setNavbarCollapsed(event.detail.isCollapsed)
    }

    window.addEventListener('navbarToggled', handleNavbarToggle)

    return () => {
      window.removeEventListener('navbarToggled', handleNavbarToggle)
    }
  }, [])

  // Check onboarding visibility
  useEffect(() => {
    const checkOnboardingVisibility = () => {
      console.log('[App Debug] Checking onboarding visibility')
      const onboardingHidden = localStorage.getItem('onboardingHidden') === 'true'
      setOnboardingVisible(!onboardingHidden)
    }

    checkOnboardingVisibility()
    window.addEventListener('storage', checkOnboardingVisibility)

    return () => {
      window.removeEventListener('storage', checkOnboardingVisibility)
    }
  }, [])

  // Listen for onboarding hidden event
  useEffect(() => {
    const handleOnboardingHidden = () => {
      console.log('[App Debug] Onboarding hidden event received')
      setOnboardingVisible(false)
    }

    window.addEventListener('onboarding-hidden', handleOnboardingHidden)
    return () => window.removeEventListener('onboarding-hidden', handleOnboardingHidden)
  }, [])

  // Listen for video overlay
  useEffect(() => {
    const handleShowVideo = () => {
      console.log('[App Debug] Show video event received')
      setShowVideo(true)
    }

    window.addEventListener('show-video-overlay', handleShowVideo)
    return () => window.removeEventListener('show-video-overlay', handleShowVideo)
  }, [])

  // Handle video close
  const handleCloseVideo = async () => {
    console.log('[App Debug] Video closed')
    setShowVideo(false)
    localStorage.setItem('hasSeenWelcomeVideo', 'true')

    if (user?.id) {
      try {
        console.log('[App Debug] Updating onboarding progress')
        const { error } = await updateOnboardingProgress(user.id, 'watched_video')
        if (error) {
          console.error('[App Debug] Error updating onboarding progress:', error)
        }
      } catch (error) {
        console.error('[App Debug] Error in handleCloseVideo:', error)
      }
    }
  }

  // Global error boundary
  useEffect(() => {
    const handleError = (error) => {
      console.error('[App Debug] Global error caught:', error)

      // Track the error in analytics
      try {
        trackException('global_error', {
          message: error.message,
          stack: error.stack,
          location: location.pathname,
        })
      } catch (analyticsError) {
        console.error('[App Debug] Error tracking exception:', analyticsError)
      }

      // Show error toast to user
      toast.error('Something went wrong. Please try again or contact support if the issue persists.')
    }

    // Set up global error handler
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [location.pathname, trackException])

  // Calculate the left position for TopBar based on navbar state
  const topBarLeftPosition = !isCheckoutPage && !isModuleViewPage && user ? (navbarCollapsed ? 72 : 240) : 0

  console.log('[App Debug] Rendering main app content, user:', user ? 'present' : 'null', 'path:', location.pathname)

  const handleInteraction = (e, callback) => {
    if (e) {
      e.preventDefault()
    }
    if (callback) {
      callback()
    }
  }

  const handleNavigate = (e, path) => {
    e.preventDefault()
    navigate(path)
  }

  const getNavbar = () => {
    // Check for transition flag - if set, don't show navbar
    if (localStorage.getItem('hideNavbarDuringTransition') === 'true') {
      console.log('Hiding navbar during transition')
      return null
    }

    const userType = localStorage.getItem('userType')
    console.log('getNavbar called with userType:', userType)

    // Only show navbar if we have a user and we're not on an invitation page
    if (!user || isInvitationPage) {
      console.log('No user or on invitation page, not showing navbar')
      return null
    }

    // If userType is not set in localStorage, try to get it from user metadata first
    if (!userType) {
      console.log('No userType in localStorage, checking user metadata')

      // Check if user_type is in user metadata
      const metadataUserType = user.user_metadata?.user_type
      if (metadataUserType) {
        console.log('Found user_type in metadata:', metadataUserType)
        localStorage.setItem('userType', metadataUserType)
        return metadataUserType === 'student' ? (
          <NavbarStudent handleInteraction={handleInteraction} />
        ) : (
          <Navbar handleInteraction={handleInteraction} />
        )
      }

      // If not in metadata, fetch from database but don't trigger a refresh
      // Instead, we'll just show the parent navbar for now and let the next render show the correct one
      console.log('No userType in metadata, fetching from database')

      // Use a flag in sessionStorage to prevent multiple fetches
      if (sessionStorage.getItem('fetchingUserType') !== 'true') {
        sessionStorage.setItem('fetchingUserType', 'true')

        // Fetch user type from database
        supabase
          .from('account_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            sessionStorage.removeItem('fetchingUserType')

            if (!error && data?.user_type) {
              console.log('Found user_type in database:', data.user_type)
              localStorage.setItem('userType', data.user_type)

              // Only reload if we're not already showing the correct navbar
              const currentNavbar = data.user_type === 'student' ? 'student' : 'parent'
              const visibleNavbar = document.querySelector('[data-navbar-type="student"]') ? 'student' : 'parent'

              if (currentNavbar !== visibleNavbar) {
                console.log('Navbar mismatch, updating UI without full refresh')
                // Force a re-render without a full page reload
                window.dispatchEvent(new Event('storage'))
              }
            }
          })
          .catch((err) => {
            sessionStorage.removeItem('fetchingUserType')
            console.error('Error fetching user type as fallback:', err)
          })
      }

      // Default to parent navbar while we wait for the database query
      return <Navbar handleInteraction={handleInteraction} />
    }

    // Show student navbar only for student users
    if (userType === 'student') {
      console.log('Showing student navbar')
      return <NavbarStudent handleInteraction={handleInteraction} />
    }

    // Show parent navbar for everyone else (including parent, undefined, etc)
    console.log('Showing parent navbar')
    return <Navbar handleInteraction={handleInteraction} />
  }

  const getHomePage = () => {
    const userType = localStorage.getItem('userType')

    switch (userType) {
      case 'student':
        return <HomeParentAcademics />
      case 'parent':
      default:
        return <Home />
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isCheckoutPage &&
        !isAuthPage &&
        !isModuleViewPage &&
        !isInvitationPage &&
        localStorage.getItem('hideNavbarDuringTransition') !== 'true' &&
        (user || isPublicPage) && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: topBarLeftPosition,
              right: 0,
              zIndex: 1200,
              transition: 'left 0.3s ease',
            }}
          >
            <TopBar />
          </Box>
        )}

      <Box
        sx={{
          display: 'flex',
          flex: 1,
        }}
      >
        {!isCheckoutPage &&
          !isAuthPage &&
          !isModuleViewPage &&
          !isInvitationPage &&
          localStorage.getItem('hideNavbarDuringTransition') !== 'true' &&
          user && (
            <Box
              sx={{
                width: navbarCollapsed ? 72 : 240,
                flexShrink: 0,
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                overflowY: 'auto',
                bgcolor: 'hsl(var(--brand-primary-light))',
                borderRight: '1px solid',
                borderColor: 'divider',
                zIndex: 1300,
                transition: 'width 0.3s ease',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  height: '64px',
                  pl: navbarCollapsed ? '16px' : '20px',
                  backgroundColor: 'white',
                  justifyContent: navbarCollapsed ? 'center' : 'flex-start',
                  transition: 'padding-left 0.3s ease',
                }}
                onClick={(e) => handleNavigate(e, '/')}
              >
                <img
                  src={navbarCollapsed ? capLogo : logo}
                  alt="YourEDU Logo"
                  style={{
                    height: navbarCollapsed ? '32px' : '40px',
                    display: 'block',
                    cursor: 'pointer',
                    transition: 'height 0.3s ease',
                  }}
                />
              </Box>
              {getNavbar()}
            </Box>
          )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml:
              !isCheckoutPage &&
              !isAuthPage &&
              !isModuleViewPage &&
              !isInvitationPage &&
              localStorage.getItem('hideNavbarDuringTransition') !== 'true' &&
              user
                ? navbarCollapsed
                  ? '72px'
                  : '240px'
                : 0,
            p: 0,
            bgcolor: 'background.default',
            minHeight: '100vh',
            mt:
              !isCheckoutPage &&
              !isAuthPage &&
              !isModuleViewPage &&
              !isInvitationPage &&
              localStorage.getItem('hideNavbarDuringTransition') !== 'true' &&
              (user || isPublicPage)
                ? '64px'
                : 0,
            transition: 'margin-left 0.3s ease',
            position: 'relative',
            zIndex: 1, // Lower z-index than the navbar toggle button
          }}
        >
          <Routes>
            {/* Public Routes (always accessible) */}
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/events/:eventId" element={<PublicEvent />} />
            <Route path="/groups/:groupId" element={<GroupPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/calendar" element={<NewMyCoursesSchedule />} />
            <Route path="/google-calendar" element={<GoogleCalendarAndTodos />} />
            <Route path="/course-detail/:college/:courseCode" element={<CoursePage />} />
            <Route path="/user-course/:courseId" element={<UserCoursePage />} />
            <Route path="/verify/:tokenId" element={<VerifyCredential />} />
            <Route path="/internships/company/:companyId" element={<CompanyPage />} />
            <Route path="/provider/:providerId" element={<ProviderPage />} />
            <Route path="/student-invitation/:token" element={<StudentInvitation />} />
            <Route path="/household-invitation/:token" element={<HouseholdInvitation />} />
            <Route path="/user-type-test" element={<UserTypeTest />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/course-planning-detail" element={<CoursePlanningDetail />} />

            {/* Auth Routes */}
            <Route
              path="/auth/callback"
              element={
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                  <CircularProgress />
                </Box>
              }
            />

            {/* Authentication-related routes (accessible whether logged in or not) */}
            <Route path="/login-selection" element={user ? <Navigate to="/" replace /> : <LoginSelection />} />
            <Route path="/login/:type?" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/youredu-admin" element={<YoureduAdmin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/terms-and-privacy" element={<TermsAndPrivacy />} />

            {user ? (
              <>
                <Route path="/" element={<Navigate to="/compliance/regulations" replace />} />
                <Route path="/module-view" element={<ModuleView />} />
                {/* Parent Routes */}
                <Route path="/ledger" element={getUserType() === 'parent' ? <Ledger /> : <Navigate to="/" />} />
                <Route
                  path="/ledger/company/:companyId"
                  element={getUserType() === 'parent' ? <Ledger /> : <Navigate to="/" />}
                />
                <Route
                  path="/ledger/internships"
                  element={getUserType() === 'parent' ? <Ledger /> : <Navigate to="/" />}
                />
                <Route path="/ledger/jobs" element={getUserType() === 'parent' ? <Ledger /> : <Navigate to="/" />} />
                <Route
                  path="/ledger/career-exploration"
                  element={getUserType() === 'parent' ? <Ledger /> : <Navigate to="/" />}
                />
                <Route path="/resume" element={getUserType() === 'parent' ? <Resume /> : <Navigate to="/" />} />
                <Route
                  path="/internships"
                  element={getUserType() === 'parent' ? <Internships /> : <Navigate to="/" />}
                />
                <Route
                  path="/internships/company/:companyId"
                  element={getUserType() === 'parent' ? <CompanyPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/career-exploration"
                  element={getUserType() === 'parent' ? <CareerExploration /> : <Navigate to="/" />}
                />
                <Route path="/cart" element={getUserType() === 'parent' ? <CartPage /> : <Navigate to="/" />} />
                <Route
                  path="/parent-academics"
                  element={getUserType() === 'parent' ? <HomeParentAcademics /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-search"
                  element={getUserType() === 'parent' ? <CourseMarketplace /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-search/results"
                  element={getUserType() === 'parent' ? <CourseSearch /> : <Navigate to="/" />}
                />
                <Route path="/my-courses" element={getUserType() === 'parent' ? <MyCourses /> : <Navigate to="/" />} />
                <Route
                  path="/add-student"
                  element={getUserType() === 'parent' ? <AddStudent /> : <Navigate to="/" />}
                />
                <Route
                  path="/my-homeschool"
                  element={getUserType() === 'parent' ? <MyHomeschool /> : <Navigate to="/" />}
                />
                <Route
                  path="/attendance"
                  element={getUserType() === 'parent' ? <RecordOfAttendance /> : <Navigate to="/" />}
                />
                <Route
                  path="/compliance"
                  element={
                    getUserType() === 'parent' ? <Navigate to="/compliance/regulations" replace /> : <Navigate to="/" />
                  }
                />
                <Route
                  path="/compliance/regulations"
                  element={getUserType() === 'parent' ? <Compliance /> : <Navigate to="/" />}
                />
                <Route
                  path="/compliance/filing"
                  element={getUserType() === 'parent' ? <Compliance /> : <Navigate to="/" />}
                />
                <Route
                  path="/compliance/funding"
                  element={getUserType() === 'parent' ? <Compliance /> : <Navigate to="/" />}
                />
                <Route
                  path="/common-app-landing"
                  element={getUserType() === 'parent' ? <CommonAppLanding /> : <Navigate to="/" />}
                />
                <Route path="/college" element={getUserType() === 'parent' ? <College /> : <Navigate to="/" />} />
                <Route
                  path="/record-keeping"
                  element={getUserType() === 'parent' ? <RecordKeeping /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials"
                  element={getUserType() === 'parent' ? <AdminMaterials /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/school-philosophy"
                  element={getUserType() === 'parent' ? <SchoolPhilosophy /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/transcript"
                  element={getUserType() === 'parent' ? <Transcript /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/course-descriptions"
                  element={getUserType() === 'parent' ? <CourseDescription /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/grading-rubric"
                  element={getUserType() === 'parent' ? <GradingRubric /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/guidance-counselor-letter"
                  element={getUserType() === 'parent' ? <GuidanceLetter /> : <Navigate to="/" />}
                />
                <Route
                  path="/school-philosophy"
                  element={getUserType() === 'parent' ? <SchoolPhilosophy /> : <Navigate to="/" />}
                />
                <Route
                  path="/guidance-letter"
                  element={getUserType() === 'parent' ? <GuidanceLetter /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-description"
                  element={getUserType() === 'parent' ? <CourseDescription /> : <Navigate to="/" />}
                />
                <Route
                  path="/grading-rubric"
                  element={getUserType() === 'parent' ? <GradingRubric /> : <Navigate to="/" />}
                />
                <Route path="/transcript" element={getUserType() === 'parent' ? <Transcript /> : <Navigate to="/" />} />
                <Route
                  path="/state-compliance-filing"
                  element={getUserType() === 'parent' ? <StateComplianceFiling /> : <Navigate to="/" />}
                />

<Route
                  path="/state-compliance-filings"
                  element={getUserType() === 'parent' ? <NewYorkComplianceFiling /> : <Navigate to="/" />}
                />
                <Route
                  path="/california-psa"
                  element={getUserType() === 'parent' ? <CaliforniaPSA /> : <Navigate to="/" />}
                />
                 <Route
                  path="/newyork-psa"
                  element={getUserType() === 'parent' ? <NewyorkPSA /> : <Navigate to="/" />}
                />
                <Route
                  path="/california-psa-verify"
                  element={getUserType() === 'parent' ? <CaliforniaPSAVerify /> : <Navigate to="/" />}
                />
                <Route
                  path="/id-generation"
                  element={getUserType() === 'parent' ? <IdGeneration /> : <Navigate to="/" />}
                />
                <Route
                  path="/id-generation/view"
                  element={getUserType() === 'parent' ? <IdGenerationView /> : <Navigate to="/" />}
                />
                <Route
                  path="/work-permit"
                  element={getUserType() === 'parent' ? <WorkPermit /> : <Navigate to="/" />}
                />
                <Route
                  path="/work-permit/view"
                  element={getUserType() === 'parent' ? <WorkPermitsView /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-detail/:courseId"
                  element={getUserType() === 'parent' ? <CourseDetail /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-planning"
                  element={getUserType() === 'parent' ? <CoursePlanning /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-planning/math/:courseName"
                  element={getUserType() === 'parent' ? <MathCourseDetail /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-planning/course/:courseName"
                  element={getUserType() === 'parent' ? <CoursePlanningDetail /> : <Navigate to="/" />}
                />
                <Route
                  path="/extracurriculars"
                  element={getUserType() === 'parent' ? <Extracurriculars /> : <Navigate to="/" />}
                />
                <Route
                  path="/scholarships"
                  element={getUserType() === 'parent' ? <Scholarships /> : <Navigate to="/" />}
                />
                <Route path="/colleges" element={getUserType() === 'parent' ? <Colleges /> : <Navigate to="/" />} />
                <Route
                  path="/student-home"
                  element={getUserType() === 'parent' ? <HomeStudent /> : <Navigate to="/" />}
                />
                <Route
                  path="/testing-resources"
                  element={getUserType() === 'parent' ? <TestingResources /> : <Navigate to="/" />}
                />
                <Route
                  path="/marketplace/:providerId"
                  element={getUserType() === 'parent' ? <MarketplaceDetail /> : <Navigate to="/" />}
                />
                <Route path="/careers" element={getUserType() === 'parent' ? <Careers /> : <Navigate to="/" />} />
                <Route
                  path="/checkout"
                  element={getUserType() === 'parent' ? <CourseCheckout /> : <Navigate to="/" />}
                />
                <Route
                  path="/sierra-college-ae-form/:todoId?"
                  element={getUserType() === 'parent' ? <SierraCollegeAEForm /> : <Navigate to="/" />}
                />
                <Route
                  path="/sierra-college-admission-guide/:todoId?"
                  element={getUserType() === 'parent' ? <SierraCollegeAdmissionGuide /> : <Navigate to="/" />}
                />
                <Route
                  path="/sierra-college-enrollment-guide/:todoId?"
                  element={getUserType() === 'parent' ? <SierraCollegeEnrollmentGuide /> : <Navigate to="/" />}
                />

                {/* LA Fire Routes */}
                <Route
                  path="/courses"
                  element={getUserType() === 'lafire' ? <LACourseSearch /> : <Navigate to="/" />}
                />
                <Route
                  path="/compliance/regulations"
                  element={getUserType() === 'lafire' ? <StateRegulationOverview /> : <Navigate to="/" />}
                />
                <Route
                  path="/compliance/filing"
                  element={getUserType() === 'lafire' ? <StateComplianceFiling /> : <Navigate to="/" />}
                />
                 <Route
                  path="/compliance/filingss"
                  element={getUserType() === 'lafire' ? <NewYorkComplianceFiling /> : <Navigate to="/" />}
                />
                <Route
                  path="/compliance/funding"
                  element={getUserType() === 'lafire' ? <StateFundingOpportunities /> : <Navigate to="/" />}
                />
                <Route
                  path="/testing"
                  element={getUserType() === 'lafire' ? <TestingResources /> : <Navigate to="/" />}
                />

                {/* College Routes */}
                <Route
                  path="/admin-materials"
                  element={getUserType() === 'college' ? <AdminMaterials /> : <Navigate to="/" />}
                />
                <Route
                  path="/school-search"
                  element={getUserType() === 'college' ? <Colleges /> : <Navigate to="/" />}
                />
                <Route
                  path="/scholarships"
                  element={getUserType() === 'college' ? <Scholarships /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/school-philosophy"
                  element={getUserType() === 'college' ? <SchoolPhilosophy /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/transcript"
                  element={getUserType() === 'college' ? <Transcript /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/course-descriptions"
                  element={getUserType() === 'college' ? <CourseDescription /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/grading-rubric"
                  element={getUserType() === 'college' ? <GradingRubric /> : <Navigate to="/" />}
                />
                <Route
                  path="/admin-materials/guidance-counselor-letter"
                  element={getUserType() === 'college' ? <GuidanceLetter /> : <Navigate to="/" />}
                />

                {/* Student Routes */}
                <Route path="/" element={getUserType() === 'student' ? <StudentDashboard /> : <Navigate to="/" />} />
                <Route
                  path="/dashboard"
                  element={getUserType() === 'student' ? <StudentDashboard /> : <Navigate to="/" />}
                />
                <Route
                  path="/parent-academics"
                  element={getUserType() === 'student' ? <HomeParentAcademics /> : <Navigate to="/" />}
                />
                <Route
                  path="/id-generation/view"
                  element={getUserType() === 'student' ? <IdGenerationView /> : <Navigate to="/" />}
                />
                <Route
                  path="/attendance"
                  element={getUserType() === 'student' ? <RecordOfAttendance /> : <Navigate to="/" />}
                />
                <Route path="/my-courses" element={getUserType() === 'student' ? <MyCourses /> : <Navigate to="/" />} />
                <Route
                  path="/course-planning"
                  element={getUserType() === 'student' ? <CoursePlanning /> : <Navigate to="/" />}
                />
                <Route
                  path="/transcript"
                  element={getUserType() === 'student' ? <Transcript /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-description"
                  element={getUserType() === 'student' ? <CourseDescription /> : <Navigate to="/" />}
                />
                <Route
                  path="/common-app-landing"
                  element={getUserType() === 'student' ? <CommonAppLanding /> : <Navigate to="/" />}
                />
                <Route path="/college" element={getUserType() === 'student' ? <College /> : <Navigate to="/" />} />
                <Route path="/resume" element={getUserType() === 'student' ? <Resume /> : <Navigate to="/" />} />
                <Route path="/ledger" element={getUserType() === 'student' ? <Ledger /> : <Navigate to="/" />} />
                <Route
                  path="/ledger/company/:companyId"
                  element={getUserType() === 'student' ? <Ledger /> : <Navigate to="/" />}
                />
                <Route
                  path="/ledger/internships"
                  element={getUserType() === 'student' ? <Ledger /> : <Navigate to="/" />}
                />
                <Route path="/ledger/jobs" element={getUserType() === 'student' ? <Ledger /> : <Navigate to="/" />} />
                <Route
                  path="/ledger/career-exploration"
                  element={getUserType() === 'student' ? <Ledger /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-detail/:courseId"
                  element={getUserType() === 'student' ? <CourseDetail /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-planning/math/:courseName"
                  element={getUserType() === 'student' ? <MathCourseDetail /> : <Navigate to="/" />}
                />
                <Route
                  path="/course-planning/course/:courseName"
                  element={getUserType() === 'student' ? <CoursePlanningDetail /> : <Navigate to="/" />}
                />
                <Route
                  path="/marketplace/:providerId"
                  element={getUserType() === 'student' ? <MarketplaceDetail /> : <Navigate to="/" />}
                />
                <Route path="/careers" element={getUserType() === 'student' ? <Careers /> : <Navigate to="/" />} />

                {/* Common Protected Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/support" element={<Support />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CourseCheckout />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/course-planning" element={<CoursePlanning />} />
                <Route path="/user-type-test" element={<UserTypeTest />} />

                <Route path="/course-search" element={<CourseSearch />} />
                <Route path="/course-detail/:college/:courseCode" element={<CourseDetail />} />
                <Route path="/course/:courseId" element={<UserCoursePage />} />
                <Route path="/community" element={<Community />} />
                <Route path="/groups" element={<Navigate to="/groups/my-groups" replace />} />
                <Route path="/groups/my-groups" element={<Groups />} />
                <Route path="/groups/explore" element={<Groups />} />
                <Route path="/groups/q-and-a" element={<Groups />} />
                <Route path="/group/:groupId" element={<GroupPage />} />
                <Route path="/events" element={<Navigate to="/events/explore" replace />} />
                <Route path="/events/explore" element={<Events />} />
                <Route path="/events/my-events" element={<Events />} />
                <Route path="/events/:eventId" element={<PublicEvent />} />
                <Route path="/marketplace" element={<Marketplace />} />

                {/* Account Routes */}
                <Route path="/account/profile" element={<AccountProfile />} />
                <Route path="/account/settings" element={<AccountSettings />} />
                <Route path="/account/settings/change-password" element={<AccountSettings />} />
                <Route path="/account/household" element={<HouseholdManagement />} />
                <Route path="/account/notifications" element={<NotificationSettings />} />
                <Route path="/account/billing" element={<BillingSubscriptions />} />

                {/* <Route path="/todos" element={<UserTodos />} /> */}

                <Route
                  path="/campus-college-guide/:todoType/:todoId?"
                  element={getUserType() === 'parent' ? <CampusCollegeGuide /> : <Navigate to="/" />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to="/login-selection" replace />} />
                <Route
                  path="*"
                  element={
                    isInvitationPage || location.pathname === '/auth/confirm' ? (
                      <Outlet />
                    ) : (
                      <Navigate to="/login-selection" replace />
                    )
                  }
                />
              </>
            )}
          </Routes>
        </Box>
      </Box>

      {/* Show connection status indicator */}
      <ConnectionStatus />

      {/* Toast container for notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <div className="font-sans">
          <ScrollToTop />
          <PublicAccessProvider>
            <AppContent />
          </PublicAccessProvider>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
