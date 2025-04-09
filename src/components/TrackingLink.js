import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackLinkClick } from '../utils/mixpanelClient';

const TrackingLink = ({ 
  to, 
  children, 
  location: linkLocation, 
  className, 
  style,
  ...props 
}) => {
  const currentLocation = useLocation();
  
  const handleClick = (e) => {
    // Don't track if it's the current page
    if (to === currentLocation.pathname) return;

    trackLinkClick(e, {
      href: to,
      text: typeof children === 'string' ? children : 'Navigation Link',
      location: linkLocation || currentLocation.pathname
    });
  };

  // For external links
  if (to.startsWith('http')) {
    return (
      <a
        href={to}
        onClick={handleClick}
        className={className}
        style={style}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  // For internal links
  return (
    <Link
      to={to}
      onClick={handleClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Link>
  );
};

export default TrackingLink; 