import React, { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'
import { Box, Container, Paper, Button, CircularProgress, Typography } from '@mui/material'
import { PageHeader } from '../components/ui/typography'
import RegistrationModal from '../components/RegistrationModal'
import { toast } from 'react-toastify'
import { markTodoComplete } from '../utils/todoUtils'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const SierraCollegeAEForm = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { todoId } = useParams()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [formGenerated, setFormGenerated] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('user_courses')
          .select('*')
          .eq('uid', user.id)
          .eq('college', 'Sierra College')
          .order('created_at', { ascending: true })

        if (error) throw error

        setCourses(data.slice(0, 4))
      } catch (error) {
        console.error('Error fetching courses:', error)
        toast.error('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user, location.state])

  const handleRegistrationModalClose = async (wasDownloaded = false) => {
    setShowRegistrationModal(false)
    if (wasDownloaded) {
      setFormGenerated(true)
      if (todoId) {
        await markTodoComplete(todoId)
      }
      toast.success('AE Form generated successfully')
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ py: 4, backgroundColor: 'hsl(var(--background))' }}>
      <Container maxWidth="lg">
        <PageHeader sx={{ mb: 4 }}>Advanced Education Form</PageHeader>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            backgroundColor: 'white',
          }}
        >
          {courses.length === 0 ? (
            <Typography color="error">
              No Sierra College courses found. Please enroll in courses before generating the AE form.
            </Typography>
          ) : (
            <>
              {formGenerated ? (
                <Box>
                  <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'hsl(var(--success))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircleIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'hsl(var(--success))', mb: 0.5 }}>
                        AE Form Generated Successfully!
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        Your form has been downloaded to your computer.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography sx={{ mb: 3 }}>
                    The Advanced Education (AE) form is required for all high school students taking courses at Sierra
                    College. Please complete this form to proceed with your enrollment.
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => setShowRegistrationModal(true)}
                    sx={{
                      backgroundColor: 'hsl(var(--brand-primary))',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--brand-primary-dark))',
                      },
                    }}
                  >
                    Next: Sign AE Form
                  </Button>
                </>
              )}

              {showRegistrationModal && (
                <RegistrationModal
                  courses={courses}
                  onClose={(wasDownloaded) => handleRegistrationModalClose(wasDownloaded)}
                />
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default SierraCollegeAEForm
