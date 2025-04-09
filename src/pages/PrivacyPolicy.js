import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import logo from '../assets/youredu-2.png';

const PrivacyPolicy = () => {
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
              Privacy Policy
            </Typography>

            <Box sx={styles.content}>
              <Typography variant="h6" sx={styles.sectionTitle}>
                1. Information We Collect
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                We collect information necessary to provide educational services, including contact details, student records, and learning progress data. This helps us personalize your homeschooling experience and improve our platform.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                2. How We Use Your Data
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                Your data is used to provide educational services, track academic progress, and enhance platform functionality. We never sell personal information to third parties. Data is stored securely and accessed only by authorized personnel.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                3. Data Protection
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                We implement industry-standard security measures to protect your information. All data is encrypted in transit and at rest. We regularly review and update our security practices to maintain data safety.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                4. Your Rights
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                You have the right to access, correct, or delete your personal information. Contact our support team for assistance with managing your data or privacy concerns.
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

export default PrivacyPolicy; 