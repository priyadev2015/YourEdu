import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const YoureduAdmin = () => {
  const navigate = useNavigate();

  const handleSelection = (userType) => {
    localStorage.setItem('userType', userType);
    localStorage.setItem('isPilotUser', 'false');
    navigate('/admin-login', { state: { userType } });
  };

  const [adminHover, setAdminHover] = useState(false);
  const [parentHover, setParentHover] = useState(false);
  const [studentHover, setStudentHover] = useState(false);

  return (
    <div style={styles.container}>
      {/* Main logo */}
      <img 
        src="/youredu-2.png" 
        alt="YourEDU" 
        style={styles.mainLogo}
      />

      <div style={styles.content}>
        {/* Tree logo */}
        <div style={styles.treeLogo}>
          <img src={logo} alt="Tree Logo" style={styles.logo} />
        </div>

        {/* Welcome section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.title}>YourEDU Admin Portal</h1>
          <div style={styles.pilotBadge}>ADMIN ACCESS</div>
          <p style={styles.subtitle}>
            Welcome to the YourEDU administrative portal. 
            Please select your login type below.
          </p>
        </div>

        {/* Role selection */}
        <div style={styles.buttonContainer}>
          <button 
            onClick={() => handleSelection('admin')} 
            onMouseEnter={() => setAdminHover(true)}
            onMouseLeave={() => setAdminHover(false)}
            style={{
              ...styles.button,
              ...styles.adminButton,
              ...(adminHover ? styles.adminButtonHover : {})
            }}
          >
            <span style={styles.buttonTitle}>Admin Login</span>
          </button>

          <button 
            onClick={() => handleSelection('highschool')} 
            onMouseEnter={() => setParentHover(true)}
            onMouseLeave={() => setParentHover(false)}
            style={{
              ...styles.button,
              ...styles.parentButton,
              ...(parentHover ? styles.parentButtonHover : {})
            }}
          >
            <span style={styles.buttonTitle}>K-12 Parent (Full)</span>
          </button>
          
          <button 
            onClick={() => handleSelection('student')} 
            onMouseEnter={() => setStudentHover(true)}
            onMouseLeave={() => setStudentHover(false)}
            style={{
              ...styles.button,
              ...styles.studentButton,
              ...(studentHover ? styles.studentButtonHover : {})
            }}
          >
            <span style={styles.buttonTitle}>K-12 Student (Full)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(150deg, #ffffff 0%, #f0f7ff 100%)',
    position: 'relative',
    padding: '20px',
  },
  mainLogo: {
    width: '160px',
    position: 'absolute',
    top: '32px',
    left: '32px',
  },
  content: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 53, 107, 0.1)',
    marginTop: '40px',
  },
  treeLogo: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    color: '#00356B',
    fontWeight: '700',
    marginBottom: '16px',
    letterSpacing: '-0.02em',
  },
  pilotBadge: {
    backgroundColor: '#1A365D',
    color: 'white',
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    marginBottom: '24px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#2D3748',
    lineHeight: '1.6',
    marginBottom: '16px',
    padding: '0 20px',
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  button: {
    width: '100%',
    padding: '20px',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
  },
  adminButton: {
    background: '#1A365D',
  },
  adminButtonHover: {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 20px rgba(26, 54, 93, 0.2)',
  },
  buttonTitle: {
    fontSize: '18px',
    fontWeight: '600',
  },
  parentButton: {
    background: '#00356B',
  },
  parentButtonHover: {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 20px rgba(0, 53, 107, 0.2)',
  },
  studentButton: {
    background: '#2B6CB0',
  },
  studentButtonHover: {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 20px rgba(43, 108, 176, 0.2)',
  },
};

export default YoureduAdmin; 