import React from 'react';
import { Box } from '@mui/material';

/**
 * Enhanced LocationSearchBar component with visual improvements
 * 
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the location input
 * @param {string} props.value - Current value of the location input
 * @param {Function} props.onChange - Function to call when input changes
 * @param {boolean} props.showClearButton - Whether to show the clear button
 * @param {Function} props.onFocus - Function to call when input is focused
 * @param {Function} props.onBlur - Function to call when input loses focus
 * @returns {JSX.Element} - Rendered component
 */
const LocationSearchBar = ({ 
  placeholder, 
  value, 
  onChange, 
  showClearButton,
  onFocus,
  onBlur
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          left: 'var(--spacing-4)',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'hsl(var(--text-secondary))',
          fontSize: '1.2em',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        📍
      </Box>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: '100%',
          padding: 'var(--spacing-4)',
          paddingLeft: 'var(--spacing-12)',
          paddingRight: showClearButton ? 'var(--spacing-12)' : 'var(--spacing-4)',
          fontSize: '1rem',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'white',
          color: 'hsl(var(--text-primary))',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
      />
    </Box>
  );
};

export default LocationSearchBar; 