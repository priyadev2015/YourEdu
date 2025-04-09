import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import ChatBot from '../components/ChatBot'

import { cardStyles } from '../styles/theme/components/cards'
import { Container, Grid, Box, Button, Typography, CircularProgress } from '@mui/material'
import VideoOverlay from '../components/VideoOverlay'
import { supabase } from '../utils/supabaseClient'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import NewOnboarding from '../components/NewOnboarding'
import GoogleCalendarComponent from '../pages/MyGoogleCalendar'
import { updateOnboardingProgress } from '../utils/onboardingUtils'

dayjs.extend(relativeTime)

const Home = () => {
  const { user } = useAuth()
  const firstName = (user?.user_metadata?.name || user?.email?.split('@')[0] || 'Parent')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const [onboardingVisible, setOnboardingVisible] = useState(true)

  // Check if onboarding should be hidden
  useEffect(() => {
    const checkOnboardingVisibility = () => {
      const onboardingHidden = localStorage.getItem('onboardingHidden') === 'true'
      setOnboardingVisible(!onboardingHidden)
    }
    
    // Check on mount
    checkOnboardingVisibility()
    
    // Listen for storage changes
    window.addEventListener('storage', checkOnboardingVisibility)
    
    return () => {
      window.removeEventListener('storage', checkOnboardingVisibility)
    }
  }, [])

  // Add event listener for onboarding hidden event
  useEffect(() => {
    const handleOnboardingHidden = (event) => {
      console.log('Onboarding hidden event received')
      setOnboardingVisible(false)
    }

    window.addEventListener('onboarding-hidden', handleOnboardingHidden)
    return () => window.removeEventListener('onboarding-hidden', handleOnboardingHidden)
  }, [])

  // Add event listener for video overlay
  useEffect(() => {
    const handleShowVideo = () => {
      console.log('Show video event received')
      setShowVideo(true)
    }

    window.addEventListener('show-video-overlay', handleShowVideo)
    return () => window.removeEventListener('show-video-overlay', handleShowVideo)
  }, [])

  // Add separate useEffect for fetching notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true)
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error
        setNotifications(data)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleCloseVideo = async () => {
    console.log('Video closed')
    setShowVideo(false)
    localStorage.setItem('hasSeenWelcomeVideo', 'true')

    // Update onboarding progress
    const { error } = await updateOnboardingProgress(user?.id, 'watched_video')
    if (error) {
      console.error('Error updating onboarding progress:', error)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
        {/* Hero Section */}
        <Box
          sx={{
            ...cardStyles.hero,
            pt: 'var(--spacing-2)',
            pb: 'var(--spacing-3)',
          }}
        >
          <Container
            maxWidth="var(--container-max-width)"
            sx={{
              position: 'relative',
              px: 'var(--container-padding-x)',
              py: 'var(--container-padding-y)',
              '@media (--tablet)': {
                px: 'var(--container-padding-x-mobile)',
              },
            }}
          >
            {/* Onboarding component */}
            <NewOnboarding />

            {/* New Feature Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* My Courses Card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    backgroundColor: 'hsl(var(--neutral-100))',
                    borderRadius: 'var(--radius-lg)',
                    p: 'var(--spacing-4)',
                    height: '100%',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#000000',
                        mb: 1,
                      }}
                    >
                      My Courses
                    </Typography>
                    <Typography
                      sx={{
                        color: '#000000',
                        fontSize: '0.875rem',
                        mb: 3,
                      }}
                    >
                      Create and manage your courses
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/my-courses', { state: { openCreateCourse: true } })}
                    sx={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      width: '50%',
                      '&:hover': {
                        backgroundColor: '#2563EB',
                      },
                      transition: 'none',
                      textTransform: 'none',
                    }}
                  >
                    Create a Course
                  </Button>
                </Box>
              </Grid>

              {/* Academics Card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    backgroundColor: 'hsl(var(--neutral-100))',
                    borderRadius: 'var(--radius-lg)',
                    p: 'var(--spacing-4)',
                    height: '100%',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#000000',
                        mb: 1,
                      }}
                    >
                      Academics
                    </Typography>
                    <Typography
                      sx={{
                        color: '#000000',
                        fontSize: '0.875rem',
                        mb: 3,
                      }}
                    >
                      Understand the minimum, standard, and accelerated academic paths for high school
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      width: '50%',
                      '&:hover': {
                        backgroundColor: '#2563EB',
                      },
                      transition: 'none',
                      textTransform: 'none',
                    }}
                    onClick={() => navigate('/course-planning')}
                  >
                    Explore Tracks
                  </Button>
                </Box>
              </Grid>

              {/* Admin Materials Card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    backgroundColor: 'hsl(var(--neutral-100))',
                    borderRadius: 'var(--radius-lg)',
                    p: 'var(--spacing-4)',
                    height: '100%',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#000000',
                        mb: 1,
                      }}
                    >
                      Admin Materials
                    </Typography>
                    <Typography
                      sx={{
                        color: '#000000',
                        fontSize: '0.875rem',
                        mb: 3,
                      }}
                    >
                      Create and manage your student's administrative materials
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#2563EB',
                        color: 'white',
                        height: 36,
                        width: '50%',
                        '&:hover': {
                          backgroundColor: '#2563EB',
                        },
                        transition: 'none',
                        textTransform: 'none',
                      }}
                      onClick={() => navigate('/transcript')}
                    >
                      Transcript
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#2563EB',
                        color: 'white',
                        height: 36,
                        width: '50%',
                        '&:hover': {
                          backgroundColor: '#2563EB',
                        },
                        transition: 'none',
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 'fit-content',
                        px: 2,
                      }}
                      onClick={() => navigate('/course-description')}
                    >
                      Course Descriptions
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Schedule and Updates Section */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Schedule Section */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid hsl(var(--border))',
                    height: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 3,
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'hsl(var(--border))',
                      height: '60px'
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      Snapshot of your schedule
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/google-calendar')}
                      sx={{
                        backgroundColor: '#2563EB',
                        color: 'white',
                        height: 36,
                        '&:hover': {
                          backgroundColor: '#2563EB',
                        },
                        transition: 'none',
                        textTransform: 'none',
                      }}
                    >
                      View Calendar
                    </Button>
                  </Box>
                  <Box sx={{ 
                    px: 3,
                    py: 2,
                    flex: 1, 
                    overflow: 'hidden'
                  }}>
                    <GoogleCalendarComponent 
                      containerHeight="200px" 
                      hideStudentSelector={true} 
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Updates Section */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid hsl(var(--border))',
                    height: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 3,
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'hsl(var(--border))',
                      height: '60px'
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      Snapshot of your notifications
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {notificationsLoading ? (
                        <Box display="flex" justifyContent="center">
                          <CircularProgress size={24} />
                        </Box>
                      ) : notifications.length > 0 ? (
                        notifications.slice(0, 2).map((notification) => (
                          <Box 
                            key={notification.id} 
                            sx={{ 
                              mb: 2,
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: 'var(--radius-md)',
                              p: 2.5,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'hsl(var(--accent) / 0.1)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              },
                            }}
                          >
                            <Box>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                mb: 1,
                                flexWrap: 'wrap'
                              }}>
                                <Box
                                  component="span"
                                  sx={{
                                    backgroundColor: notification.source === 'YOUREDU_ADMIN' 
                                      ? 'hsl(var(--brand-primary) / 0.15)' 
                                      : 'hsl(var(--muted))',
                                    color: notification.source === 'YOUREDU_ADMIN' 
                                      ? 'hsl(var(--brand-primary))' 
                                      : 'hsl(var(--muted-foreground))',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    border: notification.source === 'YOUREDU_ADMIN' 
                                      ? '1px solid hsl(var(--brand-primary) / 0.25)' 
                                      : '1px solid hsl(var(--border))',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    height: '24px',
                                  }}
                                >
                                  {notification.source === 'YOUREDU_ADMIN' ? 'YourEDU' : 'System'}
                                </Box>
                                <Typography 
                                  sx={{ 
                                    color: 'hsl(var(--text-primary))', 
                                    fontWeight: 600,
                                    fontSize: '0.925rem',
                                    flex: 1,
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                <Typography 
                                  sx={{ 
                                    color: 'hsl(var(--text-secondary))', 
                                    fontSize: '0.75rem',
                                    ml: 'auto'
                                  }}
                                >
                                  {dayjs(notification.created_at).fromNow()}
                                </Typography>
                              </Box>
                              <Typography 
                                sx={{ 
                                  color: 'hsl(var(--text-secondary))', 
                                  fontSize: '0.875rem', 
                                  mb: 1.5,
                                  lineHeight: 1.5
                                }}
                              >
                                {notification.message}
                              </Typography>
                              {notification.action_url && notification.action_text && (
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => window.open(notification.action_url, '_blank')}
                                  sx={{
                                    color: 'hsl(var(--brand-primary))',
                                    p: 0,
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    '&:hover': {
                                      backgroundColor: 'transparent',
                                      textDecoration: 'underline',
                                    },
                                  }}
                                >
                                  {notification.action_text}
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box 
                          sx={{ 
                            textAlign: 'center', 
                            color: 'hsl(var(--text-secondary))',
                            p: 4,
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <Typography>No notifications at this time</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Main Content */}
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: 'var(--container-padding-x)',
            py: 'var(--spacing-3)',
            '@media (max-width: 768px)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        ></Container>

        <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </Box>

      {/* Video Overlay - Moved outside of all containers */}
      <VideoOverlay isVisible={showVideo} onClose={handleCloseVideo} />
    </>
  )
}

export default Home
