import React, { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import { DAYS_OF_WEEK, TERM_STARTS } from '../constants/courseConstants'
import { syncUserCalendars } from './MyGoogleCalendar'
import { CourseDescriptionService } from '../services/CourseDescriptionService'
import ProgressModal from '../components/ProgressModal'

const SCHEDULE_FIELDS = ['days', 'times', 'year', 'term_start', 'start_date', 'end_date', 'location']

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
  saveScheduleChanges,
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [selectedDays, setSelectedDays] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)

  // Update localValue when prop value changes
  React.useEffect(() => {
    setLocalValue(value)
    if (field === 'days' && typeof value === 'string') {
      setSelectedDays(value.split('').filter(Boolean))
    } else if (field === 'days') {
      setSelectedDays([])
    }

    if (field === 'times' && typeof value === 'string') {
      try {
        const [start, end] = value.split('-').map((t) => t.trim())
        console.log('Parsing times:', { start, end });
        
        let startDayjs = null;
        let endDayjs = null;
        
        if (start) {
          startDayjs = dayjs(start, 'h:mma');
          if (!startDayjs.isValid()) {
            startDayjs = dayjs(start, 'H:mm');
          }
        }
        
        if (end) {
          endDayjs = dayjs(end, 'h:mma');
          if (!endDayjs.isValid()) {
            endDayjs = dayjs(end, 'H:mm');
          }
        }
        
        setStartTime(startDayjs?.isValid() ? startDayjs : null)
        setEndTime(endDayjs?.isValid() ? endDayjs : null)
      } catch (error) {
        console.error('Error parsing time string:', error);
        setStartTime(null)
        setEndTime(null)
      }
    } else if (field === 'times') {
      setStartTime(null)
      setEndTime(null)
    }
  }, [value, field])

  const handleDayToggle = (day) => {
    const newDays = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day]
    setSelectedDays(newDays)
    const daysString = newDays.join('')
    onScheduleChange(field, daysString)
  }

  const handleInputChange = (newValue) => {
    setLocalValue(newValue)
    onScheduleChange(field, newValue)
  }

  const renderInput = () => {
    switch (field) {
      case 'year':
        return (
          <TextField
            type="number"
            value={localValue || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              inputProps: { min: 0 },
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
          <Box sx={{ position: 'relative' }}>
            <TextField
              select
              value={localValue || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              size="small"
              fullWidth
              sx={stylesForm.input}
              InputLabelProps={{
                shrink: true,
              }}
              label={label}
            >
              {TERM_STARTS.map((term) => (
                <MenuItem key={term} value={term}>
                  {term}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )

      case 'location':
        return (
          <TextField
            value={localValue || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            size="small"
            fullWidth
            placeholder="Enter location..."
            sx={stylesForm.input}
            InputLabelProps={{
              shrink: true,
            }}
            label={label}
          />
        )

      case 'days':
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
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
                    onScheduleChange(field, formattedTime)
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
                    onScheduleChange(field, formattedTime)
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
            {hasScheduleChanges && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={saveScheduleChanges}
                  disabled={isSavingSchedule}
                  disableRipple
                  startIcon={isSavingSchedule ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    backgroundColor: 'hsl(var(--destructive))',
                    color: 'white',
                    height: 36,
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--destructive))',
                      boxShadow: 'none',
                    },
                    '&:active': {
                      backgroundColor: 'hsl(var(--destructive))',
                      boxShadow: 'none',
                    },
                    '&.MuiButtonBase-root:hover': {
                      backgroundColor: 'hsl(var(--destructive))',
                      boxShadow: 'none',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'hsl(var(--destructive) / 0.6)',
                      color: 'white',
                    }
                  }}
                >
                  {isSavingSchedule ? 'Syncing Calendar...' : 'Save Changes to Calendar'}
                </Button>
              </Box>
            )}
          </Box>
        )

      case 'start_date':
      case 'end_date':
        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={localValue ? dayjs(localValue) : null}
              onChange={(newValue) => onScheduleChange(field, newValue)}
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

      default:
        return (
          <TextField
            value={localValue || ''}
            onChange={(e) => handleInputChange(e.target.value)}
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
        px: 2,
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
      </Box>
    </Box>
  )
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
    '& .MuiSelect-select': {
      backgroundColor: 'white',
      '&:focus': {
        backgroundColor: 'white',
      },
    },
    '& .MuiFormLabel-root': {
      transform: 'translate(14px, -9px) scale(0.75)',
      backgroundColor: 'white',
      padding: '0 4px',
      '&.Mui-focused': {
        color: 'hsl(var(--brand-primary))',
      },
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

const UserCourseSchedule = ({ courseData, courseId, onSaveSuccess, setIsSavingGlobal }) => {
  const [scheduleChanges, setScheduleChanges] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [progressStep, setProgressStep] = useState(-1)
  const [showProgress, setShowProgress] = useState(false)

  const syncSteps = [
    { label: 'Updating course schedule' },
    { label: 'Syncing course descriptions' },
    { label: 'Updating student calendar' },
    { label: 'Updating all students calendar' }
  ]

  const handleScheduleChange = (field, value) => {
    console.log(`Schedule change for ${field}:`, value);
    setScheduleChanges((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const saveScheduleChanges = async () => {
    if (Object.keys(scheduleChanges).length === 0) {
      console.log('No changes to save')
      return
    }

    console.log('Saving schedule changes:', scheduleChanges)
    setIsSaving(true)
    setIsSavingGlobal(true)
    setShowProgress(true)
    setProgressStep(0)

    try {
      // Step 1: Update course data
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

        // Step 2: Sync course descriptions
        setProgressStep(1)
        await CourseDescriptionService.syncCoursesFromMyCourses(student.id)
        
        try {
          // Step 3: Sync individual student's calendar
          setProgressStep(2)
          await syncUserCalendars({
            userId: course.creator_id,
            userEmail: course.creator_email,
            student: {
              id: student.id,
              student_name: student.student_name,
            },
          });

          // Step 4: Sync "All Students" calendar
          setProgressStep(3)
          await syncUserCalendars({
            userId: course.creator_id,
            userEmail: course.creator_email,
            student: {
              id: '00000000-0000-0000-0000-000000000000',
              student_name: 'All Students',
              isAllStudents: true,
            },
            skipDatabaseEntry: true
          });

          toast.success('Calendar synced successfully')
        } catch (syncError) {
          console.error('Error during calendar sync:', syncError);
          toast.error('Failed to sync calendar')
          throw syncError;
        }

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
      setShowProgress(false)
      setProgressStep(-1)
    }
  }

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
          border: '1px solid hsl(var(--brand-primary) / 0.2)',
          borderRadius: '12px',
          p: 3,
          mb: 3,
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
            Course Schedule
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'hsl(var(--foreground))',
              lineHeight: 1.6,
            }}
          >
            Set your course schedule here. This will automatically sync with your calendar and update all related course information.
          </Typography>
        </Box>
      </Paper>

      {/* Schedule Content */}
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
              <Typography 
                variant="h5"
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000',
                  mb: 1.5
                }}
              >
                Basic Information
              </Typography>
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
                  saveScheduleChanges={saveScheduleChanges}
                />
                <InfoRow
                  label="Quarter"
                  value={courseData?.term_start}
                  field="term_start"
                  courseId={courseId}
                  onScheduleChange={handleScheduleChange}
                  isScheduleField={true}
                  hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
                  isSavingSchedule={isSaving}
                  onSaveSuccess={onSaveSuccess}
                  setIsSavingGlobal={setIsSavingGlobal}
                  saveScheduleChanges={saveScheduleChanges}
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
                  saveScheduleChanges={saveScheduleChanges}
                />
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
                Schedule Details
              </Typography>
              <Box sx={{ backgroundColor: 'hsl(var(--muted) / 0.3)', borderRadius: '8px', overflow: 'hidden' }}>
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
                  saveScheduleChanges={saveScheduleChanges}
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
                  saveScheduleChanges={saveScheduleChanges}
                />
                <InfoRow
                  label="Days of Week"
                  value={courseData?.days}
                  field="days"
                  courseId={courseId}
                  onScheduleChange={handleScheduleChange}
                  isScheduleField={true}
                  hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
                  isSavingSchedule={isSaving}
                  onSaveSuccess={onSaveSuccess}
                  setIsSavingGlobal={setIsSavingGlobal}
                  saveScheduleChanges={saveScheduleChanges}
                />
                <InfoRow
                  label="Class Times"
                  value={courseData?.times}
                  field="times"
                  courseId={courseId}
                  onScheduleChange={handleScheduleChange}
                  isScheduleField={true}
                  hasScheduleChanges={Object.keys(scheduleChanges).length > 0}
                  isSavingSchedule={isSaving}
                  onSaveSuccess={onSaveSuccess}
                  setIsSavingGlobal={setIsSavingGlobal}
                  saveScheduleChanges={saveScheduleChanges}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <ProgressModal
        open={showProgress}
        steps={syncSteps}
        currentStep={progressStep}
        onClose={() => setShowProgress(false)}
      />
    </Box>
  )
}

export default UserCourseSchedule 