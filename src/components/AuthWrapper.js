import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useLocation } from 'react-router-dom';
import RegistrationPrompt from './RegistrationPrompt';
import { Snackbar, Alert } from '@mui/material';

const AuthWrapper = ({ children, onClick, requireAuth = true }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if current page is a public page
  const isPublicPage = location.pathname.startsWith('/events/') || 
                      location.pathname.startsWith('/groups/');

  const handleClick = (e) => {
    // If authentication is required and user is not logged in
    if (!user && requireAuth) {
      e.preventDefault();
      e.stopPropagation();
      setShowRegistrationPrompt(true);
      return;
    }

    // If the child has its own onClick, let it handle the click
    if (children.props.onClick) {
      children.props.onClick(e);
    }
    // If there's an onClick prop passed to AuthWrapper, call it
    else if (onClick) {
      onClick(e);
    }
  };

  // Clone the child element with the new onClick handler
  const wrappedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    // Preserve all existing props and add/override onClick
    return React.cloneElement(child, {
      ...child.props,
      onClick: handleClick,
    });
  });

  return (
    <>
      {wrappedChildren}
      
      <RegistrationPrompt 
        open={showRegistrationPrompt}
        onClose={() => setShowRegistrationPrompt(false)}
        targetPath={location.pathname}
        onSnackbarMessage={(message) => setSnackbar({ ...message, open: true })}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthWrapper; 