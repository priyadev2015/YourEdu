import React, { useState } from 'react';
import {
    Box,
    Container,
    Card,
    Grid,
    Switch,
    Typography,
    FormGroup,
    FormControlLabel,
    Divider,
    Alert,
    IconButton,
    Collapse,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Email as EmailIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { SectionHeader, DescriptiveText, BodyText } from '../components/ui/typography';
import { cardStyles } from '../styles/theme/components/cards';

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        dailyDigest: false,
        weeklyDigest: true,
        smsNotifications: false,
        pushNotifications: true,
        courseUpdates: true,
        eventReminders: true,
        communityActivity: false,
        marketplaceAlerts: true,
    });

    const [showAlert, setShowAlert] = useState(false);

    const handleChange = (setting) => {
        setSettings(prev => {
            const newSettings = {
                ...prev,
                [setting]: !prev[setting]
            };
            setShowAlert(true);
            return newSettings;
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
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
                    <DescriptiveText sx={{ maxWidth: 'var(--text-max-width)' }}>
                        Customize how and when you receive notifications.
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
                <Collapse in={showAlert}>
                    <Alert 
                        severity="success"
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => setShowAlert(false)}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                        sx={{ mb: 3 }}
                    >
                        Notification settings updated successfully
                    </Alert>
                </Collapse>

                <Grid container spacing={3}>
                    {/* Email Notifications */}
                    <Grid item xs={12} md={6}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <EmailIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                                <SectionHeader>Email Preferences</SectionHeader>
                            </Box>

                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={settings.emailNotifications}
                                            onChange={() => handleChange('emailNotifications')}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <BodyText>All Emails</BodyText>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive all email notifications
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <Divider sx={{ my: 2 }} />

                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={settings.dailyDigest}
                                            onChange={() => handleChange('dailyDigest')}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <BodyText>Daily Digest</BodyText>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive a daily summary of activities
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <Divider sx={{ my: 2 }} />

                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={settings.weeklyDigest}
                                            onChange={() => handleChange('weeklyDigest')}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <BodyText>Weekly Digest</BodyText>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive a weekly summary of activities
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </FormGroup>
                        </Card>
                    </Grid>

                    {/* Other Notifications */}
                    <Grid item xs={12} md={6}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <NotificationsIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                                <SectionHeader>Other Notifications</SectionHeader>
                            </Box>

                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={settings.smsNotifications}
                                            onChange={() => handleChange('smsNotifications')}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <BodyText>SMS Notifications</BodyText>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive important updates via text message
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <Divider sx={{ my: 2 }} />

                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={settings.pushNotifications}
                                            onChange={() => handleChange('pushNotifications')}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <BodyText>Push Notifications</BodyText>
                                            <Typography variant="body2" color="text.secondary">
                                                Receive browser notifications
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </FormGroup>

                            <Box sx={{ mt: 4 }}>
                                <SectionHeader sx={{ mb: 2, fontSize: '1rem' }}>Notification Categories</SectionHeader>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                checked={settings.courseUpdates}
                                                onChange={() => handleChange('courseUpdates')}
                                            />
                                        }
                                        label="Course Updates"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                checked={settings.eventReminders}
                                                onChange={() => handleChange('eventReminders')}
                                            />
                                        }
                                        label="Event Reminders"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                checked={settings.communityActivity}
                                                onChange={() => handleChange('communityActivity')}
                                            />
                                        }
                                        label="Community Activity"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                checked={settings.marketplaceAlerts}
                                                onChange={() => handleChange('marketplaceAlerts')}
                                            />
                                        }
                                        label="Marketplace Alerts"
                                    />
                                </FormGroup>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default NotificationSettings; 
