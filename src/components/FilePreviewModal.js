import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

const FilePreviewModal = ({ open, onClose, file }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file) {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setLoading(false);

      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const renderPreview = () => {
    if (!file) return null;

    const fileType = file.type.split('/')[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    switch (fileType) {
      case 'image':
        return (
          <Box
            component="img"
            src={previewUrl}
            alt={file.name}
            sx={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
        );

      case 'video':
        return (
          <Box
            component="video"
            controls
            sx={{
              maxWidth: '100%',
              maxHeight: '80vh',
            }}
          >
            <source src={previewUrl} type={file.type} />
            Your browser does not support the video tag.
          </Box>
        );

      case 'application':
        if (fileExtension === 'pdf') {
          return (
            <Box
              component="iframe"
              src={previewUrl}
              sx={{
                width: '100%',
                height: '80vh',
                border: 'none',
              }}
              title="PDF Preview"
            />
          );
        } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
          // Use Google Docs Viewer for Office documents
          const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`;
          return (
            <Box
              component="iframe"
              src={googleDocsUrl}
              sx={{
                width: '100%',
                height: '80vh',
                border: 'none',
              }}
            />
          );
        }
        // Fall through to default for other application types

      default:
        return (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography>
              Preview not available for this file type ({file.type})
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please download the file to view it.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {file?.name}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          renderPreview()
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal; 