import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { IoClose } from 'react-icons/io5';
import { SectionHeader, DescriptiveText } from '../components/ui/typography';
import { cardStyles } from '../styles/theme/components/cards';
import thriftbooksLogo from '../assets/Perk Logos/thriftbooks.png';

const PartnerDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    contactName: '',
    email: '',
    phone: '',
    category: '',
    description: '',
    discount: '',
    redemptionProcess: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    // For now, just close the dialog
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'hsl(var(--background))',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid hsl(var(--border))',
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Partner With YourEDU
        </Typography>
        <IconButton onClick={onClose} size="small">
          <IoClose />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography sx={{ mb: 3, color: 'hsl(var(--text-secondary))' }}>
          YourEDU Perks for homeschool families - simply for being students and educators
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                <MenuItem value="Books">Books</MenuItem>
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Supplies">Supplies</MenuItem>
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Courses">Courses</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Service Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              required
              helperText="Describe your product or service and its value to educators"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Special Discount for Students, Teachers, and YourEDU Members"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
              required
              helperText="Describe the exclusive discount or offer you'll provide to our members"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Redemption Process"
              name="redemptionProcess"
              value={formData.redemptionProcess}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              required
              helperText="Explain how members will redeem their discount (e.g., promo code, verification process)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ 
        px: 3, 
        py: 2,
        borderTop: '1px solid hsl(var(--border))',
        gap: 2
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            color: 'hsl(var(--text-primary))',
            borderColor: 'hsl(var(--border))'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: 'hsl(var(--brand-primary))',
            '&:hover': {
              backgroundColor: 'hsl(var(--brand-primary-dark))'
            }
          }}
        >
          Submit Application
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Marketplace = () => {
  const navigate = useNavigate();
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  
  // Mock data for education providers and perks
  const provider = {
    id: 9,
    name: "ThriftBooks",
    logo: thriftbooksLogo,
    description: "Access over 13 million used and new books at the lowest everyday prices. Free shipping on orders over $15.",
    discount: "Special YourEDU member pricing on textbooks",
    category: "Books"
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid hsl(var(--border))',
        mb: 3
      }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            px: 'var(--container-padding-x)',
            py: 3,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Typography 
            sx={{ 
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2.1
            }}
          >
            YourEDU Perks for homeschool families - simply for being students and educators
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="var(--container-max-width)"
        sx={{ 
          position: 'relative',
          px: 'var(--container-padding-x)',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {/* Partner With Us Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mb: 4
        }}>
          <Button 
            variant="contained"
            onClick={() => setPartnerDialogOpen(true)}
            sx={{
              backgroundColor: '#2563EB',
              color: 'white',
              height: 36,
              '&:hover': {
                backgroundColor: '#2563EB',
                boxShadow: 'none'
              },
              transition: 'none',
              boxShadow: 'none',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              py: 0.5,
              px: 1.5,
              minWidth: 0
            }}
          >
            Partner With Us
          </Button>
        </Box>

        {/* ThriftBooks Card */}
        <Box
          sx={{
            ...cardStyles.feature,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            position: 'relative',
            p: 'var(--spacing-4)',
            maxWidth: '400px',
            margin: '0 auto',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px -10px hsla(var(--shadow-color), 0.15)',
              '& .icon-container': {
                transform: 'scale(1.1)',
                backgroundColor: 'hsla(var(--brand-primary), 0.12)'
              },
              '& .learn-more': {
                backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                borderColor: 'hsl(var(--brand-primary))'
              }
            }
          }}
          onClick={() => navigate(`/marketplace/${provider.id}`)}
        >
          {/* Category Tag */}
          <Box sx={{
            position: 'absolute',
            top: 'var(--spacing-3)',
            right: 'var(--spacing-3)',
            padding: 'var(--spacing-1) var(--spacing-2)',
            backgroundColor: 'hsla(var(--brand-primary), 0.06)',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            color: 'hsl(var(--brand-primary))',
            border: '1px solid hsla(var(--brand-primary), 0.12)',
            fontWeight: 500
          }}>
            {provider.category}
          </Box>

          {/* Icon */}
          <Box 
            component="img"
            src={provider.logo}
            alt={`${provider.name} logo`}
            className="icon-container"
            sx={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'hsla(var(--brand-primary), 0.06)',
              padding: 'var(--spacing-2)',
              objectFit: 'contain',
              transition: 'all 0.2s ease'
            }}
          />

          {/* Title */}
          <SectionHeader sx={{ 
            fontSize: '18px',
            textAlign: 'center',
            margin: 0,
            color: 'hsl(var(--text-primary))'
          }}>
            {provider.name}
          </SectionHeader>

          {/* Description */}
          <DescriptiveText sx={{
            fontSize: '14px',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.5,
            flex: 1,
            color: 'hsl(var(--text-secondary))'
          }}>
            {provider.description}
          </DescriptiveText>

          {/* Discount Badge */}
          <Box sx={{
            backgroundColor: 'hsla(var(--brand-primary), 0.06)',
            color: 'hsl(var(--brand-primary))',
            padding: 'var(--spacing-1) var(--spacing-3)',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid hsla(var(--brand-primary), 0.12)',
            textAlign: 'center'
          }}>
            {provider.discount}
          </Box>

          {/* Learn More Button */}
          <Button
            className="learn-more"
            variant="outlined"
            sx={{
              mt: 'var(--spacing-2)',
              color: 'hsl(var(--brand-primary))',
              borderColor: 'hsl(var(--border-default))',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                borderColor: 'hsl(var(--brand-primary))'
              }
            }}
          >
            Learn More
          </Button>
        </Box>
      </Container>

      {/* Partner Dialog */}
      <PartnerDialog 
        open={partnerDialogOpen} 
        onClose={() => setPartnerDialogOpen(false)} 
      />
    </Box>
  );
};

export default Marketplace; 