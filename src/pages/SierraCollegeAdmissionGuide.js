import React, { useState } from 'react'
import { Box, Container, Paper, Button, Typography, TextField } from '@mui/material'
import { PageHeader, SectionHeader, BodyText } from '../components/ui/typography'
import { OpenInNew as OpenInNewIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import { markTodoComplete } from '../utils/todoUtils'
import { toast } from 'react-toastify'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'

const SierraCollegeAdmissionGuide = () => {
  const { todoId } = useParams()
  const { user } = useAuth()
  const [sierraId, setSierraId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSierraIdSubmit = async () => {
    if (!sierraId.trim()) {
      toast.error('Please enter your Sierra College ID')
      return
    }

    setIsSubmitting(true)
    try {
      // Save Sierra ID to user's profile
      const { error: updateError } = await supabase
        .from('account_profiles')
        .update({ sierra_college_id: sierraId.trim() })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Mark todo as complete
      if (todoId) {
        await markTodoComplete(todoId)
      }

      toast.success('Sierra College ID saved successfully')
    } catch (error) {
      console.error('Error saving Sierra ID:', error)
      toast.error('Failed to save Sierra College ID')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{ py: 4, backgroundColor: 'hsl(var(--background))' }}>
      <Container maxWidth="lg">
        <PageHeader sx={{ mb: 4 }}>Sierra College Admission Guide</PageHeader>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            backgroundColor: 'white',
            mb: 4,
          }}
        >
          <SectionHeader sx={{ mb: 3 }}>Getting Started</SectionHeader>
          <BodyText sx={{ mb: 4 }}>
            To begin taking courses at Sierra College, you'll need to complete the admission process. This includes
            creating an OpenCCC account and submitting your application to Sierra College.
          </BodyText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Step 1: Create OpenCCC Account
              </Typography>
              <BodyText sx={{ mb: 2 }}>
                First, create an account on OpenCCC, the California Community Colleges application portal.
              </BodyText>
              <Button
                variant="contained"
                href="https://www.opencccapply.net/gateway/apply?cccMisCode=474"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={{
                  backgroundColor: 'hsl(var(--brand-primary))',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--brand-primary-dark))',
                  },
                }}
              >
                Go to OpenCCC
              </Button>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Step 2: Submit Sierra College Application
              </Typography>
              <BodyText sx={{ mb: 2 }}>
                After creating your OpenCCC account, complete and submit your application to Sierra College.
              </BodyText>
              <Button
                variant="contained"
                href="https://www.opencccapply.net/gateway/apply?cccMisCode=271&locale=en#undefined"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={{
                  backgroundColor: 'hsl(var(--brand-primary))',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--brand-primary-dark))',
                  },
                }}
              >
                View Application Guide
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            backgroundColor: 'white',
            mt: 4,
          }}
        >
          <Box sx={{ maxWidth: 500 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Enter Your Sierra College ID
            </Typography>
            <BodyText sx={{ mb: 3 }}>
              Once you've completed your application and received your Sierra College ID, enter it below to complete
              this step.
            </BodyText>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label="Sierra College ID"
                value={sierraId}
                onChange={(e) => setSierraId(e.target.value)}
                placeholder="Enter your ID number"
                sx={{ flex: 1 }}
                disabled={isSubmitting}
              />
              <Button
                variant="contained"
                onClick={handleSierraIdSubmit}
                disabled={!sierraId.trim() || isSubmitting}
                startIcon={<CheckCircleIcon />}
                sx={{
                  backgroundColor: 'hsl(var(--success))',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--success-dark))',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'hsl(var(--muted))',
                  },
                }}
              >
                Save ID
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default SierraCollegeAdmissionGuide
