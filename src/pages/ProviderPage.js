import React, { useState } from 'react'
import { Box, Container, Grid, Button, Typography, Snackbar, Alert } from '@mui/material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { SectionHeader } from '../components/ui/typography'
import { FiExternalLink } from 'react-icons/fi'
import { BiMap, BiPhone, BiEnvelope, BiGlobe } from 'react-icons/bi'
import { Share as ShareIcon } from '@mui/icons-material'
import SierraCollege from '../assets/College Logos/Sierra College.png'
import Polygence from '../assets/polygence.png'
import FoothillCollege from '../assets/College Logos/Foothill College.png'
import DeAnzaCollege from '../assets/College Logos/DeAnzaCollege.png'
import CCSF from '../assets/College Logos/CCSF.png'
import { useAuth } from '../utils/AuthContext'
import RegistrationPrompt from '../components/RegistrationPrompt'
import { cardStyles } from '../styles/theme/components/cards'

const PROVIDER_DATA = {
  'sierra-college': {
    name: 'Sierra College',
    logo: SierraCollege,
    description: 'Sierra College is a public community college serving Placer and Nevada Counties, offering comprehensive academic programs, career education, and lifelong learning opportunities.',
    type: 'Community College',
    location: 'Rocklin, California',
    website: 'https://www.sierracollege.edu',
    phone: '(916) 624-3333',
    email: 'admissions@sierracollege.edu',
    accreditation: ['Western Association of Schools and Colleges'],
    features: [
      'Over 125 degree programs',
      'Transfer agreements with UC and CSU systems',
      'Career and technical education programs',
      'State-of-the-art facilities',
      'Comprehensive student support services',
      'Athletic programs'
    ],
    stats: [
      { label: 'Founded', value: '1936' },
      { label: 'Student Population', value: '18,000+' },
      { label: 'Student-Faculty Ratio', value: '20:1' },
      { label: 'Average Class Size', value: '25' }
    ]
  },
  'polygence': {
    name: 'Polygence',
    logo: Polygence,
    description: 'Polygence is a research academy that connects high school students with PhD mentors for personalized research projects. Students can explore their academic interests, develop research skills, and create original work under expert guidance.',
    type: 'Research Academy',
    location: 'San Francisco, California',
    website: 'https://www.polygence.org',
    phone: '(650) 308-4189',
    email: 'support@polygence.org',
    accreditation: ['International Association for College Admission Counseling'],
    features: [
      '1-on-1 mentorship with PhD researchers',
      'Personalized research projects',
      'Flexible online format',
      'Publication opportunities',
      'College application support',
      'Access to academic conferences'
    ],
    stats: [
      { label: 'Founded', value: '2019' },
      { label: 'PhD Mentors', value: '2000+' },
      { label: 'Research Fields', value: '100+' },
      { label: 'Project Success Rate', value: '95%' }
    ]
  },
  'foothill-college': {
    name: 'Foothill College',
    logo: FoothillCollege,
    description: 'Foothill College is a public community college in Los Altos Hills, California, known for its innovative academic programs, beautiful campus, and strong transfer rates to four-year universities.',
    type: 'Community College',
    location: 'Los Altos Hills, California',
    website: 'https://www.foothill.edu',
    phone: '(650) 949-7777',
    email: 'outreach@foothill.edu',
    accreditation: ['Western Association of Schools and Colleges'],
    features: [
      'Over 80 associate degree programs',
      'More than 90 certificate programs',
      'Strong transfer rates to UC and CSU systems',
      'Award-winning STEM programs',
      'Comprehensive online learning options',
      'Beautiful 122-acre campus'
    ],
    stats: [
      { label: 'Founded', value: '1957' },
      { label: 'Student Population', value: '15,000+' },
      { label: 'Student-Faculty Ratio', value: '19:1' },
      { label: 'Transfer Rate', value: '85%' }
    ]
  },
  'deanza': {
    name: 'De Anza College',
    logo: DeAnzaCollege,
    description: 'De Anza College is a public community college in Cupertino, California, known for its high transfer rates, comprehensive academic programs, and commitment to student equity and success.',
    type: 'Community College',
    location: 'Cupertino, California',
    website: 'https://www.deanza.edu',
    phone: '(408) 864-5678',
    email: 'outreach@deanza.edu',
    accreditation: ['Western Association of Schools and Colleges'],
    features: [
      'Over 100 associate degree programs',
      'More than 80 certificate programs',
      'Top transfer rates to UC and CSU systems',
      'Nationally recognized sustainability initiatives',
      'Comprehensive student support services',
      'Diverse campus community'
    ],
    stats: [
      { label: 'Founded', value: '1967' },
      { label: 'Student Population', value: '20,000+' },
      { label: 'Student-Faculty Ratio', value: '21:1' },
      { label: 'Transfer Rate', value: '77%' }
    ]
  },
  'ccsf': {
    name: 'City College of San Francisco',
    logo: CCSF,
    description: 'City College of San Francisco (CCSF) is a public community college serving the San Francisco area, offering a wide range of academic and career programs to a diverse student population.',
    type: 'Community College',
    location: 'San Francisco, California',
    website: 'https://www.ccsf.edu',
    phone: '(415) 239-3000',
    email: 'info@ccsf.edu',
    accreditation: ['Western Association of Schools and Colleges'],
    features: [
      'Over 170 degree and certificate programs',
      'Strong transfer pathways to UC and CSU systems',
      'Career and technical education programs',
      'Free tuition for San Francisco residents',
      'Multiple campus locations throughout the city',
      'Diverse student support services'
    ],
    stats: [
      { label: 'Founded', value: '1935' },
      { label: 'Student Population', value: '60,000+' },
      { label: 'Student-Faculty Ratio', value: '22:1' },
      { label: 'Campus Locations', value: '10' }
    ]
  }
}

const ProviderPage = () => {
  const { providerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const provider = PROVIDER_DATA[providerId]
  const { user } = useAuth()
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleInteraction = (e) => {
    if (!user) {
      setShowRegistrationPrompt(true);
      return true;
    }
    return false;
  };

  const handleBackClick = (e) => {
    if (handleInteraction(e)) {
      return;
    }
    // If we have state with search params, use that to navigate back
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      // Default fallback to course search
      navigate('/course-search/results')
    }
  }

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setSnackbar({
      open: true,
      message: 'Provider link copied to clipboard!',
      severity: 'success'
    });
  };

  const handleWebsiteClick = (e) => {
    if (handleInteraction(e)) {
      return;
    }
    window.open(provider.website, '_blank');
  };

  const handleSearchByProvider = (e) => {
    if (handleInteraction(e)) {
      return;
    }
    navigate(`/course-search/results?provider=${providerId}`);
  };

  if (!provider) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography>Provider not found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero Section */}
      <Box sx={cardStyles.section}>
        <Container 
          maxWidth="var(--container-max-width)"
          sx={{ 
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--spacing-2)',
            '@media (max-width: 768px)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Button
              onClick={handleBackClick}
              sx={{
                color: 'hsl(var(--brand-primary))',
                p: 'var(--spacing-1) var(--spacing-2)',
                minWidth: 0,
                '&:hover': {
                  backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                },
              }}
            >
              ← Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{
                color: 'hsl(var(--brand-primary))',
                borderColor: 'hsl(var(--brand-primary))',
                '&:hover': {
                  borderColor: 'hsl(var(--brand-primary-dark))',
                  backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                },
              }}
            >
              Share
            </Button>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 'var(--spacing-6)',
            mb: 'var(--spacing-6)',
          }}>
            <Box 
              component="img"
              src={provider.logo}
              alt={`${provider.name} logo`}
              sx={{ 
                width: 120,
                height: 120,
                objectFit: 'contain',
                p: 'var(--spacing-4)',
                backgroundColor: 'hsl(var(--background))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--border))'
              }}
            />
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              transform: 'translateY(8px)',
              gap: 'var(--spacing-2)'
            }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  margin: 0,
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: 'hsl(var(--text-primary))'
                }}
              >
                {provider.name}
              </Typography>
              <Typography 
                sx={{ 
                  margin: 0,
                  fontSize: '1.25rem',
                  color: 'hsl(var(--text-secondary))',
                  lineHeight: 1.2
                }}
              >
                {provider.type}
              </Typography>
            </Box>
          </Box>

          {/* Quick Info Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                p: 'var(--spacing-4)',
                backgroundColor: 'hsla(var(--background), 0.8)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--border))',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-3)'
              }}>
                <BiMap size={24} />
                <Typography>{provider.location}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                onClick={handleWebsiteClick}
                sx={{ 
                  p: 'var(--spacing-4)',
                  backgroundColor: 'hsla(var(--background), 0.8)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid hsl(var(--border))',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)',
                  color: 'hsl(var(--text-primary))',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'hsl(var(--brand-primary))',
                    backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                  }
                }}
              >
                <BiGlobe size={24} />
                <Typography>Visit Website</Typography>
                <FiExternalLink size={16} style={{ marginLeft: 'auto' }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box 
                onClick={handleSearchByProvider}
                sx={{ 
                  p: 'var(--spacing-4)',
                  backgroundColor: 'hsla(var(--background), 0.8)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid hsl(var(--border))',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)',
                  color: 'hsl(var(--text-primary))',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'hsl(var(--brand-primary))',
                    backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                  }
                }}
              >
                <BiGlobe size={24} />
                <Typography>Search by this Provider</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="var(--container-max-width)"
        sx={{ 
          py: 'var(--spacing-8)',
          px: 'var(--container-padding-x)',
          '@media (max-width: 768px)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Grid container spacing={6}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* About Section */}
            <Box sx={{ mb: 'var(--spacing-8)' }}>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>About</SectionHeader>
              <Typography sx={{ 
                color: 'hsl(var(--text-primary))',
                lineHeight: 1.7
              }}>
                {provider.description}
              </Typography>
            </Box>

            {/* Features Section */}
            <Box sx={{ mb: 'var(--spacing-8)' }}>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>Features & Programs</SectionHeader>
              <Grid container spacing={3}>
                {provider.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{
                      p: 'var(--spacing-4)',
                      backgroundColor: 'hsl(var(--muted))',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid hsl(var(--border))',
                      height: '100%'
                    }}>
                      <Typography>{feature}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Accreditation Section */}
            <Box>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>Accreditation</SectionHeader>
              <Box sx={{
                p: 'var(--spacing-4)',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--border))'
              }}>
                {provider.accreditation.map((item, index) => (
                  <Typography key={index} sx={{ mb: index < provider.accreditation.length - 1 ? 2 : 0 }}>
                    • {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Contact Card */}
            <Box sx={{
              p: 'var(--spacing-6)',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))',
              position: 'sticky',
              top: 'var(--spacing-4)'
            }}>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>Contact Information</SectionHeader>
              
              <Box sx={{ mb: 'var(--spacing-4)' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-3)',
                  mb: 'var(--spacing-3)'
                }}>
                  <BiPhone size={20} />
                  <Typography>{provider.phone}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-3)',
                  mb: 'var(--spacing-3)'
                }}>
                  <BiEnvelope size={20} />
                  <Typography>{provider.email}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-3)'
                }}>
                  <BiMap size={20} />
                  <Typography>{provider.location}</Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={handleWebsiteClick}
                sx={{
                  width: '100%',
                  backgroundColor: 'hsl(var(--brand-primary))',
                  color: 'hsl(var(--background))',
                  textTransform: 'none',
                  py: 'var(--spacing-3)',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--brand-primary-dark))'
                  }
                }}
              >
                Visit Website
              </Button>
            </Box>

            {/* Stats Card */}
            <Box sx={{
              mt: 'var(--spacing-4)',
              p: 'var(--spacing-6)',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))'
            }}>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>Quick Facts</SectionHeader>
              <Grid container spacing={3}>
                {provider.stats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Box>
                      <Typography sx={{ 
                        color: 'hsl(var(--text-secondary))',
                        fontSize: '0.875rem',
                        mb: 1
                      }}>
                        {stat.label}
                      </Typography>
                      <Typography sx={{ 
                        color: 'hsl(var(--text-primary))',
                        fontWeight: 600,
                        fontSize: '1.125rem'
                      }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Add RegistrationPrompt and Snackbar */}
      <RegistrationPrompt 
        open={showRegistrationPrompt}
        onClose={() => setShowRegistrationPrompt(false)}
        targetPath={window.location.pathname}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ProviderPage 