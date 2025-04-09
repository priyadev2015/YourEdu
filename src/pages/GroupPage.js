import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import {
    Box,
    Container,
    Typography,
    Button,
    Avatar,
    Paper,
    Tabs,
    Tab,
    TextField,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    Lock as LockIcon,
    Public as PublicIcon,
    Group as GroupIcon,
    Description as DescriptionIcon,
    Send as SendIcon,
    ArrowBack as ArrowBackIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { fetchGroupById, fetchGroupPosts, createGroupPost, getGroupMembers } from '../utils/supabase/groups';
import AuthWrapper from '../components/AuthWrapper';

const GroupPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [currentTab, setCurrentTab] = useState('discussions');
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [targetPath, setTargetPath] = useState('');
    const [members, setMembers] = useState([]);

    useEffect(() => {
        fetchGroupData();
    }, [groupId]);

    useEffect(() => {
        if (currentTab === 'members' && group) {
            fetchMembers();
        }
    }, [currentTab, group]);

    const fetchGroupData = async () => {
        setLoading(true);
        try {
            const groupData = await fetchGroupById(groupId);
            setGroup(groupData);
            
            if (currentTab === 'discussions') {
                const postsData = await fetchGroupPosts(groupId);
                setPosts(postsData);
            }
        } catch (error) {
            console.error('Error fetching group data:', error);
            setError('Failed to load group data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const membersData = await getGroupMembers(groupId);
            setMembers(membersData);
        } catch (error) {
            console.error('Error fetching members:', error);
            setError('Failed to load members. Please try again later.');
        }
    };

    const handleInteraction = (path) => {
        if (!user) {
            setShowRegistrationPrompt(true);
            return true;
        }
        return false;
    };

    const handleTabChange = (event, newValue) => {
        if (handleInteraction(`/groups/${groupId}?tab=${newValue}`)) return;
        setCurrentTab(newValue);
        if (newValue === 'discussions') {
            fetchGroupData();
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;

        try {
            const post = await createGroupPost(groupId, newPost);
            setPosts([post, ...posts]);
            setNewPost('');
            setSnackbar({
                open: true,
                message: 'Post created successfully!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error creating post:', error);
            setSnackbar({
                open: true,
                message: 'Failed to create post. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setSnackbar({
            open: true,
            message: 'Group link copied to clipboard!',
            severity: 'success'
        });
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/my-account`,
                    data: {
                        targetPath: window.location.pathname
                    }
                }
            });

            if (error) throw error;

            setSnackbar({
                open: true,
                message: 'Check your email for a login link!',
                severity: 'success'
            });
            handleClose();
        } catch (error) {
            console.error('Error sending magic link:', error);
            setSnackbar({
                open: true,
                message: error.message,
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setShowRegistrationPrompt(false);
        }
    };

    const handleBack = () => {
        // Get the source tab from URL search params
        const searchParams = new URLSearchParams(location.search);
        const sourceTab = searchParams.get('source');
        
        // Map source to tab index in Groups.js
        const tabMapping = {
            'my-groups': 1,    // "My Groups" tab index
            'explore': 2       // "Explore Groups" tab index
        };
        
        // Navigate back to Groups with the correct tab
        navigate(`/groups${sourceTab ? `?tab=${tabMapping[sourceTab]}` : ''}`);
    };

    const renderTabContent = () => {
        switch (currentTab) {
            case 'discussion':
    return (
                                <Box>
                                    <AuthWrapper>
                            <Paper sx={{ 
                                p: 2, 
                                mb: 3,
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                placeholder="Start a discussion..."
                                                value={newPost}
                                                onChange={(e) => setNewPost(e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="contained"
                                                    endIcon={<SendIcon />}
                                                    onClick={handleCreatePost}
                                                    disabled={!newPost.trim()}
                                                    sx={{
                                            bgcolor: 'hsl(var(--brand-primary))',
                                            '&:hover': { bgcolor: 'hsl(var(--brand-primary-hover))' },
                                                    }}
                                                >
                                                    Post
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </AuthWrapper>

                                    {posts.map((post) => (
                            <Paper key={post.id} sx={{ 
                                p: 2, 
                                mb: 2,
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                            bgcolor: post.author?.avatar_color || 'hsl(var(--brand-primary))',
                                                        mr: 1
                                                    }}
                                                >
                                                    {post.author?.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        {post.author?.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="body1">{post.content}</Typography>
                                        </Paper>
                                    ))}
                                </Box>
                );
            case 'members':
                return (
                    <Paper sx={{ 
                        p: 3,
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'hsl(var(--text-primary))' }}>
                            Group Members ({members.length})
                        </Typography>
                        <List>
                            {members.map((member) => (
                                <ListItem 
                                    key={member.user_id}
                                    sx={{ 
                                        py: 1.5,
                                        '&:hover': { 
                                            backgroundColor: 'hsl(var(--muted))',
                                            borderRadius: 'var(--radius-sm)',
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{
                                                bgcolor: member.profiles?.avatar_color || 'hsl(var(--brand-primary))',
                                                width: 48,
                                                height: 48
                                            }}
                                        >
                                            {member.profiles?.name?.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ 
                                                fontWeight: 600,
                                                color: 'hsl(var(--text-primary))'
                                            }}>
                                                {member.profiles?.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" sx={{ color: 'hsl(var(--text-secondary))' }}>
                                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!group) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography variant="h6" color="error">
                    {error || 'Group not found'}
                </Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, md: 3 } }}>
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ 
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                >
                    Back to Groups
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : group && (
                <>
                    {/* Group Header */}
                    <Paper 
                        elevation={0}
                        sx={{ 
                            borderRadius: 2,
                            overflow: 'hidden',
                            mb: 3,
                            position: 'relative',
                            bgcolor: 'background.paper'
                        }}
                    >
                        {/* Landscape Image */}
                        <Box sx={{ 
                            position: 'relative',
                            height: { xs: 200, md: 300 },
                            bgcolor: 'grey.100'
                        }}>
                            {group.landscape_image ? (
                                <Box
                                    component="img"
                                    src={group.landscape_image}
                                    alt={group.name}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <Box 
                                    sx={{ 
                                        width: '100%',
                                        height: '100%',
                                        bgcolor: 'grey.200',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <DescriptionIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                                </Box>
                            )}
                            {/* Overlay gradient */}
                            <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '50%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))'
                            }} />
                        </Box>

                        {/* Group Info Section */}
                        <Box sx={{ 
                            p: { xs: 2, md: 3 },
                            mt: -8,
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {/* Profile Image */}
                            {group.profile_image ? (
                                <Avatar
                                    src={group.profile_image}
                                    alt={group.name}
                                    sx={{
                                        width: { xs: 100, md: 120 },
                                        height: { xs: 100, md: 120 },
                                        border: '4px solid #fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        mb: 2
                                    }}
                                />
                            ) : (
                                <Avatar
                                    sx={{
                                        width: { xs: 100, md: 120 },
                                        height: { xs: 100, md: 120 },
                                        bgcolor: '#00356b',
                                        fontSize: { xs: '2.5rem', md: '3rem' },
                                        border: '4px solid #fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        mb: 2
                                    }}
                                >
                                    {group.name.charAt(0).toUpperCase()}
                                </Avatar>
                            )}

                            {/* Group Details */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <Box sx={{ maxWidth: 'calc(100% - 48px)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography 
                                            variant="h4" 
                                            component="h1" 
                                            sx={{ 
                                                fontWeight: 600, 
                                                mr: 2,
                                                fontSize: { xs: '1.75rem', md: '2.25rem' }
                                            }}
                                        >
                                            {group.name}
                                        </Typography>
                                        {group.privacy === 'private' ? (
                                            <LockIcon sx={{ color: 'text.secondary' }} />
                                        ) : (
                                            <PublicIcon sx={{ color: 'text.secondary' }} />
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            src={group.creator?.profile_picture}
                                            alt={group.creator?.name}
                                            sx={{ width: 24, height: 24, mr: 1 }}
                                        >
                                            {group.creator?.name?.charAt(0)}
                                        </Avatar>
                                        <Typography variant="body2" color="text.secondary">
                                            Created by {group.creator?.name}
                                        </Typography>
                                    </Box>
                                    <Typography 
                                        variant="body1" 
                                        color="text.secondary" 
                                        sx={{ 
                                            mb: 2,
                                            maxWidth: '800px'
                                        }}
                                    >
                                        {group.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Chip
                                            icon={<GroupIcon />}
                                            label={`${group.memberCount || 0} members`}
                                            variant="outlined"
                                            size="small"
                                        />
                                        <IconButton onClick={handleShare} size="small">
                                            <ShareIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Tabs Section */}
                    <Paper sx={{ mb: 3, bgcolor: 'background.paper' }}>
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                px: { xs: 2, md: 3 },
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    minWidth: 100,
                                    fontSize: '1rem'
                                }
                            }}
                        >
                            <Tab value="discussions" label="Discussions" />
                            <Tab value="members" label="Members" />
                            <Tab value="events" label="Events" />
                        </Tabs>
                    </Paper>

                    {/* Tab Content */}
                    <Box sx={{ px: { xs: 0, md: 0 } }}>
                        {renderTabContent()}
                    </Box>
                </>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default GroupPage; 