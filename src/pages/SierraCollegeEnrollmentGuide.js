import React, { useState, useEffect } from 'react'
import { Box, Container, Paper, Button, Typography, CircularProgress } from '@mui/material'
import { PageHeader, SectionHeader, BodyText } from '../components/ui/typography'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import { markTodoComplete } from '../utils/todoUtils'
import { toast } from 'react-toastify'
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'

const SierraCollegeEnrollmentGuide = () => {
  const { todoId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        // First get the todo to get the course ID
        const { data: todo, error: todoError } = await supabase
          .from('user_courses_todos')
          .select('*')
          .eq('id', todoId)
          .single()

        if (todoError) throw todoError

        // Get the course ID (should be the only element in the array)
        const courseId = todo.user_course_ids[0]

        // Fetch the course details
        const { data: courseData, error: courseError } = await supabase
          .from('user_courses')
          .select('*')
          .eq('id', courseId)
          .single()

        if (courseError) throw courseError

        setCourse(courseData)
      } catch (error) {
        console.error('Error fetching course info:', error)
        toast.error('Failed to load course information')
      } finally {
        setLoading(false)
      }
    }

    if (todoId) {
      fetchCourseInfo()
    }
  }, [todoId])

  const handleEnrollmentComplete = async () => {
    try {
      if (!todoId) {
        console.warn('No todoId provided')
        return
      }

      console.log('Attempting to complete todo:', todoId) // Debug log
      const success = await markTodoComplete(todoId)

      if (success) {
        toast.success('Enrollment marked as complete')
      }
    } catch (error) {
      console.error('Error marking enrollment as complete:', error)
      toast.error('Failed to mark enrollment as complete')
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
        <PageHeader sx={{ mb: 4 }}>Sierra College Enrollment Guide</PageHeader>

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
          <SectionHeader sx={{ mb: 3 }}>Course Enrollment Process</SectionHeader>
          <BodyText sx={{ mb: 4 }}>
            After being admitted to Sierra College and submitting your AE form, you'll need to officially enroll in your
            courses through MySierra.
          </BodyText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Step 1: Log into MySierra
              </Typography>
              <BodyText sx={{ mb: 2 }}>
                Access your MySierra account using your Sierra College ID and password.
              </BodyText>
              <Button
                variant="contained"
                href="https://mysierra.sierracollege.edu/"
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
                Go to MySierra
              </Button>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Step 2: Add Your Course {course && `"${course.title}"`}
              </Typography>
              <BodyText>Once logged in:</BodyText>
              <Box component="ol" sx={{ mt: 1, mb: 2 }}>
                <li>Click on "Student Center"</li>
                <li>Select "Enroll in Classes"</li>
                <li>Choose the correct term</li>
                <li>
                  Enter the Course Reference Number (CRN): <b>{course && course.course_crn}</b>
                </li>
                <li>Complete the enrollment process</li>
              </Box>
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Completed Enrollment?
              </Typography>
              <BodyText>
                Click the button to mark your enrollment as complete once you've successfully enrolled in your courses
                through MySierra.
              </BodyText>
            </Box>
            <Button
              variant="contained"
              onClick={handleEnrollmentComplete}
              startIcon={<CheckCircleIcon />}
              sx={{
                backgroundColor: 'hsl(var(--success))',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'hsl(var(--success-dark))',
                },
              }}
            >
              I Have Enrolled
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default SierraCollegeEnrollmentGuide
