import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Folder as FolderIcon, Delete as DeleteIcon } from '@mui/icons-material'

const SubmissionModal = ({ open, onClose, assignment, onSubmit, uploading }) => {
  const [files, setFiles] = useState([])
  const [comment, setComment] = useState('')
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(assignment.id, files, comment)
  }

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 3
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Submit Assignment</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {assignment?.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Files</Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'hsl(var(--border))',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'hsl(var(--brand-primary))',
                  backgroundColor: 'hsla(var(--brand-primary), 0.05)',
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <Typography>
                Drop files here or click to upload
              </Typography>
            </Box>
            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {files.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'hsl(var(--muted))',
                      mb: 1
                    }}
                  >
                    <FolderIcon sx={{ color: 'hsl(var(--muted-foreground))' }} />
                    <Typography sx={{ flex: 1 }}>{file.name}</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => removeFile(index)}
                      sx={{ color: 'hsl(var(--destructive))' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <TextField
            label="Comment (optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={files.length === 0 || uploading}
              sx={{
                backgroundColor: 'hsl(var(--brand-primary))',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'hsl(var(--brand-primary-dark))',
                },
              }}
            >
              {uploading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                  <span>Uploading...</span>
                </Box>
              ) : (
                'Submit Assignment'
              )}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default SubmissionModal 