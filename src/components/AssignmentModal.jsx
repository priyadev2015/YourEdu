import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material'
import { SectionHeader, FeatureHeader, DescriptiveText, BodyText, SupportingText } from '../components/ui/typography'

const AssignmentModal = ({ open, onClose, onSubmit }) => {
  const [assignment, setAssignment] = useState({
    name: '',
    description: '',
    due_date: '',
    due_time: '',
    submission_type: 'file',
  })

  const handleSubmit = () => {
    // Combine date and time into a timestamp with PST timezone
    const combinedDateTime =
      assignment.due_date && assignment.due_time
        ? new Date(`${assignment.due_date}T${assignment.due_time}-08:00`).toISOString() // -08:00 is PST
        : null

    // Only send fields that exist in the database table
    const assignmentData = {
      name: assignment.name,
      description: assignment.description,
      due_date: combinedDateTime,
      submission_type: assignment.submission_type,
    }

    onSubmit(assignmentData)

    setAssignment({
      name: '',
      description: '',
      due_date: '',
      due_time: '',
      submission_type: 'file',
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    >
      <DialogTitle>
        <FeatureHeader>Create New Assignment</FeatureHeader>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Assignment Name"
            value={assignment.name}
            onChange={(e) => setAssignment({ ...assignment, name: e.target.value })}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'hsl(var(--background))',
                '& fieldset': {
                  borderColor: 'hsl(var(--border))',
                },
                '&:hover fieldset': {
                  borderColor: 'hsl(var(--brand-primary))',
                },
              },
            }}
          />
          <TextField
            label="Description"
            value={assignment.description}
            onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'hsl(var(--background))',
                '& fieldset': {
                  borderColor: 'hsl(var(--border))',
                },
                '&:hover fieldset': {
                  borderColor: 'hsl(var(--brand-primary))',
                },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Due Date"
              type="date"
              value={assignment.due_date}
              onChange={(e) => setAssignment({ ...assignment, due_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'hsl(var(--background))',
                  '& fieldset': {
                    borderColor: 'hsl(var(--border))',
                  },
                  '&:hover fieldset': {
                    borderColor: 'hsl(var(--brand-primary))',
                  },
                },
              }}
            />
            <TextField
              label="Due Time"
              type="time"
              value={assignment.due_time}
              onChange={(e) => setAssignment({ ...assignment, due_time: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'hsl(var(--background))',
                  '& fieldset': {
                    borderColor: 'hsl(var(--border))',
                  },
                  '&:hover fieldset': {
                    borderColor: 'hsl(var(--brand-primary))',
                  },
                },
              }}
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Submission Type</InputLabel>
            <Select
              value={assignment.submission_type}
              label="Submission Type"
              onChange={(e) => setAssignment({ ...assignment, submission_type: e.target.value })}
              sx={{
                backgroundColor: 'hsl(var(--background))',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'hsl(var(--border))',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'hsl(var(--brand-primary))',
                },
              }}
            >
              <MenuItem value="file">File Upload</MenuItem>
              <MenuItem value="text">Text Entry</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid hsl(var(--border))' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'hsl(var(--muted-foreground))',
            '&:hover': {
              backgroundColor: 'hsl(var(--muted))',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!assignment.name}
          sx={{
            backgroundColor: 'hsl(var(--brand-primary))',
            '&:hover': {
              backgroundColor: 'hsl(var(--brand-primary-dark))',
            },
            '&:disabled': {
              backgroundColor: 'hsl(var(--muted))',
            },
          }}
        >
          Create Assignment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssignmentModal
