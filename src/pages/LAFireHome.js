import React, { useState } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box,
    Button,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import ChatBot from '../components/ChatBot';

const LAFireHome = () => {
    const { user } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
        <Container maxWidth="lg" sx={{ py: 2, pl: 2 }}>
            {/* Welcome Banner */}
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: '#2B6CB0',
                    color: 'white'
                }}
            >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Welcome, {firstName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    We're here to support families affected by the LA fires with free education assistance. 
                    Our team is ready to help you navigate homeschooling, community college enrollment, 
                    and other educational options during this challenging time.
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    For immediate assistance, please use any of the contact options below.
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                {/* Quick Links Section */}
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            height: '100%',
                            backgroundColor: '#f8fafc'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: '#2B6CB0', fontWeight: 600 }}>
                            Quick Links
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button 
                                component={Link} 
                                to="/ca-psa"
                                variant="outlined"
                                sx={{ 
                                    justifyContent: 'flex-start',
                                    color: '#2B6CB0',
                                    borderColor: '#2B6CB0',
                                    '&:hover': {
                                        borderColor: '#2B6CB0',
                                        backgroundColor: '#EBF8FF'
                                    }
                                }}
                            >
                                File CA Private School Affidavit
                            </Button>
                            <Button 
                                component={Link}
                                to="/community-colleges"
                                variant="outlined"
                                sx={{ 
                                    justifyContent: 'flex-start',
                                    color: '#2B6CB0',
                                    borderColor: '#2B6CB0',
                                    '&:hover': {
                                        borderColor: '#2B6CB0',
                                        backgroundColor: '#EBF8FF'
                                    }
                                }}
                            >
                                Browse Local Community Colleges
                            </Button>
                            <Button 
                                component={Link}
                                to="/courses"
                                variant="outlined"
                                sx={{ 
                                    justifyContent: 'flex-start',
                                    color: '#2B6CB0',
                                    borderColor: '#2B6CB0',
                                    '&:hover': {
                                        borderColor: '#2B6CB0',
                                        backgroundColor: '#EBF8FF'
                                    }
                                }}
                            >
                                Explore Online Course Options
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Resources Section */}
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            height: '100%',
                            backgroundColor: '#f8fafc'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: '#2B6CB0', fontWeight: 600 }}>
                            Available Resources
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ p: 2, backgroundColor: '#EBF8FF', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#2B6CB0', fontWeight: 600 }}>
                                    Local Community Colleges
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#2B6CB0', mt: 1 }}>
                                    LACC, Glendale CC, LA Southwest College, LA Trade Tech
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, backgroundColor: '#EBF8FF', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#2B6CB0', fontWeight: 600 }}>
                                    Testing Support
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#2B6CB0', mt: 1 }}>
                                    AP Tests, SATs, and other standardized testing information
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Contact Section */}
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3, 
                    mt: 3,
                    borderRadius: 2,
                    backgroundColor: '#f8fafc'
                }}
            >
                <Typography variant="h6" sx={{ color: '#2d3748', fontWeight: 600, mb: 2 }}>
                    How can we help you today?
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<ChatIcon />}
                            onClick={() => setIsChatOpen(true)}
                            sx={{ 
                                py: 1.5,
                                borderColor: '#2B6CB0',
                                color: '#2B6CB0',
                                '&:hover': {
                                    borderColor: '#2B6CB0',
                                    backgroundColor: '#EBF8FF'
                                }
                            }}
                        >
                            Chat Now
                            <Box 
                                component="span" 
                                sx={{ 
                                    ml: 1,
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1,
                                    backgroundColor: '#DEF7EC',
                                    color: '#057A55',
                                    fontSize: '0.75rem'
                                }}
                            >
                                Available
                            </Box>
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<EmailIcon />}
                            component="a"
                            href="mailto:lafire@youredu.school"
                            sx={{ 
                                py: 1.5,
                                borderColor: '#2B6CB0',
                                color: '#2B6CB0',
                                '&:hover': {
                                    borderColor: '#2B6CB0',
                                    backgroundColor: '#EBF8FF'
                                }
                            }}
                        >
                            Email Us
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<PhoneIcon />}
                            component="a"
                            href="tel:+1234567890"
                            sx={{ 
                                py: 1.5,
                                borderColor: '#2B6CB0',
                                color: '#2B6CB0',
                                '&:hover': {
                                    borderColor: '#2B6CB0',
                                    backgroundColor: '#EBF8FF'
                                }
                            }}
                        >
                            Call Us
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* LA Strong Logo */}
            <Box 
                sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: 4,
                    mb: 2
                }}
            >
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: '#2B6CB0',
                        opacity: 0.9,
                        fontStyle: 'italic',
                        letterSpacing: '0.02em'
                    }}
                >
                    Supporting the Los Angeles community through education
                </Typography>
            </Box>

            <ChatBot 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
            />
        </Container>
    );
};

export default LAFireHome; 