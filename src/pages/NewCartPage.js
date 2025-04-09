import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { ShoppingCart as CartIcon, ArrowBack as BackIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { PageHeader, SectionHeader, FeatureHeader, DescriptiveText, BodyText } from '../components/ui/typography'
import NewSchedule from '../components/NewSchedule'
import { cardStyles } from '../styles/theme/components/cards'
import CartItem from '../components/CartItem'

const CartPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
  const [savedExpanded, setSavedExpanded] = useState(true)

  // New consolidated state setup
  const [cartItems, setCartItems] = useState([])
  const [savedItems, setSavedItems] = useState([])
  const [courseDetails, setCourseDetails] = useState({})
  const [courseSections, setCourseSections] = useState({})
  const [selectedSections, setSelectedSections] = useState({})
  const [scheduleData, setScheduleData] = useState([])

  // New state for user courses and youredu courses
  const [userCourses, setUserCourses] = useState([])
  const [youreduCourses, setYoureduCourses] = useState([])

  // Add price calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0)
  const savings = cartItems.reduce((sum, item) => sum + (item.discount || 0), 0)
  const total = subtotal - savings

  // Add these near the top of the CartPage component, with other constants
  const dayMap = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday',
    S: 'Saturday',
    U: 'Sunday',
  }

  const shortDayMap = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
  }

  // Add these helper functions
  const generateColorForCourse = (courseCode) => {
    const colors = [
      '#4299E1', // blue
      '#48BB78', // green
      '#ED8936', // orange
      '#9F7AEA', // purple
      '#F56565', // red
      '#38B2AC', // teal
      '#ED64A6', // pink
    ]

    const hash = courseCode.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const parseDateRange = (dateString, year) => {
    if (!dateString || !year) {
      console.warn('Missing date string or year, using default dates')
      return {
        startDate: new Date(`${year || 2024}-01-08`),
        endDate: new Date(`${year || 2024}-05-03`),
      }
    }

    try {
      const dateStr = Array.isArray(dateString) ? dateString[0] : dateString
      const [start, end] = dateStr.split('-')
      const [startMonth, startDay] = start.split('/').map(Number)
      const [endMonth, endDay] = end.split('/').map(Number)

      const startDate = new Date(year, startMonth - 1, startDay)
      const endDate = new Date(year, endMonth - 1, endDay)

      return { startDate, endDate }
    } catch (error) {
      console.error('Error parsing date range:', error)
      return {
        startDate: new Date(`${year || 2024}-01-08`),
        endDate: new Date(`${year || 2024}-05-03`),
      }
    }
  }

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

  // Add these with the other helper functions
  const parseDaysString = (daysString) => {
    if (!daysString || daysString === 'Asynchronous') {
      return []
    }

    const dayArray = daysString
      .split('')
      .map((char) => char.trim())
      .filter(Boolean)

    const parsedDays = dayArray
      .map((day) => dayMap[day])
      .filter(Boolean)
      .map((day) => shortDayMap[day] || day)

    return parsedDays
  }

  const parseTimeString = (timeString) => {
    if (!timeString) return { startTime: '00:00', endTime: '00:00' }

    const timePattern = /(\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)/i
    const match = timeString.match(timePattern)

    if (!match) return { startTime: '00:00', endTime: '00:00' }

    const convert12to24 = (time12h) => {
      const [time, modifier] = time12h.toLowerCase().split(/([ap]m)/)
      let [hours, minutes] = time.split(':')

      hours = parseInt(hours, 10)
      if (hours === 12) hours = 0
      if (modifier === 'pm') hours += 12

      return `${hours.toString().padStart(2, '0')}:${minutes}`
    }

    return {
      startTime: convert12to24(match[1]),
      endTime: convert12to24(match[2]),
    }
  }

  // Add these data fetching functions
  const fetchCartItems = async (userId) => {
    const [activeItems, savedItems] = await Promise.all([
      supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('saved_for_later', false)
        .order('added_at', { ascending: true }),
      supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('saved_for_later', true)
        .order('added_at', { ascending: true }),
    ])

    if (activeItems.error) throw activeItems.error
    if (savedItems.error) throw savedItems.error

    return {
      active: activeItems.data || [],
      saved: savedItems.data || [],
    }
  }

  // New function to fetch user courses
  const fetchUserCourses = async (userId) => {
    const { data, error } = await supabase.from('user_courses').select('*').eq('uid', userId)

    if (error) throw error
    return data || []
  }

  // New function to fetch youredu courses
  const fetchYoureduCourses = async (userId) => {
    const { data, error } = await supabase.from('youredu_courses').select('*').contains('students', [userId])

    if (error) throw error
    return data || []
  }

  const fetchCourseDetails = async (item) => {
    const table = item.course_type === 'youredu' ? 'youredu_courses' : 'college_courses'
    const query =
      item.course_type === 'youredu' ? { id: item.course_id } : { code: item.course_id, college: item.college }

    const { data, error } = await supabase.from(table).select('*').match(query).single()

    if (error) throw error
    return data
  }

  const fetchCourseSections = async (item) => {
    if (item.course_type === 'youredu') return []

    const { data, error } = await supabase
      .from('college_courses_schedules')
      .select('*')
      .eq('course_code', item.course_id)
      .eq('college', item.college)

    if (error) throw error
    return data
  }

  // Add cart action handlers
  const handleRemoveItem = async (itemId) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId)

      if (error) throw error

      setCartItems(cartItems.filter((item) => item.id !== itemId))
      setSavedItems(savedItems.filter((item) => item.id !== itemId))
      toast.success('Item removed')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  const handleSaveForLater = async (itemId) => {
    try {
      const { error } = await supabase.from('cart_items').update({ saved_for_later: true }).eq('id', itemId)

      if (error) throw error

      const itemToMove = cartItems.find((item) => item.id === itemId)
      setCartItems(cartItems.filter((item) => item.id !== itemId))
      setSavedItems([...savedItems, { ...itemToMove, saved_for_later: true }])
      toast.success('Item saved for later')
    } catch (error) {
      console.error('Error saving item for later:', error)
      toast.error('Failed to save item')
    }
  }

  const handleMoveToCart = async (itemId) => {
    try {
      const { error } = await supabase.from('cart_items').update({ saved_for_later: false }).eq('id', itemId)

      if (error) throw error

      const itemToMove = savedItems.find((item) => item.id === itemId)
      setSavedItems(savedItems.filter((item) => item.id !== itemId))
      setCartItems([...cartItems, { ...itemToMove, saved_for_later: false }])
      toast.success('Item moved to cart')
    } catch (error) {
      console.error('Error moving item to cart:', error)
      toast.error('Failed to move item')
    }
  }

  const handleClearCart = async () => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).eq('saved_for_later', false)

      if (error) throw error

      setCartItems([])
      setClearDialogOpen(false)
      toast.success('Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  // Add formatSectionsForSchedule function
  const formatSectionsForSchedule = (sections) => {
    console.log(
      '🔄 Formatting sections:',
      sections.map((s) => ({
        code: s.course_code,
        times: s.section_times,
      }))
    )

    const formatted = sections
      .filter((section) => {
        if (!section) {
          console.log('⚠️ Null section encountered')
          return false
        }
        return true
      })
      .map((section) => {
        try {
          const days = section.section_times?.[0]
            ? parseDaysString(section.section_times[0])
            : parseDaysString(section.days)

          console.log('📆 Parsed days for', section.course_code, ':', days)

          const times = section.section_times?.[1]
            ? parseTimeString(section.section_times[1])
            : {
                startTime: section.startTime || '09:00',
                endTime: section.endTime || '10:00',
              }

          console.log('⏰ Parsed times for', section.course_code, ':', times)

          const { startDate, endDate } = parseDateRange(
            section.section_dates?.[0] || section.dates,
            section.year || new Date().getFullYear()
          )

          // Generate all occurrences between start and end date
          const allEvents = []
          let currentDate = new Date(startDate)

          while (currentDate <= endDate) {
            days.forEach((day) => {
              const dayNumber = getDayNumber(day)
              const currentDayNumber = currentDate.getDay()

              // If this is the right day of the week
              if (currentDayNumber === dayNumber) {
                allEvents.push({
                  id: `${section.course_code}_${day}_${currentDate.toISOString()}`,
                  calendarId: 'courses',
                  title: section.course_name || section.title,
                  body: section.location || 'TBA',
                  start: `${currentDate.toISOString().split('T')[0]}T${times.startTime}`,
                  end: `${currentDate.toISOString().split('T')[0]}T${times.endTime}`,
                  category: 'time',
                  isReadOnly: true,
                  backgroundColor: generateColorForCourse(section.course_code),
                  borderColor: generateColorForCourse(section.course_code),
                  state: 'busy',
                  raw: {
                    class: section.course_code,
                    location: section.location || 'TBA',
                    professor: section.instructor || 'TBA',
                  },
                })
              }
            })

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)
          }

          return allEvents
        } catch (error) {
          console.error('❌ Error processing section:', section.course_code, error)
          return null
        }
      })
      .filter(Boolean)
      .flat()

    console.log('✅ Final event count:', formatted.length)
    return formatted
  }

  // New function to format user and youredu courses for the schedule
  const formatUserCoursesForSchedule = (courses) => {
    return courses
      .filter((course) => course && course.days)
      .map((course) => {
        try {
          const days = parseDaysString(course.days)

          const times = course.times ? parseTimeString(course.times) : { startTime: '09:00', endTime: '10:00' }

          const { startDate, endDate } = parseDateRange(course.dates, course.year || new Date().getFullYear())

          // Generate all occurrences between start and end date
          const allEvents = []
          let currentDate = new Date(startDate)

          while (currentDate <= endDate) {
            days.forEach((day) => {
              const dayNumber = getDayNumber(day)
              const currentDayNumber = currentDate.getDay()

              // If this is the right day of the week
              if (currentDayNumber === dayNumber) {
                allEvents.push({
                  id: `${course.id}_${day}_${currentDate.toISOString()}`,
                  calendarId: 'enrolled-courses',
                  title: course.title || 'Unnamed Course',
                  body: course.location || 'TBA',
                  start: `${currentDate.toISOString().split('T')[0]}T${times.startTime}`,
                  end: `${currentDate.toISOString().split('T')[0]}T${times.endTime}`,
                  category: 'time',
                  isReadOnly: true,
                  backgroundColor: '#94A3B8', // Changed from purple to gray
                  borderColor: '#94A3B8', // Changed from purple to gray
                  state: 'busy',
                  raw: {
                    class: course.course_code || course.id,
                    location: course.location || 'TBA',
                    professor: course.teacher_name || 'TBA',
                    isEnrolled: true,
                  },
                })
              }
            })

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)
          }

          return allEvents
        } catch (error) {
          console.error('❌ Error processing course:', course.id, error)
          return null
        }
      })
      .filter(Boolean)
      .flat()
  }

  // Main data loading effect - updated to fetch user courses and youredu courses
  useEffect(() => {
    if (!user) return

    const loadCartData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Loading cart data...')

        // Fetch cart items, user courses, and youredu courses in parallel
        const [cartItemsResult, userCoursesData, youreduCoursesData] = await Promise.all([
          fetchCartItems(user.id),
          fetchUserCourses(user.id),
          fetchYoureduCourses(user.id),
        ])

        const { active, saved } = cartItemsResult
        console.log(
          '🛒 Fetched cart items:',
          active.map((i) => i.course_id)
        )
        console.log('📚 Fetched user courses:', userCoursesData.length)
        console.log('🎓 Fetched youredu courses:', youreduCoursesData.length)

        setCartItems(active)
        setSavedItems(saved)
        setUserCourses(userCoursesData)
        setYoureduCourses(youreduCoursesData)

        const coursePromises = active.map((item) => {
          return Promise.all([fetchCourseDetails(item), fetchCourseSections(item)])
        })

        const courseResults = await Promise.all(coursePromises)
        console.log(
          '📚 Fetched course details for:',
          active.map((i) => i.course_id)
        )

        // Process and set course details
        const newCourseDetails = {}
        const newCourseSections = {}
        const newSelectedSections = {}

        courseResults.forEach(([details, sections], index) => {
          const cartItem = active[index]
          newCourseDetails[cartItem.course_id] = details
          newCourseSections[cartItem.course_id] = sections
          if (cartItem.crn) {
            newSelectedSections[cartItem.course_id] = cartItem.crn
          }
        })

        console.log('📋 Setting course data:', {
          courseIds: Object.keys(newCourseDetails),
          selectedCRNs: Object.entries(newSelectedSections).map(([id, crn]) => `${id}: ${crn}`),
        })

        setCourseDetails(newCourseDetails)
        setCourseSections(newCourseSections)
        setSelectedSections(newSelectedSections)
      } catch (error) {
        console.error('❌ Error loading cart data:', error)
        toast.error('Failed to load cart data')
      } finally {
        setLoading(false)
      }
    }

    loadCartData()
  }, [user])

  // Schedule data generation effect - updated to include user courses
  useEffect(() => {
    console.log('🔄 Schedule effect triggered:', {
      hasCartItems: cartItems.length > 0,
      courseCount: Object.keys(courseDetails).length,
      selectedCount: Object.keys(selectedSections).length,
      userCoursesCount: userCourses.length,
      youreduCoursesCount: youreduCourses.length,
    })

    // Process cart items if available
    let cartEvents = []
    if (cartItems.length > 0 && Object.keys(courseDetails).length > 0 && Object.keys(selectedSections).length > 0) {
      const selectedSectionData = cartItems
        .map((item) => {
          const sections = courseSections[item.course_id] || []
          const selectedSection = selectedSections[item.course_id]
          const details = courseDetails[item.course_id]

          if (!selectedSection || !details) {
            console.log('❌ Missing section/details for:', item.course_id)
            return null
          }

          const matchingSection = sections.find((section) => section.crn === selectedSection)
          if (!matchingSection) {
            console.log('❌ No matching section found:', { courseId: item.course_id, crn: selectedSection })
            return null
          }

          return {
            ...matchingSection,
            course_code: item.course_id,
            course_name: details.title,
          }
        })
        .filter(Boolean)

      console.log(
        '📚 Selected section data:',
        selectedSectionData.map((s) => ({
          code: s.course_code,
          crn: s.crn,
          times: s.section_times,
        }))
      )

      cartEvents = formatSectionsForSchedule(selectedSectionData)
    }

    // Format user and youredu courses
    const userCourseEvents = formatUserCoursesForSchedule(userCourses)
    const youreduCourseEvents = formatUserCoursesForSchedule(youreduCourses)

    // Combine all events
    const allEvents = [...cartEvents, ...userCourseEvents, ...youreduCourseEvents]

    console.log('📅 Generated events:', {
      cartEvents: cartEvents.length,
      userCourseEvents: userCourseEvents.length,
      youreduCourseEvents: youreduCourseEvents.length,
      total: allEvents.length,
    })

    setScheduleData(allEvents)
  }, [cartItems, courseDetails, courseSections, selectedSections, userCourses, youreduCourses])

  // Update section selection handler
  const handleSectionSelect = async (item, crn) => {
    try {
      const { error } = await supabase.from('cart_items').update({ crn: crn }).eq('id', item.id)

      if (error) throw error

      setSelectedSections((prev) => ({
        ...prev,
        [item.course_id]: crn,
      }))

      setCartItems((prev) => prev.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, crn } : cartItem)))
    } catch (error) {
      console.error('Error updating section:', error)
      toast.error('Failed to update section')
    }
  }

  // Update the CartItem component props
  const handleCourseDataUpdate = (courseId, sections, details) => {
    // This function is no longer needed with the new data flow
    // Remove its usage from CartItem component
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero Section */}
      <Box sx={cardStyles.section}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--container-padding-y)',
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 2,
              color: 'hsl(var(--foreground))',
              '&:hover': {
                backgroundColor: 'hsl(var(--accent))',
              },
            }}
          >
            Back
          </Button>
          <PageHeader>Shopping Cart</PageHeader>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-6)',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
          display: 'flex',
          gap: 'var(--spacing-6)',
        }}
      >
        {/* Cart Items */}
        <Box sx={{ width: '55%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : cartItems.length === 0 && savedItems.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 'var(--spacing-6)',
                textAlign: 'center',
                backgroundColor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <FeatureHeader sx={{ mb: 2 }}>Your cart is empty</FeatureHeader>
              <DescriptiveText sx={{ mb: 4 }}>Add courses to your cart to get started with enrollment</DescriptiveText>
              <Button
                variant="contained"
                onClick={() => navigate('/course-search')}
                sx={{
                  backgroundColor: 'hsl(var(--brand-primary))',
                  color: 'hsl(var(--background))',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--brand-primary-dark))',
                  },
                }}
              >
                Browse Courses
              </Button>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Active Cart Items */}
              {cartItems.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onSaveForLater={handleSaveForLater}
                      onMoveToCart={handleMoveToCart}
                      selectedSection={selectedSections[item.course_id]}
                      onSectionSelect={(crn) => handleSectionSelect(item, crn)}
                      onCourseDataUpdate={(sections, details) =>
                        handleCourseDataUpdate(item.course_id, sections, details)
                      }
                    />
                  ))}
                </Box>
              )}

              {/* Saved Items Section */}
              {savedItems.length > 0 && (
                <Accordion
                  expanded={savedExpanded}
                  onChange={() => setSavedExpanded(!savedExpanded)}
                  elevation={0}
                  sx={{
                    backgroundColor: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: 'hsl(var(--muted))',
                      borderBottom: savedExpanded ? '1px solid hsl(var(--border))' : 'none',
                      '&:hover': { backgroundColor: 'hsl(var(--muted))' },
                      py: 'var(--spacing-4)',
                      px: 'var(--spacing-6)',
                    }}
                  >
                    <SectionHeader>Saved for Later ({savedItems.length})</SectionHeader>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 'var(--spacing-4)', backgroundColor: 'hsl(var(--background))' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                      {savedItems.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveItem}
                          onMoveToCart={handleMoveToCart}
                          selectedSection={selectedSections[item.course_id]}
                          onSectionSelect={(crn) => handleSectionSelect(item, crn)}
                          onCourseDataUpdate={(sections, details) =>
                            handleCourseDataUpdate(item.course_id, sections, details)
                          }
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </Box>

        {/* Right Column - Checkout and Schedule */}
        <Box sx={{ width: '45%' }}>
          {cartItems.length > 0 && (
            <Box sx={{ position: 'sticky', top: 'var(--spacing-4)' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius-lg)',
                  mb: 2,
                }}
              >
                <FeatureHeader sx={{ mb: 2 }}>Order Summary</FeatureHeader>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <BodyText>Subtotal</BodyText>
                    <BodyText>${subtotal.toFixed(2)}</BodyText>
                  </Box>
                  {savings > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <BodyText sx={{ color: 'hsl(var(--success))' }}>YourEDU Discount</BodyText>
                      <BodyText sx={{ color: 'hsl(var(--success))' }}>-${savings.toFixed(2)}</BodyText>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid hsl(var(--border))',
                      pt: 2,
                      mt: 1,
                    }}
                  >
                    <FeatureHeader>Total</FeatureHeader>
                    <FeatureHeader>${total.toFixed(2)}</FeatureHeader>
                  </Box>
                </Box>
              </Paper>

              {/* Schedule Preview */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius-lg)',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <FeatureHeader
                    sx={{
                      fontSize: '1.1rem',
                    }}
                  >
                    Schedule Preview
                  </FeatureHeader>

                  {/* Course type legend */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#4299E1', borderRadius: '50%' }} />
                      <BodyText>Cart Courses</BodyText>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#94A3B8', borderRadius: '50%' }} />
                      <BodyText>Enrolled Courses</BodyText>
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    height: '500px',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                  }}
                >
                  <NewSchedule
                    scheduleData={scheduleData}
                    readOnly={true}
                    startHour={8}
                    endHour={20}
                    previewMode={true}
                    viewMode="week"
                    showControls={true}
                    showExport={false}
                    showViewSwitch={false}
                    useDetailPopup={true}
                    isPreProcessed={true}
                    calendars={[
                      {
                        id: 'courses',
                        name: 'Cart Courses',
                        backgroundColor: '#4299E1',
                        borderColor: '#4299E1',
                      },
                      {
                        id: 'enrolled-courses',
                        name: 'Enrolled Courses',
                        backgroundColor: '#94A3B8', // Changed from purple to gray
                        borderColor: '#94A3B8', // Changed from purple to gray
                      },
                    ]}
                  />
                </Box>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<CartIcon />}
                  onClick={handleCheckout}
                  sx={{
                    backgroundColor: 'hsl(var(--brand-primary))',
                    color: 'hsl(var(--background))',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--brand-primary-dark))',
                    },
                  }}
                >
                  Checkout
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setClearDialogOpen(true)}
                  sx={{
                    borderColor: 'hsl(var(--destructive))',
                    color: 'hsl(var(--destructive))',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--destructive) / 0.1)',
                      borderColor: 'hsl(var(--destructive))',
                    },
                  }}
                >
                  Clear Cart
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      {/* Clear Cart Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 'var(--radius-lg)',
          },
        }}
      >
        <DialogTitle>
          <FeatureHeader>Clear Cart</FeatureHeader>
        </DialogTitle>
        <DialogContent>
          <BodyText>Are you sure you want to remove all items from your cart?</BodyText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setClearDialogOpen(false)} sx={{ color: 'hsl(var(--text-primary))' }}>
            Cancel
          </Button>
          <Button
            onClick={handleClearCart}
            sx={{
              backgroundColor: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))',
              '&:hover': {
                backgroundColor: 'hsl(var(--destructive))',
                opacity: 0.9,
              },
            }}
          >
            Clear Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 'var(--radius-lg)',
          },
        }}
      >
        <DialogTitle>
          <FeatureHeader>Checkout</FeatureHeader>
        </DialogTitle>
        <DialogContent>
          <BodyText>
            {total === 0
              ? "You're about to enroll in these courses for free!"
              : `You're about to purchase these courses for $${total.toFixed(2)}`}
          </BodyText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCheckoutDialogOpen(false)} sx={{ color: 'hsl(var(--text-primary))' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'hsl(var(--brand-primary))',
              color: 'hsl(var(--background))',
              '&:hover': {
                backgroundColor: 'hsl(var(--brand-primary-dark))',
              },
            }}
          >
            {total === 0 ? 'Enroll Now' : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CartPage
