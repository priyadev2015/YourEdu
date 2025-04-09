import React from 'react';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

/**
 * ImportantNoteCard - A reusable component for displaying important information
 * with a consistent design across the application.
 * 
 * @param {Object} props
 * @param {string|React.ReactNode} props.children - The content to display inside the note
 * @param {Object} [props.sx] - Additional MUI sx styles to apply to the container
 * @param {string} [props.backgroundColor='#F8FAFC'] - Background color of the note card
 * @param {string} [props.borderColor='#E2E8F0'] - Border color of the note card
 * @param {string} [props.iconColor='#3B82F6'] - Color of the info icon
 * @param {string} [props.textColor='#1E293B'] - Color of the text content
 */
const ImportantNoteCard = ({ 
  children, 
  sx = {},
  backgroundColor = '#F8FAFC',
  borderColor = '#E2E8F0',
  iconColor = '#3B82F6',
  textColor = '#1E293B'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        backgroundColor: backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        ...sx
      }}
    >
      <FontAwesomeIcon 
        icon={faCircleInfo} 
        style={{ 
          color: iconColor,
          fontSize: '20px',
          marginTop: '2px'
        }} 
      />
      <Typography
        sx={{
          color: textColor,
          fontSize: '0.95rem',
          lineHeight: '1.5',
          flex: 1
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};

export default ImportantNoteCard; 