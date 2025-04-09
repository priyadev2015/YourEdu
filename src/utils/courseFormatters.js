import dayjs from 'dayjs'

// Format schedule (days of week)
export const formatSchedule = (schedule) => {
  // Return early if schedule is not a string or is empty
  if (!schedule || typeof schedule !== 'string' || schedule === 'Asynchronous') {
    return 'Not set'
  }

  const dayMap = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday',
    S: 'Saturday',
    U: 'Sunday',
  }

  try {
    return schedule
      .trim()
      .split(/\s+/)
      .filter((day) => day)
      .map((day) => dayMap[day] || day)
      .join(', ')
  } catch (err) {
    console.error('Error formatting schedule:', err, { schedule })
    return 'Not set'
  }
}

// Format time ranges
export const formatTimes = (times) => {
  if (!times) return times
  const timePattern = /(\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)/i
  const match = times.match(timePattern)
  if (match) {
    return `${match[1]} - ${match[2]}`
  }
  return times
}

// Format school year
export const formatSchoolYear = (year) => {
  if (!year) return year
  return `${year}-${parseInt(year) + 1}`
}

// Format term start
export const formatTermStart = (termStart) => {
  if (!termStart) return 'Not set'

  // Extract just the term name, removing any year if present
  const termNames = ['Fall', 'Winter', 'Spring', 'Summer']
  const termWord = termStart.split(/\s+/)[0].toLowerCase()

  // Find matching term name (case-insensitive)
  const matchedTerm = termNames.find((term) => term.toLowerCase() === termWord)
  return matchedTerm || termStart
}

// Format term duration
export const formatTermDuration = (duration) => {
  if (!duration) return 'Not set'

  const durationMap = {
    quarter: 'Quarter',
    semester: 'Semester',
    'school year': 'School Year',
    schoolyear: 'School Year',
    summer: 'Summer',
  }

  return durationMap[duration.toLowerCase()] || duration
}

// Parse time string to dayjs object
export const parseTimeString = (timeStr) => {
  if (!timeStr) return null

  // Try to match time pattern with optional spaces and am/pm
  const timePattern = /(\d{1,2}:\d{2})\s*([ap]m)/i
  const match = timeStr.match(timePattern)

  if (!match) return null

  try {
    const [time, meridiem] = [match[1], match[2].toLowerCase()]
    let [hours, minutes] = time.split(':').map(Number)

    // Convert to 24 hour format
    if (hours === 12) hours = 0
    if (meridiem === 'pm') hours += 12

    return dayjs().hour(hours).minute(minutes)
  } catch (err) {
    console.error('Error parsing time:', err, { timeStr })
    return null
  }
}

// Format dayjs object to time string
export const formatTimeString = (date) => {
  if (!date || !dayjs.isDayjs(date)) return ''
  return date.format('h:mma') // Format as 12-hour time with am/pm
}

// Get display value for a field
export const getDisplayValue = (field, value) => {
  if (value === null || value === undefined) return 'Not set'

  switch (field) {
    case 'days':
      return formatSchedule(value)

    case 'times':
      return formatTimes(value)

    case 'dates':
      return value || 'Not set'

    case 'year':
      return formatSchoolYear(value)

    case 'term_start':
      return formatTermStart(value)

    case 'term_duration':
      return formatTermDuration(value)

    case 'is_college_level':
      return value === true || value === 'true' ? 'Yes' : 'No'

    case 'instruction_method':
      if (!value) return 'Not set'
      return value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')

    case 'units':
      return value ? `${value} units` : 'Not set'

    case 'total_hours':
      return value ? `${value} hours` : 'Not set'

    case 'college':
      return value || 'YourEDU'

    case 'teacher':
      return value || 'YourEDU Instructor'

    case 'materials':
    case 'textbooks':
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'Not set'
      }
      // If it's a string, treat it as a comma-separated list
      if (typeof value === 'string' && value.trim()) {
        return value
      }
      return 'Not set'

    default:
      return value || 'Not set'
  }
}
