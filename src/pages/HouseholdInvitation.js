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

const HouseholdInvitation = () => {
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
            console.log('Verifying invitation with token:', token);

            // Get the invitation with household name
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

            console.log('Invitation query result:', { 
                data: invitationData, 
                error: invitationError
            });

            if (invitationError) {
                console.error('Invitation query error:', invitationError);
                throw invitationError;
            }

            if (!invitationData) {
                console.error('No invitation found for token:', token);
                throw new Error('Invitation not found or has already been used');
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
                            user_type: invitation.member_type
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // Check if profile already exists
                const { data: existingProfile } = await supabase
                    .from('account_profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                // Only create profile if it doesn't exist
                if (!existingProfile) {
                    const { error: profileError } = await supabase
                        .from('account_profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                name: name,
                                email: invitation.invitee_email,
                                user_type: invitation.member_type
                            }
                        ]);

                    if (profileError) throw profileError;
                }

                // Add to household members using the new function
                const { data: memberData, error: memberError } = await supabase
                    .rpc('insert_household_member_from_invitation', {
                        p_user_id: authData.user.id,
                        p_household_id: invitation.household_id,
                        p_member_type: invitation.member_type
                    });

                if (memberError) throw memberError;

                // If this is a student account and we found a student record, link them
                if (invitation.member_type === 'student' && studentRecord) {
                    const { data: linkData, error: linkError } = await supabase
                        .rpc('link_student_account', {
                            p_student_id: studentRecord.id,
                            p_user_id: authData.user.id
                        });
                    
                    if (linkError) {
                        console.error('Error linking student account:', linkError);
                        // Don't throw here, we'll still allow the user to continue
                    } else {
                        console.log('Successfully linked student account');
                    }
                } else if (invitation.member_type === 'student') {
                    // Create a new student record if one doesn't exist
                    const { data: newStudent, error: createError } = await supabase
                        .from('students')
                        .insert([{
                            user_id: authData.user.id,
                            parent_id: invitation.households.primary_account_id,
                            student_name: name,
                            student_email: invitation.invitee_email
                        }])
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error('Error creating student record:', createError);
                        // Don't throw here, we'll still allow the user to continue
                    } else {
                        console.log('Created new student record:', newStudent);
                    }
                }

            } else {
                // Get current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) throw new Error('No authenticated user found');

                // Add existing user to household using the new function
                const { data: memberData, error: memberError } = await supabase
                    .rpc('insert_household_member_from_invitation', {
                        p_user_id: user.id,
                        p_household_id: invitation.household_id,
                        p_member_type: invitation.member_type
                    });

                if (memberError) throw memberError;

                // If this is a student account and we found a student record, link them
                if (invitation.member_type === 'student' && studentRecord) {
                    const { data: linkData, error: linkError } = await supabase
                        .rpc('link_student_account', {
                            p_student_id: studentRecord.id,
                            p_user_id: user.id
                        });
                    
                    if (linkError) {
                        console.error('Error linking student account:', linkError);
                        // Don't throw here, we'll still allow the user to continue
                    } else {
                        console.log('Successfully linked student account');
                    }
                } else if (invitation.member_type === 'student') {
                    // Create a new student record if one doesn't exist
                    const { data: newStudent, error: createError } = await supabase
                        .from('students')
                        .insert([{
                            user_id: user.id,
                            parent_id: invitation.households.primary_account_id,
                            student_name: name,
                            student_email: invitation.invitee_email
                        }])
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error('Error creating student record:', createError);
                        // Don't throw here, we'll still allow the user to continue
                    } else {
                        console.log('Created new student record:', newStudent);
                    }
                }
            }

            // Update invitation status
            const { error: updateError } = await supabase
                .from('household_invitations')
                .update({ 
                    status: 'accepted',
                    accepted_at: new Date().toISOString()
                })
                .eq('invitation_token', token);

            if (updateError) throw updateError;

            // Navigate to login or dashboard
            navigate(hasExistingAccount ? '/' : '/login');

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

export default HouseholdInvitation; 