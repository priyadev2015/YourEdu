import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import GoogleCalendarService from '../services/googleCalendarService'
import { useNavigate } from 'react-router-dom'

// Add constant for "All Students" option with valid UUID
const ALL_STUDENTS_OPTION = {
  id: '00000000-0000-0000-0000-000000000000', // Zero UUID to represent "All Students"
  student_name: 'All Students',
  isAllStudents: true,
}

// Define an array of Google Calendar color values
const calendarColors = [
  '%23A32929', // Red
  '%23B1440E', // Orange
  '%23AB8B00', // Yellow
  '%23076239', // Green
  '%230D7813', // Dark Green
  '%23254117', // Olive
  '%23125A12', // Dark Olive
  '%230F4B38', // Teal
  '%232952A3', // Blue
  '%237A367A', // Purple
  '%235229A3', // Violet
]

/**
 * Synchronizes calendar for a specific student or all students
 * @param {Object} params
 * @param {string} params.userId - The user's ID
 * @param {string} params.userEmail - The user's email
 * @param {Object} [params.student] - Student object. If not provided, syncs for all students
 * @param {boolean} [params.skipDatabaseEntry] - Whether to skip updating the database
 * @returns {Promise<string>} The ID of the created calendar
 */
export const syncUserCalendars = async ({ userId, userEmail, student, skipDatabaseEntry = false }) => {
  console.log('Starting calendar sync with params:', { userId, userEmail, student, skipDatabaseEntry })
  try {
    // Fetch courses for individual student
    const { data: userCourses, error: userCoursesError } = await supabase
      .from('user_courses')
      .select('*')
      .eq('student_id', student.id)

    if (userCoursesError) throw userCoursesError
    console.log('Found user courses:', userCourses?.length)

    const { data: youreduCourses, error: youreduError } = await supabase
      .from('youredu_courses')
      .select('*')
      .eq('student_id', student.id)
      .or(`creator_id.eq.${userId},teachers.cs.{${userId}}`)

    if (youreduError) throw youreduError
    console.log('Found youredu courses:', youreduCourses?.length)

    const coursesData = [...(userCourses || []), ...(youreduCourses || [])]
    console.log('Total courses to sync:', coursesData.length)

    const googleCalendar = new GoogleCalendarService()
    let calendarId = null

    // Check for existing calendar only if we're not skipping database entry
    if (!skipDatabaseEntry) {
      console.log('Checking for existing calendar')
      const { data: existingCalendar } = await supabase
        .from('user_calendars')
        .select('calendar_id')
        .eq('student_id', student.id)
        .maybeSingle()

      if (existingCalendar?.calendar_id) {
        console.log('Found existing calendar:', existingCalendar.calendar_id)
        calendarId = existingCalendar.calendar_id

        try {
          // Check if calendar still exists in Google Calendar
          console.log('Checking if calendar exists in Google Calendar')
          const exists = await googleCalendar.checkCalendarExists(calendarId)
          console.log('Calendar exists check result:', exists)

          if (exists) {
            console.log('Calendar exists in Google Calendar, clearing events')
            await googleCalendar.clearCalendarEvents(calendarId)
            console.log('Successfully cleared calendar events')
          } else {
            console.log('Calendar no longer exists in Google Calendar, creating new one')
            calendarId = await googleCalendar.createUserCalendar(student.id, userEmail, student.student_name)
            console.log('Created new calendar:', calendarId)

            // Update the calendar ID in the database
            const { error: updateError } = await supabase
              .from('user_calendars')
              .update({ calendar_id: calendarId })
              .eq('student_id', student.id)

            if (updateError) {
              console.error('Failed to update calendar ID in database:', updateError)
              throw new Error('Failed to update calendar information in database')
            }
            console.log('Successfully updated calendar ID in database')
          }
        } catch (error) {
          console.error('Error handling existing calendar:', error)
          throw new Error(`Calendar sync failed: ${error.message}`)
        }
      }
    }

    // Create new calendar if we don't have one yet
    if (!calendarId) {
      console.log('No existing calendar found, creating new one')
      try {
        calendarId = await googleCalendar.createUserCalendar(student.id, userEmail, student.student_name)
        console.log('Created new calendar:', calendarId)

        // Save to database only if not skipping
        if (!skipDatabaseEntry) {
          console.log('Saving calendar info to database')
          const { error: insertError } = await supabase.from('user_calendars').insert([
            {
              id: crypto.randomUUID(),
              student_id: student.id,
              calendar_id: calendarId,
              is_combined_calendar: false,
              created_at: new Date().toISOString(),
              is_active: true,
              last_sync: new Date().toISOString(),
            },
          ])

          if (insertError) {
            console.error('Failed to save calendar to database:', insertError)
            throw new Error(`Failed to save calendar information to database: ${insertError.message}`)
          }
          console.log('Successfully saved calendar to database')
        }
      } catch (error) {
        console.error('Error in calendar creation/save:', error)
        throw error
      }
    }

    // Add courses to calendar
    console.log('Starting to add courses to calendar')
    for (const course of coursesData) {
      console.log('Adding course to calendar:', {
        courseTitle: course.title,
        studentName: student.student_name,
      })
      await googleCalendar.addCourseToCalendar(calendarId, course)
    }

    console.log('Calendar sync completed successfully')
    return calendarId
  } catch (error) {
    console.error('Failed to sync calendar:', error)
    throw error
  }
}

const GoogleCalendarComponent = ({ containerHeight = '800px', hideStudentSelector = false }) => {
  const { user } = useAuth()
  const [calendarId, setCalendarId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedCalendarStudent, setSelectedCalendarStudent] = useState(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase.from('students').select('*').eq('parent_id', user.id)

        if (error) throw error

        setStudents([ALL_STUDENTS_OPTION, ...(data || [])])

        // If hideStudentSelector is true, always use ALL_STUDENTS_OPTION
        if (hideStudentSelector) {
          setSelectedCalendarStudent(ALL_STUDENTS_OPTION)
          return
        }

        // Set default selected student from localStorage
        const savedStudent = localStorage.getItem('selectedStudent')
        if (savedStudent) {
          const parsedStudent = JSON.parse(savedStudent)
          setSelectedCalendarStudent(parsedStudent)
        } else if (data && data.length > 0) {
          setSelectedCalendarStudent(ALL_STUDENTS_OPTION) // Default to All Students view
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        setError('Failed to fetch students list')
      }
    }

    if (user) {
      fetchStudents()
    }
  }, [user, hideStudentSelector])

  useEffect(() => {
    if (user && selectedCalendarStudent) {
      initializeCalendar()
    }
  }, [user, selectedCalendarStudent])

  const initializeCalendar = async () => {
    if (isInitializing) {
      console.log('Calendar initialization already in progress, skipping')
      return
    }

    console.log('Starting calendar initialization with student:', selectedCalendarStudent)

    try {
      setError(null)
      setLoading(true)
      setIsInitializing(true)

      if (!selectedCalendarStudent) {
        console.log('No student selected, skipping initialization')
        return
      }

      if (selectedCalendarStudent.isAllStudents) {
        console.log('Fetching all student calendars')
        // First get all students for the parent
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id, student_name')
          .eq('parent_id', user.id)

        console.log('Students query result:', { data: students, error: studentsError })

        if (studentsError) {
          console.error('Error fetching students:', studentsError)
          throw studentsError
        }

        if (!students?.length) {
          console.log('No students found')
          setCalendarId(null)
          return
        }

        // Then get calendars for these students
        const { data: studentCalendars, error: dbError } = await supabase
          .from('user_calendars')
          .select('calendar_id')
          .in(
            'student_id',
            students.map((s) => s.id)
          )

        console.log('Student calendars query result:', { data: studentCalendars, error: dbError })

        if (dbError) {
          console.error('Database error:', dbError)
          throw dbError
        }

        if (studentCalendars?.length > 0) {
          // Combine all calendar IDs into a single string for the iframe src
          const combinedCalendarIds = studentCalendars
            .map((cal, index) => {
              const colorParam = `&color=${calendarColors[index % calendarColors.length]}`
              return `src=${encodeURIComponent(cal.calendar_id)}${colorParam}`
            })
            .join('&')
          console.log('Combined calendar IDs:', combinedCalendarIds)
          setCalendarId(combinedCalendarIds)
        } else {
          console.log('No student calendars found')
          setCalendarId(null)
        }
      } else {
        // Handle individual student calendar
        console.log('Fetching individual student calendar for:', selectedCalendarStudent.student_name)
        const { data: calendarData, error: dbError } = await supabase
          .from('user_calendars')
          .select('calendar_id')
          .eq('student_id', selectedCalendarStudent.id)
          .maybeSingle()

        console.log('Individual calendar query result:', { data: calendarData, error: dbError })

        if (dbError && dbError.code !== 'PGRST116') {
          console.error('Database error fetching calendar:', dbError)
          throw dbError
        }

        if (calendarData?.calendar_id) {
          console.log('Found existing calendar:', calendarData.calendar_id)
          setCalendarId(calendarData.calendar_id)
        } else {
          console.log('No existing calendar found for student:', selectedCalendarStudent.student_name)
          setCalendarId(null)
        }
      }
    } catch (error) {
      console.error('Error checking for calendar:', error)
      setError('Failed to check for calendar')
    } finally {
      setLoading(false)
      setIsInitializing(false)
    }
  }

  const syncCourses = async () => {
    if (!selectedCalendarStudent) return

    try {
      setError(null)
      setSyncing(true)
      console.log('Starting calendar sync for:', selectedCalendarStudent)

      if (selectedCalendarStudent.isAllStudents) {
        // Get all students
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', user.id)

        if (studentsError) throw studentsError

        console.log('Students to sync:', students)

        // Sync calendar for each student
        const syncPromises = students.map((student) =>
          syncUserCalendars({
            userId: user.id,
            userEmail: user.email,
            student: {
              id: student.id,
              student_name: student.student_name,
            },
          })
        )

        await Promise.all(syncPromises)
        console.log('All individual student calendars synced')

        // Also sync the "All Students" calendar
        await syncUserCalendars({
          userId: user.id,
          userEmail: user.email,
          student: {
            id: '00000000-0000-0000-0000-000000000000',
            student_name: 'All Students',
            isAllStudents: true,
          },
        })

        // After all syncs complete, get all calendar IDs
        const { data: studentCalendars, error: calendarError } = await supabase
          .from('user_calendars')
          .select('calendar_id')
          .in(
            'student_id',
            students.map((s) => s.id)
          )

        if (calendarError) throw calendarError

        if (studentCalendars?.length > 0) {
          const combinedCalendarIds = studentCalendars
            .map((cal, index) => {
              const colorParam = `&color=${calendarColors[index % calendarColors.length]}`
              return `src=${encodeURIComponent(cal.calendar_id)}${colorParam}`
            })
            .join('&')
          setCalendarId(combinedCalendarIds)
        }
      } else {
        // Sync individual student calendar
        console.log('Syncing individual student calendar for:', selectedCalendarStudent.student_name)
        const newCalendarId = await syncUserCalendars({
          userId: user.id,
          userEmail: user.email,
          student: selectedCalendarStudent,
        })

        console.log('Calendar synced with ID:', newCalendarId)
        setCalendarId(newCalendarId)
      }

      console.log('Calendar sync completed successfully')
      // Refresh the calendar display
      initializeCalendar()
    } catch (error) {
      console.error('Failed to sync calendar:', error)
      setError(`Failed to sync calendar: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      {!hideStudentSelector && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mt: 2,
              ml: 2,
            }}
          >
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel
                sx={{
                  color: '#000000',
                  '&.Mui-focused': {
                    color: '#00356B',
                  },
                }}
              >
                Select Calendar
              </InputLabel>
              <Select
                value={selectedCalendarStudent?.id || ''}
                label="Select Calendar"
                onChange={(e) => {
                  const student = students.find((s) => s.id === e.target.value)
                  console.log('Selected student:', student)
                  setSelectedCalendarStudent(student)
                  setCalendarId(null)
                }}
                sx={{
                  backgroundColor: 'white',
                  height: 36,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'hsl(var(--border))',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'hsl(var(--border))',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00356B',
                  },
                  '& .MuiSelect-select': {
                    color: '#000000',
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00356B',
                    },
                  },
                }}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.student_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Add sync and refresh buttons */}
          <Box sx={{ mt: 2, mr: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={initializeCalendar}
              disabled={loading || !selectedCalendarStudent}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
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
              {loading ? 'Loading...' : 'Refresh'}
            </Button>

            <Button
              variant="contained"
              onClick={syncCourses}
              disabled={syncing || !selectedCalendarStudent}
              startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : null}
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
              {syncing ? 'Syncing...' : 'Sync Calendar'}
            </Button>
          </Box>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Box
        sx={{
          position: 'relative',
          height: containerHeight,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px'
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : calendarId ? (
          <iframe
            src={`https://calendar.google.com/calendar/embed?${calendarId}&ctz=America%2FLos_Angeles&mode=WEEK`}
            style={{
              width: '100%',
              height: '100%',
              border: 0,
            }}
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          />
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center',
              position: 'absolute',
              top: '15%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              px: 3,
              py: 2
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'hsl(var(--text-primary))',
                fontWeight: 500,
                fontSize: '1.25rem',
                lineHeight: 1.4,
                mb: 1
              }}
            >
              Calendar hasn't been set up yet
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/google-calendar')}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                height: 40,
                px: 4,
                '&:hover': {
                  backgroundColor: '#2563EB',
                },
                transition: 'none',
                textTransform: 'none',
                fontSize: '0.9375rem',
              }}
            >
              Set up Calendar
            </Button>
          </Box>
        )}
      </Box>
    </>
  )
}

// Export both the page component and the reusable component
export const MyGoogleCalendarPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <GoogleCalendarComponent />
      </Paper>
    </Box>
  )
}

export default GoogleCalendarComponent
