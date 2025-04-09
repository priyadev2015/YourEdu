import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { syncUserCalendars } from './MyGoogleCalendar'
import {
  Box,
  Container,
  Button,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { SectionHeader, FeatureHeader, BodyText, SupportingText } from '../components/ui/typography'
import { toast } from 'react-toastify'
import RegistrationModal from '../components/RegistrationModal'
import Logo from '../assets/youredu-2.png'
import { formatSchedule } from '../utils/courseFormatters'
import { generateCollegeTodos } from '../constants/SpecialCourseTodos'

const CourseCheckout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [enrollmentComplete, setEnrollmentComplete] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [formGenerated, setFormGenerated] = useState(false)

  const steps = ['Review Courses', 'Payment', 'Complete']

  useEffect(() => {
    fetchCartItems()
  }, [user])

  const fetchCartItems = async () => {
    try {
      // First get cart items
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('saved_for_later', false)

      if (cartError) throw cartError

      // Then fetch course details and sections for each cart item
      const coursePromises = cartData.map(async (item) => {
        if (item.course_type === 'college') {
          // For college courses, get both course and specific section data
          const [courseResponse, sectionResponse] = await Promise.all([
            supabase
              .from('college_courses')
              .select('*')
              .eq('code', item.course_id)
              .eq('college', item.college)
              .single(),
            supabase
              .from('college_courses_schedules')
              .select('*')
              .eq('course_code', item.course_id)
              .eq('college', item.college)
              .eq('crn', item.crn) // Use the stored CRN to get the correct section
              .single(),
          ])

          if (courseResponse.error) throw courseResponse.error
          if (sectionResponse.error) throw sectionResponse.error

          return {
            ...item,
            course_details: {
              ...courseResponse.data,
              ...sectionResponse.data, // Include all section data including term
              section_times: sectionResponse.data.section_times,
              section_dates: sectionResponse.data.section_dates,
              term: sectionResponse.data.term, // Explicitly including term
              instructor: sectionResponse.data.instructor,
            },
          }
        } else {
          // For YouredU courses
          const { data: youreduData, error: youreduError } = await supabase
            .from('youredu_courses')
            .select('*')
            .eq('id', item.course_id)
            .single()

          if (youreduError) throw youreduError
          return {
            ...item,
            course_details: {
              ...youreduData,
              section_times: [youreduData.days, youreduData.times],
              section_dates: [youreduData.dates],
            },
          }
        }
      })

      const itemsWithDetails = await Promise.all(coursePromises)
      setCartItems(itemsWithDetails)
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setPaymentComplete(true)
    handleEnrollment()
  }

  const handleEnrollment = async () => {
    try {
      // Get selected student from localStorage
      const selectedStudent = JSON.parse(localStorage.getItem('selectedStudent'))
      if (!selectedStudent) {
        throw new Error('No student selected. Please select a student before enrolling in courses.')
      }

      // Add courses to user_courses table with all available fields
      const enrollments = cartItems.map((item) => {
        // Debug logging for each item
        console.log('Processing cart item:', {
          courseId: item.course_id,
          courseDetails: item.course_details,
          sectionTimes: item.course_details.section_times,
          sectionDates: item.course_details.section_dates,
          term: item.course_details.term,
          termDuration: item.course_details.term_duration,
          location: item.course_details.section_locations,
        })

        const enrollment = {
          uid: user.id,
          student_id: selectedStudent.id, // Add student ID
          title: item.course_details.title,
          college: item.college,
          course_code: item.course_id,
          crn: item.crn, // Changed from course_crn to crn
          hs_subject: item.course_details.hs_subject,
          units: item.course_details.units,
          total_hours: item.course_details.total_hours,
          description: item.course_details.description,
          is_college_level: true,
          days: item.course_details.section_times?.[0] || null,
          times: item.course_details.section_times?.[1] || null,
          dates: item.course_details.section_dates?.[0] || null,
          term_start: item.course_details.term || null,
          term_duration: item.course_details.term_duration || null,
          location: item.course_details.section_locations?.[0] || null,
          instruction_method: item.course_details.instruction_method || null,
          teacher: item.course_details.instructor || null,
          materials: item.course_details.materials || null,
          evaluation_method: item.course_details.evaluation_method || null,
          textbooks: item.course_details.textbooks || null,
          registration_status: item.course_type === 'college' ? 'Not registered' : null, // Set initial registration status for college courses
        }

        // Debug log the final enrollment object
        console.log('Generated enrollment object:', enrollment)

        return enrollment
      })

      console.log('Final enrollments array:', enrollments)

      const { data: enrolledCourses, error: enrollError } = await supabase
        .from('user_courses')
        .insert(enrollments)
        .select()

      if (enrollError) throw enrollError

      // Group courses by college to handle special todos
      const coursesByCollege = {}
      enrolledCourses.forEach((course) => {
        if (!coursesByCollege[course.college]) {
          coursesByCollege[course.college] = []
        }
        coursesByCollege[course.college].push(course)
      })

      // Generate and insert special todos for each college
      const allTodos = []

      // Process each college's special todos
      for (const [college, courses] of Object.entries(coursesByCollege)) {
        const courseIds = courses.map((course) => course.id)
        const collegeTodos = generateCollegeTodos(college, user.id, selectedStudent.id, courseIds, courses)

        allTodos.push(...collegeTodos)
      }

      // Insert all todos if there are any
      if (allTodos.length > 0) {
        const { error: todosError } = await supabase.from('user_courses_todos').insert(allTodos)

        if (todosError) throw todosError
      }

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('saved_for_later', false)

      if (clearError) throw clearError

      setEnrollmentComplete(true)
      setShowThankYou(true)

      // Sync calendars in the background
      Promise.all([
        // Sync individual student calendar
        syncUserCalendars({
          userId: user.id,
          userEmail: user.email,
          student: selectedStudent,
        }),
        // Sync "All Students" calendar
        syncUserCalendars({
          userId: user.id,
          userEmail: user.email,
          student: { id: '00000000-0000-0000-0000-000000000000', student_name: 'All Students', isAllStudents: true },
        }),
      ]).catch((syncError) => {
        console.error('Error syncing calendars after enrollment:', syncError)
        toast.warning('Course enrollment successful, but calendar sync failed - please refresh your calendar')
      })
    } catch (error) {
      console.error('Error during enrollment:', error)
      toast.error(error.message || 'Failed to complete enrollment')
    }
  }

  const handleShowRegistrationForm = () => {
    if (cartItems.length > 0) {
      // Get the first course for demo
      const firstCourse = {
        id: cartItems[0].course_id,
        courseTitle: cartItems[0].course_details.title,
        // Add any other required fields the RegistrationModal expects
      }
      setSelectedCourse(firstCourse)
      setShowRegistrationModal(true)
    }
  }

  const handleRegistrationModalClose = () => {
    setShowRegistrationModal(false)
    setFormGenerated(true)
  }

  const ReviewCourseItem = ({ item }) => {
    const formatTimes = (times) => {
      if (!times) return ''
      const timePattern = /(\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)/i
      const match = times.match(timePattern)
      if (match) {
        return `${match[1]} - ${match[2]}`
      }
      return times
    }

    const displayPrice = item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`
    const displayDiscount = item.discount > 0 ? `$${item.discount.toFixed(2)}` : null

    return (
      <Paper
        elevation={0}
        sx={{
          p: 'var(--spacing-4)',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'hsl(var(--card))',
          mb: 3,
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <FeatureHeader>{item.course_details.title}</FeatureHeader>
          </Box>

          {/* Price Display */}
          <Box sx={{ textAlign: 'right' }}>
            <FeatureHeader>{displayPrice}</FeatureHeader>
            {displayDiscount && (
              <SupportingText sx={{ color: 'hsl(var(--success))' }}>Save {displayDiscount}</SupportingText>
            )}
          </Box>
        </Box>

        {/* Course Details Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
            mb: 3,
          }}
        >
          <Box>
            <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Course Info</SupportingText>
            <BodyText sx={{ mb: 0.5 }}>{item.course_id}</BodyText>
            <BodyText>{item.course_details.hs_subject}</BodyText>
          </Box>

          <Box>
            <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Section</SupportingText>
            <BodyText sx={{ mb: 0.5 }}>CRN: {item.crn}</BodyText>
            <BodyText>{item.course_details.term || 'Term not set'}</BodyText>
          </Box>

          <Box>
            <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Schedule</SupportingText>
            <BodyText sx={{ color: 'hsl(var(--brand-primary))', fontWeight: 500 }}>
              {formatSchedule(item.course_details.section_times?.[0])}{' '}
              {formatTimes(item.course_details.section_times?.[1])}
            </BodyText>
            <BodyText>{item.course_details.section_dates?.[0] || 'Dates not set'}</BodyText>
          </Box>
        </Box>

        {/* Bottom Row - College Name */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid hsl(var(--border))',
            pt: 3,
          }}
        >
          <SupportingText sx={{ color: 'hsl(var(--brand-primary))', fontWeight: 500 }}>{item.college}</SupportingText>
        </Box>
      </Paper>
    )
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <SectionHeader sx={{ mb: 4 }}>Review Your Courses</SectionHeader>
            {cartItems.map((item) => (
              <ReviewCourseItem key={item.id} item={item} />
            ))}
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              sx={{
                mt: 2,
                backgroundColor: 'hsl(var(--brand-primary))',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'hsl(var(--brand-primary-dark))',
                },
              }}
            >
              Continue to Payment
            </Button>
          </Box>
        )

      case 1:
        return (
          <Box>
            <SectionHeader sx={{ mb: 4 }}>Payment</SectionHeader>
            <Button
              variant="contained"
              onClick={handlePayment}
              sx={{
                backgroundColor: 'hsl(var(--brand-primary))',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'hsl(var(--brand-primary-dark))',
                },
              }}
            >
              Complete Payment
            </Button>
          </Box>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'hsl(var(--background))',
        pt: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <img
              src={Logo}
              alt="YourEDU Logo"
              style={{
                height: 40,
                marginBottom: '8px',
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'hsl(var(--foreground))',
            }}
          >
            <FeatureHeader>Secure Checkout</FeatureHeader>
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            p: 4,
            mb: 4,
          }}
        >
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 6,
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'hsl(var(--brand-primary))',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: 'hsl(var(--brand-primary))',
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            sx={{
              maxWidth: 800,
              mx: 'auto',
              p: 3,
              backgroundColor: 'hsl(var(--background))',
              borderRadius: 'var(--radius)',
              border: '1px solid hsl(var(--border))',
            }}
          >
            {renderStepContent()}
          </Box>
        </Box>

        <Dialog
          open={showThankYou}
          onClose={() => navigate('/my-courses')}
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-lg)',
              p: 2,
            },
          }}
        >
          <DialogTitle>
            <FeatureHeader>Thank You!</FeatureHeader>
          </DialogTitle>
          <DialogContent>
            <BodyText>Your courses have been successfully added to My Courses.</BodyText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => navigate('/my-courses')}
              variant="contained"
              sx={{
                backgroundColor: 'hsl(var(--brand-primary))',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'hsl(var(--brand-primary-dark))',
                },
              }}
            >
              View My Courses
            </Button>
          </DialogActions>
        </Dialog>

        {showRegistrationModal && selectedCourse && (
          <RegistrationModal course={selectedCourse} onClose={handleRegistrationModalClose} />
        )}
      </Container>
    </Box>
  )
}

export default CourseCheckout
