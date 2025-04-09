import React from 'react';
import { 
  Box, 
  Container,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import { SectionHeader, FeatureHeader, DescriptiveText, BodyText, SupportingText } from '../components/ui/typography';
import { BsPencilSquare, BsLink45Deg, BsPeople, BsBriefcase } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { cardStyles } from '../styles/theme/components/cards';

const CareerExploration = ({ inLedger = false }) => {
  const assessments = [
    {
      title: '16 Personalities Test',
      description: 'Based on the Myers-Briggs Type Indicator (MBTI)',
      duration: '12 minutes',
      features: [
        'Personality type analysis',
        'Career path recommendations',
        'Work style insights',
        'Team dynamics assessment'
      ],
      url: 'https://www.16personalities.com/free-personality-test'
    },
    {
      title: 'Princeton Review Career Quiz',
      description: 'Match interests with potential careers',
      duration: '5 minutes',
      features: [
        'Interest-based matching',
        'Career field suggestions',
        'Work environment preferences',
        'Skill alignment analysis'
      ],
      url: 'https://www.princetonreview.com/quiz/career-quiz'
    },
    {
      title: 'O*NET Interest Profiler',
      description: 'U.S. Department of Labor career exploration tool',
      duration: '15 minutes',
      features: [
        'Detailed job matches',
        'Salary information',
        'Required education levels',
        'Job outlook data'
      ],
      url: 'https://www.mynextmove.org/explore/ip'
    }
  ];

  const careerFields = [
    {
      title: 'Technology',
      description: 'Explore careers in software, cybersecurity, and IT',
      roles: [
        'Software Developer',
        'Data Scientist',
        'UX Designer',
        'IT Project Manager'
      ]
    },
    {
      title: 'Healthcare',
      description: 'Discover opportunities in medical and health services',
      roles: [
        'Physician',
        'Nurse Practitioner',
        'Healthcare Administrator',
        'Physical Therapist'
      ]
    },
    {
      title: 'Business',
      description: 'Learn about careers in business and finance',
      roles: [
        'Financial Analyst',
        'Marketing Manager',
        'Business Consultant',
        'Entrepreneur'
      ]
    },
    {
      title: 'Creative Arts',
      description: 'Explore careers in design, media, and entertainment',
      roles: [
        'Graphic Designer',
        'Content Creator',
        'Film Producer',
        'Art Director'
      ]
    }
  ];

  const resources = [
    {
      name: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning',
      description: 'Professional development courses and career skills',
      features: [
        'Video Courses',
        'Industry Certificates',
        'Expert Instructors',
        'Skill Assessments'
      ]
    },
    {
      name: 'Coursera',
      url: 'https://www.coursera.org',
      description: 'Online courses from top universities and companies',
      features: [
        'University Courses',
        'Professional Certificates',
        'Guided Projects',
        'Career Tracks'
      ]
    },
    {
      name: 'Indeed Career Guide',
      url: 'https://www.indeed.com/career-advice',
      description: 'Comprehensive career advice and job search resources',
      features: [
        'Resume Tips',
        'Interview Guides',
        'Career Path Insights',
        'Industry Trends'
      ]
    }
  ];

  const experientialLearning = [
    {
      title: 'Job Shadowing',
      description: 'Learn directly from professionals in your field of interest',
      steps: [
        'Research companies in your area',
        'Connect with professionals on LinkedIn',
        'Request shadowing opportunities',
        'Prepare questions and observe'
      ]
    },
    {
      title: 'Informational Interviews',
      description: 'Gain insights through conversations with industry experts',
      steps: [
        'Identify potential contacts',
        'Prepare thoughtful questions',
        'Schedule brief meetings',
        'Follow up and maintain connections'
      ]
    },
    {
      title: 'Virtual Career Fairs',
      description: 'Connect with employers and learn about opportunities',
      steps: [
        'Register for upcoming events',
        'Research participating companies',
        'Prepare your elevator pitch',
        'Follow up with contacts'
      ]
    }
  ];

  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero Section */}
      <Box sx={cardStyles.section}>
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
          <Box>
            <DescriptiveText sx={{ maxWidth: 'var(--text-max-width)' }}>
              Discover potential career paths, assess your interests and skills, and learn about different 
              industries through our comprehensive career exploration resources.
            </DescriptiveText>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="var(--container-max-width)"
        sx={{ 
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-6)',
          '@media (max-width: 768px)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {/* Career Assessments Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <BsPencilSquare size={24} style={{ color: 'hsl(var(--brand-primary))' }} />
            <SectionHeader>Career Assessments</SectionHeader>
          </Box>
          <Grid container spacing={3}>
            {assessments.map((assessment, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <FeatureHeader sx={{ mb: 1 }}>{assessment.title}</FeatureHeader>
                  <SupportingText sx={{ mb: 2 }}>Duration: {assessment.duration}</SupportingText>
                  <BodyText sx={{ mb: 3 }}>{assessment.description}</BodyText>
                  
                  <Box 
                    sx={{ 
                      backgroundColor: 'hsl(var(--muted))',
                      borderRadius: 'var(--radius-sm)',
                      p: 2,
                      mb: 3,
                      flexGrow: 1,
                    }}
                  >
                    {assessment.features.map((feature, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--muted-foreground))',
                          }} 
                        />
                        <SupportingText>{feature}</SupportingText>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    href={assessment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: 'hsl(var(--brand-primary))',
                      color: 'hsl(var(--brand-primary-foreground))',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--brand-primary-dark))',
                      },
                    }}
                  >
                    Take Assessment
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Career Fields Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <BsBriefcase size={24} style={{ color: 'hsl(var(--brand-primary))' }} />
            <SectionHeader>Popular Career Fields</SectionHeader>
          </Box>
          <Grid container spacing={3}>
            {careerFields.map((field, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <FeatureHeader sx={{ mb: 1 }}>{field.title}</FeatureHeader>
                  <BodyText sx={{ mb: 3 }}>{field.description}</BodyText>
                  
                  <Box 
                    sx={{ 
                      backgroundColor: 'hsl(var(--muted))',
                      borderRadius: 'var(--radius-sm)',
                      p: 2,
                      flexGrow: 1,
                    }}
                  >
                    {field.roles.map((role, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--muted-foreground))',
                          }} 
                        />
                        <SupportingText>{role}</SupportingText>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Experiential Learning Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <BsPeople size={24} style={{ color: 'hsl(var(--brand-primary))' }} />
            <SectionHeader>Experiential Learning</SectionHeader>
          </Box>
          <Grid container spacing={3}>
            {experientialLearning.map((exp, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <FeatureHeader sx={{ mb: 1 }}>{exp.title}</FeatureHeader>
                  <BodyText sx={{ mb: 3 }}>{exp.description}</BodyText>
                  
                  <Box 
                    sx={{ 
                      backgroundColor: 'hsl(var(--muted))',
                      borderRadius: 'var(--radius-sm)',
                      p: 2,
                      flexGrow: 1,
                    }}
                  >
                    {exp.steps.map((step, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--muted-foreground))',
                          }} 
                        />
                        <SupportingText>{step}</SupportingText>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Learning Resources Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <BsLink45Deg size={24} style={{ color: 'hsl(var(--brand-primary))' }} />
            <SectionHeader>Learning Resources</SectionHeader>
          </Box>
          <Grid container spacing={3}>
            {resources.map((resource, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Button
                    variant="text"
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'hsl(var(--brand-primary))',
                      justifyContent: 'flex-start',
                      p: 0,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    <FeatureHeader>{resource.name}</FeatureHeader>
                  </Button>
                  <BodyText sx={{ mb: 3 }}>{resource.description}</BodyText>
                  
                  <Box 
                    sx={{ 
                      backgroundColor: 'hsl(var(--muted))',
                      borderRadius: 'var(--radius-sm)',
                      p: 2,
                      flexGrow: 1,
                    }}
                  >
                    {resource.features.map((feature, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            backgroundColor: 'hsl(var(--muted-foreground))',
                          }} 
                        />
                        <SupportingText>{feature}</SupportingText>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default CareerExploration;
