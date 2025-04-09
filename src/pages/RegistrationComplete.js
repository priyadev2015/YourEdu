import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const RegistrationComplete = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <PageHeader title="Registration Complete" />
      <div style={styles.content}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.title}>Thank You for Registering!</h2>
        <p style={styles.message}>
          Your registration has been received and is being processed. You will receive 
          an email within 1-2 business days with further instructions and your course materials.
        </p>
        <div style={styles.nextSteps}>
          <h3 style={styles.subtitle}>Next Steps:</h3>
          <ol style={styles.stepsList}>
            <li>Check your email for registration confirmation</li>
            <li>Complete any required forms sent to you</li>
            <li>Watch for course access instructions</li>
          </ol>
        </div>
        <button 
          onClick={() => navigate('/registration/status')}
          style={styles.button}
        >
          View Registration Status
        </button>
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
  content: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  successIcon: {
    fontSize: '3rem',
    color: '#4CAF50',
    marginBottom: '1rem',
  },
  title: {
    color: '#333',
    marginBottom: '1rem',
  },
  message: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  nextSteps: {
    textAlign: 'left',
    marginBottom: '2rem',
  },
  subtitle: {
    color: '#333',
    marginBottom: '1rem',
  },
  stepsList: {
    color: '#666',
    lineHeight: '1.6',
    paddingLeft: '1.5rem',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }
};

export default RegistrationComplete; 