import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Add as AddIcon,
    CreditCard as CreditCardIcon,
    Notifications as NotificationsIcon,
    Link as LinkIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import PageHeader from '../components/PageHeader';
import DescriptiveText from '../components/DescriptiveText';
import { cardStyles } from '../styles/theme/components/cards';

// Define constants for form fields
const ACCOUNT_TYPES = ['Parent', 'Student', 'Teacher', 'Administrator'];
const ACCOUNT_STATUS = ['Active', 'View Only', 'Suspended'];
const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const TIMEZONES = [
    'Eastern Time (ET)',
    'Central Time (CT)',
    'Mountain Time (MT)',
    'Pacific Time (PT)',
    'Alaska Time (AKT)',
    'Hawaii-Aleutian Time (HAT)',
];
const EDUCATION_LEVELS = [
    'Some High School',
    'High School Graduate',
    'Some College',
    'Associate Degree',
    'Bachelor Degree',
    'Master Degree',
    'Doctorate',
    'Other'
];

const INTERESTS = {
    'Academics': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'History', 'Geography', 'Economics', 'Philosophy'],
    'Arts': ['Visual Arts', 'Music', 'Dance', 'Theater', 'Photography', 'Film'],
    'Sports': ['Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'Swimming', 'Track & Field', 'Volleyball'],
    'Extracurricular': ['Debate Club', 'Student Government', 'Chess Club', 'Robotics', 'Environmental Club'],
    'Personal Development': ['Leadership', 'Public Speaking', 'Time Management', 'Study Skills'],
    'Religion & Spirituality': ['Christianity', 'Judaism', 'Islam', 'Buddhism', 'Hinduism', 'Spirituality'],
    'Other': ['Travel', 'Cooking', 'Gaming', 'Reading', 'Writing', 'Technology'],
};

const MyAccount = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [expanded, setExpanded] = useState('profile'); // Default expanded panel
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        age: '',
        educationLevel: '',
        streetAddress: '',
        city: '',
        state: '',
        zip: '',
        timezone: '',
        phoneNumber: '',
        profilePicture: '',
        accountType: 'Parent',
        accountStatus: 'Active',
        interests: [],
        imageError: false,
        yearsHomeschooling: user?.user_metadata?.years_homeschooling || ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [showLinkAccount, setShowLinkAccount] = useState(false);
    const [linkAccountData, setLinkAccountData] = useState({
        name: '',
        birthday: '',
        gradeLevel: '',
        email: '',
    });
    const [notificationSettings, setNotificationSettings] = useState({
        allEmails: true,
        dailyDigest: false,
        weeklyDigest: true,
        smsNotifications: false,
    });
    const [crop, setCrop] = useState({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
    });
    const [showCropDialog, setShowCropDialog] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const imageRef = useRef(null);
    const [completedCrop, setCompletedCrop] = useState(null);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            // First try to fetch existing profile
            let { data, error } = await supabase
                .from('account_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            // If no profile exists, create one
            if (error && error.code === 'PGRST116') {
                const { data: newProfile, error: insertError } = await supabase
                    .from('account_profiles')
                    .insert([{
                        id: user?.id,
                        name: user?.user_metadata?.name || user?.email,
                        email: user?.email,
                        account_type: 'Parent',
                        account_status: 'Active',
                        interests: [],
                        education_level: '',
                        street_address: '',
                        city: '',
                        state: '',
                        zip: '',
                        timezone: '',
                        phone_number: '',
                        profile_picture: '',
                        age: null,
                        years_homeschooling: user?.user_metadata?.years_homeschooling || ''
                    }])
                    .select()
                    .single();

                if (insertError) {
                    console.error('Insert error:', insertError);
                    throw insertError;
                }
                data = newProfile;
            } else if (error) {
                console.error('Fetch error:', error);
                throw error;
            }

            if (data) {
                // Get the profile picture URL if it exists
                let profilePictureUrl = '';
                if (data.profile_picture) {
                    const { data: urlData } = supabase.storage
                        .from('profile-pictures')
                        .getPublicUrl(`${user.id}/profile.jpg`);
                    // Add timestamp to force cache refresh
                    profilePictureUrl = `${urlData?.publicUrl}?t=${new Date().getTime()}` || '';
                }

                // Clear the old image from browser cache
                if (profileData.profilePicture) {
                    const oldImage = new Image();
                    oldImage.src = profileData.profilePicture;
                    oldImage.onload = () => {
                        // Force browser to forget the old image
                        oldImage.src = '';
                    };
                }

                setProfileData({
                    name: data.name,
                    email: data.email,
                    age: data.age,
                    educationLevel: data.education_level,
                    streetAddress: data.street_address,
                    city: data.city,
                    state: data.state,
                    zip: data.zip,
                    timezone: data.timezone,
                    phoneNumber: data.phone_number,
                    profilePicture: profilePictureUrl,
                    accountType: data.account_type,
                    accountStatus: data.account_status,
                    interests: data.interests || [],
                    imageError: false,
                    yearsHomeschooling: data.years_homeschooling || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', content: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('account_profiles')
                .upsert({
                    id: user?.id,
                    name: profileData.name,
                    email: profileData.email,
                    age: profileData.age,
                    education_level: profileData.educationLevel,
                    street_address: profileData.streetAddress,
                    city: profileData.city,
                    state: profileData.state,
                    zip: profileData.zip,
                    timezone: profileData.timezone,
                    phone_number: profileData.phoneNumber,
                    profile_picture: profileData.profilePicture,
                    account_type: profileData.accountType,
                    account_status: profileData.accountStatus,
                    interests: profileData.interests,
                    years_homeschooling: profileData.yearsHomeschooling,
                    updated_at: new Date()
                });

            if (error) throw error;

            // Update user metadata
            await supabase.auth.updateUser({
                data: {
                    name: profileData.name,
                    avatar_url: profileData.profilePicture,
                    years_homeschooling: profileData.yearsHomeschooling
                }
            });

            setMessage({ type: 'success', content: 'Profile updated successfully' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', content: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email);
            if (error) throw error;
            setMessage({ type: 'success', content: 'Password reset email sent' });
            setShowPasswordReset(false);
        } catch (error) {
            console.error('Error resetting password:', error);
            setMessage({ type: 'error', content: 'Failed to send password reset email' });
        }
    };

    const handleLinkAccount = async () => {
        try {
            // This will be implemented later with email functionality
            console.log('Link account data:', linkAccountData);
            setMessage({ type: 'success', content: 'Account link request sent' });
            setShowLinkAccount(false);
        } catch (error) {
            console.error('Error linking account:', error);
            setMessage({ type: 'error', content: 'Failed to send account link request' });
        }
    };

    const handleInterestToggle = (interest) => {
        setProfileData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest],
        }));
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleImageUpload = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setTempImage(URL.createObjectURL(file));
            setCrop({
                unit: '%',
                width: 90,
                height: 90,
                x: 5,
                y: 5
            });
            setShowCropDialog(true);
        }
    };

    const handleCropComplete = async () => {
        if (!completedCrop || !imageRef.current) return;

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

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
        );

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            try {
                setSaving(true);
                // Create a path that includes the user ID as a folder
                const fileName = `${user.id}/profile.jpg`;
                
                // Delete existing profile picture if it exists
                try {
                    const { data: existingFiles } = await supabase.storage
                        .from('profile-pictures')
                        .list(user.id);
                    
                    if (existingFiles?.length > 0) {
                        await supabase.storage
                            .from('profile-pictures')
                            .remove(existingFiles.map(file => `${user.id}/${file.name}`));
                    }
                } catch (error) {
                    console.log('No existing profile picture to delete');
                }

                // Upload new profile picture
                const { error: uploadError } = await supabase.storage
                    .from('profile-pictures')
                    .upload(fileName, blob, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                // Get public URL with timestamp to prevent caching
                const { data: urlData } = supabase.storage
                    .from('profile-pictures')
                    .getPublicUrl(fileName);

                if (!urlData?.publicUrl) {
                    throw new Error('Failed to get public URL for uploaded image');
                }

                const timestamp = new Date().getTime();
                const publicUrl = `${urlData.publicUrl}?t=${timestamp}`;

                // First update Supabase
                const [{ error: profileError }, { error: userError }] = await Promise.all([
                    supabase
                        .from('account_profiles')
                        .update({ profile_picture: publicUrl })
                        .eq('id', user.id),
                    supabase.auth.updateUser({
                        data: {
                            avatar_url: publicUrl
                        }
                    })
                ]);

                if (profileError) throw profileError;
                if (userError) throw userError;

                // Then update local state immediately
                setProfileData(prev => ({
                    ...prev,
                    profilePicture: publicUrl,
                    imageError: false
                }));

                setShowCropDialog(false);
                setTempImage(null);
                setMessage({ type: 'success', content: 'Profile picture updated successfully' });

                // Force immediate re-fetch of profile data
                await fetchProfileData();
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                setMessage({ 
                    type: 'error', 
                    content: error.message || 'Failed to upload profile picture'
                });
            } finally {
                setSaving(false);
            }
        }, 'image/jpeg', 0.95);
    };

    const renderSection = (id, title, icon, content) => (
        <Accordion 
            expanded={expanded === id} 
            onChange={handleAccordionChange(id)}
            sx={{
                mb: 2,
                border: '1px solid #e2e8f0',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: 'none',
                '&:hover': {
                    borderColor: '#cbd5e0',
                },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 53, 107, 0.02)',
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {icon}
                    <Typography 
                        variant="h6"
                        sx={{ 
                            fontWeight: 600,
                            color: '#2d3748',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, backgroundColor: 'white' }}>
                {content}
            </AccordionDetails>
        </Accordion>
    );

    // Update the profile image component to force reload when src changes
    const ProfileImage = ({ src }) => {
        const [key, setKey] = useState(0);
        
        useEffect(() => {
            setKey(prev => prev + 1);
        }, [src]);

        return (
            <Box
                component="img"
                key={key}
                src={src}
                alt="Profile"
                loading="lazy"
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#f7fafc',
                    display: 'block'
                }}
                onError={(e) => {
                    console.error('Error loading image:', e);
                    setTimeout(() => {
                        if (!profileData.imageError) {
                            setProfileData(prev => ({
                                ...prev,
                                imageError: true
                            }));
                        }
                    }, 1000);
                }}
            />
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

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
                        My Account
                    </PageHeader>
                    <DescriptiveText sx={{ maxWidth: 'var(--text-max-width)' }}>
                        Manage your account settings, profile information, and preferences. Keep your educational journey organized.
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
                {message.content && (
                    <Alert 
                        severity={message.type} 
                        sx={{ mb: 2 }}
                        onClose={() => setMessage({ type: '', content: '' })}
                    >
                        {message.content}
                    </Alert>
                )}

                {renderSection('profile', 'Profile Information', <SettingsIcon />, (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {profileData.profilePicture ? (
                                    <ProfileImage src={profileData.profilePicture} />
                                ) : (
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: '50%',
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="h4" color="text.secondary">
                                            {profileData.name?.charAt(0)?.toUpperCase() || '?'}
                                        </Typography>
                                    </Box>
                                )}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={!isEditing}
                                    sx={{
                                        color: '#00356b',
                                        borderColor: '#00356b',
                                        '&:hover': {
                                            borderColor: '#002548',
                                            backgroundColor: 'rgba(0, 53, 107, 0.08)',
                                        },
                                    }}
                                >
                                    Upload Photo
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </Button>
                            </Box>
                            <Button 
                                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                disabled={saving}
                                variant={isEditing ? "contained" : "outlined"}
                                sx={{ 
                                    backgroundColor: isEditing ? '#00356b' : 'transparent',
                                    color: isEditing ? 'white' : '#00356b',
                                    borderColor: '#00356b',
                                    '&:hover': {
                                        backgroundColor: isEditing ? '#002548' : 'rgba(0, 53, 107, 0.08)',
                                        borderColor: '#002548',
                                    },
                                }}
                            >
                                {saving ? <CircularProgress size={24} /> : (isEditing ? 'Save Changes' : 'Edit Profile')}
                            </Button>
                        </Box>
                        
                        {/* Image Crop Dialog */}
                        <Dialog 
                            open={showCropDialog} 
                            onClose={() => setShowCropDialog(false)}
                            maxWidth="md"
                            fullWidth
                        >
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
                                                const { width, height } = e.currentTarget;
                                                const crop = {
                                                    unit: '%',
                                                    width: 90,
                                                    height: 90,
                                                    x: 5,
                                                    y: 5
                                                };
                                                setCrop(crop);
                                            }}
                                        />
                                    </ReactCrop>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    setShowCropDialog(false);
                                    setTempImage(null);
                                }}>
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
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    disabled={!isEditing}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={profileData.email}
                                    disabled
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Age"
                                    type="number"
                                    value={profileData.age}
                                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                    disabled={!isEditing}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Years Homeschooling"
                                    type="number"
                                    value={profileData.yearsHomeschooling}
                                    onChange={(e) => setProfileData({ ...profileData, yearsHomeschooling: e.target.value })}
                                    disabled={!isEditing}
                                    sx={{ mb: 2 }}
                                />
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Education Level</InputLabel>
                                    <Select
                                        value={profileData.educationLevel}
                                        onChange={(e) => setProfileData({ ...profileData, educationLevel: e.target.value })}
                                        disabled={!isEditing}
                                        label="Education Level"
                                    >
                                        {EDUCATION_LEVELS.map((level) => (
                                            <MenuItem key={level} value={level}>{level}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Street Address"
                                    value={profileData.streetAddress}
                                    onChange={(e) => setProfileData({ ...profileData, streetAddress: e.target.value })}
                                    disabled={!isEditing}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="City"
                                    value={profileData.city}
                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                    disabled={!isEditing}
                                    sx={{ mb: 2 }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>State</InputLabel>
                                            <Select
                                                value={profileData.state}
                                                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                                disabled={!isEditing}
                                                label="State"
                                            >
                                                {STATES.map((state) => (
                                                    <MenuItem key={state} value={state}>{state}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="ZIP Code"
                                            value={profileData.zip}
                                            onChange={(e) => setProfileData({ ...profileData, zip: e.target.value })}
                                            disabled={!isEditing}
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                </Grid>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Time Zone</InputLabel>
                                    <Select
                                        value={profileData.timezone}
                                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                                        disabled={!isEditing}
                                        label="Time Zone"
                                    >
                                        {TIMEZONES.map((zone) => (
                                            <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={profileData.phoneNumber}
                                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                    disabled={!isEditing}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2,
                                        fontWeight: 600,
                                        color: '#2d3748',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    User Interests
                                </Typography>
                                {Object.entries(INTERESTS).map(([category, interests]) => (
                                    <Box key={category} sx={{ mb: 3 }}>
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                mb: 1,
                                                fontWeight: 600,
                                                color: '#4a5568',
                                            }}
                                        >
                                            {category}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {interests.map((interest) => (
                                                <Chip
                                                    key={interest}
                                                    label={interest}
                                                    onClick={() => isEditing && handleInterestToggle(interest)}
                                                    color={profileData.interests.includes(interest) ? "primary" : "default"}
                                                    sx={{
                                                        backgroundColor: profileData.interests.includes(interest) 
                                                            ? '#00356b' 
                                                            : 'transparent',
                                                        color: profileData.interests.includes(interest) 
                                                            ? 'white' 
                                                            : '#718096',
                                                        border: '1px solid',
                                                        borderColor: profileData.interests.includes(interest) 
                                                            ? '#00356b' 
                                                            : '#e2e8f0',
                                                        '&:hover': {
                                                            backgroundColor: profileData.interests.includes(interest) 
                                                                ? '#002548' 
                                                                : 'rgba(0, 53, 107, 0.08)',
                                                            cursor: isEditing ? 'pointer' : 'default',
                                                        },
                                                        cursor: isEditing ? 'pointer' : 'default',
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Grid>
                        </Grid>
                    </>
                ))}

                {renderSection('account', 'Account Settings', <SettingsIcon />, (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Account Type</InputLabel>
                                <Select
                                    value={profileData.accountType}
                                    onChange={(e) => setProfileData({ ...profileData, accountType: e.target.value })}
                                    disabled={!isEditing}
                                    label="Account Type"
                                >
                                    {ACCOUNT_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Account Status</InputLabel>
                                <Select
                                    value={profileData.accountStatus}
                                    onChange={(e) => setProfileData({ ...profileData, accountStatus: e.target.value })}
                                    disabled={!isEditing}
                                    label="Account Status"
                                >
                                    {ACCOUNT_STATUS.map((status) => (
                                        <MenuItem key={status} value={status}>{status}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button 
                                variant="outlined"
                                onClick={() => setShowPasswordReset(true)}
                                sx={{ 
                                    color: '#00356b',
                                    borderColor: '#00356b',
                                    '&:hover': {
                                        borderColor: '#002548',
                                        backgroundColor: 'rgba(0, 53, 107, 0.08)',
                                    },
                                }}
                            >
                                Reset Password
                            </Button>
                        </Grid>
                    </Grid>
                ))}

                {renderSection('linking', 'Account Linking', <LinkIcon />, (
                    <Box>
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            onClick={() => setShowLinkAccount(true)}
                            sx={{
                                backgroundColor: '#00356b',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#002548',
                                },
                            }}
                        >
                            Link New Account
                        </Button>
                    </Box>
                ))}

                {renderSection('notifications', 'Notification Settings', <NotificationsIcon />, (
                    <Grid container spacing={2}>
                        {Object.entries(notificationSettings).map(([key, value]) => (
                            <Grid item xs={12} key={key}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={value}
                                            onChange={(e) => setNotificationSettings(prev => ({
                                                ...prev,
                                                [key]: e.target.checked
                                            }))}
                                            disabled={!isEditing}
                                        />
                                    }
                                    label={key.split(/(?=[A-Z])/).join(' ')}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ))}

                {renderSection('billing', 'Billing and Subscriptions', <CreditCardIcon />, (
                    <Box>
                        <Button
                            startIcon={<CreditCardIcon />}
                            variant="contained"
                            onClick={() => {/* Navigate to subscription page */}}
                            sx={{
                                backgroundColor: '#00356b',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#002548',
                                },
                            }}
                        >
                            Manage Subscription
                        </Button>
                    </Box>
                ))}

                {/* Password Reset Dialog */}
                <Dialog 
                    open={showPasswordReset} 
                    onClose={() => setShowPasswordReset(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            maxWidth: 400,
                        }
                    }}
                >
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to reset your password? An email will be sent to your registered email address.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowPasswordReset(false)}>Cancel</Button>
                        <Button onClick={handlePasswordReset} variant="contained">
                            Send Reset Email
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Link Account Dialog */}
                <Dialog 
                    open={showLinkAccount} 
                    onClose={() => setShowLinkAccount(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            maxWidth: 500,
                        }
                    }}
                >
                    <DialogTitle>Link New Account</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={linkAccountData.name}
                                    onChange={(e) => setLinkAccountData({ ...linkAccountData, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Birthday"
                                    type="date"
                                    value={linkAccountData.birthday}
                                    onChange={(e) => setLinkAccountData({ ...linkAccountData, birthday: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Grade Level"
                                    value={linkAccountData.gradeLevel}
                                    onChange={(e) => setLinkAccountData({ ...linkAccountData, gradeLevel: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={linkAccountData.email}
                                    onChange={(e) => setLinkAccountData({ ...linkAccountData, email: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowLinkAccount(false)}>Cancel</Button>
                        <Button onClick={handleLinkAccount} variant="contained">
                            Send Link Request
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default MyAccount;
