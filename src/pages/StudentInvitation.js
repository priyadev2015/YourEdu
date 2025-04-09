import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { PageHeader, DescriptiveText } from '../components/ui/typography';
import { cardStyles } from '../styles/theme/components/cards';
import { StudentDataService } from '../services/StudentDataService';

const StudentInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [invitation, setInvitation] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [hasExistingAccount, setHasExistingAccount] = useState(false);
    const [studentRecord, setStudentRecord] = useState(null);

    useEffect(() => {
        verifyInvitation();
    }, [token]);

    const verifyInvitation = async () => {
        try {
            console.log('Verifying student invitation with token:', token);

            // Try using the new RPC function first
            const { data: rpcData, error: rpcError } = await supabase.rpc('verify_student_invitation', {
                p_token: token
            });

            console.log('RPC verification result:', { data: rpcData, error: rpcError });

            // If the RPC function exists and returns data
            if (!rpcError && rpcData && rpcData.success) {
                const fullInvitation = rpcData.invitation;
                console.log('Full invitation data from RPC:', fullInvitation);
                setInvitation(fullInvitation);
                
                // Check if user already exists
                const { data: existingUser, error: userError } = await supabase
                    .from('account_profiles')
                    .select('*')
                    .eq('email', fullInvitation.invitee_email)
                    .maybeSingle();

                if (userError) {
                    console.error('Error checking existing user:', userError);
                }

                console.log('Existing user check:', { existingUser, userError });

                setHasExistingAccount(!!existingUser);
                if (existingUser) {
                    setName(existingUser.name);
                } else {
                    setName(fullInvitation.invitee_name);
                }

                // If this is a student invitation, check if there's already a student record
                if (fullInvitation.member_type === 'student') {
                    // Check if parent has already created a student record for this email
                    const { data: studentData, error: studentError } = await supabase
                        .from('students')
                        .select('*')
                        .eq('parent_id', fullInvitation.primary_account_id)
                        .eq('student_email', fullInvitation.invitee_email)
                        .maybeSingle();
                    
                    if (studentError && studentError.code !== 'PGRST116') {
                        console.error('Error checking student record:', studentError);
                    }
                    
                    if (studentData) {
                        console.log('Found existing student record:', studentData);
                        setStudentRecord(studentData);
                    } else {
                        // If no record with email, try with name
                        const { data: studentByName, error: nameError } = await supabase
                            .from('students')
                            .select('*')
                            .eq('parent_id', fullInvitation.primary_account_id)
                            .ilike('student_name', fullInvitation.invitee_name)
                            .maybeSingle();
                        
                        if (nameError && nameError.code !== 'PGRST116') {
                            console.error('Error checking student record by name:', nameError);
                        }
                        
                        if (studentByName) {
                            console.log('Found existing student record by name:', studentByName);
                            setStudentRecord(studentByName);
                        }
                    }
                }
                return;
            }

            // If the RPC function doesn't exist or fails, fall back to the direct query
            if (rpcError && rpcError.code === 'PGRST301') {
                console.log('RPC function not found, falling back to direct query');
            } else if (rpcError) {
                console.error('Error with RPC function:', rpcError);
            }

            // First try to find the invitation in the household_invitations table
            const { data: invitationData, error: invitationError } = await supabase
                .from('household_invitations')
                .select(`
                    *,
                    households:household_id (
                        name,
                        primary_account_id
                    )
                `)
                .eq('invitation_token', token)
                .eq('status', 'pending')
                .single();

            console.log('Household invitation query result:', { 
                data: invitationData, 
                error: invitationError
            });

            if (invitationError) {
                console.error('Household invitation query error:', invitationError);
                
                // Check if the error is because the invitation doesn't exist
                if (invitationError.code === 'PGRST116') {
                    console.log('No invitation found in household_invitations, checking if student_invitations table exists...');
                    
                    // Try to check if the student_invitations table exists
                    try {
                        const { data, error } = await supabase
                            .from('student_invitations')
                            .select('*')
                            .limit(1);
                        
                        if (error) {
                            console.error('Error checking student_invitations table:', error);
                            throw new Error('Invitation not found or has expired. Please contact the person who invited you.');
                        }
                    } catch (tableError) {
                        console.error('Error checking student_invitations table:', tableError);
                        throw new Error('Invitation not found or has expired. Please contact the person who invited you.');
                    }
                } else {
                    throw invitationError;
                }
            }

            if (!invitationData) {
                console.error('No invitation found for token:', token);
                throw new Error('Invitation not found or has already been used');
            }

            // Check if the invitation has expired
            const expiryDate = new Date(invitationData.expires_at);
            const now = new Date();
            if (expiryDate < now) {
                console.error('Invitation has expired:', expiryDate);
                throw new Error('This invitation has expired. Please ask for a new invitation.');
            }

            const fullInvitation = {
                ...invitationData,
                household_name: invitationData.households.name
            };

            console.log('Full invitation data:', fullInvitation);

            setInvitation(fullInvitation);
            
            // Check if user already exists
            const { data: existingUser, error: userError } = await supabase
                .from('account_profiles')
                .select('*')
                .eq('email', fullInvitation.invitee_email)
                .maybeSingle();

            if (userError) {
                console.error('Error checking existing user:', userError);
            }

            console.log('Existing user check:', { existingUser, userError });

            setHasExistingAccount(!!existingUser);
            if (existingUser) {
                setName(existingUser.name);
            } else {
                setName(fullInvitation.invitee_name);
            }

            // If this is a student invitation, check if there's already a student record
            if (fullInvitation.member_type === 'student') {
                // Check if parent has already created a student record for this email
                const { data: studentData, error: studentError } = await supabase
                    .from('students')
                    .select('*')
                    .eq('parent_id', fullInvitation.households.primary_account_id)
                    .eq('student_email', fullInvitation.invitee_email)
                    .maybeSingle();
                
                if (studentError && studentError.code !== 'PGRST116') {
                    console.error('Error checking student record:', studentError);
                }
                
                if (studentData) {
                    console.log('Found existing student record:', studentData);
                    setStudentRecord(studentData);
                } else {
                    // If no record with email, try with name
                    const { data: studentByName, error: nameError } = await supabase
                        .from('students')
                        .select('*')
                        .eq('parent_id', fullInvitation.households.primary_account_id)
                        .ilike('student_name', fullInvitation.invitee_name)
                        .maybeSingle();
                    
                    if (nameError && nameError.code !== 'PGRST116') {
                        console.error('Error checking student record by name:', nameError);
                    }
                    
                    if (studentByName) {
                        console.log('Found existing student record by name:', studentByName);
                        setStudentRecord(studentByName);
                    }
                }
            }

        } catch (error) {
            console.error('Error verifying invitation:', error);
            setError(error.message || 'Failed to verify invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvitation = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);

            if (!hasExistingAccount) {
                if (!name) throw new Error('Name is required');
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }

                // Create new user account
                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email: invitation.invitee_email,
                    password: password,
                    options: {
                        data: {
                            name: name,
                            user_type: 'student'
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // If we found a student record, link it using the new function
                if (studentRecord) {
                    const { data: linkResult, error: linkError } = await supabase.rpc(
                        'link_student_account_v2',
                        {
                            p_student_id: studentRecord.id,
                            p_user_id: authData.user.id,
                            p_parent_id: invitation.primary_account_id
                        }
                    );

                    if (linkError) {
                        console.error('Error linking student account:', linkError);
                        throw new Error('Failed to link student account');
                    }

                    if (!linkResult.success) {
                        console.error('Failed to link student account:', linkResult.message);
                        throw new Error(linkResult.message);
                    }
                } else {
                    // Create a new student record if one doesn't exist
                    const { data: newStudent, error: createError } = await supabase
                        .from('students')
                        .insert([{
                            user_id: authData.user.id,
                            parent_id: invitation.primary_account_id,
                            student_name: name,
                            student_email: invitation.invitee_email
                        }])
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error('Error creating student record:', createError);
                        throw new Error('Failed to create student record');
                    }

                    // Link the newly created student record
                    const { data: linkResult, error: linkError } = await supabase.rpc(
                        'link_student_account_v2',
                        {
                            p_student_id: newStudent.id,
                            p_user_id: authData.user.id,
                            p_parent_id: invitation.primary_account_id
                        }
                    );

                    if (linkError) {
                        console.error('Error linking new student account:', linkError);
                        throw new Error('Failed to link student account');
                    }

                    if (!linkResult.success) {
                        console.error('Failed to link new student account:', linkResult.message);
                        throw new Error(linkResult.message);
                    }
                }

                // Accept the invitation
                const { data: acceptResult, error: acceptError } = await supabase.rpc(
                    'accept_student_invitation',
                    {
                        p_token: token,
                        p_user_id: authData.user.id
                    }
                );

                if (acceptError) {
                    console.error('Error accepting invitation:', acceptError);
                    throw new Error('Failed to accept invitation');
                }

            } else {
                // Handle existing account
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) throw new Error('No authenticated user found');

                // If we found a student record, link it using the new function
                if (studentRecord) {
                    const { data: linkResult, error: linkError } = await supabase.rpc(
                        'link_student_account_v2',
                        {
                            p_student_id: studentRecord.id,
                            p_user_id: user.id,
                            p_parent_id: invitation.primary_account_id
                        }
                    );

                    if (linkError) {
                        console.error('Error linking student account:', linkError);
                        throw new Error('Failed to link student account');
                    }

                    if (!linkResult.success) {
                        console.error('Failed to link student account:', linkResult.message);
                        throw new Error(linkResult.message);
                    }
                } else {
                    // Create a new student record if one doesn't exist
                    const { data: newStudent, error: createError } = await supabase
                        .from('students')
                        .insert([{
                            user_id: user.id,
                            parent_id: invitation.primary_account_id,
                            student_name: name,
                            student_email: invitation.invitee_email
                        }])
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error('Error creating student record:', createError);
                        throw new Error('Failed to create student record');
                    }

                    // Link the newly created student record
                    const { data: linkResult, error: linkError } = await supabase.rpc(
                        'link_student_account_v2',
                        {
                            p_student_id: newStudent.id,
                            p_user_id: user.id,
                            p_parent_id: invitation.primary_account_id
                        }
                    );

                    if (linkError) {
                        console.error('Error linking new student account:', linkError);
                        throw new Error('Failed to link student account');
                    }

                    if (!linkResult.success) {
                        console.error('Failed to link new student account:', linkResult.message);
                        throw new Error(linkResult.message);
                    }
                }

                // Accept the invitation
                const { data: acceptResult, error: acceptError } = await supabase.rpc(
                    'accept_student_invitation',
                    {
                        p_token: token,
                        p_user_id: user.id
                    }
                );

                if (acceptError) {
                    console.error('Error accepting invitation:', acceptError);
                    throw new Error('Failed to accept invitation');
                }
            }

            // Navigate to login or dashboard
            navigate(hasExistingAccount ? '/' : '/login-selection');

        } catch (error) {
            console.error('Error accepting invitation:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
                <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-6)' }}>
                    <Container maxWidth="var(--container-max-width)">
                        <PageHeader>Invalid Invitation</PageHeader>
                        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                    </Container>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-6)' }}>
                <Container maxWidth="var(--container-max-width)">
                    <PageHeader>Join {invitation.household_name}</PageHeader>
                    <DescriptiveText>
                        You've been invited to join {invitation.household_name} on YourEDU as a {invitation.member_type}.
                        {hasExistingAccount 
                            ? ' Link your existing account to access shared resources.'
                            : ' Create your account to get started.'}
                    </DescriptiveText>
                </Container>
            </Box>

            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        {hasExistingAccount ? 'Link Your Account' : 'Create Your Account'}
                    </Typography>
                    
                    <form onSubmit={handleAcceptInvitation}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={invitation.invitee_email}
                            disabled
                            sx={{ mb: 2 }}
                        />
                        {!hasExistingAccount && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    sx={{ mb: 3 }}
                                />
                            </>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                backgroundColor: 'hsl(var(--brand-primary))',
                                '&:hover': {
                                    backgroundColor: 'hsl(var(--brand-primary-dark))',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : (
                                hasExistingAccount ? 'Join Household' : 'Create Account'
                            )}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default StudentInvitation; 