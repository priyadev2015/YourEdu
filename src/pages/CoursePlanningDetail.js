import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const CoursePlanningDetail = () => {
  // Get the course name from localStorage
  const courseName = localStorage.getItem('currentCourseName') || 'Course';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'hsl(var(--background))',
        pt: 4
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid hsl(var(--border))',
          mb: 3,
        }}
      >
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: 'var(--container-padding-x)',
            py: 3,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Typography
            sx={{
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2.1,
            }}
          >
            Plan and visualize your course structure and learning objectives
          </Typography>
        </Container>
      </Box>
      
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'hsl(var(--foreground))',
              fontWeight: 500,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              lineHeight: 1.4
            }}
          >
            Detailed course description for <br/>
            <span style={{ fontWeight: 600, color: 'hsl(var(--brand-primary))' }}>
              {courseName}
            </span>
            <br/> is coming soon!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CoursePlanningDetail; 