// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../utils/AuthContext'
// import { supabase } from '../utils/supabaseClient'
// import {
//   Box,
//   Container,
//   Button,
//   CircularProgress,
//   Paper,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Popover,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
// } from '@mui/material'
// import {
//   ShoppingCart as CartIcon,
//   ArrowBack as BackIcon,
//   Info as InfoIcon,
//   ExpandMore as ExpandMoreIcon,
// } from '@mui/icons-material'
// import { toast } from 'react-toastify'
// import {
//   PageHeader,
//   SectionHeader,
//   FeatureHeader,
//   DescriptiveText,
//   BodyText,
//   SupportingText,
// } from '../components/ui/typography'
// import WeeklySchedule from '../components/WeeklySchedule'
// import SierraCollege from '../assets/College Logos/Sierra College.png'
// import Polygence from '../assets/polygence.png'
// import { cardStyles } from '../styles/theme/components/cards'

// const CartItem = ({
//   item,
//   onRemove,
//   onSaveForLater,
//   onMoveToCart,
//   selectedSection,
//   onSectionSelect,
//   onCourseDataUpdate,
// }) => {
//   const [courseDetails, setCourseDetails] = useState(null)
//   const [sections, setSections] = useState([])
//   const [loading, setLoading] = useState(true)
//   const navigate = useNavigate()
//   const [sectionAnchorEl, setSectionAnchorEl] = useState(null)
//   const openSectionSelect = Boolean(sectionAnchorEl)

//   useEffect(() => {
//     const fetchCourseDetails = async () => {
//       try {
//         let courseData
//         if (item.course_type === 'youredu') {
//           const { data, error } = await supabase.from('youredu_courses').select('*').eq('id', item.course_id).single()
//           if (error) throw error
//           courseData = data
//         } else {
//           // Fetch both course details and available sections
//           const [courseResponse, sectionsResponse] = await Promise.all([
//             supabase
//               .from('college_courses')
//               .select('*')
//               .eq('code', item.course_id)
//               .eq('college', item.college)
//               .single(),
//             supabase
//               .from('college_courses_schedules')
//               .select('*')
//               .eq('course_code', item.course_id)
//               .eq('college', item.college),
//           ])

//           if (courseResponse.error) throw courseResponse.error
//           if (sectionsResponse.error) throw sectionsResponse.error

//           courseData = {
//             ...courseResponse.data,
//             // If there's a selected section, include its term
//             term: sectionsResponse.data.find((s) => s.crn === item.crn)?.term,
//           }
//           setSections(sectionsResponse.data)

//           // Notify parent of data updates
//           onCourseDataUpdate(sectionsResponse.data, courseData)

//           // If there's a crn in the cart item, select that section by default
//           if (item.crn && !selectedSection) {
//             onSectionSelect(item.crn)
//           }
//         }
//         setCourseDetails(courseData)
//       } catch (error) {
//         console.error('Error fetching course details:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchCourseDetails()
//   }, [item])

//   const formatSchedule = (schedule) => {
//     if (!schedule || schedule === 'Asynchronous') return schedule

//     const dayMap = {
//       M: 'Monday',
//       T: 'Tuesday',
//       W: 'Wednesday',
//       R: 'Thursday',
//       F: 'Friday',
//       S: 'Saturday',
//       U: 'Sunday',
//     }

//     return schedule
//       .trim()
//       .split(/\s+/)
//       .filter((day) => day)
//       .map((day) => dayMap[day] || day)
//       .join(', ')
//   }

//   const formatTimes = (times) => {
//     if (!times) return ''
//     const timePattern = /(\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)/i
//     const match = times.match(timePattern)
//     if (match) {
//       return `${match[1]} - ${match[2]}`
//     }
//     return times
//   }

//   const formatDates = (dates) => {
//     if (!dates) return 'Dates not set'
//     return dates
//   }

//   const handleViewDetails = (e) => {
//     e.stopPropagation() // Prevent double-click from triggering twice
//     navigate(`/course-detail/${item.college}/${item.course_id}`)
//   }

//   const handleOpenSectionSelect = (event) => {
//     event.stopPropagation()
//     setSectionAnchorEl(event.currentTarget)
//   }

//   const handleCloseSectionSelect = () => {
//     setSectionAnchorEl(null)
//   }

//   if (loading) return <CircularProgress size={20} />
//   if (!courseDetails) return null

//   const displayPrice = item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`
//   const displayDiscount = item.discount > 0 ? `$${item.discount.toFixed(2)}` : null

//   return (
//     <Paper
//       elevation={0}
//       onDoubleClick={handleViewDetails}
//       sx={{
//         p: 'var(--spacing-4)',
//         border: '1px solid hsl(var(--border))',
//         borderRadius: 'var(--radius-lg)',
//         backgroundColor: 'hsl(var(--card))',
//         transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//         cursor: 'pointer',
//         '&:hover': {
//           transform: 'translateY(-2px)',
//           boxShadow: 'var(--shadow-md)',
//         },
//       }}
//     >
//       {/* Header Section */}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
//         <Box sx={{ flex: 1 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <FeatureHeader style={{ marginBottom: 0 }}>{courseDetails.title}</FeatureHeader>
//             <IconButton
//               onClick={handleViewDetails}
//               size="small"
//               sx={{
//                 color: 'hsl(var(--muted-foreground))',
//                 '&:hover': { backgroundColor: 'hsl(var(--accent))' },
//                 height: 'fit-content',
//               }}
//             >
//               <InfoIcon fontSize="small" />
//             </IconButton>
//           </Box>
//         </Box>

//         {/* Price Display */}
//         <Box sx={{ textAlign: 'right' }}>
//           {item.price > 0 ? (
//             <>
//               <Box
//                 component="span"
//                 sx={{
//                   textDecoration: 'line-through',
//                   color: 'black',
//                   fontSize: '1rem',
//                   display: 'block',
//                   fontWeight: 500,
//                   mb: 0.5,
//                 }}
//               >
//                 ${item.price.toFixed(2)}
//               </Box>
//               <Box
//                 component="span"
//                 sx={{
//                   color: '#22c55e',
//                   fontSize: '1rem',
//                   display: 'block',
//                   fontWeight: 500,
//                 }}
//               >
//                 ${(item.price * 0.9).toFixed(2)}
//               </Box>
//             </>
//           ) : (
//             <FeatureHeader>Free</FeatureHeader>
//           )}
//           {displayDiscount && (
//             <SupportingText sx={{ color: 'hsl(var(--success))' }}>Save {displayDiscount}</SupportingText>
//           )}
//         </Box>
//       </Box>

//       {/* Course Details Grid */}
//       <Box
//         sx={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(3, 1fr)',
//           gap: 3,
//           mb: 3,
//         }}
//       >
//         <Box>
//           <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Course Info</SupportingText>
//           <BodyText sx={{ mb: 0.5 }}>{item.course_id}</BodyText>
//           <BodyText>{courseDetails.hs_subject}</BodyText>
//         </Box>

//         <Box>
//           <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Section</SupportingText>
//           <BodyText sx={{ mb: 0.5 }}>CRN: {item.crn}</BodyText>
//           <BodyText>{courseDetails.term || 'Term not set'}</BodyText>
//         </Box>

//         {selectedSection && (
//           <Box>
//             <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Schedule</SupportingText>
//             <BodyText
//               sx={{
//                 color: 'hsl(var(--brand-primary))',
//                 fontWeight: 500,
//               }}
//             >
//               {sections
//                 .filter((section) => section.crn === selectedSection)
//                 .map((section) => (
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                     <span>
//                       {formatSchedule(section.section_times?.[0])} {formatTimes(section.section_times?.[1])}
//                     </span>
//                     <span>{section.section_dates?.[0] || 'Dates not set'}</span>
//                   </Box>
//                 ))}
//             </BodyText>
//           </Box>
//         )}
//       </Box>

//       {/* Bottom Row - College Name and Action Buttons */}
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           borderTop: '1px solid hsl(var(--border))',
//           pt: 3,
//         }}
//       >
//         {/* Institution Logo/Name */}
//         {item.college === 'Sierra College' || item.college === 'Polygence' ? (
//           <Box
//             sx={{
//               cursor: 'pointer',
//               transition: 'transform 0.2s ease',
//               '&:hover': {
//                 transform: 'scale(1.05)',
//               },
//             }}
//             onClick={(e) => {
//               e.stopPropagation()
//               navigate(`/provider/${item.college.toLowerCase().replace(' ', '-')}`)
//             }}
//           >
//             <img
//               src={item.college === 'Sierra College' ? SierraCollege : Polygence}
//               alt={`${item.college} Logo`}
//               style={{ width: '100px', height: 'auto' }}
//             />
//           </Box>
//         ) : (
//           <SupportingText
//             sx={{
//               color: 'hsl(var(--brand-primary))',
//               fontWeight: 500,
//             }}
//           >
//             {item.college}
//           </SupportingText>
//         )}

//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <Button
//             size="small"
//             onClick={(e) => {
//               e.stopPropagation()
//               onRemove(item.id)
//             }}
//             sx={{
//               color: 'hsl(var(--destructive))',
//               '&:hover': {
//                 backgroundColor: 'hsl(var(--destructive) / 0.1)',
//               },
//             }}
//           >
//             Remove
//           </Button>

//           <Button
//             size="small"
//             onClick={handleOpenSectionSelect}
//             sx={{
//               color: 'hsl(var(--brand-primary))',
//               '&:hover': {
//                 backgroundColor: 'hsl(var(--brand-primary-light))',
//               },
//             }}
//           >
//             Change Section
//           </Button>

//           <Button
//             size="small"
//             onClick={(e) => {
//               e.stopPropagation()
//               if (item.saved_for_later) {
//                 onMoveToCart(item.id)
//               } else {
//                 onSaveForLater(item.id)
//               }
//             }}
//             sx={{
//               color: 'hsl(var(--brand-primary))',
//               '&:hover': {
//                 backgroundColor: 'hsl(var(--brand-primary-light))',
//               },
//             }}
//           >
//             {item.saved_for_later ? 'Move to Cart' : 'Save for Later'}
//           </Button>
//         </Box>
//       </Box>

//       <Popover
//         open={openSectionSelect}
//         anchorEl={sectionAnchorEl}
//         onClose={handleCloseSectionSelect}
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'left',
//         }}
//         transformOrigin={{
//           vertical: 'top',
//           horizontal: 'left',
//         }}
//         sx={{
//           '& .MuiPopover-paper': {
//             width: '400px',
//             p: 2,
//             border: '1px solid hsl(var(--border))',
//             borderRadius: 'var(--radius)',
//           },
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <FeatureHeader sx={{ mb: 2 }}>Available Sections</FeatureHeader>
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//           {sections.map((section) => (
//             <Paper
//               key={section.crn}
//               elevation={0}
//               onClick={() => {
//                 onSectionSelect(section.crn)
//                 handleCloseSectionSelect()
//               }}
//               sx={{
//                 p: 2,
//                 cursor: 'pointer',
//                 border: '1px solid',
//                 borderColor: selectedSection === section.crn ? 'hsl(var(--brand-primary))' : 'hsl(var(--border))',
//                 borderRadius: 'var(--radius)',
//                 backgroundColor:
//                   selectedSection === section.crn ? 'hsl(var(--brand-primary-light))' : 'hsl(var(--card))',
//                 '&:hover': {
//                   borderColor: 'hsl(var(--brand-primary))',
//                   backgroundColor:
//                     selectedSection === section.crn ? 'hsl(var(--brand-primary-light))' : 'hsl(var(--accent))',
//                 },
//               }}
//             >
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//                 <BodyText sx={{ fontWeight: 500 }}>CRN: {section.crn}</BodyText>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   {selectedSection === section.crn && (
//                     <SupportingText sx={{ color: 'hsl(var(--brand-primary))' }}>Selected</SupportingText>
//                   )}
//                 </Box>
//               </Box>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <SupportingText>
//                   {formatSchedule(section.section_times?.[0])} {formatTimes(section.section_times?.[1])}
//                 </SupportingText>
//                 <SupportingText>{section.section_dates?.[0] || 'Dates not set'}</SupportingText>
//               </Box>
//             </Paper>
//           ))}
//         </Box>
//       </Popover>
//     </Paper>
//   )
// }

// const CartPage = () => {
//   const navigate = useNavigate()
//   const { user } = useAuth()
//   const [cartItems, setCartItems] = useState([])
//   const [savedItems, setSavedItems] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [clearDialogOpen, setClearDialogOpen] = useState(false)
//   const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
//   const [savedExpanded, setSavedExpanded] = useState(true)
//   const [scheduleData, setScheduleData] = useState({})
//   const [selectedSections, setSelectedSections] = useState({})
//   const [allSections, setAllSections] = useState({})
//   const [courseDetails, setCourseDetails] = useState({})
//   const [currentWeek, setCurrentWeek] = useState(1)

//   const fetchCartItems = async () => {
//     try {
//       setLoading(true)
//       const [activeItems, savedItems] = await Promise.all([
//         supabase
//           .from('cart_items')
//           .select('*')
//           .eq('user_id', user.id)
//           .eq('saved_for_later', false)
//           .order('added_at', { ascending: true }),
//         supabase
//           .from('cart_items')
//           .select('*')
//           .eq('user_id', user.id)
//           .eq('saved_for_later', true)
//           .order('added_at', { ascending: true }),
//       ])

//       if (activeItems.error) throw activeItems.error
//       if (savedItems.error) throw savedItems.error

//       setCartItems(activeItems.data || [])
//       setSavedItems(savedItems.data || [])
//     } catch (error) {
//       console.error('Error fetching cart:', error)
//       toast.error('Failed to load cart items')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchCartItems()
//   }, [user])

//   const handleSaveForLater = async (itemId) => {
//     try {
//       const { error } = await supabase.from('cart_items').update({ saved_for_later: true }).eq('id', itemId)

//       if (error) throw error

//       const itemToMove = cartItems.find((item) => item.id === itemId)
//       setCartItems(cartItems.filter((item) => item.id !== itemId))
//       setSavedItems([...savedItems, { ...itemToMove, saved_for_later: true }])
//       toast.success('Item saved for later')
//     } catch (error) {
//       console.error('Error saving item for later:', error)
//       toast.error('Failed to save item')
//     }
//   }

//   const handleMoveToCart = async (itemId) => {
//     try {
//       const { error } = await supabase.from('cart_items').update({ saved_for_later: false }).eq('id', itemId)

//       if (error) throw error

//       const itemToMove = savedItems.find((item) => item.id === itemId)
//       setSavedItems(savedItems.filter((item) => item.id !== itemId))
//       setCartItems([...cartItems, { ...itemToMove, saved_for_later: false }])
//       toast.success('Item moved to cart')
//     } catch (error) {
//       console.error('Error moving item to cart:', error)
//       toast.error('Failed to move item')
//     }
//   }

//   const handleRemoveItem = async (itemId) => {
//     try {
//       const { error } = await supabase.from('cart_items').delete().eq('id', itemId)

//       if (error) throw error

//       setCartItems(cartItems.filter((item) => item.id !== itemId))
//       setSavedItems(savedItems.filter((item) => item.id !== itemId))
//       toast.success('Item removed')
//     } catch (error) {
//       console.error('Error removing item:', error)
//       toast.error('Failed to remove item')
//     }
//   }

//   const handleClearCart = async () => {
//     try {
//       const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).eq('saved_for_later', false)

//       if (error) throw error

//       setCartItems([])
//       setClearDialogOpen(false)
//       toast.success('Cart cleared')
//     } catch (error) {
//       console.error('Error clearing cart:', error)
//       toast.error('Failed to clear cart')
//     }
//   }

//   const calculateTotals = () => {
//     return cartItems.reduce(
//       (acc, item) => {
//         // Get the selected section for this item
//         const sections = allSections[item.course_id] || []
//         const selectedSection = sections.find((s) => s.crn === item.crn)

//         // Get price and discount from the selected section
//         const price = selectedSection?.price || 0
//         const discount = selectedSection?.discount || 0

//         return {
//           subtotal: acc.subtotal + price,
//           savings: acc.savings + discount,
//         }
//       },
//       { subtotal: 0, savings: 0 }
//     )
//   }

//   const { subtotal, savings } = calculateTotals()
//   const total = subtotal - savings

//   // Add these utility functions
//   const dayMap = {
//     M: 'Monday',
//     T: 'Tuesday',
//     W: 'Wednesday',
//     R: 'Thursday',
//     F: 'Friday',
//     S: 'Saturday',
//     U: 'Sunday',
//   }

//   const shortDayMap = {
//     Monday: 'Mon',
//     Tuesday: 'Tue',
//     Wednesday: 'Wed',
//     Thursday: 'Thu',
//     Friday: 'Fri',
//     Saturday: 'Sat',
//     Sunday: 'Sun',
//   }

//   const parseDaysString = (daysString) => {
//     if (!daysString || daysString === 'Asynchronous') {
//       return []
//     }

//     const dayArray = daysString
//       .split('')
//       .map((char) => char.trim())
//       .filter(Boolean)

//     const parsedDays = dayArray
//       .map((day) => dayMap[day])
//       .filter(Boolean)
//       .map((day) => shortDayMap[day] || day)

//     return parsedDays
//   }

//   const parseTimeString = (timeString) => {
//     if (!timeString) return { startTime: '00:00', endTime: '00:00' }

//     const timePattern = /(\d{1,2}:\d{2}[ap]m)\s*-\s*(\d{1,2}:\d{2}[ap]m)/i
//     const match = timeString.match(timePattern)

//     if (!match) return { startTime: '00:00', endTime: '00:00' }

//     const convert12to24 = (time12h) => {
//       const [time, modifier] = time12h.toLowerCase().split(/([ap]m)/)
//       let [hours, minutes] = time.split(':')

//       hours = parseInt(hours, 10)
//       if (hours === 12) hours = 0
//       if (modifier === 'pm') hours += 12

//       return `${hours.toString().padStart(2, '0')}:${minutes}`
//     }

//     return {
//       startTime: convert12to24(match[1]),
//       endTime: convert12to24(match[2]),
//     }
//   }

//   // Color generation for courses
//   const courseColors = [
//     '#4299E1', // blue
//     '#48BB78', // green
//     '#ED64A6', // pink
//     '#ECC94B', // yellow
//     '#9F7AEA', // purple
//   ]

//   const generateColorForCourse = (courseCode) => {
//     const hash = courseCode.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
//     return courseColors[hash % courseColors.length]
//   }

//   const parseDateRange = (dateString, year) => {
//     if (!dateString || !year) {
//       console.warn('Missing date string or year, using default dates')
//       return {
//         startDate: new Date(`${year || 2024}-01-08`),
//         endDate: new Date(`${year || 2024}-05-03`),
//       }
//     }

//     try {
//       const dateStr = Array.isArray(dateString) ? dateString[0] : dateString
//       const [start, end] = dateStr.split('-')
//       const [startMonth, startDay] = start.split('/').map(Number)
//       const [endMonth, endDay] = end.split('/').map(Number)

//       const startDate = new Date(year, startMonth - 1, startDay)
//       const endDate = new Date(year, endMonth - 1, endDay)

//       return { startDate, endDate }
//     } catch (error) {
//       console.error('Error parsing date range:', error)
//       return {
//         startDate: new Date(`${year || 2024}-01-08`),
//         endDate: new Date(`${year || 2024}-05-03`),
//       }
//     }
//   }

//   const formatSectionsForSchedule = (sections) => {
//     const formatted = sections
//       .filter((section) => {
//         if (!section) {
//           console.warn('Null section encountered')
//           return false
//         }
//         const hasTimes = section.section_times?.[0] && section.section_times?.[1]
//         return hasTimes
//       })
//       .map((section) => {
//         try {
//           const days = parseDaysString(section.section_times[0])
//           const { startTime, endTime } = parseTimeString(section.section_times[1])
//           const { startDate, endDate } = parseDateRange(
//             section.course_type === 'youredu' ? section.dates : section.section_dates,
//             section.year
//           )

//           return {
//             id: section.course_code,
//             name: section.course_name || section.title,
//             days,
//             startTime,
//             endTime,
//             color: generateColorForCourse(section.course_code),
//             selected: true,
//             crn: section.crn,
//             startDate,
//             endDate,
//           }
//         } catch (error) {
//           console.error('Error processing section:', section, error)
//           return null
//         }
//       })
//       .filter(Boolean)

//     return formatted
//   }

//   useEffect(() => {
//     const selectedSectionData = cartItems
//       .map((item) => {
//         const sections = allSections[item.course_id] || []
//         const selectedSection = selectedSections[item.course_id]
//         const details = courseDetails[item.course_id]

//         if (!selectedSection) {
//           console.warn('No selected section for course:', item.course_id)
//           return null
//         }

//         if (sections.length === 0) {
//           console.warn('No available sections for course:', item.course_id)
//           return null
//         }

//         const matchingSection = sections
//           .filter((section) => section.crn === selectedSection)
//           .map((section) => ({
//             ...section,
//             course_code: item.course_id,
//             course_name: details?.title,
//           }))[0]

//         if (!matchingSection) {
//           console.warn('No matching section found for selected CRN:', {
//             courseId: item.course_id,
//             selectedCrn: selectedSection,
//           })
//         }

//         return matchingSection
//       })
//       .filter(Boolean)

//     const formattedData = formatSectionsForSchedule(selectedSectionData)
//     setScheduleData(formattedData)
//   }, [selectedSections, allSections, courseDetails, cartItems])

//   const handleSectionSelect = async (item, crn) => {
//     try {
//       const { error } = await supabase.from('cart_items').update({ crn: crn }).eq('id', item.id)

//       if (error) throw error

//       // Update local state instead of refetching
//       setSelectedSections((prev) => ({
//         ...prev,
//         [item.course_id]: crn,
//       }))

//       // Update the cartItems locally instead of refetching
//       setCartItems((prev) => prev.map((cartItem) => (cartItem.id === item.id ? { ...cartItem, crn: crn } : cartItem)))

//       // Removed the success toast
//     } catch (error) {
//       console.error('Error updating section:', error)
//       toast.error('Failed to update section') // Keep error toast for user feedback when something goes wrong
//     }
//   }

//   // Handler to update sections and details
//   const handleCourseDataUpdate = (courseId, sections, details) => {
//     setAllSections((prev) => ({
//       ...prev,
//       [courseId]: sections,
//     }))
//     setCourseDetails((prev) => ({
//       ...prev,
//       [courseId]: details,
//     }))
//   }

//   const handleCheckout = () => {
//     navigate('/checkout')
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
//       {/* Hero Section */}
//       <Box sx={cardStyles.section}>
//         <Container
//           maxWidth="var(--container-max-width)"
//           sx={{
//             position: 'relative',
//             px: 'var(--container-padding-x)',
//             py: 'var(--container-padding-y)',
//             '@media (--tablet)': {
//               px: 'var(--container-padding-x-mobile)',
//             },
//           }}
//         >
//           <Button
//             startIcon={<BackIcon />}
//             onClick={() => navigate(-1)}
//             sx={{
//               mb: 2,
//               color: 'hsl(var(--foreground))',
//               '&:hover': {
//                 backgroundColor: 'hsl(var(--accent))',
//               },
//             }}
//           >
//             Back
//           </Button>
//           <PageHeader>Shopping Cart</PageHeader>
//         </Container>
//       </Box>

//       {/* Main Content */}
//       <Container
//         maxWidth="var(--container-max-width)"
//         sx={{
//           px: 'var(--container-padding-x)',
//           py: 'var(--spacing-6)',
//           '@media (--tablet)': {
//             px: 'var(--container-padding-x-mobile)',
//           },
//           display: 'flex',
//           gap: 'var(--spacing-6)',
//         }}
//       >
//         {/* Cart Items */}
//         <Box sx={{ width: '55%' }}>
//           {loading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//               <CircularProgress />
//             </Box>
//           ) : cartItems.length === 0 && savedItems.length === 0 ? (
//             <Paper
//               elevation={0}
//               sx={{
//                 p: 'var(--spacing-6)',
//                 textAlign: 'center',
//                 backgroundColor: 'hsl(var(--muted))',
//                 border: '1px solid hsl(var(--border))',
//                 borderRadius: 'var(--radius-lg)',
//               }}
//             >
//               <FeatureHeader sx={{ mb: 2 }}>Your cart is empty</FeatureHeader>
//               <DescriptiveText sx={{ mb: 4 }}>Add courses to your cart to get started with enrollment</DescriptiveText>
//               <Button
//                 variant="contained"
//                 onClick={() => navigate('/course-search')}
//                 sx={{
//                   backgroundColor: 'hsl(var(--brand-primary))',
//                   color: 'hsl(var(--background))',
//                   '&:hover': {
//                     backgroundColor: 'hsl(var(--brand-primary-dark))',
//                   },
//                 }}
//               >
//                 Browse Courses
//               </Button>
//             </Paper>
//           ) : (
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {/* Active Cart Items */}
//               {cartItems.length > 0 && (
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//                   {cartItems.map((item) => (
//                     <CartItem
//                       key={item.id}
//                       item={item}
//                       onRemove={handleRemoveItem}
//                       onSaveForLater={handleSaveForLater}
//                       onMoveToCart={handleMoveToCart}
//                       selectedSection={selectedSections[item.course_id]}
//                       onSectionSelect={(crn) => handleSectionSelect(item, crn)}
//                       onCourseDataUpdate={(sections, details) =>
//                         handleCourseDataUpdate(item.course_id, sections, details)
//                       }
//                     />
//                   ))}
//                 </Box>
//               )}

//               {/* Saved Items Section */}
//               {savedItems.length > 0 && (
//                 <Accordion
//                   expanded={savedExpanded}
//                   onChange={() => setSavedExpanded(!savedExpanded)}
//                   elevation={0}
//                   sx={{
//                     backgroundColor: 'hsl(var(--muted))',
//                     border: '1px solid hsl(var(--border))',
//                     borderRadius: 'var(--radius-lg)',
//                     overflow: 'hidden',
//                     '&:before': { display: 'none' },
//                   }}
//                 >
//                   <AccordionSummary
//                     expandIcon={<ExpandMoreIcon />}
//                     sx={{
//                       backgroundColor: 'hsl(var(--muted))',
//                       borderBottom: savedExpanded ? '1px solid hsl(var(--border))' : 'none',
//                       '&:hover': { backgroundColor: 'hsl(var(--muted))' },
//                       py: 'var(--spacing-4)',
//                       px: 'var(--spacing-6)',
//                     }}
//                   >
//                     <SectionHeader>Saved for Later ({savedItems.length})</SectionHeader>
//                   </AccordionSummary>
//                   <AccordionDetails sx={{ p: 'var(--spacing-4)', backgroundColor: 'hsl(var(--background))' }}>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
//                       {savedItems.map((item) => (
//                         <CartItem
//                           key={item.id}
//                           item={item}
//                           onRemove={handleRemoveItem}
//                           onMoveToCart={handleMoveToCart}
//                           selectedSection={selectedSections[item.course_id]}
//                           onSectionSelect={(crn) => handleSectionSelect(item, crn)}
//                           onCourseDataUpdate={(sections, details) =>
//                             handleCourseDataUpdate(item.course_id, sections, details)
//                           }
//                         />
//                       ))}
//                     </Box>
//                   </AccordionDetails>
//                 </Accordion>
//               )}
//             </Box>
//           )}
//         </Box>

//         {/* Right Column - Checkout and Schedule */}
//         <Box sx={{ width: '45%' }}>
//           {cartItems.length > 0 && (
//             <Box sx={{ position: 'sticky', top: 'var(--spacing-4)' }}>
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2,
//                   backgroundColor: 'hsl(var(--card))',
//                   border: '1px solid hsl(var(--border))',
//                   borderRadius: 'var(--radius-lg)',
//                   mb: 2,
//                 }}
//               >
//                 <FeatureHeader sx={{ mb: 2 }}>Order Summary</FeatureHeader>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <BodyText>Subtotal</BodyText>
//                     <BodyText>${subtotal.toFixed(2)}</BodyText>
//                   </Box>
//                   {savings > 0 && (
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <BodyText sx={{ color: 'hsl(var(--success))' }}>YourEDU Discount</BodyText>
//                       <BodyText sx={{ color: 'hsl(var(--success))' }}>-${savings.toFixed(2)}</BodyText>
//                     </Box>
//                   )}
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       borderTop: '1px solid hsl(var(--border))',
//                       pt: 2,
//                       mt: 1,
//                     }}
//                   >
//                     <FeatureHeader>Total</FeatureHeader>
//                     <FeatureHeader>${total.toFixed(2)}</FeatureHeader>
//                   </Box>
//                 </Box>
//               </Paper>

//               {/* Schedule Preview */}
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2,
//                   backgroundColor: 'hsl(var(--card))',
//                   border: '1px solid hsl(var(--border))',
//                   borderRadius: 'var(--radius-lg)',
//                   mb: 2,
//                 }}
//               >
//                 <FeatureHeader
//                   sx={{
//                     mb: 2,
//                     fontSize: '1.1rem',
//                   }}
//                 >
//                   Schedule Preview
//                 </FeatureHeader>
//                 <Box
//                   sx={{
//                     height: '500px',
//                     border: '1px solid hsl(var(--border))',
//                     borderRadius: 'var(--radius)',
//                     overflow: 'hidden',
//                   }}
//                 >
//                   <WeeklySchedule
//                     scheduleData={scheduleData}
//                     readOnly={true}
//                     startHour={8}
//                     endHour={20}
//                     previewMode={true}
//                     onWeekChange={setCurrentWeek}
//                   />
//                 </Box>
//               </Paper>

//               {/* Action Buttons */}
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 <Button
//                   variant="contained"
//                   startIcon={<CartIcon />}
//                   onClick={handleCheckout}
//                   sx={{
//                     backgroundColor: 'hsl(var(--brand-primary))',
//                     color: 'hsl(var(--background))',
//                     '&:hover': {
//                       backgroundColor: 'hsl(var(--brand-primary-dark))',
//                     },
//                   }}
//                 >
//                   Checkout
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   onClick={() => setClearDialogOpen(true)}
//                   sx={{
//                     borderColor: 'hsl(var(--destructive))',
//                     color: 'hsl(var(--destructive))',
//                     '&:hover': {
//                       backgroundColor: 'hsl(var(--destructive) / 0.1)',
//                       borderColor: 'hsl(var(--destructive))',
//                     },
//                   }}
//                 >
//                   Clear Cart
//                 </Button>
//               </Box>
//             </Box>
//           )}
//         </Box>
//       </Container>

//       {/* Clear Cart Dialog */}
//       <Dialog
//         open={clearDialogOpen}
//         onClose={() => setClearDialogOpen(false)}
//         sx={{
//           '& .MuiDialog-paper': {
//             borderRadius: 'var(--radius-lg)',
//           },
//         }}
//       >
//         <DialogTitle>
//           <FeatureHeader>Clear Cart</FeatureHeader>
//         </DialogTitle>
//         <DialogContent>
//           <BodyText>Are you sure you want to remove all items from your cart?</BodyText>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setClearDialogOpen(false)} sx={{ color: 'hsl(var(--text-primary))' }}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleClearCart}
//             sx={{
//               backgroundColor: 'hsl(var(--destructive))',
//               color: 'hsl(var(--destructive-foreground))',
//               '&:hover': {
//                 backgroundColor: 'hsl(var(--destructive))',
//                 opacity: 0.9,
//               },
//             }}
//           >
//             Clear Cart
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Checkout Dialog */}
//       <Dialog
//         open={checkoutDialogOpen}
//         onClose={() => setCheckoutDialogOpen(false)}
//         sx={{
//           '& .MuiDialog-paper': {
//             borderRadius: 'var(--radius-lg)',
//           },
//         }}
//       >
//         <DialogTitle>
//           <FeatureHeader>Checkout</FeatureHeader>
//         </DialogTitle>
//         <DialogContent>
//           <BodyText>
//             {total === 0
//               ? "You're about to enroll in these courses for free!"
//               : `You're about to purchase these courses for $${total.toFixed(2)}`}
//           </BodyText>
//         </DialogContent>
//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setCheckoutDialogOpen(false)} sx={{ color: 'hsl(var(--text-primary))' }}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             sx={{
//               backgroundColor: 'hsl(var(--brand-primary))',
//               color: 'hsl(var(--background))',
//               '&:hover': {
//                 backgroundColor: 'hsl(var(--brand-primary-dark))',
//               },
//             }}
//           >
//             {total === 0 ? 'Enroll Now' : 'Pay Now'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }

// export default CartPage
