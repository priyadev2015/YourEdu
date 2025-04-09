import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import logo from '../assets/youredu-2.png';
import { motion } from 'framer-motion';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState(false);

  useEffect(() => {
    // Initialize and check for tokens in URL
    const initializePasswordReset = () => {
      setIsInitializing(true);
      
      try {
        console.log('🔵 UpdatePassword: Initializing with URL:', window.location.href);
        
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        const urlToken = urlParams.get('token');
        const urlAccessToken = urlParams.get('access_token');
        const urlRefreshToken = urlParams.get('refresh_token');
        
        // Determine if this is a password reset flow
        const isReset = type === 'recovery' || urlAccessToken || urlToken;
        setIsPasswordResetFlow(isReset);
        
        // Store tokens if they exist
        if (urlAccessToken) {
          console.log('🔵 Found access token in URL parameters');
          setAccessToken(urlAccessToken);
          
          if (urlRefreshToken) {
            setRefreshToken(urlRefreshToken);
          }
        }
        
        // Special handling for test tokens
        if (urlToken && urlToken.startsWith('TEST_TOKEN_')) {
          console.log('🧪 Test mode detected with token:', urlToken);
          setIsTestMode(true);
        }
        
        // Check if we have the necessary tokens for password reset
        if (isReset && !urlAccessToken && !urlToken && !isTestMode && !user) {
          console.error('❌ No access token or recovery token found in URL');
          setError('Invalid password reset link. Please request a new password reset link.');
        }
        
        setIsInitializing(false);
      } catch (error) {
        console.error('❌ Error in initialization:', error);
        setError('An error occurred while processing your request.');
        setIsInitializing(false);
      }
    };
    
    initializePasswordReset();
  }, [location, user]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    // Set a flag to hide navbar during transition
    localStorage.setItem('hideNavbarDuringTransition', 'true');
    
    try {
      // Special handling for test mode
      if (isTestMode) {
        console.log('🧪 Test mode: Simulating password update success');
        // Simulate a successful password update
        setTimeout(() => {
          setSuccess(true);
          setTimeout(() => {
            console.log('🧪 Test complete, redirecting to login');
            navigate('/login-selection');
            // Remove the flag after navigation
            localStorage.removeItem('hideNavbarDuringTransition');
          }, 2000);
        }, 1000);
        return;
      }
      
      // If we have an access token from the URL and no user is logged in, set the session first
      if (accessToken && !user) {
        console.log('🔵 Setting session with access token from URL parameters');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || null,
        });
        
        if (sessionError) {
          console.error('❌ Error setting session:', sessionError);
          throw new Error('Invalid or expired reset link. Please request a new password reset.');
        }
        
        console.log('✅ Session set successfully, proceeding with password update');
      }
      
      // Now update the password
      console.log('🔵 Updating password using Supabase updateUser method');
      
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('❌ Error updating password:', error);
        throw error;
      }
      
      console.log('✅ Password updated successfully:', data);
      setSuccess(true);
      
      // Sign out after successful password change
      console.log('🔵 Signing out after password change');
      
      // Use the logout function from AuthContext if this is a password reset flow
      if (isPasswordResetFlow) {
        setTimeout(async () => {
          try {
            // For password reset flow, we want to sign out and redirect to login
            await supabase.auth.signOut();
            console.log('✅ Password reset complete, redirecting to login');
            navigate('/login-selection');
            // Remove the flag after navigation
            localStorage.removeItem('hideNavbarDuringTransition');
          } catch (error) {
            console.error('❌ Error signing out:', error);
            // Still redirect to login even if sign out fails
            navigate('/login-selection');
            // Remove the flag after navigation
            localStorage.removeItem('hideNavbarDuringTransition');
          }
        }, 2000);
      } else {
        // For regular password change (user already logged in), just show success
        setTimeout(() => {
          // If the user was already logged in (changing password from account settings)
          // redirect them back to account settings
          navigate('/account/settings');
          // Remove the flag after navigation
          localStorage.removeItem('hideNavbarDuringTransition');
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Password update error:', error);
      setError(error.message || 'Failed to update password. Please try again or request a new reset link.');
      // Remove the flag if there's an error
      localStorage.removeItem('hideNavbarDuringTransition');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00356B 0%, #2B6CB0 100%)',
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <Box sx={{ 
          backgroundColor: 'white',
          borderRadius: 2,
          p: 4,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <img src={logo} alt="YourEDU Logo" style={{ height: '40px', marginBottom: '24px' }} />
          
          {isInitializing ? (
            <>
              <CircularProgress sx={{ mb: 3 }} />
              <Typography variant="h5" sx={{ mb: 2, color: '#00356b', fontWeight: 600 }}>
                Preparing Password Reset
              </Typography>
              <Typography sx={{ mb: 3, textAlign: 'center' }}>
                Please wait while we process your request...
              </Typography>
            </>
          ) : success ? (
            <>
              <Typography variant="h5" sx={{ mb: 2, color: '#00356b', fontWeight: 600 }}>
                Password Updated Successfully
              </Typography>
              <Typography sx={{ mb: 3, textAlign: 'center' }}>
                Your password has been updated. You will be redirected to the login page shortly.
              </Typography>
              <CircularProgress sx={{ mt: 2 }} />
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mb: 2, color: '#00356b', fontWeight: 600 }}>
                Create New Password
              </Typography>
              <Typography sx={{ mb: 3, textAlign: 'center' }}>
                Please enter and confirm your new password below.
              </Typography>
              
              {isTestMode && (
                <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
                  Test mode active. Any password you enter will be accepted for testing purposes.
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <TextField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  disabled={isLoading}
                />
                
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  disabled={isLoading}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    bgcolor: '#00356b',
                    '&:hover': {
                      bgcolor: '#002548',
                    },
                    height: '48px',
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                </Button>
                
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate('/login-selection')}
                  sx={{ 
                    color: '#00356b',
                    textTransform: 'none',
                  }}
                >
                  Back to Login
                </Button>
              </form>
            </>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};

export default UpdatePassword; 