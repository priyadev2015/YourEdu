export const formatSchedule = (schedule) => {
  if (!schedule || schedule === 'Asynchronous') return schedule
  if (typeof schedule !== 'string') return 'Not set'

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
  } catch (error) {
    console.error('Error formatting schedule:', error, schedule)
    return 'Not set'
  }
}

export const formatTimes = (times) => {
  if (!times) return ''
  const timePattern = /(\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)/i
  const match = times.match(timePattern)
  if (match) {
    return `${match[1]} - ${match[2]}`
  }
  return times
}

export const formatDates = (dates) => {
  if (!dates) return 'Dates not set'
  return dates
}
