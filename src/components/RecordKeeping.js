import React, { useState, useEffect } from 'react';
import { RecordKeepingService } from '../services/RecordKeepingService';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';

export default function RecordKeeping() {
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState('other');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalDocuments, setTotalDocuments] = useState(0);

  useEffect(() => {
    const initializeRecordKeeping = async () => {
      try {
        setLoading(true);
        // First load folders to ensure they exist
        const folderData = await RecordKeepingService.getFolders();
        setFolders(folderData);
        
        // If no folders exist, there might be an issue with the migration
        if (folderData.length === 0) {
          setError('No folders found. Please contact support.');
          return;
        }

        // Then check for documents
        const count = await RecordKeepingService.getTotalDocumentCount();
        setTotalDocuments(count);
        
        // Create welcome file if no documents exist
        if (count === 0) {
          await RecordKeepingService.createWelcomeFile();
          // Reload counts and documents after creating welcome file
          const newCount = await RecordKeepingService.getTotalDocumentCount();
          setTotalDocuments(newCount);
          const newFolderData = await RecordKeepingService.getFolders();
          setFolders(newFolderData);
        }

        // Finally load all documents
        const docData = await RecordKeepingService.getDocuments();
        setDocuments(docData);
      } catch (error) {
        console.error('Error initializing record keeping:', error);
        setError('Failed to initialize record keeping: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeRecordKeeping();
  }, []);

  useEffect(() => {
    const loadFolderDocuments = async () => {
      try {
        setLoading(true);
        await loadDocuments(selectedFolder);
        // Refresh counts when folder selection changes
        const folderData = await RecordKeepingService.getFolders();
        setFolders(folderData);
        const count = await RecordKeepingService.getTotalDocumentCount();
        setTotalDocuments(count);
      } catch (error) {
        console.error('Error loading folder documents:', error);
        setError('Failed to load folder documents');
      } finally {
        setLoading(false);
      }
    };

    loadFolderDocuments();
  }, [selectedFolder]);

  const loadTotalDocuments = async () => {
    try {
      const count = await RecordKeepingService.getTotalDocumentCount();
      setTotalDocuments(count);
    } catch (error) {
      console.error('Error loading total documents:', error);
      setError('Failed to load document count');
    }
  };

  const loadFolders = async () => {
    try {
      const data = await RecordKeepingService.getFolders();
      setFolders(data);
    } catch (error) {
      console.error('Error loading folders:', error);
      setError('Failed to load folders');
    }
  };

  const loadDocuments = async (folderId = null) => {
    try {
      const data = await RecordKeepingService.getDocuments(folderId);
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    }
  };

  const handleCreateFolder = async () => {
    try {
      setLoading(true);
      await RecordKeepingService.createFolder(newFolderName, newFolderCategory);
      setNewFolderDialog(false);
      setNewFolderName('');
      setNewFolderCategory('other');
      await loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedFolder) return;

    try {
      setLoading(true);
      await RecordKeepingService.uploadDocument(selectedFile, selectedFolder);
      setUploadDialog(false);
      setSelectedFile(null);
      await loadDocuments(selectedFolder);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      setLoading(true);
      await RecordKeepingService.downloadDocument(documentId);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setLoading(true);
      await RecordKeepingService.deleteDocument(documentId);
      await loadDocuments(selectedFolder);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder and all its documents?')) return;

    try {
      setLoading(true);
      await RecordKeepingService.deleteFolder(folderId);
      setSelectedFolder(null);
      await loadFolders();
      await loadDocuments();
    } catch (error) {
      console.error('Error deleting folder:', error);
      setError('Failed to delete folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container spacing={3}>
          {/* Folders Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3}>
              <Box p={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Folders</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setNewFolderDialog(true)}
                    disabled={loading}
                  >
                    New Folder
                  </Button>
                </Box>
                <List>
                  <ListItem
                    button
                    selected={!selectedFolder}
                    onClick={() => setSelectedFolder(null)}
                  >
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <span>All Documents</span>
                          <Typography component="span" color="textSecondary">
                            {totalDocuments}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {folders.map((folder) => (
                    <ListItem
                      key={folder.id}
                      button
                      selected={selectedFolder === folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <ListItemIcon>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <span>{folder.name}</span>
                            <Typography component="span" color="textSecondary">
                              {folder.documentCount}
                            </Typography>
                          </Box>
                        }
                        secondary={folder.category}
                      />
                      {!folder.is_default && (
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>

          {/* Documents Section */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Box p={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Documents</Typography>
                  <Button
                    startIcon={<UploadIcon />}
                    onClick={() => setUploadDialog(true)}
                    disabled={!selectedFolder || loading}
                  >
                    Upload Document
                  </Button>
                </Box>
                {error && (
                  <Typography color="error" gutterBottom>
                    {error}
                  </Typography>
                )}
                <List>
                  {documents.map((document) => (
                    <ListItem
                      key={document.id}
                      button
                      onClick={() => handleDownloadDocument(document.id)}
                    >
                      <ListItemIcon>
                        <DocumentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={document.name}
                        secondary={`${document.size_kb}KB • ${new Date(
                          document.created_at
                        ).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(document.id);
                          }}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {documents.length === 0 && (
                    <Typography variant="body2" color="textSecondary" align="center">
                      No documents found
                    </Typography>
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onClose={() => setNewFolderDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={newFolderCategory}
              onChange={(e) => setNewFolderCategory(e.target.value)}
            >
              <MenuItem value="attendance">Attendance</MenuItem>
              <MenuItem value="curriculum">Curriculum</MenuItem>
              <MenuItem value="assessments">Assessments</MenuItem>
              <MenuItem value="legal">Legal</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateFolder}
            disabled={!newFolderName || loading}
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Select File
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" mt={1}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadDocument}
            disabled={!selectedFile || loading}
            color="primary"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 