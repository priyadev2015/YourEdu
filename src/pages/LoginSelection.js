import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import logo from '../assets/youredu-2.png';
import capLogo from '../assets/youredu-cap.png';

const LoginSelection = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [parentHover, setParentHover] = useState(false);
  const [studentHover, setStudentHover] = useState(false);

  useEffect(() => {
    // Clear any existing userType when visiting this page
    localStorage.removeItem('userType');
  }, []);

  const handleSelection = (userType) => {
    console.log('Setting userType to:', userType);
    localStorage.setItem('userType', userType);
    
    // Navigate to different login paths based on user type
    switch(userType) {
      case 'student':
        navigate('/login/student');
        break;
      default:
        navigate('/login/parent');
        break;
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
    <Box sx={styles.pageContainer}>
      <Box sx={styles.logoContainer}>
        <img src={logo} alt="YourEDU" style={styles.mainLogo} />
      </Box>
      
      <Container maxWidth="md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Paper elevation={0} sx={styles.contentWrapper}>
            <Box sx={styles.header}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img src={capLogo} alt="YourEDU Cap" style={styles.capLogo} />
              </motion.div>
              
              <Typography variant="h3" sx={styles.title}>
                Welcome to YourEDU
              </Typography>
              
              <Typography variant="h6" sx={styles.subtitle}>
                Select your account type to begin
              </Typography>
            </Box>
            
            <Box style={styles.buttonContainer}>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSelection('parent')}
                  onMouseEnter={() => setParentHover(true)}
                  onMouseLeave={() => setParentHover(false)}
                  sx={{
                    ...styles.button,
                    ...styles.parentButton,
                    transform: parentHover ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: parentHover ? '0 8px 20px rgba(0, 53, 107, 0.2)' : '0 4px 12px rgba(0, 53, 107, 0.1)',
                  }}
                >
                  <Typography variant="h5" sx={styles.buttonTitle}>Parent</Typography>
                  <Typography variant="body1" sx={styles.buttonDescription}>
                    Manage your student's education and resources
                  </Typography>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  disabled={true}
                  onMouseEnter={() => setStudentHover(true)}
                  onMouseLeave={() => setStudentHover(false)}
                  sx={{
                    ...styles.button,
                    ...styles.studentButton,
                    transform: studentHover ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: studentHover ? '0 8px 20px rgba(43, 108, 176, 0.2)' : '0 4px 12px rgba(43, 108, 176, 0.1)',
                    opacity: 0.75,
                    cursor: 'not-allowed',
                  }}
                >
                  <Typography variant="h5" sx={styles.buttonTitle}>Student <Box component="span" sx={{ fontSize: '0.75rem', backgroundColor: '#FFCE44', color: '#333', padding: '2px 8px', borderRadius: '8px', marginLeft: '8px', verticalAlign: 'middle' }}>Coming Soon!</Box></Typography>
                  <Typography variant="body1" sx={styles.buttonDescription}>
                    Access your courses and learning materials
                  </Typography>
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(150deg, #ffffff 0%, #f0f7ff 100%)',
    position: 'relative',
    padding: '20px',
  },
  logoContainer: {
    position: 'absolute',
    top: '32px',
    left: '32px',
  },
  mainLogo: {
    width: '160px',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0, 53, 107, 0.1)',
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '40px',
    textAlign: 'center',
  },
  capLogo: {
    width: '80px',
    height: '80px',
    marginBottom: '24px',
  },
  title: {
    color: '#00356B',
    fontWeight: 700,
    marginBottom: '16px',
    fontSize: '2.5rem',
  },
  subtitle: {
    color: '#475569',
    fontWeight: 400,
    fontSize: '1.25rem',
    maxWidth: '500px',
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '32px',
  },
  button: {
    padding: '24px 32px',
    borderRadius: '16px',
    textTransform: 'none',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '120px',
  },
  parentButton: {
    backgroundColor: '#00356B',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
  studentButton: {
    backgroundColor: '#2B6CB0',
    '&:hover': {
      backgroundColor: '#1E4E8C',
    },
  },
  buttonTitle: {
    fontWeight: 600,
    marginBottom: '8px',
    fontSize: '1.5rem',
  },
  buttonDescription: {
    opacity: 0.9,
    fontSize: '1rem',
    textAlign: 'left',
  },
};

export default LoginSelection;

