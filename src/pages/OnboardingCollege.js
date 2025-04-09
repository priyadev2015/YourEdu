import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

// Move FormField component outside of OnboardingCollege
const FormField = ({ field, value, onChange, formData }) => {
  switch (field.type) {
    case 'text':
      return (
        <div style={styles.fieldContainer}>
          <label style={styles.label}>{field.label}</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            style={styles.input}
            required={field.required}
          />
        </div>
      );

    case 'textarea':
      return (
        <div style={styles.fieldContainer}>
          <label style={styles.label}>{field.label}</label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            style={styles.textarea}
            required={field.required}
          />
        </div>
      );

    case 'toggle':
      return (
        <div style={styles.fieldContainer}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(field.key, e.target.checked)}
              style={styles.toggle}
            />
            {field.label}
          </label>
        </div>
      );

    case 'checkboxGroup':
      return (
        <div style={styles.fieldContainer}>
          <label style={styles.label}>{field.label}</label>
          <div style={styles.checkboxGroup}>
            {field.options.map((option) => (
              <label key={option} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), option]
                      : (value || []).filter(item => item !== option);
                    onChange(field.key, newValue);
                  }}
                  style={styles.checkbox}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      );

    case 'select':
      return (
        <div style={styles.fieldContainer}>
          <label style={styles.label}>{field.label}</label>
          <select
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            style={styles.select}
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );

    case 'date':
      return (
        <div style={styles.fieldContainer}>
          <label style={styles.label}>{field.label}</label>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            style={styles.input}
            required={field.required}
          />
        </div>
      );
  }
};

// Define styles before they're used by FormField
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    color: '#00356b',
    fontSize: '32px',
    marginBottom: '20px',
  },
  welcome: {
    fontSize: '18px',
    color: '#666',
    lineHeight: '1.5',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '40px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007BFF',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minHeight: '100px'
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  fieldContainer: {
    marginBottom: '2rem',
    padding: '0.5rem 0'
  },
  loadingMessage: {
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '500'
  },
  label: {
    display: 'block',
    marginBottom: '0.75rem',
    fontSize: '1rem',
    fontWeight: '500'
  },
  formSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    color: '#00356b',
    fontSize: '24px',
    marginBottom: '1.5rem',
  }
};

const OnboardingCollege = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    currentGrade: '',
    graduationDate: '',
    city: '',
    state: '',
    homeschoolMethods: [],
    homeschoolOther: '',
    homeschoolProgram: ''
  });

  const homeschoolOptions = [
    'At-home',
    'Self-directed',
    'Instructed by Parent',
    'Instructed by Tutor',
    'Homeschool Co-op',
    'Community College dual enroll',
    'Microschool',
    'Online Classes',
    'College/University courses',
    'Local public school courses'
  ];

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii",
    "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
    "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ];

  // Check if onboarding is completed
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/profile?userId=${user.id}`);
        
        // For new users, the profile won't exist yet - this is expected
        // We should allow them to continue with the onboarding
        if (response.status === 404) {
          console.log('No profile found - new user');
          return;
        }

        // For any other error, throw
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // If onboarding is completed and we're not editing, redirect to home
        if (data.profile?.collegeOnboardingCompleted && !location.state?.isEditing) {
          console.log('Onboarding completed, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        // Only log errors that aren't 404s
        if (error.message !== 'No profile found - new user') {
          console.error('Error checking onboarding status:', error);
        }
      }
    };

    if (user?.id) {
      console.log('Checking onboarding status for user:', user.id);
      checkOnboarding();
    }
  }, [user, navigate, location.state]);

  // Load existing data if editing
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const data = await response.json();
        
        if (data.profile) {
          setFormData(data.profile);
          setIsEditMode(true);
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (location.state?.isEditing) {
      loadOnboardingData();
    }
  }, [user, location.state]);

  const sections = [
    {
      title: "Basic Information",
      fields: [
        {
          type: "text",
          label: "Student's Name",
          key: "studentName",
          required: true
        },
        {
          type: "select",
          label: "Current Grade",
          key: "currentGrade",
          options: ["9", "10", "11", "12"],
          required: true
        },
        {
          type: "date",
          label: "Graduation Date",
          key: "graduationDate",
          required: true
        },
        {
          type: "text",
          label: "City",
          key: "city",
          required: true
        },
        {
          type: "select",
          label: "State",
          key: "state",
          options: states,
          required: true
        }
      ]
    },
    {
      title: "Homeschool Information",
      fields: [
        {
          type: "checkboxGroup",
          label: "How do you homeschool? (Select all that apply)",
          key: "homeschoolMethods",
          options: homeschoolOptions
        },
        {
          type: "text",
          label: "Any other homeschool methods?",
          key: "homeschoolOther"
        },
        {
          type: "text",
          label: "Do you homeschool under a specific program?",
          key: "homeschoolProgram",
          placeholder: "If yes, please specify"
        }
      ]
    }
  ];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const requiredFields = ['studentName', 'currentGrade', 'graduationDate'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      console.log('Submitting college onboarding data:', formData);
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          collegeOnboardingCompleted: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Saved profile data:', data);
        alert(isEditMode ? 'Your information has been updated!' : 'Registration completed successfully!');
        navigate('/', { state: { onboardingUpdated: true } });
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving college onboarding data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isEditMode ? 'Edit Your Information' : 'College Registration Form'}
        </h1>
        {isLoading && (
          <div style={styles.loadingMessage}>
            Loading your data...
          </div>
        )}
        <p style={styles.welcome}>
          {isEditMode 
            ? 'Update your information below to help us better assist you.'
            : 'Welcome! Please complete this form to help us better understand your needs.'}
        </p>
      </div>
      
      {!isLoading && (
        <>
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>{sections[currentSection].title}</h2>
            {sections[currentSection].fields.map((field, index) => (
              <FormField
                key={index}
                field={field}
                value={formData[field.key]}
                onChange={handleInputChange}
                formData={formData}
              />
            ))}
          </div>

          <div style={styles.navigation}>
            {currentSection > 0 && (
              <button 
                onClick={() => setCurrentSection(prev => prev - 1)}
                style={styles.button}
              >
                Previous
              </button>
            )}
            {currentSection < sections.length - 1 ? (
              <button 
                onClick={() => setCurrentSection(prev => prev + 1)}
                style={styles.button}
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                style={styles.submitButton}
              >
                {isEditMode ? 'Update Information' : 'Complete Registration'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingCollege; 