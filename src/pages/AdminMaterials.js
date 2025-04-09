import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper } from '@mui/material';
import { AdminMaterialsService } from '../services/AdminMaterialsService';
import { toast } from 'react-toastify';
import { BsBuilding, BsFileText, BsBook, BsClipboard, BsEnvelope } from 'react-icons/bs';
import CommonAppLogo from '../assets/common-app.png';

const AdminMaterials = ({ onMaterialSelect, selectedMaterial }) => {
  const [progress, setProgress] = useState({
    schoolPhilosophy: 0,
    transcript: 0,
    courseDescription: 0,
    gradingRubric: 0,
    guidanceLetter: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const completionStatus = await AdminMaterialsService.getCompletionStatus();
        setProgress(completionStatus);
      } catch (error) {
        console.error('Error fetching progress:', error);
        toast.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const materials = [
    {
      title: 'School Profile Report',
      id: 'school-philosophy',
      progress: progress.schoolPhilosophy,
      description: 'Create a comprehensive school profile that includes your educational philosophy and approach.',
      icon: BsBuilding,
      color: '#3182CE'
    },
    {
      title: 'Transcript',
      id: 'transcript',
      progress: progress.transcript,
      description: 'Generate and manage your academic transcript with course details and grades.',
      icon: BsFileText,
      color: '#38A169'
    },
    {
      title: 'Course Descriptions',
      id: 'course-descriptions',
      progress: progress.courseDescription,
      description: 'Document detailed descriptions of your courses, including content and learning objectives.',
      icon: BsBook,
      color: '#805AD5'
    },
    {
      title: 'Grading Rubric',
      id: 'grading-rubric',
      progress: progress.gradingRubric,
      description: 'Define your grading system and evaluation criteria.',
      icon: BsClipboard,
      color: '#DD6B20'
    },
    {
      title: 'Guidance Counselor Letter',
      id: 'guidance-counselor-letter',
      progress: progress.guidanceLetter,
      description: 'Generate a guidance counselor letter for college applications.',
      icon: BsEnvelope,
      color: '#319795'
    }
  ];

  const styles = {
    iconContainer: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px'
    },
    icon: {
      fontSize: '16px'
    },
    title: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '6px',
      color: 'hsl(var(--text-primary))',
    },
    description: {
      fontSize: '14px',
      color: 'hsl(var(--text-secondary))',
      marginBottom: '12px',
      flex: 1,
      lineHeight: 1.4,
    },
    progressContainer: {
      width: '100%',
      backgroundColor: 'hsl(var(--neutral-100))',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: 'auto',
    },
    progressBar: (progress, color) => ({
      width: `${progress}%`,
      height: '8px',
      backgroundColor: color,
      transition: 'width 0.3s ease',
    }),
    progressText: {
      fontSize: '12px',
      color: 'hsl(var(--text-secondary))',
      marginTop: '4px',
      textAlign: 'right',
    },
  };

  const handleMaterialClick = (materialId) => {
    onMaterialSelect(materialId);
  };

  return (
    <Container 
      maxWidth="var(--container-max-width)"
      sx={{ 
        px: 'var(--container-padding-x)',
        py: 'var(--spacing-6)',
        '@media (--tablet)': {
          px: 'var(--container-padding-x-mobile)',
        },
      }}
    >
      {/* Explanatory Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'white',
          border: '1px solid hsl(var(--neutral-200))',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'hsl(var(--text-primary))',
            margin: 0,
          }}>
            Creating Your Administrative Materials
          </h2>
        </Box>

        <Box sx={{ color: 'hsl(var(--text-secondary))', fontSize: '15px', lineHeight: 1.5 }}>
          <p style={{ margin: 0, marginBottom: '12px' }}>
            In traditional schools, administrative staff would prepare and submit these five essential documents for college applications. 
            As a homeschool parent, you'll create these documents here, and we'll guide you through each one's specific requirements.
          </p>
          
          <Box sx={{ 
            backgroundColor: 'hsl(var(--brand-primary-light), 0.1)',
            p: 2,
            borderRadius: 'var(--radius-md)',
            my: 2
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2
            }}>
              <img 
                src={CommonAppLogo}
                alt="Common App Logo" 
                style={{ 
                  height: '45px', 
                  width: 'auto',
                  flexShrink: 0
                }}
              />
              <Box>
                <p style={{ 
                  color: 'hsl(var(--brand-primary))',
                  fontWeight: 500,
                  margin: '0 0 6px 0',
                  fontSize: '15px'
                }}>
                  Direct Common App Integration
                </p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Once completed, we'll automatically submit these documents to the Common App on your behalf, just as a traditional school would. 
                  While we recommend using Common App for college applications, you can also download these documents to submit through other application services.
                </p>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading progress...</div>
      ) : (
        <Grid container spacing={3}>
          {materials.map((material, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 'var(--radius-card)',
                  backgroundColor: 'white',
                  border: '1px solid hsl(var(--neutral-200))',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={() => handleMaterialClick(material.id)}
              >
                <div style={{...styles.iconContainer, backgroundColor: `${material.color}15`}}>
                  <material.icon style={{...styles.icon, color: material.color}} />
                </div>
                <h2 style={styles.title}>{material.title}</h2>
                <p style={styles.description}>{material.description}</p>
                <div style={styles.progressContainer}>
                  <div style={{...styles.progressBar(material.progress, material.color)}} />
                </div>
                <div style={styles.progressText}>{material.progress}% Complete</div>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminMaterials;

