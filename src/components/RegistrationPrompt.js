import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';

const RegistrationPrompt = ({ open, onClose, targetPath, onSnackbarMessage }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Sign up with email and password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            targetPath: targetPath
          }
        }
      });

      if (signUpError) throw signUpError;

      // Sign in immediately after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // Send welcome email
      const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: formData.email,
          subject: 'Welcome to YourEDU! 🎓',
          sender: {
            email: 'colin@youredu.school',
            name: 'YourEDU'
          },
          content: {
            title: 'Welcome to YourEDU!',
            greeting: `Hi there,`,
            message: `We're thrilled to have you join the YourEDU community! Your journey to better education starts here.`,
            quickLinks: [
              {
                text: 'Search for Courses',
                url: `${window.location.origin}/search`
              },
              {
                text: 'Complete Your Profile',
                url: `${window.location.origin}/my-account`
              }
            ],
            signature: `Best regards,\nThe YourEDU Team`
          }
        }
      });

      if (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't throw the error as we don't want to block the signup process
      }

      onSnackbarMessage?.({
        message: 'Successfully signed up! Welcome to YourEDU!',
        severity: 'success'
      });
      
      handleClose();
    } catch (error) {
      console.error('Error during registration:', error);
      onSnackbarMessage?.({
        message: error.message || 'An error occurred during registration',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a365d' }}>
          Join YourEDU
        </Typography>
        <IconButton 
          onClick={handleClose}
          sx={{ color: '#718096' }}
          disabled={isLoading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" sx={{ mb: 2, color: '#2D3748' }}>
            Connect with your homeschool community
          </Typography>
          <Typography sx={{ mb: 3, color: '#4A5568' }}>
            Sign up to interact with events, join discussions, and connect with other homeschool families.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={isLoading}
            />
          </Box>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: '#2B6CB0',
              '&:hover': {
                bgcolor: '#2C5282',
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Get Started'}
          </Button>
          <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center' }}>
            By signing up, you agree to our Terms and Privacy Policy.
          </Typography>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationPrompt; 