import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Box, Typography, AppBar, Tabs, Tab } from '@mui/material';
import {
  Work as CareerIcon,
  Business as InternshipIcon,
  Verified as VerifiedIcon,
  School as EducationIcon,
  Assessment as AssessmentIcon,
  Groups as NetworkIcon
} from '@mui/icons-material';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`careers-tabpanel-${index}`}
      aria-labelledby={`careers-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Careers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleNavigate = (path, tab) => {
    if (tab) {
      navigate(path, { 
        replace: true,
        state: { 
          from: 'careers',
          activeTab: tab 
        } 
      });
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      {/* Hero Section */}
      <Box sx={{ 
        pt: 8, 
        pb: 6, 
        background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h2" 
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Career Center
              </Typography>
              <Typography variant="h5" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: 800,
                  lineHeight: 1.6
                }}
              >
                Your one-stop platform for managing credentials, finding jobs, and advancing your career.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 'var(--shadow-md)',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" gutterBottom>Platform Stats</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', height: '100%' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">5K+</Typography>
                      <Typography variant="body2" color="text.secondary">Jobs</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.light', height: '100%' }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">10K+</Typography>
                      <Typography variant="body2" color="text.secondary">Credentialers</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.light', height: '100%' }}>
                      <Typography variant="h4" color="info.main" fontWeight="bold">500+</Typography>
                      <Typography variant="body2" color="text.secondary">Internships</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Navigation Tabs */}
      <Container maxWidth="xl">
        <AppBar position="static" color="transparent" elevation={0}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                minWidth: 120
              }
            }}
          >
            <Tab icon={<VerifiedIcon />} label="My Credentials" onClick={() => handleNavigate('/ledger', 'my-ledger')} />
            <Tab icon={<InternshipIcon />} label="Internships" onClick={() => handleNavigate('/internships')} />
            <Tab icon={<CareerIcon />} label="Find Jobs" onClick={() => handleNavigate('/ledger', 'jobs')} />
            <Tab icon={<EducationIcon />} label="Learn" onClick={() => handleNavigate('/ledger', 'explore')} />
            <Tab icon={<NetworkIcon />} label="Community" onClick={() => handleNavigate('/ledger', 'community')} />
            <Tab icon={<AssessmentIcon />} label="Career Exploration" onClick={() => handleNavigate('/career-exploration')} />
          </Tabs>
        </AppBar>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h5" gutterBottom>My Credentials</Typography>
          <Typography variant="body1">
            View and manage your verified achievements, certifications, and skills.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="h5" gutterBottom>Internships</Typography>
          <Typography variant="body1">
            Explore internship opportunities and gain valuable work experience.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" gutterBottom>Find Jobs</Typography>
          <Typography variant="body1">
            Browse jobs matching your skills and qualifications.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5" gutterBottom>Learn</Typography>
          <Typography variant="body1">
            Discover courses and training programs to enhance your skills.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Typography variant="h5" gutterBottom>Community</Typography>
          <Typography variant="body1">
            Connect with professionals and mentors in your field.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Typography variant="h5" gutterBottom>Career Exploration</Typography>
          <Typography variant="body1">
            Explore different career paths and take career assessments.
          </Typography>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Careers; 