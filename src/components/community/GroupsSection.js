import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Chip,
    Alert,
    Menu,
    Snackbar,
    Avatar
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Lock as LockIcon,
    Public as PublicIcon,
    Group as GroupIcon,
    Close as CloseIcon,
    MoreVert as MoreVertIcon,
    Share as ShareIcon,
    Notifications as NotificationsIcon,
    PushPin as PushPinIcon,
    ExitToApp as ExitToAppIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { fetchPublicGroups, fetchUserGroups, fetchPendingInvites, createGroup, joinGroup, fetchCreatedGroups, updateGroup, deleteGroup, checkGroupMembership } from '../../utils/supabase/groups';
import { useAuth } from '../../utils/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { BsEyeSlash } from 'react-icons/bs';

const GroupsSection = ({ view, myGroupsView, sourceTab }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        privacy: 'public',
        profileImage: '',
        landscapeImage: ''
    });
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [targetPath, setTargetPath] = useState('');

    useEffect(() => {
        console.log('GroupsSection mounted with view:', view, 'and myGroupsView:', myGroupsView);
        fetchGroups();
    }, [view, myGroupsView]);

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        console.log('Fetching groups for view:', view);

        try {
            let fetchedGroups = [];
            if (view === 'explore') {
                console.log('Fetching public groups...');
                fetchedGroups = await fetchPublicGroups();
            } else if (view === 'my-groups') {
                if (myGroupsView === 'joined') {
                    console.log('Fetching user groups...');
                    fetchedGroups = await fetchUserGroups();
                } else if (myGroupsView === 'pending') {
                    console.log('Fetching pending invites...');
                    fetchedGroups = await fetchPendingInvites();
                } else if (myGroupsView === 'created') {
                    console.log('Fetching created groups...');
                    fetchedGroups = await fetchCreatedGroups();
                }
            }
            console.log('Successfully fetched groups:', fetchedGroups);
            setGroups(fetchedGroups);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError(err.message || 'Failed to fetch groups');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        console.log('Creating new group:', newGroup);
        try {
            await createGroup({
                name: newGroup.name,
                description: newGroup.description,
                privacy: newGroup.privacy,
                profileImage: newGroup.profileImage,
                landscapeImage: newGroup.landscapeImage
            });
            console.log('Group created successfully');
            setShowCreateModal(false);
            setCreateDialogOpen(false);
            setNewGroup({
                name: '',
                description: '',
                privacy: 'public',
                profileImage: null,
                landscapeImage: null
            });
            fetchGroups(); // Refresh the list
            setSnackbar({
                open: true,
                message: 'Group created successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error creating group:', err);
            setError(err.message || 'Failed to create group');
            setSnackbar({
                open: true,
                message: 'Failed to create group. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleInteraction = (path) => {
        if (!user) {
            setTargetPath(path);
            setShowRegistrationPrompt(true);
            return true; // Interaction was intercepted
        }
        return false; // Interaction can proceed
    };

    const handleJoinGroup = async (e, groupId) => {
        e.stopPropagation();
        if (handleInteraction(`/groups/${groupId}?source=${sourceTab}`)) return;
        
        try {
            // Check if already a member
            const membership = await checkGroupMembership(groupId);
            if (membership) {
                setSnackbar({
                    open: true,
                    message: 'You are already a member of this group',
                    severity: 'info'
                });
                return;
            }
            
            await joinGroup(groupId);
            console.log('Successfully joined group');
            fetchGroups(); // Refresh the list
            setSnackbar({
                open: true,
                message: 'Successfully joined group!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error joining group:', err);
            if (err.message.includes('duplicate key')) {
                setSnackbar({
                    open: true,
                    message: 'You are already a member of this group',
                    severity: 'info'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: err.message || 'Failed to join group',
                    severity: 'error'
                });
            }
        }
    };

    const handleGroupClick = (groupId) => {
        navigate(`/groups/${groupId}?source=${sourceTab}`);
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMenuClick = (event, group) => {
        event.stopPropagation();
        setSelectedGroup(group);
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedGroup(null);
    };

    const handleShare = (event) => {
        event.stopPropagation();
        const url = `${window.location.origin}/groups/${selectedGroup.id}?source=${sourceTab}`;
        navigator.clipboard.writeText(url);
        setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
        handleMenuClose();
    };

    const handleManageNotifications = (event) => {
        event.stopPropagation();
        // TODO: Implement notifications management
        handleMenuClose();
    };

    const handlePinGroup = (event) => {
        event.stopPropagation();
        // TODO: Implement pin group functionality
        handleMenuClose();
    };

    const handleLeaveGroup = (event) => {
        event.stopPropagation();
        // TODO: Implement leave group functionality
        handleMenuClose();
    };

    const handleEditGroup = async () => {
        try {
            await updateGroup(editingGroup.id, {
                name: editingGroup.name,
                description: editingGroup.description,
                profileImage: editingGroup.profileImage,
                landscapeImage: editingGroup.landscapeImage
            });
            setEditDialogOpen(false);
            setEditingGroup(null);
            fetchGroups();
            setSnackbar({
                open: true,
                message: 'Group updated successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error updating group:', err);
            setError(err.message || 'Failed to update group');
            setSnackbar({
                open: true,
                message: 'Failed to update group. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleDeleteGroup = async () => {
        try {
            await deleteGroup(groupToDelete);
            setDeleteConfirmOpen(false);
            setGroupToDelete(null);
            fetchGroups();
            setSnackbar({
                open: true,
                message: 'Group deleted successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error deleting group:', err);
            setError(err.message || 'Failed to delete group');
            setSnackbar({
                open: true,
                message: 'Failed to delete group. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: window.location.origin + targetPath,
                },
            });

            if (error) throw error;

            setShowRegistrationPrompt(false);
            setSnackbar({
                open: true,
                message: 'Check your email for a login link! Once you click the link, you can set your password.',
                severity: 'success'
            });
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

    const handleClose = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!isLoading) {
            setShowRegistrationPrompt(false);
        }
    };

    const RegistrationPrompt = () => (
        <Dialog
            open={showRegistrationPrompt}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 2,
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 1,
            }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a365d' }}>
                    Join YourEDU
                </Typography>
                <IconButton 
                    onClick={handleClose}
                    sx={{ color: '#718096' }}
                    disabled={isLoading}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
                        Connect with your homeschool community
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: '#4a5568' }}>
                        Sign up to interact with groups, join discussions, and connect with other homeschool families.
                    </Typography>
                    <Box component="form" onSubmit={handleEmailSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="email"
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            variant="outlined"
                            disabled={isLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#00356b',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#00356b',
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isLoading}
                            sx={{
                                backgroundColor: '#00356b',
                                color: 'white',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#002548',
                                },
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                                'Get Started'
                            )}
                        </Button>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: '#718096' }}>
                        By signing up, you agree to our Terms and Privacy Policy.
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );

    const GroupCard = ({ group, myGroupsView }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);

        const handleMenuClick = (event) => {
            event.stopPropagation();
            setAnchorEl(event.currentTarget);
        };

        const handleMenuClose = () => {
            setAnchorEl(null);
        };

        const handleDeleteClick = () => {
            handleMenuClose();
            setDeleteDialogOpen(true);
        };

        const handleDeleteConfirm = async () => {
            setIsDeleting(true);
            try {
                await deleteGroup(group.id);
                setSnackbar({
                    open: true,
                    message: 'Group deleted successfully',
                    severity: 'success'
                });
                // Refresh the groups list
                if (myGroupsView === 'created') {
                    fetchGroups();
                }
            } catch (error) {
                console.error('Error deleting group:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to delete group. Please try again.',
                    severity: 'error'
                });
            } finally {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
            }
        };

        return (
            <>
                <Paper 
                    elevation={1} 
                    sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 2,
                        p: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ position: 'relative', mr: 2 }}>
                            {group.profile_image ? (
                                <Avatar
                                    src={group.profile_image}
                                    alt={group.name}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '3px solid #fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ) : (
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: '#00356b',
                                        fontSize: '2rem',
                                        border: '3px solid #fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {group.name.charAt(0).toUpperCase()}
                                </Avatar>
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                                    {group.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {group.privacy === 'private' ? (
                                        <LockIcon sx={{ ml: 1 }} color="action" />
                                    ) : (
                                        <PublicIcon sx={{ ml: 1 }} color="action" />
                                    )}
                                    {myGroupsView === 'created' && (
                                        <IconButton 
                                            size="small" 
                                            onClick={handleMenuClick}
                                            sx={{ ml: 1 }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
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
                        </Box>
                    </Box>
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 2,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '40px',
                            flexGrow: 1
                        }}
                    >
                        {group.description}
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 'auto'
                    }}>
                        <Chip
                            icon={<GroupIcon />}
                            label={`${group.memberCount || 0} members`}
                            variant="outlined"
                            size="small"
                            sx={{ 
                                borderColor: 'rgba(0,0,0,0.12)',
                                '& .MuiChip-icon': { 
                                    color: 'text.secondary',
                                    fontSize: '1rem'
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate(`/group/${group.id}`)}
                            sx={{
                                bgcolor: '#00356b',
                                '&:hover': { bgcolor: '#002548' },
                                textTransform: 'none',
                                px: 2
                            }}
                        >
                            View Group
                        </Button>
                    </Box>
                </Paper>

                {/* Group Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                        Delete Group
                    </MenuItem>
                </Menu>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => !isDeleting && setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Delete Group</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete "{group.name}"? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => setDeleteDialogOpen(false)} 
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteConfirm}
                            color="error"
                            disabled={isDeleting}
                            startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <TextField
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        width: '300px',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: '#ffffff'
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#718096' }} />
                            </InputAdornment>
                        )
                    }}
                />
                {view === 'explore' && window.location.hostname === 'localhost' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{
                                bgcolor: '#00356b',
                                '&:hover': { bgcolor: '#002548' },
                                textTransform: 'none',
                                borderRadius: '8px'
                            }}
                        >
                            Create Group
                        </Button>
                        <BsEyeSlash
                            style={{
                                fontSize: '16px',
                                color: 'var(--warning-color, #f59e0b)',
                            }}
                        />
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                {filteredGroups.map((group) => (
                    <Grid item xs={12} sm={6} md={4} key={group.id}>
                        <GroupCard group={group} myGroupsView={myGroupsView} />
                    </Grid>
                ))}
            </Grid>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleShare}>
                    <ShareIcon sx={{ mr: 1 }} /> Share
                </MenuItem>
                <MenuItem onClick={handleManageNotifications}>
                    <NotificationsIcon sx={{ mr: 1 }} /> Manage Notifications
                </MenuItem>
                <MenuItem onClick={handlePinGroup}>
                    <PushPinIcon sx={{ mr: 1 }} /> Pin Group
                </MenuItem>
                {view === 'my-groups' && myGroupsView === 'joined' && (
                    <MenuItem onClick={handleLeaveGroup}>
                        <ExitToAppIcon sx={{ mr: 1 }} /> Leave Group
                    </MenuItem>
                )}
                {view === 'my-groups' && myGroupsView === 'created' && (
                    <>
                        <MenuItem onClick={() => {
                            handleMenuClose();
                            setEditingGroup(selectedGroup);
                            setEditDialogOpen(true);
                        }}>
                            <EditIcon sx={{ mr: 1 }} /> Edit Group
                        </MenuItem>
                        <MenuItem onClick={() => {
                            handleMenuClose();
                            setGroupToDelete(selectedGroup.id);
                            setDeleteConfirmOpen(true);
                        }}>
                            <DeleteIcon sx={{ mr: 1 }} /> Delete Group
                        </MenuItem>
                    </>
                )}
            </Menu>

            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Create New Group
                    <IconButton
                        onClick={() => setCreateDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Group Name"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={newGroup.description}
                            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Privacy</InputLabel>
                            <Select
                                value={newGroup.privacy}
                                label="Privacy"
                                onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value })}
                            >
                                <MenuItem value="public">Public</MenuItem>
                                <MenuItem value="private">Private</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Profile Image</Typography>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="profile-image-upload"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setNewGroup({ ...newGroup, profileImage: file });
                                    }
                                }}
                            />
                            <label htmlFor="profile-image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AddIcon />}
                                    sx={{ mr: 2 }}
                                >
                                    Upload Profile Image
                                </Button>
                            </label>
                            {newGroup.profileImage && (
                                <Typography variant="body2" color="textSecondary">
                                    Selected: {newGroup.profileImage.name}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Landscape Image</Typography>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="landscape-image-upload"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setNewGroup({ ...newGroup, landscapeImage: file });
                                    }
                                }}
                            />
                            <label htmlFor="landscape-image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AddIcon />}
                                >
                                    Upload Landscape Image
                                </Button>
                            </label>
                            {newGroup.landscapeImage && (
                                <Typography variant="body2" color="textSecondary">
                                    Selected: {newGroup.landscapeImage.name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setCreateDialogOpen(false);
                            setNewGroup({
                                name: '',
                                description: '',
                                privacy: 'public',
                                profileImage: null,
                                landscapeImage: null
                            });
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateGroup}
                        sx={{
                            bgcolor: '#00356b',
                            '&:hover': { bgcolor: '#002548' },
                            textTransform: 'none'
                        }}
                    >
                        Create Group
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditingGroup(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Edit Group
                    <IconButton
                        onClick={() => {
                            setEditDialogOpen(false);
                            setEditingGroup(null);
                        }}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Group Name"
                            value={editingGroup?.name || ''}
                            onChange={(e) => setEditingGroup({
                                ...editingGroup,
                                name: e.target.value
                            })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={editingGroup?.description || ''}
                            onChange={(e) => setEditingGroup({
                                ...editingGroup,
                                description: e.target.value
                            })}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Profile Image</Typography>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="edit-profile-image-upload"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setEditingGroup({
                                            ...editingGroup,
                                            profileImage: file
                                        });
                                    }
                                }}
                            />
                            <label htmlFor="edit-profile-image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AddIcon />}
                                    sx={{ mr: 2 }}
                                >
                                    Change Profile Image
                                </Button>
                            </label>
                            {editingGroup?.profileImage && (
                                <Typography variant="body2" color="textSecondary">
                                    Selected: {editingGroup.profileImage.name}
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Landscape Image</Typography>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="edit-landscape-image-upload"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setEditingGroup({
                                            ...editingGroup,
                                            landscapeImage: file
                                        });
                                    }
                                }}
                            />
                            <label htmlFor="edit-landscape-image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AddIcon />}
                                >
                                    Change Landscape Image
                                </Button>
                            </label>
                            {editingGroup?.landscapeImage && (
                                <Typography variant="body2" color="textSecondary">
                                    Selected: {editingGroup.landscapeImage.name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setEditDialogOpen(false);
                            setEditingGroup(null);
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEditGroup}
                        sx={{
                            bgcolor: '#00356b',
                            '&:hover': { bgcolor: '#002548' },
                            textTransform: 'none'
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setGroupToDelete(null);
                }}
            >
                <DialogTitle>Delete Group</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this group? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDeleteConfirmOpen(false);
                            setGroupToDelete(null);
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteGroup}
                        sx={{ textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <RegistrationPrompt />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default GroupsSection; 