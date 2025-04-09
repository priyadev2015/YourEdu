import React from 'react';
import { Box } from '@mui/material';

/**
 * Enhanced SearchBar component with visual improvements
 * 
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {string} props.value - Current value of the search input
 * @param {Function} props.onChange - Function to call when input changes
 * @param {Function} props.onKeyPress - Function to call when a key is pressed
 * @returns {JSX.Element} - Rendered component
 */
const SearchBar = ({ placeholder, value, onChange, onKeyPress }) => {
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
          color: 'hsl(var(--brand-primary))',
          fontSize: '1.2em',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        🔍
      </Box>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        style={{
          width: '100%',
          padding: 'var(--spacing-4)',
          paddingLeft: 'var(--spacing-12)',
          fontSize: '1rem',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'white',
          color: 'hsl(var(--text-primary))',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
        }}
      />
    </Box>
  );
};

export default SearchBar; 