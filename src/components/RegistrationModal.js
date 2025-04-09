import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { PDFDocument } from 'pdf-lib'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import fontkit from '@pdf-lib/fontkit'
import { Box, CircularProgress, Modal, IconButton } from '@mui/material'
import { toast } from 'react-toastify'
import { supabase } from '../utils/supabaseClient'
import CloseIcon from '@mui/icons-material/Close'

// Define a constant for the PDF field names
const PDF_FIELDS = {
  lastName: 'Last',
  firstName: 'First',
  sierraCollegeId: 'Sierra College ID',
  currentSchool: 'Current School Attending',
  schoolTypePublic: 'Public',
  schoolTypePrivate: 'Private',
  schoolTypeHomeschool: 'Homeschool',
  termSpring: 'Spring',
  termSummer: 'Summer',
  termFall: 'Fall',
  year: 'Year',
  course1: 'Course Number and Course Title',
  course2: 'Course Number and Course Title_2',
  course3: 'Course Number and Course Title_3',
  course4: 'Course Number and Course Title_4',
  signatureDate: 'Date',
  parentPhone: 'Phone',
  parentName: 'Print Name',
  signatureDate2: 'Date_2',
  officeUseOnly: 'Sierra College Office Use Only',
  completed8thGrade: 'Completed 8th grade',
  satisfactoryGPA: 'Satisfactory GPA',
  transcripts: 'Transcripts',
  approve: 'Approve',
  signature1: 'Signature1_es_:signer:signature',
  signature2: 'Signature2_es_:signer:signature',
  signature3: 'Signature3_es_:signer:signature',
}

const RegistrationModal = ({ courses, onClose }) => {
  console.log('=== RegistrationModal rendered ===')
  console.log('Received courses:', courses)

  const navigate = useNavigate()
  const { user } = useAuth()
  const [terms, setTerms] = useState([])
  const [pdfPreview, setPdfPreview] = useState(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    sierraCollegeId: '',
    currentSchool: '',
    schoolType: '',
    term: '',
    year: new Date().getFullYear(),
    parentName: '',
    parentPhone: '',
    parentSignature: '',
    studentSignature: '',
    signatureDate: new Date().toISOString().split('T')[0],
  })
  const [signaturesValid, setSignaturesValid] = useState(false)

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: profile, error } = await supabase.from('account_profiles').select('*').eq('id', user.id).single()

        if (error) throw error

        if (profile) {
          // Split name into first and last if available
          const [firstName = '', ...lastNameParts] = (profile.name || '').split(' ')
          const lastName = lastNameParts.join(' ')

          setFormData((prev) => ({
            ...prev,
            firstName,
            lastName,
            parentPhone: profile.phone_number || '',
            currentSchool: 'Homeschool', // Default for now
            schoolType: 'homeschool', // Default for now
            parentName: profile.name || '',
            sierraCollegeId: profile.sierra_college_id || '',
          }))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile data', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  useEffect(() => {
    const savedTerms = localStorage.getItem('userTerms')
    if (savedTerms) {
      setTerms(JSON.parse(savedTerms))
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Check if both signatures are present when either signature field changes
    if (name === 'studentSignature' || name === 'parentSignature') {
      const otherSignature = name === 'studentSignature' ? formData.parentSignature : formData.studentSignature
      setSignaturesValid(value.trim() !== '' && otherSignature.trim() !== '')
    }
  }

  const generatePDF = async (includeSignatures = false) => {
    console.log('=== Generate PDF Called ===')
    console.log('Include signatures:', includeSignatures)
    try {
      console.log('Fetching PDF template...')
      const templateBytes = await fetch('/academic-enrichment-permission-form.pdf').then((res) => res.arrayBuffer())
      console.log('Template fetched successfully')
      const fontBytes = await fetch('/fonts/AlexBrush-Regular.ttf').then((res) => res.arrayBuffer())
      const pdfDoc = await PDFDocument.load(templateBytes)

      // Register fontkit
      pdfDoc.registerFontkit(fontkit)

      // Embed the custom font
      const alexBrushFont = await pdfDoc.embedFont(fontBytes)

      const form = pdfDoc.getForm()

      const setFieldValue = (fieldName, value, font = null) => {
        try {
          const field = form.getTextField(fieldName)
          field.setText(value || '')
          if (font) {
            field.updateAppearances(font)
          }
        } catch (error) {
          console.warn(`Field ${fieldName} not found or error setting value:`, error)
        }
      }

      // Set signature fields only if includeSignatures is true
      if (includeSignatures) {
        setFieldValue(PDF_FIELDS.signature1, formData.parentSignature, alexBrushFont)
        setFieldValue(PDF_FIELDS.signature2, formData.parentSignature, alexBrushFont)
        setFieldValue(PDF_FIELDS.signature3, formData.studentSignature, alexBrushFont)
      }

      // Set other fields without custom font
      setFieldValue(PDF_FIELDS.lastName, formData.lastName)
      setFieldValue(PDF_FIELDS.firstName, formData.firstName)
      setFieldValue(PDF_FIELDS.sierraCollegeId, formData.sierraCollegeId)
      setFieldValue(PDF_FIELDS.currentSchool, formData.currentSchool)
      setFieldValue(PDF_FIELDS.year, formData.year.toString())
      setFieldValue(PDF_FIELDS.parentPhone, formData.parentPhone)
      setFieldValue(PDF_FIELDS.parentName, formData.parentName)
      setFieldValue(PDF_FIELDS.signatureDate, formData.signatureDate)
      setFieldValue(PDF_FIELDS.signatureDate2, formData.signatureDate)

      console.log('Setting course fields for courses:', courses)
      courses.forEach((course, index) => {
        const fieldName = `course${index + 1}`
        if (PDF_FIELDS[fieldName]) {
          console.log(`Setting course ${index + 1}:`, `${course.course_code} - ${course.title}`)
          form.getTextField(PDF_FIELDS[fieldName]).setText(`${course.course_code} - ${course.title}`)
        }
      })

      const setCheckboxValue = (fieldName, value) => {
        try {
          const field = form.getCheckBox(fieldName)
          value ? field.check() : field.uncheck()
        } catch (error) {
          console.warn(`Checkbox ${fieldName} not found or error setting value:`, error)
        }
      }

      setCheckboxValue(PDF_FIELDS.schoolTypePublic, formData.schoolType === 'public')
      setCheckboxValue(PDF_FIELDS.schoolTypePrivate, formData.schoolType === 'private')
      setCheckboxValue(PDF_FIELDS.schoolTypeHomeschool, formData.schoolType === 'homeschool')

      setCheckboxValue(PDF_FIELDS.termFall, formData.term.includes('Fall'))
      setCheckboxValue(PDF_FIELDS.termSpring, formData.term.includes('Spring'))
      setCheckboxValue(PDF_FIELDS.termSummer, formData.term.includes('Summer'))

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfPreview(url)
      console.log('PDF generated successfully')
      return { url, blob }
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted')

    try {
      // console.log('Generating PDF...')
      // const { url, blob } = await generatePDF(false) // Generate without signatures
      // console.log('PDF generated, setting preview')
      // setPdfPreview({ url, blob })
      setIsPreviewMode(true)
    } catch (error) {
      console.error('Error processing registration:', error)
      toast.error('Failed to generate form')
    }
  }

  const handleDownload = async () => {
    if (!formData.parentSignature || !formData.studentSignature) {
      toast.error('Please provide both signatures before downloading')
      return
    }

    try {
      const pdfBytes = await generatePDF(true)
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'AE_Form.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      onClose(true)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const handleBack = () => {
    setIsPreviewMode(false)
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview.url)
      setPdfPreview(null)
    }
  }

  const handleClose = () => {
    if (isPreviewMode && formData.studentSignature && formData.parentSignature) {
      // If we have signatures but haven't downloaded, show warning
      const shouldClose = window.confirm(
        'The form has not been downloaded. Are you sure you want to close? You will need to generate the form again.'
      )
      if (shouldClose) {
        onClose(false) // Pass false to indicate no successful download
      }
    } else {
      // If we're not in preview mode or don't have signatures, just close
      onClose(false) // Pass false to indicate no successful download
    }
  }

  useEffect(() => {
    return () => {
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview.url)
      }
    }
  }, [pdfPreview])

  if (loading) {
    return (
      <Modal
        open={true}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 4,
            outline: 'none',
          }}
        >
          <CircularProgress />
        </Box>
      </Modal>
    )
  }

  return (
    <Modal
      open={true}
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 3,
          width: '90%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'auto',
          outline: 'none',
          position: 'relative',
        }}
      >
        {/* Add close button in top-right corner */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <div style={styles.formContainer}>
          {isPreviewMode ? (
            <>
              <div style={styles.previewHeader}>
                <button onClick={handleBack} style={styles.iconButton}>
                  <ArrowBackIcon />
                  <span style={{ marginLeft: '8px' }}>Back to Form</span>
                </button>
              </div>
              <h2 style={styles.title}>Digital Signature</h2>

              {/* <div style={styles.pdfContainer}>
                <iframe src={`${pdfPreview?.url}#toolbar=0`} style={styles.pdfFrame} title="Permission Form Preview" />
              </div> */}
              <div style={styles.previewFooter}>
                <div style={styles.signatureInputs}>
                  <label style={styles.signatureLabel}>
                    Student Signature
                    <input
                      type="text"
                      name="studentSignature"
                      value={formData.studentSignature}
                      onChange={handleInputChange}
                      style={styles.signatureInput}
                    />
                  </label>
                  <label style={styles.signatureLabel}>
                    Parent Signature
                    <input
                      type="text"
                      name="parentSignature"
                      value={formData.parentSignature}
                      onChange={handleInputChange}
                      style={styles.signatureInput}
                    />
                  </label>
                </div>
                <button
                  onClick={handleDownload}
                  style={{
                    ...styles.downloadButton,
                    opacity: signaturesValid ? 1 : 0.5,
                    cursor: signaturesValid ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!signaturesValid}
                >
                  <DownloadIcon />
                  <span style={{ marginLeft: '4px' }}>
                    {signaturesValid ? 'Sign and Download' : 'Both signatures required'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 style={styles.title}>Academic Enrichment Permission Form</h2>
              <form onSubmit={handleSubmit}>
                {/* Student Information */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sierra College ID</label>
                  <input
                    type="text"
                    name="sierraCollegeId"
                    value={formData.sierraCollegeId}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    readOnly
                    placeholder="Complete the Admission Guide to set your Sierra College ID"
                  />
                </div>

                {/* School Information */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current School</label>
                  <input
                    type="text"
                    name="currentSchool"
                    value={formData.currentSchool}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>School Type</label>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="schoolType"
                        value="public"
                        checked={formData.schoolType === 'public'}
                        onChange={handleInputChange}
                      />
                      Public
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="schoolType"
                        value="private"
                        checked={formData.schoolType === 'private'}
                        onChange={handleInputChange}
                      />
                      Private
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="schoolType"
                        value="homeschool"
                        checked={formData.schoolType === 'homeschool'}
                        onChange={handleInputChange}
                      />
                      Homeschool
                    </label>
                  </div>
                </div>

                {/* Parent Information */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Parent/Guardian Name</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Parent/Guardian Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div style={styles.buttonGroup}>
                  <button type="button" onClick={onClose} style={styles.cancelButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitButton}>
                    Next
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </Box>
    </Modal>
  )
}

const styles = {
  formContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
    paddingRight: '1rem',
    minHeight: '500px',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'white',
    marginBottom: '1rem',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#374151',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  pdfContainer: {
    flex: 1,
    overflow: 'hidden',
    padding: '0.5rem',
    backgroundColor: '#f3f4f6',
  },
  pdfFrame: {
    width: '100%',
    height: '70vh',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  title: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '0.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.25rem',
    color: '#666',
  },
  input: {
    width: '100%',
    maxWidth: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  previewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: 'white',
  },
  signatureInputs: {
    display: 'flex',
    gap: '1rem',
  },
  signatureLabel: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.875rem',
    color: '#666',
  },
  signatureInput: {
    width: '150px',
    padding: '0.25rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.875rem',
  },
}

export default RegistrationModal
