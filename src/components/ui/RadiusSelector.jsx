import React from 'react';
import { Box, Select, MenuItem } from '@mui/material';

/**
 * Enhanced RadiusSelector component with visual improvements
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Current selected radius value
 * @param {Function} props.onChange - Function to call when selection changes
 * @param {Array} props.options - Available radius options
 * @returns {JSX.Element} - Rendered component
 */
const RadiusSelector = ({ value, onChange, options }) => {
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
        📏
      </Box>
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        renderValue={(value) => `${value} mile radius`}
        sx={{
          width: '100%',
          height: 'auto',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          '& .MuiSelect-select': {
            padding: 'var(--spacing-4)',
            paddingLeft: 'var(--spacing-12)',
            fontSize: '1rem',
            backgroundColor: 'white',
            color: 'hsl(var(--text-primary))',
            minHeight: '0px !important',
            height: '24px',
            lineHeight: '24px',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-md)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'hsl(var(--brand-primary))',
            borderWidth: '1px',
          },
        }}
      >
        {options.map((radius) => (
          <MenuItem key={radius} value={radius}>
            {radius} mile radius
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default RadiusSelector; 