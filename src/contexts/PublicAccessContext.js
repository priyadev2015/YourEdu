import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import RegistrationPrompt from '../components/RegistrationPrompt';

const PublicAccessContext = createContext();

export const usePublicAccess = () => {
  const context = useContext(PublicAccessContext);
  if (!context) {
    throw new Error('usePublicAccess must be used within a PublicAccessProvider');
  }
  return context;
};

export const PublicAccessProvider = ({ children }) => {
  const { user } = useAuth();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [targetPath, setTargetPath] = useState('');

  const handleInteraction = (path) => {
    if (!user) {
      setTargetPath(path || window.location.pathname);
      setShowRegistrationPrompt(true);
      return true;
    }
    return false;
  };

  return (
    <PublicAccessContext.Provider value={{ handleInteraction, isAuthenticated: !!user }}>
      {children}
      <RegistrationPrompt 
        open={showRegistrationPrompt}
        onClose={() => setShowRegistrationPrompt(false)}
        targetPath={targetPath}
      />
    </PublicAccessContext.Provider>
  );
}; 