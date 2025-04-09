import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { parseStateComplianceData } from '../utils/stateComplianceUtils';

const StateRegulationOverview = ({ userState }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedSection, setSelectedSection] = useState('overview');
    const [viewedSections, setViewedSections] = useState({
        overview: false,
        legalAvenues: false,
        recordKeeping: false,
        curriculum: false
    });
    const [stateData, setStateData] = useState({
        overview: '',
        legalAvenues: '',
        recordKeeping: '',
        curriculum: ''
    });
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
        fetchStateData();
    }, [user, userState]);

    const fetchStateData = async () => {
        try {
            setLoading(true);
            setError(null);
            const allStateData = await parseStateComplianceData();
            const currentStateData = allStateData[userState] || {};
            
            setStateData({
                overview: currentStateData.overview || '',
                legalAvenues: currentStateData.legalAvenues || '',
                recordKeeping: currentStateData.recordKeeping || '',
                curriculum: currentStateData.curriculum || ''
            });
        } catch (error) {
            console.error('Error fetching state data:', error);
            setError('Failed to load state compliance data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const { data, error } = await supabase
                .from('account_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            setUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const sections = [
        {
            id: 'overview',
            title: 'Overview',
            documentCount: 1
        },
        {
            id: 'legalAvenues',
            title: 'Legal Avenues for Homeschooling',
            documentCount: 1
        },
        {
            id: 'recordKeeping',
            title: 'Record-Keeping and Compliance',
            documentCount: 1
        },
        {
            id: 'curriculum',
            title: 'Curricular Expectations',
            documentCount: 1
        }
    ];

    // Helper function to safely render HTML content
    const renderHTML = (content) => {
        if (!content) return <Typography>No information available.</Typography>;
        return <div dangerouslySetInnerHTML={{ __html: content }} style={{ color: '#000000' }} />;
    };

    return (
        <Container
            maxWidth="var(--container-max-width)"
            sx={{
                py: 'var(--spacing-8)',
                px: 'var(--container-padding-x)',
                '@media (--tablet)': {
                    px: 'var(--container-padding-x-mobile)',
                },
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                minHeight: '600px'
            }}>
                {/* Left Sidebar */}
                <Box sx={{ 
                    width: '300px',
                    flexShrink: 0,
                    backgroundColor: 'white',
                    borderRadius: '8px 0 0 8px',
                    border: '1px solid hsl(var(--border))',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--muted))'
                    }}>
                        <Typography sx={{ 
                            color: '#000000',
                            fontWeight: 600,
                            fontSize: '1.125rem'
                        }}>
                            Sections
                        </Typography>
                    </Box>
                    <List sx={{ px: 2, py: 1.5 }}>
                        {sections.map((section) => (
                            <ListItem
                                key={section.id}
                                disablePadding
                            >
                                <ListItemButton
                                    selected={selectedSection === section.id}
                                    onClick={() => setSelectedSection(section.id)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: 'hsl(var(--brand-primary-light))',
                                            '&:hover': {
                                                backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                                            }
                                        },
                                        '&:hover': {
                                            backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                                                {section.title}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Right Content Area */}
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0 8px 8px 0',
                        border: '1px solid hsl(var(--border))',
                        borderLeft: 'none',
                        height: '100%'
                    }}>
                        <Box sx={{ 
                            p: 2, 
                            borderBottom: '1px solid hsl(var(--border))',
                            backgroundColor: 'hsl(var(--muted))'
                        }}>
                            <Typography sx={{ 
                                color: '#000000',
                                fontWeight: 600,
                                fontSize: '1.125rem'
                            }}>
                                {sections.find(section => section.id === selectedSection)?.title || 'Content'}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ p: 4 }}>
                            {error && (
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        mb: 2,
                                        borderRadius: 1,
                                        '& .MuiAlert-message': {
                                            color: '#e53e3e',
                                            fontSize: '0.875rem'
                                        }
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}
                            
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress size={32} sx={{ color: '#4299e1' }} />
                                </Box>
                            ) : (
                                <Box>
                                    {selectedSection === 'overview' && renderHTML(stateData.overview)}
                                    {selectedSection === 'legalAvenues' && renderHTML(stateData.legalAvenues)}
                                    {selectedSection === 'recordKeeping' && renderHTML(stateData.recordKeeping)}
                                    {selectedSection === 'curriculum' && renderHTML(stateData.curriculum)}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default StateRegulationOverview; 