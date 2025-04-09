import React, { useState, useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import { PageHeader } from '../components/ui/typography';
import GroupsSection from '../components/community/GroupsSection';
import QandASection from '../components/community/QandASection';
import { cardStyles } from '../styles/theme/components/cards';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PilotNotification from '../components/ui/PilotNotification';
import { BsEyeSlash } from 'react-icons/bs';

const Groups = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [myGroupsTab, setMyGroupsTab] = useState(0);

    // Get current tab from URL path
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.endsWith('/my-groups')) return 1;
        if (path.endsWith('/q-and-a')) return 2;
        return 0; // Default to explore tab
    };

    useEffect(() => {
        // If at root /groups path, redirect to /groups/explore
        if (location.pathname === '/groups') {
            navigate('/groups/explore', { replace: true });
        }
    }, [location.pathname, navigate]);

    const handleTabChange = (event, newValue) => {
        switch (newValue) {
            case 0:
                navigate('/groups/explore');
                break;
            case 1:
                navigate('/groups/my-groups');
                break;
            case 2:
                navigate('/groups/q-and-a');
                break;
            default:
                navigate('/groups/explore');
        }
    };

    const handleMyGroupsTabChange = (event, newValue) => {
        setMyGroupsTab(newValue);
    };

    // Base tabs that are always shown
    const baseTabs = [
        { label: 'Explore Groups', path: '/groups/explore' },
        { label: 'My Groups', path: '/groups/my-groups' }
    ];

    // Development-only tabs
    const devTabs = window.location.hostname === 'localhost' ? [
        { label: 'Public Q and A', path: '/groups/q-and-a', devOnly: true }
    ] : [];

    // Combine base tabs with dev-only tabs
    const allTabs = [...baseTabs, ...devTabs];

    return (
        <Box sx={{ minHeight: '100vh' }}>
            {/* Hero Section */}
            <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 0 }}>
                <Container 
                    maxWidth="var(--container-max-width)"
                    sx={{ 
                        position: 'relative',
                        px: 'var(--container-padding-x)',
                        py: 'var(--spacing-2)',
                        '@media (--tablet)': {
                            px: 'var(--container-padding-x-mobile)',
                        },
                    }}
                >
                    <Box sx={{ position: 'relative', height: '2.5rem' }}>
                        <PageHeader>Groups</PageHeader>
                        <PilotNotification message="Join the YourEDU Pilot Program group to test this feature! Other groups will be available soon." />
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Container 
                maxWidth="var(--container-max-width)"
                sx={{ 
                    px: 'var(--container-padding-x)',
                    pt: 'var(--spacing-2)',
                    pb: 'var(--spacing-4)',
                    '@media (--tablet)': {
                        px: 'var(--container-padding-x-mobile)',
                    },
                }}
            >
                <Paper 
                    elevation={0}
                    sx={{
                        ...cardStyles.feature,
                        mb: 'var(--spacing-4)',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {allTabs.map((tab, index) => (
                            <Link
                                key={index}
                                to={tab.path}
                                style={{ textDecoration: 'none' }}
                            >
                                <Box
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        color: getCurrentTab() === index ? 'hsl(var(--brand-primary))' : 'hsl(var(--text-secondary))',
                                        borderBottom: getCurrentTab() === index ? '2px solid hsl(var(--brand-primary))' : 'none',
                                        '&:hover': {
                                            color: 'hsl(var(--brand-primary))',
                                        },
                                        cursor: 'pointer',
                                        fontWeight: getCurrentTab() === index ? 600 : 500,
                                        fontSize: 'var(--font-size-base)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    {tab.label}
                                    {tab.devOnly && (
                                        <BsEyeSlash
                                            style={{
                                                fontSize: '14px',
                                                color: 'var(--warning-color, #f59e0b)',
                                            }}
                                        />
                                    )}
                                </Box>
                            </Link>
                        ))}
                    </Box>
                </Paper>

                {getCurrentTab() === 1 && (
                    <Paper 
                        elevation={0}
                        sx={{
                            ...cardStyles.feature,
                            mb: 'var(--spacing-4)',
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {[
                                { label: "Groups You're In", value: 0 },
                                { label: 'Pending Invites', value: 1 },
                                { label: 'Groups I Made', value: 2 }
                            ].map((tab) => (
                                <Box
                                    key={tab.value}
                                    onClick={() => handleMyGroupsTabChange(null, tab.value)}
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        color: myGroupsTab === tab.value ? 'hsl(var(--brand-primary))' : 'hsl(var(--text-secondary))',
                                        borderBottom: myGroupsTab === tab.value ? '2px solid hsl(var(--brand-primary))' : 'none',
                                        '&:hover': {
                                            color: 'hsl(var(--brand-primary))',
                                        },
                                        cursor: 'pointer',
                                        fontWeight: myGroupsTab === tab.value ? 600 : 500,
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    {tab.label}
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}

                {getCurrentTab() !== 2 && (
                    <GroupsSection 
                        view={getCurrentTab() === 0 ? 'explore' : getCurrentTab() === 1 ? 'my-groups' : null} 
                        myGroupsView={myGroupsTab === 0 ? 'joined' : myGroupsTab === 1 ? 'pending' : 'created'} 
                        sourceTab={getCurrentTab() === 1 ? 'my-groups' : getCurrentTab() === 0 ? 'explore' : null}
                    />
                )}
                
                {getCurrentTab() === 2 && <QandASection />}
            </Container>
        </Box>
    );
};

export default Groups; 