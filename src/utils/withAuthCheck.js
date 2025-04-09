import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import RegistrationPrompt from '../components/RegistrationPrompt';

const withAuthCheck = (WrappedComponent) => {
  return function WithAuthCheckComponent(props) {
    const { user } = useAuth();
    const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

    const handleInteraction = (e, action) => {
      if (!user) {
        e.preventDefault();
        setShowRegistrationPrompt(true);
        return true;
      }
      if (action) {
        action();
      }
      return false;
    };

    return (
      <>
        <WrappedComponent {...props} handleInteraction={handleInteraction} />
        <RegistrationPrompt 
          open={showRegistrationPrompt}
          onClose={() => setShowRegistrationPrompt(false)}
          targetPath={window.location.pathname}
        />
      </>
    );
  };
};

export default withAuthCheck; 