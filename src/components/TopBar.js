import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { useTheme } from '@mui/material/styles'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Badge,
  ListItemIcon,
  Tooltip,
} from '@mui/material'
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { FaRegCalendarDays, FaQuestion, FaRegPaperPlane, FaRegBell, FaCartShopping } from 'react-icons/fa6'
import AuthWrapper from './AuthWrapper'
import { BodyText } from './ui/typography'
import { toast } from 'react-toastify'
import { BsEyeSlash } from 'react-icons/bs'
import { isFeatureVisible } from '../App'

const TODO_IMPORTANCE_THRESHOLD = 10

const TopBar = ({ handleInteraction }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [selectedStudent, setSelectedStudent] = useState(JSON.parse(localStorage.getItem('selectedStudent')))
  const [searchVisible, setSearchVisible] = useState(false)
  const [referralVisible, setReferralVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [referButtonRef, setReferButtonRef] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [referralEmail, setReferralEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [todosCount, setTodosCount] = useState(0)
  const [importantTodosCount, setImportantTodosCount] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [pageTitle, setPageTitle] = useState('')

  // Get user's name, fallback to email if name not available
  const displayName = (user?.user_metadata?.name || user?.email?.split('@')[0] || '')
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ')

  const getAccountType = () => {
    const userType = localStorage.getItem('userType')
    switch (userType) {
      case 'student':
        return 'Student'
      case 'college':
        return 'College'
      case 'lafire':
        return 'LA Fire'
      default:
        return ''
    }
  }

  const handleLogout = async () => {
    try {
      console.log('Logging out user...')
      // Close any open menus or dialogs
      setAnchorEl(null);
      
      // Call the logout function
      const logoutSuccess = await logout()
      
      // The logout function now handles navigation, but we'll add a fallback
      if (logoutSuccess) {
        console.log('Logout successful, navigation handled by AuthContext')
      } else {
        console.log('Fallback navigation to login page')
        navigate('/login-selection')
      }
    } catch (error) {
      console.error('Error during logout:', error)
      // Fallback navigation in case of error
      navigate('/login-selection')
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard!',
      severity: 'success',
    })
  }

  const handleSendReferral = () => {
    // Implement the logic to send a referral email
    console.log('Sending referral email to:', referralEmail)
    toast.success('Referral invitation sent!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  const handleNavigate = (e, path) => {
    e.preventDefault()
    navigate(path)
  }

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) {
        setCartItemsCount(0)
        return
      }

      try {
        const { count, error } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('saved_for_later', false)

        if (error) throw error

        setCartItemsCount(count || 0)
      } catch (error) {
        console.error('Error fetching cart count:', error)
        setCartItemsCount(0)
      }
    }

    fetchCartCount()

    // Subscribe to changes in cart_items
    const channel = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchCartCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user) {
        setProfilePicture('')
        return
      }

      console.log('Fetching profile picture for user:', user.id)
      
      try {
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error during profile picture fetch:', sessionError)
          setProfilePicture('')
          return
        }
        
        if (!session) {
          console.log('No session found during profile picture fetch')
          setProfilePicture('')
          return
        }
        
        // Try to get the profile picture
        const { data, error } = await supabase
          .from('account_profiles')
          .select('profile_picture')
          .eq('id', user.id)

        if (error) {
          console.error('Error fetching profile picture:', error)
          
          // If it's an auth error, try to refresh the session
          if (error.status === 401 || error.status === 406) {
            console.log('Auth error during profile picture fetch, refreshing session')
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
            
            if (refreshError) {
              console.error('Session refresh failed:', refreshError)
              setProfilePicture('')
              return
            }
            
            // Try again after refreshing
            const { data: retryData, error: retryError } = await supabase
              .from('account_profiles')
              .select('profile_picture')
              .eq('id', user.id)
              
            if (retryError) {
              console.error('Error fetching profile picture after refresh:', retryError)
              setProfilePicture('')
              return
            }
            
            if (retryData && retryData.length > 0 && retryData[0]?.profile_picture) {
              const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(`${user.id}/profile.jpg`)
              setProfilePicture(`${urlData?.publicUrl}?t=${new Date().getTime()}`)
              return
            }
          }
          
          setProfilePicture('')
          return
        }

        if (data && data.length > 0 && data[0]?.profile_picture) {
          const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(`${user.id}/profile.jpg`)
          setProfilePicture(`${urlData?.publicUrl}?t=${new Date().getTime()}`)
        } else {
          console.log('No profile picture found for user')
          setProfilePicture('')
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error)
        setProfilePicture('')
      }
    }

    fetchProfilePicture()

    // Listen for instant profile picture updates
    const handleProfilePictureUpdate = (event) => {
      setProfilePicture(event.detail.profilePicture)
    }
    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate)

    // Subscribe to changes in account_profiles
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_profiles',
          filter: `id=eq.${user?.id}`,
        },
        () => {
          fetchProfilePicture()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate)
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    const fetchTodosCount = async () => {
      if (!user) {
        setTodosCount(0)
        setImportantTodosCount(0)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_courses_todos')
          .select('importance, completed')
          .eq('uid', user.id)
          .eq('completed', false)

        if (error) throw error

        setTodosCount(data.length)
        setImportantTodosCount(data.filter((todo) => todo.importance >= TODO_IMPORTANCE_THRESHOLD).length)
      } catch (error) {
        console.error('Error fetching todos count:', error)
        setTodosCount(0)
        setImportantTodosCount(0)
      }
    }

    fetchTodosCount()

    // Subscribe to changes in user_courses_todos
    const channel = supabase
      .channel('todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_courses_todos',
          filter: `uid=eq.${user?.id}`,
        },
        () => {
          fetchTodosCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Add event listener for student changes
  useEffect(() => {
    const handleStudentChange = (event) => {
      setSelectedStudent(event.detail)
    }

    window.addEventListener('studentChanged', handleStudentChange)
    return () => window.removeEventListener('studentChanged', handleStudentChange)
  }, [])

  // Get page title based on current route
  const getPageTitle = () => {
    // Dashboard/Home routes
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      // Get just the first name for the welcome message
      const firstName = displayName.split(' ')[0]
      return `Welcome Home, ${firstName} 👋`
    }
    
    // Student Dashboard
    if (location.pathname === '/student-home') {
      const firstName = displayName.split(' ')[0]
      return `Welcome, ${firstName} 👋`
    }
    
    // Account routes
    if (location.pathname === '/account/profile') {
      return "Profile Information"
    }
    if (location.pathname === '/account/settings') {
      return "Account Settings"
    }
    if (location.pathname === '/account/household') {
      return "Household Management"
    }
    if (location.pathname === '/account/notifications') {
      return "Notification Settings"
    }
    if (location.pathname === '/account/billing') {
      return "Billing & Subscriptions"
    }
    
    // Calendar routes
    if (location.pathname === '/google-calendar' || location.pathname === '/calendar' || location.pathname === '/calendar2') {
      return "Calendar"
    }
    
    // Course routes
    if (location.pathname === '/my-courses') {
      return selectedStudent ? `${selectedStudent.student_name}'s Courses` : "My Courses"
    }
    if (location.pathname === '/course-search' || location.pathname === '/course-search/results') {
      return "Course Marketplace"
    }
    if (location.pathname.startsWith('/course-detail/')) {
      return "Course Details"
    }
    if (location.pathname.startsWith('/user-course/')) {
      const courseTitle = localStorage.getItem('currentCourseTitle')
      return selectedStudent && courseTitle ? `${selectedStudent.student_name}'s Course: ${courseTitle}` : "Course"
    }
    if (location.pathname === '/course-planning') {
      return selectedStudent ? `${selectedStudent.student_name}'s Course Planning` : "Course Planning"
    }
    if (location.pathname.startsWith('/course-planning/course/')) {
      const courseName = localStorage.getItem('currentCourseName') || 'Course'
      return `Course Planning: ${courseName}`
    }
    if (location.pathname.startsWith('/course-planning/math/')) {
      const courseName = location.pathname.split('/').pop() || 'Math Course'
      return `Math Course: ${courseName}`
    }
    
    // Compliance routes
    if (location.pathname.startsWith('/compliance')) {
      return "State Compliance Management"
    }
    if (location.pathname === '/california-psa') {
      return "2024-2025 California Private School Affidavit (PSA) Form"
    }
    if (location.pathname === '/california-psa-verify') {
      return "Verify California PSA Submission"
    }
    if (location.pathname === '/state-compliance-filing') {
      return "State Compliance Filing"
    }
    


    if (location.pathname.startsWith('/NewYorkCompliaceFiling')) {
      return "State Compliance Management"
    }
    if (location.pathname === '/newyork-psa') {
      return "2024-2025 NewYork Private school  Affidavit (PSA) Form"
    }
    if (location.pathname === '/california-psa-verify') {
      return "Verify California PSA Submission"
    }
    if (location.pathname === '/state-compliance-filing') {
      return "State Compliance Filing"
    }
    

    
    // Admin materials routes
    if (location.pathname === '/admin-materials' || location.pathname.startsWith('/admin-materials/')) {
      return "Administrative Materials"
    }
    if (location.pathname === '/school-philosophy' || location.pathname === '/admin-materials/school-philosophy') {
      return "School Philosophy"
    }
    if (location.pathname === '/guidance-letter' || location.pathname === '/admin-materials/guidance-counselor-letter') {
      return "Guidance Counselor Letter"
    }
    if (location.pathname === '/course-description' || location.pathname === '/admin-materials/course-descriptions') {
      return selectedStudent ? `${selectedStudent.student_name}'s Course Descriptions` : "Course Descriptions"
    }
    if (location.pathname === '/grading-rubric' || location.pathname === '/admin-materials/grading-rubric') {
      return "Grading Rubric"
    }
    if (location.pathname === '/transcript' || location.pathname === '/admin-materials/transcript') {
      return selectedStudent ? `${selectedStudent.student_name}'s Transcript` : "Transcript"
    }
    
    // ID and work permit routes
    if (location.pathname === '/id-generation') {
      return "Membership ID Generation"
    }
    if (location.pathname === '/id-generation/view') {
      return "Membership ID"
    }
    if (location.pathname === '/work-permit') {
      return "Work Permit Generation"
    }
    if (location.pathname === '/work-permit/view') {
      return "Work Permit"
    }
    
    // Student management routes
    if (location.pathname === '/add-student') {
      return "My Students"
    }
    if (location.pathname === '/attendance') {
      return "Attendance Records"
    }
    if (location.pathname === '/record-keeping') {
      return "Record Keeping"
    }
    
    // College and career routes
    if (location.pathname === '/college' || location.pathname === '/common-app-landing') {
      return "College"
    }
    if (location.pathname === '/colleges') {
      return "College Search"
    }
    if (location.pathname === '/scholarships') {
      return "Scholarships"
    }
    if (location.pathname === '/extracurriculars') {
      return "Extracurricular Activities"
    }
    if (location.pathname === '/testing-resources') {
      return "Testing Resources"
    }
    if (location.pathname === '/ledger' || location.pathname.startsWith('/ledger/')) {
      return "Career Center"
    }
    if (location.pathname === '/careers') {
      return "Careers"
    }
    if (location.pathname === '/internships' || location.pathname.startsWith('/internships/')) {
      return "Internships"
    }
    if (location.pathname === '/career-exploration') {
      return "Career Exploration"
    }
    
    // Community routes
    if (location.pathname === '/community') {
      return "Community"
    }
    if (location.pathname.startsWith('/groups')) {
      return "Groups"
    }
    if (location.pathname.startsWith('/group/')) {
      return "Group Details"
    }
    if (location.pathname.startsWith('/events')) {
      return "Events"
    }
    if (location.pathname.startsWith('/event/')) {
      return "Event Details"
    }
    
    // Marketplace routes
    if (location.pathname === '/marketplace') {
      return "YourEDU Perks"
    }
    if (location.pathname.startsWith('/marketplace/')) {
      return "Marketplace Provider"
    }
    if (location.pathname.startsWith('/provider/')) {
      return "Provider Details"
    }
    
    // Shopping routes
    if (location.pathname === '/cart') {
      return "Shopping Cart"
    }
    if (location.pathname === '/checkout') {
      return "Checkout"
    }
    
    // Support routes
    if (location.pathname === '/support') {
      return "Support and Feedback Center"
    }
    
    // Sierra College routes
    if (location.pathname.startsWith('/sierra-college-ae-form')) {
      return "Sierra College Advanced Education Form"
    }
    if (location.pathname.startsWith('/sierra-college-admission-guide')) {
      return "Sierra College Admission Guide"
    }
    if (location.pathname.startsWith('/sierra-college-enrollment-guide')) {
      return "Sierra College Enrollment Guide"
    }
    
    // Homeschool routes
    if (location.pathname === '/my-homeschool') {
      return "My Homeschool"
    }
    if (location.pathname === '/parent-academics') {
      return "Parent Academics"
    }
    
    // Module view
    if (location.pathname === '/module-view') {
      return "Module View"
    }
    
    // Resume route
    if (location.pathname === '/resume') {
      return selectedStudent ? `${selectedStudent.student_name}'s Resume` : "Resume"
    }
    
    // Default welcome message if no specific title is found
    const firstName = displayName.split(' ')[0]
    return `Welcome, ${firstName} 👋`
  }

  const CalendarIcon = ({ style }) => (
    <FaRegCalendarDays style={{ 
      ...style, 
      fontSize: '24px', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'auto',
      height: 'auto',
    }} />
  )

  // Replace isLocalEnvironment with shouldShowFeature
  const shouldShowFeature = isFeatureVisible()

  // Update page title when location changes
  useEffect(() => {
    setPageTitle(getPageTitle())
  }, [location.pathname, selectedStudent, displayName])

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'hsl(var(--border))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        pl: 4,
        pr: 4,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontSize: '1.75rem',
          fontWeight: 600,
          color: 'hsl(var(--text-primary))',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {(location.pathname.startsWith('/user-course/') || location.pathname === '/california-psa') && (
          <IconButton
            onClick={() => navigate(location.pathname === '/california-psa' ? '/compliance' : '/my-courses')}
            sx={{
              width: '40px',
              height: '40px',
              color: 'hsl(var(--text-primary))',
              backgroundColor: '#efefef',
              '&:hover': {
                backgroundColor: '#efefef',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        {pageTitle}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {user ? (
          <Tooltip title="Account">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {profilePicture ? (
                <Box
                  component="img"
                  src={profilePicture}
                  alt="Profile"
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#2563EB',
                  }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = ''
                    setProfilePicture('')
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#2563EB',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 600,
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Box>
              )}
            </Box>
          </Tooltip>
        ) : (
          <AuthWrapper>
            <Button
              variant="contained"
              onClick={() => navigate('/signup')}
              sx={{
                backgroundColor: `hsl(var(--brand-primary))`,
                color: 'white',
                '&:hover': {
                  backgroundColor: `hsl(var(--brand-primary-dark))`,
                },
              }}
            >
              Sign Up
            </Button>
          </AuthWrapper>
        )}
      </Box>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 'var(--radius)',
            minWidth: 220,
            boxShadow: 'var(--shadow-lg)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 600 }}>{displayName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { navigate('/account/profile'); setAnchorEl(null); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        {shouldShowFeature && (
          <MenuItem onClick={() => { navigate('/account/household'); setAnchorEl(null); }}>
            <ListItemIcon>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" />
                <BsEyeSlash style={{ fontSize: '10px', marginLeft: '2px', opacity: 0.7 }} />
              </Box>
            </ListItemIcon>
            Household
          </MenuItem>
        )}
        <MenuItem onClick={() => { navigate('/account/settings'); setAnchorEl(null); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleLogout(); setAnchorEl(null); }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Search Dialog */}
      <Dialog
        open={searchVisible}
        onClose={() => setSearchVisible(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 'var(--radius-lg)',
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
            }}
          >
            <SearchIcon sx={{ color: `hsl(var(--text-primary))` }} />
            <BodyText>Search</BodyText>
            <IconButton
              sx={{
                ml: 'auto',
                color: `hsl(var(--text-primary))`,
                '&:hover': {
                  backgroundColor: `hsl(var(--neutral-50))`,
                },
              }}
              onClick={() => setSearchVisible(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search for courses, events, groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mt: 'var(--spacing-2)',
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-sm)',
                '& fieldset': {
                  borderColor: `hsl(var(--neutral-200))`,
                },
                '&:hover fieldset': {
                  borderColor: `hsl(var(--neutral-300))`,
                },
                '&.Mui-focused fieldset': {
                  borderColor: `hsl(var(--brand-primary))`,
                },
              },
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Referral Popover */}
      <Dialog
        open={referralVisible}
        onClose={() => setReferralVisible(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-lg)',
            p: 3,
            minWidth: '800px',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Refer a Friend</Typography>
            <IconButton onClick={() => setReferralVisible(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Share YourEDU with your friends and earn rewards! For each friend that signs up using your referral link
              or email invitation, you'll both receive special benefits.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={`Join me on YourEDU - the premier platform for homeschool families! Start your homeschool journey with personalized learning tools and resources. Use my referral link and we'll both receive special rewards: https://app.youredu.school/signup?ref=${user?.id}`}
              InputProps={{
                readOnly: true,
                sx: { fontSize: '0.95rem', lineHeight: '1.5' },
                endAdornment: (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Join me on YourEDU - the premier platform for homeschool families! Start your homeschool journey with personalized learning tools and resources. Use my referral link and we'll both receive special rewards: https://app.youredu.school/signup?ref=${user?.id}`
                      )
                      setSnackbar({
                        open: true,
                        message: 'Referral link copied to clipboard!',
                        severity: 'success',
                      })
                    }}
                  >
                    Copy Link
                  </Button>
                ),
              }}
            />
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Or send an email invitation:
              </Typography>
              <TextField
                fullWidth
                label="Friend's Email"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSendReferral}
                sx={{
                  backgroundColor: 'hsl(var(--brand-primary))',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--brand-primary-dark))',
                  },
                }}
              >
                Send Invitation
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TopBar
