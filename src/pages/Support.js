import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Paper, Typography, Box, Grid, Button, TextField, MenuItem, Alert, Snackbar } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import ChatBot from '../components/ChatBot'
import { supabase } from '../utils/supabaseClient'
import { updateOnboardingProgress } from '../utils/onboardingUtils'

const SUPPORT_CATEGORIES = [
  { value: 'support', label: 'Support Request' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'question', label: 'General Question' },
  { value: 'other', label: 'Other' }
]

const Support = () => {
  const navigate = useNavigate()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current user and their profile data
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Fetch user's profile data
        const { data: profileData, error } = await supabase
          .from('account_profiles')
          .select('name, email')
          .eq('id', user.id)
          .single()

        if (!error && profileData) {
          setName(profileData.name || '')
          setEmail(profileData.email || user.email)
        } else {
          // Fallback to user's auth email if profile not found
          setEmail(user.email)
        }
      }
    }
    getCurrentUser()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!category) {
      setSnackbar({
        open: true,
        message: 'Please select a category',
        severity: 'error',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const messageData = {
        name,
        email,
        category,
        message,
      }

      // Add user_id if user is authenticated
      if (user) {
        messageData.user_id = user.id
      }

      const { data, error } = await supabase.from('support_messages').insert([messageData])

      if (error) throw error

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke('send-support-confirmation', {
        body: messageData,
      })

      if (emailError) {
        console.error('Error sending confirmation email:', emailError)
      }

      // Update onboarding progress
      if (user) {
        const { error: onboardingError } = await updateOnboardingProgress(user.id, 'submitted_feedback')
        if (onboardingError) {
          console.error('Error updating onboarding progress:', onboardingError)
        }
      }

      setIsSubmitSuccess(true)
      setCategory('')
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewMessage = () => {
    setIsSubmitSuccess(false)
    setCategory('')
    setMessage('')
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid hsl(var(--border))',
          mb: 3,
        }}
      >
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: 'var(--container-padding-x)',
            py: 3,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Typography
            sx={{
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2.1,
            }}
          >
            We're here to help! Submit your feedback, questions, or concerns and our team will get back to you as soon
            as possible.
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
              }}
            >
              {isSubmitSuccess ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#48BB78', mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, color: '#2D3748', fontWeight: 600 }}>
                    Message Received! 🎉
                  </Typography>
                  <Typography sx={{ mb: 1, color: '#4A5568' }}>
                    We've sent a copy of your submission to {email} for your records.
                  </Typography>
                  <Typography sx={{ mb: 4, color: '#4A5568' }}>
                    Our team will respond to your message as soon as we can! 💫
                  </Typography>
                  <Button
                    onClick={handleNewMessage}
                    variant="contained"
                    sx={{
                      backgroundColor: '#2563EB',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#2563EB',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Send Another Message
                  </Button>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      color: '#2d3748',
                      fontWeight: 600,
                    }}
                  >
                    Send Us Feedback, Questions, or Concerns
                  </Typography>

                  <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <TextField
                        label="Name"
                        value={name}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            '& fieldset': {
                              borderColor: '#e2e8f0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#4299e1',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4299e1',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#718096',
                          },
                          '& .Mui-disabled': {
                            WebkitTextFillColor: '#4a5568',
                            backgroundColor: '#f8fafc',
                          },
                        }}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={email}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            '& fieldset': {
                              borderColor: '#e2e8f0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#4299e1',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4299e1',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#718096',
                          },
                          '& .Mui-disabled': {
                            WebkitTextFillColor: '#4a5568',
                            backgroundColor: '#f8fafc',
                          },
                        }}
                      />
                      <TextField
                        select
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        fullWidth
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            '& fieldset': {
                              borderColor: '#e2e8f0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#4299e1',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4299e1',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#718096',
                          },
                        }}
                      >
                        {SUPPORT_CATEGORIES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Message"
                        multiline
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            '& fieldset': {
                              borderColor: '#e2e8f0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#4299e1',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4299e1',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#718096',
                          },
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        disableRipple
                        sx={{
                          mt: 1,
                          py: 1.5,
                          backgroundColor: '#2563EB',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: '#2563EB',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Box>
                  </form>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
export default Support
