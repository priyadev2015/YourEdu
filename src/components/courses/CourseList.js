import React, { useState, useEffect } from 'react'
import { Box, Button } from '@mui/material'
import { supabase } from '../../utils/supabaseClient'
import CourseCard from './CourseCard'
import { generateCourseTags, COMMUNITY_COLLEGES } from '../../utils/courseTagUtils'

const ITEMS_PER_PAGE = 20

const CourseList = ({
  searchQuery,
  selectedLocation,
  mileRadius,
  subjectFilters,
  providerFilters,
  extracurricularFilters,
  termFilters,
  priceFilter,
  ratingFilter,
  onRegisterClick,
}) => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [groupedCourses, setGroupedCourses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedCourses, setExpandedCourses] = useState({})

  const PROVIDER_TO_COLLEGES = {
    'Community Colleges': COMMUNITY_COLLEGES,
    'College/University': [],
    Microschool: [],
    'Co-op': [],
    'Online School': ['Polygence'],
  }

  // Helper function to group courses
  const groupCoursesByTitle = (courses) => {
    return courses.reduce((acc, course) => {
      const fullTitle = `${course.courseCode} (${[course.institution].filter(Boolean).join(' - ')})`
      if (!acc[fullTitle]) {
        acc[fullTitle] = []
      }
      acc[fullTitle].push(course)
      return acc
    }, {})
  }

  const toggleCourseExpansion = (courseCode) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseCode]: !prev[courseCode],
    }))
  }

  // Add a helper function for term filtering
  const hasTermSection = (courses, terms) => {
    return courses.some((section) => terms.includes(section.term))
  }

  // Add this helper function to parse price ranges
  const getPriceRange = (priceFilter) => {
    switch (priceFilter) {
      case 'Free':
        return { min: 0, max: 0 }
      case 'Under $100':
        return { min: 0.01, max: 100 }
      case '$100 - $250':
        return { min: 100, max: 250 }
      case '$250 - $500':
        return { min: 250, max: 500 }
      case '$500+':
        return { min: 500, max: Infinity }
      default:
        return null
    }
  }

  // Load filtered courses
  const loadFilteredCourses = async () => {
    if (
      !searchQuery.trim() &&
      !subjectFilters.length &&
      !providerFilters.length &&
      !extracurricularFilters.length &&
      !termFilters.length &&
      !priceFilter
    ) {
      setFilteredCourses([])
      setCourses([])
      setGroupedCourses([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Stage 1: Query college_courses with base filters
      let baseQuery = supabase.from('college_courses').select('*')

      // Apply text search if exists
      if (searchQuery) {
        baseQuery = baseQuery.or(
          `title.ilike.%${searchQuery}%,` +
            `code.ilike.%${searchQuery}%,` +
            `hs_subject.ilike.%${searchQuery}%,` +
            `college.ilike.%${searchQuery}%`
        )
      }

      // Apply subject filters
      if (subjectFilters.length > 0) {
        baseQuery = baseQuery.in('hs_subject', subjectFilters)
      }

      // Apply provider (college) filters
      if (providerFilters.length > 0) {
        let collegeList = []
        providerFilters.forEach((provider) => {
          collegeList = [...collegeList, ...PROVIDER_TO_COLLEGES[provider]]
        })
        if (collegeList.length > 0) {
          baseQuery = baseQuery.in('college', collegeList)
        }
      }

      const { data: baseCourses, error: baseError } = await baseQuery

      if (baseError) throw baseError
      if (!baseCourses?.length) {
        setFilteredCourses([])
        setCourses([])
        setGroupedCourses([])
        return
      }

      // Stage 2: Get schedules for filtered courses
      let scheduleQuery = supabase
        .from('college_courses_schedules')
        .select('*')
        .in(
          'course_code',
          baseCourses.map((course) => course.code)
        )

      // Only add term filter if terms are selected
      if (termFilters.length > 0) {
        scheduleQuery = scheduleQuery.in('term', termFilters)
      }

      const { data: schedules, error: scheduleError } = await scheduleQuery

      if (scheduleError) throw scheduleError

      // Combine course and schedule data
      const combinedData = baseCourses
        .map((course) => {
          let courseSchedules = schedules.filter(
            (schedule) => schedule.course_code === course.code && schedule.college === course.college
          )

          // Apply price filter if selected
          if (priceFilter) {
            const range = getPriceRange(priceFilter)
            courseSchedules = courseSchedules.filter(
              (schedule) => schedule.price >= range.min && schedule.price <= range.max
            )
          }

          if (!courseSchedules.length) return null

          // Transform into our standard format
          return courseSchedules.map((schedule) => ({
            id: schedule.crn,
            courseCode: course.code,
            courseTitle: course.title,
            institution: course.college,
            instructor: schedule.instructor,
            prerequisites: course.prerequisites,
            advisory: course.advisory,
            courseSchedule: schedule.section_times,
            courseDates: schedule.section_dates,
            location: schedule.section_locations,
            instructionMethod: schedule.section_locations?.includes('ONLINE') ? 'Online' : 'In Person',
            credits: course.units,
            totalHours: course.total_hours,
            description: course.description,
            status: schedule.status,
            enrolled: schedule.enrolled,
            maxStudents: schedule.max_students,
            waitlisted: schedule.waitlisted,
            hsSubject: course.hs_subject,
            extraNotes: schedule.extra_notes,
            term: schedule.term,
            weeks: schedule.weeks,
            price: schedule.price,
            discount: schedule.discount,
            application_required: schedule.application_required || false,
            isYourEduCourse: false,
          }))
        })
        .filter(Boolean) // Remove null entries
        .flat() // Flatten array of arrays

      // Handle YouredU courses separately if Online School provider is selected
      let youreduData = []
      if (providerFilters.includes('Online School')) {
        const { data: youreduCourses, error: youreduError } = await supabase
          .from('youredu_courses')
          .select('*')
          .eq('is_published', true)
          .or(
            `title.ilike.%${searchQuery}%,` +
              `hs_subject.ilike.%${searchQuery}%,` +
              `institution.ilike.%${searchQuery}%`
          )

        if (!youreduError && youreduCourses) {
          youreduData = youreduCourses.map((course) => ({
            id: course.id,
            courseCode: course.id,
            courseTitle: course.title,
            institution: 'YourEDU',
            instructor: 'YourEDU Instructor',
            prerequisites: null,
            advisory: null,
            courseSchedule: [course.days, course.times],
            courseDates: [course.dates],
            location: course.location ? [course.location] : null,
            instructionMethod: course.instruction_method || 'Not specified',
            credits: course.units,
            totalHours: course.total_hours,
            description: course.description,
            status: 'Active',
            enrolled: (course.students || []).length,
            maxStudents: course.enrollment_capacity,
            waitlisted: 0,
            hsSubject: course.hs_subject,
            extraNotes: null,
            term: course.term_start,
            weeks: null,
            isYourEduCourse: true,
            price: null,
            discount: null,
          }))
        }
      }

      const allCourses = [...combinedData, ...youreduData]

      // Group courses by title
      const grouped = Object.entries(groupCoursesByTitle(allCourses))

      setGroupedCourses(grouped || [])
      setFilteredCourses(allCourses || [])
      setCourses(allCourses || [])
    } catch (error) {
      console.error('Error loading filtered courses:', error)
      setError(error.message)
      setFilteredCourses([])
      setCourses([])
      setGroupedCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  // Effect to load courses when filters change
  useEffect(() => {
    loadFilteredCourses()
  }, [searchQuery, subjectFilters, providerFilters, extracurricularFilters, termFilters, priceFilter, currentPage])

  // Add this helper function for pagination text
  const getPaginationText = (currentPage, itemsPerPage, totalItems) => {
    const start = currentPage * itemsPerPage + 1
    const end = Math.min((currentPage + 1) * itemsPerPage, totalItems)
    return `Showing ${start}-${end} of ${totalItems} results`
  }

  // Modify the render function to paginate groupedCourses
  const renderResults = () => {
    if (isLoading) {
      return <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>
    }

    if (!groupedCourses?.length) {
      // Check if any selected provider has no colleges
      const hasEmptyProvider = providerFilters.some((provider) => PROVIDER_TO_COLLEGES[provider].length === 0)

      if (hasEmptyProvider) {
        return (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            Coming soon! We're working on adding more educational providers to our platform.
          </Box>
        )
      }

      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          {searchQuery.trim() ? 'No courses found matching your search.' : 'Enter a search term to find courses.'}
        </Box>
      )
    }

    const start = currentPage * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    const paginatedGroups = groupedCourses.slice(start, end)

    return paginatedGroups.map(([title, courses]) => {
      // Create a course object that matches the expected structure
      const courseData = {
        title,
        courseTitle: courses[0].courseTitle,
        hsSubject: courses[0].hsSubject,
        igetc: courses[0].igetc,
        sections: courses.map((course) => {
          // Create a properly formatted section object with all properties
          const section = { ...course } // Copy all properties

          // Ensure section_locations is an array
          section.section_locations = Array.isArray(course.location)
            ? course.location
            : course.location
            ? [course.location]
            : []

          // Ensure section_times is an array
          section.section_times = Array.isArray(course.courseSchedule)
            ? course.courseSchedule
            : course.courseSchedule
            ? [course.courseSchedule]
            : []

          // Remove the original properties to avoid duplication
          delete section.location
          delete section.courseSchedule

          return section
        }),
        ...Object.fromEntries(Object.entries(courses[0]).filter(([key]) => key !== 'sections')),
      }

      // Strategic logging to understand section data and tag generation
      console.log(`Course: ${courseData.courseTitle} (${courseData.institution})`)

      // Log a sample section to see its structure
      if (courseData.sections && courseData.sections.length > 0) {
        console.log('Sample section data:', {
          section_times: courseData.sections[0].section_times,
          section_locations: courseData.sections[0].section_locations,
          enrolled: courseData.sections[0].enrolled,
          maxStudents: courseData.sections[0].maxStudents,
          application_required: courseData.sections[0].application_required,
        })
      } else {
        console.log('No sections available for this course')
      }

      // Generate tags and log them
      const tags = generateCourseTags(courseData)
      console.log(
        'Generated tags:',
        tags.map((tag) => tag.title)
      )

      return (
        <CourseCard
          key={title}
          courseGroup={[title, [courseData]]} // Pass the transformed data
          expandedCourses={expandedCourses}
          toggleCourseExpansion={toggleCourseExpansion}
          handleRegisterClick={onRegisterClick}
          tags={tags}
        />
      )
    })
  }

  return (
    <Box sx={{ flex: 1 }}>
      {renderResults()}

      {/* Pagination Controls */}
      {!isLoading && groupedCourses.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            mt: 'var(--spacing-6)',
          }}
        >
          <Button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
            sx={{
              color: 'hsl(var(--text-primary))',
              borderColor: 'hsl(var(--border))',
              '&:hover': {
                borderColor: 'hsl(var(--brand-primary))',
                backgroundColor: 'hsla(var(--brand-primary), 0.1)',
              },
            }}
          >
            Previous
          </Button>

          <Box
            sx={{
              color: 'hsl(var(--text-secondary))',
              fontSize: '14px',
              mx: 'var(--spacing-4)',
            }}
          >
            {getPaginationText(currentPage, ITEMS_PER_PAGE, groupedCourses.length)}
          </Box>

          <Button
            disabled={currentPage >= Math.ceil(groupedCourses.length / ITEMS_PER_PAGE) - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
            sx={{
              color: 'hsl(var(--text-primary))',
              borderColor: 'hsl(var(--border))',
              '&:hover': {
                borderColor: 'hsl(var(--brand-primary))',
                backgroundColor: 'hsla(var(--brand-primary), 0.1)',
              },
            }}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default CourseList
