import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';

const InternshipApplication = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    grade: '',
    location: '',
    
    // Education
    currentSchool: '',
    gpa: '',
    relevantCourses: '',
    
    // Experience & Skills
    technicalSkills: '',
    softSkills: '',
    previousExperience: '',
    projectsPortfolio: '',
    
    // Interests & Availability
    desiredRole: '',
    interests: [],
    preferredDuration: '',
    weeklyAvailability: '',
    startDate: '',
    
    // Additional Information
    whyInterested: '',
    whatToLearn: '',
    additionalInfo: '',
    
    // Documents
    resume: null,
    coverLetter: null,
    transcript: null,
  });

  const interestOptions = [
    'Artificial Intelligence',
    'Software Development',
    'Data Analysis',
    'Web Development',
    'Business Operations',
    'Marketing',
    'Education Technology',
    'Environmental Science',
    'Finance',
    'Project Management',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add submission logic here
  };

  return (
    <div style={styles.container}>
      <PageHeader title="Internship Application" />
      
      <div style={styles.formContainer}>
        <div style={styles.introText}>
          <h2>Join Our Internship Program</h2>
          <p>Thank you for your interest in our internship opportunities. Please fill out the form below carefully. We review all applications thoroughly to ensure the best match between interns and positions.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  required
                  style={styles.input}
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name *</label>
                <input
                  type="text"
                  required
                  style={styles.input}
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              {/* Add more personal info fields */}
            </div>
          </div>

          {/* Education Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Education</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current School/Program *</label>
                <input
                  type="text"
                  required
                  style={styles.input}
                  value={formData.currentSchool}
                  onChange={(e) => setFormData({...formData, currentSchool: e.target.value})}
                />
              </div>
              {/* Add more education fields */}
            </div>
          </div>

          {/* Experience & Skills Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Experience & Skills</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Technical Skills</label>
              <textarea
                style={styles.textarea}
                value={formData.technicalSkills}
                onChange={(e) => setFormData({...formData, technicalSkills: e.target.value})}
                placeholder="List any programming languages, tools, or technical skills you possess"
              />
            </div>
            {/* Add more experience fields */}
          </div>

          {/* Interests & Availability Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Interests & Availability</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Areas of Interest</label>
              <div style={styles.checkboxGrid}>
                {interestOptions.map(interest => (
                  <label key={interest} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={(e) => {
                        const newInterests = e.target.checked
                          ? [...formData.interests, interest]
                          : formData.interests.filter(i => i !== interest);
                        setFormData({...formData, interests: newInterests});
                      }}
                    />
                    {interest}
                  </label>
                ))}
              </div>
            </div>
            {/* Add more availability fields */}
          </div>

          {/* Documents Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Required Documents</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Resume *</label>
              <input
                type="file"
                required
                style={styles.fileInput}
                onChange={(e) => setFormData({...formData, resume: e.target.files[0]})}
              />
            </div>
            {/* Add more document upload fields */}
          </div>

          <button type="submit" style={styles.submitButton}>
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  introText: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#2d3748',
    marginBottom: '1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#4a5568',
    fontSize: '0.875rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0',
    minHeight: '100px',
    fontSize: '1rem',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  fileInput: {
    width: '100%',
    padding: '0.5rem',
  },
  submitButton: {
    backgroundColor: '#3182ce',
    color: 'white',
    padding: '1rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#2c5282',
    },
  },
};

export default InternshipApplication; 