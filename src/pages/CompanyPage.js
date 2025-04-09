import React, { useState } from 'react'
import { Box, Container, Grid, Button, Typography, Snackbar, Alert } from '@mui/material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { SectionHeader } from '../components/ui/typography'
import { BiMap, BiPhone, BiEnvelope, BiGlobe, BiTime } from 'react-icons/bi'
import { Share as ShareIcon } from '@mui/icons-material'
import { useAuth } from '../utils/AuthContext'
import RegistrationPrompt from '../components/RegistrationPrompt'
import yourEduLogo from '../assets/logo.png'
import { cardStyles } from '../styles/theme/components/cards'

const COMPANY_DATA = {
  'yawai': {
    name: 'YawAI',
    logo: yourEduLogo,
    description: `YawAI is at the forefront of artificial intelligence innovation, developing cutting-edge language models and AI applications that push the boundaries of what's possible. Our team of experts works on solving complex problems using state-of-the-art AI technology.`,
    type: 'Artificial Intelligence',
    location: 'San Francisco, California',
    website: 'https://www.yawai.com',
    phone: '(415) 555-0123',
    email: 'internships@yawai.com',
    role: 'AI Research Apprentice',
    duration: '6 months',
    features: [
      'Work directly with senior AI engineers',
      'Contribute to real-world AI projects',
      'Learn cutting-edge ML/AI technologies',
      'Develop language models and applications',
      'Participate in research discussions',
      'Gain hands-on experience with AI tools'
    ],
    requirements: [
      'Strong interest in artificial intelligence',
      'Basic programming knowledge',
      'Understanding of mathematics and statistics',
      'Excellent problem-solving skills',
      'Ability to work in a fast-paced environment'
    ],
    stats: [
      { label: 'Founded', value: '2021' },
      { label: 'Team Size', value: '50+' },
      { label: 'Projects Completed', value: '25+' },
      { label: 'Success Rate', value: '95%' }
    ]
  },
  'youredu': {
    name: 'YourEDU',
    logo: yourEduLogo,
    description: `YourEDU is revolutionizing education technology by creating innovative solutions for homeschoolers and educational institutions. Our platform combines cutting-edge technology with proven educational methodologies to deliver exceptional learning experiences.`,
    type: 'Education Technology',
    location: 'Boston, Massachusetts',
    website: 'https://www.youredu.com',
    phone: '(617) 555-0123',
    email: 'careers@youredu.com',
    role: 'EdTech Developer Intern',
    duration: '6 months',
    features: [
      'Full-stack development experience',
      'Work on live educational platform',
      'Learn modern web technologies',
      'Collaborate with experienced developers',
      'Impact thousands of students',
      'Agile development environment'
    ],
    requirements: [
      'Basic web development knowledge',
      'Interest in education technology',
      'Strong problem-solving skills',
      'Good communication abilities',
      'Passion for improving education'
    ],
    stats: [
      { label: 'Founded', value: '2020' },
      { label: 'Active Users', value: '10,000+' },
      { label: 'Team Size', value: '30+' },
      { label: 'Growth Rate', value: '200%/year' }
    ]
  },
  'techstart': {
    name: 'TechStart',
    logo: yourEduLogo,
    description: `TechStart is a dynamic technology company focused on nurturing the next generation of software developers. We provide hands-on experience with modern web technologies and real-world projects in a supportive learning environment.`,
    type: 'Technology',
    location: 'Austin, Texas',
    website: 'https://www.techstart.dev',
    phone: '(512) 555-0123',
    email: 'learn@techstart.dev',
    role: 'Junior Developer Apprentice',
    duration: '3 months',
    features: [
      'Hands-on coding experience',
      'Modern tech stack exposure',
      'Mentorship from senior developers',
      'Real project contributions',
      'Code review practice',
      'Agile methodology training'
    ],
    requirements: [
      'Basic programming knowledge',
      'Eagerness to learn',
      'Problem-solving mindset',
      'Team player attitude',
      'Good communication skills'
    ],
    stats: [
      { label: 'Founded', value: '2019' },
      { label: 'Graduates Placed', value: '100+' },
      { label: 'Partner Companies', value: '25+' },
      { label: 'Project Success Rate', value: '92%' }
    ]
  },
  'greenearth': {
    name: 'GreenEarth',
    logo: yourEduLogo,
    description: `GreenEarth is dedicated to developing sustainable solutions for environmental challenges. We combine innovative technology with environmental science to create a more sustainable future for our planet.`,
    type: 'Environmental',
    location: 'Portland, Oregon',
    website: 'https://www.greenearth.org',
    phone: '(503) 555-0123',
    email: 'sustainability@greenearth.org',
    role: 'Sustainability Coordinator',
    duration: '3 months',
    features: [
      'Environmental impact analysis',
      'Project management experience',
      'Sustainable solution development',
      'Stakeholder engagement',
      'Data analysis and reporting',
      'Green technology exposure'
    ],
    requirements: [
      'Interest in environmental science',
      'Basic project management skills',
      'Data analysis capabilities',
      'Strong communication skills',
      'Passion for sustainability'
    ],
    stats: [
      { label: 'Founded', value: '2018' },
      { label: 'Projects Completed', value: '50+' },
      { label: 'Carbon Offset', value: '1000+ tons' },
      { label: 'Partner Organizations', value: '30+' }
    ]
  },
  'fintech-solutions': {
    name: 'FinTech Solutions',
    logo: yourEduLogo,
    description: `FinTech Solutions is pioneering the future of financial technology through innovative blockchain solutions and advanced data analytics. We're transforming how people interact with financial services.`,
    type: 'Finance',
    location: 'New York, NY',
    website: 'https://www.fintechsolutions.io',
    phone: '(212) 555-0123',
    email: 'talent@fintechsolutions.io',
    role: 'Financial Analysis Intern',
    duration: '1 year',
    features: [
      'Blockchain technology exposure',
      'Financial data analysis',
      'Market research experience',
      'FinTech tool development',
      'Cryptocurrency insights',
      'Risk assessment training'
    ],
    requirements: [
      'Interest in financial technology',
      'Basic understanding of blockchain',
      'Strong analytical skills',
      'Detail-oriented mindset',
      'Knowledge of financial markets'
    ],
    stats: [
      { label: 'Founded', value: '2017' },
      { label: 'Transactions Processed', value: '$1B+' },
      { label: 'Active Users', value: '50,000+' },
      { label: 'Team Size', value: '75+' }
    ]
  }
};

const CompanyPage = ({ inLedger = false }) => {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const company = COMPANY_DATA[companyId]
  const { user } = useAuth()
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleInteraction = (e) => {
    if (!user) {
      e?.preventDefault?.();
      setShowRegistrationPrompt(true);
      return true;
    }
    return false;
  };

  const handleBack = () => {
    if (inLedger) {
      navigate('/ledger', { state: { activeTab: 'jobs' } });
    } else {
      navigate('/internships');
    }
  }

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setSnackbar({
      open: true,
      message: 'Company link copied to clipboard!',
      severity: 'success'
    });
  };

  const handleWebsiteClick = (e) => {
    if (handleInteraction(e)) {
      return;
    }
    window.open(company.website, '_blank');
  };

  const handleApplyClick = (e) => {
    if (handleInteraction(e)) {
      return;
    }
    navigate('/internships/apply');
  };

  if (!company) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography>Company not found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: inLedger ? 'auto' : '100vh',
      backgroundColor: 'hsl(var(--background))'
    }}>
      {/* Hero Section */}
      <Box sx={cardStyles.section}>
        <Container 
          maxWidth={inLedger ? false : "var(--container-max-width)"}
          sx={{ 
            position: 'relative',
            px: inLedger ? 0 : 'var(--container-padding-x)',
            py: 'var(--spacing-2)',
            '@media (max-width: 768px)': {
              px: inLedger ? 0 : 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Button
              onClick={handleBack}
              sx={{
                color: 'hsl(var(--brand-primary))',
                p: 'var(--spacing-1) var(--spacing-2)',
                minWidth: 0,
                '&:hover': {
                  backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                },
              }}
            >
              ← Back to Internships
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
            pt: 'var(--spacing-4)'
          }}>
            <Box 
              component="img"
              src={company.logo}
              alt={`${company.name} logo`}
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
                {company.name}
              </Typography>
              <Typography 
                sx={{ 
                  margin: 0,
                  fontSize: '1.25rem',
                  color: 'hsl(var(--text-secondary))',
                  lineHeight: 1.2
                }}
              >
                {company.type}
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
                <Typography>{company.location}</Typography>
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
              </Box>
            </Grid>
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
                <BiTime size={24} />
                <Typography>Duration: {company.duration}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth={inLedger ? false : "var(--container-max-width)"}
        sx={{ 
          py: inLedger ? 'var(--spacing-4)' : 'var(--spacing-8)',
          px: inLedger ? 0 : 'var(--container-padding-x)',
          '@media (max-width: 768px)': {
            px: inLedger ? 0 : 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Grid container spacing={6}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* About Section */}
            <Box sx={{ mb: 'var(--spacing-8)' }}>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>About {company.name}</SectionHeader>
              <Typography sx={{ 
                color: 'hsl(var(--text-primary))',
                lineHeight: 1.7
              }}>
                {company.description}
              </Typography>
            </Box>

            {/* Features Section */}
            <Box sx={{ mb: 'var(--spacing-8)' }}>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>What You'll Do</SectionHeader>
              <Grid container spacing={3}>
                {company.features.map((feature, index) => (
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

            {/* Requirements Section */}
            <Box>
              <SectionHeader sx={{ mb: 'var(--spacing-4)' }}>Requirements</SectionHeader>
              <Box sx={{
                p: 'var(--spacing-4)',
                backgroundColor: 'hsl(var(--muted))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--border))'
              }}>
                {company.requirements.map((item, index) => (
                  <Typography key={index} sx={{ mb: index < company.requirements.length - 1 ? 2 : 0 }}>
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
                  <Typography>{company.phone}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-3)',
                  mb: 'var(--spacing-3)'
                }}>
                  <BiEnvelope size={20} />
                  <Typography>{company.email}</Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={handleApplyClick}
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
                Apply Now
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
                {company.stats.map((stat, index) => (
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

export default CompanyPage 