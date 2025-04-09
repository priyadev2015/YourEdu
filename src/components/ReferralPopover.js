import React from 'react';
import { Popover, Box, Typography, Button, TextField } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';

const ReferralPopover = ({ open, onClose, anchorEl }) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box sx={{ 
        p: 3, 
        width: 320,
        backgroundColor: 'white',
        borderRadius: 1
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Refer a Friend
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Share YourEDU with other homeschool families and help grow our community.
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter friend's email"
          size="small"
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          startIcon={<EmailIcon />}
          sx={{
            backgroundColor: '#00356b',
            color: 'white',
            '&:hover': {
              backgroundColor: '#002548',
            },
          }}
        >
          Send Invitation
        </Button>
      </Box>
    </Popover>
  );
};

export default ReferralPopover; 