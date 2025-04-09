import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import {
    Box,
    Container,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Alert,
    Paper,
    TextField,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const ACCOUNT_TYPES = ['Parent', 'Student'];
const ACCOUNT_STATUS = ['Active', 'View Only', 'Suspended'];

const AccountSettings = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [accountData, setAccountData] = useState({
        accountType: 'Parent',
        accountStatus: 'Active',
    });
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        // Check if we're on the change-password route
        const isChangePasswordRoute = location.pathname === '/account/settings/change-password';
        if (isChangePasswordRoute) {
            setShowPasswordChange(true);
        }
    }, [location.pathname]);

    const handlePasswordChangeClick = () => {
        navigate('/account/settings/change-password');
        setShowPasswordChange(true);
    };

    const handleClosePasswordChange = () => {
        setShowPasswordChange(false);
        navigate('/account/settings');
        resetForm();
    };

    const handlePasswordChange = async () => {
        try {
            setLoading(true);

            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match');
            }

            if (newPassword.length < 6) {
                throw new Error('New password must be at least 6 characters long');
            }

            // Update password directly
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                throw updateError;
            }

            setMessage({ 
                type: 'success', 
                content: 'Password updated successfully!' 
            });
            handleClosePasswordChange();
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({ 
                type: 'error', 
                content: error.message || 'Failed to update password. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswords(false);
    };

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
                        Manage your account settings and security preferences
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
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Account Information */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                                height: '100%',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#000000' }}>
                                Account Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth disabled>
                                        <InputLabel>Account Type</InputLabel>
                                        <Select
                                            value="Parent"
                                            label="Account Type"
                                        >
                                            <MenuItem value="Parent">Parent</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth disabled>
                                        <InputLabel>Account Status</InputLabel>
                                        <Select
                                            value="Active"
                                            label="Account Status"
                                        >
                                            <MenuItem value="Active">Active</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Security Settings */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                                height: '100%',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#000000' }}>
                                Security Settings
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Password Change */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="body1" color="text.primary">Password</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Change your account password
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handlePasswordChangeClick}
                                        disabled={loading}
                                        sx={{ 
                                            color: 'hsl(var(--brand-primary))',
                                            borderColor: 'hsl(var(--brand-primary))',
                                            '&:hover': {
                                                borderColor: 'hsl(var(--brand-primary-dark))',
                                                backgroundColor: 'hsla(var(--brand-primary), 0.08)',
                                            },
                                        }}
                                    >
                                        {loading ? 'Updating...' : 'Change'}
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Password Change Dialog */}
                <Dialog 
                    open={showPasswordChange} 
                    onClose={handleClosePasswordChange}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="New Password"
                                type={showPasswords ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Confirm New Password"
                                type={showPasswords ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                required
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <input
                                    type="checkbox"
                                    checked={showPasswords}
                                    onChange={(e) => setShowPasswords(e.target.checked)}
                                    id="show-passwords"
                                />
                                <label htmlFor="show-passwords">Show passwords</label>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleClosePasswordChange}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handlePasswordChange} 
                            variant="contained"
                            disabled={loading || !newPassword || !confirmPassword}
                            sx={{
                                backgroundColor: 'hsl(var(--brand-primary))',
                                '&:hover': {
                                    backgroundColor: 'hsl(var(--brand-primary-dark))',
                                },
                            }}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AccountSettings; 
