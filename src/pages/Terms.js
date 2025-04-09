import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import logo from '../assets/youredu-2.png';

const Terms = () => {
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
              Terms of Service
            </Typography>

            <Box sx={styles.content}>
              <Typography variant="h6" sx={styles.sectionTitle}>
                1. Platform Usage
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                YourEDU provides a platform for homeschooling families to manage education, track progress, and access resources. By using our services, you agree to use the platform responsibly and in accordance with applicable education laws.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                2. User Responsibilities
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                Users are responsible for maintaining accurate information, protecting account credentials, and ensuring compliance with local homeschooling regulations. Parents/guardians are responsible for their students' activities on the platform.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                3. Data Usage
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                We collect and store educational data to provide and improve our services. For detailed information about data collection and usage, please refer to our Privacy Policy.
              </Typography>

              <Typography variant="h6" sx={styles.sectionTitle}>
                4. Service Modifications
              </Typography>
              <Typography variant="body1" sx={styles.text}>
                YourEDU reserves the right to modify or discontinue services with reasonable notice. We strive to maintain consistent service while continuously improving our platform.
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

export default Terms; 