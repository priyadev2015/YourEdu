import React, { useState } from 'react';
import { Box, Container, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { PageHeader, DescriptiveText } from '../components/ui/typography.jsx';

const Scholarship = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('deadline');

  const scholarships = [
    {
      title: 'Edvisors $2,500 Scholarship',
      description: 'Edvisors offers a monthly $2,500 scholarship to students aged 17 and older. No essay is required, making it an easy scholarship for college and graduate students.',
      offeredBy: 'Edvisors',
      amount: '$2,500',
      deadline: 'Aug 31, 2024',
      gradeLevel: 'HS Upperclassmen, College & Graduate Students'
    },
    {
      title: 'ScholarshipOwl $50,000 No Essay Scholarship',
      description: 'ScholarshipOwl offers multiple opportunities for students to win up to $50,000 in scholarships. Open to U.S.-based high school, college, and graduate students with no essay required.',
      offeredBy: 'ScholarshipOwl',
      amount: '$50,000',
      deadline: 'Sep 29, 2024',
      gradeLevel: 'High School through Graduate Students'
    }
  ];

  const styles = {
    noteContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-card)',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid hsl(var(--neutral-200))',
    },
    notesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    container: {
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-card)',
      padding: '24px',
      border: '1px solid hsl(var(--neutral-200))',
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '24px',
      color: 'hsl(var(--text-primary))',
    },
    searchContainer: {
      marginBottom: '24px',
    },
    searchInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid hsl(var(--neutral-200))',
      borderRadius: '8px',
      fontSize: '16px',
      marginBottom: '16px',
    },
    sortContainer: {
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    sortLabel: {
      fontSize: '14px',
      color: 'hsl(var(--text-secondary))',
    },
    sortSelect: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid hsl(var(--neutral-200))',
      fontSize: '14px',
    },
    scholarshipItem: {
      padding: '24px',
      borderRadius: 'var(--radius-card)',
      backgroundColor: 'white',
      border: '1px solid hsl(var(--neutral-200))',
      marginBottom: '16px',
      '&:last-child': {
        marginBottom: 0,
      },
    },
    scholarshipTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'hsl(var(--brand-primary))',
      marginBottom: '8px',
    },
    scholarshipDescription: {
      fontSize: '14px',
      color: 'hsl(var(--text-secondary))',
      marginBottom: '16px',
    },
    scholarshipDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      fontSize: '14px',
    },
    detailLabel: {
      fontWeight: 'bold',
      color: 'hsl(var(--text-primary))',
    },
    detailValue: {
      color: 'hsl(var(--text-secondary))',
    },
    saveButton: {
      backgroundColor: 'hsl(var(--brand-primary))',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      float: 'right',
      '&:hover': {
        backgroundColor: 'hsl(var(--brand-primary-dark))',
      },
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Back button section */}
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', py: 2 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/college')}
            sx={{ color: '#00356b' }}
          >
            BACK TO COLLEGE
          </Button>
        </Container>
      </Box>

      {/* Title section with gray background */}
      <Box sx={{ backgroundColor: '#f8fafc', py: 6, borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <PageHeader sx={{ color: '#1a202c', mb: 2 }}>
            Scholarship Directory
          </PageHeader>
          <DescriptiveText sx={{ color: '#4a5568', maxWidth: '65ch' }}>
            Discover and apply for scholarships to help fund your college education. Track deadlines and manage your scholarship applications in one place.
          </DescriptiveText>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <div style={styles.noteContainer}>
          <div style={styles.notesList}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#00356b'
            }}>Notes from YourEDU:</h3>
            
            <div style={{
              display: 'flex',
              marginBottom: '12px',
              paddingLeft: '20px'
            }}>
              <span style={{ minWidth: '35px', fontSize: '16px' }}>1️⃣</span>
              <span>These scholarships are not a direct part of our college application platform. We're going to begin working with independent scholarship organizations to ensure homeschooled students can qualify. In the interim, we're including a list of scholarships that homeschoolers have had previous success with. Feel free to share others via our feedback form and we'll get them added!</span>
            </div>
          </div>
        </div>

        <div style={styles.container}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={styles.container}>
                <Box sx={styles.searchContainer}>
                  <Box sx={styles.header}>32 Scholarships Currently in Directory</Box>
                  <Box sx={styles.sortContainer}>
                    <span>Sort by:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={styles.sortSelect}
                    >
                      <option value="deadline">Nearest Deadline</option>
                      <option value="amount">Amount</option>
                      <option value="name">Name</option>
                    </select>
                  </Box>
                  <input
                    type="text"
                    placeholder="Search for a scholarship"
                    style={styles.searchInput}
                  />
                </Box>

                {scholarships.map((scholarship, index) => (
                  <Box key={index} sx={styles.scholarshipItem}>
                    <Box sx={styles.scholarshipTitle}>
                      {scholarship.title}
                      <Button 
                        sx={styles.saveButton}
                        variant="contained"
                      >
                        Save
                      </Button>
                    </Box>
                    <Box sx={styles.scholarshipDescription}>
                      {scholarship.description}
                    </Box>
                    <Box sx={styles.scholarshipDetails}>
                      <Box>
                        <Box sx={styles.detailLabel}>Offered by:</Box>
                        <Box sx={styles.detailValue}>{scholarship.offeredBy}</Box>
                      </Box>
                      <Box>
                        <Box sx={styles.detailLabel}>Amount:</Box>
                        <Box sx={styles.detailValue}>{scholarship.amount}</Box>
                      </Box>
                      <Box>
                        <Box sx={styles.detailLabel}>Deadline:</Box>
                        <Box sx={styles.detailValue}>{scholarship.deadline}</Box>
                      </Box>
                      <Box>
                        <Box sx={styles.detailLabel}>Grade Level:</Box>
                        <Box sx={styles.detailValue}>{scholarship.gradeLevel}</Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={styles.container}>
                <Box sx={styles.header}>My Scholarships</Box>
                <Box sx={styles.scholarshipDescription}>
                  None saved
                </Box>
              </Box>
            </Grid>
          </Grid>
        </div>
      </Container>
    </Box>
  );
};

export default Scholarship; 