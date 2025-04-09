import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseClient';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Share as ShareIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import RegistrationPrompt from '../components/RegistrationPrompt';
import AuthWrapper from '../components/AuthWrapper';

const PublicEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const handleNavigation = (path) => {
    if (!user) {
      setShowRegistrationPrompt(true);
    } else {
      navigate(path);
    }
  };

  const handleInteraction = (path) => {
    if (!user) {
      setShowRegistrationPrompt(true);
      return true;
    }
    return false;
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

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Event not found');
        return;
      }

      // Only allow access to public events for non-logged-in users
      if (!user && !data.is_public) {
        setError('This event is private');
        return;
      }

      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([
          { event_id: eventId, user_id: user.id }
        ]);

      if (error) throw error;

      await fetchEventDetails();
      setSnackbar({
        open: true,
        message: 'Successfully registered for event!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error registering for event:', err);
      setSnackbar({
        open: true,
        message: 'Failed to register for event',
        severity: 'error'
      });
    }
  };

  const handleShare = () => {
    const eventUrl = window.location.href;
    navigator.clipboard.writeText(eventUrl);
    setSnackbar({
      open: true,
      message: 'Event link copied to clipboard!',
      severity: 'success'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: 2,
        p: 3,
      }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleNavigation('/login')}
          sx={{
            backgroundColor: '#00356b',
            '&:hover': {
              backgroundColor: '#002548',
            },
          }}
        >
          Log In
        </Button>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Typography>Event not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', py: 2, mb: 3 }}>
        <Container maxWidth="lg">
          <AuthWrapper>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => handleNavigation('/events')}
              sx={{
                color: '#00356b',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(0, 53, 107, 0.08)',
                },
              }}
            >
              Back to Events
            </Button>
          </AuthWrapper>
        </Container>
      </Box>
      <Container maxWidth="lg">
        <Card sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}>
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  color: '#1a365d',
                  mb: 2,
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {event.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={event.category}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 53, 107, 0.1)',
                      color: '#00356b',
                      fontWeight: 500,
                    }}
                  />
                  <Chip
                    icon={event.is_public ? <PublicIcon /> : <LockIcon />}
                    label={event.is_public ? 'Public Event' : 'Private Event'}
                    size="small"
                    sx={{
                      backgroundColor: event.is_public ? 'rgba(72, 187, 120, 0.1)' : 'rgba(237, 137, 54, 0.1)',
                      color: event.is_public ? '#2f855a' : '#c05621',
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => handleInteraction(handleShare)}
                sx={{
                  color: '#00356b',
                  borderColor: '#00356b',
                  '&:hover': {
                    borderColor: '#002548',
                    backgroundColor: 'rgba(0, 53, 107, 0.08)',
                  },
                }}
              >
                Share
              </Button>
            </Box>

            <Typography sx={{ 
              color: '#4a5568',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              mb: 4,
              fontFamily: "'Inter', sans-serif",
            }}>
              {event.description}
            </Typography>

            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mb: 4,
              p: 3,
              backgroundColor: '#f8fafc',
              borderRadius: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon sx={{ color: '#00356b' }} />
                <Typography>
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationIcon sx={{ color: '#00356b' }} />
                <Typography>{event.location}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon sx={{ color: '#00356b' }} />
                <Typography>
                  {event.current_attendees} / {event.max_attendees} attendees
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <AuthWrapper>
                <Button
                  variant="contained"
                  onClick={handleRegister}
                  sx={{
                    backgroundColor: '#00356b',
                    '&:hover': {
                      backgroundColor: '#002548',
                    },
                  }}
                >
                  Register for Event
                </Button>
              </AuthWrapper>
              <AuthWrapper>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  sx={{
                    borderColor: '#00356b',
                    color: '#00356b',
                    '&:hover': {
                      borderColor: '#002548',
                      backgroundColor: 'rgba(0, 53, 107, 0.08)',
                    },
                  }}
                >
                  Share
                </Button>
              </AuthWrapper>
            </Box>
          </Box>
        </Card>
      </Container>
      <RegistrationPrompt 
        open={showRegistrationPrompt}
        onClose={() => setShowRegistrationPrompt(false)}
        targetPath={`/events/${eventId}`}
        onSnackbarMessage={(message) => setSnackbar({ ...message, open: true })}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PublicEvent; 