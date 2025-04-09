import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import CourseFileService from '../services/CourseFileService';
import { MATERIAL_CATEGORIES } from '../constants/courseConstants';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import FilePreviewModal from '../components/FilePreviewModal';

// Add video links category to the existing categories
const EXTENDED_CATEGORIES = [
  ...MATERIAL_CATEGORIES,
  { id: 'video_links', label: 'Video Links', icon: VideoIcon },
  { id: 'other', label: 'Other', icon: FolderIcon },
];

const UserCourseMaterials = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [files, setFiles] = useState({});
  const [links, setLinks] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(EXTENDED_CATEGORIES[0].id);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [addingLink, setAddingLink] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewLoadingId, setPreviewLoadingId] = useState(null);
  
  // Use the imported CourseFileService instance
  const fileService = CourseFileService;

  // Fetch course data, files and links
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // First try youredu_courses
        let { data: youreduData, error: youreduError } = await supabase
          .from('youredu_courses')
          .select('*, students(*)')
          .eq('id', courseId)
          .maybeSingle();

        if (youreduData) {
          console.log('Found course in youredu_courses:', youreduData);
          setCourseData(youreduData);
        } else {
          console.log('Course not found in youredu_courses, trying user_courses');
          // If not found in youredu_courses, try user_courses
          const { data: userData, error: userError } = await supabase
            .from('user_courses')
            .select('*, students!inner(*)')
            .eq('id', courseId)
            .single();

          if (userError) {
            console.error('Error fetching from user_courses:', userError);
            throw userError;
          }

          console.log('Found course in user_courses:', userData);
          setCourseData(userData);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        toast.error('Failed to load course');
      }
    };

    const fetchFiles = async () => {
      try {
        const allFiles = await fileService.getFiles(courseId);
        
        // Group files by frontend category
        const groupedFiles = {};
        EXTENDED_CATEGORIES.forEach(cat => {
          const dbCategory = fileService.mapCategoryToDbCategory(cat.id);
          groupedFiles[cat.id] = allFiles.filter(file => 
            file.file_path.includes(`/${cat.id}/`) || 
            (file.category === dbCategory && file.file_path.includes(`/${cat.id}/`))
          );
        });
        
        setFiles(groupedFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast.error('Failed to load course materials');
      }
    };

    const fetchLinks = async () => {
      try {
        const { data: linkData, error: linkError } = await supabase
          .from('user_course_links')
          .select('*')
          .eq('course_id', courseId);

        if (linkError) throw linkError;

        // Group links by category
        const groupedLinks = {};
        EXTENDED_CATEGORIES.forEach(cat => {
          groupedLinks[cat.id] = linkData.filter(link => link.category === cat.id);
        });

        setLinks(groupedLinks);
      } catch (error) {
        console.error('Error fetching links:', error);
        toast.error('Failed to load course links');
      }
    };

    if (courseId) {
      Promise.all([fetchCourseData(), fetchFiles(), fetchLinks()])
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles.length) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const totalFiles = selectedFiles.length;
      let successCount = 0;
      
      for (const file of selectedFiles) {
        try {
          await fileService.uploadFile(file, courseId, selectedCategory);
          successCount++;
          setUploadProgress((successCount / totalFiles) * 100);
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} of ${totalFiles} files`);
        
        // Refresh files
        const allFiles = await fileService.getFiles(courseId);
        
        // Group files by frontend category
        const groupedFiles = {};
        EXTENDED_CATEGORIES.forEach(cat => {
          const dbCategory = fileService.mapCategoryToDbCategory(cat.id);
          groupedFiles[cat.id] = allFiles.filter(file => 
            file.file_path.includes(`/${cat.id}/`) || 
            (file.category === dbCategory && file.file_path.includes(`/${cat.id}/`))
          );
        });
        
        setFiles(groupedFiles);
      }
      
      setOpenUploadDialog(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error in upload process:', error);
      toast.error('Failed to complete upload process');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddLink = async () => {
    if (!linkTitle || !linkUrl) return;
    
    setAddingLink(true);
    try {
      // First check youredu_courses
      let { data: courseCheck, error: courseError } = await supabase
        .from('youredu_courses')
        .select('id, student_id')
        .eq('id', courseId)
        .maybeSingle();

      let courseType = 'youredu_course';

      // If not found in youredu_courses, check user_courses
      if (!courseCheck) {
        const { data: userCourseCheck, error: userCourseError } = await supabase
          .from('user_courses')
          .select('id, student_id')
          .eq('id', courseId)
          .single();

        if (userCourseError) {
          console.error('Error checking user_courses:', userCourseError);
          throw new Error('Failed to verify course access');
        }

        courseCheck = userCourseCheck;
        courseType = 'user_course';
      }

      if (!courseCheck) {
        throw new Error('Course not found');
      }

      console.log('Course check successful:', courseCheck);
      console.log('Course type:', courseType);
      console.log('Adding link with data:', {
        course_id: courseId,
        course_type: courseType,
        name: linkTitle,
        url: linkUrl,
        category: selectedCategory
      });

      // Save link to Supabase
      const { data: newLink, error } = await supabase
        .from('user_course_links')
        .insert({
          course_id: courseId,
          course_type: courseType,
          name: linkTitle,
          url: linkUrl,
          category: selectedCategory,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      console.log('Successfully added link:', newLink);

      // Update local state
      setLinks(prev => ({
        ...prev,
        [selectedCategory]: [...(prev[selectedCategory] || []), newLink]
      }));
      
      // Clear form and close dialog
      setOpenLinkDialog(false);
      setLinkTitle('');
      setLinkUrl('');
      toast.success('Link added successfully');
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error(error.message || 'Failed to add link');
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      const { error } = await supabase
        .from('user_course_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      // Update local state
      setLinks(prev => {
        const newLinks = { ...prev };
        Object.keys(newLinks).forEach(category => {
          newLinks[category] = newLinks[category].filter(link => link.id !== linkId);
        });
        return newLinks;
      });

      toast.success('Link deleted successfully');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link: ' + error.message);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const downloadUrl = await fileService.downloadFile(fileId);
      // Open the download URL in a new tab
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      
      // Provide more specific error messages based on the error
      if (error.message.includes('access to this course') || error.message.includes('access to this file')) {
        toast.error('You do not have permission to download this file');
      } else if (error.message.includes('fetch file information')) {
        toast.error('File information could not be found. The file may have been deleted.');
      } else if (error.message.includes('generate download link')) {
        toast.error('Could not generate download link. Please try again later.');
      } else {
        toast.error('Failed to download file: ' + error.message);
      }
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      toast.success('File deleted successfully');
      
      // Refresh files
      const allFiles = await fileService.getFiles(courseId);
      
      // Group files by frontend category
      const groupedFiles = {};
      EXTENDED_CATEGORIES.forEach(cat => {
        // For each frontend category, find files that match based on the original category
        // or the mapped database category
        const dbCategory = fileService.mapCategoryToDbCategory(cat.id);
        
        // Filter files that match either the frontend category in file_path
        // or the mapped database category in the category field
        groupedFiles[cat.id] = allFiles.filter(file => 
          file.file_path.includes(`/${cat.id}/`) || 
          (file.category === dbCategory && file.file_path.includes(`/${cat.id}/`))
        );
      });
      
      setFiles(groupedFiles);
    } catch (error) {
      console.error('Error deleting file:', error);
      
      // Provide more specific error messages based on the error
      if (error.message.includes('access to this course') || error.message.includes('access to this file')) {
        toast.error('You do not have permission to delete this file');
      } else if (error.message.includes('fetch file information')) {
        toast.error('File information could not be found. The file may have already been deleted.');
      } else if (error.message.includes('delete file from storage')) {
        toast.error('Could not delete file from storage. Please try again later.');
      } else if (error.message.includes('delete file record')) {
        toast.error('Could not delete file record from database. Please try again later.');
      } else {
        toast.error('Failed to delete file: ' + error.message);
      }
    }
  };

  const handlePreview = async (file) => {
    // If it's a link, open it in a new tab
    if (file.type === 'link') {
      window.open(file.url, '_blank');
      return;
    }

    try {
      setPreviewLoadingId(file.id);
      setPreviewLoading(true);
      const downloadUrl = await fileService.downloadFile(file.id);
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const previewFile = new File([blob], files[selectedCategory].find(f => f.id === file.id).name, { type: blob.type });
      setPreviewFile(previewFile);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error previewing file:', error);
      if (error.message.includes('access to this course') || error.message.includes('access to this file')) {
        toast.error('You do not have permission to preview this file');
      } else {
        toast.error('Failed to preview file: ' + error.message);
      }
    } finally {
      setPreviewLoading(false);
      setPreviewLoadingId(null);
    }
  };

  const isLink = (file) => {
    return file.name.endsWith('.link.json') || file.mime_type === 'application/json';
  };

  const formatFileSize = (sizeKb) => {
    if (sizeKb < 1024) {
      return `${sizeKb} KB`;
    } else {
      return `${(sizeKb / 1024).toFixed(2)} MB`;
    }
  };

  const getFileIcon = (file) => {
    if (isLink(file)) {
      return <LinkIcon />;
    }
    
    const category = EXTENDED_CATEGORIES.find(cat => cat.id === file.category);
    if (category) {
      const Icon = category.icon;
      return <Icon />;
    }
    
    return <DescriptionIcon />;
  };

  // Modify the render section to combine files and links
  const getCombinedItems = (category) => {
    const categoryFiles = files[category] || [];
    const categoryLinks = links[category] || [];
    return [...categoryFiles, ...categoryLinks];
  };

  const hasItems = (category) => {
    const items = getCombinedItems(category);
    return items.length > 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
      pr: 0,
      pl: 0,
      mx: 0
    }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
          border: '1px solid hsl(var(--brand-primary) / 0.2)',
          borderRadius: '12px',
          p: 3,
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          mx: 0
        }}
      >
        <Box sx={{ 
          maxWidth: '800px',
          width: '100%',
          overflow: 'hidden'
        }}>
          <Typography
            variant="h5"
            sx={{
              color: 'hsl(var(--brand-primary))',
              fontWeight: 600,
              mb: 1,
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            Course Materials
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'hsl(var(--foreground))',
              lineHeight: 1.6,
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            Upload and organize course materials for your students. Add syllabus, readings, problem sets, and other resources to help students succeed in your course.
          </Typography>
        </Box>
      </Paper>

      {/* Materials Content */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'white',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          mx: 0,
          boxSizing: 'border-box'
        }}
      >
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            width: '100%', 
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              width: '100%',
              maxWidth: '100%',
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 'auto',
                maxWidth: '180px',
                px: 2,
                py: 1.5,
                fontSize: '0.875rem',
                flexShrink: 0
              },
              '& .MuiTabs-flexContainer': {
                width: 'auto'
              },
              '& .MuiTabs-scroller': {
                overflow: 'hidden !important'
              }
            }}
          >
            {EXTENDED_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Tab
                  key={category.id}
                  value={category.id}
                  sx={{
                    maxWidth: 'none',
                    width: 'auto'
                  }}
                  label={
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        overflow: 'hidden'
                      }}
                    >
                      <Icon fontSize="small" sx={{ flexShrink: 0 }} />
                      <Typography 
                        variant="body2" 
                        noWrap 
                        sx={{ 
                          display: 'block',
                          maxWidth: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {category.label}
                      </Typography>
                      {hasItems(category.id) && (
                        <Chip
                          label={getCombinedItems(category.id).length}
                          size="small"
                          sx={{
                            height: '20px',
                            fontSize: '0.75rem',
                            backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                            color: 'hsl(var(--brand-primary))',
                            flexShrink: 0
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>

        <Box sx={{ 
          p: 3, 
          width: '100%', 
          maxWidth: '100%', 
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: 2,
            width: '100%',
            maxWidth: '100%'
          }}>
            <Typography variant="h6">
              {EXTENDED_CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'Materials'}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              width: { xs: '100%', sm: 'auto' }
            }}>
              {selectedCategory === 'video_links' ? (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenLinkDialog(true)}
                  fullWidth={false}
                  size="small"
                  sx={{
                    borderColor: '#2563EB',
                    color: '#2563EB',
                    height: 36,
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      boxShadow: 'none',
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none',
                  }}
                >
                  Add Video Link
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<LinkIcon />}
                    onClick={() => setOpenLinkDialog(true)}
                    fullWidth={false}
                    size="small"
                    sx={{
                      borderColor: '#2563EB',
                      color: '#2563EB',
                      height: 36,
                      '&:hover': {
                        borderColor: '#2563EB',
                        backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                        boxShadow: 'none',
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none',
                    }}
                  >
                    Add Link
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => setOpenUploadDialog(true)}
                    fullWidth={false}
                    size="small"
                    sx={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      height: 36,
                      '&:hover': {
                        backgroundColor: '#2563EB',
                        boxShadow: 'none',
                      },
                      transition: 'none',
                      boxShadow: 'none',
                      textTransform: 'none',
                    }}
                  >
                    Upload File
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {!hasItems(selectedCategory) ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                backgroundColor: 'hsl(var(--muted) / 0.1)',
                borderRadius: 2,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'hsl(var(--muted) / 0.2)',
                  borderRadius: '50%',
                  mb: 2,
                }}
              >
                {(() => {
                  const CategoryIcon = EXTENDED_CATEGORIES.find(cat => cat.id === selectedCategory)?.icon || FolderIcon;
                  return <CategoryIcon sx={{ fontSize: 40, color: 'hsl(var(--muted-foreground))' }} />;
                })()}
              </Box>
              <Typography variant="h6" sx={{ color: 'hsl(var(--foreground))', mb: 1 }}>
                No {EXTENDED_CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'materials'} yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 3, textAlign: 'center', maxWidth: 400 }}>
                {selectedCategory === 'video_links'
                  ? 'Add video links to help your students with visual learning resources.'
                  : `Upload ${EXTENDED_CATEGORIES.find(cat => cat.id === selectedCategory)?.label.toLowerCase() || 'materials'} for your students to access.`}
              </Typography>
              {selectedCategory === 'video_links' ? (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenLinkDialog(true)}
                  sx={{
                    borderColor: '#2563EB',
                    color: '#2563EB',
                    height: 36,
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                      boxShadow: 'none',
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none',
                  }}
                >
                  Add Video Link
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setOpenUploadDialog(true)}
                  sx={{
                    backgroundColor: '#2563EB',
                    color: 'white',
                    height: 36,
                    '&:hover': {
                      backgroundColor: '#2563EB',
                      boxShadow: 'none',
                    },
                    transition: 'none',
                    boxShadow: 'none',
                    textTransform: 'none',
                  }}
                >
                  Upload File
                </Button>
              )}
            </Box>
          ) : (
            <List sx={{ 
              width: '100%', 
              maxWidth: '100%',
              bgcolor: 'background.paper', 
              overflowX: 'hidden',
              boxSizing: 'border-box',
              p: 0
            }}>
              {getCombinedItems(selectedCategory)?.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'hsl(var(--muted) / 0.1)',
                      },
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: '100%',
                      pr: 8,
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => item.url ? window.open(item.url, '_blank') : handlePreview(item)}
                  >
                    {previewLoading && previewLoadingId === item.id && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}
                      >
                        <CircularProgress size={24} sx={{ color: 'hsl(var(--brand-primary))' }} />
                      </Box>
                    )}
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      {item.url ? <LinkIcon /> : getFileIcon(item)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {item.name}
                          </Typography>
                          {item.url && (
                            <Tooltip title="Click to open link">
                              <LinkIcon fontSize="small" sx={{ color: 'hsl(var(--brand-primary))' }} />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                          {item.url ? (
                            <>
                              <Typography 
                                component="a"
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="caption" 
                                sx={{ 
                                  color: 'hsl(var(--brand-primary))',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  },
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '100%'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {item.url}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {new Date(item.created_at).toLocaleDateString()}
                              </Typography>
                            </>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {new Date(item.created_at).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                {formatFileSize(item.size_kb)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '160px', sm: '220px', md: '300px', lg: '450px' },
                        width: '100%'
                      }}
                    />
                    <ListItemSecondaryAction sx={{ zIndex: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                        {!item.url && (
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item.id);
                            }} 
                            size="small"
                            disabled={previewLoading && previewLoadingId === item.id}
                            sx={{ 
                              color: 'hsl(var(--brand-primary))',
                              '&:hover': {
                                backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                              }
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            item.url ? handleDeleteLink(item.id) : handleDelete(item.id);
                          }} 
                          size="small"
                          disabled={previewLoading && previewLoadingId === item.id}
                          sx={{ 
                            color: '#718096',
                            '&:hover': {
                              backgroundColor: 'rgba(113, 128, 150, 0.1)',
                              color: '#e53e3e'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Upload Dialog */}
      <Dialog 
        open={openUploadDialog} 
        onClose={() => {
          setOpenUploadDialog(false);
          setSelectedFiles([]);
          setUploadProgress(0);
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: '95%', sm: '500px' },
            maxWidth: '100%',
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle>Upload {EXTENDED_CATEGORIES.find(cat => cat.id === selectedCategory)?.label || 'Material'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ 
                  py: 5, 
                  border: '2px dashed', 
                  borderColor: 'hsl(var(--border))',
                  color: '#2563EB',
                  '&:hover': {
                    borderColor: '#2563EB',
                    backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                    boxShadow: 'none',
                  },
                  transition: 'none',
                  boxShadow: 'none',
                  textTransform: 'none',
                }}
              >
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected` 
                  : 'Select files to upload'}
              </Button>
            </label>
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Files:</Typography>
                <List dense>
                  {selectedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <DescriptionIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={file.name}
                        secondary={formatFileSize(Math.round(file.size / 1024))}
                      />
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => {
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'hsl(var(--muted) / 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'hsl(var(--brand-primary))',
                      borderRadius: 4,
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    textAlign: 'center',
                    color: 'hsl(var(--muted-foreground))'
                  }}
                >
                  Uploading... {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenUploadDialog(false);
              setSelectedFiles([]);
              setUploadProgress(0);
            }}
            variant="outlined"
            sx={{
              borderColor: '#2563EB',
              color: '#2563EB',
              height: 36,
              '&:hover': {
                borderColor: '#2563EB',
                backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                boxShadow: 'none',
              },
              transition: 'none',
              boxShadow: 'none',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={!selectedFiles.length || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: '#2563EB',
              color: 'white',
              height: 36,
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none',
              },
              transition: 'none',
              boxShadow: 'none',
              textTransform: 'none',
            }}
          >
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog 
        open={openLinkDialog} 
        onClose={() => setOpenLinkDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: '95%', sm: '500px' },
            maxWidth: '100%',
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle>
          Add {selectedCategory === 'video_links' ? 'Video Link' : 'Link'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
            />
            <TextField
              label="URL"
              variant="outlined"
              fullWidth
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenLinkDialog(false)}
            variant="outlined"
            sx={{
              borderColor: '#2563EB',
              color: '#2563EB',
              height: 36,
              '&:hover': {
                borderColor: '#2563EB',
                backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                boxShadow: 'none',
              },
              transition: 'none',
              boxShadow: 'none',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddLink}
            disabled={!linkTitle || !linkUrl || addingLink}
            startIcon={addingLink ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: '#2563EB',
              color: 'white',
              height: 36,
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none',
              },
              transition: 'none',
              boxShadow: 'none',
              textTransform: 'none',
            }}
          >
            Add Link
          </Button>
        </DialogActions>
      </Dialog>

      <FilePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={previewFile}
      />
    </Box>
  );
};

export default UserCourseMaterials; 