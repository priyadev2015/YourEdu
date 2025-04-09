import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemButton,
} from '@mui/material'
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { FeatureHeader } from '../components/ui/typography'
import { StudentService } from '../services/StudentService'
import { useAuth } from '../utils/AuthContext'
import dayjs from 'dayjs'
import { updateOnboardingProgress } from '../utils/onboardingUtils'
import StudentToggleTooltip from '../components/StudentToggleTooltip'
import { useLocation, useNavigate } from 'react-router-dom'

const grades = ['9th Grade', '10th Grade', '11th Grade', '12th Grade']

const AddStudent = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [studentToEdit, setStudentToEdit] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: null,
    grade: '',
    email: '',
  })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [showToggleTooltip, setShowToggleTooltip] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [user])

  // Add effect to handle navigation state
  useEffect(() => {
    if (location.state?.openCreateDialog) {
      setIsCreateDialogOpen(true)
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate])

  const fetchStudents = async () => {
    try {
      const studentsList = await StudentService.getStudentsByParentId(user.id)
      setStudents(studentsList)
      if (studentsList.length > 0 && !selectedStudent) {
        setSelectedStudent(studentsList[0])
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      setError('Failed to fetch students')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      birthday: null,
      grade: '',
      email: '',
    })
    setProfilePhoto(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const studentData = {
        parent_id: user.id,
        student_name: `${formData.firstName} ${formData.lastName}`.trim(),
        date_of_birth: formData.birthday ? dayjs(formData.birthday).format('YYYY-MM-DD') : null,
        grade_level: formData.grade,
        email: formData.email,
        school_name: '',
        previous_school: '',
        previous_school_phone: '',
        previous_school_address: '',
        curriculum: '',
        special_education_needs: '',
      }

      const newStudent = await StudentService.createStudent(studentData)

      const studentAddedEvent = new CustomEvent('studentAdded', {
        detail: newStudent,
      })
      window.dispatchEvent(studentAddedEvent)

      // Update onboarding progress when student is added
      const { error: onboardingError } = await updateOnboardingProgress(user?.id, 'added_students')
      if (onboardingError) {
        console.error('Error updating onboarding progress:', onboardingError)
      }

      await fetchStudents()
      resetForm()
      setIsCreateDialogOpen(false)
      
      // Show the tooltip after student is added successfully
      setShowToggleTooltip(true)
    } catch (err) {
      console.error('Error creating student:', err)
      setError(err.message || 'Failed to create student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (student) => {
    const [firstName, lastName] = student.student_name.split(' ')
    setStudentToEdit(student)
    setFormData({
      firstName: firstName || '',
      lastName: lastName || '',
      birthday: student.date_of_birth ? dayjs(student.date_of_birth) : null,
      grade: student.grade_level || '',
      email: student.email || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const studentData = {
        parent_id: user.id,
        student_name: `${formData.firstName} ${formData.lastName}`.trim(),
        date_of_birth: formData.birthday ? dayjs(formData.birthday).format('YYYY-MM-DD') : null,
        grade_level: formData.grade,
        email: formData.email,
      }

      await StudentService.updateStudent(studentToEdit.id, studentData)
      await fetchStudents()
      setIsEditDialogOpen(false)
      setStudentToEdit(null)
      resetForm()
    } catch (err) {
      console.error('Error updating student:', err)
      setError(err.message || 'Failed to update student. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
              pl: 2.1,
            }}
          >
            Manage your students and their information in one place.
          </Typography>
        </Container>
      </Box>

      {/* Student Toggle Tooltip Component */}
      <StudentToggleTooltip 
        open={showToggleTooltip} 
        onClose={() => setShowToggleTooltip(false)} 
      />

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          py: 'var(--container-padding-y)',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            minHeight: '600px',
          }}
        >
          {/* Left Sidebar - Students List */}
          <Box
            sx={{
              width: '300px',
              flexShrink: 0,
              backgroundColor: 'white',
              borderRadius: '8px 0 0 8px',
              border: '1px solid hsl(var(--border))',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Typography
                  sx={{
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                  }}
                >
                  My Students
                </Typography>
                <Button
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  onClick={() => setIsCreateDialogOpen(true)}
                  sx={{
                    backgroundColor: '#2563EB',
                    color: 'white',
                    height: 36,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#2563EB',
                      boxShadow: 'none',
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    py: 0.5,
                    px: 1.5,
                    minWidth: 0,
                  }}
                >
                  New
                </Button>
              </Box>
            </Box>
            <List sx={{ px: 2, py: 1.5 }}>
              {students.map((student) => (
                <ListItem key={student.id} disablePadding>
                  <ListItemButton
                    selected={selectedStudent?.id === student.id}
                    onClick={() => setSelectedStudent(student)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'hsl(var(--brand-primary-light))',
                        '&:hover': {
                          backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                          {student.student_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                          {student.grade_level}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditClick(student)
                        }}
                        sx={{
                          color: '#718096',
                          '&:hover': {
                            backgroundColor: 'rgba(113, 128, 150, 0.1)',
                            color: '#2563eb',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right Content Area - Student Details */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '0 8px 8px 0',
                border: '1px solid hsl(var(--border))',
                borderLeft: 'none',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 2.5,
                  height: 64,
                  borderBottom: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--muted))',
                }}
              >
                <Typography
                  sx={{
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                  }}
                >
                  {selectedStudent ? selectedStudent.student_name : 'Select a Student'}
                </Typography>
              </Box>

              {selectedStudent ? (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 1,
                          backgroundColor: 'white',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                          Grade Level
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2d3748' }}>
                          {selectedStudent.grade_level}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 1,
                          backgroundColor: 'white',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                          Birthday
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2d3748' }}>
                          {selectedStudent.date_of_birth
                            ? dayjs(selectedStudent.date_of_birth).format('MMMM D, YYYY')
                            : 'Not specified'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          p: 2,
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 1,
                          backgroundColor: 'white',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#2d3748' }}>
                          {selectedStudent.email || 'Not specified'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    color: '#718096',
                  }}
                >
                  <Typography>Select a student to view their details</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Create Student Dialog */}
        <Dialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="create-student-title"
          disablePortal
        >
          <DialogTitle id="create-student-title">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <FeatureHeader>Add New Student</FeatureHeader>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Birthday"
                  value={formData.birthday}
                  onChange={(newValue) => setFormData((prev) => ({ ...prev, birthday: newValue }))}
                  renderInput={(params) => <TextField {...params} required fullWidth />}
                />
              </LocalizationProvider>

              <FormControl fullWidth required>
                <InputLabel>Grade</InputLabel>
                <Select name="grade" value={formData.grade} label="Grade" onChange={handleInputChange}>
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setIsCreateDialogOpen(false)}
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
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
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
              {loading ? <CircularProgress size={24} /> : 'Add Student'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="edit-student-title"
          disablePortal
        >
          <DialogTitle id="edit-student-title">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <FeatureHeader>Edit Student</FeatureHeader>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Birthday"
                  value={formData.birthday}
                  onChange={(newValue) => setFormData((prev) => ({ ...prev, birthday: newValue }))}
                  renderInput={(params) => <TextField {...params} required fullWidth />}
                />
              </LocalizationProvider>

              <FormControl fullWidth required>
                <InputLabel>Grade</InputLabel>
                <Select name="grade" value={formData.grade} label="Grade" onChange={handleInputChange}>
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
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
              onClick={handleEditSubmit}
              variant="contained"
              disabled={loading}
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
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default AddStudent
