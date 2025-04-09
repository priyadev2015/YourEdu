import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Box, Typography } from '@mui/material';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType || 'admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [loadingStage, setLoadingStage] = useState('Establishing connection...');

  const getPageTitle = () => {
    switch (userType) {
      case 'admin':
        return 'YourEDU Admin Portal';
      case 'highschool':
        return 'YourEDU Parent Portal';
      case 'student':
        return 'YourEDU Student Portal';
      default:
        return 'YourEDU Portal';
    }
  };

  const getBadgeText = () => {
    switch (userType) {
      case 'admin':
        return 'ADMIN ACCESS';
      case 'highschool':
        return 'FULL PARENT ACCESS';
      case 'student':
        return 'FULL STUDENT ACCESS';
      default:
        return 'FULL ACCESS';
    }
  };

  const getWelcomeMessage = () => {
    switch (userType) {
      case 'admin':
        return 'Welcome to the YourEDU administrative portal.';
      case 'highschool':
        return 'Access the complete parent feature set and functionality.';
      case 'student':
        return 'Access the complete student feature set and functionality.';
      default:
        return 'Welcome to YourEDU.';
    }
  };

  const getLoginButtonText = () => {
    switch (userType) {
      case 'admin':
        return 'Admin Login';
      case 'highschool':
        return 'Parent Login (Full Access)';
      case 'student':
        return 'Student Login (Full Access)';
      default:
        return 'Login';
    }
  };

  const getBackgroundStyle = () => {
    switch (userType) {
      case 'admin':
        return { background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)' };
      case 'highschool':
        return { background: 'linear-gradient(135deg, #00356B 0%, #2B6CB0 100%)' };
      case 'student':
        return { background: 'linear-gradient(135deg, #2B6CB0 0%, #4299E1 100%)' };
      default:
        return { background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      setLoadingStage('Establishing connection...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setLoadingStage('Verifying credentials...');
      const user = await login(email, password);
      
      if (!user) {
        throw new Error('Login failed - no user returned');
      }
      
      setLoadingStage('Loading your profile...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setLoadingStage('Preparing your dashboard...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      navigate('/');
      
    } catch (error) {
      console.error('Auth error:', error);
      let errorMsg = 'Authentication failed. ';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMsg += 'Invalid email or password.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMsg += 'Please check your email to confirm your account.';
      } else {
        errorMsg += error.message;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
      setLoadingStage('Establishing connection...');
    }
  };

  return (
    <Box sx={{...styles.background, ...getBackgroundStyle()}}>
      <Box sx={styles.contentWrapper}>
        <Box sx={styles.welcomeSection}>
          <img src={logo} alt="Logo" style={styles.welcomeLogo} />
          <Typography variant="h4" sx={styles.welcomeTitle}>
            {getPageTitle()}
          </Typography>
          
          <Box sx={styles.adminSection}>
            <div style={styles.adminBadge}>
              {getBadgeText()}
            </div>
            <Typography variant="body1" sx={styles.adminMessage}>
              {getWelcomeMessage()}
            </Typography>
          </Box>
        </Box>

        <Box sx={styles.formSection}>
          <Box sx={styles.formContainer}>
            <Typography variant="h5" sx={styles.formTitle}>
              {getLoginButtonText()}
            </Typography>
            {errorMessage && <Typography variant="body2" sx={styles.error}>{errorMessage}</Typography>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <Box sx={styles.inputGroup}>
                <Typography variant="body2" sx={styles.label}>Email</Typography>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </Box>
              <Box sx={styles.inputGroup}>
                <Typography variant="body2" sx={styles.label}>Password</Typography>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
                <Box sx={styles.extraOptions}>
                  <Typography variant="body2" sx={styles.showPassword}>
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    Show password
                  </Typography>
                  <Link to="/password-reset" style={styles.forgotPassword}>Forgot password?</Link>
                </Box>
              </Box>
              <button type="submit" style={styles.button}>{getLoginButtonText()}</button>
            </form>
          </Box>
          
          {isLoading && (
            <Box sx={styles.loadingOverlay}>
              <Box sx={styles.loadingContent}>
                <div style={styles.loadingSpinner} />
                <Typography variant="body2" sx={styles.loadingText}>{loadingStage}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  background: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    position: 'relative',
  },
  contentWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1200px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },
  welcomeSection: {
    flex: 1,
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    position: 'relative',
  },
  welcomeLogo: {
    width: '80px',
    marginBottom: '30px',
  },
  welcomeTitle: {
    fontSize: '36px',
    fontWeight: '600',
    marginBottom: '40px',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  formSection: {
    width: '450px',
    backgroundColor: 'white',
    padding: '60px 40px',
    position: 'relative',
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: '24px',
    color: '#1a365d',
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#1a365d',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#1a365d',
    fontSize: '16px',
    fontWeight: '500',
  },
  inputGroup: {
    margin: '10px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#00356b',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '16px',
    transition: 'border-color 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
  extraOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
  },
  showPassword: {
    display: 'flex',
    alignItems: 'center',
  },
  forgotPassword: {
    color: '#00356b',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1a365d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontFamily: "'Inter', sans-serif",
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center',
  },
  adminSection: {
    marginTop: '24px',
    textAlign: 'center',
    padding: '0 40px',
  },
  adminBadge: {
    backgroundColor: '#1A365D',
    color: 'white',
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    marginBottom: '16px',
  },
  adminMessage: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.6',
  },
}; 

export default AdminLogin; 