import React from 'react'
import ReactDOM from 'react-dom'
import { Box, Button, Typography } from '@mui/material'
import { Close as CloseIcon, QuestionAnswer as QuestionIcon, VideoLibrary as VideoIcon } from '@mui/icons-material'

const VideoOverlay = ({ isVisible, onClose }) => {
  if (!isVisible) return null

  const overlayContent = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transition: 'all 0.8s ease-in-out',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '80%',
          maxWidth: '1200px',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          color: 'white',
          textAlign: 'center',
          animation: 'fadeIn 0.8s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'scale(0.95)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
          background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Coming Soon Message with Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VideoIcon sx={{ mr: 2, fontSize: 40, color: '#3f88f5' }} />
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #3f88f5, #8f65ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(63, 136, 245, 0.3)'
            }}
          >
            Video Coming Soon!
          </Typography>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 4, maxWidth: '80%', lineHeight: 1.6 }}>
          We're currently working on an onboarding video to help you get the most out of YourEDU.
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <QuestionIcon sx={{ mr: 1, fontSize: 28, color: '#3f88f5' }} />
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            In the meantime, please give feedback on the platform by clicking on the question mark in the top right corner.
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}>
          You will receive an email confirmation once you submit feedback from support@youredu.school
        </Typography>
        
        <Button
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            minWidth: 'auto',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <CloseIcon />
        </Button>
      </Box>
    </Box>
  )

  // Use createPortal to render the overlay at the root of the document
  return ReactDOM.createPortal(overlayContent, document.body)
}

export default VideoOverlay 