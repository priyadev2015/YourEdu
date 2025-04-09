import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { supabase } from '../utils/supabaseClient';
import logo from '../assets/youredu-2.png';
import { motion } from 'framer-motion';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Processing your request...');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        console.log('🔵 AuthConfirm: Processing URL:', window.location.href);
        
        // Check for hash parameters (used by Supabase auth links)
        const hashParams = {};
        const hash = window.location.hash.substring(1);
        
        if (hash) {
          console.log('🔵 Found hash parameters in URL');
          hash.split('&').forEach(param => {
            const [key, value] = param.split('=');
            hashParams[key] = decodeURIComponent(value);
          });
          
          console.log('🔵 Hash parameters:', Object.keys(hashParams).join(', '));
        }
        
        // Check for query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');
        const token = urlParams.get('token');
        
        console.log('🔵 URL parameters - type:', type, 'token:', token ? 'exists' : 'missing');
        
        // Handle password recovery specifically
        if (type === 'recovery' || hashParams.type === 'recovery') {
          console.log('🔵 Processing password recovery request');
          
          // For password recovery, we want to redirect to the update password page
          if (hashParams.access_token) {
            console.log('🔵 Found access token in hash, redirecting to password update page');
            
            // Instead of setting the session (which logs the user in),
            // we'll pass the tokens as URL parameters to the update password page
            const params = new URLSearchParams();
            params.set('access_token', hashParams.access_token);
            params.set('refresh_token', hashParams.refresh_token || '');
            params.set('type', 'recovery');
            
            // Redirect to update password page with tokens as parameters
            navigate(`/update-password?${params.toString()}`);
            return;
          } else if (token) {
            // Legacy support for token in URL parameters
            console.log('🔵 Using token from URL parameters (legacy support)');
            navigate(`/update-password?token=${token}&type=recovery`);
            return;
          }
        }
        
        // Handle email confirmation
        if (type === 'signup' || hashParams.type === 'signup') {
          console.log('🔵 Processing email confirmation for signup');
          
          if (hashParams.access_token) {
            console.log('🔵 Setting session with access token from hash');
            
            // Set the session with the access token
            const { data, error } = await supabase.auth.setSession({
              access_token: hashParams.access_token,
              refresh_token: hashParams.refresh_token,
            });
            
            if (error) {
              console.error('❌ Error setting session:', error);
              throw error;
            }
            
            setMessage('Your email has been confirmed! Redirecting to your dashboard...');
            console.log('✅ Email confirmed successfully, redirecting to dashboard');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
            
            return;
          }
        }
        
        // If we reach here, we couldn't process the confirmation
        console.error('❌ Unable to process confirmation: Invalid or missing parameters');
        setError('We could not process your request. The link may be invalid or expired.');
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ Error in confirmation process:', error);
        setError(error.message || 'An error occurred while processing your request.');
        setIsLoading(false);
      }
    };

    handleConfirmation();
  }, [navigate, location]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00356B 0%, #2B6CB0 100%)',
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          backgroundColor: 'white',
          borderRadius: 2,
          p: 4,
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <img src={logo} alt="YourEDU Logo" style={{ height: '40px', marginBottom: '24px' }} />
          
          <Typography variant="h5" sx={{ mb: 2, color: '#00356b', fontWeight: 600 }}>
            {error ? 'Confirmation Failed' : 'Confirming Your Request'}
          </Typography>
          
          {isLoading && !error && (
            <CircularProgress sx={{ mb: 3 }} />
          )}
          
          {error ? (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Typography sx={{ mb: 3, textAlign: 'center' }}>
              {message}
            </Typography>
          )}
          
          {error && (
            <Typography sx={{ mt: 2, textAlign: 'center' }}>
              Please try again or contact support if the problem persists.
            </Typography>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};

export default AuthConfirm; 