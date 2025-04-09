import React from 'react';
import { Popover, Box, Typography, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { 
  QuestionAnswer as QuestionAnswerIcon,
  Book as BookIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const HelpPopover = ({ open, onClose, anchorEl }) => {
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
          Help & Support
        </Typography>
        <List sx={{ mb: 2 }}>
          <ListItem button sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <QuestionAnswerIcon />
            </ListItemIcon>
            <ListItemText 
              primary="FAQ" 
              secondary="Find answers to common questions"
            />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <BookIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Documentation" 
              secondary="Browse our user guides"
            />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Email Support" 
              secondary="Get help via email"
            />
          </ListItem>
          <ListItem button sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <PhoneIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Contact Us" 
              secondary="Speak with our support team"
            />
          </ListItem>
        </List>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#00356b',
            color: 'white',
            '&:hover': {
              backgroundColor: '#002548',
            },
          }}
        >
          Contact Support
        </Button>
      </Box>
    </Popover>
  );
};

export default HelpPopover; 