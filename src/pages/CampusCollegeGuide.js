import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../utils/AuthContext'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  MenuItem,
  Select,
  InputLabel,
  Checkbox,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormHelperText,
  OutlinedInput,
} from '@mui/material'
import {
  CheckCircleOutline as CheckIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Description as DocumentIcon,
  AppRegistration as RegisterIcon,
  Groups as OrientationIcon,
  ArrowForward as ArrowForwardIcon,
  OpenInNew as ExternalLinkIcon,
  DragIndicator as DragHandleIcon,
} from '@mui/icons-material'
import { SectionHeader, FeatureHeader, BodyText, SupportingText } from '../components/ui/typography'
import { TODO_TYPE_CONFIG } from '../constants/SpecialCourseTodos'
import { toast } from 'react-toastify'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const SortableItem = ({ id, index, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={1}
      sx={{
        p: 2,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.08)' : 'white',
        border: index === 0 ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid rgba(0, 0, 0, 0.12)',
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <DragHandleIcon sx={{ mr: 2, color: 'hsl(var(--muted-foreground))' }} />
      <Typography variant="body1" sx={{ mr: 1, fontWeight: index === 0 ? 'bold' : 'normal' }}>
        {index + 1}.
      </Typography>
      <Typography variant="body1">{children}</Typography>
    </Paper>
  )
}

const CampusCollegeGuide = () => {
  const { todoType, todoId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [todo, setTodo] = useState(null)
  const [relatedCourses, setRelatedCourses] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [studentData, setStudentData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Application form state
  const [activeFormStep, setActiveFormStep] = useState(0)
  const [formData, setFormData] = useState({
    isParentCompleting: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    studentFirstName: '',
    studentLastName: '',
    studentPhone: '',
    studentEmail: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isHomeschooled: 'yes',
    graduationYear: '',
    graduationMonth: '',
    gpa: '',
    classPreferences: [
      'Principles of Marketing',
      'Introduction to Business',
      'Principles of Microeconomics',
      'English Composition',
    ],
    interestStatement: '',
    majorInterest: '',
    hasComputer: '',
    acceptTerms: false,
  })

  const formSteps = ['Contact Information', 'Academic Background', 'Course Preferences', 'Review & Submit']

  // Define the steps in the Campus Community College enrollment process
  const steps = [
    { type: 'campus_application', label: 'Application', icon: <SchoolIcon /> },
    { type: 'campus_info_session', label: 'Info Session', icon: <EventIcon /> },
    { type: 'campus_enrollment_docs', label: 'Documents', icon: <DocumentIcon /> },
    { type: 'campus_course_registration', label: 'Registration', icon: <RegisterIcon /> },
    { type: 'campus_orientation', label: 'Orientation', icon: <OrientationIcon /> },
  ]

  // Add this new sensors setup for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch user profile and student data
  useEffect(() => {
    const fetchUserData = async () => {
      setProfileLoading(true)
      try {
        if (user) {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('account_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) throw profileError
          setUserProfile(profileData)

          // Determine if user is a parent or student
          const userType = profileData.user_type || 'parent'
          const isParent = userType.toLowerCase() === 'parent'

          // Initialize updated form data with current values
          const updatedFormData = { ...formData }

          // Set parent/student completing status
          updatedFormData.isParentCompleting = isParent ? 'yes' : 'no'

          // Fetch student data based on user type
          let studentInfo = null

          if (isParent) {
            // If parent, fill parent info first
            updatedFormData.parentFirstName = profileData.first_name || ''
            updatedFormData.parentLastName = profileData.last_name || ''
            updatedFormData.parentPhone = profileData.phone_number || ''
            updatedFormData.parentEmail = profileData.email || user.email || ''

            // Get the selected student from localStorage if available
            const selectedStudent = localStorage.getItem('selectedStudent')
            let studentId = null

            if (selectedStudent) {
              try {
                const parsedStudent = JSON.parse(selectedStudent)
                studentId = parsedStudent.id
              } catch (e) {
                console.error('Error parsing selected student:', e)
              }
            }

            // Fetch student data from students table
            let studentQuery = supabase.from('students').select('*').eq('parent_id', user.id)

            // If we have a specific student ID, filter by it
            if (studentId) {
              studentQuery = studentQuery.eq('id', studentId)
            }

            // Get the first student if no specific one is selected
            const { data: studentsData, error: studentsError } = await studentQuery

            if (!studentsError && studentsData && studentsData.length > 0) {
              // Use the first student or the selected one
              studentInfo = studentsData[0]
              setStudentData(studentInfo)
            }
          } else {
            // If student user, fill student info from profile
            updatedFormData.studentFirstName = profileData.first_name || ''
            updatedFormData.studentLastName = profileData.last_name || ''
            updatedFormData.studentPhone = profileData.phone_number || ''
            updatedFormData.studentEmail = profileData.email || user.email || ''

            // Fetch student data for this student user
            const { data: studentData, error: studentError } = await supabase
              .from('students')
              .select('*')
              .eq('user_id', user.id)
              .single()

            if (!studentError && studentData) {
              studentInfo = studentData
              setStudentData(studentInfo)
            }
          }

          // Fill student info from students table if available
          if (studentInfo) {
            // Parse student name into first and last name if not already set
            if (!updatedFormData.studentFirstName || !updatedFormData.studentLastName) {
              const nameParts = studentInfo.student_name ? studentInfo.student_name.split(' ') : []
              if (nameParts.length >= 2) {
                updatedFormData.studentFirstName = nameParts[0] || ''
                updatedFormData.studentLastName = nameParts.slice(1).join(' ') || ''
              } else {
                updatedFormData.studentFirstName = studentInfo.student_name || ''
              }
            }

            // Set student email if available
            if (studentInfo.email) {
              updatedFormData.studentEmail = studentInfo.email
            }

            // Set birth date if available
            if (studentInfo.date_of_birth) {
              try {
                const birthDate = new Date(studentInfo.date_of_birth)
                updatedFormData.birthMonth = birthDate.getMonth() + 1 // JavaScript months are 0-indexed
                updatedFormData.birthDay = birthDate.getDate()
                updatedFormData.birthYear = birthDate.getFullYear()
              } catch (e) {
                console.error('Error parsing birth date:', e)
              }
            }

            // Set graduation year and determine graduation month (default to May)
            if (studentInfo.graduation_year) {
              updatedFormData.graduationYear = studentInfo.graduation_year
              updatedFormData.graduationMonth = 'May' // Default to May for graduation
            }

            // Determine if homeschooled - now only override the default 'yes' if we have explicit evidence they're not homeschooled
            if (
              (studentInfo.school_name &&
                !studentInfo.school_name.toLowerCase().includes('home') &&
                !studentInfo.school_name.toLowerCase().includes('homeschool') &&
                studentInfo.school_name.toLowerCase().includes('public')) ||
              studentInfo.school_name.toLowerCase().includes('private')
            ) {
              // Only set to 'no' if we have strong evidence they attend a traditional school
              updatedFormData.isHomeschooled = 'no'
            }
          }

          // Fill address info from profile
          updatedFormData.address = profileData.street_address || ''
          updatedFormData.city = profileData.city || ''
          updatedFormData.state = profileData.state || ''
          updatedFormData.zipCode = profileData.zip || ''

          // Set computer access to yes by default (most users have computer access)
          updatedFormData.hasComputer = 'yes'

          // Update form data with autofilled values
          setFormData(updatedFormData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load user profile data')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Fetch todo and related courses
  useEffect(() => {
    const fetchTodoData = async () => {
      setLoading(true)
      try {
        if (todoId) {
          // Fetch specific todo
          const { data: todoData, error: todoError } = await supabase
            .from('user_courses_todos')
            .select('*')
            .eq('id', todoId)
            .single()

          if (todoError) throw todoError
          setTodo(todoData)

          // Fetch related courses
          if (todoData.user_course_ids && todoData.user_course_ids.length > 0) {
            const { data: coursesData, error: coursesError } = await supabase
              .from('user_courses')
              .select('*')
              .in('id', todoData.user_course_ids)

            if (coursesError) throw coursesError
            setRelatedCourses(coursesData)
          }
        } else {
          // No todoId provided, just show the guide for the specified type
          // You could fetch all todos of this type for the user if needed
        }
      } catch (error) {
        console.error('Error fetching todo data:', error)
        toast.error('Failed to load todo information')
      } finally {
        setLoading(false)
      }
    }

    fetchTodoData()
  }, [todoId, user])

  const markTodoComplete = async () => {
    if (!todoId) return

    try {
      const { error } = await supabase
        .from('user_courses_todos')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', todoId)

      if (error) throw error

      // Update local state
      setTodo((prev) => ({ ...prev, completed: true, completed_at: new Date().toISOString() }))
      toast.success('Task marked as complete!')

      // Navigate to the next step if available
      const currentIndex = steps.findIndex((step) => step.type === todoType)
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1]
        navigate(`/campus-college-guide/${nextStep.type}${todoId ? `/${todoId}` : ''}`)
      } else {
        // If this is the last step, navigate back to my-courses
        navigate('/my-courses')
      }
    } catch (error) {
      console.error('Error marking todo as complete:', error)
      toast.error('Failed to update task status')
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleNextFormStep = () => {
    setActiveFormStep((prev) => Math.min(prev + 1, formSteps.length - 1))
  }

  const handlePrevFormStep = () => {
    setActiveFormStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmitApplication = () => {
    // Here you would submit the form data to your backend or directly to Campus Community College
    console.log('Application submitted:', formData)
    toast.success('Application submitted successfully!')

    // For demo purposes, we'll just mark the todo as complete
    if (todoId) {
      markTodoComplete()
    }
  }

  // Replace the onDragEnd function with this new handleDragEnd function
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setFormData((formData) => {
        const oldIndex = formData.classPreferences.indexOf(active.id)
        const newIndex = formData.classPreferences.indexOf(over.id)

        return {
          ...formData,
          classPreferences: arrayMove(formData.classPreferences, oldIndex, newIndex),
        }
      })
    }
  }

  const getPageTitle = () => {
    switch (todoType) {
      case 'campus_application':
        return 'Complete Campus Community College Application'
      case 'campus_info_session':
        return 'Attend Campus Community College Info Session'
      case 'campus_enrollment_docs':
        return 'Sign Campus Community College Enrollment Documents'
      case 'campus_course_registration':
        return 'Register for Campus Community College Courses'
      case 'campus_orientation':
        return 'Attend Campus Community College Orientation'
      default:
        return 'Campus Community College Enrollment Guide'
    }
  }

  const renderApplicationForm = () => {
    switch (activeFormStep) {
      case 0: // Contact Information
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend" required>
                Are you a parent or guardian completing this application on behalf of a student?
              </FormLabel>
              <RadioGroup name="isParentCompleting" value={formData.isParentCompleting} onChange={handleFormChange} row>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            {formData.isParentCompleting === 'yes' && (
              <>
                <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                  Please provide parent or guardian contact information.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="First name"
                      name="parentFirstName"
                      value={formData.parentFirstName}
                      onChange={handleFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Last name"
                      name="parentLastName"
                      value={formData.parentLastName}
                      onChange={handleFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Phone number"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Email"
                      name="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={handleFormChange}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
              {formData.isParentCompleting === 'yes'
                ? 'Please provide student contact information. If student contact information is the same as parent/guardian leave this blank.'
                : 'Please provide your contact information.'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First name"
                  name="studentFirstName"
                  value={formData.studentFirstName}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last name"
                  name="studentLastName"
                  value={formData.studentLastName}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone number"
                  name="studentPhone"
                  value={formData.studentPhone}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="studentEmail"
                  type="email"
                  value={formData.studentEmail}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
              Please provide student date of birth.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Month</InputLabel>
                  <Select name="birthMonth" value={formData.birthMonth} label="Month" onChange={handleFormChange}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Day</InputLabel>
                  <Select name="birthDay" value={formData.birthDay} label="Day" onChange={handleFormChange}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Year</InputLabel>
                  <Select name="birthYear" value={formData.birthYear} label="Year" onChange={handleFormChange}>
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - 29 + i).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
              Please provide your home mailing address.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address line 2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City/Town"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>State/Region/Province</InputLabel>
                  <Select name="state" value={formData.state} label="State/Region/Province" onChange={handleFormChange}>
                    {[
                      'Alabama',
                      'Alaska',
                      'Arizona',
                      'Arkansas',
                      'California',
                      'Colorado',
                      'Connecticut',
                      'Delaware',
                      'Florida',
                      'Georgia',
                      'Hawaii',
                      'Idaho',
                      'Illinois',
                      'Indiana',
                      'Iowa',
                      'Kansas',
                      'Kentucky',
                      'Louisiana',
                      'Maine',
                      'Maryland',
                      'Massachusetts',
                      'Michigan',
                      'Minnesota',
                      'Mississippi',
                      'Missouri',
                      'Montana',
                      'Nebraska',
                      'Nevada',
                      'New Hampshire',
                      'New Jersey',
                      'New Mexico',
                      'New York',
                      'North Carolina',
                      'North Dakota',
                      'Ohio',
                      'Oklahoma',
                      'Oregon',
                      'Pennsylvania',
                      'Rhode Island',
                      'South Carolina',
                      'South Dakota',
                      'Tennessee',
                      'Texas',
                      'Utah',
                      'Vermont',
                      'Virginia',
                      'Washington',
                      'West Virginia',
                      'Wisconsin',
                      'Wyoming',
                    ].map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Zip/Post code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Country</InputLabel>
                  <Select name="country" value={formData.country} label="Country" onChange={handleFormChange}>
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                    <MenuItem value="Mexico">Mexico</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )

      case 1: // Academic Background
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend" required>
                Is this applicant a homeschool student?
              </FormLabel>
              <RadioGroup name="isHomeschooled" value={formData.isHomeschooled} onChange={handleFormChange} row>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>What was or will be your high school graduation year?</InputLabel>
                  <Select
                    name="graduationYear"
                    value={formData.graduationYear}
                    label="What was or will be your high school graduation year?"
                    onChange={handleFormChange}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>What was or will be your high school graduation month?</InputLabel>
                  <Select
                    name="graduationMonth"
                    value={formData.graduationMonth}
                    label="What was or will be your high school graduation month?"
                    onChange={handleFormChange}
                  >
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="What is your current high school cumulative GPA?"
                  name="gpa"
                  type="number"
                  inputProps={{ step: 0.01, min: 0, max: 4.0 }}
                  value={formData.gpa}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>

            <FormControl component="fieldset" sx={{ mt: 3, width: '100%' }}>
              <FormLabel component="legend" required>
                Do you have access to a laptop or computer and WiFi to take this course?
              </FormLabel>
              <FormHelperText>
                Access to a laptop or computer and internet access is required to participate in this program.
              </FormHelperText>
              <RadioGroup name="hasComputer" value={formData.hasComputer} onChange={handleFormChange} row>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        )

      case 2: // Course Preferences
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Please rank the following classes in order by preference.
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              The class you are most interested in should be ranked first! Drag and drop to reorder.
            </Typography>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={formData.classPreferences} strategy={verticalListSortingStrategy}>
                <Box sx={{ mb: 4 }}>
                  {formData.classPreferences.map((item, index) => (
                    <SortableItem key={item} id={item} index={index}>
                      {item}
                    </SortableItem>
                  ))}
                </Box>
              </SortableContext>
            </DndContext>

            <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
              Please provide a statement describing your interest in participating in this program (250 word limit).
            </Typography>
            <TextField
              required
              fullWidth
              name="interestStatement"
              value={formData.interestStatement}
              onChange={handleFormChange}
              multiline
              rows={6}
              inputProps={{ maxLength: 1500 }}
              helperText={`${formData.interestStatement.length}/1500 characters (approximately ${Math.ceil(
                formData.interestStatement.length / 6
              )} words)`}
            />

            <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
              Which of the following best matches your future interest for a college major to study?
            </Typography>
            <FormControl fullWidth required>
              <Select name="majorInterest" value={formData.majorInterest} onChange={handleFormChange} displayEmpty>
                <MenuItem value="" disabled>
                  <em>Select an option</em>
                </MenuItem>
                <MenuItem value="STEM">STEM</MenuItem>
                <MenuItem value="Business & Management">Business & Management</MenuItem>
                <MenuItem value="Arts & Humanities">Arts & Humanities</MenuItem>
                <MenuItem value="Healthcare & Medicine">Healthcare & Medicine</MenuItem>
                <MenuItem value="Social Sciences">Social Sciences</MenuItem>
                <MenuItem value="Unknown">Unknown</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )

      case 3: // Review & Submit
        return (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Please review your application information before submitting. You can go back to previous sections to
                make changes if needed.
              </Typography>
            </Alert>

            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2, fontSize: '1.1rem' }}>Contact Information</FeatureHeader>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>
                    {formData.isParentCompleting === 'yes' ? 'Parent/Guardian:' : 'Student:'}
                  </SupportingText>
                  <BodyText>
                    {formData.isParentCompleting === 'yes'
                      ? `${formData.parentFirstName} ${formData.parentLastName} (${formData.parentEmail})`
                      : `${formData.studentFirstName} ${formData.studentLastName} (${formData.studentEmail})`}
                  </BodyText>
                </Grid>
                {formData.isParentCompleting === 'yes' && (
                  <Grid item xs={12}>
                    <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Student:</SupportingText>
                    <BodyText>
                      {formData.studentFirstName} {formData.studentLastName} ({formData.studentEmail})
                    </BodyText>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Date of Birth:</SupportingText>
                  <BodyText>
                    {formData.birthMonth}/{formData.birthDay}/{formData.birthYear}
                  </BodyText>
                </Grid>
                <Grid item xs={12}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Address:</SupportingText>
                  <BodyText>
                    {formData.address}
                    {formData.addressLine2 && <>, {formData.addressLine2}</>}
                    <br />
                    {formData.city}, {formData.state} {formData.zipCode}
                    <br />
                    {formData.country}
                  </BodyText>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2, fontSize: '1.1rem' }}>Academic Background</FeatureHeader>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Homeschool Student:</SupportingText>
                  <BodyText>{formData.isHomeschooled === 'yes' ? 'Yes' : 'No'}</BodyText>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Graduation:</SupportingText>
                  <BodyText>
                    {formData.graduationMonth} {formData.graduationYear}
                  </BodyText>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>GPA:</SupportingText>
                  <BodyText>{formData.gpa}</BodyText>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Computer Access:</SupportingText>
                  <BodyText>{formData.hasComputer === 'yes' ? 'Yes' : 'No'}</BodyText>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2, fontSize: '1.1rem' }}>Course Preferences</FeatureHeader>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>
                    Class Preferences (in order):
                  </SupportingText>
                  <ol>
                    {formData.classPreferences.map((className, index) => (
                      <li key={index}>
                        <BodyText>{className}</BodyText>
                      </li>
                    ))}
                  </ol>
                </Grid>
                <Grid item xs={12}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Major Interest:</SupportingText>
                  <BodyText>{formData.majorInterest}</BodyText>
                </Grid>
                <Grid item xs={12}>
                  <SupportingText sx={{ color: 'hsl(var(--muted-foreground))' }}>Interest Statement:</SupportingText>
                  <BodyText sx={{ whiteSpace: 'pre-wrap' }}>{formData.interestStatement}</BodyText>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mt: 4, p: 3, border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Terms and Conditions
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                I attest that by submitting this application for the Campus Try College program I agree to the
                following:
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                By submitting this application I attest that the information I have submitted is to the best of my
                knowledge accurate and current. I understand and agree by electronic signature (1) Campus may call, text
                message, and email me about its services and programs; (2) all calls may be recorded for quality and
                training purposes; and (3) to the terms of Campus's Privacy Policy. I also understand that I may opt out
                of these communications at any time.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox required name="acceptTerms" checked={formData.acceptTerms} onChange={handleFormChange} />
                }
                label="I Accept"
              />
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  const renderStepContent = () => {
    switch (todoType) {
      case 'campus_application':
        return (
          <>
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Eligibility Requirements</FeatureHeader>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Grade Level & Age"
                    secondary="Be in your third or fourth year of high school and at least 15 years old by the start of classes, OR be a recent high school graduate (having graduated no earlier than June 2023)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Academic Standing" secondary="Have a minimum 2.5 cumulative GPA" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time Commitment"
                    secondary="Be able to commit a minimum of 7-10 hours per week (including class time)"
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Campus Community College Application</FeatureHeader>
              <BodyText sx={{ mb: 3 }}>
                Complete the application form below. All fields marked with an asterisk (*) are required.
              </BodyText>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Application deadline:</strong> September 17, 2024
                </Typography>
              </Alert>

              <Box sx={{ width: '100%', mb: 4 }}>
                <Stepper activeStep={activeFormStep} alternativeLabel>
                  {formSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {renderApplicationForm()}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button variant="outlined" onClick={handlePrevFormStep} disabled={activeFormStep === 0}>
                  Back
                </Button>

                {activeFormStep < formSteps.length - 1 ? (
                  <Button variant="contained" color="primary" onClick={handleNextFormStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitApplication}
                    disabled={!formData.acceptTerms}
                  >
                    Submit Application
                  </Button>
                )}
              </Box>
            </Paper>
          </>
        )

      case 'campus_info_session':
        return (
          <>
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>About the Info Session</FeatureHeader>
              <BodyText sx={{ mb: 3 }}>
                Once you apply and are admitted, you'll be invited to an information session that gives you a rundown of
                the program. If you plan to enroll, attending an info session is mandatory.
              </BodyText>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> You must attend an info session before you can proceed with enrollment.
                </Typography>
              </Alert>

              <FeatureHeader sx={{ mb: 2, mt: 4 }}>What to Expect</FeatureHeader>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Program Overview"
                    secondary="Learn about the structure, expectations, and benefits of the program"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Q&A Session"
                    secondary="Opportunity to ask questions about the program and enrollment process"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Next Steps"
                    secondary="Detailed instructions on completing enrollment documents and course registration"
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Scheduling Your Session</FeatureHeader>
              <BodyText sx={{ mb: 3 }}>
                After your application is approved, you'll receive an email with available info session dates and times.
                Sessions are typically held virtually via Zoom, with some in-person options available.
              </BodyText>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Upcoming sessions:</strong> Multiple dates available in August and September 2024. Check your
                  admission email for the specific schedule and registration link.
                </Typography>
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<ExternalLinkIcon />}
                  onClick={() => window.open('https://campuscommunitycollege.edu/info-sessions', '_blank')}
                >
                  View Session Calendar
                </Button>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              {todoId && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={markTodoComplete}
                  disabled={todo?.completed}
                  endIcon={<ArrowForwardIcon />}
                >
                  {todo?.completed ? 'Marked Complete' : 'Mark Complete & Continue'}
                </Button>
              )}
            </Box>
          </>
        )

      case 'campus_enrollment_docs':
        return (
          <>
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Required Documents</FeatureHeader>
              <BodyText sx={{ mb: 3 }}>
                Students must sign the program enrollment agreement, which will be provided via email and can be signed
                with an electronic signature. A parent or guardian signature is required for students under 18.
              </BodyText>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Enrollment deadline:</strong> September 24, 2024
                </Typography>
              </Alert>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <DocumentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Program Enrollment Agreement"
                    secondary="The main document outlining program terms, expectations, and student responsibilities"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DocumentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Student Information Form"
                    secondary="Basic contact and emergency information"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DocumentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Media Release Form (Optional)"
                    secondary="Permission to use student images or testimonials in program materials"
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Submission Process</FeatureHeader>
              <BodyText sx={{ mb: 3 }}>
                After attending the info session, you'll receive an email with a link to the enrollment documents. These
                can be signed electronically through DocuSign or a similar platform.
              </BodyText>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<ExternalLinkIcon />}
                  onClick={() => window.open('https://campuscommunitycollege.edu/enrollment-docs', '_blank')}
                >
                  View Sample Documents
                </Button>
              </Box>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> All enrollment documents must be completed before you can register for
                  courses.
                </Typography>
              </Alert>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              {todoId && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={markTodoComplete}
                  disabled={todo?.completed}
                  endIcon={<ArrowForwardIcon />}
                >
                  {todo?.completed ? 'Marked Complete' : 'Mark Complete & Continue'}
                </Button>
              )}
            </Box>
          </>
        )

      case 'campus_course_registration':
        return (
          <>
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Registration Process</FeatureHeader>
              <BodyText sx={{ mb: 3 }}>
                After completing your enrollment documents, you can reserve a spot in your selected courses. Make sure
                to complete this before the enrollment deadline.
              </BodyText>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Registration deadline:</strong> September 24, 2024
                </Typography>
              </Alert>

              {relatedCourses.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <FeatureHeader sx={{ mb: 2 }}>Your Selected Courses</FeatureHeader>
                  <List>
                    {relatedCourses.map((course) => (
                      <ListItem key={course.id}>
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={course.title}
                          secondary={`${course.course_code} - ${course.term_start || 'Term not specified'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>How to Register</FeatureHeader>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Step 1: Access the Student Portal"
                    secondary="Log in to the Campus Community College student portal using the credentials sent to your email"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Step 2: Navigate to Course Registration"
                    secondary="Find the 'Course Registration' section in your student dashboard"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Step 3: Select Your Courses"
                    secondary="Choose the courses you've already selected through YourEDU"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Step 4: Confirm Registration"
                    secondary="Review your selections and submit your registration"
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ExternalLinkIcon />}
                  onClick={() => window.open('https://portal.campuscommunitycollege.edu', '_blank')}
                >
                  Go to Student Portal
                </Button>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              {todoId && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={markTodoComplete}
                  disabled={todo?.completed}
                  endIcon={<ArrowForwardIcon />}
                >
                  {todo?.completed ? 'Marked Complete' : 'Mark Complete & Continue'}
                </Button>
              )}
            </Box>
          </>
        )

      case 'campus_orientation':
        return (
          <>
            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Orientation Details</FeatureHeader>
              <BodyText sx={{ mb: 3 }}>
                Attend the student orientation to get an introduction to the program, learn how to navigate the student
                platform, and meet program staff and fellow classmates.
              </BodyText>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Orientation dates:</strong> Week of September 30, 2024
                </Typography>
              </Alert>

              <FeatureHeader sx={{ mb: 2, mt: 4 }}>What to Expect</FeatureHeader>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Program Introduction"
                    secondary="Overview of program structure, resources, and support services"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Platform Training"
                    secondary="How to navigate the online learning platform and access course materials"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Meet & Greet"
                    secondary="Opportunity to meet program staff and fellow students"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Q&A Session"
                    secondary="Address any last-minute questions before classes begin"
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid hsl(var(--border))' }}>
              <FeatureHeader sx={{ mb: 2 }}>Important Dates</FeatureHeader>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Classes Start" secondary="October 7, 2024" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Add/Drop Deadline" secondary="October 18, 2024" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Final Exam Week" secondary="December 16, 2024 - December 19, 2024" />
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={<ExternalLinkIcon />}
                  onClick={() => window.open('https://campuscommunitycollege.edu/academic-calendar', '_blank')}
                >
                  View Full Academic Calendar
                </Button>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              {todoId && (
                <Button variant="contained" color="primary" onClick={markTodoComplete} disabled={todo?.completed}>
                  {todo?.completed ? 'Marked Complete' : 'Mark Complete'}
                </Button>
              )}
            </Box>
          </>
        )

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5">Guide not found for this step.</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/my-courses')} sx={{ mt: 2 }}>
              Return to My Courses
            </Button>
          </Box>
        )
    }
  }

  if (loading || profileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <SectionHeader>{getPageTitle()}</SectionHeader>
        <SupportingText>
          {todoType === 'campus_application'
            ? 'Step 1 of 5 in the Campus Community College enrollment process'
            : todoType === 'campus_info_session'
            ? 'Step 2 of 5 in the Campus Community College enrollment process'
            : todoType === 'campus_enrollment_docs'
            ? 'Step 3 of 5 in the Campus Community College enrollment process'
            : todoType === 'campus_course_registration'
            ? 'Step 4 of 5 in the Campus Community College enrollment process'
            : todoType === 'campus_orientation'
            ? 'Step 5 of 5 in the Campus Community College enrollment process'
            : 'Campus Community College enrollment process'}
        </SupportingText>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
        }}
      >
        {renderStepContent()}
      </Paper>
    </Container>
  )
}

export default CampusCollegeGuide
