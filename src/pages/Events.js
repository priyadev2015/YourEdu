import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  Share as ShareIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { BsEyeSlash } from 'react-icons/bs';
import { PageHeader, FeatureHeader, SupportingText } from '../components/ui/typography';
import { cardStyles } from '../styles/theme/components/cards';
import {
  fetchPublicEvents,
  fetchUserCreatedEvents,
  fetchUserRegisteredEvents,
  createEvent,
  registerForEvent,
  cancelRegistration,
  deleteEvent,
} from '../utils/supabase/events';
import PilotNotification from '../components/ui/PilotNotification';

// Event categories from before
const EVENT_CATEGORIES = [
  'General',
  'Homeschooling Meet-Ups',
  'In-Person Classes',
  'Online Classes',
  'Co-op Invitations',
  'College Webinars',
  'Study Groups',
  'Educational Workshops',
  'Parent Meetings',
  'Social Gatherings',
];

// Add font import
const fontImport = document.createElement('link');
fontImport.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
fontImport.rel = 'stylesheet';
document.head.appendChild(fontImport);

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for tabs
  const [myEventsTab, setMyEventsTab] = useState(0);
  const [timeFilter, setTimeFilter] = useState(0);
  
  // Get current tab from URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.endsWith('/my-events')) return 1;
    return 0; // Default to explore tab
  };

  useEffect(() => {
    // If at root /events path, redirect to /events/explore
    if (location.pathname === '/events') {
      navigate('/events/explore', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  // State for events and filters
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // State for create event dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    time: '12:00',
    location: '',
    maxAttendees: '',
    isPublic: true,
  });
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Add new state for menu handling
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Fetch events based on current view
  const fetchEvents = async () => {
    setLoading(true);
    try {
      let fetchedEvents = [];
      if (getCurrentTab() === 0) { // Explore Events
        console.log('Fetching public events...');
        fetchedEvents = await fetchPublicEvents();
        console.log('Fetched public events:', fetchedEvents);
      } else if (user) { // My Events
        if (myEventsTab === 0) { // Created Events
          console.log('Fetching created events...');
          fetchedEvents = await fetchUserCreatedEvents(user.id);
        } else { // Registered Events
          console.log('Fetching registered events...');
          fetchedEvents = await fetchUserRegisteredEvents(user.id);
        }
      }
      setEvents(fetchedEvents || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setSnackbar({ open: true, message: 'Error fetching events', severity: 'error' });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when tabs change or after creating an event
  useEffect(() => {
    console.log('Effect triggered - myEventsTab:', myEventsTab);
    fetchEvents();
  }, [myEventsTab, user?.id]);

  // Filter events based on search and category
  const getFilteredEvents = () => {
    console.log('Filtering events:', events);
    const now = new Date();
    let filteredEvents = [...events];

    // Apply search and category filters
    filteredEvents = filteredEvents.filter(event => {
      const matchesSearch = !searchQuery || 
        (event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         event.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Apply time filter
    const eventDate = (event) => {
      try {
        if (!event.date || !event.time) return new Date(0);
        const [hours, minutes] = event.time.split(':');
        const date = new Date(event.date);
        date.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);
        return date;
      } catch (error) {
        console.error('Error parsing date:', error);
        return new Date(0);
      }
    };

    if (timeFilter === 0) { // Upcoming
      filteredEvents = filteredEvents.filter(event => {
        const date = eventDate(event);
        return date >= now;
      });
    } else { // Past
      filteredEvents = filteredEvents.filter(event => {
        const date = eventDate(event);
        return date < now;
      });
    }

    console.log('Filtered events:', filteredEvents);
    return filteredEvents;
  };

  const handleCreateEvent = async () => {
    try {
      // Validate time format
      if (!newEvent.time || !newEvent.time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        setSnackbar({
          open: true,
          message: 'Please enter a valid time in HH:MM format',
          severity: 'error',
        });
        return;
      }

      console.log('Creating new event with data:', {
        ...newEvent,
        userId: user.id,
      });
      
      const createdEvent = await createEvent({
        ...newEvent,
        userId: user.id,
      });
      
      console.log('Event created successfully:', createdEvent);
      
      setOpenCreateDialog(false);
      setSnackbar({
        open: true,
        message: 'Event created successfully!',
        severity: 'success',
      });
      
      // Reset form
      setNewEvent({
        title: '',
        category: '',
        description: '',
        date: '',
        time: '12:00',
        location: '',
        maxAttendees: '',
        isPublic: true,
      });
      
      // Set tab to "My Events" -> "Created Events"
      setMyEventsTab(0);
      
      // Update events list immediately
      setEvents(prevEvents => [...prevEvents, createdEvent]);
      
      // Then fetch fresh data
      fetchEvents();
      
    } catch (error) {
      console.error('Error creating event:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create event. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await registerForEvent(eventId, user.id);
      setSnackbar({
        open: true,
        message: 'Successfully registered for event!',
        severity: 'success',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to register for event. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      await cancelRegistration(eventId, user.id);
      setSnackbar({
        open: true,
        message: 'Registration cancelled successfully!',
        severity: 'success',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel registration. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleShareEvent = (eventId) => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(eventUrl);
    setSnackbar({
      open: true,
      message: 'Event link copied to clipboard!',
      severity: 'success',
    });
  };

  // Add menu handlers
  const handleMenuOpen = (event, eventId) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedEventId(eventId);
  };

  const handleMenuClose = (event) => {
    event?.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    handleMenuClose(event);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEventId) {
      console.error('No event selected for deletion');
      return;
    }

    try {
      console.log('Attempting to delete event:', selectedEventId);
      await deleteEvent(selectedEventId, user.id);
      setSnackbar({
        open: true,
        message: 'Event deleted successfully!',
        severity: 'success',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete event. Please try again.',
        severity: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSelectedEventId(null);
    }
  };

  // Check if user is registered for an event
  const isRegistered = (event) => {
    return event.registrations?.some(reg => reg.user_id === user?.id);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-6)' }}>
        <Container 
          maxWidth="var(--container-max-width)"
          sx={{ 
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--container-padding-y)',
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ position: 'relative', height: '2.5rem' }}>
            <PageHeader>Events</PageHeader>
            <PilotNotification message="Register for YourEDU's first Homeschool to College Webinar. Discover events in your area soon." />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="var(--container-max-width)"
        sx={{ 
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-6)',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        {/* Tabs Section */}
        <Paper 
          elevation={0}
          sx={{
            ...cardStyles.feature,
            mb: 'var(--spacing-4)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { label: 'Explore Events', path: '/events/explore' },
              { label: 'My Events', path: '/events/my-events' }
            ].map((tab, index) => (
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
                  }}
                >
                  {tab.label}
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
                { label: 'Created Events', value: 0 },
                { label: 'Attending Events', value: 1 }
              ].map((tab) => (
                <Box
                  key={tab.value}
                  onClick={() => setMyEventsTab(tab.value)}
                  sx={{
                    py: 2,
                    px: 3,
                    color: myEventsTab === tab.value ? 'hsl(var(--brand-primary))' : 'hsl(var(--text-secondary))',
                    borderBottom: myEventsTab === tab.value ? '2px solid hsl(var(--brand-primary))' : 'none',
                    '&:hover': {
                      color: 'hsl(var(--brand-primary))',
                    },
                    cursor: 'pointer',
                    fontWeight: myEventsTab === tab.value ? 600 : 500,
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {tab.label}
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Filters Section */}
        <Paper 
          elevation={0}
          sx={{
            ...cardStyles.feature,
            mb: 'var(--spacing-4)',
          }}
        >
          <Box sx={{ p: 'var(--spacing-4)' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'hsl(var(--text-secondary))', mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--radius-lg)',
                      '& fieldset': {
                        borderColor: 'hsl(var(--border))',
                      },
                      '&:hover fieldset': {
                        borderColor: 'hsl(var(--border-hover))',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{
                      borderRadius: 'var(--radius-lg)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--border))',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--border-hover))',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                    }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {EVENT_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                {window.location.hostname === 'localhost' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenCreateDialog(true)}
                      sx={{
                        backgroundColor: 'hsl(var(--brand-primary))',
                        color: 'hsl(var(--background))',
                        borderRadius: 'var(--radius-lg)',
                        textTransform: 'none',
                        py: 'var(--spacing-2)',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--brand-primary-dark))',
                        },
                      }}
                    >
                      Create Event
                    </Button>
                    <BsEyeSlash
                      style={{
                        fontSize: '16px',
                        color: 'var(--warning-color, #f59e0b)',
                      }}
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Events Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 'var(--spacing-6)' }}>
            <CircularProgress sx={{ color: 'hsl(var(--brand-primary))' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {getFilteredEvents().map(event => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
                <Paper
                  elevation={0}
                  onClick={() => navigate(`/events/${event.id}`)}
                  sx={{ 
                    ...cardStyles.feature,
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 'var(--shadow-lg)',
                      borderColor: 'hsl(var(--brand-primary))',
                    },
                  }}
                >
                  <Box sx={{ p: 'var(--spacing-4)' }}>
                    <Box sx={{ mb: 'var(--spacing-3)' }}>
                      <FeatureHeader sx={{ mb: 'var(--spacing-2)' }}>
                        {event.title}
                      </FeatureHeader>
                      <Chip
                        label={event.category}
                        size="small"
                        sx={{
                          backgroundColor: 'hsl(var(--brand-primary-light))',
                          color: 'hsl(var(--brand-primary))',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 'var(--spacing-2)' }}>
                      <CalendarIcon sx={{ mr: 'var(--spacing-2)', color: 'hsl(var(--text-secondary))', fontSize: 20 }} />
                      <SupportingText>
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </SupportingText>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 'var(--spacing-2)' }}>
                      <LocationIcon sx={{ mr: 'var(--spacing-2)', color: 'hsl(var(--text-secondary))', fontSize: 20 }} />
                      <SupportingText>
                        {event.location}
                      </SupportingText>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 'var(--spacing-2)' }}>
                      <GroupIcon sx={{ mr: 'var(--spacing-2)', color: 'hsl(var(--text-secondary))', fontSize: 20 }} />
                      <SupportingText>
                        {event.current_attendees} / {event.max_attendees} attendees
                      </SupportingText>
                    </Box>
                  </Box>

                  <Box 
                    sx={{
                      mt: 'auto',
                      borderTop: '1px solid',
                      borderColor: 'hsl(var(--border))',
                      p: 'var(--spacing-4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterForEvent(event.id);
                      }}
                      sx={{
                        backgroundColor: 'hsl(var(--brand-primary))',
                        color: 'hsl(var(--background))',
                        borderRadius: 'var(--radius-lg)',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--brand-primary-dark))',
                        },
                      }}
                    >
                      Register
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareEvent(event.id);
                        }}
                        sx={{
                          color: 'hsl(var(--text-secondary))',
                          '&:hover': {
                            backgroundColor: 'hsl(var(--background-alt))',
                          },
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                      {getCurrentTab() === 1 && myEventsTab === 0 && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, event.id)}
                          sx={{
                            color: 'hsl(var(--text-secondary))',
                            '&:hover': {
                              backgroundColor: 'hsl(var(--background-alt))',
                            },
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Create Event Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            fontFamily: "'Inter', sans-serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#2d3748',
          }}
        >
          Create New Event
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                Category
              </InputLabel>
              <Select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                label="Category"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                }}
              >
                {EVENT_CATEGORIES.map(category => (
                  <MenuItem 
                    key={category} 
                    value={category}
                    sx={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
              }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Time"
                  type="time"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value || '12:00' })}
                  inputProps={{
                    step: 300,
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    },
                  }}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Location"
              fullWidth
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
              }}
            />
            
            <TextField
              label="Maximum Attendees"
              type="number"
              fullWidth
              value={newEvent.maxAttendees}
              onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
                '& .MuiOutlinedInput-root': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                },
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newEvent.isPublic}
                  onChange={(e) => setNewEvent({ ...newEvent, isPublic: e.target.checked })}
                />
              }
              label="Make this event public"
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: '#4a5568',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)}
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              color: '#4a5568',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateEvent}
            disabled={!newEvent.title || !newEvent.date || !newEvent.location}
            sx={{ 
              backgroundColor: '#00356b',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': { 
                backgroundColor: '#002548',
              },
              '&.Mui-disabled': {
                backgroundColor: '#e2e8f0',
                color: '#718096',
              },
            }}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-lg)',
          }
        }}
      >
        <MenuItem 
          onClick={handleDeleteClick}
          sx={{
            color: 'error.main',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            '&:hover': {
              backgroundColor: 'error.lighter',
            },
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Event
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#2d3748',
          }}
        >
          Delete Event
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            Are you sure you want to delete this event? This action cannot be undone.
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              color: '#4a5568',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Events; 