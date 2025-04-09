import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Profile
    numberOfStudents: '',
    students: [{
      fullName: '',
      gradeLevel: '',
      graduationDate: ''
    }],
    state: '',
    homeschoolProgram: '',
    stateRequirements: [],
    homeschoolGoals: [],
    curriculumType: '',

    // Course Planning
    interests: [],
    plannedCourses: '',
    learningStyle: '',
    courseDelivery: [],
    currentResources: '',
    useBenchmarks: false,
    useReminders: false,

    // Extracurriculars
    currentActivities: [],
    desiredActivities: '',
    trackHours: false,
    skillsToDevelop: [],
    wantOpportunities: false,

    // Career Exploration
    careerInterests: [],
    careerSkills: '',
    wantCareerResources: false,
    integrateCareerExploration: false,

    // College Prep
    collegePlans: '',
    specificColleges: '',
    wantCollegeReminders: false,
    standardizedTests: [],
    wantTestTracking: false,

    // Preferences
    notificationFrequency: '',
    wantGuidance: false
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if onboarding is already completed
    const checkOnboarding = async () => {
      try {
        console.log('Checking onboarding status...');
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const data = await response.json();
        console.log('Onboarding status data:', data);
        
        // Only redirect if onboarding is completed and we're not in edit mode
        if (data.profile?.onboardingCompleted && !location.state?.isEditing) {
          console.log('Redirecting to home - onboarding completed and not in edit mode');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboarding();
  }, [user, navigate, location.state]);

  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading onboarding data...');
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const data = await response.json();
        console.log('Loaded onboarding data:', data);
        
        if (data.profile) {
          console.log('Setting form data with profile data');
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
      console.log('Edit mode detected, loading data...');
      loadOnboardingData();
    }
  }, [user, location.state]);

  const sections = [
    {
      title: "Basic Profile and Setup",
      fields: [
        {
          type: "number",
          label: "How many students are you homeschooling?",
          key: "numberOfStudents",
          required: true,
        },
        {
          type: "studentInfo",
          label: "Student Information",
          key: "students",
          required: true,
        },
        {
          type: "select",
          label: "Which state are you homeschooling in?",
          key: "state",
          options: [
            "Alabama",
            "Alaska",
            "Arizona",
            "Arkansas",
            "California",
            "Colorado",
            "Connecticut",
            "Delaware",
            "District of Columbia",
            "Florida",
            "Georgia",
            "Hawaii",
            "Idaho",
            "Illinois",
            "Indiana",
            "Iowa",
            "Kansas",
            "Kentucky",
            "Louisiana",
            "Maine",
            "Maryland",
            "Massachusetts",
            "Michigan",
            "Minnesota",
            "Mississippi",
            "Missouri",
            "Montana",
            "Nebraska",
            "Nevada",
            "New Hampshire",
            "New Jersey",
            "New Mexico",
            "New York",
            "North Carolina",
            "North Dakota",
            "Ohio",
            "Oklahoma",
            "Oregon",
            "Pennsylvania",
            "Rhode Island",
            "South Carolina",
            "South Dakota",
            "Tennessee",
            "Texas",
            "Utah",
            "Vermont",
            "Virginia",
            "Washington",
            "West Virginia",
            "Wisconsin",
            "Wyoming"
          ],
          required: true,
        },
        {
          type: "text",
          label: "Are you homeschooling under a specific program, charter or microschool?",
          key: "homeschoolProgram",
        },
        {
          type: "checkboxGroup",
          label: "What type of homeschool documentation or reporting is required in your state?",
          key: "stateRequirements",
          options: [
            "Annual assessments",
            "Attendance tracking",
            "Portfolio review",
            "Standardized testing",
            "Other"
          ],
        },
        {
          type: "checkboxGroup",
          label: "What are your primary goals for homeschooling?",
          key: "homeschoolGoals",
          options: [
            "College prep",
            "Career exploration",
            "Customized curriculum",
            "Flexible scheduling",
            "Individual pacing",
            "Special needs accommodation"
          ],
        },
        {
          type: "select",
          label: "What type of high school curriculum are you following?",
          key: "curriculumType",
          options: [
            "Standard diploma",
            "Honors",
            "Advanced/AP",
            "Custom"
          ],
        },
      ],
    },
    {
      title: "Course Planning",
      fields: [
        {
          type: "checkboxGroup",
          label: "What subjects or areas does your student show the most interest in?",
          key: "interests",
          options: [
            "Mathematics",
            "Science",
            "English/Literature",
            "History",
            "Foreign Languages",
            "Arts",
            "Music",
            "Computer Science",
            "Physical Education",
            "Social Studies"
          ]
        },
        {
          type: "textarea",
          label: "Are there specific courses you plan to include each year?",
          key: "plannedCourses",
          placeholder: "E.g., AP Calculus, Honors English, etc."
        },
        {
          type: "select",
          label: "What is your student's primary learning style?",
          key: "learningStyle",
          options: [
            "Visual",
            "Auditory",
            "Reading/Writing",
            "Kinesthetic",
            "Mixed"
          ]
        },
        {
          type: "checkboxGroup",
          label: "How would you prefer to fulfill most course requirements?",
          key: "courseDelivery",
          options: [
            "Online courses",
            "In-person co-ops",
            "Dual enrollment",
            "Parent-taught",
            "Tutoring"
          ]
        },
        {
          type: "textarea",
          label: "Are there any specific resources or programs you are already using or interested in?",
          key: "currentResources"
        },
        {
          type: "toggle",
          label: "Would you like to set quarterly or semester-based benchmarks?",
          key: "useBenchmarks"
        },
        {
          type: "toggle",
          label: "Do you want automatic reminders to update course progress or grades?",
          key: "useReminders"
        }
      ]
    },
    {
      title: "Extracurriculars",
      fields: [
        {
          type: "checkboxGroup",
          label: "What extracurricular activities is your student currently involved in?",
          key: "currentActivities",
          options: [
            "Sports",
            "Music",
            "Art",
            "Theater",
            "Clubs",
            "Volunteer work",
            "Part-time job",
            "Internship",
            "Other"
          ]
        },
        {
          type: "textarea",
          label: "Are there any new extracurriculars they'd like to explore?",
          key: "desiredActivities"
        },
        {
          type: "toggle",
          label: "Do you want reminders for upcoming activities or volunteer hours to track?",
          key: "trackHours"
        },
        {
          type: "checkboxGroup",
          label: "What specific skills would your student like to develop?",
          key: "skillsToDevelop",
          options: [
            "Public speaking",
            "Leadership",
            "Teamwork",
            "Time management",
            "Creative thinking",
            "Problem-solving",
            "Technical skills"
          ]
        },
        {
          type: "toggle",
          label: "Would you be interested in suggested opportunities based on your student's interests?",
          key: "wantOpportunities"
        }
      ]
    },
    {
      title: "Career Exploration",
      fields: [
        {
          type: "checkboxGroup",
          label: "What career fields is your student interested in?",
          key: "careerInterests",
          options: [
            "STEM",
            "Healthcare",
            "Business",
            "Arts",
            "Education",
            "Trades",
            "Law",
            "Government",
            "Nonprofit",
            "Entrepreneurship"
          ]
        },
        {
          type: "textarea",
          label: "What specific skills would they like to develop for these fields?",
          key: "careerSkills"
        },
        {
          type: "toggle",
          label: "Would you like access to career exploration resources?",
          key: "wantCareerResources"
        },
        {
          type: "toggle",
          label: "Would you like suggestions on integrating career exploration into the curriculum?",
          key: "integrateCareerExploration"
        }
      ]
    },
    {
      title: "College Prep",
      fields: [
        {
          type: "select",
          label: "What are your student's college plans?",
          key: "collegePlans",
          options: [
            "4-year university",
            "Community college",
            "Trade school",
            "Gap year",
            "Undecided"
          ]
        },
        {
          type: "textarea",
          label: "Do you have specific colleges in mind?",
          key: "specificColleges"
        },
        {
          type: "toggle",
          label: "Would you like reminders for college preparation milestones?",
          key: "wantCollegeReminders"
        },
        {
          type: "checkboxGroup",
          label: "Which standardized tests are you planning to take?",
          key: "standardizedTests",
          options: [
            "SAT",
            "ACT",
            "AP Exams",
            "SAT Subject Tests",
            "None planned yet"
          ]
        },
        {
          type: "toggle",
          label: "Would you like help tracking test dates and preparation milestones?",
          key: "wantTestTracking"
        }
      ]
    },
    {
      title: "My Account and Preferences",
      fields: [
        {
          type: "select",
          label: "How frequently would you like updates and reminders?",
          key: "notificationFrequency",
          options: [
            "Weekly",
            "Monthly",
            "Only as needed",
            "None"
          ]
        },
        {
          type: "toggle",
          label: "Would you like additional guidance or tips based on your responses?",
          key: "wantGuidance"
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

  const handleStudentChange = (index, field, value) => {
    setFormData(prev => {
      const newStudents = [...prev.students];
      newStudents[index] = {
        ...newStudents[index],
        [field]: value
      };
      return {
        ...prev,
        students: newStudents
      };
    });
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting onboarding data:', formData);
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          onboardingCompleted: true
        }),
      });

      if (response.ok) {
        console.log('Onboarding data saved successfully');
        alert(isEditMode ? 'Your onboarding data has been updated!' : 'Onboarding completed successfully!');
        navigate('/', { state: { onboardingUpdated: true } });
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save onboarding data. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isEditMode ? 'Edit Your Onboarding Information' : 'YourEDU Onboarding and Intake Form'}
        </h1>
        {isLoading && (
          <div style={styles.loadingMessage}>
            Loading your data...
          </div>
        )}
        <p style={styles.welcome}>
          {isEditMode 
            ? 'Update your information below to help us better personalize your experience.'
            : 'Welcome to YourEDU! We\'re excited to help you navigate your homeschool journey. Please complete this intake form to register with YourEDU and help us personalize your experience.'}
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
                onStudentChange={handleStudentChange}
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
                Complete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

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
};

// FormField component to handle different field types
const FormField = ({ field, value, onChange, onStudentChange, formData }) => {
  switch (field.type) {
    case 'number':
      return (
        <div style={styles.fieldContainer}>
          <label style={styles.label}>{field.label}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(field.key, parseInt(e.target.value))}
            style={styles.input}
            required={field.required}
          />
        </div>
      );
    
    case 'studentInfo':
      return (
        <div style={styles.fieldContainer}>
          {formData.numberOfStudents > 0 && Array.from({ length: formData.numberOfStudents }).map((_, index) => (
            <div key={index} style={styles.studentContainer}>
              <h3 style={styles.studentHeader}>Student {index + 1}</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.students[index]?.fullName || ''}
                onChange={(e) => onStudentChange(index, 'fullName', e.target.value)}
                style={styles.input}
                required
              />
              <select
                value={formData.students[index]?.gradeLevel || ''}
                onChange={(e) => onStudentChange(index, 'gradeLevel', e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Select Grade Level</option>
                <option value="9th">9th Grade</option>
                <option value="10th">10th Grade</option>
                <option value="11th">11th Grade</option>
                <option value="12th">12th Grade</option>
              </select>
              <input
                type="text"
                placeholder="Expected Graduation Date"
                value={formData.students[index]?.graduationDate || ''}
                onChange={(e) => onStudentChange(index, 'graduationDate', e.target.value)}
                style={styles.input}
                required
              />
            </div>
          ))}
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
  }
};

export default Onboarding; 