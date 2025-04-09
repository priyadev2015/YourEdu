import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import TodoList from '../components/TodoList'
import MaterialSection from '../components/MaterialSection'
import AssignmentNotes from '../components/AssignmentNotes'
import AttendanceTracker from '../components/AttendanceTracker'

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [terms, setTerms] = useState([])
  const [activeTab, setActiveTab] = useState('modules')
  const [workSamples, setWorkSamples] = useState([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [newWorkSample, setNewWorkSample] = useState({
    title: '',
    description: '',
    file: null,
  })
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [todos, setTodos] = useState([])
  const [materials, setMaterials] = useState({
    Syllabus: [],
    Assignments: [],
    Tests: [],
    Miscellaneous: [],
  })
  const [assignmentNotes, setAssignmentNotes] = useState([])
  const [attendance, setAttendance] = useState([])
  const [editCourse, setEditCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Foreign Language',
    'Art',
    'Music',
    'Physical Education',
    'Computer Science',
    'Other',
  ]

  useEffect(() => {
    const savedTerms = localStorage.getItem('userTerms')
    if (savedTerms) {
      setTerms(JSON.parse(savedTerms))
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadCourseData()
    }
  }, [user, courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('my_courses')
        .select('*')
        .eq('id', courseId)
        .eq('user_id', user.id)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Load terms
      const { data: termsData, error: termsError } = await supabase
        .from('my_terms')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })

      if (termsError) throw termsError
      setTerms(termsData || [])

      // Load todos
      const { data: todosData, error: todosError } = await supabase
        .from('course_todos')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)

      if (todosError) throw todosError
      setTodos(todosData || [])

      // Load materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)

      if (materialsError) throw materialsError
      const organizedMaterials = {
        Syllabus: materialsData?.filter(m => m.category === 'Syllabus') || [],
        Assignments: materialsData?.filter(m => m.category === 'Assignments') || [],
        Tests: materialsData?.filter(m => m.category === 'Tests') || [],
        Miscellaneous: materialsData?.filter(m => m.category === 'Miscellaneous') || [],
      }
      setMaterials(organizedMaterials)

      // Load assignment notes
      const { data: notesData, error: notesError } = await supabase
        .from('course_notes')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)

      if (notesError) throw notesError
      setAssignmentNotes(notesData || [])

      // Load attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('course_attendance')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)

      if (attendanceError) throw attendanceError
      setAttendance(attendanceData || [])

    } catch (err) {
      console.error('Error loading course data:', err)
      setError('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load work samples from localStorage
    const loadWorkSamples = () => {
      const savedSamples = JSON.parse(localStorage.getItem(`workSamples_${courseId}`) || '[]')
      setWorkSamples(savedSamples)
    }
    loadWorkSamples()
  }, [courseId])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    setNewWorkSample((prev) => ({ ...prev, file }))
  }

  const handleDeleteSample = (sampleId) => {
    const updatedSamples = workSamples.filter((sample) => sample.id !== sampleId)
    setWorkSamples(updatedSamples)
    localStorage.setItem(`workSamples_${courseId}`, JSON.stringify(updatedSamples))
  }

  const handleDownloadSample = (sample) => {
    // Create a blob URL from the file data
    const blob = new Blob([sample.fileData], { type: sample.fileType })
    const url = window.URL.createObjectURL(blob)

    // Create a temporary anchor element and trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = sample.fileName
    document.body.appendChild(a)
    a.click()

    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleWorkSampleSubmit = () => {
    const file = newWorkSample.file
    const reader = new FileReader()

    reader.onload = (e) => {
      const workSampleData = {
        id: Date.now().toString(),
        title: newWorkSample.title,
        description: newWorkSample.description,
        fileName: file.name,
        fileType: file.type,
        fileData: e.target.result, // Store the file data
        uploadDate: new Date().toISOString(),
      }

      const updatedSamples = [...workSamples, workSampleData]
      setWorkSamples(updatedSamples)
      localStorage.setItem(`workSamples_${courseId}`, JSON.stringify(updatedSamples))

      // Reset form and close modal
      setNewWorkSample({ title: '', description: '', file: null })
      setIsUploadModalOpen(false)
    }

    reader.readAsArrayBuffer(file)
  }

  const handleDeleteCourse = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this course?')
    if (confirmDelete) {
      const savedCourses = JSON.parse(localStorage.getItem('userCourses') || '[]')
      const updatedCourses = savedCourses.filter((c) => c.id !== courseId)
      localStorage.setItem('userCourses', JSON.stringify(updatedCourses))

      // Also delete associated work samples
      localStorage.removeItem(`workSamples_${courseId}`)

      navigate('/high-school/academics/my-courses')
    }
  }

  const handleEditTodos = (updatedTodos) => {
    setTodos(updatedTodos)
    localStorage.setItem(`todos_${courseId}`, JSON.stringify(updatedTodos))
  }

  const handleMaterialUpload = (category, newMaterial) => {
    const updatedMaterials = {
      ...materials,
      [category]: [...materials[category], newMaterial],
    }
    setMaterials(updatedMaterials)
    localStorage.setItem(`materials_${courseId}`, JSON.stringify(updatedMaterials))
  }

  const handleEditCourseSubmit = async (updatedCourse) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('my_courses')
        .update({
          name: updatedCourse.name,
          term: updatedCourse.term,
          description: updatedCourse.description,
          subject_area: updatedCourse.subjectArea,
          start_date: updatedCourse.startDate,
          end_date: updatedCourse.endDate,
          schedule: updatedCourse.schedule,
          students: updatedCourse.students,
          instruction_method: updatedCourse.instructionMethod,
          evaluation_method: updatedCourse.evaluationMethod,
          materials: updatedCourse.materials,
          is_graded: updatedCourse.isGraded,
          lms_link: updatedCourse.lmsLink
        })
        .eq('id', courseId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCourse({ ...course, ...updatedCourse });
      setIsEditingCourse(false);
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditCourse({ ...course }) // Copy current course data
    setIsEditingCourse(true)
  }

  const handleBackClick = () => {
    navigate('/high-school/academics/my-courses')
  }

  if (!course) return <div>Loading...</div>

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={handleBackClick} style={styles.backButton}>
            ← Back to My Courses
          </button>
          <div>
            <h1 style={styles.title}>{course.name}</h1>
            <p style={styles.subtitle}>
              {course.subjectArea} • {course.term}
            </p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.editButton} onClick={handleEditClick}>
            Edit Course Info
          </button>
          <button style={{ ...styles.editButton, backgroundColor: '#dc3545' }} onClick={handleDeleteCourse}>
            Delete Course
          </button>
        </div>
      </div>

      {isEditingCourse && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Edit Course Information</h2>

            {/* Basic Info */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Course Name*</label>
              <input
                type="text"
                style={styles.input}
                value={editCourse?.name || ''}
                onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
                required
              />
            </div>

            {/* Term Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Term*</label>
              <select
                style={styles.input}
                value={editCourse?.term || ''}
                onChange={(e) => setEditCourse({ ...editCourse, term: e.target.value })}
                required
              >
                <option value="">Select a term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.name}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Course Description</label>
              <textarea
                style={{ ...styles.input, minHeight: '100px' }}
                value={editCourse?.description || ''}
                onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                placeholder="Enter course description..."
              />
            </div>

            {/* Subject Area */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject Area*</label>
              <select
                style={styles.input}
                value={editCourse?.subjectArea || ''}
                onChange={(e) => setEditCourse({ ...editCourse, subjectArea: e.target.value })}
                required
              >
                <option value="">Select subject area</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div style={styles.dateContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date*</label>
                <input
                  type="date"
                  style={styles.input}
                  value={editCourse?.startDate || ''}
                  onChange={(e) => setEditCourse({ ...editCourse, startDate: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Date*</label>
                <input
                  type="date"
                  style={styles.input}
                  value={editCourse?.endDate || ''}
                  onChange={(e) => setEditCourse({ ...editCourse, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Schedule */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Schedule</label>
              <div style={styles.scheduleContainer}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <label key={day} style={styles.dayCheckbox}>
                    <input
                      type="checkbox"
                      checked={editCourse?.schedule?.days?.includes(day)}
                      onChange={(e) => {
                        const days = e.target.checked
                          ? [...(editCourse?.schedule?.days || []), day]
                          : (editCourse?.schedule?.days || []).filter((d) => d !== day)
                        setEditCourse({
                          ...editCourse,
                          schedule: { ...editCourse?.schedule, days },
                        })
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>

              <div style={styles.timeContainer}>
                <input
                  type="time"
                  style={styles.timeInput}
                  value={editCourse?.schedule?.startTime || ''}
                  onChange={(e) =>
                    setEditCourse({
                      ...editCourse,
                      schedule: { ...editCourse?.schedule, startTime: e.target.value },
                    })
                  }
                />
                <span>to</span>
                <input
                  type="time"
                  style={styles.timeInput}
                  value={editCourse?.schedule?.endTime || ''}
                  onChange={(e) =>
                    setEditCourse({
                      ...editCourse,
                      schedule: { ...editCourse?.schedule, endTime: e.target.value },
                    })
                  }
                />
              </div>

              <input
                type="text"
                style={styles.input}
                placeholder="Duration (e.g., 50 minutes)"
                value={editCourse?.schedule?.duration || ''}
                onChange={(e) =>
                  setEditCourse({
                    ...editCourse,
                    schedule: { ...editCourse?.schedule, duration: e.target.value },
                  })
                }
              />
            </div>

            {/* Students */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Students</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter student names (comma-separated)"
                value={editCourse?.students?.join(', ') || ''}
                onChange={(e) =>
                  setEditCourse({
                    ...editCourse,
                    students: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            {/* Instruction Method */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Instruction Method</label>
              <select
                style={styles.input}
                value={editCourse?.instructionMethod || ''}
                onChange={(e) => setEditCourse({ ...editCourse, instructionMethod: e.target.value })}
              >
                <option value="">Select method</option>
                <option value="In-Person">In-Person</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Evaluation Method */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Evaluation Method</label>
              <input
                type="text"
                style={styles.input}
                value={editCourse?.evaluationMethod || ''}
                onChange={(e) => setEditCourse({ ...editCourse, evaluationMethod: e.target.value })}
                placeholder="How will students be evaluated?"
              />
            </div>

            {/* Materials */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Textbook/Materials</label>
              <textarea
                style={{ ...styles.input, minHeight: '60px' }}
                value={editCourse?.materials || ''}
                onChange={(e) => setEditCourse({ ...editCourse, materials: e.target.value })}
                placeholder="List required materials..."
              />
            </div>

            {/* Graded */}
            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editCourse?.isGraded || false}
                  onChange={(e) => setEditCourse({ ...editCourse, isGraded: e.target.checked })}
                />
                Graded Activity
              </label>
            </div>

            {/* LMS Link */}
            <div style={styles.formGroup}>
              <label style={styles.label}>LMS Link</label>
              <input
                type="url"
                style={styles.input}
                value={editCourse?.lmsLink || ''}
                onChange={(e) => setEditCourse({ ...editCourse, lmsLink: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.button, backgroundColor: '#6c757d' }}
                onClick={() => setIsEditingCourse(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.button, backgroundColor: '#4CAF50' }}
                onClick={() => handleEditCourseSubmit(editCourse)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div style={styles.dashboardGrid}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* LMS Quick Access */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>LMS Quick Access</h2>
            {course.lmsLink ? (
              <a href={course.lmsLink} target="_blank" rel="noopener noreferrer" style={styles.lmsButton}>
                Open Course in LMS
              </a>
            ) : (
              <p style={styles.emptyState}>No LMS link available</p>
            )}
          </div>

          {/* Course Information */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Course Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Duration</span>
                <span style={styles.infoValue}>
                  {course.startDate} - {course.endDate}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Schedule</span>
                <span style={styles.infoValue}>
                  {course.schedule ? (
                    <>
                      {course.schedule.days?.join(', ')}
                      <br />
                      {course.schedule.startTime} - {course.schedule.endTime}
                    </>
                  ) : (
                    'No schedule set'
                  )}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Method</span>
                <span style={styles.infoValue}>{course.instructionMethod}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Evaluation</span>
                <span style={styles.infoValue}>{course.evaluationMethod}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Materials</span>
                <span style={styles.infoValue}>{course.materials}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Graded</span>
                <span style={styles.infoValue}>{course.isGraded ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* ToDos Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>ToDos</h2>
            <TodoList todos={todos} onEdit={handleEditTodos} />
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* Grades Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Grades</h2>
            <div style={styles.gradesContainer}>{/* Add your grades component here */}</div>
          </div>

          {/* Materials Upload */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Course Materials</h2>
            <div style={styles.materialCategories}>
              {Object.keys(materials).map((category) => (
                <MaterialSection
                  key={category}
                  category={category}
                  materials={materials[category]}
                  onUpload={handleMaterialUpload}
                />
              ))}
            </div>
          </div>

          {/* Assignment Notes */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Assignment Notes</h2>
            <AssignmentNotes
              notes={assignmentNotes}
              onSave={(updatedNotes) => {
                setAssignmentNotes(updatedNotes)
                localStorage.setItem(`notes_${courseId}`, JSON.stringify(updatedNotes))
              }}
            />
          </div>

          {/* Attendance */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Attendance</h2>
            <AttendanceTracker
              attendance={attendance}
              students={course?.students || []}
              onSave={(updatedAttendance) => {
                setAttendance(updatedAttendance)
                localStorage.setItem(`attendance_${courseId}`, JSON.stringify(updatedAttendance))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    color: '#333',
    margin: 0,
  },
  subtitle: {
    color: '#666',
    margin: 0,
    fontSize: '0.875rem',
  },
  editButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    color: '#333',
    marginTop: 0,
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #eee',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '0.875rem',
    color: '#333',
  },
  lmsButton: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#388E3C',
    },
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  materialCategories: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    fontSize: '0.75rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  dateContainer: {
    display: 'flex',
    gap: '1.5rem',
  },
  scheduleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  dayCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  timeContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  timeInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
}

export default CourseDetail
