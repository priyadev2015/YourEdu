import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { Document, Page, Text, View, PDFViewer, StyleSheet, Image } from '@react-pdf/renderer'

// Update the styles to match Transcript.js
const stylesForm = {
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid hsl(var(--border))',
  },
  input: {
    width: '100%',
    marginTop: '8px',
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--radius-md)',
      '&:hover fieldset': {
        borderColor: 'hsl(var(--brand-primary))',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: 'var(--spacing-3)',
      color: '#000000',
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, -9px) scale(0.75)',
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
}

// PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
    color: '#666',
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    paddingBottom: 2,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  itemDate: {
    fontSize: 10,
    color: '#666',
  },
  itemDescription: {
    fontSize: 10,
    marginTop: 3,
    lineHeight: 1.4,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skill: {
    fontSize: 10,
    backgroundColor: '#f0f0f0',
    padding: '3 6',
    borderRadius: 3,
  },
})

// Resume PDF Document Component
const ResumePDF = ({ data }) => (
  <Document>
    <Page size="LETTER" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.name}>{data.name}</Text>
        <Text style={pdfStyles.contact}>
          {data.email} • {data.phone} • {data.location}
        </Text>
        {data.summary && (
          <Text style={pdfStyles.itemDescription}>{data.summary}</Text>
        )}
      </View>

      {/* Sections */}
      {data.sections.map((section, index) => (
        <View key={index} style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={{ marginBottom: 8 }}>
              <Text style={pdfStyles.itemTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={pdfStyles.itemSubtitle}>{item.subtitle}</Text>
              )}
              {item.date && (
                <Text style={pdfStyles.itemDate}>{item.date}</Text>
              )}
              {item.description && (
                <Text style={pdfStyles.itemDescription}>{item.description}</Text>
              )}
              {item.skills && item.skills.length > 0 && (
                <View style={pdfStyles.skills}>
                  {item.skills.map((skill, skillIndex) => (
                    <Text key={skillIndex} style={pdfStyles.skill}>
                      {skill}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
)

const Resume = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    sections: [
      {
        id: 'education',
        title: 'Education',
        items: [],
      },
      {
        id: 'experience',
        title: 'Experience',
        items: [],
      },
      {
        id: 'skills',
        title: 'Skills & Certifications',
        items: [],
      },
      {
        id: 'projects',
        title: 'Projects',
        items: [],
      },
    ],
  })
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const saveTimeoutRef = useRef(null)

  // Fetch student data
  const fetchStudentData = async (studentId) => {
    try {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (studentError) throw studentError

      // Get resume data if it exists
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('student_id', studentId)
        .single()

      if (resumeError && resumeError.code !== 'PGRST116') throw resumeError

      // Update resume data with student info
      setResumeData(prev => ({
        ...prev,
        ...resume,
        name: student.student_name || '',
        email: student.email || '',
      }))

      return student
    } catch (error) {
      console.error('Error fetching student data:', error)
      throw error
    }
  }

  // Save resume data
  const saveResume = async (data) => {
    try {
      if (!selectedStudent?.id) {
        console.error('No student selected')
        setSnackbar({
          open: true,
          message: 'Please select a student first',
          severity: 'error',
        })
        return
      }

      // Prepare the data object with all required fields
      const resumeData = {
        student_id: selectedStudent.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        summary: data.summary || '',
        sections: data.sections || [],
        updated_at: new Date().toISOString(),
      }

      console.log('Saving resume data:', resumeData)

      const { data: savedData, error } = await supabase
        .from('resumes')
        .upsert(resumeData, {
          onConflict: 'student_id',
          returning: 'minimal'
        })

      if (error) {
        console.error('Error saving resume:', error)
        throw error
      }

      console.log('Resume saved successfully:', savedData)
      
      setSnackbar({
        open: true,
        message: 'Resume saved successfully',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error saving resume:', error)
      setSnackbar({
        open: true,
        message: `Failed to save resume: ${error.message}`,
        severity: 'error',
      })
    }
  }

  // Debounced save
  const debouncedSave = useCallback((data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveResume(data)
    }, 2000)
  }, [])

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return

    const sections = [...resumeData.sections]
    const [reorderedItem] = sections.splice(result.source.index, 1)
    sections.splice(result.destination.index, 0, reorderedItem)

    const newData = {
      ...resumeData,
      sections,
    }
    setResumeData(newData)
    debouncedSave(newData)
  }

  // Add new item to section
  const handleAddItem = (sectionId) => {
    setEditingItem({
      sectionId,
      isNew: true,
      item: {
        title: '',
        subtitle: '',
        date: '',
        description: '',
        skills: [],
        links: [],
        images: [],
      },
    })
    setEditDialogOpen(true)
  }

  // Edit existing item
  const handleEditItem = (sectionId, item, index) => {
    setEditingItem({
      sectionId,
      index,
      isNew: false,
      item: { ...item },
    })
    setEditDialogOpen(true)
  }

  // Save item from dialog
  const handleSaveItem = () => {
    const { sectionId, index, isNew, item } = editingItem
    const newSections = [...resumeData.sections]
    const sectionIndex = newSections.findIndex(s => s.id === sectionId)

    if (isNew) {
      newSections[sectionIndex].items.push(item)
    } else {
      newSections[sectionIndex].items[index] = item
    }

    const newData = {
      ...resumeData,
      sections: newSections,
    }
    setResumeData(newData)
    debouncedSave(newData)
    setEditDialogOpen(false)
  }

  // Delete item
  const handleDeleteItem = (sectionId, index) => {
    const newSections = [...resumeData.sections]
    const sectionIndex = newSections.findIndex(s => s.id === sectionId)
    newSections[sectionIndex].items.splice(index, 1)

    const newData = {
      ...resumeData,
      sections: newSections,
    }
    setResumeData(newData)
    debouncedSave(newData)
  }

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Get selected student from localStorage
        const savedStudent = localStorage.getItem('selectedStudent')
        if (savedStudent) {
          const parsedStudent = JSON.parse(savedStudent)
          setSelectedStudent(parsedStudent)
          await fetchStudentData(parsedStudent.id)
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Listen for student changes
  useEffect(() => {
    const handleStudentChange = async (event) => {
      const student = event.detail
      try {
        setSelectedStudent(student)
        localStorage.setItem('selectedStudent', JSON.stringify(student))
        await fetchStudentData(student.id)
      } catch (error) {
        console.error('Error handling student change:', error)
        setError('Failed to load student data')
      }
    }

    window.addEventListener('studentChanged', handleStudentChange)
    return () => {
      window.removeEventListener('studentChanged', handleStudentChange)
    }
  }, [])

  // Load resume data
  const loadResume = async () => {
    try {
      if (!selectedStudent?.id) return

      console.log('Loading resume for student:', selectedStudent.id)

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .single()

      if (error) {
        console.error('Error loading resume:', error)
        throw error
      }

      if (data) {
        console.log('Loaded resume data:', data)
        setResumeData(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          summary: data.summary || '',
          sections: data.sections || [],
        }))
      }
    } catch (error) {
      console.error('Error loading resume:', error)
      setSnackbar({
        open: true,
        message: `Failed to load resume: ${error.message}`,
        severity: 'error',
      })
    }
  }

  // Load resume when student is selected
  useEffect(() => {
    loadResume()
  }, [selectedStudent])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!selectedStudent) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          No Student Selected
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please select a student from the navigation menu.
        </Typography>
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
            Create and manage your professional resume for college applications and career opportunities
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Basic Info */}
          <Paper sx={{ p: 3, mb: 4, ...stylesForm.container }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography 
                variant="h5"
                sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Basic Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PreviewIcon />}
                  onClick={() => setShowPdfPreview(true)}
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
                  startIcon={<PdfIcon />}
                  onClick={() => saveResume(resumeData)}
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={<span>Full Name <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={resumeData.name}
                  onChange={(e) => {
                    const newData = { ...resumeData, name: e.target.value }
                    setResumeData(newData)
                    debouncedSave(newData)
                  }}
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={<span>Email <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={resumeData.email}
                  onChange={(e) => {
                    const newData = { ...resumeData, email: e.target.value }
                    setResumeData(newData)
                    debouncedSave(newData)
                  }}
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={<span>Phone <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={resumeData.phone}
                  onChange={(e) => {
                    const newData = { ...resumeData, phone: e.target.value }
                    setResumeData(newData)
                    debouncedSave(newData)
                  }}
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={<span>Location <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={resumeData.location}
                  onChange={(e) => {
                    const newData = { ...resumeData, location: e.target.value }
                    setResumeData(newData)
                    debouncedSave(newData)
                  }}
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Professional Summary"
                  value={resumeData.summary}
                  onChange={(e) => {
                    const newData = { ...resumeData, summary: e.target.value }
                    setResumeData(newData)
                    debouncedSave(newData)
                  }}
                  sx={{
                    ...stylesForm.input,
                    '& .MuiInputBase-root': {
                      minHeight: '100px',
                    },
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Sections */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {resumeData.sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ p: 3, mb: 3, ...stylesForm.container }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 2,
                            }}
                            {...provided.dragHandleProps}
                          >
                            <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography 
                              variant="h5"
                              sx={{ 
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#000000'
                              }}
                            >
                              {section.title}
                            </Typography>
                            <Button
                              startIcon={<AddIcon />}
                              onClick={() => handleAddItem(section.id)}
                              sx={{ 
                                ml: 'auto',
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
                              Add Item
                            </Button>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          {section.items.map((item, itemIndex) => (
                            <Card key={itemIndex} sx={{ mb: 2 }}>
                              <CardContent>
                                <Typography variant="h6">{item.title}</Typography>
                                {item.subtitle && (
                                  <Typography color="text.secondary" gutterBottom>
                                    {item.subtitle}
                                  </Typography>
                                )}
                                {item.date && (
                                  <Typography variant="body2" color="text.secondary">
                                    {item.date}
                                  </Typography>
                                )}
                                {item.description && (
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {item.description}
                                  </Typography>
                                )}
                                {item.skills && item.skills.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    {item.skills.map((skill, skillIndex) => (
                                      <Chip
                                        key={skillIndex}
                                        label={skill}
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                      />
                                    ))}
                                  </Box>
                                )}
                                {item.links && item.links.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    {item.links.map((link, linkIndex) => (
                                      <Chip
                                        key={linkIndex}
                                        icon={<LinkIcon />}
                                        label={link.title}
                                        component="a"
                                        href={link.url}
                                        target="_blank"
                                        clickable
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </CardContent>
                              <CardActions>
                                <Button
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() =>
                                    handleEditItem(section.id, item, itemIndex)
                                  }
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  color="error"
                                  onClick={() =>
                                    handleDeleteItem(section.id, itemIndex)
                                  }
                                >
                                  Delete
                                </Button>
                              </CardActions>
                            </Card>
                          ))}
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Box>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingItem?.isNew ? 'Add Item' : 'Edit Item'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={<span>Title <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={editingItem?.item.title || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      item: { ...prev.item, title: e.target.value },
                    }))
                  }
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={<span>Subtitle <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={editingItem?.item.subtitle || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      item: { ...prev.item, subtitle: e.target.value },
                    }))
                  }
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={<span>Date <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={editingItem?.item.date || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      item: { ...prev.item, date: e.target.value },
                    }))
                  }
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={<span>Description <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={editingItem?.item.description || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      item: { ...prev.item, description: e.target.value },
                    }))
                  }
                  sx={{
                    ...stylesForm.input,
                    '& .MuiInputBase-root': {
                      minHeight: '100px',
                    },
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={<span>Skills (comma-separated) <span style={{ color: '#FF0000' }}>*</span></span>}
                  value={editingItem?.item.skills?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      item: {
                        ...prev.item,
                        skills: e.target.value.split(',').map((s) => s.trim()),
                      },
                    }))
                  }
                  sx={stylesForm.input}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveItem} 
              variant="contained"
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
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* PDF Preview Dialog */}
        <Dialog
          open={showPdfPreview}
          onClose={() => setShowPdfPreview(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogContent>
            <Box sx={{ height: '80vh' }}>
              <PDFViewer width="100%" height="100%">
                <ResumePDF data={resumeData} />
              </PDFViewer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPdfPreview(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Resume 