import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { updateOnboardingProgress } from '../utils/onboardingUtils'
import StandardTextField from '../components/ui/StandardTextField'
import StandardSelect from '../components/ui/StandardSelect'
import {
  Box,
  Container,
  Paper,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
]

const TIMEZONES = [
  'Eastern Time (ET)',
  'Central Time (CT)',
  'Mountain Time (MT)',
  'Pacific Time (PT)',
  'Alaska Time (AKT)',
  'Hawaii-Aleutian Time (HAT)',
]

const AccountProfile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    timezone: '',
    phoneNumber: '',
    profilePicture: '',
    imageError: false,
  })
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [tempImage, setTempImage] = useState(null)
  const imageRef = useRef(null)
  const [completedCrop, setCompletedCrop] = useState(null)
  const saveTimeoutRef = useRef(null)
  const lastUpdatedNameTimeRef = useRef(0)
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  })

  useEffect(() => {
    if (user) {
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      console.log('🔵 Fetching profile data for user:', user?.id)
      console.log('Current timestamp:', new Date().toISOString())
      
      let { data, error } = await supabase.from('account_profiles').select('*').eq('id', user?.id).single()

      if (error) {
        console.error('❌ Error fetching profile data:', error)
        throw error
      }

      console.log('✅ Profile data retrieved:', data)

      if (data) {
        let profilePictureUrl = ''
        console.log('Processing profile picture sources')
        console.log('Available profile picture fields:', {
          profile_picture: data.profile_picture,
          avatar_url: data.avatar_url,
          user_metadata_avatar_url: user?.user_metadata?.avatar_url
        })
        
        // Determine the profile picture source with priority order
        if (data.profile_picture) {
          // Check if it's a Google URL or a Supabase storage URL
          if (data.profile_picture.includes('googleusercontent.com')) {
            console.log('Using Google profile picture from account_profiles:', data.profile_picture)
            profilePictureUrl = data.profile_picture
          } else {
            // For Supabase storage URLs, check if it's a full URL or just a path
            console.log('Using profile_picture from account_profiles:', data.profile_picture)
            if (data.profile_picture.startsWith('http')) {
              // It's already a full URL
              profilePictureUrl = `${data.profile_picture}?t=${new Date().getTime()}`
            } else {
              // It's a path, generate the full URL
              const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(`${user.id}/profile.jpg`)
              profilePictureUrl = `${urlData?.publicUrl}?t=${new Date().getTime()}` || ''
            }
            console.log('Generated profile picture URL:', profilePictureUrl)
          }
        } else if (data.avatar_url) {
          // Use avatar_url from Google if available
          console.log('Using avatar_url from account_profiles:', data.avatar_url)
          profilePictureUrl = data.avatar_url
        } else if (user?.user_metadata?.avatar_url) {
          // Fallback to user metadata avatar from Google
          console.log('Using avatar_url from user metadata:', user.user_metadata.avatar_url)
          profilePictureUrl = user.user_metadata.avatar_url
        } else {
          console.log('No profile picture found in any source')
        }

        // Handle the case where we might still have old data with just 'name'
        let firstName = data.first_name
        let lastName = data.last_name
        
        console.log('Processing name data:', { 
          first_name: data.first_name, 
          last_name: data.last_name,
          name: data.name,
          user_metadata_name: user?.user_metadata?.full_name
        })
        
        if (!firstName && !lastName) {
          if (data.name) {
            // Split name from profile data
            console.log('Using name from profile data:', data.name)
            const nameParts = data.name.split(' ')
            firstName = nameParts[0]
            lastName = nameParts.slice(1).join(' ')
          } else if (user?.user_metadata?.full_name) {
            // Use full_name from Google auth
            console.log('Using full_name from Google auth:', user.user_metadata.full_name)
            const nameParts = user.user_metadata.full_name.split(' ')
            firstName = nameParts[0]
            lastName = nameParts.slice(1).join(' ')
          }
        }
        
        console.log('Final name values:', { firstName, lastName })

        const profileDataObj = {
          firstName: firstName || '',
          lastName: lastName || '',
          email: data.email || user?.email || '',
          age: data.age,
          streetAddress: data.street_address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          timezone: data.timezone,
          phoneNumber: data.phone_number,
          profilePicture: profilePictureUrl,
          imageError: false,
        }
        
        console.log('Setting profile data state:', profileDataObj)
        setProfileData(profileDataObj)
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      setMessage({ type: 'error', content: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  // Simple function to check profile completeness
  const isProfileComplete = (data) => {
    const requiredFields = ['firstName', 'lastName', 'email', 'city', 'state', 'zip', 'timezone']
    console.log('🔍 Checking profile completion with data:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      city: data.city,
      state: data.state,
      zip: data.zip,
      timezone: data.timezone
    })
    const isComplete = requiredFields.every(field => data[field] && data[field].trim() !== '')
    console.log('📊 Profile completion check result:', isComplete)
    if (!isComplete) {
      const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '')
      console.log('❌ Missing required fields:', missingFields)
    }
    return isComplete
  }

  // Simplified debounced save function that avoids auth updates
  const debouncedSave = (newData, shouldUpdateAuthUser = false) => {
    console.log('🟡 Scheduling save for profile data, shouldUpdateAuthUser:', shouldUpdateAuthUser)
    
    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Schedule new save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🟢 Executing scheduled save after debounce, shouldUpdateAuthUser:', shouldUpdateAuthUser)
        
        // Only show saving indicator if necessary
        if (shouldUpdateAuthUser) {
          setSaving(true)
        }
        
        // Prepare profile data for update
        const profileUpdateData = {
          id: user?.id,
          first_name: newData.firstName,
          last_name: newData.lastName,
          name: `${newData.firstName} ${newData.lastName}`.trim(),
          email: newData.email,
          age: newData.age,
          street_address: newData.streetAddress,
          city: newData.city,
          state: newData.state,
          zip: newData.zip,
          timezone: newData.timezone,
          phone_number: newData.phoneNumber,
          updated_at: new Date(),
        }
        
        console.log('🔄 Updating profile in database:', profileUpdateData)
        
        // Save to profile table
        const { error } = await supabase
          .from('account_profiles')
          .upsert(profileUpdateData)
        
        if (error) {
          console.error('❌ Error updating profile:', error)
          throw error
        }
        
        console.log('✅ Profile updated successfully in database')

        // Check profile completion status on every save
        if (isProfileComplete(newData)) {
          console.log('🔄 Profile is complete, updating onboarding progress')
          await updateOnboardingProgress(user.id, 'completed_profile')
        }

        // Only update auth user metadata if explicitly requested
        // This is what causes app-wide re-renders
        if (shouldUpdateAuthUser) {
          console.log('🔄 Updating auth user metadata (will cause re-render)')
          
          const userMetadata = {
            name: `${newData.firstName} ${newData.lastName}`.trim(),
          }
          
          const { error: updateError } = await supabase.auth.updateUser({
            data: userMetadata
          })
          
          if (updateError) {
            console.error('❌ Error updating auth user:', updateError)
            throw updateError
          }
          console.log('✅ Auth user metadata updated successfully')
          
          // Show success message ONLY for major updates
          setMessage({ type: 'success', content: 'Profile updated successfully' })
          setTimeout(() => {
            setMessage({ type: '', content: '' })
          }, 3000)
        }
      } catch (error) {
        console.error('❌ Error in debouncedSave:', error)
        setMessage({ type: 'error', content: 'Failed to save changes' })
      } finally {
        if (shouldUpdateAuthUser) {
          setSaving(false)
        }
      }
    }, 2000) // 2 second debounce
  }

  // Handle field changes without triggering full auth updates
  const handleFieldChange = (field, value) => {
    console.log(`⌨️ Field changed: ${field} = ${value}`)
    
    // Update the local state immediately
    setProfileData(prevData => {
      const newData = { ...prevData, [field]: value }
      
      // Special handling for name fields that need to update UI in other parts of app
      if (field === 'firstName' || field === 'lastName') {
        const firstName = field === 'firstName' ? value : newData.firstName
        const lastName = field === 'lastName' ? value : newData.lastName
        
        // Rate limit name updates
        const now = Date.now()
        const timeSinceLastUpdate = now - lastUpdatedNameTimeRef.current
        
        // If it's been at least 5 seconds since the last name update
        // dispatch an event to update UI components that display the name
        if (timeSinceLastUpdate > 5000) {
          console.log(`🔤 Triggering name update event: ${firstName} ${lastName}`)
          lastUpdatedNameTimeRef.current = now
          
          // Dispatch event for instant UI updates in other components
          window.dispatchEvent(new CustomEvent('profileNameUpdated', {
            detail: {
              firstName: firstName,
              lastName: lastName
            }
          }))
          
          // Schedule an auth update for the name change
          // This will cause app re-renders but only after a significant delay
          // and only for name changes which affect the UI
          console.log('📝 Scheduling auth update for name change (with 5-second delay)')
          setTimeout(() => {
            updateAuthUserNameOnly(firstName, lastName)
          }, 5000)
        }
      }
      
      // Schedule background save without auth update for most fields
      const isNameField = field === 'firstName' || field === 'lastName'
      const shouldUpdateAuth = false // We separately handle auth updates for names
      debouncedSave(newData, shouldUpdateAuth)
      
      return newData
    })
  }

  // Helper function to ONLY update the user's name in auth metadata
  // This will trigger re-renders but we only do it when necessary
  const updateAuthUserNameOnly = async (firstName, lastName) => {
    try {
      console.log(`🔄 Updating auth user name to: ${firstName} ${lastName}`)
      
      const { error } = await supabase.auth.updateUser({
        data: {
          name: `${firstName} ${lastName}`.trim()
        }
      })
      
      if (error) {
        console.error('❌ Error updating auth user name:', error)
      } else {
        console.log('✅ Auth user name updated successfully')
      }
    } catch (error) {
      console.error('❌ Error in updateAuthUserNameOnly:', error)
    }
  }

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setTempImage(URL.createObjectURL(file))
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
      })
      setShowCropDialog(true)
    }
  }

  const handleCropComplete = async () => {
    if (!completedCrop || !imageRef.current) return

    const canvas = document.createElement('canvas')
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height
    canvas.width = completedCrop.width
    canvas.height = completedCrop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    canvas.toBlob(
      async (blob) => {
        if (!blob) return

        try {
          console.log('🖼️ Starting profile picture upload')
          setSaving(true)
          const fileName = `${user.id}/profile.jpg`

          // Delete existing file first to ensure clean upload
          await supabase.storage.from('profile-pictures').remove([fileName])

          const { error: uploadError } = await supabase.storage.from('profile-pictures').upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true,
            cacheControl: 'no-cache',
          })

          if (uploadError) throw uploadError

          const { data: urlData } = await supabase.storage.from('profile-pictures').getPublicUrl(fileName)
          const publicUrl = urlData.publicUrl
          const newProfilePicture = `${publicUrl}?t=${new Date().getTime()}`

          console.log('🔄 Updating profile_picture in database')
          // Update account_profiles table
          const { error: updateError } = await supabase
            .from('account_profiles')
            .update({
              profile_picture: newProfilePicture,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          if (updateError) throw updateError

          setProfileData((prev) => ({
            ...prev,
            profilePicture: newProfilePicture,
            imageError: false,
          }))

          console.log('🔄 Updating auth user avatar_url')
          // Update auth user metadata
          await supabase.auth.updateUser({
            data: {
              avatar_url: newProfilePicture,
            },
          })

          // Dispatch custom event for instant TopBar update
          window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
            detail: { profilePicture: newProfilePicture }
          }))

          setShowCropDialog(false)
          setTempImage(null)
          setMessage({ type: 'success', content: 'Profile picture updated successfully' })
          setTimeout(() => {
            setMessage({ type: '', content: '' })
          }, 3000)
          
          console.log('✅ Profile picture updated successfully')
        } catch (error) {
          console.error('❌ Error uploading profile picture:', error)
          setMessage({
            type: 'error',
            content: error.message || 'Failed to upload profile picture',
          })
        } finally {
          setSaving(false)
        }
      },
      'image/jpeg',
      0.95
    )
  }

  // Profile Image component - Optimized to prevent unnecessary re-renders
  const ProfileImage = React.memo(({ src }) => {
    const [imgSrc, setImgSrc] = useState(src)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
      // Reset error state when src changes
      setHasError(false)
      
      // Only update image source if it actually changed
      if (src && src !== imgSrc) {
        // For Google profile pictures, don't add cache-busting parameter
        if (src.includes('googleusercontent.com')) {
          setImgSrc(src)
        } else {
          // For our own storage, add cache-busting parameter only on actual image changes
          const newSrc = `${src}${src.includes('?') ? '&' : '?'}t=${new Date().getTime()}`
          setImgSrc(newSrc)
        }
      }
    }, [src]) // Only re-run when src actually changes

    const handleImageError = () => {
      console.error('Error loading image from source:', imgSrc)
      setHasError(true)
      
      // Update profile data to indicate image error
      if (!profileData.imageError) {
        setProfileData((prev) => ({
          ...prev,
          imageError: true,
        }))
      }
    }

    // If there's an error or no source, show initials
    if (hasError || !imgSrc) {
      return (
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e2e8f0',
          }}
        >
          <Typography variant="h4" color="text.secondary">
            {profileData.firstName?.charAt(0)?.toUpperCase() || '?'}
          </Typography>
        </Box>
      )
    }

    return (
      <Box
        component="img"
        src={imgSrc}
        alt="Profile"
        loading="lazy"
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #e2e8f0',
          backgroundColor: '#f7fafc',
          display: 'block',
        }}
        onError={handleImageError}
      />
    )
  }, (prevProps, nextProps) => {
    // Simple comparison ignoring cache parameters
    if (!prevProps.src && !nextProps.src) return true;
    if (!prevProps.src || !nextProps.src) return false;
    
    // Strip cache busting parameters
    const cleanPrevSrc = prevProps.src.split('?')[0];
    const cleanNextSrc = nextProps.src.split('?')[0];
    return cleanPrevSrc === cleanNextSrc;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid hsl(var(--border))',
          mb: 3,
        }}
      >
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
              pl: 2.1,
            }}
          >
            Manage your account information and settings
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="var(--container-max-width)"
        sx={{
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-3)',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {message.content && (
          <Alert
            severity={message.type}
            sx={{
              mb: 2,
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 1000,
              transition: 'opacity 0.3s ease',
              opacity: message.content ? 1 : 0,
            }}
            onClose={() => setMessage({ type: '', content: '' })}
          >
            {message.content}
            {saving && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Alert>
        )}

        {/* Save indicator */}
        {saving && !message.content && (
          <Box 
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 'var(--radius)',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
            }}
          >
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Saving...
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 'var(--radius-lg)',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                {profileData.profilePicture ? (
                  <ProfileImage src={profileData.profilePicture} />
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      backgroundColor: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h3" color="white">
                      {profileData.firstName?.charAt(0)?.toUpperCase() || '?'}
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{
                    mt: 2,
                    color: 'hsl(var(--brand-primary))',
                    borderColor: 'hsl(var(--brand-primary))',
                    '&:hover': {
                      borderColor: 'hsl(var(--brand-primary-dark))',
                      backgroundColor: 'hsla(var(--brand-primary), 0.08)',
                    },
                  }}
                >
                  Change Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#000000' }}>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StandardTextField
                      fullWidth
                      label="First Name"
                      required
                      value={profileData.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StandardTextField
                      fullWidth
                      label="Last Name"
                      required
                      value={profileData.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StandardTextField 
                      fullWidth 
                      label="Email" 
                      value={profileData.email} 
                      disabled 
                      sx={{ mb: 2 }} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StandardTextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Location & Interests */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Location Information */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#000000' }}>
                    Location Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <StandardTextField
                        fullWidth
                        label="Street Address"
                        value={profileData.streetAddress}
                        onChange={(e) => handleFieldChange('streetAddress', e.target.value)}
                        helperText="Your City/State/Zip Code will help us provide location-specific resources"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StandardTextField
                        fullWidth
                        label="City"
                        required
                        value={profileData.city}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StandardSelect
                        value={profileData.state}
                        onChange={(e) => handleFieldChange('state', e.target.value)}
                        label="State"
                        required
                      >
                        {STATES.map((state) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </StandardSelect>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StandardTextField
                        fullWidth
                        label="ZIP Code"
                        required
                        value={profileData.zip}
                        onChange={(e) => handleFieldChange('zip', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StandardSelect
                        value={profileData.timezone}
                        onChange={(e) => handleFieldChange('timezone', e.target.value)}
                        label="Time Zone"
                        required
                      >
                        {TIMEZONES.map((zone) => (
                          <MenuItem key={zone} value={zone}>
                            {zone}
                          </MenuItem>
                        ))}
                      </StandardSelect>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Image Crop Dialog */}
        <Dialog open={showCropDialog} onClose={() => setShowCropDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogContent>
            {tempImage && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imageRef}
                  src={tempImage}
                  style={{ maxWidth: '100%' }}
                  alt="Crop"
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget
                    const crop = {
                      unit: '%',
                      width: 90,
                      height: 90,
                      x: 5,
                      y: 5,
                    }
                    setCrop(crop)
                  }}
                />
              </ReactCrop>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowCropDialog(false)
                setTempImage(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              variant="contained"
              disabled={!completedCrop?.width || !completedCrop?.height}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default AccountProfile
