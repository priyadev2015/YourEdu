import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PDFViewer, Font, pdf } from '@react-pdf/renderer'
import { Box, Container, Button, TextField, Grid, Typography, CircularProgress, Snackbar, Alert, Dialog, DialogContent, MenuItem } from '@mui/material'
import { useAuth } from '../utils/AuthContext'
import { TranscriptService } from '../services/TranscriptService'
import { toast } from 'react-toastify'
import { savePDFToStorage } from '../utils/pdfStorage'
import { theme } from '../theme/theme'
import CourseEntryForm from '../components/transcript/CourseEntryForm'
import TranscriptDocument from '../components/transcript/TranscriptDocument'
import { supabase } from '../utils/supabaseClient'
import HowToUseGuide from '../components/ui/HowToUseGuide'
import CheckIcon from '@mui/icons-material/Check'
import StandardTextField from '../components/ui/StandardTextField'
import StandardSelect from '../components/ui/StandardSelect'
import { useNavigate } from 'react-router-dom'
import { DescriptiveText } from '../components/ui/typography'

// Register Helvetica fonts from src/assets folder
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: '/src/assets/fonts/Helvetica.ttf', fontWeight: 'normal' }, // Regular font
    { src: '/src/assets/fonts/Helvetica-Bold.ttf', fontWeight: 'bold' }, // Bold font
    { src: '/src/assets/fonts/Helvetica-Oblique.ttf', fontStyle: 'italic' }, // Italic font
  ],
})

// Register the DollieScript font
Font.register({
  family: 'DollieScript',
  fonts: [
    {
      src: '/src/assets/fonts/DollieScriptPersonalUse.ttf',
    },
  ],
})

// Update defaultFormData to ensure no null values
const defaultFormData = {
  name: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  dob: '',
  parentGuardian: '',
  studentEmail: '',
  projectedGradDate: '',
  parentEmail: '',
  schoolName: '',
  schoolPhone: '',
  schoolAddress: '',
  schoolCity: '',
  schoolState: '',
  schoolZip: '',
  issueDate: '',
  graduationDate: '',
  freshmanYear: '',
  sophomoreYear: '',
  juniorYear: '',
  seniorYear: '',
  preHighSchoolYear: '',
  '9thCourses': [],
  '10thCourses': [],
  '11thCourses': [],
  '12thCourses': [],
  preHighSchoolCourses: [],
  cumulativeSummary: {
    totalCredits: '0',
    gpaCredits: '0',
    gpaPoints: '0',
    cumulativeGPA: '0',
    weightedGPA: '',
  },
  testScores: '',
  gradingScale: {
    show: false,
  },
  miscellaneous: '',
  signatureDate: '',
  pdfData: '',
  '9thYear': '',
  '10thYear': '',
  '11thYear': '',
  '12thYear': '',
}

// Utility functions (outside of component)
// This function will be used for future term-based functionality
const determineTermNumber = (termStart, termDuration) => {
  const termMap = {
    Fall: 1,
    Winter: 1,
    Spring: 2,
    Summer: 3,
  }
  return termMap[termStart] || 1
}

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const Transcript = ({ onBack }) => {
  const { user } = useAuth()
  const saveTimeoutRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // Used for error handling and display
  const [saving, setSaving] = useState(false) // Used in save functions and UI indicators
  const location = window.location.href
  const dataFetchedRef = useRef(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const [lastSaveTime, setLastSaveTime] = useState(null)
  const [isSavingGlobal, setIsSavingGlobal] = useState(false) // Used for UI saving indicator
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dataStatus, setDataStatus] = useState('Data saved') // Used to track data save status
  const navigate = useNavigate()

  // Add debug logs for form data when it changes
  useEffect(() => {
    if (formData) {
      // Only log if critical fields are missing or changed
      if (!formData.studentEmail || !formData.schoolPhone) {
        console.log('Critical form data missing:', {
          studentEmail: formData.studentEmail,
          schoolPhone: formData.schoolPhone
        });
      }
    }
  }, [formData]);

  // Define handleSave before it's used
  const handleSave = useCallback(async () => {
    if (!selectedStudent?.id) {
      setError('No student selected')
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setSaving(true)
    setIsSavingGlobal(true)
    try {
      await TranscriptService.saveTranscript(selectedStudent.id, formData)
      setDataStatus('Saved')
      setSnackbar({
        open: true,
        message: 'Saved successfully',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error saving:', error)
      setError('Failed to save')
      setSnackbar({
        open: true,
        message: 'Failed to save: ' + error.message,
        severity: 'error'
      })
    } finally {
      setSaving(false)
      setIsSavingGlobal(false)
    }
  }, [selectedStudent?.id, formData])

  // Define debouncedSave after handleSave
  const debouncedSave = useCallback((data) => {
    if (!selectedStudent?.id) {
      console.error('No student selected for save')
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true)
      setIsSavingGlobal(true)
      try {
        await TranscriptService.saveTranscript(selectedStudent.id, data)
        const savedTime = new Date().toLocaleTimeString()
        setLastSaveTime(savedTime)
        localStorage.setItem('transcriptLastSaveTime', savedTime)
        setDataStatus('Saved')
      } catch (error) {
        console.error('Error in debounced save:', error)
        setError('Failed to save')
      } finally {
        setSaving(false)
        setIsSavingGlobal(false)
      }
    }, 2000)
  }, [selectedStudent?.id, selectedStudent?.student_name])

  // Auto-populate transcript data
  const populateTranscriptData = async () => {
    if (!user || !selectedStudent) return null;

    try {
      // Fetch parent profile
      const parentProfile = await fetchParentProfile()
      
      // Fetch detailed student information
      const studentDetails = await fetchStudentDetails(selectedStudent.id)

      // Determine parent name - use first_name and last_name if available, otherwise use name
      let parentName = '';
      if (parentProfile?.first_name && parentProfile?.last_name) {
        parentName = `${parentProfile.first_name} ${parentProfile.last_name}`;
      } else {
        parentName = parentProfile?.name || '';
      }

      // Get student name from either studentDetails or selectedStudent
      const studentName = studentDetails?.student_name || selectedStudent.student_name || '';
      
      // Get student email from studentDetails - this is the email field from the students table
      const studentEmail = studentDetails?.email || '';
      
      // Get student DOB from studentDetails
      const studentDOB = studentDetails?.date_of_birth || selectedStudent.date_of_birth || '';
      
      // Get student gender from studentDetails
      const studentGender = studentDetails?.gender || '';

      // Use parent address for school address if not specified
      const schoolName = studentDetails?.school_name || '';
      // Get school phone from parent profile's phone_number field
      const schoolPhone = parentProfile?.phone_number || '';
      
      const schoolAddress = studentDetails?.school_address || parentProfile?.street_address || '';
      const schoolCity = studentDetails?.school_city || parentProfile?.city || '';
      const schoolState = studentDetails?.school_state || parentProfile?.state || '';
      const schoolZip = studentDetails?.school_zip || parentProfile?.zip || '';

      // Create new form data with profile information
      const populatedData = {
        ...defaultFormData,
        // Student info from students table
        name: studentName,
        studentEmail: studentEmail,
        dob: studentDOB,
        gender: studentGender,
        
        // Parent info from account_profiles
        parentGuardian: parentName,
        parentEmail: parentProfile?.email || '',
        address: parentProfile?.street_address || '',
        city: parentProfile?.city || '',
        state: parentProfile?.state || '',
        zip: parentProfile?.zip || '',
        
        // School info from student details or parent address
        schoolName: schoolName,
        schoolPhone: schoolPhone,
        schoolAddress: schoolAddress,
        schoolCity: schoolCity,
        schoolState: schoolState,
        schoolZip: schoolZip,
        
        // Update years based on grade level and graduation year
        '9thYear': studentDetails?.graduation_year ? `${parseInt(studentDetails.graduation_year) - 4}` : '',
        '10thYear': studentDetails?.graduation_year ? `${parseInt(studentDetails.graduation_year) - 3}` : '',
        '11thYear': studentDetails?.graduation_year ? `${parseInt(studentDetails.graduation_year) - 2}` : '',
        '12thYear': studentDetails?.graduation_year ? `${parseInt(studentDetails.graduation_year) - 1}` : '',
      }

      return populatedData
    } catch (err) {
      console.error('Error populating transcript data:', err)
      return null
    }
  }

  // Add cleanup effect at component level
  useEffect(() => {
    let isMounted = true;
    
    // Set up a listener for changes to account_profiles
    const setupProfileListener = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) return
        
        const profileSubscription = supabase
          .channel('account_profiles_changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'account_profiles',
              filter: `id=eq.${currentUser.id}`
            },
            async (payload) => {
              if (selectedStudent?.id && isMounted) {
                try {
                  await TranscriptService.syncParentDataToTranscript(selectedStudent.id)
                  // Reload transcript data to reflect changes
                  const updatedTranscript = await TranscriptService.getTranscript(selectedStudent.id)
                  if (updatedTranscript && isMounted) {
                    setFormData(updatedTranscript)
                    toast.success('Transcript updated with latest profile data')
                  }
                } catch (error) {
                  console.error('Error syncing profile changes to transcript:', error)
                }
              }
            }
          )
          .subscribe()
          
        // Set up listener for changes to students table
        const studentSubscription = supabase
          .channel('students_changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'students',
              filter: selectedStudent?.id ? `id=eq.${selectedStudent.id}` : undefined
            },
            async (payload) => {
              if (selectedStudent?.id && isMounted) {
                try {
                  await TranscriptService.syncStudentDataToTranscript(selectedStudent.id)
                  // Reload transcript data to reflect changes
                  const updatedTranscript = await TranscriptService.getTranscript(selectedStudent.id)
                  if (updatedTranscript && isMounted) {
                    setFormData(updatedTranscript)
                    toast.success('Transcript updated with latest student data')
                  }
                } catch (error) {
                  console.error('Error syncing student changes to transcript:', error)
                }
              }
            }
          )
          .subscribe()
          
        return { profileSubscription, studentSubscription }
      } catch (error) {
        console.error('Error setting up listeners:', error)
        return null
      }
    }
    
    const subscriptions = setupProfileListener()
    
    return () => {
      isMounted = false;
      // Clean up subscriptions
      subscriptions.then(subs => {
        if (subs) {
          if (subs.profileSubscription) supabase.removeChannel(subs.profileSubscription)
          if (subs.studentSubscription) supabase.removeChannel(subs.studentSubscription)
        }
      })
      
      // If there's a pending save, execute it immediately only if we have valid data
      if (saveTimeoutRef.current && formData && Object.keys(formData).length > 0 && formData['9thCourses']?.length > 0) {
        clearTimeout(saveTimeoutRef.current)
        if (selectedStudent?.id) {
          TranscriptService.saveTranscript(selectedStudent.id, formData)
            .catch(err => console.error('Error in final save:', err))
        }
      }
    }
  }, [selectedStudent])

  // Get selected student from localStorage
  useEffect(() => {
    const savedStudent = localStorage.getItem('selectedStudent')
    const savedTime = localStorage.getItem('transcriptLastSaveTime')
    if (savedTime) {
      setLastSaveTime(savedTime)
    }
    if (savedStudent) {
      try {
        const parsedStudent = JSON.parse(savedStudent)
        setSelectedStudent(parsedStudent)
      } catch (e) {
        console.error('Error parsing saved student:', e)
        localStorage.removeItem('selectedStudent')
      }
    }
  }, [])

  // Fetch parent profile data
  const fetchParentProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        console.error('No authenticated user found')
        return null
      }
      
      const { data: parentData, error: parentError } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
        
      if (parentError) {
        console.error('Error fetching parent profile:', parentError)
        throw parentError
      }
      
      return parentData
    } catch (err) {
      console.error('Error fetching parent profile:', err)
      return null
    }
  }

  // Fetch student's detailed information
  const fetchStudentDetails = async (studentId) => {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (studentError) {
        console.error('Error fetching student details:', studentError)
        throw studentError
      }

      return studentData
    } catch (err) {
      console.error('Error fetching student details:', err)
      return null
    }
  }

  // Fetch student's courses
  const fetchStudentCourses = async (studentId) => {
    try {
      // Fetch YouredU courses
      const { data: youreduCourses, error: youreduError } = await supabase
        .from('youredu_courses')
        .select('*')
        .eq('student_id', studentId)

      if (youreduError) {
        console.error('Error fetching youredu_courses:', youreduError)
        throw youreduError
      }

      // Fetch user courses
      const { data: userCourses, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('student_id', studentId)

      if (userCoursesError) {
        console.error('Error fetching user_courses:', userCoursesError)
        throw userCoursesError
      }

      // Transform courses to ensure consistent format
      const transformedYoureduCourses = (youreduCourses || []).map(course => ({
        ...course,
        title: course.title || course.subject || course.hs_subject || '',
        instruction_method: course.instruction_method || 'Traditional',
        term1_grade: course.term1_grade || '',
        term2_grade: course.term2_grade || '',
        term3_grade: course.term3_grade || '',
        units: course.units || course.credits || '1.0',
        year: course.year || course.academic_year || new Date().getFullYear(),
        is_youredu_course: true
      }))

      const transformedUserCourses = (userCourses || []).map(course => ({
        ...course,
        title: course.title || course.subject || course.hs_subject || '',
        instruction_method: course.instruction_method || 'Traditional',
        term1_grade: course.term1_grade || '',
        term2_grade: course.term2_grade || '',
        term3_grade: course.term3_grade || '',
        units: course.units || course.credits || '1.0',
        year: course.year || course.academic_year || new Date().getFullYear(),
        is_youredu_course: false
      }))

      return [...transformedYoureduCourses, ...transformedUserCourses]
    } catch (err) {
      console.error('Error fetching student courses:', err)
      return []
    }
  }

  // Fetch transcript when student changes
  useEffect(() => {
    let isMounted = true;
    
    const loadTranscriptData = async () => {
      if (!selectedStudent?.id) return;
      
      setLoading(true)
      dataFetchedRef.current = true;
      
      try {
        // First sync parent data from account_profiles to transcript
        await TranscriptService.syncParentDataToTranscript(selectedStudent.id)
        
        // Sync student data from students table to transcript
        await TranscriptService.syncStudentDataToTranscript(selectedStudent.id)
        
        // Then fetch the transcript
        const transcriptData = await TranscriptService.getTranscript(selectedStudent.id)
        
        if (!isMounted) return;
        
        if (transcriptData) {
          setFormData(transcriptData)
          setDataStatus('Data loaded')
          // Set the last save time from the updated_at field
          if (transcriptData.updated_at) {
            const savedTime = new Date(transcriptData.updated_at).toLocaleTimeString()
            setLastSaveTime(savedTime)
            localStorage.setItem('transcriptLastSaveTime', savedTime)
          }
        } else {
          // Only populate with default data if no transcript exists
          const populatedData = await populateTranscriptData()
          if (!isMounted) return;
          
          if (populatedData) {
            const savedData = await TranscriptService.saveTranscript(selectedStudent.id, populatedData)
            if (!isMounted) return;
            
            setFormData(savedData)
            setDataStatus('Default data saved')
            if (savedData.updated_at) {
              const savedTime = new Date(savedData.updated_at).toLocaleTimeString()
              setLastSaveTime(savedTime)
              localStorage.setItem('transcriptLastSaveTime', savedTime)
            }
          } else {
            console.error('Failed to populate data for student:', selectedStudent.student_name)
            setError('Failed to populate transcript data')
          }
        }
      } catch (error) {
        console.error('Error loading transcript:', error)
        if (!isMounted) return;
        setError('Failed to load transcript data')
      } finally {
        if (isMounted) {
          setLoading(false)
          setDataLoaded(true)
        }
      }
    }

    if (selectedStudent?.id && (!dataLoaded || !dataFetchedRef.current)) {
      loadTranscriptData()
    }
    
    return () => {
      isMounted = false;
    }
  }, [selectedStudent?.id, dataLoaded, selectedStudent?.student_name, populateTranscriptData, formData])

  // Listen for student changes
  useEffect(() => {
    const handleStudentChange = async (event) => {
      const student = event.detail
      
      try {
        // Save current transcript data if there's a selected student
        if (selectedStudent?.id && formData) {
          console.log('Saving current transcript before switching students')
          await handleSave()
        }

        // Reset data fetched flag and set the new selected student
        dataFetchedRef.current = false
        setSelectedStudent(student)
        
        // Store the selected student in localStorage
        localStorage.setItem('selectedStudent', JSON.stringify(student))
        
        // Reset loading state to trigger data fetch for the new student
        setLoading(true)
        setDataLoaded(false)
        
        console.log('Student changed to:', student.student_name)
        console.log('Will load transcript data for student ID:', student.id)
      } catch (error) {
        console.error('Error handling student change:', error)
        setError('Failed to switch student transcript data')
      }
    }

    window.addEventListener('studentChanged', handleStudentChange)
    return () => {
      window.removeEventListener('studentChanged', handleStudentChange)
    }
  }, [selectedStudent, formData, handleSave, setSelectedStudent, setLoading, setDataLoaded, setError])

  // Check if we're on the homeschool page (used for conditional rendering)
  const isOnHomeschoolPage = location.includes('/my-homeschool')

  const handleYearChange = (gradeLevel, value) => {
    console.log('Year change:', { gradeLevel, value })
    const yearField = gradeLevel.replace('Courses', 'Year')
    const updatedData = {
      ...formData,
      [yearField]: value
    }
    console.log('Updated year data:', updatedData)
    setFormData(updatedData)
    debouncedSave(updatedData)
  }

  const handleCourseChange = (gradeLevel, index, field, value) => {
    console.log('Course change:', { gradeLevel, index, field, value })
    const courses = [...(formData[gradeLevel] || [])]
    
    if (field === 'method' && value === '') {
      courses.splice(index, 1)
    } else {
      courses[index] = {
        ...(courses[index] || {
          method: 'Traditional',
          courseTitle: '',
          term1Grade: '',
          term2Grade: '',
          term3Grade: '',
          credits: '',
          source_type: 'manual',
          source_id: null,
          is_pulled_in: false
        }),
        [field]: value
      }
    }

    const updatedData = {
      ...formData,
      [gradeLevel]: courses
    }
    
    console.log('Updated course data:', updatedData)
    setFormData(updatedData)
    debouncedSave(updatedData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('Input change:', { name, value })
    
    let updatedData
    if (name.includes('.')) {
      // Handle nested objects (e.g. cumulativeSummary.totalCredits)
      const [parent, child] = name.split('.')
      updatedData = {
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      }
    } else {
      updatedData = {
        ...formData,
        [name]: value
      }
    }
    
    console.log('Updated data:', updatedData)
    setFormData(updatedData)
    debouncedSave(updatedData)
  }

  // GPA calculation helper
  const calculateGPA = (courses) => {
    const gradePoints = {
      'A+': 4.3,
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'D-': 0.7,
      'F': 0.0
    }

    let totalCredits = 0
    let totalPoints = 0

    courses.forEach(course => {
      // Calculate total credits regardless of grade type
      const credits = parseFloat(course.credits) || 0
      totalCredits += credits

      // Skip GPA calculation for Pass/Fail grades
      if (['P', 'Pass', 'n/a', 'N/A'].includes(course.term1Grade) ||
          ['P', 'Pass', 'n/a', 'N/A'].includes(course.term2Grade) ||
          ['P', 'Pass', 'n/a', 'N/A'].includes(course.term3Grade)) {
        return
      }

      if (credits === 0) return

      const validGrades = [course.term1Grade, course.term2Grade, course.term3Grade]
        .filter(grade => grade && gradePoints[grade] !== undefined)

      if (validGrades.length === 0) return

      const creditPerTerm = credits / validGrades.length
      validGrades.forEach(grade => {
        totalPoints += creditPerTerm * gradePoints[grade]
      })
    })

    return {
      totalCredits: totalCredits.toFixed(2),
      gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00'
    }
  }

  const handleCalculate = () => {
    // Get all courses
    const allCourses = [
      ...(formData['9thCourses'] || []),
      ...(formData['10thCourses'] || []),
      ...(formData['11thCourses'] || []),
      ...(formData['12thCourses'] || []),
      ...(formData.preHighSchoolCourses || [])
    ]

    const { totalCredits, gpa } = calculateGPA(allCourses)

    // Update cumulative summary
    const updatedFormData = {
      ...formData,
      cumulativeSummary: {
        ...formData.cumulativeSummary,
        totalCredits: totalCredits.toString(),
        cumulativeGPA: gpa
      }
    }

    // Update form data with calculated values
    setFormData(updatedFormData)
    
    // Save the changes
    debouncedSave(updatedFormData)
    
    setSnackbar({
      open: true,
      message: `Calculation complete. Total Credits: ${totalCredits}, GPA: ${gpa}`,
      severity: 'success'
    })
  }

  const handleCumulativeSummaryChange = (field, value) => {
    const updatedFormData = {
      ...formData,
      cumulativeSummary: {
        ...formData.cumulativeSummary,
        [field]: value
      }
    }
    setFormData(updatedFormData)
    debouncedSave(updatedFormData)
  }

  const handleAddCourse = (gradeLevel) => {
    const courses = [...(formData[gradeLevel] || [])]
    courses.push({
      courseTitle: '',
      term1Grade: '',
      term2Grade: '',
      term3Grade: '',
      credits: ''
    })
    handleInputChange({ target: { name: gradeLevel, value: courses } })
  }

  const moveCourseUp = (gradeLevel, index) => {
    if (index === 0) return // Can't move up if already at top
    const courses = [...formData[gradeLevel]]
    const temp = courses[index]
    courses[index] = courses[index - 1]
    courses[index - 1] = temp
    handleInputChange({ target: { name: gradeLevel, value: courses } })
  }

  const moveCourseDown = (gradeLevel, index) => {
    const courses = [...formData[gradeLevel]]
    if (index === courses.length - 1) return // Can't move down if already at bottom
    const temp = courses[index]
    courses[index] = courses[index + 1]
    courses[index + 1] = temp
    handleInputChange({ target: { name: gradeLevel, value: courses } })
  }

  const handleTestScoresChange = (e) => {
    const { value } = e.target
    handleInputChange({ target: { name: 'testScores', value } })
  }

  const handlePreview = async () => {
    try {
      setIsModalOpen(true)

      // Generate PDF blob directly using @react-pdf/renderer
      const pdfBlob = await pdf(<TranscriptDocument data={formData} />).toBlob()

      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'transcript')
      }
    } catch (error) {
      console.error('Error handling preview:', error)
      toast.error('Failed to generate preview')
    }
  }

  const handleDownload = async () => {
    try {
      // Generate PDF blob directly using @react-pdf/renderer
      const pdfBlob = await pdf(<TranscriptDocument data={formData} />).toBlob()

      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'transcript')
      }

      // Trigger download
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transcript.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error handling download:', error)
      toast.error('Failed to download document')
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const stylesForm = {
    container: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      borderRadius: 'var(--radius-lg)',
      border: `1px solid ${theme.palette.divider}`,
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--spacing-4)',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    header: {
      color: '#000000',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.h4.fontSize,
      fontWeight: theme.typography.fontWeightBold,
    },
    button: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
      textTransform: 'none',
      borderRadius: 'var(--radius-md)',
    },
    input: {
      width: '100%',
      marginTop: '8px',
      '& .MuiOutlinedInput-root': {
        borderRadius: 'var(--radius-md)',
        '&:hover fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
      '& .MuiOutlinedInput-input': {
        padding: 'var(--spacing-3)',
        color: '#000000',
      },
      '& .MuiInputLabel-root': {
        transform: 'translate(14px, -9px) scale(0.75)',
        backgroundColor: theme.palette.background.paper,
        padding: '0 4px',
        color: '#000000',
        '&.Mui-focused': {
          color: theme.palette.primary.main,
        },
      },
      '& .MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
      },
    },
    noteText: {
      color: '#000000',
      fontFamily: theme.typography.fontFamily,
      fontSize: '1.1rem',
      lineHeight: 1.5,
    },
    section: {
      marginTop: 'var(--spacing-6)',
      '& .MuiTypography-h5': {
        marginBottom: '16px',
        color: '#000000',
      },
      '& .MuiTypography-h6': {
        color: '#000000',
      },
    },
    notesContainer: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: 'var(--radius-lg)',
      border: `1px solid ${theme.palette.divider}`,
      padding: 'var(--spacing-4)',
    },
    notesHeader: {
      color: '#000000',
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightBold,
    },
    sectionHeader: {
      color: '#000000',
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeightBold,
    },
  }

  // Add a message when no student is selected
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
              Create and customize professional academic transcripts for your record keeping and college applications
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="var(--container-max-width)" sx={{ px: 'var(--container-padding-x)', py: 'var(--spacing-6)' }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DescriptiveText>Please select a student from the navigation bar to view their transcript.</DescriptiveText>
          </Box>
        </Container>
      </Box>
    )
  }

  // Add loading indicator
  if (loading && !dataLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

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
            Create and customize professional academic transcripts for your record keeping and college applications
          </Typography>
        </Container>
      </Box>

      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-3)',
          position: 'relative',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <HowToUseGuide 
          title="Transcript Guide"
          defaultExpanded={false}
          sections={[
            {
              title: "Terms",
              content: "Three terms are available for grade entry. Term 1 is typically Fall. For semester-based courses, leave Term 3 blank. Use Term 3 for quarters or summer courses."
            },
            {
              title: "Credits",
              content: "Standard credits: 1.0 for full year, 0.5 for semester/summer. Custom standards accepted with documentation."
            },
            {
              title: "Weighted GPA",
              content: "Weighted GPA is optional. Only Honors, AP, and college-level courses typically qualify. Include weighting explanation in miscellaneous section."
            },
            {
              title: "Pass/Fail Courses",
              content: "For Pass/Fail courses, use \"P\", \"Pass\", \"n/a\", or \"N/A\". These entries are excluded from GPA calculations."
            }
          ]}
        />

        {/* Main Form Section */}
        <Box sx={{ ...stylesForm.container, mt: 4 }}>
          {/* Form Fields */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Student Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {isSavingGlobal ? (
                    <>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Saving...</Typography>
                    </>
                  ) : lastSaveTime ? (
                    <>
                      <CheckIcon sx={{ color: 'hsl(var(--success))', fontSize: 16 }} />
                      <Typography variant="body2">Saved at {lastSaveTime}</Typography>
                    </>
                  ) : null}
                </Box>
                <Button 
                  variant="contained" 
                  onClick={handlePreview} 
                  sx={{
                    backgroundColor: '#2563EB',
                    color: 'white',
                    height: 36,
                    '&:hover': {
                      backgroundColor: '#2563EB',
                      boxShadow: 'none'
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none'
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
                      boxShadow: 'none'
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none'
                  }}
                >
                  Download
                </Button>
              </Box>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Name <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Gender <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Date of Birth <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    inputProps: { type: 'date' },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Address <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      City <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardSelect
                  fullWidth
                  label="State"
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  {STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </StandardSelect>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Zip <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Parent/Guardian Name <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="parentGuardian"
                  value={formData.parentGuardian}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Parent/Guardian Email <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Student Email <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="studentEmail"
                  value={formData.studentEmail || ''}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Projected Graduation Date <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="projectedGradDate"
                  value={formData.projectedGradDate}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    inputProps: { type: 'date' },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Name of School <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      School Phone <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="schoolPhone"
                  value={formData.schoolPhone || ''}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      School Address <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="schoolAddress"
                  value={formData.schoolAddress}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      School City <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="schoolCity"
                  value={formData.schoolCity}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardSelect
                  fullWidth
                  label="School State"
                  required
                  name="schoolState"
                  value={formData.schoolState}
                  onChange={handleInputChange}
                >
                  {STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </StandardSelect>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      School Zip <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                  }
                  name="schoolZip"
                  value={formData.schoolZip}
                  onChange={handleInputChange}
                  sx={stylesForm.input}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            {/* Pre-High School Section */}
            <Box sx={stylesForm.section}>
              <Box 
                sx={{ 
                  height: '1px', 
                  backgroundColor: 'hsl(var(--border))',
                  mb: 4
                }} 
              />
              <Typography 
                variant="h5"
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000',
                  mb: 2
                }}
              >
                Pre-High School (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Grade, Year"
                    name="preHighSchoolYear"
                    placeholder="Nth Grade, YYYY/YYYY"
                    value={formData.preHighSchoolYear || ''}
                    onChange={(e) => handleInputChange({ target: { name: 'preHighSchoolYear', value: e.target.value } })}
                    sx={stylesForm.input}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                {(formData.preHighSchoolCourses || []).map((course, index) => (
                  <Grid item xs={12} key={index}>
                    <CourseEntryForm
                      course={course}
                      index={index}
                      grade="preHighSchoolCourses"
                      handleChange={(e) => handleCourseChange('preHighSchoolCourses', index, e.target.name, e.target.value)}
                      handleRemoveCourse={(grade, idx) => handleCourseChange(grade, idx, 'method', '')}
                      moveCourseUp={moveCourseUp}
                      moveCourseDown={moveCourseDown}
                      stylesForm={stylesForm}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={() => handleAddCourse('preHighSchoolCourses')}
                    sx={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      '&:hover': {
                        backgroundColor: '#2563EB',
                        boxShadow: 'none'
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none'
                    }}
                  >
                    Add Course
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Courses Section */}
            <Box sx={stylesForm.section}>
              <Box 
                sx={{ 
                  height: '1px', 
                  backgroundColor: 'hsl(var(--border))',
                  mb: 4
                }} 
              />
              {['9thCourses', '10thCourses', '11thCourses', '12thCourses'].map((grade, idx) => (
                <Box key={grade}>
                  {idx !== 0 && (
                    <Box 
                      sx={{ 
                        height: '1px', 
                        backgroundColor: 'hsl(var(--border))',
                        my: 4
                      }} 
                    />
                  )}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#000000',
                      mb: 2
                    }}
                  >
                    {grade.replace('Courses', ' Grade')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Year"
                        name={grade.replace('Courses', 'Year')}
                        placeholder="YYYY/YYYY"
                        value={formData[grade.replace('Courses', 'Year')] || ''}
                        onChange={(e) => handleYearChange(grade, e.target.value)}
                        required
                        sx={stylesForm.input}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    {(formData[grade] || []).map((course, index) => (
                      <Grid item xs={12} key={index}>
                        <CourseEntryForm
                          course={course}
                          index={index}
                          grade={grade}
                          handleChange={(e) => handleCourseChange(grade, index, e.target.name, e.target.value)}
                          handleRemoveCourse={(grade, idx) => handleCourseChange(grade, idx, 'method', '')}
                          moveCourseUp={moveCourseUp}
                          moveCourseDown={moveCourseDown}
                          stylesForm={stylesForm}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        onClick={() => handleAddCourse(grade)}
                        sx={{
                          backgroundColor: '#2563EB',
                          color: 'white',
                          height: 36,
                          '&:hover': {
                            backgroundColor: '#2563EB',
                            boxShadow: 'none'
                          },
                          transition: 'none',
                          boxShadow: 'none',
                          textTransform: 'none'
                        }}
                      >
                        Add Course
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Box 
                sx={{ 
                  height: '1px', 
                  backgroundColor: 'hsl(var(--border))',
                  mt: 4
                }} 
              />
            </Box>

            {/* Cumulative Summary Section */}
            <Box sx={stylesForm.section}>
              <Typography 
                variant="h5"
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000',
                  mb: 2
                }}
              >
                Cumulative Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Credits"
                    name="totalCredits"
                    value={formData.cumulativeSummary.totalCredits}
                    onChange={handleCumulativeSummaryChange}
                    sx={stylesForm.input}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cumulative GPA"
                    name="cumulativeGPA"
                    value={formData.cumulativeSummary.cumulativeGPA}
                    onChange={handleCumulativeSummaryChange}
                    sx={stylesForm.input}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleCalculate}
                    sx={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      '&:hover': {
                        backgroundColor: '#2563EB',
                        boxShadow: 'none'
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none',
                      mt: 1,
                      mb: 3
                    }}
                  >
                    Calculate
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Weighted GPA (Optional, Self-Input)"
                    name="weightedGPA"
                    value={formData.cumulativeSummary.weightedGPA || ''}
                    onChange={(e) => handleCumulativeSummaryChange('weightedGPA', e.target.value)}
                    sx={stylesForm.input}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Test Scores Section */}
            <Box sx={stylesForm.section}>
              <Box 
                sx={{ 
                  height: '1px', 
                  backgroundColor: 'hsl(var(--border))',
                  mb: 4
                }} 
              />
              <Typography 
                variant="h5"
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000',
                  mb: 2
                }}
              >
                Test Scores
              </Typography>
              <TextField
                fullWidth
                label="Enter test scores and dates"
                name="testScores"
                value={formData.testScores}
                onChange={handleTestScoresChange}
                multiline
                rows={4}
                sx={{
                  ...stylesForm.input,
                  '& .MuiInputBase-root': {
                    minHeight: '100px',
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            {/* Miscellaneous Section */}
            <Box sx={stylesForm.section}>
              <Box 
                sx={{ 
                  height: '1px', 
                  backgroundColor: 'hsl(var(--border))',
                  mb: 4
                }} 
              />
              <Typography 
                variant="h5"
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000',
                  mb: 2
                }}
              >
                Miscellaneous
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#000000' }}>
                We encourage families to briefly explain their weighting process and note any grades received from
                external institutions or businesses that courses were taken through.
              </Typography>
              <TextField
                fullWidth
                label="Additional notes about courses"
                name="miscellaneous"
                value={formData.miscellaneous}
                onChange={handleInputChange}
                multiline
                rows={4}
                sx={{
                  ...stylesForm.input,
                  '& .MuiInputBase-root': {
                    minHeight: '100px',
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>

            {/* Signature Section */}
            <Box sx={stylesForm.section}>
              <Box 
                sx={{ 
                  height: '1px', 
                  backgroundColor: 'hsl(var(--border))',
                  mb: 4
                }} 
              />
              <Typography 
                variant="h5"
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000',
                  mb: 2
                }}
              >
                Signature
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Parent/Guardian Full Name for confirmation"
                    name="signatureFullName"
                    value={formData.signatureFullName || ''}
                    onChange={handleInputChange}
                    sx={stylesForm.input}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date shown on authorized signature box"
                    name="signatureDate"
                    value={formData.signatureDate}
                    onChange={handleInputChange}
                    sx={stylesForm.input}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      inputProps: { type: 'date' },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Bottom Preview and Download Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            mt: 4,
            mb: 4
          }}>
            <Button 
              variant="contained" 
              onClick={handlePreview}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                height: 36,
                '&:hover': {
                  backgroundColor: '#2563EB',
                  boxShadow: 'none'
                },
                transition: 'none',
                boxShadow: 'none',
                textTransform: 'none'
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
                  boxShadow: 'none'
                },
                transition: 'none',
                boxShadow: 'none',
                textTransform: 'none'
              }}
            >
              Download
            </Button>
          </Box>

          {/* Preview Modal */}
          <Dialog
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            maxWidth="xl"
            fullWidth
            PaperProps={{
              sx: {
                height: '90vh',
                maxHeight: '90vh',
              },
            }}
          >
            <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => setIsModalOpen(false)}
                  sx={stylesForm.button}
                >
                  Close
                </Button>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <PDFViewer
                  width="100%"
                  height="100%"
                  style={{
                    border: 'none',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <TranscriptDocument data={formData} />
                </PDFViewer>
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      </Container>
    </Box>
  )
}

export default Transcript


