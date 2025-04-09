import React from 'react';
import { Typography } from '@mui/material';

const DescriptiveText = ({ children, sx = {} }) => {
  return (
    <Typography
      variant="subtitle1"
      sx={{
        color: 'hsl(var(--text-secondary))',
        fontSize: { xs: '0.875rem', sm: '1rem' },
        lineHeight: 1.6,
        ...sx
      }}
    >
      {children}
    </Typography>
  );
};

export default DescriptiveText; 