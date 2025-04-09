import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Divider,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  SmartToy as SmartToyIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  Assignment as AssignmentIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import our Claude API utility
import { sendMessageToClaude, generateCourseStructure } from '../utils/claudeApi';

const SortableItem = ({ id, module, onEdit, onDelete, onDeleteItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{ 
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        flexDirection: 'column',
        alignItems: 'stretch'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 1 }}>
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 2 }}>
          <DragIcon sx={{ color: 'text.secondary' }} />
        </Box>
        <Typography variant="h6">{module.title}</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => onEdit(module)}>
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(module.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {module.description && (
        <Typography variant="body2" sx={{ px: 2, pb: 1, color: 'text.secondary' }}>
          {module.description}
        </Typography>
      )}
      
      {module.items && module.items.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Items:</Typography>
          <List dense disablePadding>
            {module.items.map((item) => (
              <ListItem 
                key={item.id}
                sx={{ 
                  py: 1, 
                  px: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {item.type === 'link' ? <LinkIcon fontSize="small" /> : <AssignmentIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  secondary={
                    <>
                      {item.type === 'link' && item.url && (
                        <Typography variant="body2" component="span" sx={{ display: 'block', color: 'primary.main' }}>
                          {item.url}
                        </Typography>
                      )}
                      {item.description && (
                        <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                          {item.description}
                        </Typography>
                      )}
                    </>
                  }
                />
                <IconButton 
                  size="small" 
                  edge="end" 
                  onClick={() => onDeleteItem(module.id, item.id)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </ListItem>
  );
};

const UserCourseModules = () => {
  // Course Module state
  const [selectedCourseType, setSelectedCourseType] = useState(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [modules, setModules] = useState([]);
  const [moduleMenuAnchor, setModuleMenuAnchor] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [courseInfo, setCourseInfo] = useState({
    type: '',
    materials: '',
    courseStructure: '',
  });
  const [editingModule, setEditingModule] = useState(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [testError, setTestError] = useState(null);
  const [simpleTestResponse, setSimpleTestResponse] = useState(null);
  const [simpleTestError, setSimpleTestError] = useState(null);
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manual course creation steps
  const manualSteps = ['Course Type', 'Course Structure', 'Module Creation'];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Module handlers
  const handleAddModule = () => {
    const newModule = {
      id: Date.now(),
      title: 'New Module',
      items: []
    };
    setModules(prevModules => [...prevModules, newModule]);
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setShowModuleDialog(true);
  };

  const handleSaveModule = (updatedModule) => {
    if (editingModule) {
      setModules(prevModules => 
        prevModules.map(m => 
          m.id === editingModule.id ? { ...updatedModule, id: m.id } : m
        )
      );
    } else {
      setModules(prevModules => [...prevModules, { ...updatedModule, id: Date.now() }]);
    }
    setShowModuleDialog(false);
    setEditingModule(null);
  };

  const handleAddModuleItem = (moduleId, type) => {
    const newItem = {
      id: Date.now(),
      type,
      title: type === 'link' ? 'New Link' : 'New Assignment'
    };
    
    setModules(prevModules => prevModules.map(module =>
      module.id === moduleId
        ? { ...module, items: [...module.items, newItem] }
        : module
    ));
    setModuleMenuAnchor(null);
  };

  const handleEditItem = (moduleId, item) => {
    // TODO: Implement item editing
    console.log('Edit item:', moduleId, item);
  };

  const handleDeleteItem = (moduleId, itemId) => {
    setModules(prevModules => prevModules.map(module => 
      module.id === moduleId 
        ? { ...module, items: module.items.filter(item => item.id !== itemId) }
        : module
    ));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Simple test function for Claude API
  const testClaudeAPI = async () => {
    setIsLoading(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const response = await sendMessageToClaude(
        "Hello! Please create a brief sample lesson plan about photosynthesis.",
        {
          maxTokens: 500,
          temperature: 0.7
        }
      );

      setTestResponse(response.content[0].text);
    } catch (error) {
      console.error('Error testing Claude API:', error);
      setTestError(error.message || 'An error occurred while testing the Claude API');
    } finally {
      setIsLoading(false);
    }
  };

  // Test course structure generation
  const testCourseGeneration = async () => {
    setIsLoading(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const materials = `
        Subject: Biology
        Grade Level: High School
        Topics to Cover:
        - Cell Structure and Function
        - DNA and Genetics
        - Evolution
        Duration: 6 weeks
      `;

      const courseStructure = await generateCourseStructure(materials, {
        temperature: 0.7
      });

      setTestResponse(JSON.stringify(courseStructure, null, 2));
    } catch (error) {
      console.error('Error generating course structure:', error);
      setTestError(error.message || 'An error occurred while generating the course structure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    try {
      console.log('Generating mock course data...');
      setTestResponse(null);
      setTestError(null);
      
      // Create a mock course structure
      const mockCourseData = {
        modules: [
          {
            title: "Introduction to the Course",
            description: "Overview of the course and its objectives",
            items: [
              {
                type: "link",
                title: "Course Overview",
                description: "A brief introduction to the course"
              },
              {
                type: "assignment",
                title: "Initial Assessment",
                description: "Evaluate your current knowledge"
              }
            ]
          },
          {
            title: "Core Concepts",
            description: "Fundamental principles and ideas",
            items: [
              {
                type: "link",
                title: "Key Terminology",
                description: "Important terms and definitions"
              },
              {
                type: "assignment",
                title: "Concept Application",
                description: "Apply the concepts in practical scenarios"
              }
            ]
          }
        ]
      };

      // Process the modules
      const processedModules = mockCourseData.modules.map(module => ({
        ...module,
        id: Date.now() + Math.random(),
        items: (module.items || []).map(item => ({
          ...item,
          id: Date.now() + Math.random(),
        }))
      }));

      setModules(processedModules);
      setShowAIDialog(false);
      setSelectedCourseType('manual');
      setActiveStep(2); // Skip to module creation step
    } catch (error) {
      console.error('Error generating course:', error);
      setTestError(error.message);
      alert(`Failed to generate course structure: ${error.message}`);
    }
  };

  const runSimpleTest = async () => {
    try {
      console.log('Using mock minimal test data...');
      setSimpleTestResponse(null);
      setSimpleTestError(null);
      
      // Use mock data directly instead of API call
      const mockData = {
        success: true,
        message: "API endpoint is working!",
        timestamp: new Date().toISOString()
      };
      
      console.log('Mock minimal test response:', mockData);
      setSimpleTestResponse(mockData);
    } catch (err) {
      console.error('Error in mock minimal test:', err);
      setSimpleTestError(err.message);
    }
  };

  const renderCourseTypeSelection = () => (
    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
      <Card 
        onClick={() => {
          setSelectedCourseType('manual');
          setActiveStep(0);
        }}
        sx={{ 
          width: 300,
          cursor: 'pointer',
          '&:hover': { boxShadow: 3 },
          transition: 'all 0.2s'
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 48, color: 'hsl(var(--brand-primary))', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>Manual Creation</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a course structure manually with full control
          </Typography>
        </CardContent>
      </Card>
      <Card 
        onClick={() => {
          setSelectedCourseType('ai');
          setShowAIDialog(true);
        }}
        sx={{ 
          width: 300,
          cursor: 'pointer',
          '&:hover': { boxShadow: 3 },
          transition: 'all 0.2s'
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <SmartToyIcon sx={{ fontSize: 48, color: 'hsl(var(--brand-primary))', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>AI Assisted</Typography>
          <Typography variant="body2" color="text.secondary">
            Let Claude help create a customized course structure
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  const renderCourseStructure = () => (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <TextField
        fullWidth
        label="Course Name"
        value={courseInfo.name || ''}
        onChange={(e) => setCourseInfo({ ...courseInfo, name: e.target.value })}
        sx={{ mb: 3 }}
      />
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Course Type</InputLabel>
        <Select
          value={courseInfo.type}
          label="Course Type"
          onChange={(e) => setCourseInfo({ ...courseInfo, type: e.target.value })}
        >
          <MenuItem value="textbook">Textbook-Based</MenuItem>
          <MenuItem value="readings">Readings-Based</MenuItem>
          <MenuItem value="problems">Problem Sets</MenuItem>
          <MenuItem value="project">Project-Based</MenuItem>
          <MenuItem value="hybrid">Hybrid</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Course Description"
        value={courseInfo.description || ''}
        onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })}
        sx={{ mb: 3 }}
      />
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Course Structure
        </Typography>
        
        {/* Claude API Test Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Claude API Integration
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={testClaudeAPI}
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Simple Response'}
            </Button>
            <Button
              variant="contained"
              onClick={testCourseGeneration}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Test Course Generation'}
            </Button>
          </Box>
          
          {testError && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
              <Typography color="error">Error: {testError}</Typography>
            </Paper>
          )}
          
          {testResponse && (
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: 400, overflow: 'auto' }}>
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {testResponse}
              </Typography>
            </Paper>
          )}
        </Paper>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!courseInfo.type || !courseInfo.name}
          fullWidth
        >
          Continue
        </Button>
      </Box>
    </Box>
  );

  const renderModuleCreation = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Course Modules</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleAddModule}
        >
          Add Module
        </Button>
      </Box>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={modules.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <List>
            {modules.map((module) => (
              <SortableItem
                key={module.id}
                id={module.id}
                module={module}
                onEdit={handleEditModule}
                onDelete={(id) => {
                  setModules(prevModules => prevModules.filter(m => m.id !== id));
                }}
                onDeleteItem={handleDeleteItem}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>

      {modules.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No modules yet. Click "Add Module" to create your first module.
          </Typography>
        </Box>
      )}
    </Box>
  );

  const ModuleDialog = ({ open, onClose, module, onSave }) => {
    const [moduleData, setModuleData] = useState(module || {
      title: '',
      description: '',
      items: []
    });

    const handleAddItem = (type) => {
      setModuleData(prev => ({
        ...prev,
        items: [...prev.items, {
          id: Date.now(),
          type,
          title: '',
          description: ''
        }]
      }));
    };

    const handleRemoveItem = (itemId) => {
      setModuleData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    };

    const handleItemChange = (itemId, field, value) => {
      setModuleData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }));
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{module ? 'Edit Module' : 'New Module'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Module Title"
            value={moduleData.title}
            onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
            sx={{ mb: 3, mt: 2 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Module Description"
            value={moduleData.description}
            onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 2 }}>Items</Typography>
          
          {moduleData.items.map((item, index) => (
            <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">
                  {item.type === 'link' ? 'Link' : 'Assignment'} #{index + 1}
                </Typography>
                <IconButton size="small" onClick={() => handleRemoveItem(item.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              <TextField
                fullWidth
                label="Title"
                value={item.title}
                onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              {item.type === 'link' && (
                <TextField
                  fullWidth
                  label="URL"
                  value={item.url || ''}
                  onChange={(e) => handleItemChange(item.id, 'url', e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}
              
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={item.description}
                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
              />
            </Box>
          ))}

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              startIcon={<LinkIcon />}
              variant="outlined"
              onClick={() => handleAddItem('link')}
            >
              Add Link
            </Button>
            <Button
              startIcon={<AssignmentIcon />}
              variant="outlined"
              onClick={() => handleAddItem('assignment')}
            >
              Add Assignment
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => onSave(moduleData)}
            disabled={!moduleData.title}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Development Notice */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid hsl(var(--border))', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Course Creation
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Both manual and AI-assisted course creation are currently in development. These features will allow you to create and organize course structures and content, with the option to use Claude's advanced AI capabilities to assist in the process.
        </Typography>
      </Paper>

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
          border: '1px solid hsl(var(--brand-primary) / 0.2)',
          borderRadius: '12px',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: '800px' }}>
          <Typography
            variant="h5"
            sx={{
              color: 'hsl(var(--brand-primary))',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Course Modules
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'hsl(var(--foreground))',
              lineHeight: 1.6,
            }}
          >
            Create and organize your course content into modules. You can choose between manual creation or let AI assist you in creating a customized curriculum. Add assignments, links, and other materials to build a comprehensive learning experience.
          </Typography>
        </Box>
      </Paper>

      {/* Main Content */}
      <Paper elevation={0} sx={{ p: 4, border: '1px solid hsl(var(--border))', borderRadius: 2 }}>
        {/* Claude API Test Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Claude API Test Panel
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={testClaudeAPI}
              disabled={isLoading}
              color="primary"
            >
              {isLoading ? 'Testing...' : 'Test Simple Response'}
            </Button>
            <Button
              variant="contained"
              onClick={testCourseGeneration}
              disabled={isLoading}
              color="secondary"
            >
              {isLoading ? 'Generating...' : 'Test Course Generation'}
            </Button>
          </Box>
          
          {testError && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
              <Typography color="error">Error: {testError}</Typography>
            </Paper>
          )}
          
          {testResponse && (
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', maxHeight: 400, overflow: 'auto' }}>
              <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {testResponse}
              </Typography>
            </Paper>
          )}
        </Box>

        {selectedCourseType === 'manual' ? (
          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {manualSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {activeStep === 0 && renderCourseStructure()}
            {activeStep === 1 && renderModuleCreation()}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={() => {
                  if (activeStep === 0) {
                    setSelectedCourseType(null);
                  } else {
                    handleBack();
                  }
                }}
                variant="outlined"
              >
                Back
              </Button>
              {activeStep < manualSteps.length - 1 && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          renderCourseTypeSelection()
        )}
      </Paper>

      {/* AI Dialog */}
      <Dialog open={showAIDialog} onClose={() => setShowAIDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Course Content (Mock)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This is a mock implementation. Enter any text below and click "Generate" to see a sample course structure.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="List your course materials and requirements"
            placeholder="e.g., Algebra 1 textbook, 3 articles on polynomials, weekly problem sets..."
            variant="outlined"
            value={courseInfo.materials}
            onChange={(e) => setCourseInfo({ ...courseInfo, materials: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAIGenerate}
            disabled={!courseInfo.materials}
          >
            Generate Mock Data
          </Button>
        </DialogActions>
      </Dialog>

      <ModuleDialog
        open={showModuleDialog}
        onClose={() => {
          setShowModuleDialog(false);
          setEditingModule(null);
        }}
        module={editingModule}
        onSave={handleSaveModule}
      />
    </Box>
  );
};

export default UserCourseModules; 