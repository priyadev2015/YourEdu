export const getCurrentAcademicYear = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  // If we're before September 1st, we're in the previous academic year
  return now < new Date(currentYear, 8, 1) ? currentYear - 1 : currentYear
}

export const getAcademicYear = (course) => {
  const year = course.year
  const dates = course.dates

  if (!dates) {
    return year
  }

  try {
    const [startDate, endDate] = dates.split('-')
    const [startMonth, startDay] = startDate.split('/')
    const [endMonth, endDay] = endDate.split('/')

    // Calculate midpoint of the course
    const startTime = new Date(year, parseInt(startMonth) - 1, parseInt(startDay)).getTime()
    const endTime = new Date(year, parseInt(endMonth) - 1, parseInt(endDay)).getTime()
    const midpointTime = (startTime + endTime) / 2
    const midpoint = new Date(midpointTime)

    // Get September 1st of the PREVIOUS year
    const septemberFirst = new Date(year - 1, 8, 1)

    // If midpoint is after September 1st of previous year, it belongs to that academic year
    return midpoint > septemberFirst ? year - 1 : year - 2
  } catch (error) {
    console.error('Error parsing dates:', dates, error)
    return year
  }
}

export const determineGradeLevel = (courseYear, currentGrade, currentYear) => {
  const yearDiff = currentYear - courseYear
  const gradeWhenTaken = parseInt(currentGrade) - yearDiff

  if (gradeWhenTaken < 9) return 'preHighSchool'
  if (gradeWhenTaken > 12) return null // Course taken after graduation
  return `${gradeWhenTaken}thCourses`
}
