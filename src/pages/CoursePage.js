import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import CourseCard from '../components/courses/CourseCard'
import { Box, Typography, Button, Container, Snackbar, Alert } from '@mui/material'
import { toast } from 'react-toastify'
import { useAuth } from '../utils/AuthContext'
import { Share as ShareIcon } from '@mui/icons-material'
import PublicAuthWrapper from '../components/PublicAuthWrapper'
import RegistrationPrompt from '../components/RegistrationPrompt'
import { generateCourseTags } from '../utils/courseTagUtils'
import { transformCollegeCourse, transformYourEduCourse } from '../utils/courseDataUtils'
import { cardStyles } from '../styles/theme/components/cards'
import { formatSchedule, formatTimes } from '../utils/courseFormatters'

const CoursePage = () => {
  const { college, courseCode } = useParams()
  const [courseInfo, setCourseInfo] = useState(null)
  const [sections, setSections] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const termOrder = ['winter', 'spring', 'summer', 'fall']

  const sortSectionsByTerm = (sections) => {
    if (!sections || sections.length === 0) return []

    return sections.sort((a, b) => {
      const termA = (a.term || '').toLowerCase()
      const termB = (b.term || '').toLowerCase()

      // Extract year from term if it exists
      const yearMatchA = termA.match(/\d+/)
      const yearMatchB = termB.match(/\d+/)

      const yearA = yearMatchA ? parseInt(yearMatchA[0], 10) : 0
      const yearB = yearMatchB ? parseInt(yearMatchB[0], 10) : 0

      // If years are different, sort by year
      if (yearA !== yearB) {
        return yearA - yearB
      }

      // If no year or same year, sort by term
      const termIndexA = termOrder.findIndex((term) => termA.includes(term))
      const termIndexB = termOrder.findIndex((term) => termB.includes(term))

      // If term not found in order, put it at the end
      if (termIndexA === -1) return 1
      if (termIndexB === -1) return -1

      return termIndexA - termIndexB
    })
  }

  useEffect(() => {
    const loadCourseData = async () => {
      console.log('Loading course data for:', { college, courseCode })
      setIsLoading(true)
      setError(null)

      try {
        // First try to get from college_courses
        const { data: courseData, error: courseError } = await supabase
          .from('college_courses')
          .select('*')
          .eq('code', courseCode)
          .eq('college', college)
          .single()

        if (!courseError && courseData) {
          const transformedData = transformCollegeCourse(courseData)
          setCourseInfo(transformedData)

          const { data: sectionData, error: sectionError } = await supabase
            .from('college_courses_schedules')
            .select('*, teacher_link')
            .eq('course_code', courseCode)
            .eq('college', college)

          if (sectionError) throw sectionError
          setSections(sortSectionsByTerm(sectionData))
        } else {
          // If not found, try youredu_courses
          const { data: youreduData, error: youreduError } = await supabase
            .from('youredu_courses')
            .select('*')
            .eq('id', courseCode)
            .single()

          if (youreduError) throw youreduError

          const transformedData = transformYourEduCourse(youreduData)
          setCourseInfo(transformedData)
          setSections(transformedData.sections)
        }
      } catch (error) {
        console.error('Error loading course data:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
        console.log('Loading complete')
      }
    }

    loadCourseData()
  }, [college, courseCode])

  const handleBackClick = (e) => {
    if (handleInteraction()) {
      e.preventDefault()
      return
    }
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/course-search/results')
    }
  }

  const handleRegisterClick = async (section, e) => {
    if (handleInteraction()) {
      e.preventDefault()
      return
    }
    try {
      if (!courseInfo || !user) {
        throw new Error('Missing course information or user not logged in')
      }

      // First check if user is already enrolled
      const { data: existingEnrollments, error: enrollCheckError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('uid', user.id)
        .eq('college', courseInfo.college)
        .eq('course_code', courseCode)

      if (enrollCheckError) throw enrollCheckError

      if (existingEnrollments && existingEnrollments.length > 0) {
        toast.warning('You are already enrolled in this course')
        return
      }

      // Then check if course is already in cart
      const { data: existingCartItem, error: cartCheckError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('college', courseInfo.college)
        .eq('course_id', courseCode)
        .eq('crn', section.crn)
        .single()

      if (cartCheckError && cartCheckError.code !== 'PGRST116') throw cartCheckError
      if (existingCartItem) {
        toast.info('This section is already in your cart')
        return
      }

      // Add to cart with CRN
      const { error: addError } = await supabase.from('cart_items').insert({
        user_id: user.id,
        course_id: courseCode,
        college: college,
        course_type: college === 'YourEDU' ? 'youredu' : 'college',
        crn: section.crn,
        price: section.price || 0,
      })

      if (addError) throw addError

      toast.success('Course added to cart')
    } catch (error) {
      console.error('Error during registration:', error)
      toast.error('Failed to add course to cart')
    }
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setSnackbar({
      open: true,
      message: 'Course link copied to clipboard!',
      severity: 'success',
    })
  }

  const handleInteraction = (path) => {
    if (!user) {
      setShowRegistrationPrompt(true)
      return true
    }
    return false
  }

  // Generate tags from sections
  const courseTags = React.useMemo(() => {
    // Transform sections to match expected structure
    const transformedSections = sections.map((section) => ({
      section_locations: section.section_locations,
      section_times: section.section_times,
      price: section.price,
      term: section.term,
      enrolled: section.enrolled,
      maxStudents: section.max_students,
    }))

    return generateCourseTags(transformedSections)
  }, [sections])

  // Create course data for CourseCard
  const courseData = React.useMemo(() => {
    if (!courseInfo) return null
    return {
      ...courseInfo,
      sections: sections.map((section) => ({
        section_locations: section.section_locations,
        section_times: section.section_times,
        price: section.price,
        term: section.term,
        enrolled: section.enrolled,
        maxStudents: section.max_students,
      })),
    }
  }, [courseInfo, sections])

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero Section */}
      <Box sx={cardStyles.section}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--spacing-2)',
            '@media (max-width: 768px)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Button
              onClick={handleBackClick}
              sx={{
                color: 'hsl(var(--brand-primary))',
                p: 'var(--spacing-1) var(--spacing-2)',
                minWidth: 0,
                '&:hover': {
                  backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                },
              }}
            >
              ← Back
            </Button>
            <PublicAuthWrapper>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{
                  color: 'hsl(var(--brand-primary))',
                  borderColor: 'hsl(var(--brand-primary))',
                  '&:hover': {
                    borderColor: 'hsl(var(--brand-primary-dark))',
                    backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                  },
                }}
              >
                Share
              </Button>
            </PublicAuthWrapper>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-2)',
          '@media (max-width: 768px)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}

        {courseInfo && (
          <Box sx={{ mb: 'var(--spacing-4)' }}>
            <PublicAuthWrapper>
              <CourseCard
                key="course-info"
                courseGroup={[courseData.title, [courseData]]}
                expandedCourses={{}}
                toggleCourseExpansion={() => {}}
                handleRegisterClick={() => {}}
                handleInteraction={handleInteraction}
                tags={generateCourseTags(courseData)}
              />
            </PublicAuthWrapper>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {sections && sections.length > 0 ? (
            sections.reduce((acc, section, index) => {
              if (!section) return acc

              const previousSection = sections[index - 1]
              const currentTerm = section.term
              const previousTerm = previousSection?.term

              if (currentTerm !== previousTerm) {
                acc.push(
                  <Typography
                    key={`term-header-${currentTerm}-${index}`}
                    variant="h6"
                    sx={{
                      mt: index > 0 ? 'var(--spacing-6)' : 0,
                      mb: 'var(--spacing-4)',
                      color: 'hsl(var(--text-primary))',
                      fontWeight: 600,
                    }}
                  >
                    {currentTerm || 'Term Not Set'}
                  </Typography>
                )
              }

              acc.push(
                <Box
                  key={`section-${section.crn}-${index}`}
                  sx={{
                    p: 'var(--spacing-4)',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'hsl(var(--background))',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'hsl(var(--brand-primary))',
                      transform: 'translateY(-2px)',
                      boxShadow: 'var(--shadow-md)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Professor:{' '}
                        {section.instructor ? (
                          section.teacher_link ? (
                            <a
                              href={section.teacher_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'hsl(var(--brand-primary))',
                                textDecoration: 'underline',
                                '&:hover': {
                                  opacity: 0.8,
                                },
                              }}
                            >
                              {section.instructor}
                            </a>
                          ) : (
                            section.instructor
                          )
                        ) : (
                          'Not assigned'
                        )}
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Schedule:{' '}
                        {section.section_times?.[0]
                          ? formatSchedule(section.section_times[0]) +
                            ' ' +
                            (section.section_times[1] ? formatTimes(section.section_times[1]) : '')
                          : 'Schedule not set'}
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Location: {section.section_locations?.[0] || 'Location not set'}
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Term: {section.term || 'Term not set'}
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Date: {section.section_dates?.[0] || 'Dates not set'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', alignItems: 'flex-end' }}
                    >
                      <Typography sx={{ color: 'hsl(var(--text-primary))', fontWeight: 600 }}>
                        {section.price === 0.0 ? (
                          'Free'
                        ) : section.discount > 0 ? (
                          <Box
                            component="span"
                            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                          >
                            <Box
                              component="span"
                              sx={{ textDecoration: 'line-through', color: 'hsl(var(--text-secondary))' }}
                            >
                              ${section.price.toFixed(2)}
                            </Box>
                            <Box component="span" sx={{ color: 'hsl(142, 70%, 45%)' }}>
                              ${(section.price - section.discount).toFixed(2)}
                            </Box>
                          </Box>
                        ) : section.price ? (
                          `$${section.price.toFixed(2)}`
                        ) : (
                          'Price not set'
                        )}
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Capacity: {section.max_students || 'Not set'}
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Enrolled: {section.enrolled || 0}
                      </Typography>
                      <Typography sx={{ color: 'hsl(var(--text-primary))' }}>
                        Waitlist: {section.waitlisted || 0}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={(e) => handleRegisterClick(section, e)}
                        disabled={section.enrolled >= section.max_students}
                        sx={{
                          mt: 'var(--spacing-2)',
                          backgroundColor: 'hsl(var(--brand-primary))',
                          color: 'hsl(var(--background))',
                          '&:hover': {
                            backgroundColor: 'hsl(var(--brand-primary-dark))',
                          },
                          '&:disabled': {
                            backgroundColor: 'hsl(var(--muted))',
                          },
                        }}
                      >
                        {section.enrolled >= section.max_students ? 'Full' : 'Add to Cart'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )

              return acc
            }, [])
          ) : (
            <Typography
              key="no-sections"
              sx={{
                mt: 'var(--spacing-4)',
                textAlign: 'center',
                color: 'hsl(var(--text-secondary))',
              }}
            >
              No sections available for this course
            </Typography>
          )}
        </Box>
      </Container>

      <RegistrationPrompt
        open={showRegistrationPrompt}
        onClose={() => setShowRegistrationPrompt(false)}
        targetPath={window.location.pathname}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CoursePage
