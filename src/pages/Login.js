import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Container, Paper } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import logo from '../assets/youredu-2.png';
import capLogo from '../assets/youredu-cap.png';
import { supabase, getEnvironmentRedirectUrl } from '../utils/supabaseClient';

const Login = ({ userType = 'parent' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Processing...');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { login, register } = useAuth();
  
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
  
  // Check for error parameters in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const correctType = params.get('correct_type');
    
    if (error === 'account_not_found') {
      setErrorMessage('No account found. Please sign up with Google first before signing in.');
      setIsLogin(false); // Switch to registration view
    } else if (error === 'wrong_portal') {
      setErrorMessage(`This account is registered as a ${correctType}. Please use the ${correctType} login portal.`);
    }
  }, [location]);
  
  // Set userType in localStorage based on prop
  useEffect(() => {
    localStorage.setItem('userType', userType);
    console.log('Setting userType from prop:', userType);
  }, [userType]);

  const isPilotUser = localStorage.getItem('isPilotUser') === 'true';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoadingStage('Processing...');
    setIsLoading(true);
    const currentUserType = localStorage.getItem('userType');

    if (!email || !password) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    if (!isLogin && password !== verifyPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      if (!isLogin) {
        // Handle registration
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('First and last name are required');
        }
        
        setLoadingStage('Creating your account...');
        const result = await register(email, password, firstName, lastName);
        
        if (result.needsEmailConfirmation) {
          // Show success message
          setErrorMessage(`Account created successfully! 🎉\n\nWe've sent a confirmation email to ${email}. Please check your inbox and click the confirmation link to activate your account.\n\nOnce confirmed, you can log in with your email and password.`);
          
          // Clear form
          clearForm();
          
          // Switch to login view after 5 seconds
          setTimeout(() => {
            setIsLogin(true);
            setErrorMessage('');
          }, 5000);
          
          return; // Exit early to prevent further processing
        }

      } else {
        // Handle login
        setLoadingStage('Establishing connection...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Ensure userType is set before login
        if (!localStorage.getItem('userType')) {
          console.log('No userType found before login, setting to', userType);
          localStorage.setItem('userType', userType);
        }
        
        setLoadingStage('Verifying credentials...');
        const user = await login(email, password);
        
        if (!user) {
          throw new Error('Login failed - no user returned');
        }

        // Double check userType is still set after login and matches the portal
        const loginUserType = localStorage.getItem('userType');
        if (!loginUserType) {
          console.log('UserType lost during login, resetting to', userType);
          localStorage.setItem('userType', userType);
        } else if (loginUserType !== userType) {
          console.log('UserType mismatch after login, expected:', userType, 'got:', loginUserType);
          localStorage.setItem('userType', userType);
        }
        
        console.log('Login successful with userType:', localStorage.getItem('userType'));
        
        // Verify user_type in database matches portal
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('account_profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();
            
          if (!profileError && profileData?.user_type && profileData.user_type !== userType) {
            console.error(`User type mismatch: Database has ${profileData.user_type} but portal is ${userType}`);
            throw new Error(`This account is registered as a ${profileData.user_type}. Please use the ${profileData.user_type} login portal instead.`);
          }
        } catch (error) {
          if (error.message.includes('Please use the')) {
            throw error;
          }
          // If it's just a database error, log it but continue
          console.error('Error verifying user_type in database:', error);
        }
        
        setLoadingStage('Loading your profile...');
        await new Promise(resolve => setTimeout(resolve, 600));
      }
      
      setLoadingStage('Preparing your dashboard...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setLoadingStage('Almost there...');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Final check of userType before navigation
      const finalUserType = localStorage.getItem('userType');
      console.log('Navigating to dashboard with userType:', finalUserType);
      
      navigate('/');
      
    } catch (error) {
      console.error('Auth error:', error);
      let errorMsg = '';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMsg = 'Invalid email or password.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMsg = 'Please check your email to confirm your account before logging in.';
      } else {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
      setLoadingStage('Processing...');
    }
  };

  const getWelcomeMessage = () => {
    switch(userType) {
      case 'student':
        return 'YourEDU Student Portal';
      case 'highschool':
        return 'YourEDU Micro School Admin Portal';
      case 'parent':
      default:
        return 'YourEDU Parent Portal';
    }
  };

  const getBackgroundStyle = () => {
    switch(userType) {
      case 'student':
        return {
          background: 'linear-gradient(135deg, #2B6CB0 0%, #4299E1 100%)',
        };
      case 'highschool':
        return {
          background: 'linear-gradient(135deg, #008080 0%, #20B2AA 100%)',
        };
      case 'parent':
      default:
        return {
          background: 'linear-gradient(135deg, #00356B 0%, #2B6CB0 100%)',
        };
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleResetPassword = async () => {
    if (!email || !email.trim()) {
      setErrorMessage('Please enter your email address first');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔵 Attempting password reset for:', email);
      
      // Get the appropriate redirect URL for the current environment
      const redirectUrl = getEnvironmentRedirectUrl('/auth/confirm');
      console.log('🔵 Using redirect URL for password reset:', redirectUrl);
      
      // For testing locally, we can override the site URL by setting a custom header
      const options = {
        redirectTo: redirectUrl,
      };
      
      // Log the final options being sent to Supabase
      console.log('🔵 Reset password options:', options);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), options);

      if (error) {
        console.error('❌ Reset password error:', error);
        throw error;
      }

      console.log('✅ Reset password email sent successfully', data);
      setResetEmailSent(true);
      setErrorMessage('');
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setErrorMessage('If an account exists with this email, you will receive password reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the form
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setVerifyPassword('');
    setFirstName('');
    setLastName('');
    setErrorMessage('');
    setLoadingStage('Processing...');
    setResetEmailSent(false);
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

              <Box sx={styles.accountTypeBadge}>
                <Typography variant="body1" sx={styles.accountTypeText}>
                  {userType === 'student' ? 'Student Account' : 'Parent Account'}
                </Typography>
              </Box>
              
              <Box sx={styles.toggleContainer}>
                <Button
                  onClick={() => setIsLogin(true)}
                  variant={isLogin ? "contained" : "outlined"}
                  sx={{
                    ...styles.toggleButton,
                    ...(isLogin ? styles.activeToggleButton : {}),
                  }}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setIsLogin(false)}
                  variant={!isLogin ? "contained" : "outlined"}
                  sx={{
                    ...styles.toggleButton,
                    ...(!isLogin ? styles.activeToggleButton : {}),
                  }}
                >
                  Create New Account
                </Button>
              </Box>

              {errorMessage && (
                <Box sx={styles.errorAlert}>
                  <Typography variant="body2">{errorMessage}</Typography>
                </Box>
              )}

              {resetEmailSent && (
                <Box sx={styles.resetEmailAlert}>
                  Password reset instructions have been sent to your email.
                </Box>
              )}

              <Box sx={styles.formContent}>
                <form onSubmit={handleSubmit} style={styles.form}>
                  {!isLogin && (
                    <Box sx={styles.nameFields}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        variant="outlined"
                        sx={styles.textField}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        variant="outlined"
                        sx={styles.textField}
                      />
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    variant="outlined"
                    sx={styles.textField}
                  />

                  <Box sx={styles.passwordInputWrapper}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      variant="outlined"
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
                  </Box>

                  {!isLogin && (
                    <TextField
                      fullWidth
                      label="Verify Password"
                      type={showVerifyPassword ? 'text' : 'password'}
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      required
                      variant="outlined"
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
                  )}

                  {isLogin && (
                    <Box sx={styles.forgotPasswordContainer}>
                      {!resetEmailSent ? (
                        <Button
                          onClick={handleResetPassword}
                          disabled={isLoading}
                          sx={styles.forgotPasswordButton}
                        >
                          Forgot password?
                        </Button>
                      ) : (
                        <Box sx={styles.resetEmailAlert}>
                          Password reset instructions have been sent to your email.
                        </Box>
                      )}
                    </Box>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={styles.submitButton}
                  >
                    {isLoading ? 'Please wait...' : (isLogin ? 'Sign In with Email' : 'Create Account with Email')}
                  </Button>
                </form>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {isLoading && (
        <Box sx={styles.loadingOverlay}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={styles.loadingContent}>
              <div style={styles.loadingSpinner} />
              <Typography variant="body1" sx={styles.loadingText}>
                {loadingStage}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      )}
    </Box>
  );
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
    width: '100%',
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
    marginBottom: '24px',
    fontSize: '2.75rem',
    letterSpacing: '-0.02em',
  },
  accountTypeBadge: {
    backgroundColor: '#F8FAFC',
    borderRadius: '100px',
    padding: '8px 24px',
    marginBottom: '32px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  accountTypeText: {
    color: '#00356B',
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
  toggleContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '32px',
    gap: '1px',
    backgroundColor: '#E2E8F0',
    padding: '1px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  toggleButton: {
    flex: 1,
    padding: '14px 24px',
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    color: '#64748B',
    border: '1px solid transparent',
    '&:hover': {
      backgroundColor: '#F8FAFC',
    },
  },
  activeToggleButton: {
    backgroundColor: '#00356B',
    color: 'white',
    '&:hover': {
      backgroundColor: '#00356B',
    },
  },
  formContent: {
    width: '100%',
    maxWidth: '500px',
  },
  form: {
    width: '100%',
  },
  textField: {
    marginBottom: '20px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#F8FAFC',
      '& fieldset': {
        borderColor: '#E2E8F0',
      },
      '&:hover fieldset': {
        borderColor: '#94A3B8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00356B',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#64748B',
      '&.Mui-focused': {
        color: '#00356B',
      },
    },
  },
  nameFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
  },
  forgotPasswordContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '24px',
  },
  forgotPasswordButton: {
    color: '#00356B',
    textTransform: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0',
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
  },
  submitButton: {
    backgroundColor: '#00356B',
    color: 'white',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    width: '100%',
    maxWidth: '500px',
    border: '1px solid #fecaca',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  resetEmailAlert: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    width: '100%',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '40px',
    borderRadius: '16px',
    backgroundColor: 'white',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(0, 53, 107, 0.1)',
    borderTopColor: '#00356B',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#00356B',
    fontSize: '1.1rem',
    fontWeight: 500,
  },
};

// Mobile styles remain the same
const mobileStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '20px',
    width: '100%',
    height: '100vh',
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

const successAlert = {
  backgroundColor: '#f0fdf4',
  color: '#166534',
  padding: '16px 20px',
  borderRadius: '12px',
  marginBottom: '24px',
  width: '100%',
  maxWidth: '500px',
  border: '1px solid #bbf7d0',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  whiteSpace: 'pre-line'
};

export default Login;
