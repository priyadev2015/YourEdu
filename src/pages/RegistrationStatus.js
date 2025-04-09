import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import PageHeader from '../components/PageHeader';

const RegistrationStatus = () => {
  const [registrations, setRegistrations] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div style={styles.container}>
      <PageHeader title="Registration Status" />
      
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
          {registrations.map((reg) => (
            <div key={reg.id} style={styles.registrationCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.courseTitle}>{reg.courseTitle}</h3>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(reg.status)
                }}>
                  {reg.status}
                </span>
              </div>
              
              <div style={styles.cardContent}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Submitted:</span>
                  <span style={styles.value}>
                    {new Date(reg.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Student Name:</span>
                  <span style={styles.value}>{reg.studentName}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Email:</span>
                  <span style={styles.value}>{reg.email}</span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <p style={styles.footerText}>
                  {reg.status === 'pending' ? 
                    'Your registration is being reviewed. You will receive an email when a decision is made.' :
                    reg.status === 'approved' ? 
                    'Registration approved! Check your email for next steps.' :
                    'Registration not approved. Please contact admissions for more information.'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  registrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  registrationCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#333',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  cardContent: {
    padding: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  label: {
    color: '#666',
    fontWeight: '500',
  },
  value: {
    color: '#333',
  },
  cardFooter: {
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #eee',
  },
  footerText: {
    margin: 0,
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginTop: '2rem',
  },
  emptyTitle: {
    color: '#333',
    marginBottom: '1rem',
  },
  emptyText: {
    color: '#666',
    marginBottom: '2rem',
  },
  browseButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
};

export default RegistrationStatus; 