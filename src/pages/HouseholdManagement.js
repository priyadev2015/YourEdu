import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ListItemAvatar,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ListItemIcon,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Email as EmailIcon,
    SupervisorAccount as AdminIcon,
    PersonAdd as PersonAddIcon,
    Refresh as RefreshIcon,
    ContentCopy as ContentCopyIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { DescriptiveText } from '../components/ui/typography';
import { cardStyles } from '../styles/theme/components/cards';
import { StudentDataService } from '../services/StudentDataService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const HouseholdManagement = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [household, setHousehold] = useState(null);
    const [members, setMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        name: '',
        email: '',
        type: 'parent',
    });
    const [unlinkedStudents, setUnlinkedStudents] = useState([]);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteType, setInviteType] = useState('parent');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [cancelLoading, setCancelLoading] = useState(null);

    useEffect(() => {
        if (user) {
            ensureTablesExist().then(() => {
                ensureHouseholdExists().then(() => {
                    loadHouseholdData();
                    loadUnlinkedStudents();
                });
            });
        }
    }, [user]);

    const loadHouseholdData = async () => {
        try {
            setLoading(true);
            
            // Check if households table exists
            try {
                // First try to find existing household where user is primary
                let { data: householdData, error: householdError } = await supabase
                    .from('households')
                    .select('*')
                    .eq('primary_account_id', user.id)
                    .limit(1)
                    .single();

                if (householdError) {
                    // If the error is not a "not found" error, it might be a more serious issue
                    if (householdError.code !== 'PGRST116') {
                        console.error('Error fetching household:', householdError);
                    } else {
                        console.log('No household found where user is primary, checking if member of any household');
                    }
                    
                    // If not found as primary, check if member of any household
                    const { data: memberData, error: memberError } = await supabase
                        .from('household_members')
                        .select('household_id')
                        .eq('user_id', user.id)
                        .eq('status', 'active')
                        .limit(1)
                        .single();

                    if (memberError) {
                        if (memberError.code !== 'PGRST116') {
                            console.error('Error checking household membership:', memberError);
                        } else {
                            console.log('User is not a member of any household');
                            // Continue without a household
                            setHousehold(null);
                            setMembers([]);
                            setPendingInvitations([]);
                            return;
                        }
                    } else if (memberData) {
                        // Found a household where user is a member
                        const { data: household, error: householdError2 } = await supabase
                            .from('households')
                            .select('*')
                            .eq('id', memberData.household_id)
                            .single();

                        if (householdError2) {
                            console.error('Error fetching household by member:', householdError2);
                        } else {
                            householdData = household;
                        }
                    }
                }

                if (householdData) {
                    // Add primary account info from current user if it's the primary account
                    if (householdData.primary_account_id === user.id) {
                        householdData.primary_account = {
                            email: user.email,
                            name: user.user_metadata?.name || 'Primary Account'
                        };
                    }
                    
                    setHousehold(householdData);

                    // Load members
                    const { data: membersData, error: membersError } = await supabase
                        .from('household_members')
                        .select('*')
                        .eq('household_id', householdData.id)
                        .eq('status', 'active');

                    if (membersError) {
                        console.error('Error fetching household members:', membersError);
                    } else {
                        // Get user details for each member
                        const membersWithDetails = (membersData || []).map(member => {
                            // If this member is the current user, use current user data
                            if (member.user_id === user.id) {
                                return {
                                    ...member,
                                    user: {
                                        email: user.email,
                                        name: user.user_metadata?.name || 'You'
                                    }
                                };
                            }
                            
                            // Otherwise use basic info
                            return {
                                ...member,
                                user: {
                                    email: member.user_id,
                                    name: member.member_type === 'parent' 
                                        ? 'Parent'
                                        : `${member.member_type.charAt(0).toUpperCase() + member.member_type.slice(1)}`
                                }
                            };
                        });

                        setMembers(membersWithDetails);
                    }

                    // Load invitations if user is primary
                    if (householdData.primary_account_id === user.id) {
                        const { data: invitationsData, error: invitationsError } = await supabase
                            .from('household_invitations')
                            .select('*')
                            .eq('household_id', householdData.id)
                            .eq('status', 'pending');

                        if (invitationsError) {
                            console.error('Error fetching pending invitations:', invitationsError);
                        } else {
                            setPendingInvitations(invitationsData || []);
                        }
                    }
                } else {
                    // No household found
                    console.log('No household found for user');
                    setHousehold(null);
                    setMembers([]);
                    setPendingInvitations([]);
                }
            } catch (error) {
                console.error('Error loading household data:', error);
                // Continue without a household
                setHousehold(null);
                setMembers([]);
                setPendingInvitations([]);
            }
        } catch (error) {
            console.error('Error loading household data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadUnlinkedStudents = async () => {
        try {
            // Get all students for the current parent
            const { data: students, error } = await supabase
                .from('students')
                .select('*')
                .eq('parent_id', user.id)
                .is('user_id', null);

            if (error) throw error;
            
            // Process students to ensure they have the correct email field
            const processedStudents = (students || []).map(student => ({
                ...student,
                // Use student_email if it exists, otherwise use email
                student_email: student.student_email || student.email || ''
            }));
            
            setUnlinkedStudents(processedStudents);
        } catch (error) {
            console.error('Error loading unlinked students:', error);
            setError(error.message);
        }
    };

    const handleInviteMember = async () => {
        try {
            setInviteLoading(true);
            setInviteError('');

            // Validate inputs
            if (!inviteName || !inviteEmail || !inviteType) {
                setInviteError('Please fill in all fields');
                return;
            }

            // Ensure household exists
            const householdId = await ensureHouseholdExists();
            if (!householdId) {
                throw new Error('Failed to create or find household');
            }

            // First check if an invitation already exists for this email
            const { data: existingInvitation, error: checkError } = await supabase
                .from('household_invitations')
                .select('*')
                .eq('household_id', householdId)
                .eq('invitee_email', inviteEmail)
                .eq('status', 'pending')
                .maybeSingle();
                
            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking for existing invitation:', checkError);
            }
            
            // If invitation already exists, ask if user wants to resend it
            if (existingInvitation) {
                toast.info(`An invitation has already been sent to ${inviteEmail}. You can resend or copy the invitation link from the Pending Invitations section.`);
                setInviteLoading(false);
                setShowInviteForm(false);
                return;
            }

            // Generate a unique token for the invitation
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            // Set expiration date (7 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Create invitation record
            const { data: invitation, error: invitationError } = await supabase
                .from('household_invitations')
                .insert([
                    {
                        household_id: householdId,
                        inviter_id: user.id,
                        invitee_name: inviteName,
                        invitee_email: inviteEmail,
                        member_type: inviteType,
                        invitation_token: token,
                        expires_at: expiresAt.toISOString(),
                        status: 'pending'
                    }
                ])
                .select()
                .single();

            if (invitationError) {
                console.error('Error creating invitation:', invitationError);
                
                // Check if it's a unique constraint violation (invitation already exists)
                if (invitationError.code === '23505') {
                    // This shouldn't happen since we checked above, but just in case
                    toast.info(`An invitation has already been sent to ${inviteEmail}. You can resend or copy the invitation link from the Pending Invitations section.`);
                    setShowInviteForm(false);
                    return;
                }
                
                throw invitationError;
            }

            // Determine the correct site URL based on environment
            const isProd = window.location.hostname !== 'localhost';
            const siteUrl = isProd ? 'https://app.youredu.school' : window.location.origin;
            console.log('Using site URL for invitation:', siteUrl);

            // Send invitation email
            const { error: emailError } = await supabase.functions.invoke('send-household-invitation', {
                body: { 
                    invitation, 
                    householdName: household?.name || 'Your Family',
                    siteUrl: siteUrl
                }
            });

            if (emailError) {
                console.error('Error sending invitation email:', emailError);
                toast.warning('Invitation created but email could not be sent. Please share the invitation link manually.');
            } else {
                toast.success(`Invitation sent to ${inviteEmail}`);
            }

            // Reset form and refresh data
            setInviteName('');
            setInviteEmail('');
            setInviteType('parent');
            setShowInviteForm(false);
            loadHouseholdData();
            
        } catch (error) {
            console.error('Error inviting member:', error);
            setInviteError(error.message);
        } finally {
            setInviteLoading(false);
        }
    };

    const handleInviteStudent = async (student) => {
        try {
            setInviteLoading(true);
            setInviteError('');

            // Get student email from either student_email or email field
            const studentEmail = student.student_email || student.email;
            if (!studentEmail) {
                setInviteError('Student email is required');
                return;
            }

            // Ensure household exists
            const householdId = await ensureHouseholdExists();
            if (!householdId) {
                throw new Error('Failed to create or find household');
            }

            // First check if an invitation already exists for this student
            const { data: existingInvitation, error: checkError } = await supabase
                .from('household_invitations')
                .select('*')
                .eq('household_id', householdId)
                .eq('invitee_email', studentEmail)
                .eq('status', 'pending')
                .maybeSingle();
                
            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking for existing invitation:', checkError);
            }
            
            // If invitation already exists, ask if user wants to resend it
            if (existingInvitation) {
                toast.info(`An invitation has already been sent to ${studentEmail}. You can copy the invitation link from the Pending Invitations section.`);
                setInviteLoading(false);
                return;
            }

            // Generate a unique token for the invitation
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            // Set expiration date (7 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            try {
                // Create invitation record
                const { data: invitation, error: invitationError } = await supabase
                    .from('household_invitations')
                    .insert([
                        {
                            household_id: householdId,
                            inviter_id: user.id,
                            invitee_name: student.student_name,
                            invitee_email: studentEmail,
                            member_type: 'student',
                            invitation_token: token,
                            expires_at: expiresAt.toISOString(),
                            status: 'pending'
                        }
                    ])
                    .select()
                    .single();

                if (invitationError) {
                    console.error('Error creating invitation:', invitationError);
                    
                    // Check if it's a unique constraint violation (invitation already exists)
                    if (invitationError.code === '23505') {
                        toast.info(`An invitation has already been sent to ${studentEmail}. You can copy the invitation link from the Pending Invitations section.`);
                        return;
                    }
                    
                    throw invitationError;
                }

                // Get parent name from user metadata
                const parentName = user.user_metadata?.name || 'A parent';

                // Determine the correct site URL based on environment
                const isProd = window.location.hostname !== 'localhost';
                const siteUrl = isProd ? 'https://app.youredu.school' : window.location.origin;
                console.log('Using site URL for student invitation:', siteUrl);

                // Send invitation email using the student-specific invitation function
                const { data: emailData, error: emailError } = await supabase.functions.invoke('send-student-invitation', {
                    body: { 
                        studentName: student.student_name,
                        studentEmail: studentEmail,
                        parentName: parentName,
                        invitationToken: token,
                        siteUrl: siteUrl
                    }
                });

                if (emailError) {
                    console.error('Error sending invitation email:', emailError);
                    console.log('Email error details:', emailError);
                    toast.warning('Invitation created but email could not be sent. Please share the invitation link manually.');
                } else {
                    console.log('Email sent successfully:', emailData);
                    toast.success(`Invitation sent to ${studentEmail}`);
                }

                // Refresh data
                loadHouseholdData();
                loadUnlinkedStudents();
            } catch (error) {
                console.error('Error in invitation process:', error);
                
                // If it's a database error, it might be related to RLS policies
                if (error.code && (error.code.startsWith('42') || error.code.startsWith('23'))) {
                    console.log('Database error detected, might be related to RLS policies');
                    setError('There is an issue with database permissions. Please contact support.');
                }
                
                throw error;
            }
            
        } catch (error) {
            console.error('Error inviting student:', error);
            setInviteError(error.message || 'Failed to invite student');
            toast.error(`Failed to invite student: ${error.message || 'Unknown error'}`);
        } finally {
            setInviteLoading(false);
        }
    };

    const handleCancelInvitation = async (invitationId) => {
        try {
            setCancelLoading(invitationId);
            const { error } = await supabase
                .from('household_invitations')
                .delete()
                .eq('id', invitationId);

            if (error) throw error;

            // Update local state
            setPendingInvitations(pendingInvitations.filter(inv => inv.id !== invitationId));
            toast.success('Invitation cancelled successfully');
            
            // Refresh data to ensure everything is up to date
            await loadHouseholdData();

        } catch (error) {
            console.error('Error canceling invitation:', error);
            setError(error.message);
            toast.error('Failed to cancel invitation');
        } finally {
            setCancelLoading(null);
        }
    };

    const handleResendInvitation = async (invitation) => {
        try {
            setCancelLoading(invitation.id); // Reuse the loading state for the resend button
            
            // Get parent name from user metadata
            const parentName = user.user_metadata?.name || 'A parent';
            
            // Determine the correct site URL based on environment
            const isProd = window.location.hostname !== 'localhost';
            const siteUrl = isProd ? 'https://app.youredu.school' : window.location.origin;
            console.log('Using site URL for resending invitation:', siteUrl);
            
            // Determine which Edge Function to call based on the member type
            if (invitation.member_type === 'student') {
                // Resend student invitation
                const { data: emailData, error: emailError } = await supabase.functions.invoke('send-student-invitation', {
                    body: { 
                        studentName: invitation.invitee_name,
                        studentEmail: invitation.invitee_email,
                        parentName: parentName,
                        invitationToken: invitation.invitation_token,
                        siteUrl: siteUrl
                    }
                });
                
                if (emailError) {
                    console.error('Error resending student invitation:', emailError);
                    toast.error('Failed to resend invitation email');
                    throw emailError;
                }
                
                console.log('Student invitation resent successfully:', emailData);
            } else {
                // Resend parent invitation
                const { error: emailError } = await supabase.functions.invoke('send-household-invitation', {
                    body: { 
                        invitation, 
                        householdName: household?.name || 'Your Family',
                        siteUrl: siteUrl
                    }
                });
                
                if (emailError) {
                    console.error('Error resending parent invitation:', emailError);
                    toast.error('Failed to resend invitation email');
                    throw emailError;
                }
            }
            
            toast.success(`Invitation resent to ${invitation.invitee_email}`);
            
        } catch (error) {
            console.error('Error resending invitation:', error);
            setError(error.message);
        } finally {
            setCancelLoading(null);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to remove this member from your household?')) {
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('household_members')
                .update({ status: 'inactive' })
                .eq('id', memberId);

            if (error) throw error;

            setMembers(members.filter(member => member.id !== memberId));

        } catch (error) {
            console.error('Error removing member:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to ensure all required tables exist
    const ensureTablesExist = async () => {
        try {
            // Try to call the RPC function to create tables
            const { data, error } = await supabase.rpc('create_household_tables');
            
            if (error) {
                console.error('Error creating tables:', error);
                // If the function doesn't exist yet, that's okay
                if (error.code === 'PGRST301') {
                    console.log('create_household_tables function not found, will try direct queries');
                    return false;
                }
                return false;
            }
            
            console.log('Tables checked/created successfully');
            return true;
        } catch (error) {
            console.error('Error checking if tables exist:', error);
            return false;
        }
    };

    // Function to ensure the current user has a household
    const ensureHouseholdExists = async () => {
        try {
            // Call the RPC function to ensure a household exists
            const { data, error } = await supabase.rpc('ensure_household_exists');
            
            if (error) {
                console.error('Error ensuring household exists:', error);
                
                // If the function doesn't exist yet, try the old way
                if (error.code === 'PGRST301') {
                    console.log('ensure_household_exists function not found, trying direct queries');
                    return await ensureHouseholdExistsLegacy();
                }
                
                throw error;
            }
            
            console.log('Household ensured successfully:', data);
            return data;
        } catch (error) {
            console.error('Error ensuring household exists:', error);
            setError('Failed to create or find household. Please try again later.');
            return null;
        }
    };
    
    // Legacy function to ensure a household exists (used as fallback)
    const ensureHouseholdExistsLegacy = async () => {
        try {
            // First check if user already has a household
            const { data: existingHouseholds, error: queryError } = await supabase
                .from('households')
                .select('id')
                .eq('primary_account_id', user.id);
            
            if (queryError) {
                console.error('Error checking for existing household:', queryError);
                // If the error is because the table doesn't exist, we'll create it later
                if (queryError.code === 'PGRST204') {
                    console.log('Household table does not exist yet');
                    return null;
                }
                
                // If it's an RLS policy error, we need to fix that
                if (queryError.code === '42P17') {
                    console.log('RLS policy error detected, please run the SQL fix');
                    setError('There is an issue with database permissions. Please contact support.');
                    return null;
                }
                
                throw queryError;
            }
            
            // If household exists, return its ID
            if (existingHouseholds && existingHouseholds.length > 0) {
                console.log('User already has a household:', existingHouseholds[0].id);
                return existingHouseholds[0].id;
            }
            
            // Create a new household
            console.log('Creating household for user:', user.id);
            
            // Get user's name from metadata
            const userName = user.user_metadata?.name || 'My';
            const householdName = `${userName}'s Family`;
            
            const { data: newHousehold, error: createError } = await supabase
                .from('households')
                .insert([
                    {
                        name: householdName,
                        primary_account_id: user.id
                    }
                ])
                .select();
            
            if (createError) {
                console.error('Error creating household:', createError);
                
                // If it's an RLS policy error, we need to fix that
                if (createError.code === '42P17') {
                    console.log('RLS policy error detected, please run the SQL fix');
                    setError('There is an issue with database permissions. Please contact support.');
                    return null;
                }
                
                throw createError;
            }
            
            if (!newHousehold || newHousehold.length === 0) {
                throw new Error('Failed to create household');
            }
            
            const householdId = newHousehold[0].id;
            
            // Create a household member record for the primary account
            const { error: memberError } = await supabase
                .from('household_members')
                .insert([
                    {
                        household_id: householdId,
                        user_id: user.id,
                        member_type: 'parent',
                        is_primary: true
                    }
                ]);
            
            if (memberError) {
                console.error('Error creating household member:', memberError);
                // Don't throw here, we still want to return the household ID
            }
            
            console.log('Household created successfully:', householdId);
            return householdId;
        } catch (error) {
            console.error('Error ensuring household exists:', error);
            setError('Failed to create or find household. Please try again later.');
            return null;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            <Container maxWidth="var(--container-max-width)" sx={{ py: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                )}

                <Grid container spacing={3}>
                    {/* Main Column - All Household Management Sections */}
                    <Grid item xs={12}>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 4, 
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                                mb: 3
                            }}
                        >
                            {/* Household Members Section */}
                            <Box sx={{ mb: 5 }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    mb: 2,
                                    pb: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: 'hsl(var(--foreground))',
                                        }}
                                    >
                                        Household Members
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => {
                                            setInviteType('parent');
                                            setShowInviteForm(!showInviteForm);
                                        }}
                                        sx={{
                                            backgroundColor: '#2563EB',
                                            '&:hover': { backgroundColor: '#1E40AF' },
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            px: 2
                                        }}
                                    >
                                        Invite Parent
                                    </Button>
                                </Box>
                                
                                {members.length === 0 ? (
                                    <Box 
                                        sx={{ 
                                            textAlign: 'center', 
                                            py: 5,
                                            px: 3,
                                            color: 'text.secondary',
                                            bgcolor: 'background.paper',
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 2
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                        <Box>
                                            <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                                                No members in your household yet
                                            </Typography>
                                            <Typography>
                                                Click "Invite Parent" to add other parents to your household
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <TableContainer 
                                        component={Paper} 
                                        variant="outlined" 
                                        sx={{ 
                                            borderRadius: 2,
                                            boxShadow: 'none',
                                            '& .MuiTableCell-root': {
                                                py: 2
                                            }
                                        }}
                                    >
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'background.paper' }}>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell align="right">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {members.map((member) => (
                                                    <TableRow key={member.id}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Avatar sx={{ mr: 1, bgcolor: member.is_primary ? '#1E40AF' : '#6B7280' }}>
                                                                    {member.member_type === 'parent' ? <PersonIcon /> : <SchoolIcon />}
                                                                </Avatar>
                                                                {member.user?.name || 'Unknown'}
                                                                {member.is_primary && (
                                                                    <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                                                                        (Primary)
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{member.user?.email}</TableCell>
                                                        <TableCell>
                                                            {member.member_type === 'parent' ? 'Parent' : 'Student'}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {!member.is_primary && (
                                                                <IconButton
                                                                    edge="end"
                                                                    aria-label="delete"
                                                                    onClick={() => handleRemoveMember(member.id)}
                                                                    disabled={loading}
                                                                    sx={{
                                                                        color: 'error.main',
                                                                        '&:hover': {
                                                                            backgroundColor: 'error.light',
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>

                            {/* Parent Invitation Form */}
                            {showInviteForm && (
                                <Box sx={{ 
                                    mt: 3, 
                                    mb: 5, 
                                    p: 4, 
                                    border: '1px solid', 
                                    borderColor: 'primary.light', 
                                    borderRadius: 2,
                                    backgroundColor: 'primary.lightest',
                                    position: 'relative'
                                }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            mb: 3,
                                            fontWeight: 600,
                                            color: 'primary.dark'
                                        }}
                                    >
                                        Invite Parent to Household
                                    </Typography>
                                    
                                    {inviteError && (
                                        <Alert severity="error" sx={{ mb: 3 }}>
                                            {inviteError}
                                        </Alert>
                                    )}
                                    
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Name"
                                                value={inviteName}
                                                onChange={(e) => setInviteName(e.target.value)}
                                                disabled={inviteLoading}
                                                variant="outlined"
                                                sx={{
                                                    backgroundColor: 'white',
                                                    borderRadius: 1
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                disabled={inviteLoading}
                                                required
                                                variant="outlined"
                                                sx={{
                                                    backgroundColor: 'white',
                                                    borderRadius: 1
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setShowInviteForm(false)}
                                            disabled={inviteLoading}
                                            sx={{
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&:hover': { 
                                                    borderColor: 'primary.dark',
                                                    backgroundColor: 'rgba(37, 99, 235, 0.04)'
                                                },
                                                textTransform: 'none',
                                                fontWeight: 500
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleInviteMember}
                                            disabled={inviteLoading}
                                            sx={{
                                                backgroundColor: 'primary.main',
                                                '&:hover': { backgroundColor: 'primary.dark' },
                                                textTransform: 'none',
                                                fontWeight: 500
                                            }}
                                        >
                                            {inviteLoading ? <CircularProgress size={24} /> : 'Send Invitation'}
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {/* Students Without Accounts Section */}
                            {unlinkedStudents.length > 0 && (
                                <Box sx={{ mb: 5 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        mb: 2,
                                        pb: 1,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: 'hsl(var(--foreground))',
                                            }}
                                        >
                                            Students Without Accounts
                                        </Typography>
                                        <Button
                                            component={Link}
                                            to="/add-student"
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&:hover': { 
                                                    borderColor: 'primary.dark',
                                                    backgroundColor: 'rgba(37, 99, 235, 0.04)'
                                                },
                                                textTransform: 'none',
                                                fontWeight: 500
                                            }}
                                        >
                                            Add More Students
                                        </Button>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        These are students you've added but haven't created accounts yet. Invite them to create their own accounts.
                                    </Typography>
                                    
                                    <TableContainer 
                                        component={Paper} 
                                        variant="outlined" 
                                        sx={{ 
                                            mb: 3,
                                            borderRadius: 2,
                                            boxShadow: 'none',
                                            '& .MuiTableCell-root': {
                                                py: 2
                                            }
                                        }}
                                    >
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'background.paper' }}>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell align="right">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {unlinkedStudents.map((student) => (
                                                    <TableRow key={student.id}>
                                                        <TableCell>{student.student_name}</TableCell>
                                                        <TableCell>{student.student_email || student.email || 'No email'}</TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => handleInviteStudent(student)}
                                                                disabled={inviteLoading}
                                                                sx={{
                                                                    backgroundColor: 'primary.main',
                                                                    '&:hover': { backgroundColor: 'primary.dark' },
                                                                    textTransform: 'none',
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                Invite
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {/* Pending Invitations Section */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    mb: 2,
                                    pb: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: 'hsl(var(--foreground))',
                                        }}
                                    >
                                        Pending Invitations
                                    </Typography>
                                    <Tooltip title="Invitations expire after 7 days. You can resend or cancel invitations at any time.">
                                        <IconButton size="small" color="primary">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                
                                {pendingInvitations.length > 0 ? (
                                    <TableContainer 
                                        component={Paper} 
                                        variant="outlined" 
                                        sx={{ 
                                            borderRadius: 2,
                                            boxShadow: 'none',
                                            '& .MuiTableCell-root': {
                                                py: 2
                                            }
                                        }}
                                    >
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'background.paper' }}>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Expires</TableCell>
                                                    <TableCell align="right">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pendingInvitations.map((invitation) => {
                                                    // Calculate if the invitation is about to expire (less than 2 days)
                                                    const expiryDate = new Date(invitation.expires_at);
                                                    const now = new Date();
                                                    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                                                    const isExpiringSoon = daysUntilExpiry <= 2;
                                                    
                                                    return (
                                                        <TableRow key={invitation.id}>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Avatar sx={{ mr: 1, bgcolor: invitation.member_type === 'parent' ? '#1E40AF' : '#6B7280' }}>
                                                                        {invitation.member_type === 'parent' ? <PersonIcon /> : <SchoolIcon />}
                                                                    </Avatar>
                                                                    {invitation.invitee_name}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{invitation.invitee_email}</TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={invitation.member_type === 'parent' ? 'Parent' : 'Student'} 
                                                                    size="small"
                                                                    color={invitation.member_type === 'parent' ? 'primary' : 'secondary'}
                                                                    sx={{ 
                                                                        fontWeight: 500,
                                                                        borderRadius: 'var(--radius-full)',
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    {isExpiringSoon ? (
                                                                        <Chip 
                                                                            label={`Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`} 
                                                                            size="small"
                                                                            color="warning"
                                                                            sx={{ 
                                                                                fontWeight: 500,
                                                                                borderRadius: 'var(--radius-full)',
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        new Date(invitation.expires_at).toLocaleDateString()
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                                    <Tooltip title="Cancel invitation">
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => handleCancelInvitation(invitation.id)}
                                                                            disabled={cancelLoading === invitation.id}
                                                                            color="error"
                                                                            sx={{ 
                                                                                minWidth: 0,
                                                                                textTransform: 'none',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            {cancelLoading === invitation.id ? <CircularProgress size={20} /> : 'Cancel'}
                                                                        </Button>
                                                                    </Tooltip>
                                                                    <Tooltip title="Resend invitation email">
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => handleResendInvitation(invitation)}
                                                                            disabled={cancelLoading === invitation.id}
                                                                            color="primary"
                                                                            sx={{ 
                                                                                minWidth: 0,
                                                                                textTransform: 'none',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            <RefreshIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                                            Resend
                                                                        </Button>
                                                                    </Tooltip>
                                                                    <Tooltip title="Copy invitation link to clipboard">
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            onClick={() => {
                                                                                // Determine the correct site URL based on environment
                                                                                const isProd = window.location.hostname !== 'localhost';
                                                                                const siteUrl = isProd ? 'https://app.youredu.school' : window.location.origin;
                                                                                
                                                                                // Create the full invitation URL
                                                                                const invitationUrl = `${siteUrl}/household-invitation/${invitation.invitation_token}`;
                                                                                
                                                                                // Copy to clipboard
                                                                                navigator.clipboard.writeText(invitationUrl);
                                                                                toast.success('Invitation link copied to clipboard');
                                                                            }}
                                                                            sx={{ 
                                                                                minWidth: 0,
                                                                                textTransform: 'none',
                                                                                fontWeight: 500
                                                                            }}
                                                                        >
                                                                            <ContentCopyIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                                            Copy Link
                                                                        </Button>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box 
                                        sx={{ 
                                            textAlign: 'center', 
                                            py: 5,
                                            px: 3,
                                            color: 'text.secondary',
                                            bgcolor: 'background.paper',
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 2
                                        }}
                                    >
                                        <EmailIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                        <Box>
                                            <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                                                No pending invitations
                                            </Typography>
                                            <Typography>
                                                Invitations will appear here once sent
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HouseholdManagement; 