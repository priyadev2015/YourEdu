// Common fields that both college and youredu courses share
const transformBaseFields = (course) => ({
  courseTitle: course.title,
  description: course.description,
  credits: course.units,
  totalHours: course.total_hours,
  hsSubject: course.hs_subject,
  igetc: course.igetc,
})

export const transformCollegeCourse = (course) => ({
  ...transformBaseFields(course),
  id: course.crn,
  courseCode: course.course_code,
  institution: course.college,
  instructor: course.instructor,
  prerequisites: course.prerequisites,
  advisory: course.advisory,
  term: course.term,
  weeks: course.weeks,
  sections: [
    {
      section_locations: course.section_locations,
      section_times: course.section_times,
      price: course.price,
      term: course.term,
      enrolled: course.enrolled,
      maxStudents: course.max_students,
    },
  ],
  isYourEduCourse: false,
})

export const transformYourEduCourse = (course) => ({
  ...transformBaseFields(course),
  id: course.id,
  courseCode: course.id,
  institution: 'YourEDU',
  instructor: 'YourEDU Instructor',
  prerequisites: null,
  advisory: null,
  term: course.term_start,
  weeks: null,
  sections: [
    {
      section_locations: [course.location],
      section_times: [course.days, course.times],
      price: course.price,
      term: course.term_start,
      enrolled: (course.students || []).length,
      maxStudents: course.enrollment_capacity,
    },
  ],
  isYourEduCourse: true,
})

export const formatTerms = (sections) => {
  if (!sections?.length) return ''

  // Sort terms in chronological order (can be expanded later)
  const termOrder = ['winter', 'spring', 'summer', 'fall']

  const uniqueTerms = [...new Set(sections.filter((section) => section?.term).map((section) => section.term))]
    .sort((a, b) => {
      const termA = a.toLowerCase()
      const termB = b.toLowerCase()

      // Extract year if it exists
      const yearA = termA.match(/\d+/)?.[0] || '0'
      const yearB = termB.match(/\d+/)?.[0] || '0'

      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)

      const indexA = termOrder.findIndex((term) => termA.includes(term))
      const indexB = termOrder.findIndex((term) => termB.includes(term))

      return indexA - indexB
    })
    .join(', ')

  return uniqueTerms
}
