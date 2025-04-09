import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { PageHeader, DescriptiveText } from '../components/ui/typography.jsx';
import { BsUpload, BsPersonBadge } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

// Local ID card service function
const createIdCard = async (cardData) => {
  try {
    console.log('Creating ID card with data:', cardData);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    // Check if a card of this type already exists for the user
    const { data: existingCards, error: existingError } = await supabase
      .from('id_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'membership');
    
    if (existingError) throw existingError;
    
    // If a membership card already exists, don't create another one
    if (existingCards && existingCards.length > 0) {
      console.log('Membership card already exists, returning existing card');
      return existingCards[0];
    }

    // Determine the card type based on user type if not explicitly provided
    const userType = localStorage.getItem('userType');
    const cardType = cardData.type || (userType === 'student' ? 'student' : 'teacher');

    // Only include fields that exist in the id_cards table
    const insertData = {
      user_id: user.id,
      type: cardType,
      first_name: cardData.first_name,
      last_name: cardData.last_name,
      school_name: cardData.school_name,
      school_logo_url: cardData.school_logo_url,
      school_address: cardData.school_address,
      school_phone: cardData.school_phone,
      photo_url: cardData.photo_url,
      expiration_date: cardData.expiration_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Only include grade if it exists (for student cards)
    if (cardData.grade) {
      insertData.grade = cardData.grade;
    }

    console.log('Inserting card data:', insertData);

    const { data, error } = await supabase
      .from('id_cards')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Card created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating ID card:', error);
    throw error;
  }
};

const IdGeneration = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setUserId(user.id);
    };

    fetchUserId();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    schoolName: '',
    schoolLogo: null,
    schoolAddress: '',
    schoolPhone: '',
    profilePicture: null,
    type: 'student',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  });

  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        schoolLogo: file
      }));
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        userId: userId,
      };
      await createIdCard(submitData);
      toast.success('ID card generated successfully!');
      navigate('/id-generation/view');
    } catch (error) {
      toast.error('Failed to generate ID card');
      console.error('Error generating ID card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Back button section */}
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', py: 2 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/id-generation/view')}
            sx={{ color: '#00356b' }}
          >
            BACK TO GENERATED IDS
          </Button>
        </Container>
      </Box>

      {/* Title section with gray background */}
      <Box sx={{ backgroundColor: '#f8fafc', py: 6, borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <PageHeader sx={{ color: '#1a202c', mb: 2 }}>
            Student ID Generation
          </PageHeader>
          <DescriptiveText sx={{ color: '#4a5568', maxWidth: '65ch' }}>
            Generate official student identification cards for your homeschool students. These IDs can be used for educational discounts, library access, and other student services.
          </DescriptiveText>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 6,
          }}
        >
          {/* Left Column - Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ mb: 3 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a202c', marginBottom: '1rem' }}>Student Information</h2>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem',
                    }}
                  />
                </Box>
                
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem',
                    }}
                  />
                </Box>
                
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>Grade (Optional)</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem',
                    }}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a202c', marginBottom: '1rem' }}>School Information</h2>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>School Name</label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem',
                    }}
                  />
                </Box>
                
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>School Address</label>
                  <input
                    type="text"
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem',
                    }}
                  />
                </Box>
                
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>School Phone</label>
                  <input
                    type="text"
                    name="schoolPhone"
                    value={formData.schoolPhone}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          
          {/* Right Column - Image Uploads and Preview */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a202c', marginBottom: '1rem' }}>Upload Photos</h2>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>Student Photo</label>
                  <Box
                    sx={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#cbd5e0',
                        backgroundColor: '#f7fafc',
                      },
                    }}
                    onClick={() => document.getElementById('photo-upload').click()}
                  >
                    {photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt="Student"
                        style={{
                          width: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '0.25rem',
                        }}
                      />
                    ) : (
                      <>
                        <BsPersonBadge style={{ fontSize: '3rem', color: '#a0aec0', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Upload student photo</p>
                        <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Click to browse or drag and drop</p>
                      </>
                    )}
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </Box>
                </Box>
                
                <Box>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>School Logo (Optional)</label>
                  <Box
                    sx={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#cbd5e0',
                        backgroundColor: '#f7fafc',
                      },
                    }}
                    onClick={() => document.getElementById('logo-upload').click()}
                  >
                    {logoPreviewUrl ? (
                      <img
                        src={logoPreviewUrl}
                        alt="School Logo"
                        style={{
                          width: '100%',
                          maxHeight: '150px',
                          objectFit: 'contain',
                          borderRadius: '0.25rem',
                        }}
                      />
                    ) : (
                      <>
                        <BsUpload style={{ fontSize: '2rem', color: '#a0aec0', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Upload school logo</p>
                        <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Click to browse or drag and drop</p>
                      </>
                    )}
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto', pt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                  width: '100%',
                }}
              >
                {isLoading ? 'Generating...' : 'Generate ID Card'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default IdGeneration; 