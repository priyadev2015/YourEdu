import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { formatDeadlineDate } from '../utils/dateUtils';
import 'react-calendar/dist/Calendar.css';
import './Colleges.css';
import { useNavigate } from 'react-router-dom';

const HomeCollege = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem('adminMaterialsProgress');
    return savedProgress ? JSON.parse(savedProgress) : {
      schoolPhilosophy: 0,
      transcript: 0,
      courseDescriptions: 0,
      gradingRubric: 0,
      guidanceCounselorLetter: 0
    };
  });

  const [schoolList, setSchoolList] = useState([]);

  useEffect(() => {
    const loadSchoolList = () => {
      const savedSchools = localStorage.getItem('mySchoolList');
      if (savedSchools) {
        try {
          const schools = JSON.parse(savedSchools);
          setSchoolList(schools);
        } catch (e) {
          console.error('Error parsing saved schools:', e);
        }
      }
    };

    loadSchoolList();
    window.addEventListener('storage', loadSchoolList);
    return () => window.removeEventListener('storage', loadSchoolList);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.splitLayout}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            <div style={styles.mainContainer}>
              <h2 style={styles.welcomeHeader}>
                <span style={styles.graduationCap}>🎓</span>✨ Welcome to YourEDU's Pilot Program! ✨<span style={styles.graduationCap}>🎓</span>
              </h2>
              <p style={styles.introText}>
                YourEDU is a labor of love, created to give back to the homeschool community that gave us so much. As homeschool graduates ourselves, we understand the unique challenges and opportunities that come with homeschool education. We're building this platform to help bridge the gap between homeschool students and college admissions. Thank you for your feedback and support!
                <br /><br />
                - Henry and Colin, YourEDU Team
              </p>
              <div style={{...styles.resourceContainer, backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px'}}>
                <h2 style={styles.resourceHeader}>Pilot Program Details</h2>
                <ul style={styles.tipsList}>
                  <li style={styles.tipItem}>✓ Early access to our platform features</li>
                  <li style={styles.tipItem}>✓ Direct influence on platform development</li>
                  <li style={styles.tipItem}>✓ Priority support and feedback implementation</li>
                  <li style={styles.tipItem}>✓ Complimentary access during pilot phase</li>
                </ul>
              </div>
              <div style={{
                ...styles.tipsContainer, 
                marginTop: '32px', 
                backgroundColor: '#edf2f7',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <h2 style={styles.tipsHeader}>Platform Overview</h2>
                <ul style={styles.tipsList}>
                  <li style={styles.tipItem}>
                    📚 Admin Materials: Create and manage standardized documentation for homeschool applicants
                  </li>
                  <li style={styles.tipItem}>
                    🎓 Colleges: Set up your college's application requirements and deadlines
                  </li>
                  <li style={styles.tipItem}>
                    💰 Scholarships: Manage scholarship opportunities available to homeschool students
                  </li>
                  <li style={styles.tipItem}>
                    ⚙️ Account Settings: Manage your profile and customize your preferences
                  </li>
                </ul>
              </div>
              <div style={{
                ...styles.feedbackSection, 
                marginTop: '32px',
                textAlign: 'center'
              }}>
                <p style={styles.feedbackText}>
                  Your feedback is crucial during this pilot phase!
                </p>
                <div style={{
                  ...styles.buttonContainer,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <a 
                    href="https://forms.gle/voaAD1mt6SK16m8YA" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.feedbackButton}
                  >
                    📝 Submit Feedback
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Admin Materials Status Section */}
            <div style={styles.mainContainer}>
              <h2 style={styles.sectionHeader}>Admin Materials Status</h2>
              <div style={styles.progressContainer}>
                {Object.entries(progress).map(([key, value]) => (
                  <div key={key} style={styles.progressItem}>
                    <div style={styles.progressLabel}>
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                      }
                    </div>
                    <div style={styles.progressBarContainer}>
                      <div 
                        style={{
                          ...styles.progressBar,
                          width: `${value}%`,
                          backgroundColor: value === 100 ? '#4CAF50' : '#007BFF'
                        }}
                      />
                    </div>
                    <div style={styles.progressValue}>{value}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* College Deadlines Section */}
            <div style={styles.mainContainer}>
              <h2 style={styles.sectionHeader}>Application Deadlines</h2>
              <div style={styles.deadlinesContainer}>
                {schoolList.length > 0 ? (
                  schoolList.map((school, index) => (
                    <div key={index} style={styles.deadlineItem}>
                      <span style={styles.schoolName}>{school.name}</span>
                      <div style={styles.deadlineDetails}>
                        {school.deadlines && Object.entries(school.deadlines).map(([type, date]) => (
                          <div key={type} style={styles.deadlineRow}>
                            <span style={styles.deadlineType}>
                              <strong>{type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}:</strong>
                            </span>
                            <span style={styles.deadlineDate}>{formatDeadlineDate(date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyDeadlines}>
                    <p>No deadlines set</p>
                    <button 
                      onClick={() => navigate('/school-search')} 
                      style={styles.addDeadlinesButton}
                    >
                      Set Application Deadlines
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  splitLayout: {
    flex: 1,
    padding: '24px',
    display: 'flex',
    gap: '24px',
  },
  leftColumn: {
    flex: '2',
  },
  rightColumn: {
    flex: '1',
  },
  mainContainer: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(49, 130, 206, 0.1)',
    marginBottom: '24px',
  },
  welcomeHeader: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#00356b',
    marginBottom: '8px',
    textAlign: 'center',
  },
  introText: {
    fontSize: '14px',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  resourceHeader: {
    fontSize: '18px',
    marginBottom: '8px',
    color: '#2D3748',
  },
  tipsHeader: {
    fontSize: '19px',
    marginBottom: '6px',
    color: '#2D3748',
    fontWeight: '600',
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4',
  },
  tipItem: {
    marginBottom: '6px',
  },
  feedbackButton: {
    backgroundColor: '#00356b',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
  },
  addDeadlinesButton: {
    backgroundColor: '#00356b',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '12px',
    fontSize: '14px',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '16px',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  progressItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressLabel: {
    flex: '1',
    fontSize: '14px',
    color: '#4A5568',
  },
  progressBarContainer: {
    flex: '2',
    height: '8px',
    backgroundColor: '#EDF2F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  progressValue: {
    minWidth: '45px',
    fontSize: '14px',
    color: '#4A5568',
    textAlign: 'right',
  },
  deadlinesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  deadlineItem: {
    padding: '12px',
    backgroundColor: '#F7FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  deadlineDetails: {
    marginTop: '8px',
  },
  deadlineRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#4A5568',
    marginTop: '4px',
  },
  schoolName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3748',
  },
  emptyDeadlines: {
    textAlign: 'center',
    padding: '20px',
  },
};

export default HomeCollege; 