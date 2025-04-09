import { format, addDays, startOfWeek } from 'date-fns'

// Add color mapping function
const getStudentColorId = (studentId) => {
  console.log('Getting color ID for student:', studentId)

  if (!studentId) {
    console.log('No student ID provided, using default color 7 (Peacock blue)')
    return '7'
  }

  // Convert UUID to a number between 1-11 (Google Calendar's color range)
  const cleanId = studentId.replace(/-/g, '').slice(0, 8)
  console.log('Cleaned student ID for color calculation:', cleanId)

  const numericValue = parseInt(cleanId, 16)
  console.log('Numeric value from student ID:', numericValue)

  const colorId = ((numericValue % 11) + 1).toString()
  console.log('Calculated color ID:', colorId)

  return colorId
}

export const convertCourseToGoogleEvent = (course) => {
  console.log('Converting course to events:', course)

  // Map day abbreviations to numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap = {
    U: 0,
    M: 1,
    T: 2,
    W: 3,
    R: 4,
    F: 5,
    S: 6,
  }

  // Parse course days into array of day numbers
  const courseDays = (course.days || '').split('').map((day) => dayMap[day])
  console.log('Parsed course days:', { original: course.days, parsed: courseDays })

  // Parse times from the "times" field (e.g., "10:45am - 01:50pm")
  const parseCourseTimes = (timesStr) => {
    // Default times for TBA courses
    const DEFAULT_START = '09:00'
    const DEFAULT_END = '10:00'

    if (!timesStr || timesStr.includes('TBA')) {
      console.log('Using default times for TBA course')
      return { startTime: DEFAULT_START, endTime: DEFAULT_END }
    }

    const [start, end] = timesStr.split('-').map((t) => t.trim())
    const startTime = parseTime(start) || DEFAULT_START
    const endTime = parseTime(end) || DEFAULT_END

    // Validate times are in correct format
    if (!startTime.match(/^\d{2}:\d{2}$/) || !endTime.match(/^\d{2}:\d{2}$/)) {
      console.warn('Invalid time format, using defaults', { startTime, endTime })
      return { startTime: DEFAULT_START, endTime: DEFAULT_END }
    }

    return { startTime, endTime }
  }

  // Parse individual time
  const parseTime = (timeStr) => {
    console.log('Parsing time:', timeStr)
    if (!timeStr) return '09:00'

    const cleanTime = timeStr.trim().toLowerCase()
    if (cleanTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return cleanTime.padStart(5, '0')
    }

    try {
      const [time, modifier] = cleanTime.split(/([ap]m)/)
      let [hours, minutes] = time.trim().split(':')

      hours = parseInt(hours, 10)
      minutes = parseInt(minutes || 0, 10)

      if (modifier === 'pm' && hours < 12) hours += 12
      if (modifier === 'am' && hours === 12) hours = 0

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } catch (error) {
      console.error('Error parsing time:', timeStr, error)
      return '09:00'
    }
  }

  // Parse dates from the "dates" field (e.g., "01/27-05/24")
  const parseDates = (datesStr) => {
    if (!datesStr) return { startDate: new Date(), endDate: addDays(new Date(), 90) }

    const [start, end] = datesStr.split('-').map((d) => {
      const [month, day] = d.trim().split('/')
      const year = new Date().getFullYear()
      return new Date(year, parseInt(month) - 1, parseInt(day))
    })

    return { startDate: start, endDate: end }
  }

  const { startTime, endTime } = parseCourseTimes(course.times)
  const { startDate, endDate } = parseDates(course.dates)

  console.log('Parsed times:', { startTime, endTime })
  console.log('Parsed dates:', { startDate, endDate })

  // Get the next occurrence of each course day
  const events = courseDays.map((dayNumber) => {
    const courseStart = startOfWeek(startDate)
    const dayDate = addDays(courseStart, dayNumber)

    const event = {
      summary: course.title,
      location: course.location || 'TBA',
      description: `Course: ${course.title}\nLocation: ${course.location || 'TBA'}${
        course.student_name ? `\nStudent: ${course.student_name}` : ''
      }`,
      colorId: getStudentColorId(course.student_id),
      start: {
        dateTime: `${format(dayDate, 'yyyy-MM-dd')}T${startTime}:00`,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: `${format(dayDate, 'yyyy-MM-dd')}T${endTime}:00`,
        timeZone: 'America/Los_Angeles',
      },
      recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${format(endDate, 'yyyyMMdd')}T235959Z`],
    }

    console.log('Created event with color details:', {
      studentId: course.student_id,
      studentName: course.student_name,
      colorId: event.colorId,
      eventSummary: event.summary,
    })

    return event
  })

  return events
}
