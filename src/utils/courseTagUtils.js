import { SUBJECT_COLORS, SUBJECT_DISPLAY_NAMES } from './subjectColors'

// Define community college providers
export const COMMUNITY_COLLEGES = [
  'Sierra College',
  'Foothill College',
  'Foothill',
  'DeAnza',
  'CCSF',
  'Mission College',
  'Mission',
  'Campus Community College',
]

// Tag configuration
const TAG_CONFIG = {
  SUBJECT: {
    title: (course) => SUBJECT_DISPLAY_NAMES[course.hsSubject] || course.hsSubject,
    color: (course) => SUBJECT_COLORS[course.hsSubject] || 'hsl(var(--brand-primary))',
    check: (course) => course.hsSubject,
    isSubjectTag: true,
  },
  APPLICATION_REQUIRED: {
    title: 'Application Required',
    color: 'hsl(0, 72%, 51%)', // Red color for important notice
    check: (course) => course.sections?.some((section) => section.application_required === true),
  },
  IGETC: {
    title: (course) => `IGETC ${course.igetc}`,
    color: 'hsl(var(--success))',
    check: (course) => course.igetc !== null && course.igetc !== undefined && course.igetc !== '',
  },
  COMMUNITY_COLLEGE: {
    title: 'Community College',
    color: 'hsl(var(--warning))',
    check: (course) => COMMUNITY_COLLEGES.includes(course.institution),
  },
  ASYNCHRONOUS: {
    title: 'Asynchronous',
    color: 'hsl(221, 67%, 46%)', // icons.blue
    check: (course) =>
      course.sections?.some(
        (section) =>
          (typeof section.section_times?.[0] === 'string' &&
            section.section_times[0].toLowerCase().includes('asynchronous')) ||
          (typeof section.section_locations?.[0] === 'string' &&
            section.section_locations[0].toLowerCase().includes('asynchronous'))
      ),
  },
  TIMES_ADDED: {
    title: 'Times Added',
    color: 'hsl(255, 92%, 76%)', // icons.purple
    check: (course) =>
      course.sections?.some((section) => {
        const hasAvailableSeats = (section.maxStudents || 0) - (section.enrolled || 0) > 0
        const hasMultipleTimes = section.section_times?.length >= 2
        return hasAvailableSeats && hasMultipleTimes
      }),
  },
  FREE: {
    title: 'Free',
    color: 'hsl(142, 70%, 45%)', // icons.green
    check: (course) =>
      course.sections?.some((section) => section.price === 0 || section.price === '0' || section.price === null),
  },
  DISCOUNT: {
    title: (course) => {
      const maxDiscount = getMaxDiscount(course.sections)
      return maxDiscount > 0 ? `${maxDiscount}% Off` : null
    },
    color: 'hsl(142, 70%, 45%)', // icons.green
    check: (course) => getMaxDiscount(course.sections) > 0,
  },
  ONLINE: {
    title: 'Online Available',
    color: 'hsl(var(--info))',
    check: (course) =>
      course.sections?.some((section) =>
        section.section_locations?.some((loc) => loc?.toLowerCase().includes('online'))
      ),
  },
}

// Helper functions
const calculateAvailableSeats = (sections) => {
  if (!sections?.length) return 0
  return sections.reduce((total, section) => {
    const available = section.maxStudents - (section.enrolled || 0)
    return total + (available > 0 ? available : 0)
  }, 0)
}

const getMaxDiscount = (sections) => {
  if (!sections?.length) return 0
  return sections.reduce((maxDiscount, section) => {
    if (section.price > 0 && section.discount > 0) {
      const discountPercent = Math.round((section.discount / section.price) * 100)
      return Math.max(maxDiscount, discountPercent)
    }
    return maxDiscount
  }, 0)
}

// Status tag configuration
export const getStatusTag = (sections) => {
  if (!sections?.length) {
    return {
      text: 'No Sections',
      color: 'hsla(var(--text-secondary), 0.3)',
      textColor: 'hsl(var(--foreground))',
    }
  }

  let totalSeats = 0
  let totalEnrolled = 0
  let hasValidSections = false

  sections.forEach((section) => {
    if (section.maxStudents) {
      hasValidSections = true
      totalSeats += section.maxStudents
      totalEnrolled += section.enrolled || 0
    }
  })

  if (!hasValidSections) {
    return {
      text: 'No Seats Info',
      color: 'hsla(var(--text-secondary), 0.3)',
      textColor: 'hsl(var(--foreground))',
    }
  }

  const seatsAvailable = totalSeats - totalEnrolled

  if (seatsAvailable <= 0) {
    return {
      text: 'Full',
      color: 'hsla(35, 92%, 50%, 0.3)',
      textColor: 'hsl(var(--foreground))',
    }
  }

  return {
    text: 'Seats Open',
    color: 'hsla(142, 70%, 45%, 0.3)',
    textColor: 'hsl(var(--foreground))',
  }
}

export const generateCourseTags = (course) => {
  if (!course) return []
  const tags = []

  // Add subject tag first (if exists)
  if (TAG_CONFIG.SUBJECT.check(course)) {
    tags.push({
      title: TAG_CONFIG.SUBJECT.title(course),
      color: TAG_CONFIG.SUBJECT.color(course),
      isSubjectTag: true,
    })
  }

  // Then check other tags
  Object.values(TAG_CONFIG).forEach((tagConfig) => {
    if (tagConfig.isSubjectTag) return // Skip subject tag
    if (tagConfig.check(course)) {
      const title = typeof tagConfig.title === 'function' ? tagConfig.title(course) : tagConfig.title

      if (title) {
        // Only add tag if title is not null
        tags.push({
          title,
          color: typeof tagConfig.color === 'function' ? tagConfig.color(course) : tagConfig.color,
        })
      }
    }
  })

  return tags
}
