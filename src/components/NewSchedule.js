import React, { useState } from 'react'
import Calendar from '@toast-ui/react-calendar'
import '@toast-ui/calendar/dist/toastui-calendar.min.css'
import { Box, IconButton, Button } from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Google as GoogleIcon,
  CalendarMonth as CalendarMonthIcon,
  ViewWeek as ViewWeekIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'

const NewSchedule = ({
  startHour = 0,
  endHour = 24,
  previewMode = false,
  previewCourses = [],
  readOnly = false,
  scheduleData = [],
  defaultWeek = null,
  termStartDate = new Date(),
  termEndDate = new Date(),
  onWeekChange = () => {},
  viewMode = 'week',
  showControls = true,
  showExport = true,
  showViewSwitch = true,
  onViewModeChange = () => {},
  onExportClick = () => {},
  useDetailPopup = true,
  isPreProcessed = false,
}) => {
  const calendarRef = React.useRef(null)
  const [currentDate, setCurrentDate] = useState(defaultWeek || new Date())

  // Theme-matching colors
  const themeColors = {
    primary: 'hsl(207, 100%, 21%)',
    primaryLight: 'hsla(207, 100%, 21%, 0.05)', // For selection/today highlighting
    border: 'hsl(210, 6%, 88%)',
    background: 'hsl(210, 33%, 98%)',
    text: 'hsl(207, 100%, 21%)',
    textMuted: 'hsla(207, 100%, 21%, 0.4)',
  }

  const initialOptions = {
    defaultView: viewMode,
    useDetailPopup: true,
    week: {
      startDayOfWeek: 1,
      hourStart: startHour,
      hourEnd: endHour,
      taskView: false,
      eventView: ['time'],
    },
    month: {
      startDayOfWeek: 1,
      dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      visibleWeeksCount: 6,
    },
    theme: {
      common: {
        backgroundColor: themeColors.background,
        border: `1px solid ${themeColors.border}`,
        gridSelection: {
          backgroundColor: themeColors.primaryLight,
          border: `1px solid ${themeColors.primary}`,
        },
        dayName: {
          color: themeColors.text,
        },
        holiday: {
          color: themeColors.text,
        },
        saturday: {
          color: themeColors.text,
        },
        today: {
          color: themeColors.primary,
        },
      },
      week: {
        dayName: {
          borderBottom: `1px solid ${themeColors.border}`,
          backgroundColor: themeColors.background,
        },
        timeGridLeft: {
          border: `1px solid ${themeColors.border}`,
          backgroundColor: themeColors.background,
          width: '100px',
        },
        timeGridLeftAdditionalTimezone: {
          backgroundColor: themeColors.background,
        },
        timeGridHourLine: {
          borderBottom: `1px solid ${themeColors.border}`,
        },
        timeGridHalfHourLine: {
          borderBottom: `1px dotted ${themeColors.border}`,
        },
        nowIndicatorLabel: {
          color: themeColors.primary,
        },
        nowIndicatorPast: {
          border: `1px dashed ${themeColors.primary}`,
        },
        nowIndicatorBullet: {
          backgroundColor: themeColors.primary,
        },
        nowIndicatorToday: {
          border: `1px solid ${themeColors.primary}`,
        },
        pastTime: {
          color: themeColors.textMuted,
        },
        futureTime: {
          color: themeColors.text,
        },
        weekend: {
          backgroundColor: 'inherit',
        },
        today: {
          color: themeColors.primary,
          backgroundColor: themeColors.primaryLight,
        },
      },
      month: {
        dayExceptThisMonth: {
          color: themeColors.textMuted,
        },
        dayName: {
          borderLeft: 'none',
          backgroundColor: themeColors.background,
        },
        holidayExceptThisMonth: {
          color: themeColors.textMuted,
        },
        weekend: {
          backgroundColor: 'inherit',
        },
      },
    },
  }

  React.useEffect(() => {
    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance()
      calendarInstance.setTheme(initialOptions.theme)
      calendarInstance.changeView(viewMode)
    }
  }, [viewMode])

  const handlePrevious = () => {
    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance()
      calendarInstance.prev()
      setCurrentDate(calendarInstance.getDate().toDate())
    }
  }

  const handleNext = () => {
    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance()
      calendarInstance.next()
      setCurrentDate(calendarInstance.getDate().toDate())
    }
  }

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance()
      calendarInstance.today()
      setCurrentDate(new Date())
    }
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

  /**
   * Generates a random color for a course based on its ID
   * @param {string} id - Course ID
   * @returns {string} Hex color code
   */
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

  /**
   * Converts day names to three letter abbreviations
   * @param {string|string[]} days - Either a string of day codes (e.g., "MWF") or array of day names
   * @returns {string[]} Array of three letter day abbreviations
   */
  const parseDaysString = (days) => {
    console.log('Parsing days:', { days, type: typeof days })

    // Handle array input
    if (Array.isArray(days)) {
      return days.map((day) => day.substring(0, 3))
    }

    // Handle string input (keep existing logic for backward compatibility)
    if (typeof days === 'string') {
      const dayMap = {
        M: 'Mon',
        T: 'Tue',
        W: 'Wed',
        R: 'Thu',
        F: 'Fri',
        S: 'Sat',
        U: 'Sun',
      }

      return days
        .split('')
        .map((char) => char.trim())
        .filter(Boolean)
        .map((day) => dayMap[day])
        .filter(Boolean)
    }

    console.warn('Invalid days format received:', days)
    return []
  }

  /**
   * Creates events for a course between its start and end dates
   * @param {Object} course - Course object
   * @param {string[]} courseDays - Array of three letter day abbreviations
   * @returns {Array} Array of event objects
   */
  const createCourseEvents = (course, courseDays) => {
    console.log('Creating events for course:', {
      course,
      courseDays,
      startDate: course.startDate,
      endDate: course.endDate,
    })

    const events = []
    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)
    const currentDate = new Date(startDate)

    // Create events for each week between start and end dates
    while (currentDate <= endDate) {
      courseDays.forEach((day) => {
        const dayNumber = getDayNumber(day)
        const eventDate = new Date(currentDate)

        // Adjust to the correct day of the week
        const currentDayNumber = eventDate.getDay()
        const daysToAdd = (dayNumber - currentDayNumber + 7) % 7
        eventDate.setDate(eventDate.getDate() + daysToAdd)

        // Only create event if it's within the course dates
        if (eventDate >= startDate && eventDate <= endDate) {
          console.log('Creating event for date:', {
            day,
            eventDate,
            startTime: course.startTime,
            endTime: course.endTime,
          })

          events.push({
            id: `${course.id}_${day}_${eventDate.toISOString()}`,
            calendarId: 'courses',
            title: course.name || 'Unnamed Course',
            body: course.location || 'TBA',
            start: `${eventDate.toISOString().split('T')[0]}T${course.startTime}`,
            end: `${eventDate.toISOString().split('T')[0]}T${course.endTime}`,
            category: 'time',
            isReadOnly: true,
            backgroundColor: course.color || generateRandomColor(course.id || 'default'),
            borderColor: course.color || generateRandomColor(course.id || 'default'),
          })
        }
      })

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7)
    }

    return events
  }

  const transformCoursesToEvents = (courses) => {
    console.log('Transforming courses:', courses)

    const events = []

    if (!Array.isArray(courses)) {
      console.warn('Invalid courses data received:', courses)
      return events
    }

    courses.forEach((course) => {
      console.log('Processing course:', course)

      if (!course || typeof course !== 'object') {
        console.warn('Invalid course object:', course)
        return
      }

      const courseDays = parseDaysString(course.days)
      console.log('Parsed course days:', courseDays)

      if (courseDays.length > 0) {
        const courseEvents = createCourseEvents(course, courseDays)
        events.push(...courseEvents)
      }
    })

    console.log('Generated events:', events)
    return events
  }

  // Process data only if needed
  const processScheduleData = (data) => {
    if (isPreProcessed) {
      console.log('📅 Using pre-processed events:', data.length)
      return data
    }

    console.log('🔄 Processing raw schedule data:', data.length)
    return transformCoursesToEvents(data)
  }

  // Update the useEffect to use processScheduleData
  React.useEffect(() => {
    console.log('Schedule data received:', scheduleData)

    if (calendarRef.current && scheduleData.length > 0) {
      const calendarInstance = calendarRef.current.getInstance()

      // Set templates
      calendarInstance.setOptions({
        template: {
          time(event) {
            return `
              <div style="
                color: black;
                white-space: normal;
                word-break: break-word;
              ">
                ${event.title}
              </div>
            `
          },
          monthGridSchedule(event) {
            const start = new Date(event.start)
            const timeString = start.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })
            return `
              <div style="
                color: black;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                ${timeString} ${event.title}
              </div>
            `
          },
        },
      })

      // Use processScheduleData to handle both pre-processed and raw data
      const events = processScheduleData(scheduleData)
      calendarInstance.clear()
      calendarInstance.createEvents(events)
    }
  }, [scheduleData, currentDate, isPreProcessed]) // Add isPreProcessed to dependencies

  return (
    <div style={{ height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleToday}
            sx={{
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          >
            Today
          </Button>
          <IconButton onClick={handlePrevious}>
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ typography: 'body1', fontWeight: 500 }}>{format(currentDate, 'MMMM d, yyyy')}</Box>
          <IconButton onClick={handleNext}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {showControls && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showExport && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<GoogleIcon />}
                onClick={onExportClick}
                sx={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              >
                Export
              </Button>
            )}
            {showViewSwitch && (
              <Button
                variant="outlined"
                size="small"
                startIcon={viewMode === 'week' ? <CalendarMonthIcon /> : <ViewWeekIcon />}
                onClick={onViewModeChange}
                sx={{
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              >
                {viewMode === 'week' ? 'Month' : 'Week'}
              </Button>
            )}
          </Box>
        )}
      </Box>
      <Calendar
        ref={calendarRef}
        height="calc(100% - 60px)"
        view={viewMode}
        week={{
          showTimezoneCollapseButton: false,
          timezonesCollapsed: true,
          taskView: false,
          eventView: ['time'],
          hourStart: startHour,
          hourEnd: endHour,
        }}
        month={{
          visibleWeeksCount: 6,
          startDayOfWeek: 0,
        }}
        calendars={[
          {
            id: 'courses',
            name: 'Academic Calendar',
            backgroundColor: themeColors.primary,
            borderColor: themeColors.primary,
          },
        ]}
        events={scheduleData} // Use raw scheduleData here
        useDetailPopup={useDetailPopup}
        useCreationPopup={false}
        isReadOnly={true}
        template={{
          time: (event) => {
            return `<div style="color: black; font-weight: bold;">${event.title}</div>`
          },
          popupDetailBody: (event) => {
            return `
              <div>
              </div>
            `
          },
        }}
      />
    </div>
  )
}

export default NewSchedule
