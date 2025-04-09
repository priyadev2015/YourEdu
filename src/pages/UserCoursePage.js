import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'
import {
  Box,
  Container,
  Paper,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Grid,
  Fade,
  Chip,
} from '@mui/material'
import { CheckCircle as CheckIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { toast } from 'react-toastify'
import { DAYS_OF_WEEK, TERM_STARTS, TERM_DURATIONS, COURSE_PAGE_SECTIONS } from '../constants/courseConstants'
import SidebarMenuItem from '../components/SidebarMenuItem'
import UserCourseMaterials from './UserCoursePage-Materials'
import UserCourseModules from './UserCoursePage-Module'
import UserCourseGrading from './UserCoursePage-Grading'
import UserCourseSchedule from './UserCoursePage-Schedule'
import { CourseDescriptionService } from '../services/CourseDescriptionService'
import { syncUserCalendars } from './MyGoogleCalendar'
import { TranscriptService } from '../services/TranscriptService'

const EDITABLE_FIELDS = {
  title: true,
  hs_subject: true,
  teacher: true,
  units: true,
  total_hours: true,
  instruction_method: true,
  evaluation_method: true,
  days: true,
  times: true,
  textbooks: true,
  materials: true,
  description: true,
  year: true,
  term_start: true,
  start_date: true,
  end_date: true,
  location: true,
}

const SCHEDULE_FIELDS = ['days', 'times', 'year', 'term_start', 'start_date', 'end_date', 'location']

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

const SIDEBAR_SECTIONS = [
  { id: 'todos', label: 'Registration Steps', showInProd: true, showForMarketplace: true },
  { id: 'info', label: 'Set Course Information', showInProd: true },
  { id: 'schedule', label: 'Set Course Schedule', showInProd: true },
  { id: 'materials', label: 'Upload Course Materials', showInProd: true },
  { id: 'modules', label: 'Create Course Module', showInProd: false },
  { id: 'grading', label: 'Grading', showInProd: false },
]

// Add syncCourseToDescriptions as a global function
const syncCourseToDescriptions = async (studentId) => {
  try {
    console.log('Syncing course to course descriptions for student:', studentId)

    // First, fetch the current course data to ensure we have the latest values
    const { data: courses, error: coursesError } = await supabase
      .from('youredu_courses')
      .select('*')
      .eq('student_id', studentId)

    if (coursesError) {
      console.error('Error fetching courses for sync:', coursesError)
      throw coursesError
    }

    console.log(`Found ${courses?.length || 0} courses to sync to course descriptions`)

    // Log the fields we care about for debugging
    courses?.forEach((course) => {
      console.log(`Course "${course.title}" fields:`, {
        instruction_method: course.instruction_method,
        textbooks: course.textbooks,
        materials: course.materials,
        evaluation_method: course.evaluation_method,
        description: course.description,
      })
    })

    // Call the service to sync courses to course descriptions
    await CourseDescriptionService.syncCoursesFromMyCourses(studentId)
    console.log('Successfully synced course to course descriptions')
  } catch (error) {
    console.error('Error syncing course to course descriptions:', error)
    throw error
  }
}

const stylesForm = {
  input: {
    width: '100%',
    marginTop: '8px',
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'white',
      '&:hover fieldset': {
        borderColor: 'hsl(var(--brand-primary))',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: 'var(--spacing-3)',
      color: '#000000',
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, -9px) scale(0.75)',
      backgroundColor: 'white',
      padding: '0 4px',
      color: '#000000',
      '&.Mui-focused': {
        color: 'hsl(var(--brand-primary))',
      },
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  },
  section: {
    marginTop: 'var(--spacing-6)',
    '& .MuiTypography-h5': {
      marginBottom: '16px',
      color: '#000000',
    },
    '& .MuiTypography-h6': {
      color: '#000000',
    },
  },
}

const InfoRow = ({
  label,
  value,
  field,
  courseId,
  onScheduleChange,
  isScheduleField,
  hasScheduleChanges,
  isSavingSchedule,
  onSaveSuccess,
  setIsSavingGlobal,
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)

  // Update localValue when prop value changes
  useEffect(() => {
    setLocalValue(value)
    if (field === 'days' && typeof value === 'string') {
      setSelectedDays(value.split('').filter(Boolean))
    } else if (field === 'days') {
      setSelectedDays([])
    }

    if (field === 'times' && typeof value === 'string') {
      try {
        const [start, end] = value.split('-').map((t) => t.trim())
        console.log('Parsing times:', { start, end })

        // Try different time formats
        let startDayjs = null
        let endDayjs = null

        // Try h:mma format (e.g. "9:00am")
        if (start) {
          startDayjs = dayjs(start, 'h:mma')
          if (!startDayjs.isValid()) {
            // Try H:mm format (e.g. "09:00")
            startDayjs = dayjs(start, 'H:mm')
          }
        }

        if (end) {
          endDayjs = dayjs(end, 'h:mma')
          if (!endDayjs.isValid()) {
            // Try H:mm format
            endDayjs = dayjs(end, 'H:mm')
          }
        }

        console.log('Parsed times:', {
          startValid: startDayjs?.isValid(),
          endValid: endDayjs?.isValid(),
          startTime: startDayjs?.format('h:mma'),
          endTime: endDayjs?.format('h:mma'),
        })

        setStartTime(startDayjs?.isValid() ? startDayjs : null)
        setEndTime(endDayjs?.isValid() ? endDayjs : null)
      } catch (error) {
        console.error('Error parsing time string:', error)
        setStartTime(null)
        setEndTime(null)
      }
    } else if (field === 'times') {
      setStartTime(null)
      setEndTime(null)
    }
  }, [value, field])

  const isEditable = EDITABLE_FIELDS[field] || EDITABLE_FIELDS[field === 'subject' ? 'hs_subject' : field]

  const saveChanges = async (valueToSave) => {
    if (!isEditable || isScheduleField) return

    console.log('Starting save operation for field:', field, 'with value:', valueToSave)
    setIsSaving(true)
    setSaveSuccess(false)
    setIsSavingGlobal(true)

    try {
      // Map fields to their correct database column names
      let dbField = field
      let finalValue = valueToSave

      // Handle special field mappings
      switch (field) {
        case 'subject':
          dbField = 'hs_subject'
          console.log('Mapping subject to hs_subject')
          break
        case 'teacher':
          dbField = 'teacher_name'
          console.log('Mapping teacher to teacher_name')
          break
      }

      // Handle array fields - ensure they're always arrays
      if (dbField === 'materials' || dbField === 'textbooks') {
        finalValue = Array.isArray(valueToSave) ? valueToSave : [valueToSave].filter(Boolean)
      }

      // Special handling for date fields
      if (field === 'start_date' || field === 'end_date') {
        finalValue = valueToSave ? dayjs(valueToSave).toISOString() : null
      }

      // Special handling for description field
      if (field === 'description') {
        finalValue = valueToSave || '' // Ensure empty string if null/undefined
        console.log('Processing description field:', { original: valueToSave, final: finalValue })
      }

      console.log('Saving to database:', { field: dbField, value: finalValue })

      // First check if this is a youredu_course
      const { data: checkData, error: checkError } = await supabase
        .from('youredu_courses')
        .select('id')
        .eq('id', courseId)
        .maybeSingle()

      let updatedData = null

      if (checkData) {
        // This is a youredu_course
        const { data: youreduData, error: youreduError } = await supabase
          .from('youredu_courses')
          .update({ [dbField]: finalValue })
          .eq('id', courseId)
          .select()

        if (youreduError) {
          console.error('Error saving to youredu_courses:', youreduError)
          throw youreduError
        }

        console.log('Save successful in youredu_courses. Updated data:', youreduData)
        updatedData = youreduData[0]
        setSaveSuccess(true)
        
        if (typeof onSaveSuccess === 'function') {
          onSaveSuccess(new Date().toLocaleTimeString(), updatedData)
        }

        // If we have a student_id, handle post-save operations
        if (youreduData?.[0]?.student_id) {
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('id', youreduData[0].student_id)
            .single()

          if (studentData) {
            await handlePostSave(studentData)
          }
        }
      } else {
        // Try user_courses
        const { data: userData, error: userError } = await supabase
          .from('user_courses')
          .update({ [dbField]: finalValue })
          .eq('id', courseId)
          .select('*, students!inner(*)')

        if (userError) throw userError
        
        console.log('Save successful in user_courses. Updated data:', userData)
        updatedData = userData[0]
        setSaveSuccess(true)
        
        if (typeof onSaveSuccess === 'function') {
          onSaveSuccess(new Date().toLocaleTimeString(), updatedData)
        }

        if (userData && userData.length > 0 && userData[0].students) {
          await handlePostSave(userData[0].students)
        }
      }

      // Hide success indicator after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
      setIsSavingGlobal(false)
    }
  }

  // Helper function for post-save operations
  const handlePostSave = async (student) => {
    try {
      console.log('Syncing course updates for student:', student.student_name)
      
      // Sync to course descriptions
      console.log('Syncing to course descriptions...')
      await syncCourseToDescriptions(student.id)
      console.log('Successfully synced to course descriptions')
      
      // Sync to transcript
      console.log('Syncing to transcript...')
      await TranscriptService.syncCoursesFromMyCourses(student.id)
      console.log('Successfully synced to transcript')
    } catch (syncError) {
      console.error('Error during sync operations:', syncError)
      // Don't throw here - we want to continue even if sync fails
    }
  }

  const debouncedSave = useMemo(
    () =>
      debounce(async (newValue) => {
        if (isScheduleField) return
        saveChanges(newValue)
      }, 1000),
    [field, isEditable, courseId]
  )

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  const handleValueChange = (newValue) => {
    setLocalValue(newValue)

    // Special handling for times field
    if (field === 'times') {
      if (dayjs.isDayjs(newValue)) {
        // If this is a dayjs object, update the appropriate time state
        if (startTime === null) {
          // If no start time, set start time
          setStartTime(newValue)
        } else if (endTime === null) {
          // If we have a start time but no end time, update end time
          setEndTime(newValue)
          // Format and save both times
          const formattedTime = `${startTime.format('h:mma')} - ${newValue.format('h:mma')}`
          if (isScheduleField) {
            onScheduleChange(field, formattedTime)
          } else {
            debouncedSave(formattedTime)
          }
        } else {
          // If both times are set, we're updating one of them
          // Check if we're updating start or end time based on which picker triggered the change
          const isStartTime = startTime.format('h:mma') !== newValue.format('h:mma')
          if (isStartTime) {
            setStartTime(newValue)
            const formattedTime = `${newValue.format('h:mma')} - ${endTime.format('h:mma')}`
            if (isScheduleField) {
              onScheduleChange(field, formattedTime)
            } else {
              debouncedSave(formattedTime)
            }
          } else {
            setEndTime(newValue)
            const formattedTime = `${startTime.format('h:mma')} - ${newValue.format('h:mma')}`
            if (isScheduleField) {
              onScheduleChange(field, formattedTime)
            } else {
              debouncedSave(formattedTime)
            }
          }
        }
      }
    } else {
      // For all other fields, proceed as before
      if (isScheduleField) {
        onScheduleChange(field, newValue)
      } else {
        debouncedSave(newValue)
      }
    }
  }

  const handleDayToggle = (day) => {
    const newDays = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day]
    setSelectedDays(newDays)
    // Join days without spaces or commas for the database format
    const daysString = newDays.join('')
    handleValueChange(daysString)
  }

  const renderInput = () => {
    switch (field) {
      case 'units':
        return (
          <TextField
            type="number"
            value={localValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              inputProps: { min: 0, step: field === 'units' ? 0.5 : 1 },
            }}
            sx={stylesForm.input}
            InputLabelProps={{
              shrink: true,
            }}
            label={label}
          />
        )

      case 'term_start':
        return (
          <Select
            value={localValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            size="small"
            fullWidth
            sx={{
              ...stylesForm.input,
              '& .MuiSelect-select': {
                backgroundColor: 'white',
              },
            }}
            label={label}
          >
            {TERM_STARTS.map((term) => (
              <MenuItem key={term} value={term}>
                {term}
              </MenuItem>
            ))}
          </Select>
        )

      case 'term_duration':
        return (
          <Select
            value={localValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            size="small"
            fullWidth
            sx={{
              ...stylesForm.input,
              '& .MuiSelect-select': {
                backgroundColor: 'white',
              },
            }}
            label={label}
          >
            {TERM_DURATIONS.map((duration) => (
              <MenuItem key={duration.value} value={duration.value}>
                {duration.label}
              </MenuItem>
            ))}
          </Select>
        )

      case 'start_date':
      case 'end_date':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={localValue ? dayjs(localValue) : null}
              onChange={(newValue) => handleValueChange(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: stylesForm.input,
                  label: label,
                  InputLabelProps: {
                    shrink: true,
                  },
                },
              }}
            />
          </LocalizationProvider>
        )

      case 'days':
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {DAYS_OF_WEEK.map((day) => (
              <Chip
                key={day.value}
                label={day.shortLabel}
                onClick={() => handleDayToggle(day.value)}
                color={selectedDays.includes(day.value) ? 'primary' : 'default'}
                sx={{
                  cursor: 'pointer',
                  minWidth: '32px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  '& .MuiChip-label': {
                    fontSize: '0.75rem',
                    padding: '0 8px',
                  },
                  '&.MuiChip-colorPrimary': {
                    backgroundColor: 'hsl(var(--brand-primary))',
                    color: 'white',
                  },
                }}
              />
            ))}
          </Box>
        )

      case 'times':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={(newStartTime) => {
                  if (!dayjs.isDayjs(newStartTime)) return
                  setStartTime(newStartTime)
                  if (endTime) {
                    const formattedTime = `${newStartTime.format('h:mma')} - ${endTime.format('h:mma')}`
                    console.log('Setting formatted time:', formattedTime)
                    if (isScheduleField) {
                      onScheduleChange(field, formattedTime)
                    } else {
                      debouncedSave(formattedTime)
                    }
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: stylesForm.input,
                    InputLabelProps: {
                      shrink: true,
                    },
                  },
                }}
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={(newEndTime) => {
                  if (!dayjs.isDayjs(newEndTime)) return
                  setEndTime(newEndTime)
                  if (startTime) {
                    const formattedTime = `${startTime.format('h:mma')} - ${newEndTime.format('h:mma')}`
                    console.log('Setting formatted time:', formattedTime)
                    if (isScheduleField) {
                      onScheduleChange(field, formattedTime)
                    } else {
                      debouncedSave(formattedTime)
                    }
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: stylesForm.input,
                    InputLabelProps: {
                      shrink: true,
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        )

      case 'description':
        return (
          <TextField
            value={localValue || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={4}
            sx={stylesForm.input}
            InputLabelProps={{
              shrink: true,
            }}
            label={label}
          />
        )

      default:
        return (
          <TextField
            value={localValue || ''}
            onChange={(e) => {
              const newValue = e.target.value
              setLocalValue(newValue)

              if (field === 'location' && isScheduleField) {
                console.log('Location field changed:', newValue)
                onScheduleChange(field, newValue)
              } else if (isScheduleField) {
                onScheduleChange(field, newValue)
              } else {
                debouncedSave(newValue)
              }
            }}
            size="small"
            fullWidth
            sx={stylesForm.input}
            InputLabelProps={{
              shrink: true,
            }}
            label={label}
          />
        )
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        py: 0.5,
        borderRadius: 1,
        backgroundColor: value && value !== 'Not set' ? 'hsla(var(--brand-primary), 0.02)' : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'hsl(var(--muted) / 0.3)',
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        {renderInput()}
        {isSaving && !isScheduleField && (
          <CircularProgress
            size={16}
            sx={{
              position: 'absolute',
              right: -24,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'hsl(var(--brand-primary))',
            }}
          />
        )}
      </Box>
    </Box>
  )
}

const ScheduleSection = ({ courseData, courseId, onSaveSuccess, setIsSavingGlobal }) => {
  const { user } = useAuth()
  const [scheduleChanges, setScheduleChanges] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const handleScheduleChange = (field, value) => {
    console.log(`Schedule change for ${field}:`, value)

    setScheduleChanges((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveScheduleChanges = async () => {
    if (Object.keys(scheduleChanges).length === 0) {
      console.log('No changes to save')
      return
    }

    console.log('Saving schedule changes:', scheduleChanges)
    setIsSaving(true)
    setIsSavingGlobal(true)

    try {
      // Update all changed fields
      const { data, error } = await supabase
        .from('youredu_courses')
        .update(scheduleChanges)
        .eq('id', courseId)
        .select('*, students!inner(*)')

      if (error) throw error

      console.log('Schedule changes saved successfully:', data)

      if (data && data.length > 0) {
        const course = data[0]
        const student = course.students

        // Only sync course descriptions for this student
        await syncCourseToDescriptions(student.id)

        try {
          // First sync the individual student's calendar
          console.log('Syncing calendar for student:', student.student_name)
          await syncUserCalendars({
            userId: user.id,
            userEmail: user.email,
            student: {
              id: student.id,
              student_name: student.student_name,
            },
          })
          console.log('Individual student calendar synced successfully')

          // Then sync the "All Students" calendar
          console.log('Starting sync for All Students calendar')
          await syncUserCalendars({
            userId: user.id,
            userEmail: user.email,
            student: {
              id: '00000000-0000-0000-0000-000000000000',
              student_name: 'All Students',
              isAllStudents: true,
            },
            skipDatabaseEntry: true,
          })
          console.log('All Students calendar synced successfully')
        } catch (syncError) {
          console.error('Error during calendar sync:', syncError)
          throw syncError
        }

        // Update the course data in the parent component
        if (onSaveSuccess) {
          onSaveSuccess(new Date().toLocaleTimeString())
        }
      }

      setScheduleChanges({})
    } catch (error) {
      console.error('Error saving schedule changes:', error)
      toast.error('Failed to save schedule changes')
    } finally {
      setIsSaving(false)
      setIsSavingGlobal(false)
    }
  }

  return (
    <Box>
      {Object.keys(scheduleChanges).length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={saveScheduleChanges}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: 'hsl(var(--destructive))',
              color: 'white',
              '&:hover': {
                backgroundColor: 'hsl(var(--destructive-foreground))',
              },
              '&.Mui-disabled': {
                backgroundColor: 'hsl(var(--destructive) / 0.6)',
                color: 'white',
              },
            }}
          >
            {isSaving ? 'Saving & Syncing Calendars...' : 'Save Schedule Changes'}
          </Button>
        </Box>
      )}
      <Box sx={{ backgroundColor: 'hsl(var(--muted) / 0.3)', borderRadius: '8px', overflow: 'hidden' }}>
        <InfoRow
          label="Year"
          value={courseData?.year}
          field="year"
          courseId={courseId}
          onScheduleChange={handleScheduleChange}
          isScheduleField={true}
          hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
          isSavingSchedule={isSaving}
          onSaveSuccess={onSaveSuccess}
          setIsSavingGlobal={setIsSavingGlobal}
        />
        <InfoRow
          label="Term Start"
          value={courseData?.term_start}
          field="term_start"
          courseId={courseId}
          onScheduleChange={handleScheduleChange}
          isScheduleField={true}
          hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
          isSavingSchedule={isSaving}
          onSaveSuccess={onSaveSuccess}
          setIsSavingGlobal={setIsSavingGlobal}
        />
        <InfoRow
          label="Start Date"
          value={courseData?.start_date ? new Date(courseData.start_date).toLocaleDateString() : 'Not set'}
          field="start_date"
          courseId={courseId}
          onScheduleChange={handleScheduleChange}
          isScheduleField={true}
          hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
          isSavingSchedule={isSaving}
          onSaveSuccess={onSaveSuccess}
          setIsSavingGlobal={setIsSavingGlobal}
        />
        <InfoRow
          label="End Date"
          value={courseData?.end_date ? new Date(courseData.end_date).toLocaleDateString() : 'Not set'}
          field="end_date"
          courseId={courseId}
          onScheduleChange={handleScheduleChange}
          isScheduleField={true}
          hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
          isSavingSchedule={isSaving}
          onSaveSuccess={onSaveSuccess}
          setIsSavingGlobal={setIsSavingGlobal}
        />
        <InfoRow
          label="Location"
          value={courseData?.location}
          field="location"
          courseId={courseId}
          onScheduleChange={handleScheduleChange}
          isScheduleField={true}
          hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
          isSavingSchedule={isSaving}
          onSaveSuccess={onSaveSuccess}
          setIsSavingGlobal={setIsSavingGlobal}
        />
        <InfoRow
          label="Days"
          value={courseData?.days}
          field="days"
          courseId={courseId}
          onScheduleChange={handleScheduleChange}
          isScheduleField={true}
          hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
          isSavingSchedule={isSaving}
          onSaveSuccess={onSaveSuccess}
          setIsSavingGlobal={setIsSavingGlobal}
        />
        <InfoRow
          label="Times"
          value={courseData?.times}
          field="times"
          courseId={courseId}
          onScheduleChange={handleScheduleChange}
          isScheduleField={true}
          hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
          isSavingSchedule={isSaving}
          onSaveSuccess={onSaveSuccess}
          setIsSavingGlobal={setIsSavingGlobal}
        />
      </Box>
    </Box>
  )
}

// Update the UserCourseTodosContent component to use the global todos state
const UserCourseTodosContent = ({ todos, todosLoading, todosError, handleTodoToggle }) => {
  if (todosLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (todosError) {
    return (
      <Box sx={{ p: 3, color: 'hsl(var(--destructive))' }}>
        <Typography>{todosError}</Typography>
      </Box>
    )
  }

  if (todos.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography sx={{ color: 'hsl(var(--muted-foreground))' }}>
          No registration steps found for this course. All steps are complete!
        </Typography>
      </Box>
    )
  }

  // Separate the highest priority todo from the rest
  const [highestPriorityTodo, ...remainingTodos] = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)

  // Check if a todo is a special todo (has special_todo_type)
  const isSpecialTodo = (todo) => {
    return todo.special_todo_type !== null && todo.special_todo_type !== undefined
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Highest Priority Todo Card */}
      {highestPriorityTodo && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid hsl(var(--brand-primary) / 0.3)',
            borderRadius: '12px',
            backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {highestPriorityTodo.name}
              </Typography>
            </Box>
            {/* Only show Complete button for non-special todos */}
            {!isSpecialTodo(highestPriorityTodo) && (
              <Box>
                <Button
                  variant="contained"
                  onClick={() => handleTodoToggle(highestPriorityTodo.id, !highestPriorityTodo.completed)}
                  sx={{
                    backgroundColor: 'hsl(var(--brand-primary))',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--brand-primary-dark))',
                    },
                  }}
                >
                  Mark Complete
                </Button>
              </Box>
            )}
          </Box>
          <Typography sx={{ mb: 3 }}>{highestPriorityTodo.description}</Typography>
          {highestPriorityTodo.route && (
            <Button
              variant="outlined"
              onClick={() => (window.location.href = highestPriorityTodo.route)}
              sx={{
                borderColor: 'hsl(var(--brand-primary))',
                color: 'hsl(var(--brand-primary))',
                '&:hover': {
                  borderColor: 'hsl(var(--brand-primary-dark))',
                  backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                },
              }}
            >
              {highestPriorityTodo.buttonText || 'View Details'}
            </Button>
          )}
        </Paper>
      )}

      {/* Remaining Active Todos */}
      {remainingTodos.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'hsl(var(--brand-primary))',
              mb: 2,
            }}
          >
            Remaining Steps
          </Typography>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'white',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {remainingTodos.map((todo) => (
              <Box
                key={todo.id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid hsl(var(--border))',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    {todo.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {todo.description}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {todo.route && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => (window.location.href = todo.route)}
                      sx={{
                        borderColor: 'hsl(var(--brand-primary))',
                        color: 'hsl(var(--brand-primary))',
                        '&:hover': {
                          borderColor: 'hsl(var(--brand-primary-dark))',
                          backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                        },
                      }}
                    >
                      {todo.buttonText || 'View'}
                    </Button>
                  )}
                  {/* Only show Complete button for non-special todos */}
                  {!isSpecialTodo(todo) && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleTodoToggle(todo.id, !todo.completed)}
                      sx={{
                        backgroundColor: 'hsl(var(--brand-primary))',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--brand-primary-dark))',
                        },
                      }}
                    >
                      Complete
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'hsl(var(--muted-foreground))',
              mb: 2,
            }}
          >
            Completed Steps
          </Typography>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'hsl(var(--muted) / 0.2)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {completedTodos.map((todo) => (
              <Box
                key={todo.id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid hsl(var(--border))',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      textDecoration: 'line-through',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {todo.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    Completed: {new Date(todo.completed_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {todo.route && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => (window.location.href = todo.route)}
                      sx={{
                        borderColor: 'hsl(var(--muted-foreground))',
                        color: 'hsl(var(--muted-foreground))',
                        '&:hover': {
                          borderColor: 'hsl(var(--muted-foreground))',
                          backgroundColor: 'hsl(var(--muted) / 0.1)',
                        },
                      }}
                    >
                      {todo.buttonText || 'View'}
                    </Button>
                  )}
                  {/* Only show Undo button for non-special todos */}
                  {!isSpecialTodo(todo) && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleTodoToggle(todo.id, !todo.completed)}
                      sx={{
                        borderColor: 'hsl(var(--muted-foreground))',
                        color: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      Undo
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  )
}

const UserCoursePage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState(null)
  const [isTeacherView, setIsTeacherView] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeSection, setActiveSection] = useState('info')

  // Add a ref to track if component is mounted
  const isMounted = useRef(true)

  // Add last fetch time tracking
  const lastFetchTime = useRef(0)
  const FETCH_COOLDOWN = 1000 // 1 second cooldown between fetches

  const fetchCourseData = useCallback(async (force = false) => {
    // If not forcing and fetch was too recent, skip
    const now = Date.now()
    if (!force && now - lastFetchTime.current < FETCH_COOLDOWN) {
      return
    }
    
    lastFetchTime.current = now

    try {
      if (!isMounted.current) return
      
      console.log('Fetching course data for ID:', courseId)
      setLoading(true)
      
      // First try youredu_courses
      let { data: youreduData, error: youreduError } = await supabase
        .from('youredu_courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle()
        
      if (youreduData) {
        console.log('Fetched course data from youredu_courses:', youreduData)
        
        // If we have a student_id, fetch the student details separately
        if (youreduData.student_id) {
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('id', youreduData.student_id)
            .single()
            
          if (!studentError && studentData) {
            youreduData.students = studentData
          }
        }
        
        if (isMounted.current) {
          setCourseData(youreduData)
          
          // Create student object if we have student data
          if (youreduData.student_id) {
            const studentData = {
              id: youreduData.student_id,
              student_name: youreduData.students?.student_name || 'Student'
            }
            
            localStorage.setItem('currentCourseTitle', youreduData.title || 'Course')
            localStorage.setItem('selectedStudent', JSON.stringify(studentData))
            
            window.dispatchEvent(new CustomEvent('studentChanged', { 
              detail: studentData
            }))
          }
        }
      } else {
        console.log('Course not found in youredu_courses, trying user_courses')
        // If not found in youredu_courses, try user_courses
        const { data: userData, error: userError } = await supabase
          .from('user_courses')
          .select('*, students!inner(*)')
          .eq('id', courseId)
          .single()

        if (userError) {
          console.error('Error fetching from user_courses:', userError)
          throw userError
        }

        if (isMounted.current) {
          console.log('Fetched course data from user_courses:', userData)
          setCourseData(userData)
          
          const studentData = {
            id: userData.student_id,
            student_name: userData.students?.student_name || 'Student'
          }
          
          localStorage.setItem('currentCourseTitle', userData.title || 'Course')
          localStorage.setItem('selectedStudent', JSON.stringify(studentData))
          
          window.dispatchEvent(new CustomEvent('studentChanged', { 
            detail: studentData
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching course:', err)
      if (isMounted.current) {
        toast.error('Failed to load course')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [courseId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Only fetch data on mount and when courseId changes
  useEffect(() => {
    isMounted.current = true
    fetchCourseData(true)
  }, [fetchCourseData, courseId])

  // Add useEffect to fetch todos when needed
  useEffect(() => {
    if (courseData?.id && courseData?.student_id && activeSection === 'todos') {
      fetchTodos()
    }
  }, [courseData?.id, courseData?.student_id, activeSection])

  // Modify handleSaveSuccess to update state directly without refetching
  const handleSaveSuccess = (time, updatedData = null) => {
    setLastSaveTime(time)
    localStorage.setItem('courseLastSaveTime', time)
    setIsSavingGlobal(false)
    
    // If we have updated data, update the state directly
    if (updatedData) {
      setCourseData(current => ({
        ...current,
        ...updatedData
      }))
    }
  }

  // Add todos state at the global level
  const [todos, setTodos] = useState([])
  const [todosLoading, setTodosLoading] = useState(true)
  const [todosError, setTodosError] = useState(null)
  const [incompleteTodosCount, setIncompleteTodosCount] = useState(0)

  // Course Module state
  const [selectedCourseType, setSelectedCourseType] = useState(null)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [modules, setModules] = useState([])
  const [moduleMenuAnchor, setModuleMenuAnchor] = useState(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Grading state
  const [selectedGradingAssignment, setSelectedGradingAssignment] = useState(null)
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false)
  const [gradeValue, setGradeValue] = useState('')
  const [feedback, setFeedback] = useState('')

  const [lastSaveTime, setLastSaveTime] = useState(null)
  const [isSavingGlobal, setIsSavingGlobal] = useState(false)

  // Module handlers
  const handleAddModule = () => {
    const newModule = {
      id: Date.now(),
      title: 'New Module',
      items: [],
    }
    setModules((prevModules) => [...prevModules, newModule])
  }

  const handleEditModule = (module) => {
    // TODO: Implement module editing
    console.log('Edit module:', module)
  }

  const handleAddModuleItem = (moduleId, type) => {
    const newItem = {
      id: Date.now(),
      type,
      title: type === 'link' ? 'New Link' : 'New Assignment',
    }

    setModules((prevModules) =>
      prevModules.map((module) => (module.id === moduleId ? { ...module, items: [...module.items, newItem] } : module))
    )
    setModuleMenuAnchor(null)
  }

  const handleEditItem = (moduleId, item) => {
    // TODO: Implement item editing
    console.log('Edit item:', moduleId, item)
  }

  const handleDeleteItem = (moduleId, itemId) => {
    setModules((prevModules) =>
      prevModules.map((module) =>
        module.id === moduleId ? { ...module, items: module.items.filter((item) => item.id !== itemId) } : module
      )
    )
  }

  // Add Claude API integration
  const generateWithClaude = async (prompt) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/claude/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ materials: prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API Error: ${errorData.details || errorData.error || response.statusText}`)
      }

      const data = await response.json()
      setAiResponse(data.content)
    } catch (error) {
      console.error('Error generating with Claude:', error)
      toast.error(`Failed to generate course plan: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Move the fetchTodos function to the global scope
  const fetchTodos = async () => {
    if (!courseData?.id || !courseData?.student_id) return

    try {
      setTodosLoading(true)
      // Fetch todos for this specific course and student
      const { data: todosData, error: todosError } = await supabase
        .from('user_courses_todos')
        .select('*')
        .eq('uid', user.id)
        .eq('student_id', courseData.student_id)
        .contains('user_course_ids', [courseData.id])
        .order('importance', { ascending: false })

      if (todosError) throw todosError

      // Import the TODO_TYPE_CONFIG to get route and button text
      const { TODO_TYPE_CONFIG } = await import('../constants/SpecialCourseTodos')

      // Add route and buttonText to each todo from the TODO_TYPE_CONFIG
      const processedTodos = todosData.map((todo) => {
        if (todo.special_todo_type && TODO_TYPE_CONFIG[todo.special_todo_type]) {
          return {
            ...todo,
            route: TODO_TYPE_CONFIG[todo.special_todo_type].route,
            buttonText: TODO_TYPE_CONFIG[todo.special_todo_type].buttonText,
          }
        }
        return todo
      })

      setTodos(processedTodos)

      // Calculate incomplete todos count
      const incompleteCount = processedTodos.filter((todo) => !todo.completed).length
      setIncompleteTodosCount(incompleteCount)
    } catch (err) {
      console.error('Error fetching course todos:', err)
      setTodosError('Failed to load todos for this course')
    } finally {
      setTodosLoading(false)
    }
  }

  // Handle todo toggle at the global level
  const handleTodoToggle = async (todoId, completed) => {
    try {
      const { error } = await supabase
        .from('user_courses_todos')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', todoId)

      if (error) throw error

      // Update local state
      const updatedTodos = todos.map((todo) =>
        todo.id === todoId ? { ...todo, completed, completed_at: completed ? new Date().toISOString() : null } : todo
      )
      setTodos(updatedTodos)

      // Update incomplete todos count
      const incompleteCount = updatedTodos.filter((todo) => !todo.completed).length
      setIncompleteTodosCount(incompleteCount)
    } catch (err) {
      console.error('Error updating todo:', err)
      toast.error('Failed to update todo')
    }
  }

  const renderContent = () => {
    console.log('renderContent called with:', {
      activeSection,
      courseData: {
        id: courseData?.id,
        creator_id: courseData?.creator_id,
        is_published: courseData?.is_published,
        college: courseData?.college
      },
      userId: user?.id
    });

    // Only hide todos for user-created courses that are not published
    // For marketplace courses (like Sierra College), is_published will be true
    const shouldHideTodos = courseData?.creator_id === user?.id && !courseData?.is_published;
    console.log('shouldHideTodos:', shouldHideTodos);

    if (activeSection === 'todos' && shouldHideTodos) {
      console.log('Hiding todos section due to user-created unpublished course');
      return null;
    }

    switch (activeSection) {
      case 'info':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '100%', position: 'relative' }}>
            {/* Hero Section */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                border: '1px solid hsl(var(--brand-primary) / 0.2)',
                borderRadius: '12px',
                p: 3,
              }}
            >
              <Box sx={{ maxWidth: '800px' }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'hsl(var(--brand-primary))',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Course Information
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'hsl(var(--foreground))',
                    lineHeight: 1.6,
                  }}
                >
                  Set your course details here to automatically populate your course transcript, descriptions, and other
                  areas of the app. All information entered will be saved and used for official record keeping.
                </Typography>
              </Box>
            </Paper>

            {/* Course Information Content */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'white',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                overflow: 'hidden',
                p: 3,
              }}
            >
              <Grid container spacing={0}>
                {/* Left Column */}
                <Grid item xs={12} md={6} sx={{ pr: { md: 2 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* General Information */}
                    <Box>
                      <Typography 
                        variant="h5"
                        sx={{ 
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: '#000000',
                          mb: 1.5
                        }}
                      >
                        General Information
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <InfoRow
                          label="Title"
                          value={courseData?.title}
                          field="title"
                          courseId={courseData?.id}
                          onSaveSuccess={handleSaveSuccess}
                          setIsSavingGlobal={setIsSavingGlobal}
                        />
                        <InfoRow
                          label="Provider"
                          value={courseData?.college || 'None (YourEDU course)'}
                          field="college"
                          courseId={courseData?.id}
                          onSaveSuccess={handleSaveSuccess}
                          setIsSavingGlobal={setIsSavingGlobal}
                        />
                        <InfoRow
                          label="High School Subject"
                          value={courseData?.hs_subject || courseData?.subject}
                          field="subject"
                          courseId={courseData?.id}
                          onSaveSuccess={handleSaveSuccess}
                          setIsSavingGlobal={setIsSavingGlobal}
                        />
                        <InfoRow
                          label="Teacher"
                          value={courseData?.teacher_name || courseData?.teacher || 'YourEDU Instructor'}
                          field="teacher"
                          courseId={courseData?.id}
                          onSaveSuccess={handleSaveSuccess}
                          setIsSavingGlobal={setIsSavingGlobal}
                        />
                      </Box>
                    </Box>

                    {/* Course Description */}
                    <Box sx={{ mt: 3 }}>
                      <Box 
                        sx={{ 
                          height: '1px', 
                          backgroundColor: 'hsl(var(--border))',
                          mb: 2
                        }} 
                      />
                      <Typography 
                        variant="h5"
                        sx={{ 
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          color: '#000000',
                          mb: 1.5
                        }}
                      >
                        Course Description
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <InfoRow
                          label="Description"
                          value={courseData?.description}
                          field="description"
                          courseId={courseData?.id}
                          onSaveSuccess={handleSaveSuccess}
                          setIsSavingGlobal={setIsSavingGlobal}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6} sx={{ pl: { md: 2 } }}>
                  <Box>
                    <Typography 
                      variant="h5"
                      sx={{ 
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#000000',
                        mb: 1.5
                      }}
                    >
                      Course Details
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <InfoRow
                        label="Units"
                        value={courseData?.units}
                        field="units"
                        courseId={courseData?.id}
                        onSaveSuccess={handleSaveSuccess}
                        setIsSavingGlobal={setIsSavingGlobal}
                      />
                      <InfoRow
                        label="Instruction Method"
                        value={courseData?.instruction_method}
                        field="instruction_method"
                        courseId={courseData?.id}
                        onSaveSuccess={handleSaveSuccess}
                        setIsSavingGlobal={setIsSavingGlobal}
                      />
                      <InfoRow
                        label="Textbooks"
                        value={courseData?.textbooks}
                        field="textbooks"
                        courseId={courseData?.id}
                        onSaveSuccess={handleSaveSuccess}
                        setIsSavingGlobal={setIsSavingGlobal}
                      />
                      <InfoRow
                        label="Materials"
                        value={courseData?.materials}
                        field="materials"
                        courseId={courseData?.id}
                        onSaveSuccess={handleSaveSuccess}
                        setIsSavingGlobal={setIsSavingGlobal}
                      />
                      <InfoRow
                        label="Evaluation Method"
                        value={courseData?.evaluation_method}
                        field="evaluation_method"
                        courseId={courseData?.id}
                        onSaveSuccess={handleSaveSuccess}
                        setIsSavingGlobal={setIsSavingGlobal}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )

      case 'schedule':
        return (
          <UserCourseSchedule
            courseData={courseData}
            courseId={courseData?.id}
            onSaveSuccess={handleSaveSuccess}
            setIsSavingGlobal={setIsSavingGlobal}
          />
        )

      case 'todos':
        return (
          <UserCourseTodosContent
            todos={todos}
            todosLoading={todosLoading}
            todosError={todosError}
            handleTodoToggle={handleTodoToggle}
          />
        )

      case 'modules':
        return <UserCourseModules />

      case 'materials':
        return <UserCourseMaterials />

      case 'grading':
        return <UserCourseGrading />

      default:
        return null
    }
  }

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Sidebar Navigation */}
        <Box
          sx={{
            width: 280,
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--muted))',
            }}
          >
            <Typography
              sx={{
                color: '#000000',
                fontWeight: 600,
                fontSize: '1.125rem',
              }}
            >
              Tools
            </Typography>
          </Box>
          <Box sx={{ px: 2, py: 1.5 }}>
            {SIDEBAR_SECTIONS.filter((section) => {
              // Only hide todos for user-created courses that are not published
              const shouldHideTodos = courseData?.creator_id === user?.id && !courseData?.is_published;
              console.log('Filtering section:', section.id, {
                shouldHideTodos,
                courseData: {
                  creator_id: courseData?.creator_id,
                  is_published: courseData?.is_published
                }
              });
              
              if (section.id === 'todos' && shouldHideTodos) {
                return false;
              }
              return section.showInProd || isLocalhost;
            }).map(({ id, label, showInProd }) => (
              <Box
                key={id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <SidebarMenuItem
                  label={label}
                  isActive={activeSection === id}
                  onClick={() => setActiveSection(id)}
                  notificationCount={id === 'todos' ? incompleteTodosCount : 0}
                />
                {!showInProd && (
                  <VisibilityOffIcon
                    sx={{
                      fontSize: '1rem',
                      color: 'hsl(var(--muted-foreground))',
                      ml: 1,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: 'calc(100% - 280px)',
            overflow: 'hidden',
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Container>
  )
}

export default UserCoursePage
