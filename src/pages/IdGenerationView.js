import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Button, Typography } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import Barcode from 'react-barcode';
import { supabase } from '../utils/supabaseClient';
import { CircularProgress } from '@mui/material';

// Consolidated ID card service functions
const idCardService = {
  // Get ID card for the current user
  async getUserIdCard() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Get only membership cards
      const { data, error } = await supabase
        .from('id_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'membership')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched ID cards:', data);
      
      // Return the first card if it exists
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching ID card:', error);
      throw error;
    }
  },

  // Create or update the ID card
  async createOrUpdateIdCard(cardData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Check if a membership card already exists
      const { data: existingCards, error: existingError } = await supabase
        .from('id_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'membership');
      
      if (existingError) throw existingError;
      
      // If a card exists, update it
      if (existingCards && existingCards.length > 0) {
        const existingCard = existingCards[0];
        
        // Filter the update data to only include fields that exist in the id_cards table
        const validFields = {
          first_name: cardData.first_name,
          last_name: cardData.last_name,
          school_name: cardData.school_name,
          school_logo_url: cardData.school_logo_url,
          school_address: cardData.school_address,
          school_phone: cardData.school_phone,
          photo_url: cardData.photo_url,
          expiration_date: cardData.expiration_date,
          type: cardData.type
        };

        // Remove undefined fields
        const filteredUpdateData = Object.fromEntries(
          Object.entries(validFields).filter(([_, v]) => v !== undefined)
        );

        console.log('Updating existing ID card with data:', filteredUpdateData);

        const { data, error } = await supabase
          .from('id_cards')
          .update(filteredUpdateData)
          .eq('id', existingCard.id)
          .select()
          .single();

        if (error) throw error;
        
        console.log('Card updated successfully:', data);
        return data;
      } else {
        // Create a new card
        const insertData = {
          user_id: user.id,
          type: 'membership',
          first_name: cardData.first_name,
          last_name: cardData.last_name,
          school_name: cardData.school_name || 'YourEDU',
          school_address: cardData.school_address,
          school_phone: cardData.school_phone,
          photo_url: cardData.photo_url,
          expiration_date: cardData.expiration_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        console.log('Creating new ID card with data:', insertData);

        const { data, error } = await supabase
          .from('id_cards')
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;
        
        console.log('Card created successfully:', data);
        return data;
      }
    } catch (error) {
      console.error('Error creating/updating ID card:', error);
      throw error;
    }
  }
};

const IdCard = ({ card, onDownload, onPrint }) => {
  const cardRef = React.useRef();

  const renderMembershipCard = () => (
    <div style={styles.membershipCard}>
      <div style={styles.membershipHeader}>
        <div style={styles.headerBlueSection}>
          <h2 style={styles.membershipTitle}>
            {localStorage.getItem('userType') === 'student' ? 'Student ID' : 'Teacher ID'}
          </h2>
        </div>
        <img 
          src={require('../assets/youredu-2.png')}
          alt="YourEDU Logo" 
          style={styles.membershipLogo}
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.target.style.display = 'none';
          }}
        />
      </div>
      <div style={styles.membershipContent}>
        {card.photo_url ? (
          <img 
            key={card.photo_url}
            src={`${card.photo_url}${card.photo_url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`}
            alt="Member Photo" 
            style={styles.membershipPhoto}
            onError={(e) => {
              console.error('Profile photo failed to load:', e);
              console.log('Attempted photo URL:', card.photo_url);
              
              // Safer approach to handle the error - just hide the image and show initial instead
              if (e.target && e.target.style) {
                e.target.style.display = 'none';
                
                // Create a placeholder element
                const placeholder = document.createElement('div');
                Object.assign(placeholder.style, {
                  width: '150px',
                  height: '150px',
                  backgroundColor: '#4B7BF5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  borderRadius: '4px'
                });
                
                // Add the user's initials
                const initials = `${card.first_name?.charAt(0) || ''}${card.last_name?.charAt(0) || ''}`;
                placeholder.textContent = initials;
                
                // Insert the placeholder after the image
                if (e.target.parentNode) {
                  e.target.parentNode.insertBefore(placeholder, e.target.nextSibling);
                }
              }
            }}
          />
        ) : (
          <div style={{
            ...styles.membershipPhoto,
            backgroundColor: '#4B7BF5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold'
          }}>
            {`${card.first_name?.charAt(0) || ''}${card.last_name?.charAt(0) || ''}`}
          </div>
        )}
        
        <div style={styles.membershipInfo}>
          <h3 style={styles.memberName}>{card.first_name} {card.last_name}</h3>
          <p style={styles.membershipId}>ID #{card.user_id}</p>
          <p style={styles.membershipExpiry}>VALID THROUGH: {new Date(card.expiration_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
      {card.user_id && (
        <div style={styles.membershipBarcode}>
          <Barcode 
            value={card.user_id} 
            width={1.5}
            height={60} 
            fontSize={10}
            background="#ffffff"
            lineColor="#000000"
            margin={0}
            displayValue={false}
          />
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.idCardContainer}>
      <div ref={cardRef} style={styles.idCard}>
        {renderMembershipCard()}
      </div>
    </div>
  );
};

const IdGenerationView = () => {
  const navigate = useNavigate();
  const [card, setCard] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [profileStatus, setProfileStatus] = React.useState({
    isComplete: false,
    missingFields: []
  });

  // Add event listener for name updates
  React.useEffect(() => {
    const handleNameUpdate = async (event) => {
      try {
        console.log('Received profileNameUpdated event:', event.detail);
        const { firstName, lastName } = event.detail;
        
        // Update the ID card with the new name
        await updateIdCardWithProfileData({ firstName, lastName });
      } catch (error) {
        console.error('Error updating ID card:', error);
      }
    };

    const handleProfileUpdate = async (event) => {
      try {
        console.log('Received profileDataUpdated event:', event.detail);
        
        // Update the ID card with the latest profile data
        await updateIdCardWithProfileData();
      } catch (error) {
        console.error('Error updating ID card:', error);
      }
    };

    window.addEventListener('profileNameUpdated', handleNameUpdate);
    window.addEventListener('profileDataUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileNameUpdated', handleNameUpdate);
      window.removeEventListener('profileDataUpdated', handleProfileUpdate);
    };
  }, []);

  // Initialize component and set up polling
  React.useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoading(true);
        await checkProfileAndUpdateIdCard();
      } catch (error) {
        console.error('Error initializing component:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();

    // Set up polling to refresh the ID card every 30 seconds
    const intervalId = setInterval(async () => {
      try {
        // Silently refresh the ID card without showing loading state
        await updateIdCardWithProfileData(null, true);
      } catch (error) {
        console.error('Error refreshing ID card during polling:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Check profile and update ID card
  const checkProfileAndUpdateIdCard = async () => {
    try {
      setIsLoading(true);
      
      // Get the user's UUID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Check required fields
      const missingFields = [];
      if (!profileData?.firstName && !profileData?.first_name && !profileData?.name) missingFields.push('Name');
      if (!profileData?.email) missingFields.push('Email');
      if (!profileData?.streetAddress && !profileData?.street_address) missingFields.push('Street Address');

      setProfileStatus({
        isComplete: missingFields.length === 0,
        missingFields
      });

      if (missingFields.length === 0) {
        // Update or create the ID card
        await updateIdCardWithProfileData(profileData);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      toast.error('Failed to check profile status');
    } finally {
      setIsLoading(false);
    }
  };

  // Update ID card with profile data
  const updateIdCardWithProfileData = async (profileDataOverride = null, silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      // Get the user's UUID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Fetch user profile data from auth metadata for the most up-to-date info
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // Also fetch from account_profiles for additional fields
      const { data: profileData, error: profileError } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      console.log('Fetched profile data:', profileData);
      console.log('User metadata:', userData.user.user_metadata);
      
      // Use override data if provided (e.g., from direct name update)
      const dataToUse = profileDataOverride || profileData;
      
      // Get first and last name - handle both camelCase and snake_case field names
      let firstName = '';
      let lastName = '';
      
      // Check for direct override values first
      if (dataToUse && typeof dataToUse === 'object') {
        firstName = dataToUse.firstName || dataToUse.first_name || '';
        lastName = dataToUse.lastName || dataToUse.last_name || '';
      }
      
      // If we don't have first/last name from override, get from profile data
      if (!firstName && !lastName) {
        firstName = profileData.first_name || '';
        lastName = profileData.last_name || '';
      }
      
      // If we still don't have first/last name, try to get from name field or user metadata
      if (!firstName && !lastName) {
        let fullName = profileData.name || userData.user.user_metadata?.name || '';
        if (fullName) {
          const nameParts = fullName.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
      }
      
      console.log('Using name values:', { firstName, lastName });
      
      // Get profile picture URL
      let photoUrl = '';
      if (profileData.profile_picture) {
        photoUrl = profileData.profile_picture;
      } else if (userData.user.user_metadata?.avatar_url) {
        photoUrl = userData.user.user_metadata.avatar_url;
      }
      
      // Create or update the ID card
      const cardData = {
        first_name: firstName,
        last_name: lastName,
        school_name: 'YourEDU',
        school_address: profileData.street_address || '',
        school_phone: profileData.phone_number || '',
        photo_url: photoUrl,
        expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('Updating ID card with data:', cardData);
      
      // Create or update the ID card
      const updatedCard = await idCardService.createOrUpdateIdCard(cardData);
      
      // Update the state
      setCard(updatedCard);
      
      return updatedCard;
    } catch (error) {
      console.error('Error updating ID card:', error);
      throw error;
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleDownload = async (element) => {
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Increase quality
        useCORS: true, // Enable cross-origin image loading
        backgroundColor: '#f8fafc',
        logging: false,
        onclone: (clonedDoc) => {
          // Apply computed styles to cloned element
          const clonedElement = clonedDoc.querySelector('[ref="cardRef"]');
          if (clonedElement) {
            clonedElement.style.width = '600px'; // Fixed width for better quality
            clonedElement.style.margin = '0';
            clonedElement.style.padding = '24px';
          }
        }
      });

      // Create PDF with proper dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
      pdf.save(`id-card-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error downloading card:', error);
    }
  };

  const handlePrint = async (element) => {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        console.error('Pop-up blocked. Please allow pop-ups to print the ID card');
        return;
      }
      
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ID Card</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
              }
              @media print {
                body {
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="ID Card" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing card:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid hsl(var(--border))',
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
            Your YourEDU Membership ID Card is your key to future exclusive benefits and savings. Soon, you'll have access to discounted educational courses, business services, and special offers from our growing network of partners. Stay tuned for exciting updates!
          </Typography>
        </Container>
      </Box>

      <Container 
        maxWidth="var(--container-max-width)"
        sx={{ 
          position: 'relative',
          px: 'var(--container-padding-x)',
          py: 2,
          flex: 1,
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {/* ID Card Display */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !card ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid hsl(var(--border))'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'hsl(var(--foreground))' }}>
              {profileStatus.isComplete 
                ? 'Creating Your ID Card...' 
                : 'Complete Your Profile to Get Your ID Card'}
            </Typography>
            {!profileStatus.isComplete && (
              <>
                <Typography sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
                  Complete your profile to get your YourEDU Membership Card!
                </Typography>
                <Typography sx={{ color: 'hsl(var(--muted-foreground))', mb: 3 }}>
                  You still need to add your {profileStatus.missingFields.map((field, index, array) => {
                    const fieldText = array.length === 1 
                      ? field.toLowerCase()
                      : index === array.length - 1 
                      ? `and ${field.toLowerCase()}`
                      : `${field.toLowerCase()}, `;
                    return (
                      <Typography
                        key={field}
                        component="span"
                        sx={{ 
                          textDecoration: 'underline',
                          display: 'inline',
                          fontWeight: 500,
                          color: 'inherit'
                        }}
                      >
                        {fieldText}
                      </Typography>
                    );
                  })} in your account profile.
                </Typography>
                <Button 
                  variant="contained"
                  onClick={() => navigate('/account/profile')}
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
                    textTransform: 'none'
                  }}
                >
                  Complete Profile
                </Button>
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <IdCard
              key={card.id}
              card={card}
              onDownload={handleDownload}
              onPrint={handlePrint}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

const styles = {
  content: {
    backgroundColor: 'transparent',
    padding: 0,
    boxShadow: 'none',
  },
  cardGrid: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 0',
  },
  idCardContainer: {
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',
  },
  idCard: {
    aspectRatio: '1.586',
    width: '600px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  logo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
  },
  photo: {
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  cardInfo: {
    textAlign: 'center',
    width: '100%',
  },
  schoolName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '8px',
  },
  name: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: '4px',
  },
  type: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2B6CB0',
    marginBottom: '8px',
  },
  detail: {
    fontSize: '14px',
    color: '#4A5568',
    marginBottom: '4px',
  },
  expiry: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '8px',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    color: 'white',
    height: '36px',
    fontSize: '0.875rem',
    textTransform: 'none',
    fontWeight: 500,
    padding: '0 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'none',
    boxShadow: 'none',
  },
  barcode: {
    marginTop: '16px',
    textAlign: 'center',
  },
  membershipCard: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '1.586',
    margin: '0 auto',
  },
  membershipHeader: {
    position: 'relative',
    width: '100%',
    height: '60px',
    marginBottom: '25px',
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerBlueSection: {
    width: '45%',
    height: '100%',
    backgroundColor: '#4B7BF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 0
  },
  membershipTitle: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#ffffff',
    margin: 0
  },
  membershipLogo: {
    width: '200px',
    height: 'auto',
    objectFit: 'contain',
    marginRight: '30px',
    marginTop: '-15px'
  },
  membershipContent: {
    display: 'flex',
    padding: '15px 30px 15px',
    gap: '30px',
    alignItems: 'flex-start'
  },
  membershipPhoto: {
    width: '150px',
    height: '150px',
    borderRadius: '4px',
    objectFit: 'cover',
    border: '2px solid #4B7BF5',
    backgroundColor: '#f0f0f0',
  },
  membershipInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  memberName: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '12px',
    marginTop: 0
  },
  membershipId: {
    fontSize: '16px',
    color: '#4A5568',
    marginBottom: '8px',
    marginTop: 0
  },
  membershipExpiry: {
    fontSize: '16px',
    color: '#4A5568',
    marginTop: 0,
    marginBottom: 0
  },
  membershipBarcode: {
    marginTop: 'auto',
    padding: '20px 0',
    textAlign: 'center',
    backgroundColor: '#ffffff'
  }
};

export default IdGenerationView; 