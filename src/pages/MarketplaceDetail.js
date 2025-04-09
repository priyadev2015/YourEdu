import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SectionHeader } from '../components/ui/typography';
import { FiExternalLink } from 'react-icons/fi';
import { BiMap, BiGlobe } from 'react-icons/bi';
import thriftbooksLogo from '../assets/Perk Logos/thriftbooks.png';
import { cardStyles } from '../styles/theme/components/cards';

const MarketplaceDetail = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock provider data - replace with actual data fetching
  const providerDetails = {
    1: {
      name: "Math-U-See",
      logo: "https://placeholder.com/300",
      description: "Math-U-See is a complete K-12 math curriculum focused on mastery learning through hands-on manipulatives and systematic instruction.",
      longDescription: "Math-U-See is a complete K-12 math curriculum focused on mastery learning through hands-on manipulatives and systematic instruction. The program uses multi-sensory teaching to help students understand, master, and love math.",
      discount: "15% off all curriculum packages",
      website: "https://mathusee.com",
      location: "161 Discovery Dr, Greencastle, PA 17225",
      howToRedeem: "Use your YourEDU member ID (found in your account settings) as the discount code during checkout on the Math-U-See website.",
      features: [
        "Video instruction for every lesson",
        "Manipulative-based learning",
        "Mastery approach",
        "Teacher guides included",
        "Online support resources"
      ]
    },
    2: {
      name: "Discovery Education",
      logo: "https://placeholder.com/300",
      description: "Digital learning platform with interactive science resources and curriculum materials.",
      longDescription: "Discovery Education transforms classrooms and inspires teachers with engaging interactive science content and services that measure and improve student achievement.",
      discount: "20% off annual subscriptions",
      website: "https://www.discoveryeducation.com",
      location: "4350 Congress Street, Suite 700, Charlotte, NC 28209",
      howToRedeem: "Visit the Discovery Education portal through your YourEDU dashboard and use your membership credentials to access the discounted rate.",
      features: [
        "Interactive digital textbooks",
        "Virtual field trips",
        "STEM resources",
        "Professional development",
        "Assessment tools"
      ]
    },
    3: {
      name: "Apple Store",
      logo: "https://placeholder.com/300",
      description: "Special education pricing on Apple products for students and educators.",
      longDescription: "Apple offers special education pricing on Mac computers, iPads, AppleCare+, and select accessories to current and newly accepted college students and their parents.",
      discount: "Up to $200 off + free AirPods",
      website: "https://www.apple.com/education",
      location: "Available online and at Apple retail stores",
      howToRedeem: "Access the Apple Education Store through your YourEDU account to automatically apply discounts to your purchase.",
      features: [
        "Education pricing on Mac and iPad",
        "Free AirPods with eligible purchases",
        "AppleCare+ discount",
        "Special financing options",
        "Free delivery or pickup"
      ]
    },
    4: {
      name: "Microsoft Office",
      logo: "https://placeholder.com/300",
      description: "Microsoft 365 Education suite with essential productivity tools.",
      longDescription: "Get access to Microsoft 365 apps including Word, Excel, PowerPoint, OneNote, and Microsoft Teams, plus additional classroom tools.",
      discount: "Free access to Microsoft 365",
      website: "https://www.microsoft.com/education",
      location: "Available online worldwide",
      howToRedeem: "Sign up using your YourEDU-verified email address on the Microsoft Education portal.",
      features: [
        "Full Office suite access",
        "1TB OneDrive storage",
        "Microsoft Teams",
        "Classroom tools",
        "Cross-platform compatibility"
      ]
    },
    5: {
      name: "Barnes & Noble",
      logo: "https://placeholder.com/300",
      description: "Leading retailer of books and educational materials with special student discounts.",
      longDescription: "Barnes & Noble offers a wide selection of textbooks, study guides, and educational materials with special pricing for students.",
      discount: "15% off for students",
      website: "https://www.barnesandnoble.com",
      location: "Available online and at retail locations nationwide",
      howToRedeem: "Show your YourEDU digital ID in-store or use code YOUREDU15 online at checkout.",
      features: [
        "New and used textbooks",
        "Study aids and test prep",
        "Educational toys and games",
        "Teacher resources",
        "Free shipping on eligible orders"
      ]
    },
    6: {
      name: "Staples",
      logo: "https://placeholder.com/300",
      description: "Office and school supplies retailer with student discounts.",
      longDescription: "Staples offers a wide range of school and office supplies with special pricing for students and teachers.",
      discount: "20% off school supplies",
      website: "https://www.staples.com",
      location: "Available online and at retail locations nationwide",
      howToRedeem: "Present your YourEDU membership card in-store or use promo code YOUREDU20 online.",
      features: [
        "School supply lists",
        "Bulk ordering available",
        "Print & copy services",
        "Tech support services",
        "Same-day delivery options"
      ]
    },
    7: {
      name: "Adobe Creative Cloud",
      logo: "https://placeholder.com/300",
      description: "Industry-standard creative software suite for students.",
      longDescription: "Get access to Adobe's complete collection of creative desktop and mobile apps for photography, design, video, and web.",
      discount: "60% off Creative Cloud",
      website: "https://www.adobe.com/creativecloud/buy/students.html",
      location: "Available online worldwide",
      howToRedeem: "Verify your student status through YourEDU to access the discounted Creative Cloud plan.",
      features: [
        "All Creative Cloud apps",
        "100GB cloud storage",
        "Adobe Portfolio",
        "Adobe Fonts",
        "Latest software updates"
      ]
    },
    8: {
      name: "Spotify Premium",
      logo: "https://placeholder.com/300",
      description: "Premium music streaming service with student discount.",
      longDescription: "Spotify Premium Student gives you access to millions of songs ad-free, plus Hulu and SHOWTIME.",
      discount: "50% off Premium subscription",
      website: "https://www.spotify.com/student",
      location: "Available online worldwide",
      howToRedeem: "Verify your student status through YourEDU to activate the student discount.",
      features: [
        "Ad-free music streaming",
        "Offline listening",
        "Hulu (ad-supported) included",
        "SHOWTIME included",
        "High-quality audio"
      ]
    },
    9: {
      name: "ThriftBooks",
      logo: thriftbooksLogo,
      description: "The world's largest online independent used book seller with special educator discounts.",
      longDescription: "Thriftbooks is the world's largest online independent user book seller, providing used and new books accurately graded. Their ReadingRewards loyalty program rewards their customers with free books awarded for their points earned.\n\nThriftbooks offers educator discounts under their ReadingRewards program, and we could not be more excited that these benefits now extend to YourEDU parents and teachers!",
      discount: "Get a free used book (valued at $7 or less) every time you buy four or more books! And because you're a verified teacher via your YourEDU Teacher ID, in your first year you'll be promoted to their Literati status, helping you receive even more points per purchase!",
      website: "https://www.thriftbooks.com",
      location: "Available online with multiple distribution centers",
      howToRedeem: "1. Log into or sign up for a Thrift books account on this page to begin the educator verification process.\n\n2. Fill in your information, and include \"Homeschool Teacher\" in the \"School Name\" field.\n\n3. Within a few minutes of submitting the above form, you will receive an email from SheerID to verify your educator status.\n\n4. SheerID will accept your YourEDU Teacher ID as proof of your educator status for verification.\n\n5. Shortly thereafter SheerID will email confirmation of verification, and you will then be able to begin shopping on Thriftbooks with your discount automatically applied to your account!",
      features: [
        "13 million+ book selection",
        "Free shipping on orders over $15",
        "ReadingRewards program",
        "Quality guaranteed",
        "Rare and collectible books"
      ]
    }
  };

  const handleBackClick = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/marketplace');
    }
  };

  const provider = providerDetails[providerId];

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
    );
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
            '@media (max-width: 768px)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 'var(--spacing-4)',
            mb: 'var(--spacing-4)',
            pt: 'var(--spacing-2)'
          }}>
            <Box 
              component="img"
              src={provider.logo}
              alt={`${provider.name} logo`}
              sx={{ 
                width: 100,
                height: 100,
                objectFit: 'contain',
                p: 'var(--spacing-3)',
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
                {provider.description}
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
            <Grid item xs={12} md={8}>
              <Link 
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none' }}
              >
                <Box sx={{ 
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
                  '&:hover': {
                    borderColor: 'hsl(var(--brand-primary))',
                    backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                  }
                }}>
                  <BiGlobe size={24} />
                  <Typography>Visit Website</Typography>
                  <FiExternalLink size={16} style={{ marginLeft: 'auto' }} />
                </Box>
              </Link>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="var(--container-max-width)"
        sx={{ 
          py: 'var(--spacing-4)',
          px: 'var(--container-padding-x)',
          '@media (max-width: 768px)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Grid container spacing={3}>
          {/* Left Column - About */}
          <Grid item xs={12} md={8}>
            {/* About Section */}
            <Box 
              sx={{ 
                mb: 'var(--spacing-4)',
                backgroundColor: 'hsl(var(--background))',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--border))',
                p: 'var(--spacing-4)',
                height: '100%'
              }}
            >
              <SectionHeader 
                sx={{ 
                  mb: 'var(--spacing-2)',
                  color: 'hsl(var(--text-primary))',
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                About
              </SectionHeader>
              <Typography 
                sx={{ 
                  color: 'hsl(var(--text-primary))',
                  lineHeight: 1.6,
                  fontSize: '1.1rem',
                  '& p': {
                    mb: 'var(--spacing-2)',
                    '&:last-child': {
                      mb: 0
                    }
                  }
                }}
              >
                {provider.longDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </Typography>
            </Box>
          </Grid>

          {/* Right Column - Special Offer */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              p: 'var(--spacing-4)',
              backgroundColor: 'hsla(var(--brand-primary), 0.05)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid hsla(var(--brand-primary), 0.3)',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary-light)) 100%)'
              },
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                backgroundColor: 'hsla(var(--brand-primary), 0.08)'
              }
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                mb: 'var(--spacing-2)'
              }}>
                <SectionHeader 
                  sx={{ 
                    color: 'hsl(var(--brand-primary))',
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}
                >
                  Special Offer
                </SectionHeader>
                <Box
                  sx={{
                    backgroundColor: 'hsl(var(--brand-primary))',
                    color: 'white',
                    px: 'var(--spacing-2)',
                    py: 'var(--spacing-1)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  YourEDU Exclusive
                </Box>
              </Box>
              <Typography sx={{ 
                color: 'hsl(var(--text-primary))',
                fontWeight: 500,
                fontSize: '1.2rem',
                lineHeight: 1.4,
                mb: 'var(--spacing-2)'
              }}>
                {provider.discount}
              </Typography>
              <Typography sx={{
                color: 'hsl(var(--text-secondary))',
                fontSize: '0.9rem'
              }}>
                Sign up now to unlock these special benefits for YourEDU members!
              </Typography>
            </Box>
          </Grid>

          {/* Full Width How to Redeem Section */}
          <Grid item xs={12}>
            <Box sx={{
              p: 'var(--spacing-4)',
              backgroundColor: 'hsl(var(--background))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))',
            }}>
              <SectionHeader 
                sx={{ 
                  mb: 'var(--spacing-2)',
                  color: 'hsl(var(--text-primary))',
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                How to Redeem
              </SectionHeader>
              <Box 
                component="ol" 
                sx={{ 
                  color: 'hsl(var(--text-primary))',
                  lineHeight: 1.6,
                  pl: 'var(--spacing-4)',
                  '& li': {
                    mb: 'var(--spacing-2)',
                    pl: 'var(--spacing-2)',
                    '&:last-child': {
                      mb: 0
                    }
                  }
                }}
              >
                {provider.howToRedeem.split('\n\n').map((step, index) => (
                  <li key={index}>
                    {provider.name === "ThriftBooks" 
                      ? step.replace(/this page/, 
                          <Link 
                            key="thriftbooks-link"
                            href="https://www.thriftbooks.com/teachers/"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ 
                              color: 'hsl(var(--brand-primary))',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            this page
                          </Link>
                        )
                      : step.replace(/^\d+\.\s/, '')}
                  </li>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MarketplaceDetail; 