import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import {
  Description as FileIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import CourseFileService from '../services/CourseFileService'
import { toast } from 'react-toastify'

const fileCategories = [
  { value: 'materials', label: 'Materials' },
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'assignments', label: 'Assignments' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'records', label: 'Records' },
  { value: 'transcripts', label: 'Transcripts' },
  { value: 'other', label: 'Other' },
]

const CourseFiles = ({ courseId }) => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const fileService = CourseFileService

  const loadFiles = async () => {
    try {
      const data = await fileService.getFiles(courseId)
      setFiles(data)
    } catch (error) {
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [courseId])

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) return

    setLoading(true)
    try {
      await fileService.uploadFile(selectedFile, courseId, selectedCategory)
      await loadFiles()
      setIsUploadDialogOpen(false)
      setSelectedFile(null)
      setSelectedCategory('')
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId) => {
    try {
      await fileService.downloadFile(fileId)
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (fileId) => {
    try {
      await fileService.deleteFile(fileId)
      await loadFiles()
      toast.success('File deleted successfully')
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = []
    }
    acc[file.category].push(file)
    return acc
  }, {})

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setIsUploadDialogOpen(true)}>
          Upload File
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        Object.entries(groupedFiles).map(([category, categoryFiles]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
              {category}
            </Typography>
            <List>
              {categoryFiles.map((file) => (
                <ListItem key={file.id}>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${file.size_kb} KB • ${new Date(file.created_at).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleDownload(file.id)}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(file.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        ))
      )}

      <Dialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        PaperProps={{
          sx: {
            minWidth: '400px',
            maxWidth: '600px',
            width: '100%',
            m: 2,
          },
        }}
      >
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button component="span" variant="outlined">
                Choose File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
          <TextField
            select
            fullWidth
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {fileCategories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!selectedFile || !selectedCategory}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CourseFiles
