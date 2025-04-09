import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import DescriptiveText from '../components/DescriptiveText';
import { cardStyles } from '../styles/theme/components/cards';

const Pricing = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    navigate('/login', { state: { selectedPlan: plan } });
  };

  const PricingCard = ({ title, price, features, popular, buttonText }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: popular ? '2px solid #00356b' : '1px solid #e2e8f0',
        borderRadius: '12px',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        ...(popular && {
          transform: 'scale(1.02)',
        }),
      }}
    >
      {popular && (
        <Chip
          label="Most Popular"
          color="primary"
          sx={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#00356b',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      )}
      <Typography variant="h5" component="h2" sx={{ mb: 1.5, fontWeight: 600, color: '#1a365d', fontSize: '1.25rem' }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
        <Typography variant="h3" component="span" sx={{ fontWeight: 700, color: '#00356b', fontSize: '2rem' }}>
          ${price}
        </Typography>
        <Typography variant="subtitle1" component="span" sx={{ ml: 1, color: '#718096', fontSize: '0.875rem' }}>
          /month
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        {features.map((feature, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckIcon sx={{ mr: 1, color: '#00356b', fontSize: '1rem' }} />
            <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.875rem' }}>
              {feature}
            </Typography>
          </Box>
        ))}
      </Box>
      <Button
        variant={popular ? "contained" : "outlined"}
        fullWidth
        onClick={() => handleSelectPlan(title.toLowerCase())}
        sx={{
          mt: 2,
          py: 1,
          backgroundColor: popular ? '#00356b' : 'transparent',
          borderColor: '#00356b',
          color: popular ? 'white' : '#00356b',
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: popular ? '#002548' : 'rgba(0, 53, 107, 0.08)',
            borderColor: '#002548',
          },
        }}
      >
        {buttonText}
      </Button>
    </Paper>
  );

  const plans = [
    {
      title: 'Basic',
      price: '30',
      features: [
        'Full Platform Access',
        'Academic Dashboard',
        'Course Planning Tools',
        'Basic Progress Tracking',
        'Community Q&A Access',
        'Group Participation',
        'Event Registration',
        'Basic Resource Library',
      ],
      buttonText: 'Get Started',
    },
    {
      title: 'Premium',
      price: '80',
      features: [
        'Everything in Basic',
        'AI Guidance Counselor',
        'Advanced Analytics Dashboard',
        'Priority Community Support',
        'College Application Tools',
        'Personalized Learning Path',
        'Advanced Event Features',
        'Premium Resource Access',
        'Custom Study Plans',
      ],
      popular: true,
      buttonText: 'Select Premium',
    },
    {
      title: 'Enterprise',
      price: '2,000',
      features: [
        'Everything in Premium',
        'Dedicated Human Counselor',
        'Weekly 1-on-1 Sessions',
        'Custom Curriculum Design',
        'College Application Review',
        '24/7 Priority Support',
        'Family Account Management',
        'Exclusive Events Access',
        'Personalized College Roadmap',
      ],
      buttonText: 'Contact Sales',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-6)' }}>
        <Container 
          maxWidth="var(--container-max-width)"
          sx={{ 
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--container-padding-y)',
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <PageHeader 
            sx={{ 
              mb: 'var(--spacing-2)',
            }}
          >
            Pricing Plans
          </PageHeader>
          <DescriptiveText sx={{ maxWidth: 'var(--text-max-width)' }}>
            Choose the perfect plan for your homeschooling needs. Flexible options designed to support your educational journey.
          </DescriptiveText>
        </Container>
      </Box>

      {/* Main Content */}
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
        <Grid container spacing={3} alignItems="stretch">
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.title}>
              <PricingCard {...plan} />
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            mt: 4,
            p: 2,
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <StarIcon sx={{ color: '#00356b', fontSize: '1.25rem' }} />
          <Typography variant="body1" sx={{ color: '#4a5568', fontSize: '0.875rem' }}>
            30-day money-back guarantee. Cancel anytime.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing; 