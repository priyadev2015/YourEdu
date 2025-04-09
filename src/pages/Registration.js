import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import PageHeader from '../components/PageHeader';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { sendEmail } from '../utils/emailService';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const Registration = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [registrations, setRegistrations] = useState([]);
  const [currentForm, setCurrentForm] = useState('compliance'); // 'compliance' or 'permission'
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolType: '',
    academicYear: '',
    cdsCode: '',
    schoolName: '',
    phoneNumber: '',
    schoolAddress: '',
    principalName: '',
    principalEmail: '',
    designeeName: '',
    designeeEmail: '',
    // Permission form fields
    lastName: '',
    firstName: '',
    collegeId: '',
    currentSchool: '',
    schoolType: '',
    enrollmentTerm: '',
    enrollmentYear: '',
    courseOne: '',
    courseTwo: ''
  });

  useEffect(() => {
    // Load registrations for current user
    const loadRegistrations = () => {
      const savedRegistrations = JSON.parse(localStorage.getItem('courseRegistrations') || '[]');
      const userRegistrations = savedRegistrations.filter(reg => reg.studentId === user.id);
      setRegistrations(userRegistrations);
    };
    loadRegistrations();
  }, [user.id]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FFA000';
      case 'rejected': return '#F44336';
      default: return '#666666';
    }
  };

  const handleNextForm = () => {
    setCurrentForm('permission');
    setPageNumber(1); // Reset page number for new form
  };

  const handleSendForm = async () => {
    // Implement form submission logic here
    // For example, you can send the form data to a server
    try {
      await sendEmail(formData);
      // Handle email sending success
    } catch (error) {
      // Handle email sending error
    }
  };

  return (
    <div style={styles.container}>
      <PageHeader title="Course Registration" />
      
      {/* Registration Status Section */}
      <div style={styles.statusSection}>
        <h2 style={styles.sectionTitle}>Registration Status</h2>
        {registrations.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No Course Registrations</h3>
            <p style={styles.emptyText}>
              You haven't registered for any courses yet. Browse available courses to get started.
            </p>
            <button 
              onClick={() => navigate('/coursesearch')}
              style={styles.browseButton}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={styles.registrationGrid}>
            {registrations.map((registration) => (
              <div key={registration.id} style={styles.registrationCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.courseTitle}>{registration.courseTitle}</h3>
                  <span style={{
                    ...styles.status,
                    backgroundColor: getStatusColor(registration.status)
                  }}>
                    {registration.status}
                  </span>
                </div>
                <div style={styles.cardContent}>
                  <p>Submitted: {new Date(registration.submittedAt).toLocaleDateString()}</p>
                  <p>Student: {registration.studentName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forms Section */}
      <div style={styles.formSection}>
        <h2 style={styles.sectionTitle}>
          {currentForm === 'compliance' ? 'Compliance Form' : 'Academic Enrichment Permission Form'}
        </h2>
        
        <div style={styles.formProgress}>
          <div style={{
            ...styles.progressStep,
            backgroundColor: currentForm === 'compliance' ? '#4CAF50' : '#ddd'
          }}>
            1. Compliance Form
          </div>
          <div style={styles.progressLine}></div>
          <div style={{
            ...styles.progressStep,
            backgroundColor: currentForm === 'permission' ? '#4CAF50' : '#ddd'
          }}>
            2. Permission Form
          </div>
        </div>

        <div style={styles.splitLayout}>
          {/* Form Filling Section */}
          <div style={styles.formFillingSection}>
            <h2 style={styles.formTitle}>
              {currentForm === 'compliance' ? 'Compliance Form Details' : 'Permission Form Details'}
            </h2>

            {currentForm === 'compliance' ? (
              <div style={styles.formFields}>
                <div style={styles.fieldGroup}>
                  <h3 style={styles.fieldGroupTitle}>School Type</h3>
                  <div style={styles.radioGroup}>
                    {['Public School/Charter', 'Private School', 'Private Home School'].map(type => (
                      <label key={type} style={styles.radioLabel}>
                        <input
                          type="radio"
                          name="schoolType"
                          value={type}
                          checked={formData.schoolType === type}
                          onChange={(e) => setFormData({...formData, schoolType: e.target.value})}
                          style={styles.radioInput}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Academic Year</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                      placeholder="2023-2024"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>CDS Code</label>
                    <input
                      type="text"
                      value={formData.cdsCode}
                      onChange={(e) => setFormData({...formData, cdsCode: e.target.value})}
                      placeholder="Enter CDS code"
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Add more compliance form fields... */}
              </div>
            ) : (
              <div style={styles.formFields}>
                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Add more permission form fields... */}
              </div>
            )}

            <div style={styles.formActions}>
              <button 
                onClick={handleSendForm} 
                style={styles.sendButton}
              >
                Send Form
              </button>
            </div>
          </div>

          {/* PDF Display Section - your existing code */}
          <div style={styles.pdfSection}>
            <Document
              file={currentForm === 'compliance' ? 
                "/AE-Compliance-Form.pdf" : 
                "/academic-enrichment-permission-form.pdf"
              }
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                console.log('PDF loaded successfully');
              }}
              onLoadError={(error) => {
                console.error('Error loading PDF:', error);
              }}
            >
              <Page 
                pageNumber={pageNumber}
                scale={1.2}
              />
            </Document>
            
            {numPages && (
              <div style={styles.pdfControls}>
                <button 
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                  style={styles.pdfButton}
                >
                  Previous
                </button>
                <span style={styles.pageInfo}>Page {pageNumber} of {numPages}</span>
                <button 
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                  disabled={pageNumber >= numPages}
                  style={styles.pdfButton}
                >
                  Next
                </button>
              </div>
            )}

            {currentForm === 'compliance' && (
              <button 
                onClick={handleNextForm}
                style={styles.nextFormButton}
              >
                Continue to Permission Form
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const newStyles = {
  splitLayout: {
    display: 'flex',
    gap: '24px',
    marginTop: '24px',
  },
  formFillingSection: {
    flex: '1',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  pdfSection: {
    flex: '1',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '24px',
  },
  formFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  fieldGroupTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: '12px',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#2D3748',
    cursor: 'pointer',
  },
  radioInput: {
    cursor: 'pointer',
  },
  fieldRow: {
    display: 'flex',
    gap: '16px',
  },
  field: {
    flex: '1',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    color: '#2D3748',
    '&:focus': {
      outline: 'none',
      borderColor: '#3182CE',
      boxShadow: '0 0 0 1px #3182CE',
    },
  },
  formActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sendButton: {
    backgroundColor: '#00356b',
    color: 'white',
    padding: '10px 24px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
};

const styles = {
  container: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '24px',
    position: 'relative',
  },
  statusSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '24px',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '16px',
  },
  registrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  registrationCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '1rem',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    padding: '1rem',
  },
  courseTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#333',
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  pdfContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  pdfControls: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginTop: '1rem',
  },
  pdfButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:disabled': {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
  },
  pageInfo: {
    color: '#666',
    fontSize: '0.9rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    border: '1px dashed #ccc',
    borderRadius: '8px',
  },
  emptyTitle: {
    fontSize: '1.2rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#666',
    marginBottom: '1rem',
  },
  browseButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  formProgress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    padding: '1rem',
  },
  progressStep: {
    padding: '0.75rem 1.5rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
  },
  progressLine: {
    height: '2px',
    width: '100px',
    backgroundColor: '#ddd',
    margin: '0 1rem',
  },
  nextFormButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1.5rem',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
  ...newStyles,
};

export default Registration;