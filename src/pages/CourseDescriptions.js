import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../utils/AuthContext'
import OpenAI from 'openai'
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer'
import Modal from 'react-modal'
import { toast } from 'react-toastify'
import { savePDFToStorage } from '../utils/pdfStorage'
import { supabase } from '../utils/supabaseClient'
import {
  Box,
  Container,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { theme } from '../theme/theme'
import { getCurrentAcademicYear } from '../utils/academicUtils'
import { CourseDescriptionService } from '../services/CourseDescriptionService'
import { DescriptiveText } from '../components/ui/typography'
import { useNavigate } from 'react-router-dom'
import { debounce } from 'lodash'

// Set up Modal
Modal.setAppElement('#root')

// Initialize OpenAI client with error handling
let openai;
try {
  if (process.env.REACT_APP_OPENAI_API_KEY && process.env.REACT_APP_OPENAI_API_KEY !== 'DISABLED_FOR_CONTRACTORS') {
    openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

// Define default form data structure
const defaultDescriptions = {
  preHighSchool: [],
  '9thCourses': [],
  '10thCourses': [],
  '11thCourses': [],
  '12thCourses': [],
}

const CourseDescriptions = () => {
  const { user } = useAuth()
  const saveTimeoutRef = useRef(null)
  const navigate = useNavigate()

  // Add missing state definitions
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState('9thCourses')
  const [descriptions, setDescriptions] = useState(defaultDescriptions)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(new Date().toLocaleTimeString())
  const [dataStatus, setDataStatus] = useState('Data saved')
  const [userCourses, setUserCourses] = useState({})
  const [currentGrade, setCurrentGrade] = useState('10')
  const currentYear = getCurrentAcademicYear()
  const [coursesLoaded, setCoursesLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(() => {
    const saved = localStorage.getItem('selectedStudent')
    return saved ? JSON.parse(saved) : null
  })

  // Listen for student changes from Navbar
  useEffect(() => {
    const handleStudentChange = (event) => {
      console.log('Student changed in CourseDescriptions:', event.detail)
      setSelectedStudent(event.detail)
      // Reset descriptions to default state
      setDescriptions(defaultDescriptions)
      // Reset loading state
      setLoading(true)
      // Reset error state
      setError(null)
      // Reset data status
      setDataStatus('Loading data...')
    }

    window.addEventListener('studentChanged', handleStudentChange)
    return () => window.removeEventListener('studentChanged', handleStudentChange)
  }, [])

  // Fetch data when selected student changes
  useEffect(() => {
    if (user?.id && selectedStudent?.id) {
      console.log('Fetching data for student:', selectedStudent.id)
      fetchContext()
    }
  }, [user?.id, selectedStudent?.id])

  // Set up listeners for course changes
  useEffect(() => {
    if (!selectedStudent?.id) return
    
    console.log('Setting up listeners for course changes')
    
    // Listen for changes to youredu_courses
    const youreduCoursesChannel = supabase
      .channel('youredu_courses_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'youredu_courses',
          filter: `student_id=eq.${selectedStudent.id}`
        },
        async (payload) => {
          console.log('youredu_courses changed:', payload)
          // Reload course descriptions
          await loadCourseDescriptions()
        }
      )
      .subscribe()
      
    // Listen for changes to user_courses
    const userCoursesChannel = supabase
      .channel('user_courses_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_courses',
          filter: `student_id=eq.${selectedStudent.id}`
        },
        async (payload) => {
          console.log('user_courses changed:', payload)
          // Reload course descriptions
          await loadCourseDescriptions()
        }
      )
      .subscribe()
      
    return () => {
      // Clean up subscriptions
      supabase.removeChannel(youreduCoursesChannel)
      supabase.removeChannel(userCoursesChannel)
    }
  }, [selectedStudent?.id])

  const analyzeCourses = ({ transcriptData, youreduCourses, userCourses, existingDescriptions }) => {
    console.log('Starting course analysis with:', {
      transcriptData,
      youreduCourses: youreduCourses?.length,
      userCourses: userCourses?.length,
      existingDescriptions
    })

    // Initialize with existing descriptions or empty arrays
    const coursesByGrade = {
      preHighSchool: existingDescriptions?.preHighSchool || [],
      '9thCourses': existingDescriptions?.['9thCourses'] || [],
      '10thCourses': existingDescriptions?.['10thCourses'] || [],
      '11thCourses': existingDescriptions?.['11thCourses'] || [],
      '12thCourses': existingDescriptions?.['12thCourses'] || []
    }

    // If we have existing descriptions, don't overwrite them
    if (existingDescriptions) {
      return coursesByGrade
    }

    // Combine all courses
    const allCourses = [
      ...(userCourses || []),
      ...(youreduCourses || [])
    ]

    // Get current year and calculate academic years based on student's grade level
    const currentYear = new Date().getFullYear()
    const studentGradeLevel = parseInt(selectedStudent?.grade_level || '9')
    const freshmanYear = currentYear - (studentGradeLevel - 9)

    // Map courses to appropriate grade levels
    allCourses.forEach(course => {
      const courseYear = course.year
      if (!courseYear) return

      const yearDiff = courseYear - freshmanYear
      let gradeLevel

      if (yearDiff === 0) gradeLevel = '9thCourses'
      else if (yearDiff === 1) gradeLevel = '10thCourses'
      else if (yearDiff === 2) gradeLevel = '11thCourses'
      else if (yearDiff === 3) gradeLevel = '12thCourses'
      else if (yearDiff < 0) gradeLevel = 'preHighSchool'

      if (gradeLevel) {
        // Check if course already exists in the grade level
        const courseExists = coursesByGrade[gradeLevel].some(
          existingCourse => existingCourse.courseTitle === course.title
        )

        if (!courseExists) {
          coursesByGrade[gradeLevel].push({
            courseTitle: course.title,
            method: course.instruction_method || '',
            textbook: course.textbooks?.join(', ') || '',
            materials: course.materials?.join(', ') || '',
            assignments: course.evaluation_method || '',
            goals: course.description || '',
            aiDescription: ''
          })
        }
      }
    })

    return coursesByGrade
  }

  const fetchContext = async () => {
    if (!selectedStudent) {
      console.log('No student selected, skipping fetch')
      setLoading(false)
      return
    }

    try {
      console.log('Starting fetchContext for student:', selectedStudent.id)
      setLoading(true)
      setError(null)

      // Get course descriptions
      console.log('Fetching course descriptions...')
      const courseDescriptions = await CourseDescriptionService.getCourseDescriptions(selectedStudent.id)
      console.log('Fetched course descriptions:', courseDescriptions)

      // Get courses from both tables
      console.log('Fetching YourEDU courses...')
      const { data: youreduCourses, error: youreduError } = await supabase
        .from('youredu_courses')
        .select('*')
        .eq('student_id', selectedStudent.id)

      if (youreduError) {
        console.error('Error fetching YourEDU courses:', youreduError)
        throw youreduError
      }
      console.log('Fetched YourEDU courses:', youreduCourses?.length)

      console.log('Fetching user courses...')
      const { data: userCoursesData, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('student_id', selectedStudent.id)

      if (userCoursesError) {
        console.error('Error fetching user courses:', userCoursesError)
        throw userCoursesError
      }
      console.log('Fetched user courses:', userCoursesData)

      // Transform courses to ensure consistent format
      const transformedYoureduCourses = (youreduCourses || []).map(course => ({
        ...course,
        title: course.title || '',
        instruction_method: course.instruction_method || 'Traditional',
        textbooks: course.textbooks || [],
        evaluation_method: course.evaluation_method || '',
        description: course.description || '',
        year: course.year || new Date().getFullYear(),
        is_youredu_course: true
      }))

      const transformedUserCourses = (userCoursesData || []).map(course => ({
        ...course,
        title: course.title || '',
        instruction_method: course.instruction_method || 'Traditional',
        textbooks: course.textbooks || [],
        evaluation_method: course.evaluation_method || '',
        description: course.description || '',
        year: course.year || new Date().getFullYear(),
        is_youredu_course: false
      }))

      // Process and merge the data
      const processedData = analyzeCourses({
        transcriptData: null,
        youreduCourses: transformedYoureduCourses,
        userCourses: transformedUserCourses,
        existingDescriptions: courseDescriptions
      })

      // Check if we need to update the course descriptions
      const totalCourses = transformedYoureduCourses.length + transformedUserCourses.length
      const existingCourseCount = Object.values(courseDescriptions || {})
        .reduce((sum, arr) => sum + (arr?.length || 0), 0)

      if (totalCourses > existingCourseCount) {
        console.log('New courses detected, updating course descriptions')
        // Process without existing descriptions to get new courses
        const newData = analyzeCourses({
          transcriptData: null,
          youreduCourses: transformedYoureduCourses,
          userCourses: transformedUserCourses,
          existingDescriptions: null
        })

        // Merge new courses with existing descriptions
        Object.keys(newData).forEach(gradeLevel => {
          newData[gradeLevel].forEach(newCourse => {
            const existingCourses = processedData[gradeLevel] || []
            const courseExists = existingCourses.some(
              existingCourse => existingCourse.courseTitle === newCourse.courseTitle
            )

            if (!courseExists) {
              if (!processedData[gradeLevel]) {
                processedData[gradeLevel] = []
              }
              processedData[gradeLevel].push(newCourse)
            }
          })
        })

        // Save the updated descriptions
        await CourseDescriptionService.saveCourseDescriptions(selectedStudent.id, processedData)
      }

      console.log('Setting processed data to state')
      setDescriptions(processedData)
      setDataStatus('Data loaded and synced with courses')

      return processedData
    } catch (err) {
      console.error('Error fetching context:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student first')
      return
    }

    try {
      await CourseDescriptionService.saveCourseDescriptions(selectedStudent.id, descriptions)
    } catch (err) {
      console.error('Error saving descriptions:', err)
      toast.error('Failed to save course descriptions')
    }
  }

  const debouncedSave = useCallback(
    debounce((descriptionsToSave) => {
      if (!selectedStudent?.id) return;
      
      console.log('Starting debounced save');
      setDataStatus('Saving...');
      setSaving(true);
      
      CourseDescriptionService.saveCourseDescriptions(selectedStudent.id, descriptionsToSave)
        .then(() => {
          setDataStatus('Saved');
          setLastSaveTime(new Date().toLocaleTimeString());
          setSaving(false);
          console.log('Debounced save completed successfully');
        })
        .catch((error) => {
          console.error('Error in debounced save:', error);
          setDataStatus('Error saving');
          setSaving(false);
          setError('Failed to save course descriptions');
        });
    }, 2000),
    [selectedStudent?.id]
  );

  const handleDescriptionChange = (e, grade, index) => {
    const { name, value, currentValues } = e.target;
    
    // Update descriptions without triggering a re-render
    const newDescriptions = JSON.parse(JSON.stringify(descriptions)); // Deep clone
    
    if (newDescriptions[grade] && newDescriptions[grade][index]) {
      if (currentValues) {
        // If we have all current values, use them to update all fields at once
        newDescriptions[grade][index] = {
          ...newDescriptions[grade][index],
          ...currentValues, // Merge all current values
          source_type: 'manual',
          is_pulled_in: false
        };
      } else {
        // Otherwise just update the specific field
        newDescriptions[grade][index] = {
          ...newDescriptions[grade][index],
          [name]: value,
          source_type: 'manual',
          is_pulled_in: false
        };
      }
    }
    
    // Update state with the new descriptions
    setDescriptions(newDescriptions);
    
    // Trigger debounced save
    debouncedSave(newDescriptions);
  };

  // Add sorting function for courses
  const sortCourses = (courses) => {
    return [...courses].sort((a, b) => {
      // Sort by is_pulled_in first (true comes before false)
      if (a.is_pulled_in && !b.is_pulled_in) return -1;
      if (!a.is_pulled_in && b.is_pulled_in) return 1;
      return 0;
    });
  };

  // Add addNewCourse function
  const addNewCourse = useCallback((grade) => {
    console.log('Adding new course to grade:', grade);
    
    setDescriptions(prevDescriptions => {
      const updatedDescriptions = {
        ...prevDescriptions,
        [grade]: [
          ...(prevDescriptions[grade] || []),
          {
            courseTitle: '',
            method: '',
            textbook: '',
            materials: '',
            assignments: '',
            goals: '',
            source_type: 'manual',
            is_pulled_in: false
          }
        ]
      };
      
      // Save the new course
      debouncedSave(updatedDescriptions);
      
      return updatedDescriptions;
    });
  }, [debouncedSave, selectedStudent.id]);

  // Add removeCourse function
  const removeCourse = useCallback((grade, index) => {
    console.log('Removing course:', { grade, index });
    
    setDescriptions(prevDescriptions => {
      const updatedDescriptions = {
        ...prevDescriptions,
        [grade]: prevDescriptions[grade].filter((_, i) => i !== index)
      };
      
      // Save after removal
      debouncedSave(updatedDescriptions);
      
      return updatedDescriptions;
    });
  }, [debouncedSave, selectedStudent.id]);

  const generateAIDescription = async (grade, index) => {
    if (!openai) {
      toast.error('AI functionality is disabled in the contractor version');
      return;
    }
    const course = descriptions[grade][index]
    const context = await fetchContext()
    const prompt = `${context}\nCreate a concise, one-paragraph course description for the following course:\nCourse Title: ${course.courseTitle}\nTextbook and Materials Used: ${course.textbook}\nMajor Assignments: ${course.assignments}\nLearning Goals Achieved: ${course.goals}`

    try {
      const response = await openai.chat.completions.create({
        model: 'ft:gpt-4o-mini-2024-07-18:personal:course-descriptions:AHEWZXxq',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      })

      const updatedDescriptions = { ...descriptions }
      updatedDescriptions[grade][index].aiDescription = response.choices[0].message.content.trim()
      setDescriptions(updatedDescriptions)
      console.log(`Generated AI description for ${grade}, course ${index}:`, updatedDescriptions[grade][index])

      debouncedSave(updatedDescriptions)
      debouncedSave(selectedStudent.id, updatedDescriptions)
    } catch (error) {
      console.error('Error generating AI description:', error)
    }
  }

  const CourseDescriptionsPDF = ({ descriptions = defaultDescriptions }) => {
    const studentName = 'Student Name'

    // Create Table of Contents
    const renderTableOfContents = () => (
      <View
        style={{
          marginBottom: 20,
          border: 1,
          borderColor: 'black',
          borderRadius: 8,
          padding: 10,
        }}
      >
        <Text style={{ fontSize: 14, textAlign: 'left', marginBottom: 10 }}>Table of Contents</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* Left Column - 9th and 10th */}
          <View style={{ flex: 1 }}>
            {['9thCourses', '10thCourses'].map((grade) => (
              <View key={grade} style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 14 }}>{`${grade.replace('Courses', ' Grade')}`}</Text>
                {descriptions[grade]?.map((course, index) => (
                  <Text
                    key={index}
                    style={{
                      marginLeft: 10,
                      fontSize: 11,
                      fontWeight: 'normal',
                    }}
                  >
                    {course.courseTitle || 'Course Title Not Provided'}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          {/* Right Column - 11th and 12th */}
          <View style={{ flex: 1 }}>
            {['11thCourses', '12thCourses'].map((grade) => (
              <View key={grade} style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 14 }}>{`${grade.replace('Courses', ' Grade')}`}</Text>
                {descriptions[grade]?.map((course, index) => (
                  <Text
                    key={index}
                    style={{
                      marginLeft: 10,
                      fontSize: 11,
                      fontWeight: 'normal',
                    }}
                  >
                    {course.courseTitle || 'Course Title Not Provided'}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    )

    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.title}>Course Descriptions</Text>
          {renderTableOfContents()}
          {['9thCourses', '10thCourses', '11thCourses', '12thCourses', 'preHighSchool'].map((grade) => (
            <View key={grade} style={pdfStyles.section}>
              <Text style={pdfStyles.gradeHeader}>
                {grade === 'preHighSchool'
                  ? 'Pre-High School Courses'
                  : `${grade.replace('Courses', ' Grade')} Courses`}
              </Text>
              {Array.isArray(descriptions[grade]) && descriptions[grade].length > 0 ? (
                descriptions[grade].map((course, index) => (
                  <View key={index} style={pdfStyles.course}>
                    <Text style={pdfStyles.courseTitle}>{course.courseTitle || 'Course Title Not Provided'}</Text>
                    <Text style={pdfStyles.field}>
                      <Text style={pdfStyles.fieldLabel}>Course Instruction Method:</Text>
                      {'\n'}
                      <Text style={pdfStyles.fieldContent}>{course.method || ''}</Text>
                    </Text>
                    <Text style={pdfStyles.field}>
                      <Text style={pdfStyles.fieldLabel}>Textbooks and/or materials used:</Text>
                      {'\n'}
                      <Text style={pdfStyles.fieldContent}>{course.textbook || ''}</Text>
                    </Text>
                    <Text style={pdfStyles.field}>
                      <Text style={pdfStyles.fieldLabel}>Grading and Evaluation Method:</Text>
                      {'\n'}
                      <Text style={pdfStyles.fieldContent}>{course.assignments || ''}</Text>
                    </Text>
                    <Text style={pdfStyles.field}>
                      <Text style={pdfStyles.fieldLabel}>Learning Goals Achieved:</Text>
                      {'\n'}
                      <Text style={pdfStyles.fieldContent}>{course.goals || ''}</Text>
                    </Text>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: 'black', marginVertical: 10 }} />
                  </View>
                ))
              ) : (
                <Text>No courses available</Text>
              )}
            </View>
          ))}
          <View style={pdfStyles.copyrightContainer} fixed>
            <Text style={pdfStyles.stamp}>Created by YourEDU ©</Text>
          </View>
        </Page>
      </Document>
    )
  }

  // Add closeModal function
  const closeModal = () => setIsModalOpen(false)

  // Modal handlers
  const handlePreview = async () => {
    try {
      setIsModalOpen(true)

      // Generate PDF blob directly using @react-pdf/renderer
      const pdfBlob = await pdf(<CourseDescriptionsPDF descriptions={descriptions} />).toBlob()

      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'course-descriptions')
      }
    } catch (error) {
      console.error('Error handling preview:', error)
      toast.error('Failed to generate preview')
    }
  }

  const handleDownload = async () => {
    try {
      // Generate PDF blob directly using @react-pdf/renderer
      const pdfBlob = await pdf(<CourseDescriptionsPDF descriptions={descriptions} />).toBlob()

      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'course-descriptions')
      }

      // Trigger download
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'course_descriptions.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error handling download:', error)
      toast.error('Failed to download document')
    }
  }

  // Function to load course descriptions
  const loadCourseDescriptions = async () => {
    if (!selectedStudent?.id) return
    
    console.log('Loading course descriptions for student:', selectedStudent.id)
    setLoading(true)
    setError(null)
    
    try {
      // First sync courses from MyCourses to ensure we have the latest data
      await CourseDescriptionService.syncCoursesFromMyCourses(selectedStudent.id)
      
      // Then fetch the course descriptions
      const data = await CourseDescriptionService.getCourseDescriptions(selectedStudent.id)
      console.log('Loaded course descriptions:', data)
      
      // Sort courses in each grade level
      const sortedData = {
        ...data,
        preHighSchool: sortCourses(data.preHighSchool || []),
        '9thCourses': sortCourses(data['9thCourses'] || []),
        '10thCourses': sortCourses(data['10thCourses'] || []),
        '11thCourses': sortCourses(data['11thCourses'] || []),
        '12thCourses': sortCourses(data['12thCourses'] || [])
      }
      
      setDescriptions(sortedData)
      setDataStatus('Data loaded')
    } catch (err) {
      console.error('Error loading course descriptions:', err)
      setError('Failed to load course descriptions. Please try again.')
      setDataStatus('Error loading data')
    } finally {
      setLoading(false)
    }
  }
  
  // Load course descriptions when student changes
  useEffect(() => {
    if (selectedStudent?.id) {
      loadCourseDescriptions()
    }
  }, [selectedStudent?.id])

  // Add the no-student check before the main render
  if (!selectedStudent) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        {/* Hero Section */}
        <Box sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid hsl(var(--border))',
          mb: 3
        }}>
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
                pl: 2.1
              }}
            >
              Generate detailed course descriptions for your record keeping and college applications
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="var(--container-max-width)" sx={{ px: 'var(--container-padding-x)', py: 'var(--spacing-6)' }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DescriptiveText>Please select a student from the navigation bar to view their course descriptions.</DescriptiveText>
          </Box>
        </Container>
      </Box>
    )
  }

  const CourseEntryForm = ({ course, index, grade, handleChange, handleRemoveCourse, stylesForm }) => {
    const navigate = useNavigate();
    const isPulledIn = course.is_pulled_in;
    const [localValues, setLocalValues] = useState({
      courseTitle: course.courseTitle || '',
      method: course.method || '',
      textbook: course.textbook || '',
      materials: course.materials || '',
      assignments: course.assignments || '',
      goals: course.goals || ''
    });

    // Update local state when course props change
    useEffect(() => {
      setLocalValues({
        courseTitle: course.courseTitle || '',
        method: course.method || '',
        textbook: course.textbook || '',
        materials: course.materials || '',
        assignments: course.assignments || '',
        goals: course.goals || ''
      });
    }, [course]);

    const handleFieldChange = (e) => {
      const { name, value } = e;
      setLocalValues(prev => ({
        ...prev,
        [name]: value
      }));
      handleChange(e, grade, index);
    };

    const textFieldProps = {
      fullWidth: true,
      disabled: isPulledIn,
      onChange: (e) => handleFieldChange(e.target),
      onFocus: (e) => e.target.select(),
      InputLabelProps: {
        shrink: true,
      },
      sx: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: isPulledIn ? 'hsl(var(--muted))' : 'white',
          borderRadius: 'var(--radius-md)',
          '&:hover fieldset': {
            borderColor: 'hsl(var(--brand-primary))',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'hsl(var(--brand-primary))',
          },
          '& fieldset': {
            borderColor: 'hsl(var(--border))',
          },
        },
        '& .MuiOutlinedInput-input': {
          padding: 'var(--spacing-3)',
          color: '#000000',
          '&:focus': {
            color: '#000000',
          },
        },
        '& .MuiInputLabel-root': {
          backgroundColor: 'white',
          padding: '0 4px',
          color: '#000000',
          '&.Mui-focused': {
            color: 'hsl(var(--brand-primary))',
          },
        },
        '& .MuiInputLabel-shrink': {
          transform: 'translate(14px, -9px) scale(0.75)',
        },
      }
    };

    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          border: isPulledIn ? '1px solid hsl(var(--brand-primary) / 0.3)' : '1px solid hsl(var(--border))',
          backgroundColor: isPulledIn ? 'hsl(var(--brand-primary) / 0.05)' : 'white',
          position: 'relative',
          mb: 3,
        }}
      >
        {isPulledIn && (
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: 16,
              backgroundColor: 'hsl(var(--brand-primary))',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Pulled in from My Courses
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              {...textFieldProps}
              label="Course Title"
              name="courseTitle"
              value={localValues.courseTitle}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              {...textFieldProps}
              label="Course Instruction Method"
              name="method"
              value={localValues.method}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              {...textFieldProps}
              label="Textbooks Used"
              name="textbook"
              value={localValues.textbook}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              {...textFieldProps}
              label="Materials Used"
              name="materials"
              value={localValues.materials}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              {...textFieldProps}
              multiline
              rows={4}
              label="Evaluation Method"
              name="assignments"
              value={localValues.assignments}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              {...textFieldProps}
              multiline
              rows={4}
              label="Course Description"
              name="goals"
              value={localValues.goals}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
              {isPulledIn ? (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/user-course/${course.source_id}`)}
                  sx={{
                    backgroundColor: 'hsl(var(--brand-primary))',
                    color: 'white',
                    height: 36,
                    '&:hover': {
                      backgroundColor: 'hsl(var(--brand-primary-dark))',
                      boxShadow: 'none',
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none',
                  }}
                >
                  Edit in My Courses
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveCourse(grade, index)}
                  sx={{
                    height: 36,
                    '&:hover': {
                      boxShadow: 'none',
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none',
                  }}
                >
                  Remove Course
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 2, color: '#000000', pl: 1 }}>Select Grade:</Typography>
                <Box sx={{ minWidth: 200 }}>
                  <TextField
                    select
                    fullWidth
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    variant="outlined"
                    size="small"
                  >
                    <MenuItem value="preHighSchool">Pre-High School</MenuItem>
                    <MenuItem value="9thCourses">9th Grade</MenuItem>
                    <MenuItem value="10thCourses">10th Grade</MenuItem>
                    <MenuItem value="11thCourses">11th Grade</MenuItem>
                    <MenuItem value="12thCourses">12th Grade</MenuItem>
                  </TextField>
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {saving ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Saving...</Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>✓ Saved at {lastSaveTime}</Typography>
                  )}
                  <Button 
                    variant="contained" 
                    onClick={handlePreview} 
                    sx={{ 
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      '&:hover': {
                        backgroundColor: '#2563EB',
                      },
                      transition: 'none',
                      textTransform: 'none',
                      boxShadow: 'none'
                    }}
                  >
                    Preview
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleDownload}
                    sx={{ 
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      '&:hover': {
                        backgroundColor: '#2563EB',
                      },
                      transition: 'none',
                      textTransform: 'none',
                      boxShadow: 'none'
                    }}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Selected Grade Section */}
            <Paper sx={{ p: 3, mb: 4, boxShadow: 'none', border: 'none' }}>
              {Array.isArray(descriptions[selectedGrade]) ? (
                descriptions[selectedGrade].length > 0 ? (
                  sortCourses(descriptions[selectedGrade]).map((course, index) => (
                    <CourseEntryForm
                      key={index}
                      course={course}
                      index={descriptions[selectedGrade].indexOf(course)} // Use original index
                      grade={selectedGrade}
                      handleChange={handleDescriptionChange}
                      handleRemoveCourse={removeCourse}
                      stylesForm={styles}
                    />
                  ))
                ) : (
                  <Typography>No courses available</Typography>
                )
              ) : (
                <Typography>Loading courses...</Typography>
              )}
              <Button 
                variant="contained" 
                onClick={() => addNewCourse(selectedGrade)} 
                sx={{ 
                  mt: 2,
                  backgroundColor: '#2563EB',
                  color: 'white',
                  height: 36,
                  '&:hover': {
                    backgroundColor: '#2563EB',
                  },
                  transition: 'none',
                  textTransform: 'none',
                  boxShadow: 'none'
                }}
              >
                Add New Course
              </Button>
            </Paper>
          </>
        )}
      </Container>

      {/* Update Modal styling */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: theme.zIndex.modal,
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            maxWidth: '95%',
            width: '1000px',
            height: '90vh',
            margin: '0 auto',
            padding: '20px',
            border: 'none',
            background: '#fff',
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
        contentLabel="Course Descriptions Preview"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <button
            onClick={closeModal}
            style={{
              ...styles.button,
              marginBottom: '10px',
              alignSelf: 'flex-end',
            }}
          >
            Close
          </button>
          <div style={{ flex: 1, minHeight: 0 }}>
            <PDFViewer
              width="100%"
              height="100%"
              style={{
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CourseDescriptionsPDF descriptions={descriptions} />
            </PDFViewer>
          </div>
        </div>
      </Modal>
    </Box>
  )
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '20px auto',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    flexGrow: 1
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
    textDecoration: 'none',
    fontFamily: 'Arial'
  },
  sectionButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    backgroundColor: '#f1f1f1',
    border: 'none',
    borderBottom: '1px solid #ccc',
    textAlign: 'left',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  courseContainer: {
    padding: '10px 0',
    display: 'flex',
    flexDirection: 'column'
  },
  splitContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  leftColumn: {
    flex: 1,
    marginRight: '10px'
  },
  rightColumn: {
    flex: 1,
    marginLeft: '10px'
  },
  inputContainer: {
    marginBottom: '10px'
  },
  label: {
    display: 'block',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #CED4DA'
  },
  textarea: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #CED4DA',
    fontFamily: 'Arial'
  },
  courseTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  removeButton: {
    marginTop: '10px',
    backgroundColor: '#DC3545',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer'
  },
  modal: {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      height: '80%',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  }
};

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  gradeHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  course: {
    marginBottom: 15,
  },
  courseTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 10,
    marginBottom: 5,
  },
  field: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  fieldLabel: {
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginBottom: 4,
  },
  fieldContent: {
    marginLeft: 10,
    marginTop: 4,
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  stamp: {
    fontSize: 8,
    textAlign: 'right',
  },
})

export default CourseDescriptions
