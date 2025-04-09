import React from 'react';
import { FormControl, InputLabel, Select } from '@mui/material';
import { theme } from '../../theme/theme';

const StandardSelect = ({
  label,
  children,
  required = false,
  ...props
}) => {
  const standardStyles = {
    width: '100%',
    marginTop: '8px',
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--radius-md)',
      '&:hover fieldset': {
        borderColor: 'hsl(var(--brand-primary))',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'hsl(var(--brand-primary))',
      },
      '& fieldset': {
        borderColor: 'hsl(var(--border))',
      },
    },
    '& .MuiSelect-select': {
      padding: 'var(--spacing-3)',
      color: '#000000',
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, -9px) scale(0.75)',
      backgroundColor: theme.palette.background.paper,
      padding: '0 4px',
      color: '#000000',
      '&.Mui-focused': {
        color: 'hsl(var(--brand-primary))',
      },
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    },
  };

  const renderLabel = () => {
    if (!required) return label;
    return (
      <span>
        {label} <span style={{ color: '#FF0000' }}>*</span>
      </span>
    );
  };

  return (
    <FormControl fullWidth sx={standardStyles}>
      <InputLabel>{renderLabel()}</InputLabel>
      <Select
        {...props}
        label={renderLabel()}
      >
        {children}
      </Select>
    </FormControl>
  );
};

export default StandardSelect; 