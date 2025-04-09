import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, Button, Grow, useMediaQuery, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { PeopleAlt as PeopleAltIcon } from '@mui/icons-material'

const StudentToggleTooltip = ({ open, onClose }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Grow in={open}>
      <Box
        sx={{
          position: 'fixed',
          left: isSmallScreen ? 120 : 320, // Moved slightly more right
          top: 360,
          zIndex: 2000,
          maxWidth: 320,
          display: open ? 'block' : 'none',
          // For very small screens, ensure tooltip is still visible
          '@media (max-width: 600px)': {
            left: 100,
            maxWidth: 280,
          },
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: '#2563EB',
            color: 'white',
            position: 'relative',
            border: '3px solid white',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PeopleAltIcon />
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ m: 0 }}>
              Student Added Successfully!
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your new student has been added to your account! You can now:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Switch between your students using the selector in the left sidebar
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Manage each student's individual records and academic materials
            </Typography>
            <Typography component="li" variant="body2">
              Create unique academic plans and courses for each of your students
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            size="small" 
            onClick={onClose}
            sx={{
              backgroundColor: 'white',
              color: '#2563EB',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Got it
          </Button>
          
          {/* Arrow pointing to the student toggle */}
          <Box
            sx={{
              position: 'absolute',
              left: isSmallScreen ? -60 : -80, // Adjusted arrow position further left to compensate for box moving right
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              // Hide arrow for very small screens
              '@media (max-width: 600px)': {
                left: -50,
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                padding: 1.2,
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: '0 0 15px rgba(0, 0, 0, 0.35)',
                border: '2px solid #2563EB',
              }}
            >
              <ArrowBackIcon 
                sx={{ 
                  fontSize: 40, 
                  color: '#2563EB',
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Grow>
  )
}

export default StudentToggleTooltip 