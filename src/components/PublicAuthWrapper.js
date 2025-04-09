import React from 'react';
import { usePublicAccess } from '../contexts/PublicAccessContext';

const PublicAuthWrapper = ({ children, targetPath }) => {
  const { handleInteraction } = usePublicAccess();

  const handleClick = (e) => {
    if (handleInteraction(targetPath)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
};

export default PublicAuthWrapper; 