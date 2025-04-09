import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Alert, 
  CircularProgress,
  TextField,
  Divider,
  Grid,
  Snackbar
} from '@mui/material';

const UserTypeTest = () => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testFirstName, setTestFirstName] = useState('');
  const [testLastName, setTestLastName] = useState('');
  const [testUserType, setTestUserType] = useState('parent');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestAccount = async () => {
    try {
      setActionLoading(true);
      
      // Validate inputs
      if (!testEmail || !testPassword || !testFirstName || !testLastName) {
        throw new Error('All fields are required');
      }
      
      // Create test account directly with Supabase Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          name: `${testFirstName} ${testLastName}`,
          first_name: testFirstName,
          last_name: testLastName,
          user_type: testUserType
        }
      });

      if (authError) throw authError;
      
      // Create profile for the test user
      const { error: profileError } = await supabase
        .from('account_profiles')
        .insert([{
          id: authData.user.id,
          first_name: testFirstName,
          last_name: testLastName,
          name: `${testFirstName} ${testLastName}`,
          email: testEmail,
          user_type: testUserType
        }]);
        
      if (profileError) throw profileError;
      
      setSnackbar({
        open: true,
        message: `Test ${testUserType} account created successfully: ${testEmail}`,
        severity: 'success'
      });
      
      // Reset form
      setTestEmail('');
      setTestPassword('');
      setTestFirstName('');
      setTestLastName('');
      
    } catch (err) {
      console.error('Error creating test account:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMigrateExistingAccounts = async () => {
    try {
      setActionLoading(true);
      
      // Execute the migration query
      const { data, error } = await supabase.rpc('migrate_user_types_to_parent');
      
      if (error) throw error;
      
      setSnackbar({
        open: true,
        message: `Migration completed: ${data} accounts updated`,
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Error migrating accounts:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login-selection';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, color: 'hsl(var(--brand-primary))' }}>
        User Type Testing Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        {/* Current User Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Current User Information</Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {!user ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>Not Logged In</Typography>
                <Typography sx={{ mb: 3 }}>Please log in to view your user type information.</Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.location.href = '/login-selection'}
                >
                  Go to Login
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>User ID</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.id}</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>Current Portal Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {localStorage.getItem('userType') || 'Not set'}
                  </Typography>
                </Box>
                
                {userProfile && (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>User Type in Database</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'hsl(var(--brand-primary))' }}>
                        {userProfile.user_type || 'Not set'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {userProfile.first_name} {userProfile.last_name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1 }}>Profile Created At</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(userProfile.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                )}
                
                <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Type Matching Status</Typography>
                  {userProfile && localStorage.getItem('userType') === userProfile.user_type ? (
                    <Alert severity="success">
                      Your account type ({userProfile.user_type}) matches the current portal ({localStorage.getItem('userType')}).
                    </Alert>
                  ) : (
                    <Alert severity="warning">
                      Your account type ({userProfile?.user_type || 'unknown'}) does not match the current portal ({localStorage.getItem('userType') || 'unknown'}).
                    </Alert>
                  )}
                </Box>
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleLogout}
                    sx={{ mr: 2 }}
                  >
                    Logout
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => window.location.href = '/login-selection'}
                  >
                    Change Portal
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Test Account Creation */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Create Test Account</Typography>
            
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                margin="normal"
                variant="outlined"
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={testFirstName}
                  onChange={(e) => setTestFirstName(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={testLastName}
                  onChange={(e) => setTestLastName(e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>User Type</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant={testUserType === 'parent' ? 'contained' : 'outlined'}
                    onClick={() => setTestUserType('parent')}
                    sx={{ flex: 1 }}
                  >
                    Parent
                  </Button>
                  <Button 
                    variant={testUserType === 'student' ? 'contained' : 'outlined'}
                    onClick={() => setTestUserType('student')}
                    sx={{ flex: 1 }}
                  >
                    Student
                  </Button>
                  <Button 
                    variant={testUserType === 'highschool' ? 'contained' : 'outlined'}
                    onClick={() => setTestUserType('highschool')}
                    sx={{ flex: 1 }}
                  >
                    Highschool
                  </Button>
                </Box>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCreateTestAccount}
              disabled={actionLoading}
              sx={{ py: 1.5 }}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Create Test Account'}
            </Button>
            
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Bulk Migration</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This will update all existing accounts without a user_type to have the 'parent' user type.
              Use this to migrate your existing accounts.
            </Typography>
            
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleMigrateExistingAccounts}
              disabled={actionLoading}
              sx={{ py: 1.5 }}
            >
              {actionLoading ? <CircularProgress size={24} /> : 'Migrate Existing Accounts'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Testing Instructions */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Testing Instructions</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>1. Create Test Accounts</Typography>
              <Typography variant="body1">
                Create at least one parent account and one student account using the form above.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>2. Test Login Flows</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Try logging in with each account through different portals to test the user type checking:
              </Typography>
              <Box sx={{ pl: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Parent account through student portal (/login/student) - Should show error
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Student account through parent portal (/login/parent) - Should show error
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Parent account through parent portal (/login/parent) - Should work
                </Typography>
                <Typography variant="body1">
                  • Student account through student portal (/login/student) - Should work
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>3. Verify User Type</Typography>
              <Typography variant="body1">
                After logging in, return to this page (/user-type-test) to verify that the user type is correctly set
                and matches the portal you logged in through.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserTypeTest; 