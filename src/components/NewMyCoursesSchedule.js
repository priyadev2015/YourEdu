import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'
import NewSchedule from './NewSchedule'
import {
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Launch as LaunchIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { addWeeks, subWeeks } from 'date-fns'
import TodoList from './TodoList'
import { toast } from 'react-toastify'

const NewMyCoursesSchedule = ({
  showControls = true,
  showExport = true,
  showViewSwitch = true,
  height = 'calc(100vh - 80px)',
  embedded = false,
  showDetailPopup = true,
}) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('weekly')
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [addedCourses, setAddedCourses] = useState(new Set())
  const [todos, setTodos] = useState([])
  const [todoLoading, setTodoLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  // Match existing day mapping
  const dayMap = {
    M: 'Mon',
    T: 'Tue',
    W: 'Wed',
    R: 'Thu',
    F: 'Fri',
    S: 'Sat',
    U: 'Sun',
  }

  const parseDaysString = (daysString) => {
    if (!daysString) return []

    const dayArray = daysString
      .split('')
      .map((char) => char.trim())
      .filter(Boolean)

    return dayArray
      .map((day) => dayMap[day])
      .filter(Boolean)
      .map((day) => dayMap[day] || day)
  }

  const convert12to24 = (time12h) => {
    if (!time12h) return '09:00'

    const cleanTime = time12h.trim().toLowerCase()

    if (cleanTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return cleanTime.padStart(5, '0')
    }

    try {
      const [time, modifier] = cleanTime.split(/([ap]m)/)
      let [hours, minutes] = time.trim().split(':')

      hours = parseInt(hours, 10)
      minutes = parseInt(minutes, 10)

      if (isNaN(hours) || isNaN(minutes)) {
        console.warn('Invalid time format:', time12h)
        return '09:00'
      }

      if (hours === 12) hours = 0
      if (modifier === 'pm') hours += 12

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } catch (error) {
      console.warn('Error parsing time:', time12h, error)
      return '09:00'
    }
  }

  const parseDateRange = (dateString, year) => {
    if (!dateString || !year) {
      return {
        startDate: new Date(`${year || 2025}-01-08`),
        endDate: new Date(`${year || 2025}-05-03`),
      }
    }

    try {
      const [start, end] = dateString.split('-')
      const [startMonth, startDay] = start.split('/').map(Number)
      const [endMonth, endDay] = end.split('/').map(Number)

      const startDate = new Date(year, startMonth - 1, startDay)
      const endDate = new Date(year, endMonth - 1, endDay)

      return { startDate, endDate }
    } catch (error) {
      console.error('Error parsing date range:', error)
      return {
        startDate: new Date(`${year || 2025}-01-08`),
        endDate: new Date(`${year || 2025}-05-03`),
      }
    }
  }

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from('user_courses').select('*').eq('uid', user.id)

        if (error) throw error

        const formattedCourses = data
          .map((course) => {
            try {
              const times = course.times ? course.times.split('-').map((t) => t.trim()) : ['9:00am', '10:00am']
              const startTime = convert12to24(times[0])
              const endTime = convert12to24(times[1])
              const days = parseDaysString(course.days)
              const { startDate, endDate } = parseDateRange(course.dates, course.year)

              if (!startTime || !endTime || days.length === 0) {
                console.warn('Skipping course with invalid data:', course)
                return null
              }

              return {
                id: course.course_code || `Course-${course.id}`,
                name: course.title,
                days,
                startTime,
                endTime,
                color: generateRandomColor(course.id),
                section: '1',
                selected: true,
                startDate,
                endDate,
              }
            } catch (error) {
              console.error('Error processing course:', course, error)
              return null
            }
          })
          .filter(Boolean)

        setCourses(formattedCourses)
      } catch (error) {
        console.error('Error fetching user courses:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserCourses()
  }, [user])

  useEffect(() => {
    if (user) fetchTodos()
  }, [user])

  const fetchTodos = async () => {
    try {
      const { data: todosData, error: todosError } = await supabase
        .from('user_courses_todos')
        .select('*')
        .eq('uid', user.id)
        .order('importance', { ascending: false })

      if (todosError) throw todosError

      const allCourseIds = todosData
        .flatMap((todo) => todo.user_course_ids)
        .filter((id, index, self) => self.indexOf(id) === index)

      const { data: coursesData, error: coursesError } = await supabase
        .from('user_courses')
        .select('id, title')
        .in('id', allCourseIds)

      if (coursesError) throw coursesError

      const courseTitlesMap = Object.fromEntries(coursesData.map((course) => [course.id, course.title]))
      const processedTodos = todosData.map((todo) => ({
        ...todo,
        course_titles: todo.user_course_ids.map((id) => courseTitlesMap[id]).filter(Boolean),
      }))

      setTodos(processedTodos)
    } catch (error) {
      console.error('Error fetching todos:', error)
      toast.error('Failed to load todos')
    } finally {
      setTodoLoading(false)
    }
  }

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

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoId ? { ...todo, completed, completed_at: completed ? new Date().toISOString() : null } : todo
        )
      )
    } catch (err) {
      console.error('Error updating todo:', err)
      toast.error('Failed to update todo')
    }
  }

  const generateRandomColor = (id) => {
    const colors = [
      '#4299E1', // blue
      '#48BB78', // green
      '#ED8936', // orange
      '#9F7AEA', // purple
      '#F56565', // red
      '#38B2AC', // teal
      '#ED64A6', // pink
    ]

    const hash = Array.from(id.toString()).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    return colors[Math.abs(hash) % colors.length]
  }

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1))
  }

  const createGoogleCalendarUrl = (course) => {
    // Format dates in YYYYMMDDTHHMMSSZ format
    const formatGoogleDate = (date, time) => {
      const [hours, minutes] = time.split(':')
      const d = new Date(date)
      d.setHours(parseInt(hours), parseInt(minutes), 0)
      return d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/g, '')
    }

    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)

    // Find the first occurrence of any course day
    const firstDate = new Date(startDate)
    const dayNums = course.days.map((day) => getDayNumber(day))
    const currentDay = firstDate.getDay()
    const daysToAdd = Math.min(...dayNums.map((dayNum) => (dayNum - currentDay + 7) % 7))
    firstDate.setDate(firstDate.getDate() + daysToAdd)

    // Create recurrence rule for the term
    const untilDate = endDate
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/g, '')

    // Convert days to Google Calendar format (MO,TU,WE,etc)
    const byDays = course.days.map((day) => day.substring(0, 2).toUpperCase()).join(',')

    // Create RRULE with all weekdays
    const recurrence = `RRULE:FREQ=WEEKLY;BYDAY=${byDays};UNTIL=${untilDate}`

    // Create event details
    const details = [
      `Course: ${course.name}`,
      `Section: ${course.section || 'N/A'}`,
      `Location: ${course.location || 'TBA'}`,
      `Term: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      `Schedule: ${course.days.join(', ')} ${course.startTime} - ${course.endTime}`,
    ].join('\n')

    const eventStart = formatGoogleDate(firstDate, course.startTime)
    const eventEnd = formatGoogleDate(firstDate, course.endTime)

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: course.name,
      details,
      dates: `${eventStart}/${eventEnd}`,
      recur: recurrence,
      location: course.location || 'TBA',
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const handleGoogleCalendarExport = () => {
    setExportDialogOpen(true)
  }

  const handleCourseExport = (course) => {
    window.open(createGoogleCalendarUrl(course), '_blank')
    setAddedCourses((prev) => new Set([...prev, course.id]))
  }

  /**
   * Converts a day abbreviation (e.g., 'Mon', 'Tue') to a number (0-6)
   * @param {string} day - Three letter day abbreviation
   * @returns {number} Day number (0 = Sunday, 1 = Monday, etc.)
   */
  const getDayNumber = (day) => {
    const dayMap = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    }
    return dayMap[day]
  }

  if (loading) {
    return <div>Loading schedule... {!user && '(Waiting for user authentication)'}</div>
  }

  if (error) {
    return <div>Error loading schedule: {error}</div>
  }

  if (!user) {
    return <div>Please log in to view your schedule</div>
  }

  const scheduleContent = (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        height: 'calc(100vh - 80px)',
      }}
    >
      {/* Calendar Section */}
      <Box
        sx={{
          flex: '2',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        <NewSchedule
          scheduleData={courses}
          readOnly={true}
          startHour={8}
          endHour={20}
          previewMode={true}
          defaultWeek={new Date()}
          viewMode={viewMode === 'weekly' ? 'week' : 'month'}
          showControls={showControls}
          showExport={showExport}
          showViewSwitch={showViewSwitch}
          onViewModeChange={() => setViewMode(viewMode === 'weekly' ? 'monthly' : 'weekly')}
          onExportClick={handleGoogleCalendarExport}
          useDetailPopup={showDetailPopup}
        />
      </Box>

      {/* Todos Section */}
      <Box
        sx={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '400px',
          overflow: 'auto',
          p: 2,
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
        }}
      >
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab
            label={`Active (${todos.filter((t) => !t.completed).length})`}
            value="active"
            sx={{ fontSize: '0.875rem' }}
          />
          <Tab
            label={`Completed (${todos.filter((t) => t.completed).length})`}
            value="completed"
            sx={{ fontSize: '0.875rem' }}
          />
        </Tabs>

        {todoLoading ? (
          <CircularProgress />
        ) : (
          <TodoList
            todos={todos.filter((todo) => (activeTab === 'active' ? !todo.completed : todo.completed))}
            onTodoToggle={handleTodoToggle}
            showCourseInfo={true}
            compact={true}
          />
        )}
      </Box>
    </Box>
  )

  if (embedded) {
    return scheduleContent
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-lg)',
          mb: 2,
        }}
      >
        {scheduleContent}
      </Paper>

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Courses to Google Calendar</DialogTitle>
        <DialogContent>
          <List>
            {courses.map((course) => (
              <ListItem
                key={course.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {addedCourses.has(course.id) && (
                      <Box
                        component="span"
                        sx={{
                          typography: 'body2',
                          color: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        Added
                      </Box>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleCourseExport(course)}
                      title={addedCourses.has(course.id) ? 'Add again to Google Calendar' : 'Add to Google Calendar'}
                      color={addedCourses.has(course.id) ? 'success' : 'default'}
                    >
                      {addedCourses.has(course.id) ? <CheckIcon /> : <LaunchIcon />}
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={course.name}
                  secondary={`${course.days.join(', ')} - ${course.startTime} to ${course.endTime}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewMyCoursesSchedule
