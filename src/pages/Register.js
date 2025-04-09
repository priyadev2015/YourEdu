import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Container, Paper, Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';
import GoogleIcon from '@mui/icons-material/Google';

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pilotCode, setPilotCode] = useState('');
  const { register, handleGoogleSignup } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobileCheck);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (password !== verifyPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Hash the pilot code using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(pilotCode);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPilotCode = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    try {
      // Make API call to verify pilot code
      const response = await fetch('/api/verify-pilot-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hashedCode: hashedPilotCode
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid pilot code. Please check your code and try again.');
      }

      await register(email, password, `${firstName} ${lastName}`);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile view component
  if (isMobile) {
    return (
      <Box sx={mobileStyles.container}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={mobileStyles.content}>
            <img src={logo} alt="YourEDU Logo" style={mobileStyles.logo} />
            <Typography variant="h4" sx={mobileStyles.title}>
              Desktop Experience Only
            </Typography>
            <Typography sx={mobileStyles.message}>
              YourEDU is currently optimized for desktop and laptop computers. 
              Please visit <strong>app.youredu.school</strong> on your desktop or laptop device for the best experience.
            </Typography>
            <Box sx={mobileStyles.divider} />
            <Typography sx={mobileStyles.footer}>
              Thank you for your understanding.
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={styles.pageContainer}>
        <Paper elevation={3} sx={styles.formContainer}>
          <Box sx={styles.toggleContainer}>
            <Button
              onClick={() => navigate('/login')}
              variant="outlined"
              sx={styles.toggleButton}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              sx={{
                ...styles.toggleButton,
                ...styles.activeToggleButton,
              }}
            >
              Create New Account
            </Button>
          </Box>
          
          <Box sx={styles.formContentBox}>
            {errorMessage && (
              <Typography color="error" sx={styles.error}>
                {errorMessage}
              </Typography>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <Box sx={styles.nameFields}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  sx={styles.textField}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  sx={styles.textField}
                />
              </Box>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={styles.textField}
              />
              <TextField
                fullWidth
                label="Pilot Code"
                type="text"
                value={pilotCode}
                onChange={(e) => setPilotCode(e.target.value)}
                required
                sx={styles.textField}
                placeholder="Enter your pilot code"
                helperText="Required for pilot program registration"
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={styles.textField}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Verify Password"
                type={showVerifyPassword ? 'text' : 'password'}
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                required
                sx={styles.textField}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                        edge="end"
                      >
                        {showVerifyPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="outlined"
                disabled={isLoading}
                sx={styles.emailSubmitButton}
              >
                {isLoading ? 'Creating Account...' : 'Create Account with Email'}
              </Button>
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

// Mobile-specific styles
const mobileStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '20px',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    width: '80px',
    marginBottom: '24px',
  },
  title: {
    color: '#00356B',
    fontWeight: 700,
    marginBottom: '16px',
  },
  message: {
    color: '#475569',
    fontSize: '1rem',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  divider: {
    width: '60%',
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '8px 0 16px',
  },
  footer: {
    color: '#64748b',
    fontSize: '0.875rem',
    fontStyle: 'italic',
  }
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 4,
  },
  formContainer: {
    padding: 4,
    width: '100%',
    maxWidth: '500px',
  },
  title: {
    marginBottom: 3,
    textAlign: 'center',
    color: '#00356B',
    fontWeight: 700,
  },
  error: {
    marginBottom: 2,
    textAlign: 'center',
  },
  textField: {
    marginBottom: '24px',
  },
  submitButton: {
    marginTop: 2,
    backgroundColor: '#00356B',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
  nameFields: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
  },
  form: {
    marginTop: '16px',
  },
  dividerContainer: {
    my: 4,
    width: '100%',
  },
  divider: {
    '&::before, &::after': {
      borderColor: 'rgba(0, 0, 0, 0.12)',
    },
  },
  dividerText: {
    color: 'text.secondary',
    px: 2,
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
  },
  googleButtonPrimary: {
    py: 1.8,
    mb: 3,
    backgroundColor: '#4285F4',
    color: 'white',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.25)',
    '&:hover': {
      backgroundColor: '#3367D6',
    },
  },
  emailSubmitButton: {
    py: 1.8,
    marginTop: 2,
    color: '#00356B',
    borderColor: '#00356B',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    '&:hover': {
      backgroundColor: 'rgba(0, 53, 107, 0.04)',
      borderColor: '#00356B',
    },
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  toggleButton: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: 0,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.01em',
    '&:hover': {
      backgroundColor: 'rgba(0, 53, 107, 0.08)',
    },
  },
  activeToggleButton: {
    backgroundColor: '#00356B',
    color: 'white',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
  formContentBox: {
    marginTop: '16px',
    padding: '0 8px',
  },
};

export default Register;
