import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  LocalOffer as TicketIcon,
  Star as InterestedIcon,
  CheckCircle as GoingIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';

const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('about');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [guestList, setGuestList] = useState({ going: [], interested: [] });
  const [userResponse, setUserResponse] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          host:host_id(id, email, name)
        `)
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Fetch guest responses
      const { data: responses, error: responsesError } = await supabase
        .from('event_responses')
        .select(`
          *,
          user:user_id(id, email, name)
        `)
        .eq('event_id', eventId);

      if (responsesError) throw responsesError;

      // Fetch user's response if logged in
      if (user) {
        const { data: userResp } = await supabase
          .from('event_responses')
          .select('response_type')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single();
        
        setUserResponse(userResp?.response_type || null);
      }

      setEvent(eventData);
      setHost(eventData.host);
      setGuestList({
        going: responses.filter(r => r.response_type === 'going'),
        interested: responses.filter(r => r.response_type === 'interested')
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (responseType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (userResponse) {
        // Update existing response
        if (userResponse === responseType) {
          // Remove response if clicking the same button
          await supabase
            .from('event_responses')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', user.id);
          setUserResponse(null);
        } else {
          // Change response type
          await supabase
            .from('event_responses')
            .update({ response_type: responseType })
            .eq('event_id', eventId)
            .eq('user_id', user.id);
          setUserResponse(responseType);
        }
      } else {
        // Create new response
        await supabase
          .from('event_responses')
          .insert([{
            event_id: eventId,
            user_id: user.id,
            response_type: responseType
          }]);
        setUserResponse(responseType);
      }

      // Refresh guest list
      fetchEventDetails();
    } catch (error) {
      console.error('Error updating response:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Event not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', py: 2, mb: 3 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
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
        </Container>
      </Box>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a365d', mb: 2 }}>
                  {event.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={event.category}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 53, 107, 0.1)',
                      color: '#00356b',
                    }}
                  />
                  <Chip
                    icon={event.is_public ? <PublicIcon /> : <LockIcon />}
                    label={event.is_public ? 'Public Event' : 'Private Event'}
                    size="small"
                    sx={{
                      backgroundColor: event.is_public ? 'rgba(72, 187, 120, 0.1)' : 'rgba(237, 137, 54, 0.1)',
                      color: event.is_public ? '#2f855a' : '#c05621',
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant={userResponse === 'going' ? 'contained' : 'outlined'}
                  startIcon={<GoingIcon />}
                  onClick={() => handleResponse('going')}
                  sx={{
                    backgroundColor: userResponse === 'going' ? '#00356b' : 'transparent',
                    '&:hover': {
                      backgroundColor: userResponse === 'going' ? '#002548' : 'rgba(0, 53, 107, 0.08)',
                    },
                  }}
                >
                  {userResponse === 'going' ? 'Going' : 'Go'}
                </Button>
                <Button
                  variant={userResponse === 'interested' ? 'contained' : 'outlined'}
                  startIcon={<InterestedIcon />}
                  onClick={() => handleResponse('interested')}
                  sx={{
                    backgroundColor: userResponse === 'interested' ? '#00356b' : 'transparent',
                    '&:hover': {
                      backgroundColor: userResponse === 'interested' ? '#002548' : 'rgba(0, 53, 107, 0.08)',
                    },
                  }}
                >
                  Interested
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                >
                  Share
                </Button>
              </Box>

              <Tabs
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="About" value="about" />
                <Tab label="Discussion" value="discussion" />
                {event.ticket_url && <Tab label="Tickets" value="tickets" />}
              </Tabs>

              {currentTab === 'about' && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                    {event.about_text || event.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CalendarIcon sx={{ color: '#00356b' }} />
                        <Typography>
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocationIcon sx={{ color: '#00356b' }} />
                        <Box>
                          <Typography>{event.venue_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.street_address}
                            {event.city && `, ${event.city}`}
                            {event.state && `, ${event.state}`}
                            {event.zip && ` ${event.zip}`}
                          </Typography>
                        </Box>
                      </Box>

                      {!event.is_free && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TicketIcon sx={{ color: '#00356b' }} />
                          <Typography>
                            ${event.ticket_price} - <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">Get Tickets</a>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {host && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Host</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#00356b' }}>
                          {host.name ? host.name[0].toUpperCase() : <PersonIcon />}
                        </Avatar>
                        <Typography>{host.name || host.email}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {currentTab === 'discussion' && (
                <Box>
                  <Typography variant="body1" color="text.secondary">
                    Discussion feature coming soon!
                  </Typography>
                </Box>
              )}

              {currentTab === 'tickets' && event.ticket_url && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Tickets</Typography>
                  <Button
                    variant="contained"
                    startIcon={<TicketIcon />}
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: '#00356b',
                      '&:hover': {
                        backgroundColor: '#002548',
                      },
                    }}
                  >
                    Get Tickets - ${event.ticket_price}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Guest List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Guest List</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Going ({guestList.going.length})
                </Typography>
                <List dense>
                  {guestList.going.slice(0, 5).map((response) => (
                    <ListItem key={response.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#00356b' }}>
                          {response.user.name ? response.user.name[0].toUpperCase() : <PersonIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={response.user.name || response.user.email}
                      />
                    </ListItem>
                  ))}
                </List>
                {guestList.going.length > 5 && (
                  <Button sx={{ mt: 1 }}>
                    See all ({guestList.going.length})
                  </Button>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Interested ({guestList.interested.length})
                </Typography>
                <List dense>
                  {guestList.interested.slice(0, 5).map((response) => (
                    <ListItem key={response.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#4a5568' }}>
                          {response.user.name ? response.user.name[0].toUpperCase() : <PersonIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={response.user.name || response.user.email}
                      />
                    </ListItem>
                  ))}
                </List>
                {guestList.interested.length > 5 && (
                  <Button sx={{ mt: 1 }}>
                    See all ({guestList.interested.length})
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventPage; 