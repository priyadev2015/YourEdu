import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Paper,
  Button,
  Chip,
  Typography,
} from '@mui/material'
import { PageHeader, SectionHeader, FeatureHeader, DescriptiveText, BodyText, SupportingText } from '../components/ui/typography'
import yourEduLogo from '../assets/logo.png'
import { BiTime } from 'react-icons/bi'

const Internships = ({ inLedger = false }) => {
  const navigate = useNavigate()
  const [savedInternships, setSavedInternships] = useState([])

  const internships = [
    {
      id: 1,
      companyId: 'yawai',
      company: "YawAI",
      logo: yourEduLogo,
      sector: "Artificial Intelligence",
      description: "Join our AI team to help develop cutting-edge language models and AI applications. Work directly with senior engineers on real-world AI projects.",
      role: "AI Research Apprentice",
      duration: "6 months",
    },
    {
      id: 2,
      companyId: 'youredu',
      company: "YourEDU",
      logo: yourEduLogo,
      sector: "Education Technology",
      description: "Help shape the future of education by working on our platform. Learn full-stack development and educational technology implementation.",
      role: "EdTech Developer Intern",
      duration: "6 months",
    },
    {
      id: 3,
      companyId: 'techstart',
      company: "TechStart",
      logo: yourEduLogo,
      sector: "Technology",
      description: "Join our dynamic tech team and learn software development hands-on with modern web technologies.",
      role: "Junior Developer Apprentice",
      duration: "3 months",
    },
    {
      id: 4,
      companyId: 'greenearth',
      company: "GreenEarth",
      logo: yourEduLogo,
      sector: "Environmental",
      description: "Help develop sustainable solutions while learning project management and environmental impact analysis.",
      role: "Sustainability Coordinator",
      duration: "3 months",
    },
    {
      id: 5,
      companyId: 'fintech-solutions',
      company: "FinTech Solutions",
      logo: yourEduLogo,
      sector: "Finance",
      description: "Learn financial technology and data analysis in a fast-paced environment while working with blockchain technology.",
      role: "Financial Analysis Intern",
      duration: "1 year",
    },
  ];

  const handleSave = (internship) => {
    if (!savedInternships.find(saved => saved.id === internship.id)) {
      setSavedInternships([...savedInternships, internship])
    }
  }

  const handleRemove = (internshipId) => {
    setSavedInternships(savedInternships.filter(internship => internship.id !== internshipId))
  }

  const handleNavigate = (path) => {
    if (inLedger) {
      navigate(`/ledger${path}`);
    } else {
      navigate(`/internships${path}`);
    }
  };

  return (
    <Box sx={{ 
      minHeight: inLedger ? 'auto' : '100vh', 
      backgroundColor: 'hsl(var(--background))'
    }}>
      {!inLedger && (
        <Box sx={{ 
          pt: 8, 
          pb: 6, 
          background: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Container 
            maxWidth="var(--container-max-width)"
            sx={{ 
              position: 'relative',
              px: 'var(--container-padding-x)',
              py: 'var(--container-padding-y)',
              '@media (max-width: 768px)': {
                px: 'var(--container-padding-x-mobile)',
              },
            }}
          >
            <Button
              onClick={() => navigate('/careers')}
              sx={{
                color: 'hsl(var(--brand-primary))',
                p: 'var(--spacing-1) var(--spacing-2)',
                minWidth: 0,
                mb: 'var(--spacing-4)',
                '&:hover': {
                  backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                },
              }}
            >
              ← Back
            </Button>
            <Box>
              <PageHeader 
                sx={{ 
                  mb: 'var(--spacing-2)',
                }}
              >
                YourEDU Internships
              </PageHeader>
              <DescriptiveText sx={{ maxWidth: 'var(--text-max-width)' }}>
                Discover unique apprenticeship opportunities with leading companies. Gain valuable experience,
                receive mentorship, and earn high school credit through our diverse internship programs.
              </DescriptiveText>
            </Box>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Container 
        maxWidth={inLedger ? false : "var(--container-max-width)"}
        sx={{ 
          py: inLedger ? 0 : 'var(--spacing-6)',
          px: inLedger ? 0 : 'var(--container-padding-x)',
          '@media (max-width: 768px)': {
            px: inLedger ? 0 : 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {/* Description Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <BodyText>
            Welcome to YourEDU's Internship Program! We offer unique apprenticeship opportunities 
            with leading companies where homeschoolers and high school students can gain valuable 
            experience, receive mentorship, and earn high school credit. Our positions span from 
            technical to business roles, providing diverse learning experiences.
          </BodyText>
        </Paper>

        {/* Saved Internships Section */}
        {savedInternships.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <SectionHeader sx={{ mb: 3 }}>Saved for Later</SectionHeader>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {savedInternships.map(internship => (
                <Paper
                  key={internship.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    minWidth: 300,
                    backgroundColor: 'hsl(var(--muted))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={internship.logo}
                    alt={internship.company}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'contain',
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <FeatureHeader>{internship.company}</FeatureHeader>
                    <SupportingText>{internship.role}</SupportingText>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemove(internship.id)}
                    sx={{
                      borderColor: 'hsl(var(--destructive))',
                      color: 'hsl(var(--destructive))',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--destructive) / 0.1)',
                        borderColor: 'hsl(var(--destructive))',
                      },
                    }}
                  >
                    Remove
                  </Button>
                </Paper>
              ))}
            </Box>
          </Paper>
        )}

        {/* Internships Grid */}
        <Grid container spacing={3}>
          {internships.map(internship => (
            <Grid item xs={12} md={6} lg={4} key={internship.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)',
                    borderColor: 'hsl(var(--brand-primary))',
                  },
                }}
                onClick={() => handleNavigate(`/company/${internship.companyId}`)}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 3,
                  mb: 3,
                  pb: 3,
                  borderBottom: '1px solid hsl(var(--border))'
                }}>
                  <Box
                    component="img"
                    src={internship.logo}
                    alt={internship.company}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'contain',
                      p: 1.5,
                      backgroundColor: 'hsl(var(--muted))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <FeatureHeader sx={{ 
                      mb: 1,
                      fontSize: '1.25rem',
                      color: 'hsl(var(--brand-primary))'
                    }}>
                      {internship.company}
                    </FeatureHeader>
                    <Chip
                      label={internship.sector}
                      size="small"
                      sx={{
                        backgroundColor: 'hsl(var(--brand-primary-light))',
                        color: 'hsl(var(--brand-primary))',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ 
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    mb: 2,
                    color: 'hsl(var(--text-primary))'
                  }}>
                    {internship.role}
                  </Typography>
                  
                  <Typography sx={{ 
                    mb: 3,
                    color: 'hsl(var(--text-secondary))',
                    lineHeight: 1.6
                  }}>
                    {internship.description}
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  pt: 3,
                  mt: 'auto',
                  borderTop: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--text-secondary))'
                }}>
                  <BiTime size={20} />
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    Duration: {internship.duration}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default Internships 