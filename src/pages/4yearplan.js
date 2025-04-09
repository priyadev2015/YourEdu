import React, { useState, useEffect } from 'react'
import { Box, Paper, Button, Stack, Select, MenuItem, TextField, Alert, Snackbar, Typography } from '@mui/material'
import {
  School as SchoolIcon,
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  MenuBook as MenuBookIcon,
  Public as PublicIcon,
  Translate as LanguageIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material'
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { supabase, checkSupabaseConnection } from '../utils/supabaseClient'

const styles = {
  container: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  subjectHeader: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius)',
    display: 'inline-block',
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  yearHeader: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  courseBox: {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    width: '100%',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'hsl(var(--foreground))',
    fontSize: '0.9rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      transform: 'translateY(-2px)',
      backgroundColor: 'hsl(var(--accent))',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      color: 'white',
    },
  },
  emptyBox: {
    border: '2px dashed hsl(var(--border))',
    backgroundColor: 'transparent',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
    height: '60px',
    minHeight: '60px',
    width: '100%',
    '&:hover': {
      backgroundColor: 'hsl(var(--muted))',
      borderColor: 'hsl(var(--brand-primary))',
      color: 'hsl(var(--foreground))',
    },
  },
  controls: {
    position: { xs: 'relative', md: 'sticky' },
    top: '1rem',
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    padding: '1rem',
    height: 'fit-content',
    maxWidth: '100%'
  },
  trackContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    padding: '1.5rem',
  },
  yearHeader: {
    padding: '1rem',
    backgroundColor: 'hsl(var(--muted))',
    color: 'hsl(var(--foreground))',
    fontWeight: 600,
    textAlign: 'center',
    borderRadius: 'var(--radius)',
    fontSize: '1.1rem',
  },
  courseSequence: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '100%',
      width: '2rem',
      height: '2px',
      backgroundColor: 'hsl(var(--border))',
      transform: 'translateY(-50%)',
    },
    '&:last-child::after': {
      display: 'none',
    },
  },
  trackHeader: {
    color: '#000000',
    fontWeight: 600,
    fontSize: '1.125rem',
    display: 'flex',
    alignItems: 'center',
    pl: 2
  },
  trackRow: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(100px, 120px) repeat(4, minmax(120px, 1fr))',
      sm: 'minmax(120px, 150px) repeat(4, minmax(150px, 1fr))'
    },
    gap: { xs: 2, sm: 3 },
    alignItems: 'center',
    borderBottom: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    minWidth: { xs: '800px', md: '100%' }
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'minmax(100px, 120px) repeat(4, minmax(120px, 1fr))',
      sm: 'minmax(120px, 150px) repeat(4, minmax(150px, 1fr))'
    },
    gap: { xs: 2, sm: 3 },
    alignItems: 'center',
    backgroundColor: 'hsl(var(--muted))',
    borderTopLeftRadius: 'var(--radius)',
    borderTopRightRadius: 'var(--radius)',
    borderBottom: '1px solid hsl(var(--border))',
    p: 2,
    minWidth: { xs: '800px', md: '100%' }
  },
  yearCell: {
    color: '#000000',
    fontWeight: 600,
    fontSize: '1.125rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  courseCell: {
    padding: '1rem',
    position: 'relative'
  },
}

// Add hypothetical courses data at the top level
const hypotheticalCourses = {
  history: [
    // Core History Courses
    { id: 'hist-1', name: 'US History', subject: 'history' },
    { id: 'hist-2', name: 'World History', subject: 'history' },
    { id: 'hist-3', name: 'World Cultures', subject: 'history' },
    { id: 'hist-4', name: 'Historical Geography', subject: 'history' },
    // AP History Courses
    { id: 'hist-5', name: 'AP US History', subject: 'history' },
    { id: 'hist-6', name: 'AP European History', subject: 'history' },
    { id: 'hist-7', name: 'AP World History', subject: 'history' },
    { id: 'hist-8', name: 'AP Human Geography', subject: 'history' },
    { id: 'hist-9', name: 'AP African American Studies', subject: 'history' },
    // Additional History Courses
    { id: 'hist-10', name: 'Modern World History', subject: 'history' },
    { id: 'hist-11', name: 'American Government', subject: 'history' },
    { id: 'hist-12', name: 'Civics', subject: 'history' }
  ],
  english: [
    // Core English Courses
    { id: 'eng-1', name: 'English 9', subject: 'english' },
    { id: 'eng-2', name: 'English 10', subject: 'english' },
    { id: 'eng-3', name: 'English 11', subject: 'english' },
    { id: 'eng-4', name: 'English 12', subject: 'english' },
    // AP English Courses
    { id: 'eng-5', name: 'AP English Language', subject: 'english' },
    { id: 'eng-6', name: 'AP English Literature', subject: 'english' },
    { id: 'eng-7', name: 'AP Seminar', subject: 'english' },
    { id: 'eng-8', name: 'AP Research', subject: 'english' },
    // Additional English Courses
    { id: 'eng-9', name: 'Creative Writing', subject: 'english' },
    { id: 'eng-10', name: 'Public Speaking', subject: 'english' },
    { id: 'eng-11', name: 'Journalism', subject: 'english' },
    { id: 'eng-12', name: 'Contemporary Literature', subject: 'english' }
  ],
  math: [
    // Core Math Courses
    { id: 'math-1', name: 'Algebra 1', subject: 'math' },
    { id: 'math-2', name: 'Geometry', subject: 'math' },
    { id: 'math-3', name: 'Algebra 2', subject: 'math' },
    { id: 'math-4', name: 'Pre-Calculus', subject: 'math' },
    // AP Math Courses
    { id: 'math-5', name: 'AP Calculus AB', subject: 'math' },
    { id: 'math-6', name: 'AP Calculus BC', subject: 'math' },
    { id: 'math-7', name: 'AP Precalculus', subject: 'math' },
    // Additional Math Courses
    { id: 'math-8', name: 'Statistics', subject: 'math' },
    { id: 'math-9', name: 'Linear Algebra', subject: 'math' },
    { id: 'math-10', name: 'Data Science', subject: 'math' },
    { id: 'math-11', name: 'Applied Math', subject: 'math' }
  ],
  science: [
    // Core Science Courses
    { id: 'sci-1', name: 'Biology', subject: 'science' },
    { id: 'sci-2', name: 'Chemistry', subject: 'science' },
    { id: 'sci-3', name: 'Physics', subject: 'science' },
    // AP Science Courses
    { id: 'sci-4', name: 'AP Biology', subject: 'science' },
    { id: 'sci-5', name: 'AP Chemistry', subject: 'science' },
    { id: 'sci-6', name: 'AP Physics', subject: 'science' },
    { id: 'sci-7', name: 'AP Environmental Science', subject: 'science' },
    // Additional Science Courses
    { id: 'sci-8', name: 'Earth Science', subject: 'science' },
    { id: 'sci-9', name: 'Astronomy', subject: 'science' },
    { id: 'sci-10', name: 'Environmental Science', subject: 'science' },
    { id: 'sci-11', name: 'Anatomy', subject: 'science' },
    { id: 'sci-12', name: 'Engineering', subject: 'science' },
    { id: 'sci-13', name: 'Applied Science', subject: 'science' }
  ],
  language: [
    // Core Language Courses
    { id: 'lang-1', name: 'Spanish 1', subject: 'language' },
    { id: 'lang-2', name: 'Spanish 2', subject: 'language' },
    { id: 'lang-3', name: 'Spanish 3', subject: 'language' },
    { id: 'lang-4', name: 'Spanish 4', subject: 'language' },
    { id: 'lang-5', name: 'French 1', subject: 'language' },
    { id: 'lang-6', name: 'French 2', subject: 'language' },
    { id: 'lang-7', name: 'French 3', subject: 'language' },
    { id: 'lang-8', name: 'French 4', subject: 'language' },
    // AP Language Courses
    { id: 'lang-9', name: 'AP Spanish Language', subject: 'language' },
    { id: 'lang-10', name: 'AP Spanish Literature', subject: 'language' },
    { id: 'lang-11', name: 'AP French Language', subject: 'language' },
    { id: 'lang-12', name: 'AP German Language', subject: 'language' },
    { id: 'lang-13', name: 'AP Chinese Language', subject: 'language' },
    { id: 'lang-14', name: 'AP Japanese Language', subject: 'language' },
    { id: 'lang-15', name: 'AP Italian Language', subject: 'language' },
    { id: 'lang-16', name: 'AP Latin', subject: 'language' }
  ],
  arts: [
    // Core Arts Courses
    { id: 'art-1', name: 'Studio Art', subject: 'arts' },
    { id: 'art-2', name: 'Digital Design', subject: 'arts' },
    { id: 'art-3', name: 'Photography', subject: 'arts' },
    { id: 'art-4', name: 'Ceramics', subject: 'arts' },
    // AP Arts Courses
    { id: 'art-5', name: 'AP Art History', subject: 'arts' },
    { id: 'art-6', name: 'AP Art and Design 2-D', subject: 'arts' },
    { id: 'art-7', name: 'AP Art and Design 3-D', subject: 'arts' },
    { id: 'art-8', name: 'AP Art and Design Drawing', subject: 'arts' },
    { id: 'art-9', name: 'AP Music Theory', subject: 'arts' },
    // Additional Arts Courses
    { id: 'art-10', name: 'Theater Arts', subject: 'arts' },
    { id: 'art-11', name: 'Dance', subject: 'arts' },
    { id: 'art-12', name: 'Band', subject: 'arts' },
    { id: 'art-13', name: 'Choir', subject: 'arts' }
  ],
  electives: [
    // Core Electives
    { id: 'elec-1', name: 'Psychology', subject: 'electives' },
    { id: 'elec-2', name: 'Economics', subject: 'electives' },
    { id: 'elec-3', name: 'Web Development', subject: 'electives' },
    { id: 'elec-4', name: 'Business', subject: 'electives' },
    // AP Electives
    { id: 'elec-5', name: 'AP Psychology', subject: 'electives' },
    { id: 'elec-6', name: 'AP Computer Science A', subject: 'electives' },
    { id: 'elec-7', name: 'AP Computer Science Principles', subject: 'electives' },
    { id: 'elec-8', name: 'AP Macroeconomics', subject: 'electives' },
    { id: 'elec-9', name: 'AP Microeconomics', subject: 'electives' },
    { id: 'elec-10', name: 'AP US Government', subject: 'electives' },
    { id: 'elec-11', name: 'AP Comparative Government', subject: 'electives' },
    // Additional Electives
    { id: 'elec-12', name: 'Sociology', subject: 'electives' },
    { id: 'elec-13', name: 'Computer Science', subject: 'electives' }
  ]
}

// Create new components for draggable and droppable areas
const DraggableCourse = ({ course, index, color }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.id,
    data: {
      course,
      index,
    },
  })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: color || 'hsl(var(--primary))',
    color: 'white',
    zIndex: isDragging ? 1000 : 1,
  }

  // Prevent click propagation to avoid triggering parent click handlers
  const handleClick = (e) => {
    e.stopPropagation();
  }

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      sx={{
        ...styles.courseBox,
        ...style,
      }}
    >
      {course.name}
    </Box>
  )
}

const DroppableCell = ({ id, children, isValidDropTarget = true, sx = {} }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: !isValidDropTarget,
  })

  // Handle click on empty cells only
  const handleClick = (e) => {
    // Only handle clicks if there are no children (empty cell)
    if (React.Children.count(children) === 0) {
      // Let the click propagate to the parent
    } else {
      // If there are children, prevent the click from propagating
      e.stopPropagation();
    }
  }

  // Special styling for the suggested-courses droppable
  const isSuggestedCoursesBank = id === 'suggested-courses';
  const hoverBgColor = isSuggestedCoursesBank && isOver 
    ? 'hsl(var(--destructive) / 0.1)' 
    : isOver 
      ? 'hsl(var(--accent) / 0.2)' 
      : 'transparent';

  return (
    <Box
      ref={setNodeRef}
      onClick={handleClick}
      sx={{
        backgroundColor: hoverBgColor,
        borderRadius: 'var(--radius)',
        padding: '0.5rem',
        minHeight: '70px',
        transition: 'background-color 0.2s',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

const FourYearPlan = () => {
  const [selectedSubject, setSelectedSubject] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseSubject, setNewCourseSubject] = useState('')
  const [coursePositions, setCoursePositions] = useState({})
  const [usedCourseIds, setUsedCourseIds] = useState(new Set())
  const [activeId, setActiveId] = useState(null)
  const [activeSubject, setActiveSubject] = useState(null)
  const [activeColor, setActiveColor] = useState(null)
  const [hypotheticalCoursesList, setHypotheticalCoursesList] = useState(hypotheticalCourses)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [selectedStudent, setSelectedStudent] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('selectedStudent')
    return saved ? JSON.parse(saved) : null
  })

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        if (!isConnected) {
          console.log('Database connection issue detected');
          // Only show a snackbar for critical connection issues
          if (selectedStudent) {
            setSnackbar({
              open: true,
              message: 'Unable to connect to the database. Your changes may not be saved.',
              severity: 'warning'
            });
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setConnectionStatus('error');
      }
    };
    
    checkConnection();
    
    // Also check connection when the window comes back online
    const handleOnline = () => {
      console.log('Browser reports online status, checking connection');
      checkConnection();
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [selectedStudent]);

  // Function to silently retry connection
  const retryConnection = async () => {
    try {
      setConnectionStatus('checking');
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected && selectedStudent) {
        // Reload the plan if we have a selected student
        loadSavedPlan(selectedStudent);
      }
    } catch (error) {
      console.error('Error retrying connection:', error);
      setConnectionStatus('error');
    }
  };

  // Add useEffect to listen for student changes
  useEffect(() => {
    const handleStudentChange = (event) => {
      setSelectedStudent(event.detail)
      // Reset state when student changes
      setCoursePositions({})
      setUsedCourseIds(new Set())
      // Reload plan for new student
      loadSavedPlan(event.detail)
    }

    window.addEventListener('studentChanged', handleStudentChange)
    return () => window.removeEventListener('studentChanged', handleStudentChange)
  }, [])

  // Load saved plan on component mount or when student changes
  useEffect(() => {
    if (selectedStudent) {
      loadSavedPlan(selectedStudent)
    }
  }, [selectedStudent])

  // Add useEffect to automatically save when coursePositions changes
  useEffect(() => {
    // Don't save during initial load
    if (loading) return
    
    // Don't save if coursePositions is empty (initial state)
    if (Object.keys(coursePositions).length === 0) return
    
    // Don't save if no student is selected
    if (!selectedStudent) return
    
    // Use a debounce to prevent too many saves
    const saveTimeout = setTimeout(() => {
      console.log('Auto-saving plan after coursePositions change');
      savePlan();
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [coursePositions, selectedStudent, loading]);

  // Modify loadSavedPlan function to add more logging
  const loadSavedPlan = async (student = selectedStudent) => {
    try {
      if (!student) {
        console.log('No student selected, skipping load')
        setLoading(false)
        return
      }

      console.log('Loading plan for student:', student)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        setSnackbar({
          open: true,
          message: 'Please log in to load your plan',
          severity: 'warning'
        })
        setLoading(false)
        return
      }

      console.log('Fetching plan from Supabase...')
      
      // Add explicit headers to the request
      const { data: plan, error } = await supabase
        .from('four_year_plans')
        .select('*')
        .eq('student_id', student.id)
        .maybeSingle()
        .throwOnError()

      console.log('Query response:', { data: plan, error })

      if (error) {
        console.error('Error fetching plan:', error)
        // Initialize with empty state
        setCoursePositions({})
        setUsedCourseIds(new Set())
        setLoading(false)
        
        if (error.code === 'PGRST116') {
          console.log('No existing plan found for student')
          return
        }
        
        throw error
      }

      if (!plan) {
        console.log('No plan found, initializing empty state')
        setCoursePositions({})
        setUsedCourseIds(new Set())
        setLoading(false)
        return
      }

      console.log('Retrieved plan:', plan)
      if (plan.course_positions) {
        // Ensure course_positions is an object, not a string
        let positions = plan.course_positions;
        if (typeof positions === 'string') {
          try {
            positions = JSON.parse(positions);
          } catch (e) {
            console.error('Error parsing course positions:', e);
            positions = {};
          }
        }
        
        console.log('Setting course positions:', positions)
        setCoursePositions(positions)
        
        // Reconstruct used course IDs from the loaded positions
        const usedIds = new Set()
        Object.entries(positions).forEach(([positionId, courses]) => {
          if (Array.isArray(courses)) {
            courses.forEach(course => {
              if (course && course.id) usedIds.add(course.id)
            })
          }
        })
        
        console.log('Setting used course IDs:', Array.from(usedIds))
        setUsedCourseIds(usedIds)
      } else {
        // Initialize with empty state if no plan or course positions
        console.log('No course positions found in plan')
        setCoursePositions({})
        setUsedCourseIds(new Set())
      }
    } catch (error) {
      console.error('Error loading plan:', error)
      setSnackbar({
        open: true,
        message: 'Error loading your plan: ' + (error.message || 'Unknown error'),
        severity: 'error'
      })
      // Initialize with empty state on error
      setCoursePositions({})
      setUsedCourseIds(new Set())
    } finally {
      setLoading(false)
    }
  }

  // Modify savePlan function to add more logging
  const savePlan = async () => {
    try {
      if (!selectedStudent) {
        console.log('No student selected, cannot save')
        setSnackbar({
          open: true,
          message: 'Please select a student first',
          severity: 'warning'
        })
        return
      }

      // Don't save if coursePositions is empty
      if (Object.keys(coursePositions).length === 0) {
        console.log('No courses to save, skipping save operation')
        return
      }

      console.log('Saving plan for student:', selectedStudent)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        setSnackbar({
          open: true,
          message: 'Please log in to save your plan',
          severity: 'warning'
        })
        return
      }

      // Clean up the coursePositions object before saving
      // Remove any empty arrays or invalid entries
      const cleanedPositions = Object.entries(coursePositions).reduce((acc, [key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          // Filter out any invalid course entries
          const validCourses = value.filter(course => course && course.id && course.name && course.subject);
          if (validCourses.length > 0) {
            acc[key] = validCourses;
          }
        }
        return acc;
      }, {});

      console.log('Saving to Supabase:', {
        user_id: user.id,
        student_id: selectedStudent.id,
        course_positions: cleanedPositions
      })

      // First check if a plan already exists
      const { data: existingPlan, error: checkError } = await supabase
        .from('four_year_plans')
        .select('id')
        .eq('student_id', selectedStudent.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing plan:', checkError);
        throw checkError;
      }

      let result;
      if (existingPlan) {
        // Update existing plan
        console.log('Updating existing plan with ID:', existingPlan.id);
        result = await supabase
          .from('four_year_plans')
          .update({
            user_id: user.id,
            course_positions: cleanedPositions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPlan.id)
          .select();
      } else {
        // Insert new plan
        console.log('Creating new plan for student:', selectedStudent.id);
        result = await supabase
          .from('four_year_plans')
          .insert({
            user_id: user.id,
            student_id: selectedStudent.id,
            course_positions: cleanedPositions,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error('Error saving plan:', error);
        throw error;
      }

      console.log('Plan saved successfully:', data)
      setSnackbar({
        open: true,
        message: 'Plan saved successfully',
        severity: 'success'
      })

    } catch (error) {
      console.error('Error saving plan:', error)
      setSnackbar({
        open: true,
        message: 'Error saving your plan: ' + (error.message || 'Unknown error'),
        severity: 'error'
      })
    }
  }

  const subjects = [
    {
      key: 'history',
      name: 'History/Social Science',
      icon: PublicIcon,
      color: 'hsl(45, 80%, 45%)',
      courses: {
        1: 'US History',
        2: 'World History',
      },
    },
    {
      key: 'english',
      name: 'English',
      icon: MenuBookIcon,
      color: 'hsl(280, 80%, 45%)',
      courses: {
        1: '1 year HS course / 1\nsemester college course',
        2: '1 year HS course / 1\nsemester college course',
        3: '1 year HS course / 1\nsemester college course',
        4: '1 year HS course / 1\nsemester college course',
      },
    },
    {
      key: 'math',
      name: 'Mathematics',
      icon: CalculateIcon,
      color: 'hsl(215, 80%, 50%)',
      courses: {
        1: 'Algebra 1',
        2: 'Geometry',
        3: 'Algebra 2',
        4: 'Pre-Calculus',
      },
    },
    {
      key: 'science',
      name: 'Laboratory Science',
      icon: ScienceIcon,
      color: 'hsl(120, 80%, 30%)',
      courses: {
        1: 'Biology',
        2: 'Chemistry',
        3: 'Physics',
        4: 'AP Science',
      },
    },
    {
      key: 'language',
      name: 'Language other than English',
      icon: LanguageIcon,
      color: 'hsl(340, 80%, 45%)',
      courses: {
        1: 'Language 1',
        2: 'Language 2',
        3: 'Language 3',
        4: 'Language 4',
      },
    },
    {
      key: 'arts',
      name: 'Visual & Performing Arts',
      icon: PaletteIcon,
      color: 'hsl(160, 80%, 30%)',
      courses: {
        1: 'Art 1',
        2: 'Art 2',
        3: 'Advanced Art',
        4: 'AP Art',
      },
    },
    {
      key: 'electives',
      name: 'College-Prep Electives',
      icon: SchoolIcon,
      color: 'hsl(280, 70%, 35%)',
      courses: {
        1: 'Psychology',
        2: 'Sociology',
        3: 'Computer Science',
        4: 'Statistics',
      },
    },
  ]

  const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

  const handleCreateCourse = () => {
    if (newCourseName && newCourseSubject) {
      const subject = subjects.find((s) => s.key === newCourseSubject)
      const newCourse = {
        id: `custom-${Date.now()}`,
        name: newCourseName,
        subject: newCourseSubject,
      }

      // Add the new course to hypotheticalCourses
      setHypotheticalCoursesList((prev) => ({
        ...prev,
        [newCourseSubject]: [...prev[newCourseSubject], newCourse],
      }))

      // Select the subject to show the new course
      setSelectedSubject(newCourseSubject)

      // Reset form
      setNewCourseName('')
      setNewCourseSubject('')
      setShowCreateForm(false)
    }
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    // Set active subject based on the dragged item
    if (event.active.data.current?.course) {
      setActiveSubject(event.active.data.current.course.subject)
      // Store the color from the subject
      const subjectColor = subjects.find((s) => s.key === event.active.data.current.course.subject)?.color
      setActiveColor(subjectColor)
    } else {
      // For items already in the grid
      const coursePosition = Object.entries(coursePositions).find(([positionId, courses]) => {
        return Array.isArray(courses) && courses.some(course => course.id === event.active.id)
      })
      
      if (coursePosition) {
        const [positionId, coursesArray] = coursePosition
        const course = coursesArray.find(c => c.id === event.active.id)
        if (course) {
          setActiveSubject(course.subject)
          // Get color for positioned course
          const subjectColor = subjects.find((s) => s.key === course.subject)?.color
          setActiveColor(subjectColor)
        }
      }
    }
  }

  const handleDragEnd = async (event) => {
    setActiveId(null)
    setActiveSubject(null)
    setActiveColor(null)

    const { active, over } = event
    if (!over) return

    // Handle dropping back to suggestions area
    if (over.id === 'suggested-courses') {
      // Find the course in the coursePositions
      const courseToRemove = Object.entries(coursePositions).find(([positionId, courses]) => {
        return Array.isArray(courses) && courses.some(course => course.id === active.id)
      })

      if (courseToRemove) {
        const [positionId, courses] = courseToRemove
        // Remove the specific course from the array
        const newPositions = { ...coursePositions }
        newPositions[positionId] = courses.filter(course => course.id !== active.id)
        
        // If the array is empty, remove the key entirely
        if (newPositions[positionId].length === 0) {
          delete newPositions[positionId]
        }
        
        setCoursePositions(newPositions)

        // Remove from used courses
        setUsedCourseIds((prev) => {
          const next = new Set(prev)
          next.delete(active.id)
          return next
        })

        // Save changes
        await savePlan()
      }
      return
    }

    // Handle dropping a suggested course into a year slot
    if (typeof over.id === 'string' && over.id.includes('-')) {
      const [targetSubject, targetYear] = over.id.split('-')

      // First, check if this is a course being moved from one position to another
      const sourcePosition = Object.entries(coursePositions).find(([positionId, courses]) => {
        return Array.isArray(courses) && courses.some(course => course.id === active.id)
      })

      if (sourcePosition) {
        // This is a course being moved from one position to another
        const [sourcePositionId, sourceCourses] = sourcePosition
        
        // Don't do anything if dropping to the same position
        if (sourcePositionId === over.id) return
        
        // Get the course being moved
        const courseToMove = sourceCourses.find(course => course.id === active.id)
        
        if (courseToMove && courseToMove.subject === targetSubject) {
          // Create new positions object
          const newPositions = { ...coursePositions }
          
          // Remove course from source position
          newPositions[sourcePositionId] = sourceCourses.filter(course => course.id !== active.id)
          
          // If the source array is now empty, remove it
          if (newPositions[sourcePositionId].length === 0) {
            delete newPositions[sourcePositionId]
          }
          
          // Add course to target position
          if (!newPositions[over.id]) {
            newPositions[over.id] = []
          }
          
          // Add the course to the target position
          newPositions[over.id] = [...newPositions[over.id], courseToMove]
          
          // Update state
          setCoursePositions(newPositions)
          
          // Save changes
          await savePlan()
        }
      } else if (targetSubject === selectedSubject) {
        // This is a new course being added from the suggestions
        const droppedCourse = hypotheticalCoursesList[selectedSubject].find((course) => course.id === active.id)

        if (droppedCourse) {
          const newPositions = { ...coursePositions }
          // Initialize array if it doesn't exist
          if (!newPositions[over.id]) {
            newPositions[over.id] = []
          }
          // Add the new course to the array
          newPositions[over.id] = [...newPositions[over.id], {
            id: droppedCourse.id,
            name: droppedCourse.name,
            subject: droppedCourse.subject,
          }]
          
          setCoursePositions(newPositions)
          setUsedCourseIds((prev) => new Set([...prev, droppedCourse.id]))

          // Save changes
          await savePlan()
        }
      }
    }
  }

  // Filter out used courses from suggestions
  const getAvailableSuggestedCourses = () => {
    if (!selectedSubject) return []
    return hypotheticalCoursesList[selectedSubject].filter((course) => !usedCourseIds.has(course.id))
  }

  // Add close handler for snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <Box sx={{ 
        height: '100%',
        width: '100%',
        overflow: 'auto'
      }}>
        {!selectedStudent ? (
          <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ color: 'hsl(var(--muted-foreground))' }}>
              Please select a student from the navigation bar to view their 4-year plan.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            height: { xs: 'auto', md: '100%' },
            width: '100%',
            minHeight: { xs: 'auto', md: '600px' },
            position: 'relative',
            gap: { xs: 2, md: 0 }
          }}>
            {/* Left Sidebar - Course Selection */}
            <Box sx={{ 
              width: { xs: '100%', md: '300px' },
              flexShrink: 0,
              backgroundColor: 'white',
              borderRadius: { 
                xs: '8px', 
                md: '8px 0 0 8px' 
              },
              border: '1px solid hsl(var(--border))',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              mb: { xs: 2, md: 0 }
            }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))'
              }}>
                <Typography sx={{ 
                  color: '#000000',
                  fontWeight: 600,
                  fontSize: '1.125rem'
                }}>
                  Course Selection
                </Typography>
              </Box>
              <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                <Stack spacing={3}>
                  {selectedSubject ? (
                    <Box
                      sx={{
                        backgroundColor: subjects.find(s => s.key === selectedSubject)?.color || '#2563EB',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      {subjects.find(s => s.key === selectedSubject)?.name || 'Selected Subject'}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      Click "Add Course" to select a subject
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    sx={{
                      backgroundColor: selectedSubject 
                        ? subjects.find(s => s.key === selectedSubject)?.color || '#2563EB'
                        : '#2563EB',
                      color: 'white',
                      height: 36,
                      '&:hover': {
                        backgroundColor: selectedSubject 
                          ? subjects.find(s => s.key === selectedSubject)?.color || '#2563EB'
                          : '#2563EB',
                        filter: 'brightness(85%)',
                        boxShadow: 'none'
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none'
                    }}
                  >
                    {showCreateForm ? 'Cancel' : 'Create Your Own Course'}
                  </Button>

                  {showCreateForm && (
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        backgroundColor: 'hsl(var(--background))',
                      }}
                    >
                      <Stack spacing={2}>
                        <TextField
                          placeholder="Course Name"
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <Select
                          value={newCourseSubject}
                          onChange={(e) => setNewCourseSubject(e.target.value)}
                          displayEmpty
                          size="small"
                          sx={{ backgroundColor: 'hsl(var(--background))' }}
                        >
                          <MenuItem value="" disabled>
                            Select Subject
                          </MenuItem>
                          {subjects.map((subject) => (
                            <MenuItem key={subject.key} value={subject.key}>
                              {subject.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <Button
                          variant="contained"
                          onClick={handleCreateCourse}
                          disabled={!newCourseName || !newCourseSubject}
                          sx={{
                            backgroundColor: '#2563EB',
                            color: 'white',
                            height: 36,
                            '&:hover': {
                              backgroundColor: '#2563EB',
                              filter: 'brightness(85%)',
                              boxShadow: 'none'
                            },
                            transition: 'none',
                            boxShadow: 'none',
                            textTransform: 'none'
                          }}
                        >
                          Save Course
                        </Button>
                      </Stack>
                    </Box>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2, fontWeight: 500 }}>Suggested Courses Bank</Box>
                    <DroppableCell
                      id="suggested-courses"
                      isValidDropTarget={true}
                      sx={{
                        border: '2px dashed hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        minHeight: '200px',
                        backgroundColor: 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {selectedSubject && (
                        <Stack spacing={2}>
                          {getAvailableSuggestedCourses().length > 0 ? (
                            getAvailableSuggestedCourses().map((course, index) => {
                              const subjectColor = subjects.find((s) => s.key === course.subject).color
                              return <DraggableCourse key={course.id} course={course} index={index} color={subjectColor} />
                            })
                          ) : (
                            <Box sx={{ color: 'hsl(var(--muted-foreground))', textAlign: 'center', py: 2 }}>
                              No available courses for this subject. Drag courses from the plan back here to make them available again.
                            </Box>
                          )}
                        </Stack>
                      )}
                      {!selectedSubject && (
                        <Box sx={{ color: 'hsl(var(--muted-foreground))', textAlign: 'center', py: 2 }}>
                          Drag courses from the plan back here to remove them from your schedule
                        </Box>
                      )}
                    </DroppableCell>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Right Content Area - 4 Year Plan Grid */}
            <Box sx={{ 
              flex: 1,
              backgroundColor: 'white',
              borderRadius: { 
                xs: '8px', 
                md: '0 8px 8px 0' 
              },
              border: '1px solid hsl(var(--border))',
              borderLeft: { xs: '1px solid hsl(var(--border))', md: 'none' },
              height: { xs: 'auto', md: '100%' },
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header Row */}
              <Box sx={{
                p: 2,
                borderBottom: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))',
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(80px, 100px) repeat(4, minmax(80px, 1fr))',
                  sm: 'minmax(100px, 120px) repeat(4, minmax(100px, 1fr))',
                  md: 'minmax(120px, 150px) repeat(4, minmax(120px, 1fr))'
                },
                gap: { xs: 1, sm: 2, md: 3 }
              }}>
                <Typography sx={{ 
                  color: '#000000',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  pl: 2
                }}>
                  Subject
                </Typography>
                {years.map((year) => (
                  <Typography key={year} sx={{ 
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {year}
                  </Typography>
                ))}
              </Box>

              {/* Subject Rows - Scrollable Container */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto',
                p: { xs: 1, sm: 2, md: 3 }
              }}>
                <Box sx={{ 
                  minWidth: '100%'
                }}>
                  {subjects.map((subject) => (
                    <Box key={subject.key} sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'minmax(80px, 100px) repeat(4, minmax(80px, 1fr))',
                        sm: 'minmax(100px, 120px) repeat(4, minmax(100px, 1fr))',
                        md: 'minmax(120px, 150px) repeat(4, minmax(120px, 1fr))'
                      },
                      gap: { xs: 1, sm: 2, md: 3 },
                      alignItems: 'center',
                      borderBottom: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--background))',
                      mb: { xs: 2, md: 3 },
                      pb: { xs: 2, md: 3 }
                    }}>
                      <Box sx={{ 
                        color: 'hsl(var(--foreground))',
                        fontWeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        pl: 2
                      }}>{subject.name}</Box>
                      {years.map((year, index) => {
                        const courseId = `${subject.key}-${index + 1}`
                        const coursesInCell = coursePositions[courseId] || []
                        const isValidDropTarget = !activeId || activeSubject === subject.key

                        return (
                          <Box key={year} sx={{ padding: 1 }}>
                            <DroppableCell id={courseId} isValidDropTarget={isValidDropTarget}>
                              {coursesInCell.length > 0 ? (
                                coursesInCell.map((course, idx) => (
                                  <DraggableCourse
                                    key={course.id}
                                    course={course}
                                    index={idx}
                                    color={subject.color}
                                  />
                                ))
                              ) : (
                                <Box
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubject(subject.key);
                                  }}
                                  sx={{
                                    ...styles.courseBox,
                                    ...styles.emptyBox,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: 'hsl(var(--muted))',
                                      borderColor: 'hsl(var(--brand-primary))',
                                      color: 'hsl(var(--foreground))',
                                    },
                                  }}
                                >
                                  Add Course
                                </Box>
                              )}
                            </DroppableCell>
                          </Box>
                        )
                      })}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && (
            <Box
              sx={{
                ...styles.courseBox,
                backgroundColor: activeColor || 'hsl(var(--primary))',
                border: '1px solid hsl(var(--border))',
                width: '100%',
                color: 'white',
                cursor: 'grabbing',
              }}
            >
              {(() => {
                // First check if it's a course from the suggestions
                if (selectedSubject) {
                  const suggestedCourse = hypotheticalCoursesList[selectedSubject]?.find(
                    (course) => course.id === activeId
                  );
                  if (suggestedCourse) return suggestedCourse.name;
                }
                
                // Then check if it's a course already in the grid
                for (const [positionId, courses] of Object.entries(coursePositions)) {
                  if (Array.isArray(courses)) {
                    const course = courses.find(c => c.id === activeId);
                    if (course) return course.name;
                  }
                }
                
                // Fallback
                return activeId;
              })()}
            </Box>
          )}
        </DragOverlay>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DndContext>
  )
}

export default FourYearPlan
