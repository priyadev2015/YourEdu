import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import logo from '../assets/youredu-2.png';

const TermsAndPrivacy = () => {
  return (
    <Box sx={styles.pageContainer}>
      <Box sx={styles.logoContainer}>
        <img src={logo} alt="YourEDU" style={styles.mainLogo} />
      </Box>
      
      <Container maxWidth="md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Paper elevation={0} sx={styles.contentWrapper}>
            <Typography variant="h3" sx={styles.title}>
              Terms & Privacy
            </Typography>

            <Box sx={styles.content}>
              <Typography variant="h6" sx={styles.sectionTitle}>
                Terms of Service
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                Welcome to YourEDU. By using our platform, you agree to these terms of service. Our platform is designed to provide educational services and support for homeschooling families. Users must be at least 13 years old to use this service, and those under 18 must have parent/guardian permission.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                Privacy & Data Protection
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                We take your privacy seriously. We collect and process only the information necessary to provide our educational services, including contact details and educational records. Your data is protected using industry-standard security measures. We never sell personal information to third parties. All data collection and processing comply with relevant educational privacy laws and regulations.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                User Responsibilities
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                As a YourEDU user, you agree to:
                • Provide accurate and truthful information
                • Maintain the security of your account credentials
                • Use the platform for legitimate educational purposes
                • Respect intellectual property rights
                • Follow all applicable laws and regulations
                • Not engage in any harmful or disruptive behavior
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                Educational Content
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                Our platform provides access to educational resources and tools. While we strive to ensure accuracy and quality, we recommend verifying all educational content with your local education authorities. Users are responsible for ensuring compliance with their local homeschooling requirements.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                Contact Information
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                For questions about these terms, your privacy, or our services, please contact our support team. We're committed to addressing your concerns and maintaining transparent communication with our users.
              </Typography>

              <Typography variant="body2" sx={styles.updateText}>
                Last updated: March 2024
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(150deg, #ffffff 0%, #f0f7ff 100%)',
    position: 'relative',
    padding: '20px',
  },
  logoContainer: {
    position: 'absolute',
    top: '32px',
    left: '32px',
  },
  mainLogo: {
    width: '160px',
  },
  contentWrapper: {
    padding: '32px',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0, 53, 107, 0.1)',
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    color: '#00356B',
    fontWeight: 700,
    marginBottom: '32px',
    fontSize: '2rem',
    textAlign: 'center',
  },
  content: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  sectionTitle: {
    color: '#00356B',
    fontWeight: 600,
    marginTop: '24px',
    marginBottom: '12px',
    fontSize: '1.1rem',
  },
  text: {
    color: '#475569',
    marginBottom: '16px',
    lineHeight: 1.6,
  },
  updateText: {
    color: '#64748B',
    marginTop: '32px',
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

export default TermsAndPrivacy; 