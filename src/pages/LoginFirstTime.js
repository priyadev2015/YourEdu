import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Paper, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/youredu-2.png';

const LoginFirstTime = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    birthday: '',
    primaryGoal: '',
    otherGoals: {
      academicExcellence: false,
      flexibility: false,
      religiousValues: false,
      specialNeeds: false,
      safeEnvironment: false,
      customizedLearning: false,
      collegePrep: false,
    },
    additionalGoals: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      otherGoals: {
        ...prev.otherGoals,
        [name]: checked
      }
    }));
  };

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
            <Box sx={styles.header}>
              <Typography variant="h3" sx={styles.title}>
                Tell us about you
              </Typography>
              <Typography variant="body1" sx={styles.subtitle}>
                Help us personalize your homeschooling journey
              </Typography>
            </Box>

            <Box sx={styles.formContent}>
              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Contact Information Section */}
                <Typography variant="subtitle1" sx={styles.sectionTitle}>
                  Contact Information
                </Typography>
                
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  sx={styles.textField}
                />

                {/* Address Section */}
                <Typography variant="subtitle1" sx={styles.sectionTitle}>
                  Homeschool Location
                </Typography>
                
                <TextField
                  fullWidth
                  label="Street Address"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  sx={styles.textField}
                />

                <Box sx={styles.addressGrid}>
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                    sx={styles.textField}
                  />
                  <TextField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                    sx={styles.textField}
                  />
                  <TextField
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    size="small"
                    sx={styles.textField}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                  sx={styles.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                {/* Homeschooling Goals Section */}
                <Typography variant="subtitle1" sx={styles.sectionTitle}>
                  Your Homeschooling Goals
                </Typography>

                <FormControl fullWidth size="small" sx={styles.textField}>
                  <InputLabel>Primary Goal</InputLabel>
                  <Select
                    name="primaryGoal"
                    value={formData.primaryGoal}
                    onChange={handleChange}
                    required
                    label="Primary Goal"
                  >
                    <MenuItem value="personalized-learning">Personalized Learning Experience</MenuItem>
                    <MenuItem value="academic-freedom">Academic Freedom and Flexibility</MenuItem>
                    <MenuItem value="values-alignment">Alignment with Family Values</MenuItem>
                    <MenuItem value="special-education">Special Education Needs</MenuItem>
                    <MenuItem value="advanced-learning">Advanced Learning Opportunities</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="body2" sx={styles.helperText}>
                  Select additional goals that apply to your homeschooling journey:
                </Typography>

                <Box sx={styles.checkboxGrid}>
                  <FormControlLabel
                    control={<Checkbox 
                      checked={formData.otherGoals.academicExcellence}
                      onChange={handleCheckboxChange}
                      name="academicExcellence"
                      size="small"
                    />}
                    label={<Typography variant="body2">Academic Excellence</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={formData.otherGoals.flexibility}
                      onChange={handleCheckboxChange}
                      name="flexibility"
                      size="small"
                    />}
                    label={<Typography variant="body2">Schedule Flexibility</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={formData.otherGoals.religiousValues}
                      onChange={handleCheckboxChange}
                      name="religiousValues"
                      size="small"
                    />}
                    label={<Typography variant="body2">Religious/Moral Values</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={formData.otherGoals.specialNeeds}
                      onChange={handleCheckboxChange}
                      name="specialNeeds"
                      size="small"
                    />}
                    label={<Typography variant="body2">Special Needs Support</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={formData.otherGoals.safeEnvironment}
                      onChange={handleCheckboxChange}
                      name="safeEnvironment"
                      size="small"
                    />}
                    label={<Typography variant="body2">Safe Learning Environment</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={formData.otherGoals.customizedLearning}
                      onChange={handleCheckboxChange}
                      name="customizedLearning"
                      size="small"
                    />}
                    label={<Typography variant="body2">Customized Learning Pace</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox 
                      checked={formData.otherGoals.collegePrep}
                      onChange={handleCheckboxChange}
                      name="collegePrep"
                      size="small"
                    />}
                    label={<Typography variant="body2">College Preparation</Typography>}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Additional Goals or Comments"
                  name="additionalGoals"
                  multiline
                  rows={2}
                  value={formData.additionalGoals}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  sx={styles.textField}
                  placeholder="Tell us more about your specific goals and what you hope to achieve through homeschooling..."
                />

                {/* Terms Agreement */}
                <Typography variant="body2" sx={styles.termsText}>
                  By clicking "Agree", you accept our{' '}
                  <Link 
                    to="/terms-and-privacy" 
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open('/terms-and-privacy', '_blank');
                    }}
                    style={styles.link}
                  >
                    Terms & Privacy Policy
                  </Link>
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={styles.submitButton}
                >
                  Agree
                </Button>
              </form>
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0, 53, 107, 0.1)',
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
    textAlign: 'center',
  },
  title: {
    color: '#00356B',
    fontWeight: 700,
    marginBottom: '8px',
    fontSize: '2rem',
  },
  subtitle: {
    color: '#64748B',
    fontSize: '1rem',
    marginTop: '4px',
  },
  sectionTitle: {
    color: '#00356B',
    fontWeight: 600,
    marginTop: '16px',
    marginBottom: '8px',
    fontSize: '1rem',
  },
  formContent: {
    width: '100%',
    maxWidth: '500px',
  },
  form: {
    width: '100%',
  },
  addressGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '12px',
    width: '100%',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '4px',
    marginBottom: '16px',
  },
  textField: {
    marginBottom: '16px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#F8FAFC',
      '& fieldset': {
        borderColor: '#E2E8F0',
      },
      '&:hover fieldset': {
        borderColor: '#94A3B8',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00356B',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#64748B',
      '&.Mui-focused': {
        color: '#00356B',
      },
    },
  },
  helperText: {
    color: '#64748B',
    marginBottom: '8px',
    fontSize: '0.875rem',
  },
  termsText: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: '16px',
    fontSize: '0.875rem',
  },
  link: {
    color: '#00356B',
    textDecoration: 'underline',
    '&:hover': {
      color: '#0056b3',
    },
  },
  submitButton: {
    backgroundColor: '#00356B',
    color: 'white',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
};

export default LoginFirstTime; 