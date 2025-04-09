import React from 'react';
import { Box, Typography } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

const PilotNotification = ({ message }) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-2)',
        backgroundColor: 'hsla(var(--brand-primary), 0.08)',
        border: '1px solid',
        borderColor: 'hsla(var(--brand-primary), 0.2)',
        borderRadius: 'var(--radius)',
        py: 'var(--spacing-1)',
        px: 'var(--spacing-3)',
        whiteSpace: 'nowrap',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: '-1rem',
        zIndex: 10,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <InfoIcon 
        sx={{ 
          color: 'hsl(var(--brand-primary))',
          fontSize: '1.25rem'
        }} 
      />
      <Typography
        sx={{
          color: 'hsl(var(--brand-primary))',
          fontSize: '0.9375rem',
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default PilotNotification; 