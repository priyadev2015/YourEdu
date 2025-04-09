import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  ListItemButton,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { RecordKeepingService } from '../services/RecordKeepingService';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import CourseFileService from '../services/CourseFileService';
import FilePreviewModal from '../components/FilePreviewModal';

// Create a single instance of the service
const recordKeepingService = new RecordKeepingService();
const courseFileService = CourseFileService;

const RecordKeeping = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedParentFolder, setSelectedParentFolder] = useState(null);
  const [currentCourseName, setCurrentCourseName] = useState('');
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [adminMaterials, setAdminMaterials] = useState([]);
  const [complianceDocuments, setComplianceDocuments] = useState([]);
  const [students, setStudents] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewLoadingId, setPreviewLoadingId] = useState(null);
  const [links, setLinks] = useState({});
  const navigate = useNavigate();

  const categories = [
    { value: 'attendance', label: 'Attendance' },
    { value: 'curriculum', label: 'Curriculum' },
    { value: 'assessments', label: 'Assessments' },
    { value: 'legal', label: 'Legal' },
    { value: 'other', label: 'Other' }
  ];

  const PRESET_FOLDERS = [
    { id: 'compliance', name: 'Compliance Forms Submitted' },
    { id: 'transcripts', name: 'Transcripts' },
  ];

  const loadStudentCourseFolders = async () => {
    try {
      const loadedStudents = await recordKeepingService.getStudents();
      const studentFolders = loadedStudents.map(student => ({
        id: `student-${student.id}`,
        name: `${student.student_name}'s Courses`,
        type: 'student-courses'
      }));
      return studentFolders;
    } catch (error) {
      console.error('Error loading student course folders:', error);
      return [];
    }
  };

  const fetchAdminMaterials = async () => {
    try {
      const adminMaterialTypes = ['course-descriptions', 'grading-rubric', 'school-profile', 'transcript'];
      const materials = [];

      for (const type of adminMaterialTypes) {
        const { data, error } = await supabase.storage
          .from('admin-materials')
          .list(`${type}/${user.id}`);

        if (!error && data && data.length > 0) {
          materials.push(...data.map(file => ({
            ...file,
            type,
            fullPath: `${type}/${user.id}/${file.name}`
          })));
        }
      }

      setAdminMaterials(materials);
      
      // Update folders to reflect new admin materials count
      setFolders(currentFolders => 
        currentFolders.map(folder => 
          folder.id === 'admin-materials' 
            ? { ...folder, documentCount: materials.length }
            : folder
        )
      );
    } catch (error) {
      console.error('Error fetching admin materials:', error);
    }
  };

  const handleDownloadAdminMaterial = async (material) => {
    try {
      const { data, error } = await supabase.storage
        .from('admin-materials')
        .download(material.fullPath);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading admin material:', error);
      setError('Failed to download admin material');
    }
  };

  const fetchComplianceDocuments = async () => {
    try {
      console.log('Fetching compliance documents for user:', user.id);
      
      // List files directly in the user's folder
      const { data: userFiles, error: userFilesError } = await supabase.storage
        .from('compliance_documents')
        .list(`${user.id}`, {
          sortBy: { column: 'name', order: 'asc' }
        });

      if (userFilesError) {
        console.error('Error fetching compliance documents:', userFilesError);
        throw userFilesError;
      }

      console.log('Raw compliance files response:', userFiles);

      // Filter out any potential folders and only keep files
      const documents = userFiles
        .filter(item => !item.metadata) // folders have metadata, files don't in the list response
        .map(file => ({
          ...file,
          fullPath: `${user.id}/${file.name}`,
          isComplianceDocument: true
        }));

      console.log('Processed compliance documents:', documents);

      setComplianceDocuments(documents);
      
      // Update folders to reflect compliance documents count
      setFolders(currentFolders => 
        currentFolders.map(folder => 
          folder.id === 'compliance' 
            ? { ...folder, documentCount: documents.length }
            : folder
        )
      );
    } catch (error) {
      console.error('Error fetching compliance documents:', error);
      // Set empty array on error to prevent UI issues
      setComplianceDocuments([]);
      setFolders(currentFolders => 
        currentFolders.map(folder => 
          folder.id === 'compliance' 
            ? { ...folder, documentCount: 0 }
            : folder
        )
      );
    }
  };

  const handleDownloadComplianceDocument = async (document) => {
    try {
      // Ensure we're using the correct path format
      const filePath = document.fullPath;
      console.log('Downloading compliance document:', filePath); // For debugging

      const { data, error } = await supabase.storage
        .from('compliance_documents')
        .download(filePath);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      // Create and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading compliance document:', error);
      setError('Failed to download compliance document');
    }
  };

  const initializeRecordKeeping = async () => {
    setIsLoading(true);
    try {
      // Load students and create their course folders
      const studentFolders = await loadStudentCourseFolders();
      
      // Combine preset folders with student course folders
      const allFolders = [...PRESET_FOLDERS, ...studentFolders];
      setFolders(allFolders);
      setStudents(await recordKeepingService.getStudents());

      // Set compliance as the default selected folder and load its contents
      setSelectedFolder('compliance');
      setDocuments([]);
    } catch (error) {
      console.error('Error initializing record keeping:', error);
      setError('Failed to initialize record keeping');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      initializeRecordKeeping();
    }
  }, [user]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name is required');
      return;
    }
    setIsLoading(true);
    try {
      await recordKeepingService.createFolder(newFolderName, selectedCategory);
      const updatedFolders = await recordKeepingService.getFolders();
      setFolders(updatedFolders);
      setIsCreateFolderDialogOpen(false);
      setNewFolderName('');
      setSelectedCategory('other');
    } catch (error) {
      setError('Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedFolder) {
      setError('Please select a file and folder');
      return;
    }
    setIsLoading(true);
    try {
      await recordKeepingService.uploadDocument(selectedFile, selectedFolder);
      const updatedDocuments = await recordKeepingService.getDocuments(selectedFolder);
      setDocuments(updatedDocuments);
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      setError('Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      if (document.type === 'transcript') {
        // Download transcript PDF from storage
        const { data, error } = await supabase.storage
          .from('transcripts')
          .download(document.file_path);

        if (error) throw error;

        // Create download link
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${document.student_name}_transcript.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Handle other document types...
        await recordKeepingService.downloadDocument(document.file_path, document.bucket);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  const handlePreview = async (document) => {
    try {
      // Handle links differently - open in new tab
      if (document.type === 'link') {
        window.open(document.url, '_blank');
        return;
      }

      setPreviewLoadingId(document.id);
      setPreviewLoading(true);
      const downloadUrl = await courseFileService.downloadFile(document.id);
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const file = new File([blob], document.name, { type: document.mime_type });
      setPreviewFile(file);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error previewing file:', error);
      if (error.message.includes('access to this course') || error.message.includes('access to this file')) {
        setError('You do not have permission to preview this file');
      } else {
        setError('Failed to preview file: ' + error.message);
      }
    } finally {
      setPreviewLoading(false);
      setPreviewLoadingId(null);
    }
  };

  const handleDeleteDocument = async (document, bucketName, tableName) => {
    try {
      if (document.type === 'link') {
        // Delete link from user_course_links table
        const { error } = await supabase
          .from('user_course_links')
          .delete()
          .eq('id', document.id);

        if (error) throw error;
      } else {
        // Delete file using existing method
        await recordKeepingService.deleteDocument(
          document.file_path,
          bucketName,
          document.id,
          tableName
        );
      }
      // Refresh documents list
      await handleFolderClick(selectedFolder);
    } catch (error) {
      setError('Failed to delete ' + (document.type === 'link' ? 'link' : 'document'));
    }
  };

  const handleFolderClick = async (folderId) => {
    if (folderId.startsWith('course-')) {
      // If it's a course folder, keep the parent folder selected and store course name
      const parentFolderId = selectedFolder;
      const courseName = documents.find(doc => `course-${doc.id}` === folderId)?.title;
      setCurrentCourseName(courseName || '');
      setSelectedParentFolder(parentFolderId);
    } else {
      // If it's a parent folder, update both selections
      setSelectedParentFolder(null);
      setCurrentCourseName('');
    }
    setSelectedFolder(folderId);
    setIsLoading(true);
    setError('');
    
    try {
      if (folderId === 'transcripts') {
        // Get all students for the current user
        const { data: students } = await supabase
          .from('students')
          .select('id, student_name')
          .eq('parent_id', user.id);

        if (!students) return;

        // For each student, check if they have a transcript PDF in storage
        const transcripts = await Promise.all(students.map(async (student) => {
          // Check for transcript PDF in storage
          const { data: files, error } = await supabase.storage
            .from('transcripts')
            .list(`${student.id}`);

          if (error) {
            console.error('Error checking transcript for student:', student.id, error);
            return null;
          }

          // Find the most recent transcript PDF if any exist
          const transcriptFile = files?.length > 0 
            ? files.reduce((latest, current) => {
                return !latest || current.created_at > latest.created_at ? current : latest;
              })
            : null;

          return {
            id: `${student.id}-transcript`,
            student_id: student.id,
            student_name: student.student_name,
            name: `${student.student_name}'s Transcript`,
            type: 'transcript',
            bucket: 'transcripts',
            exists: !!transcriptFile,
            file_path: transcriptFile ? `${student.id}/${transcriptFile.name}` : null,
            created_at: transcriptFile?.created_at,
            file_name: transcriptFile?.name
          };
        }));

        setDocuments(transcripts.filter(Boolean));
      } else if (folderId === 'compliance') {
        // Just set empty documents - the UI will show the button to state compliance
        setDocuments([]);
      } else if (folderId.startsWith('student-')) {
        // Get courses for the specific student
        const studentId = folderId.replace('student-', '');
        const courses = await recordKeepingService.getStudentCourses(studentId);
        setDocuments(courses.map(course => ({
          ...course,
          type: 'course-folder',
          name: course.title,
          description: `${course.term_start || ''} ${course.year || ''} - ${course.source === 'youredu' ? 'YourEDU' : course.college || 'User Course'}`
        })));
      } else if (folderId.startsWith('course-')) {
        const courseId = folderId.replace('course-', '');
        
        // Fetch both files and links
        const [allFiles, { data: linkData, error: linkError }] = await Promise.all([
          courseFileService.getFiles(courseId),
          supabase
            .from('user_course_links')
            .select('*')
            .eq('course_id', courseId)
        ]);

        if (linkError) throw linkError;

        // Transform files to match the expected format
        const materials = allFiles.map(file => ({
          ...file,
          type: 'course-material',
          bucket: 'course-files',
          description: `${file.category} - ${new Date(file.created_at).toLocaleDateString()}`
        }));

        // Transform links to match the display format
        const links = linkData.map(link => ({
          ...link,
          type: 'link',
          description: `Added ${new Date(link.created_at).toLocaleDateString()}`
        }));

        // Combine files and links
        setDocuments([...materials, ...links]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId, event) => {
    event.stopPropagation(); // Prevent folder selection when clicking delete
    setIsLoading(true);
    try {
      await recordKeepingService.deleteFolder(folderId);
      const updatedFolders = await recordKeepingService.getFolders();
      setFolders(updatedFolders);
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
        const allDocuments = await recordKeepingService.getDocuments();
        setDocuments(allDocuments);
      }
    } catch (error) {
      setError('Failed to delete folder');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (document) => {
    if (document.type === 'link') {
      return <LinkIcon />;
    }
    
    if (document.type === 'course-folder') {
      return <FolderIcon />;
    }

    // Map categories to icons
    const categoryIcons = {
      'curriculum': <BookIcon />,
      'assessments': <AssessmentIcon />,
      'attendance': <AssignmentIcon />,
      'legal': <DescriptionIcon />,
    };

    return categoryIcons[document.category] || <DescriptionIcon />;
  };

  const renderDocumentList = () => {
    if (documents.length === 0) {
      if (selectedFolder === 'compliance') {
        return (
          <Box sx={{ 
            textAlign: 'center',
            py: 4,
            backgroundColor: 'white',
            borderRadius: 1,
            border: '1px dashed #e2e8f0'
          }}>
            <Typography sx={{ color: '#718096', mb: 2 }}>
              Please visit the State Compliance Filing page to submit your required compliance forms.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/compliance/regulations')}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                height: 36,
                '&:hover': {
                  backgroundColor: '#2563EB',
                  boxShadow: 'none'
                },
                transition: 'none',
                boxShadow: 'none',
                textTransform: 'none'
              }}
            >
              Go to State Compliance Filing
            </Button>
          </Box>
        );
      } else if (selectedFolder === 'transcripts') {
        return (
          <Box sx={{ 
            textAlign: 'center',
            py: 4,
            backgroundColor: 'white',
            borderRadius: 1,
            border: '1px dashed #e2e8f0'
          }}>
            <Typography sx={{ color: '#718096' }}>
              No transcripts found. Please create transcripts for your students in the Transcript section.
            </Typography>
          </Box>
        );
      }
      return (
        <Box sx={{ 
          textAlign: 'center',
          py: 4,
          backgroundColor: 'white',
          borderRadius: 1,
          border: '1px dashed #e2e8f0'
        }}>
          <Typography sx={{ color: '#718096' }}>
            No documents found
          </Typography>
        </Box>
      );
    }

    // Special rendering for transcripts
    if (selectedFolder === 'transcripts') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {documents.map((student) => (
            <Button
              key={student.student_id}
              onClick={async () => {
                try {
                  console.log('Transcript button clicked for student:', student.student_name);
                  
                  // Fetch complete student data to ensure Navbar has all needed information
                  const { data: completeStudent, error } = await supabase
                    .from('students')
                    .select('*')
                    .eq('id', student.student_id)
                    .single();
                  
                  if (error) throw error;
                  
                  console.log('Complete student data fetched:', completeStudent);
                  
                  // Update the selected student in localStorage with complete data
                  localStorage.setItem('selectedStudent', JSON.stringify(completeStudent));
                  
                  // Dispatch the studentChanged event with complete student data
                  const studentChangedEvent = new CustomEvent('studentChanged', {
                    detail: completeStudent
                  });
                  
                  console.log('Dispatching studentChanged event with data:', studentChangedEvent.detail);
                  window.dispatchEvent(studentChangedEvent);
                  
                  // Add a small delay to ensure the event is processed before navigation
                  setTimeout(() => {
                    // Navigate to the transcript page
                    navigate('/transcript');
                  }, 100);
                } catch (error) {
                  console.error('Error fetching complete student data:', error);
                  // Fallback to using the limited data we have
                  const limitedStudentData = {
                    id: student.student_id,
                    student_name: student.student_name,
                    // Add any other fields we have available
                    parent_id: user.id, // Add parent_id which might be needed by Navbar
                    grade_level: student.grade_level || 'Not set' // Add grade level if available
                  };
                  
                  console.log('Using limited student data:', limitedStudentData);
                  localStorage.setItem('selectedStudent', JSON.stringify(limitedStudentData));
                  
                  const fallbackEvent = new CustomEvent('studentChanged', {
                    detail: limitedStudentData
                  });
                  
                  console.log('Dispatching fallback studentChanged event with data:', fallbackEvent.detail);
                  window.dispatchEvent(fallbackEvent);
                  
                  // Add a small delay to ensure the event is processed before navigation
                  setTimeout(() => {
                    // Navigate to the transcript page
                    navigate('/transcript');
                  }, 100);
                }
              }}
              variant="outlined"
              sx={{
                p: 2,
                justifyContent: 'flex-start',
                textAlign: 'left',
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                  borderColor: 'hsl(var(--brand-primary))',
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 500,
                  color: 'hsl(var(--foreground))'
                }}
              >
                {student.student_name}'s Transcript
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'hsl(var(--muted-foreground))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                Click to view and manage transcript
              </Typography>
            </Button>
          ))}
        </Box>
      );
    }

    // Regular document list rendering
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {documents.map((document) => {
          const isFolder = document.type && (document.type === 'student-folder' || document.type === 'course-folder');
          const isCourseMaterial = document.type === 'course-material';
          const isLink = document.type === 'link';
          const isLoading = previewLoading && previewLoadingId === document.id;

          return (
            <Button
              key={document.id}
              onClick={() => {
                if (isFolder) {
                  handleFolderClick(`course-${document.id}`);
                } else if (isLink) {
                  window.open(document.url, '_blank');
                } else if (isCourseMaterial && !isLoading) {
                  handlePreview(document);
                }
              }}
              variant="outlined"
              disabled={isLoading}
              sx={{
                p: 1.5,
                justifyContent: 'flex-start',
                textAlign: 'left',
                borderColor: 'hsl(var(--border))',
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                  borderColor: 'hsl(var(--brand-primary))',
                },
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                position: 'relative',
                pr: !isFolder ? 8 : 2,
                minHeight: 'auto',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              {isLoading && (
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
              
              {/* Icon */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minWidth: '40px'
              }}>
                {isLink ? <LinkIcon /> : getFileIcon(document)}
              </Box>

              {/* Content */}
              <Box sx={{ 
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
              }}>
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
                    {document.name}
                  </Typography>
                  {isLink && (
                    <Tooltip title="Click to open link">
                      <LinkIcon fontSize="small" sx={{ color: 'hsl(var(--brand-primary))' }} />
                    </Tooltip>
                  )}
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '0.75rem'
                }}>
                  <Typography variant="caption">
                    {isLink ? new Date(document.created_at).toLocaleDateString() : document.description || (document.created_at && new Date(document.created_at).toLocaleDateString())}
                  </Typography>
                  {isLink ? (
                    <Typography 
                      component="a"
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="caption" 
                      sx={{ 
                        color: 'hsl(var(--brand-primary))',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '120px', sm: '200px', md: '300px', lg: '400px' }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {document.url}
                    </Typography>
                  ) : (
                    isCourseMaterial && document.size_kb && (
                      <Typography variant="caption">
                        {document.size_kb < 1024 ? `${document.size_kb} KB` : `${(document.size_kb / 1024).toFixed(2)} MB`}
                      </Typography>
                    )
                  )}
                </Box>
              </Box>

              {/* Actions */}
              {!isFolder && (document.exists || isCourseMaterial) && (
                <Box 
                  sx={{ 
                    position: 'absolute',
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    zIndex: 2
                  }}
                >
                  {!isLink && (
                    <IconButton 
                      edge="end" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(document);
                      }} 
                      size="small"
                      disabled={isLoading}
                      sx={{ 
                        color: '#2563EB',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
                      handleDeleteDocument(
                        document, 
                        document.bucket,
                        document.type === 'compliance-form' ? 'state_compliance_forms' : 
                        document.type === 'transcript' ? 'transcripts' : 
                        'compliance_documents'
                      );
                    }} 
                    size="small"
                    disabled={isLoading}
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
              )}
            </Button>
          );
        })}
      </Box>
    );
  };

  return (
    <>
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid hsl(var(--border))',
        mb: 3
      }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: { xs: 2, sm: 'var(--container-padding-x)' },
            py: 3,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <Typography 
            sx={{ 
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2.1
            }}
          >
            Access and manage all your documents in one place. View your ID cards, compliance documents, and student course materials.
          </Typography>
        </Container>
      </Box>

      {/* Main Content Container */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: { xs: 2, sm: 'var(--container-padding-x)' },
          py: 'var(--container-padding-y)',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          minHeight: '600px',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Left Sidebar - Folders */}
          <Box sx={{ 
            width: { xs: '100%', md: '300px' },
            flexShrink: 0,
            backgroundColor: 'white',
            borderRadius: { 
              xs: '8px 8px 0 0', 
              md: '8px 0 0 8px' 
            },
            border: '1px solid hsl(var(--border))',
            overflow: 'hidden',
            mb: { xs: 2, md: 0 }
          }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--muted))'
            }}>
              <Typography sx={{ 
                color: '#000000',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}>
                Folders
              </Typography>
            </Box>
            <List sx={{ px: 2, py: 1.5 }}>
              {/* Preset Folders */}
              {PRESET_FOLDERS.map((folder) => (
                <ListItem
                  key={folder.id}
                  disablePadding
                >
                  <ListItemButton
                    selected={selectedFolder === folder.id}
                    onClick={() => handleFolderClick(folder.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'hsl(var(--brand-primary-light))',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--brand-primary-light))',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                          {folder.name}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {/* Student Course Folders Section */}
              {folders.filter(folder => folder.type === 'student-courses').length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ px: 1, mb: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#718096',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600
                      }}
                    >
                      Student Course Folders
                    </Typography>
                  </Box>
                </>
              )}

              {/* Student Course Folders */}
              {folders.filter(folder => folder.type === 'student-courses').map((folder) => (
                <ListItem
                  key={folder.id}
                  disablePadding
                >
                  <ListItemButton
                    selected={selectedFolder === folder.id || selectedParentFolder === folder.id}
                    onClick={() => handleFolderClick(folder.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'hsl(var(--brand-primary-light))',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--brand-primary-light))',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                          {folder.name}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Right Content Area - Documents */}
          <Box sx={{ 
            flex: 1,
            minWidth: 0, // Important for flex child
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              backgroundColor: 'white', 
              borderRadius: { 
                xs: '0 0 8px 8px',
                md: '0 8px 8px 0' 
              },
              border: '1px solid hsl(var(--border))',
              borderLeft: { xs: '1px solid hsl(var(--border))', md: 'none' },
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))'
              }}>
                <Typography sx={{ 
                  color: '#000000',
                  fontWeight: 600,
                  fontSize: '1.125rem'
                }}>
                  Documents
                </Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                {selectedFolder?.startsWith('course-') && selectedParentFolder?.startsWith('student-') && (
                  <Button
                    onClick={() => handleFolderClick(selectedParentFolder)}
                    sx={{
                      mb: 2,
                      color: 'hsl(var(--brand-primary))',
                      textTransform: 'none',
                      fontWeight: 500,
                      pl: 0,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    ← Back to {currentCourseName || 'Course List'}
                  </Button>
                )}

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2,
                      borderRadius: 1,
                      '& .MuiAlert-message': {
                        color: '#e53e3e',
                        fontSize: '0.875rem'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}
                
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={32} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  </Box>
                ) : (
                  renderDocumentList()
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Create Folder Dialog */}
        <Dialog 
          open={isCreateFolderDialogOpen} 
          onClose={() => setIsCreateFolderDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid #e2e8f0',
            px: 3,
            py: 2
          }}>
            <Typography variant="subtitle1" sx={{ color: '#2d3748', fontWeight: 600 }}>
              Create New Folder
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4299e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4299e1',
                  },
                }
              }}
            />
            <TextField
              select
              margin="dense"
              label="Category"
              fullWidth
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4299e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4299e1',
                  },
                }
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e2e8f0',
            px: 3,
            py: 2
          }}>
            <Button 
              onClick={() => setIsCreateFolderDialogOpen(false)}
              sx={{
                color: '#718096',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(113, 128, 150, 0.1)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder} 
              variant="contained"
              sx={{
                backgroundColor: '#4299e1',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#2b6cb0',
                }
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Document Dialog */}
        <Dialog 
          open={isUploadDialogOpen} 
          onClose={() => setIsUploadDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid #e2e8f0',
            px: 3,
            py: 2
          }}>
            <Typography variant="subtitle1" sx={{ color: '#2d3748', fontWeight: 600 }}>
              Upload Document
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box 
              sx={{ 
                border: '2px dashed #e2e8f0',
                borderRadius: 1,
                p: 3,
                mb: 2,
                textAlign: 'center',
                backgroundColor: '#f7fafc'
              }}
            >
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  component="span"
                  startIcon={<AddIcon />}
                  sx={{
                    color: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(66, 153, 225, 0.2)',
                    },
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Choose File
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 2, color: '#4a5568' }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
            <TextField
              select
              margin="dense"
              label="Select Folder"
              fullWidth
              value={selectedFolder || ''}
              onChange={(e) => setSelectedFolder(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4299e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4299e1',
                  },
                }
              }}
            >
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e2e8f0',
            px: 3,
            py: 2
          }}>
            <Button 
              onClick={() => setIsUploadDialogOpen(false)}
              sx={{
                color: '#718096',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(113, 128, 150, 0.1)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadDocument} 
              variant="contained"
              disabled={!selectedFile || !selectedFolder}
              sx={{
                backgroundColor: '#4299e1',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#2b6cb0',
                }
              }}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <FilePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={previewFile}
      />
    </>
  );
};

export default RecordKeeping; 