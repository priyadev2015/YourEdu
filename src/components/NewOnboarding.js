import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { Box, List, ListItem, ListItemIcon, ListItemText, Button, Typography, CircularProgress, IconButton, Tooltip, Fade } from '@mui/material'
import { CheckCircle as CheckCircleIcon, Close as CloseIcon } from '@mui/icons-material'

const NewOnboarding = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState({
    watched_video: false,
    completed_profile: false,
    added_students: false,
    created_course: false,
    submitted_feedback: false,
  })
  const [selectedTask, setSelectedTask] = useState(null)

  // Check if onboarding should be hidden
  useEffect(() => {
    const onboardingHidden = localStorage.getItem('onboardingHidden') === 'true'
    if (onboardingHidden) {
      setIsVisible(false)
    }
  }, [])

  // Fetch initial progress
  useEffect(() => {
    fetchProgress()
  }, [user])

  // Select first incomplete task whenever progress changes
  useEffect(() => {
    if (!loading) {
      const firstIncompleteTask = Object.entries(taskDetails).find(
        ([taskId]) => !progress[taskId.replace(/-/g, '_')]
      )?.[0]
      setSelectedTask(firstIncompleteTask || Object.keys(taskDetails)[0])
    }
  }, [progress, loading])

  // Listen for progress updates from other components
  useEffect(() => {
    const handleProgressUpdate = (event) => {
      const { taskName, userId } = event.detail
      console.log('🔄 Received onboarding progress update:', { taskName, userId, currentUserId: user?.id })
      // Only update if it's for the current user
      if (userId === user?.id) {
        console.log('✅ Updating progress for task:', taskName)
        // The taskName comes from the database (e.g. 'completed_profile')
        // We need to match it to our progress state keys
        setProgress((prev) => {
          const newProgress = {
            ...prev,
            [taskName]: true,
          }
          console.log('📊 New progress state:', newProgress)
          return newProgress
        })
      }
    }

    window.addEventListener('onboarding-progress-updated', handleProgressUpdate)
    return () => window.removeEventListener('onboarding-progress-updated', handleProgressUpdate)
  }, [user])

  const fetchProgress = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase.from('onboarding_progress').select('*').eq('user_id', user.id).single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Create new record if none exists
          const { data: newData, error: insertError } = await supabase
            .from('onboarding_progress')
            .insert({
              user_id: user.id,
              watched_video: false,
              completed_profile: false,
              added_students: false,
              created_course: false,
              submitted_feedback: false,
            })
            .select()
            .single()

          if (!insertError) {
            setProgress({
              watched_video: false,
              completed_profile: false,
              added_students: false,
              created_course: false,
              submitted_feedback: false,
            })
          }
        }
      } else {
        setProgress({
          watched_video: data.watched_video || false,
          completed_profile: data.completed_profile || false,
          added_students: data.added_students || false,
          created_course: data.created_course || false,
          submitted_feedback: data.submitted_feedback || false,
        })
      }
    } catch (error) {
      console.error('Error in fetchProgress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (taskId) => {
    try {
      const dbTaskName = taskId.replace(/-/g, '_')
      
      // First check if record exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking record:', checkError)
        return
      }

      if (!existingRecord) {
        // Create new record
        const initialData = {
          user_id: user.id,
          watched_video: dbTaskName === 'watched_video',
          completed_profile: dbTaskName === 'completed_profile',
          added_students: dbTaskName === 'added_students',
          created_course: dbTaskName === 'created_course',
          submitted_feedback: dbTaskName === 'submitted_feedback',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: insertError } = await supabase
          .from('onboarding_progress')
          .insert(initialData)

        if (insertError) {
          console.error('Error creating record:', insertError)
          return
        }
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('onboarding_progress')
          .update({
            [dbTaskName]: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating record:', updateError)
          return
        }
      }

      // Update local state
      setProgress(prev => ({
        ...prev,
        [dbTaskName]: true
      }))

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('onboarding-progress-updated', {
          detail: { taskName: dbTaskName, userId: user.id }
        })
      )
    } catch (error) {
      console.error('Error in handleTaskComplete:', error)
    }
  }

  const calculateProgress = () => {
    const totalTasks = Object.keys(progress).length
    const completedTasks = Object.values(progress).filter(Boolean).length
    return Math.round((completedTasks / totalTasks) * 100)
  }

  const isFullyComplete = () => {
    return calculateProgress() === 100
  }

  const handleCloseOnboarding = () => {
    if (isFullyComplete()) {
      setIsVisible(false)
      localStorage.setItem('onboardingHidden', 'true')
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('onboarding-hidden', { 
        detail: { hidden: true }
      }))
    }
  }

  const taskDetails = {
    'watched-video': {
      title: 'Watch the Onboarding Video',
      description: "Get started with a comprehensive overview of YourEDU's features and benefits.",
      action: 'Watch Video',
      progressKey: 'watched_video',
    },
    'complete-profile': {
      title: 'Complete Setting Up Your Profile',
      description: 'Set up your profile information which will be used across the platform for personalization, communications, and administrative materials.',
      action: 'Edit Profile',
      progressKey: 'completed_profile',
    },
    'add-students': {
      title: 'Add Your Student(s)',
      description: 'Add your children to your account and set up their learning profiles.',
      action: 'Add Students',
      progressKey: 'added_students',
    },
    'create-course': {
      title: 'Add Your First Course',
      description: 'Start building your customized curriculum.',
      action: 'Create Course',
      progressKey: 'created_course',
    },
    'submit-feedback': {
      title: 'Submit the Feedback Form',
      description: 'Help us improve your experience by sharing your thoughts.',
      action: 'Submit Feedback',
      progressKey: 'submitted_feedback',
    },
  }

  const handleButtonClick = (taskId) => {
    // Handle navigation immediately
    switch (taskId) {
      case 'watched-video':
        window.dispatchEvent(new Event('show-video-overlay'))
        handleTaskComplete(taskId) // Mark video as complete immediately
        break
      case 'complete-profile':
        navigate('/account/profile')
        // Don't mark as complete - will be marked when profile is actually completed
        break
      case 'add-students':
        navigate('/add-student', { state: { openCreateDialog: true } })
        handleTaskComplete(taskId)
        break
      case 'create-course':
        navigate('/my-courses', { state: { openCreateCourse: true } })
        handleTaskComplete(taskId)
        break
      case 'submit-feedback':
        navigate('/support')
        handleTaskComplete(taskId)
        break
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (!isVisible) {
    return null
  }

  return (
    <Box
      sx={{
        mb: 3,
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid hsl(var(--border))',
        p: 'var(--spacing-4)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
    >
      {/* Close button - only visible when progress is 100% */}
      {isFullyComplete() && (
        <span style={{ position: 'absolute', top: 12, right: 12 }}>
          <IconButton 
            onClick={handleCloseOnboarding}
            sx={{
              color: 'hsl(var(--text-primary))',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </span>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pr: 4 }}>
        <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#000000' }}>
          Please complete the onboarding to get the most out of YourEDU!
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: '8px',
          backgroundColor: 'hsl(var(--neutral-200))',
          borderRadius: 'var(--radius-full)',
          position: 'relative',
          mb: 1,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${calculateProgress()}%`,
            height: '100%',
            backgroundColor: 'hsl(var(--success))',
            borderRadius: 'var(--radius-full)',
          }}
        />
        
        {/* Progress info positioned to the right */}
        <Box
          sx={{
            position: 'absolute',
            right: 12,
            top: -18,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isFullyComplete() && (
            <Typography 
              sx={{ 
                fontSize: '0.75rem', 
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600
              }}
            >
              All tasks complete! Click X to dismiss
            </Typography>
          )}
          <Typography 
            sx={{ 
              fontSize: '0.75rem', 
              color: 'hsl(var(--text-secondary))',
              fontWeight: 500,
            }}
          >
            {calculateProgress()}% completed
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex' }}>
        {/* Left side - Task list */}
        <Box sx={{ width: '35%', borderRight: '1px solid', borderColor: 'hsl(var(--border))', pr: 1 }}>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pb: 0 }}>
            {Object.entries(taskDetails).map(([taskId, task]) => {
              const isComplete = Boolean(progress[task.progressKey])

              return (
                <ListItem
                  key={taskId}
                  onClick={() => setSelectedTask(taskId)}
                  sx={{
                    p: 0.5,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: selectedTask === taskId ? 'hsla(var(--brand-primary), 0.08)' : 'transparent',
                    '&:hover': { backgroundColor: 'hsla(var(--brand-primary), 0.04)' },
                    color: isComplete ? 'hsl(var(--success))' : 'hsl(var(--text-secondary))',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {isComplete ? (
                      <CheckCircleIcon sx={{ color: 'hsl(var(--success))' }} />
                    ) : (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'hsl(var(--text-secondary))',
                        }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: selectedTask === taskId ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
                      },
                    }}
                  />
                </ListItem>
              )
            })}
          </List>
        </Box>

        {/* Right side - Task details */}
        <Box sx={{ width: '65%', pl: 3, pb: 0 }}>
          {selectedTask ? (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--text-primary))', mb: 2, pt: 2.5 }}
              >
                {taskDetails[selectedTask].title}
              </Typography>
              <Typography sx={{ color: 'hsl(var(--text-primary))', fontSize: '0.875rem', lineHeight: 1.6, mb: 4 }}>
                {taskDetails[selectedTask].description}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  if (!selectedTask) {
                    console.log('⚠️ No task selected')
                    return
                  }
                  handleButtonClick(selectedTask)
                }}
                sx={{
                  backgroundColor: '#2563EB',
                  color: 'white',
                  height: 36,
                  '&:hover': {
                    backgroundColor: '#2563EB',
                  },
                  transition: 'none',
                  boxShadow: 'none',
                  textTransform: 'none',
                }}
              >
                {taskDetails[selectedTask].action}
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Select a task to view more details
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default NewOnboarding
