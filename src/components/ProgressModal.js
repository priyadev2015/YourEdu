import React from 'react';
import {
  Dialog,
  DialogContent,
  LinearProgress,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const ProgressModal = ({ 
  open, 
  steps, 
  currentStep,
  onClose 
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          backgroundColor: 'white',
        }
      }}
    >
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'hsl(var(--foreground))' }}>
            Syncing Calendar
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              mb: 3,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'hsl(var(--muted))',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'hsl(var(--brand-primary))',
              }
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {steps.map((step, index) => (
              <Paper
                key={step.label}
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: index <= currentStep ? 'hsl(var(--brand-primary) / 0.1)' : 'hsl(var(--muted) / 0.3)',
                  border: '1px solid',
                  borderColor: index <= currentStep ? 'hsl(var(--brand-primary) / 0.2)' : 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
              >
                {index < currentStep ? (
                  <CheckCircleIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                ) : index === currentStep ? (
                  <PendingIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                ) : (
                  <Box 
                    sx={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%',
                      border: '2px solid hsl(var(--muted-foreground))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {index + 1}
                  </Box>
                )}
                <Typography sx={{ color: 'hsl(var(--foreground))' }}>
                  {step.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal; 