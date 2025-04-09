import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
  Skeleton,
} from '@mui/material'
import { Add as AddIcon, ViewList as ListIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'
import {
  SectionHeader,
  FeatureHeader,
  DescriptiveText,
} from '../components/ui/typography'
import MyCoursesCard from '../components/courses/MyCoursesCard'
import { DatePicker } from '@mui/x-date-pickers'
import { format } from 'date-fns'
import { updateOnboardingProgress } from '../utils/onboardingUtils'
import { TranscriptService } from '../services/TranscriptService'
import { CourseDescriptionService } from '../services/CourseDescriptionService'
import { debounce } from 'lodash'

const CreateCourseModal = ({
  isOpen,
  onClose,
  newCourse,
  setNewCourse,
  onCreateCourse,
  termOptions,
  durationOptions,
  onCopyCourse,
  allStudentCourses,
  selectedStudent,
}) => {
  const [isCopyMode, setIsCopyMode] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  // Calculate academic year based on date midpoint
  const calculateAcademicYear = (start, end) => {
    if (!start || !end) return new Date().getFullYear()

    const midpoint = new Date((start.getTime() + end.getTime()) / 2)
    const year = midpoint.getFullYear()
    const sept1 = new Date(year, 8, 1) // September 1st of the midpoint year

    // If midpoint is before September 1st, use current year
    return midpoint < sept1 ? year : year + 1
  }

  // Calculate course duration in weeks
  const calculateDuration = (start, end) => {
    if (!start || !end) return null
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.round(diffDays / 7)
  }

  const formatToMMDD = (date) => {
    if (!date) return ''
    return format(date, 'MM/dd')
  }

  useEffect(() => {
    if (startDate && endDate) {
      const academicYear = calculateAcademicYear(startDate, endDate)
      const formattedDates = `${formatToMMDD(startDate)}-${formatToMMDD(endDate)}`
      setNewCourse((prev) => ({
        ...prev,
        dates: formattedDates,
        year: academicYear,
      }))
    }
  }, [startDate, endDate])

  // Helper function to display academic year range
  const getAcademicYearDisplay = () => {
    if (!startDate || !endDate) return ''
    const year = calculateAcademicYear(startDate, endDate)
    return `${year}-${year + 1} Academic Year`
  }

  // Helper function to display course duration
  const getDurationDisplay = () => {
    if (!startDate || !endDate) return null
    const weeks = calculateDuration(startDate, endDate)
    return `Course duration: ${weeks} week${weeks === 1 ? '' : 's'}`
  }

  const handleCopySelect = (course) => {
    setSelectedCourse(course)
    setNewCourse({
      title: course.title,
      year: course.year,
      term_start: course.term_start,
      term_duration: course.term_duration,
      description: course.description,
      hs_subject: course.hs_subject,
      units: course.units,
      total_hours: course.total_hours,
      instruction_method: course.instruction_method,
      evaluation_method: course.evaluation_method,
      days: course.days,
      times: course.times,
      textbooks: course.textbooks,
      materials: course.materials,
    })
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="create-course-title" disablePortal>
      <DialogTitle id="create-course-title">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <FeatureHeader>{isCopyMode ? 'Copy Existing Course' : 'Create New Course'}</FeatureHeader>
          <Button
            onClick={() => setIsCopyMode(!isCopyMode)}
            variant="contained"
            startIcon={isCopyMode ? <AddIcon /> : <ContentCopyIcon />}
            sx={{
              backgroundColor: '#2563EB',
              color: 'white',
              height: 36,
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none',
              },
              transition: 'none',
              boxShadow: 'none',
              textTransform: 'none',
            }}
          >
            {isCopyMode ? 'Create New' : 'Copy From an Existing Course'}
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          mt: 1 
        }}>
          {isCopyMode ? (
            <>
              <FormControl fullWidth>
                <InputLabel>Select Course to Copy</InputLabel>
                <Select
                  value={selectedCourse?.id || ''}
                  label="Select Course to Copy"
                  onChange={(e) => {
                    const course = allStudentCourses.find((c) => c.id === e.target.value)
                    handleCopySelect(course)
                  }}
                >
                  {allStudentCourses
                    .filter((course) => course.student_id !== selectedStudent?.id)
                    .map((course) => (
                      <MenuItem
                        key={course.id}
                        value={course.id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 0.5,
                          py: 1,
                        }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>{course.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                          Student: {course.student_name} • {course.term_start} {course.year}
                        </Typography>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                label="Course Title"
                fullWidth
                value={newCourse.title}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </>
          ) : (
            <>
              <TextField
                label="Course Title"
                fullWidth
                value={newCourse.title}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {getAcademicYearDisplay()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    format="MM/dd"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        helperText: 'Select start date',
                      },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    format="MM/dd"
                    minDate={startDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        helperText: 'Select end date',
                      },
                    }}
                  />
                </Box>
                {startDate && endDate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {getDurationDisplay()}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#2563EB',
            color: '#2563EB',
            height: 36,
            '&:hover': {
              borderColor: '#2563EB',
              backgroundColor: 'hsla(var(--brand-primary), 0.1)',
              boxShadow: 'none',
            },
            transition: 'none',
            boxShadow: 'none',
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onCreateCourse(startDate, endDate)}
          variant="contained"
          sx={{
            backgroundColor: '#2563EB',
            color: 'white',
            height: 36,
            '&:hover': {
              backgroundColor: '#2563EB',
              boxShadow: 'none',
            },
            transition: 'none',
            boxShadow: 'none',
            textTransform: 'none',
          }}
        >
          {isCopyMode ? 'Copy Course' : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DeleteCourseModal = ({ isOpen, onClose, onConfirmDelete, courseTitle }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="delete-course-title">
      <DialogTitle id="delete-course-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <FeatureHeader>Are you sure you want to delete this course?</FeatureHeader>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 4 }}>
        <Typography>
          Are you sure you want to delete "{courseTitle}"? This action cannot be undone and will delete the course's information across the entire platform.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#2563EB',
            color: '#2563EB',
            height: 36,
            '&:hover': {
              borderColor: '#2563EB',
              backgroundColor: 'hsla(var(--brand-primary), 0.1)',
              boxShadow: 'none',
            },
            transition: 'none',
            boxShadow: 'none',
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirmDelete}
          variant="contained"
          sx={{
            backgroundColor: '#DC2626',
            color: 'white',
            height: 36,
            '&:hover': {
              backgroundColor: '#DC2626',
              boxShadow: 'none',
            },
            transition: 'none',
            boxShadow: 'none',
            textTransform: 'none',
          }}
        >
          Delete Course
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const MyCourses = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [courses, setCourses] = useState({})
  const [loading, setLoading] = useState(true)
  const [syncingInBackground, setSyncingInBackground] = useState(false)
  const [error, setError] = useState(null)
  const currentYear = new Date().getFullYear()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    year: new Date().getFullYear(),
    dates: '',
  })
  const [showAllYears, setShowAllYears] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('selectedStudent')
    return saved ? JSON.parse(saved) : null
  })
  const [allStudentCourses, setAllStudentCourses] = useState([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, courseId: null, courseTitle: '', isYourEduCourse: false })

  const termOptions = ['Fall', 'Winter', 'Spring', 'Summer']
  const durationOptions = ['Quarter', 'Semester', 'School Year', 'Summer']

  // Create a ref to track if sync is in progress
  const syncInProgressRef = useRef(false);

  // Function to synchronize courses with transcript and course descriptions
  // This ensures that course data is consistent across the application
  const syncCoursesToTranscript = useCallback(async (showToast = false) => {
    if (!selectedStudent) {
      if (showToast) {
        toast.error('Please select a student first')
      }
      return;
    }
    
    // Prevent multiple simultaneous syncs
    if (syncInProgressRef.current) {
      console.log('Sync already in progress, skipping duplicate request');
      return;
    }
    
    syncInProgressRef.current = true;
    
    try {
      setIsSyncing(true)
      
      // Sync to transcript first with error handling
      try {
        console.log('Starting transcript sync for student:', selectedStudent.id)
        await TranscriptService.syncCoursesFromMyCourses(selectedStudent.id)
        console.log('Successfully completed transcript sync')
      } catch (transcriptError) {
        console.error('Error syncing to transcript, continuing with course descriptions:', transcriptError)
        // Continue with course descriptions sync even if transcript sync fails
      }
      
      // Then sync to course descriptions with error handling
      try {
        console.log('Starting course descriptions sync for student:', selectedStudent.id)
        await CourseDescriptionService.syncCoursesFromMyCourses(selectedStudent.id)
        console.log('Successfully completed course descriptions sync')
      } catch (descriptionsError) {
        console.error('Error syncing to course descriptions:', descriptionsError)
        // This is the end, so we can't continue with anything else
      }
      
      if (showToast) {
        toast.success('Courses synced successfully')
      }
    } catch (error) {
      console.error('Error in master sync process:', error)
      if (showToast) {
        toast.error('Unable to sync some course data')
      }
    } finally {
      setIsSyncing(false)
      // Reset the flag after a short delay to prevent rapid re-invocation
      setTimeout(() => {
        syncInProgressRef.current = false;
      }, 500);
    }
  }, [selectedStudent])

  // Add a debounced version of the sync function to prevent rapid multiple calls
  const debouncedSyncCourses = useCallback(
    debounce((showToast) => {
      syncCoursesToTranscript(showToast).catch(e => console.error('Debounced sync error:', e));
    }, 300),
    [syncCoursesToTranscript]
  );

  // Memoize fetchCourses to prevent stale closures
  const fetchCourses = useCallback(async () => {
    // Create an abort controller to handle cancellation
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    try {
      setLoading(true)
      setError(null)

      // Get the current selected student from state
      const currentStudent = selectedStudent;
      
      if (!currentStudent) {
        setLoading(false)
        return () => {
          console.log('Aborting fetch courses request (early return - no student)');
          abortController.abort();
        };
      }

      console.log('Fetching courses for student:', currentStudent.id, currentStudent.student_name);

      // Check if the request was aborted
      if (signal.aborted) {
        console.log('Fetch courses request was aborted');
        return () => {
          console.log('Aborting fetch courses request (already aborted)');
          abortController.abort();
        };
      }

      // Fetch YouredU courses
      const { data: youreduCourses, error: youreduError } = await supabase
        .from('youredu_courses')
        .select('*')
        .eq('student_id', currentStudent.id)
        .or(`creator_id.eq.${user.id},teachers.cs.{${user.id}}`)

      if (youreduError) throw youreduError

      // Check if the request was aborted
      if (signal.aborted) {
        console.log('Fetch courses request was aborted after youredu courses fetch');
        return () => {
          console.log('Aborting fetch courses request (after youredu fetch)');
          abortController.abort();
        };
      }

      // Fetch user's local courses
      const { data: userCourses, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('uid', user.id)
        .eq('student_id', currentStudent.id)

      if (userCoursesError) throw userCoursesError

      // Check if the request was aborted
      if (signal.aborted) {
        console.log('Fetch courses request was aborted after user courses fetch');
        return () => {
          console.log('Aborting fetch courses request (after user courses fetch)');
          abortController.abort();
        };
      }

      // Transform and combine courses
      const transformedCourses = [
        ...(youreduCourses || []).map((course) => ({
          ...course,
          is_youredu_course: true,
        })),
        ...(userCourses || []).map((course) => ({
          ...course,
          is_youredu_course: false,
        })),
      ]

      // Organize courses by year and term
      const coursesByYear = transformedCourses.reduce((acc, course) => {
        const year = course.year || new Date().getFullYear()
        const term = course.term_start || 'Unspecified Term'

        if (!acc[year]) {
          acc[year] = {}
        }
        if (!acc[year][term]) {
          acc[year][term] = []
        }

        // Check if course already exists to prevent duplicates
        const courseExists = acc[year][term].some((existingCourse) => existingCourse.id === course.id)
        if (!courseExists) {
          acc[year][term].push(course)
        }

        return acc
      }, {})

      // Final check if the request was aborted before updating state
      if (signal.aborted) {
        console.log('Fetch courses request was aborted before updating state');
        return () => {
          console.log('Aborting fetch courses request (before state update)');
          abortController.abort();
        };
      }

      setCourses(coursesByYear)
      setLoading(false)
      
      // Only sync courses to transcript if this is not a re-render
      if (!signal.aborted && !syncInProgressRef.current) {
        setSyncingInBackground(true)
        try {
          // Use the debounced version to prevent multiple rapid syncs
          debouncedSyncCourses(false);
        } catch (error) {
          console.error('Background sync error:', error)
        } finally {
          if (!signal.aborted) {
            setSyncingInBackground(false)
          }
        }
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error('Error fetching courses:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    // Return a cleanup function
    return () => {
      console.log('Aborting fetch courses request (normal completion)');
      abortController.abort();
    };
  }, [user, selectedStudent, debouncedSyncCourses])

  // Add a student change listener to sync courses when student changes
  useEffect(() => {
    let currentCleanup = null;
    
    // Listen for student changes from Navbar
    const handleStudentChange = async (event) => {
      console.log('MyCourses received studentChanged event:', event.detail);
      const newStudent = event.detail
      
      // If we have a cleanup function from a previous fetch, call it to abort any in-flight requests
      if (currentCleanup && typeof currentCleanup === 'function') {
        console.log('Cleaning up previous fetch before student change');
        currentCleanup();
        currentCleanup = null;
      }
      
      // Reset courses when student changes to avoid showing stale data
      setCourses({})
      setSelectedStudent(newStudent)
      
      // Fetch courses for the new student
      if (newStudent) {
        // Small delay to ensure state is updated before fetching
        setTimeout(() => {
          try {
            const result = fetchCourses();
            
            // Handle the Promise and its cleanup function
            if (result && typeof result.then === 'function') {
              // It's a Promise, so we need to handle it properly
              result.catch(err => {
                console.error('Error in fetchCourses during student change:', err);
              }).then(cleanupFn => {
                if (typeof cleanupFn === 'function') {
                  currentCleanup = cleanupFn;
                }
              });
            } else if (typeof result === 'function') {
              // It's already a cleanup function
              currentCleanup = result;
            }
          } catch (err) {
            console.error('Error calling fetchCourses during student change:', err);
          }
        }, 50)
      }
    }

    window.addEventListener('studentChanged', handleStudentChange)
    
    return () => {
      window.removeEventListener('studentChanged', handleStudentChange)
      // Clean up any pending fetch operations
      if (currentCleanup && typeof currentCleanup === 'function') {
        console.log('Cleaning up fetch on component unmount');
        currentCleanup();
      }
    }
  }, [fetchCourses]) // Include fetchCourses in the dependency array

  // Add effect to handle navigation state
  useEffect(() => {
    if (location.state?.openCreateCourse) {
      setIsCreateModalOpen(true)
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate])

  // Memoize fetchAllStudentCourses to prevent unnecessary re-renders
  const fetchAllStudentCourses = useCallback(async () => {
    try {
      // First get all students associated with this parent account
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)

      if (studentsError) throw studentsError

      // Then fetch courses for all students
      const promises = students.map(async (student) => {
        // Get YourEDU courses
        const { data: youreduCourses, error: youreduError } = await supabase
          .from('youredu_courses')
          .select('*')
          .eq('student_id', student.id)
          .or(`creator_id.eq.${user.id},teachers.cs.{${user.id}}`)

        if (youreduError) throw youreduError

        // Get user's local courses
        const { data: userCourses, error: userCoursesError } = await supabase
          .from('user_courses')
          .select('*')
          .eq('uid', user.id)
          .eq('student_id', student.id)

        if (userCoursesError) throw userCoursesError

        // Transform and combine courses
        const transformedCourses = [
          ...(youreduCourses || []).map((course) => ({
            ...course,
            is_youredu_course: true,
            student_name: student.name,
          })),
          ...(userCourses || []).map((course) => ({
            ...course,
            is_youredu_course: false,
            student_name: student.name,
          })),
        ]

        return transformedCourses
      })

      const allCourses = await Promise.all(promises)
      setAllStudentCourses(allCourses.flat())
    } catch (err) {
      console.error('Error fetching all student courses:', err)
      toast.error('Failed to fetch all student courses')
    }
  }, [user])

  // Update the useEffect hook to ensure sync happens when the component mounts
  useEffect(() => {
    let cleanup = null;
    
    if (user && selectedStudent) {
      // Call fetchCourses and store its return value (the cleanup function)
      try {
        const result = fetchCourses();
        
        // Handle the Promise and its cleanup function
        if (result && typeof result.then === 'function') {
          // It's a Promise, so we need to handle it properly
          result.catch(err => {
            console.error('Error in fetchCourses:', err);
          }).then(cleanupFn => {
            if (typeof cleanupFn === 'function') {
              cleanup = cleanupFn;
            }
          });
        } else if (typeof result === 'function') {
          // It's already a cleanup function
          cleanup = result;
        }
      } catch (err) {
        console.error('Error calling fetchCourses:', err);
      }
    }
    
    // Return a cleanup function that calls the returned function if it exists
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [user, selectedStudent, fetchCourses])

  // Load all student courses in the background after initial render
  useEffect(() => {
    if (user) {
      // Delay this operation to prioritize showing the current student's courses first
      const timer = setTimeout(() => {
        fetchAllStudentCourses()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [user, fetchAllStudentCourses])

  // Update the handleCreateCourse function to properly sync with the transcript
  const handleCreateCourse = async (startDate, endDate) => {
    try {
      if (!selectedStudent) {
        toast.error('Please select a student first')
        return
      }

      // Validate that both dates are provided
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates')
        return
      }

      // Format dates for the dates field
      const formattedStartDate = startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
      const formattedEndDate = endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
      const datesString = `${formattedStartDate}-${formattedEndDate}`

      console.log('Creating course for student:', selectedStudent.id, selectedStudent.student_name);
      
      const { data, error } = await supabase
        .from('youredu_courses')
        .insert([
          {
            title: newCourse.title,
            year: newCourse.year,
            dates: datesString,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            creator_id: user.id,
            student_id: selectedStudent.id,
            teachers: [user.id],
            students: [selectedStudent.id],
            description: newCourse.description || '',
            hs_subject: newCourse.hs_subject || '',
            units: newCourse.units || '',
            total_hours: newCourse.total_hours || '',
            instruction_method: newCourse.instruction_method || '',
            evaluation_method: newCourse.evaluation_method || '',
            days: newCourse.days || '',
            times: newCourse.times || '',
            textbooks: newCourse.textbooks || [],
            materials: newCourse.materials || [],
            is_published: false,
            enrollment_capacity: 1,
            teacher_name: user.user_metadata?.full_name || 'YourEDU Instructor',
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Close modal and reset form
      setIsCreateModalOpen(false)
      setNewCourse({
        title: '',
        year: new Date().getFullYear(),
        dates: '',
      })

      // Store the course title and navigate to the new course page immediately
      localStorage.setItem('currentCourseTitle', newCourse.title)
      navigate(`/user-course/${data.id}`)

      // Run these operations in the background after navigation
      Promise.all([
        fetchCourses(),
        fetchAllStudentCourses()
      ]).catch(error => {
        console.error('Error in background operations:', error)
      })

      // Update onboarding progress in the background
      setTimeout(() => {
        updateOnboardingProgress(user?.id, 'created_course').catch(error => {
          console.error('Error updating onboarding progress:', error)
        })
      }, 100)

      toast.success('Course created successfully')
    } catch (err) {
      console.error('Error creating course:', err)
      toast.error('Failed to create course')
    }
  }

  // Update the handleDeleteCourse function to properly sync with the transcript
  const handleDeleteCourse = async (courseId, isYourEduCourse) => {
    try {
      const table = isYourEduCourse ? 'youredu_courses' : 'user_courses'
      
      // Get course details before deleting
      const { data: courseData, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', courseId)
        .single()
        
      if (fetchError) throw fetchError
      
      console.log('Deleting course for student:', selectedStudent.id, selectedStudent.student_name)
      
      // Delete the course
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', courseId)

      if (error) throw error

      // Refresh course data immediately
      await fetchCourses()
      
      // Close the delete modal
      setDeleteModalState({ isOpen: false, courseId: null, courseTitle: '', isYourEduCourse: false })
      
      // Do these operations in the background
      setTimeout(() => {
        Promise.all([
          fetchAllStudentCourses()
        ]).catch(err => {
          console.error('Error in background operations after delete:', err)
        })
      }, 100)
      
      toast.success('Course deleted successfully')
    } catch (err) {
      console.error('Error deleting course:', err)
      toast.error('Failed to delete course')
    }
  }

  // Add this function to handle opening the delete modal
  const openDeleteModal = (courseId, courseTitle, isYourEduCourse) => {
    setDeleteModalState({
      isOpen: true,
      courseId,
      courseTitle,
      isYourEduCourse
    })
  }

  const handleUpdateCourse = async (courseId, updatedData, isYourEduCourse) => {
    try {
      const table = isYourEduCourse ? 'youredu_courses' : 'user_courses'
      
      console.log('Updating course for student:', selectedStudent.id, selectedStudent.student_name);
      
      const { error } = await supabase
        .from(table)
        .update(updatedData)
        .eq('id', courseId)

      if (error) throw error

      // Refresh course data immediately
      await fetchCourses()
      
      // Do these operations in the background
      setTimeout(() => {
        Promise.all([
          fetchAllStudentCourses()
          // syncCoursesToTranscript() - Removed as fetchCourses already does this
        ]).catch(err => {
          console.error('Error in background operations after update:', err)
        })
      }, 100)

      toast.success('Course updated successfully')
    } catch (err) {
      console.error('Error updating course:', err)
      toast.error('Failed to update course')
    }
  }

  // Render skeleton loading UI
  const renderSkeletonLoading = () => (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="30%" height={40} />
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="25%" height={40} />
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {[1, 2].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid hsl(var(--border))',
          mb: 3,
        }}
      >
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: 'var(--container-padding-x)',
            py: 3,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Typography
            sx={{
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2,
            }}
          >
            Manage and organize all your student's courses in one convenient location
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-6)',
          position: 'relative',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {!selectedStudent ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DescriptiveText sx={{ fontStyle: 'italic' }}>
              Please select a student from the navigation bar to view their courses.
            </DescriptiveText>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 6, pl: 2 }}>
              <FeatureHeader
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                QUICK FILTERS
              </FeatureHeader>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    startIcon={<ListIcon />}
                    onClick={() => setShowAllYears(false)}
                    sx={{
                      backgroundColor: !showAllYears ? '#2563EB' : 'transparent',
                      color: !showAllYears ? 'white' : '#2563EB',
                      height: 36,
                      minWidth: 160,
                      borderColor: '#2563EB',
                      border: showAllYears ? '1px solid' : 'none',
                      '&:hover': {
                        backgroundColor: !showAllYears ? '#2563EB' : 'hsla(var(--brand-primary), 0.1)',
                        boxShadow: 'none',
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none',
                    }}
                  >
                    Current Year
                  </Button>
                  <Button
                    startIcon={<ListIcon />}
                    onClick={() => setShowAllYears(true)}
                    sx={{
                      backgroundColor: showAllYears ? '#2563EB' : 'transparent',
                      color: showAllYears ? 'white' : '#2563EB',
                      height: 36,
                      minWidth: 120,
                      borderColor: '#2563EB',
                      border: !showAllYears ? '1px solid' : 'none',
                      '&:hover': {
                        backgroundColor: showAllYears ? '#2563EB' : 'hsla(var(--brand-primary), 0.1)',
                        boxShadow: 'none',
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none',
                    }}
                  >
                    All Years
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {syncingInBackground && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Syncing...
                    </Typography>
                  )}
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    startIcon={<AddIcon sx={{ fontSize: 20 }} />}
                    variant="contained"
                    disabled={!selectedStudent}
                    sx={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      '&:hover': {
                        backgroundColor: '#2563EB',
                        boxShadow: 'none',
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none',
                    }}
                  >
                    Add a Course
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Course Content */}
            {loading ? (
              renderSkeletonLoading()
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Box>
                {(() => {
                  const sortedYears = Object.entries(courses).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                  const yearsToRender = showAllYears
                    ? sortedYears
                    : sortedYears.filter(([year]) => year === currentYear.toString())

                  if (yearsToRender.length === 0) {
                    return (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography
                          sx={{
                            color: 'hsl(var(--text-secondary))',
                            fontStyle: 'italic',
                          }}
                        >
                          {showAllYears ? 'No courses found' : `No courses found for ${currentYear}`}
                        </Typography>
                      </Box>
                    )
                  }

                  return yearsToRender.map(([year, yearCourses]) => {
                    const termEntries = Object.entries(yearCourses)

                    return (
                      <Box key={year} sx={{ mb: 8, pl: 2 }}>
                        <SectionHeader sx={{ mb: 3 }}>{year}</SectionHeader>
                        <Grid container spacing={3}>
                          {termEntries.map(([term, termCourses]) =>
                            termCourses.map((course) => (
                              <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                                <MyCoursesCard
                                  course={course}
                                  term={`${term}`}
                                  onDelete={(courseId, courseTitle) => {
                                    openDeleteModal(courseId, courseTitle, course.is_youredu_course)
                                  }}
                                />
                              </Grid>
                            ))
                          )}
                        </Grid>
                      </Box>
                    )
                  })
                })()}
              </Box>
            )}
          </>
        )}

        <DeleteCourseModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, courseId: null, courseTitle: '', isYourEduCourse: false })}
          onConfirmDelete={() => handleDeleteCourse(deleteModalState.courseId, deleteModalState.isYourEduCourse)}
          courseTitle={deleteModalState.courseTitle}
        />

        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          newCourse={newCourse}
          setNewCourse={setNewCourse}
          onCreateCourse={handleCreateCourse}
          termOptions={termOptions}
          durationOptions={durationOptions}
          allStudentCourses={allStudentCourses}
          selectedStudent={selectedStudent}
        />
      </Container>
    </Box>
  )
}

export default MyCourses
