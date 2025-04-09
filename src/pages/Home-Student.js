import React, { useState } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box,
    List,
    IconButton,
    Button,
    Chip
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Chat as ChatIcon,
    Phone as PhoneIcon,
    Add as AddIcon,
    Assignment as AssignmentIcon,
    Circle as CircleIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import ChatBot from '../components/ChatBot';

const mockAnnouncements = [
    {
        id: 1,
        title: 'New Community Event',
        subtitle: 'Join our upcoming virtual meetup this weekend',
        date: 'Just now'
    },
    {
        id: 2,
        title: 'New Perk Available',
        subtitle: 'Access to Khan Academy Pro - Click to learn more',
        date: '1 day ago'
    },
    {
        id: 3,
        title: 'Community Achievement',
        subtitle: 'Your recent post received 10 helpful votes',
        date: '2 days ago'
    },
    {
        id: 4,
        title: 'Resource Library Update',
        subtitle: 'New SAT prep materials added',
        date: '3 days ago'
    }
];

const mockCalendarEvents = [
    {
        id: 1,
        title: 'Webinar: Homeschool to College',
        subtitle: 'Join us for expert insights on college admissions',
        date: 'Jan 15, 1:00 PM'
    },
    {
        id: 2,
        title: 'Compliance Reminder: PSA Filing',
        subtitle: 'Private School Affidavit Due',
        date: 'Jan 1, 2025'
    },
    {
        id: 3,
        title: 'Math Course Deadline',
        date: 'Tomorrow, 3:00 PM'
    },
    {
        id: 4,
        title: 'Community Meetup',
        date: 'Jan 25, 2:00 PM'
    }
];

const mockTodos = [
    { text: 'Complete Math Module 3 Assessment', dueDate: '2024-01-25' },
    { text: 'Submit Science Lab Report', dueDate: '2024-01-28' },
    { text: 'Register for Spring Semester', dueDate: '2024-02-01' }
];

const HomeStudent = () => {
    const { user } = useAuth();
    const firstName = (user?.name?.split(' ')[0] || user?.firstName || user?.email?.split('@')[0] || 'Student')
        .split('')
        .map((char, idx) => idx === 0 ? char.toUpperCase() : char.toLowerCase())
        .join('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    const formatDeadline = (date) => {
        const deadline = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (deadline.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (deadline.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            pt: 3,
            pb: 6
        }}>
            <Container maxWidth="xl">
                {/* Welcome Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700,
                            color: '#1a365d',
                            mb: 1
                        }}
                    >
                        Welcome back, {firstName}
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            color: '#4a5568',
                            maxWidth: '800px'
                        }}
                    >
                        Continue your educational journey with YourEDU. Track your progress, manage assignments, and stay connected with your learning community.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Content Area */}
                    <Grid item xs={12} md={8}>
                        {/* Quick Actions */}
                        <Box sx={{ mb: 3 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: '#2d3748',
                                    mb: 2
                                }}
                            >
                                Student Tools
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { title: 'My Courses', icon: AssignmentIcon, color: '#4299e1', path: '/my-courses' },
                                    { title: 'Calendar', icon: CalendarIcon, color: '#48bb78', path: '/calendar' },
                                    { title: 'Messages', icon: ChatIcon, color: '#ed8936', path: '/messages' },
                                    { title: 'Support', icon: PhoneIcon, color: '#9f7aea', path: '/support' }
                                ].map((action) => (
                                    <Grid item xs={6} sm={3} key={action.title}>
                                        <Paper
                                            component={Link}
                                            to={action.path}
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 1,
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textDecoration: 'none',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: `${action.color}15`
                                                }}
                                            >
                                                <action.icon sx={{ color: action.color }} />
                                            </Box>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: '#2d3748',
                                                    fontWeight: 500,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {action.title}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Calendar Events */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                borderRadius: 3,
                                mb: 3,
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                    Upcoming Events
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/calendar"
                                    startIcon={<CalendarIcon />}
                                    sx={{
                                        color: '#4299e1',
                                        '&:hover': { backgroundColor: '#ebf8ff' }
                                    }}
                                >
                                    View Calendar
                                </Button>
                            </Box>
                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {mockCalendarEvents.map((event) => (
                                    <Paper
                                        key={event.id}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: '#f7fafc',
                                            border: '1px solid #edf2f7'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                    {event.title}
                                                </Typography>
                                                {event.subtitle && (
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        {event.subtitle}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Chip 
                                                label={event.date}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#e2e8f0',
                                                    color: '#4a5568',
                                                    fontWeight: 500
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Right Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Todo List */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                borderRadius: 3,
                                mb: 3,
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                    Tasks
                                </Typography>
                                <IconButton 
                                    size="small"
                                    sx={{
                                        backgroundColor: '#ebf8ff',
                                        color: '#4299e1',
                                        '&:hover': {
                                            backgroundColor: '#bee3f8'
                                        }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {mockTodos.map((todo, index) => (
                                    <Paper
                                        key={index}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: '#f7fafc',
                                            border: '1px solid #edf2f7'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                            <CircleIcon sx={{ fontSize: 12, color: '#cbd5e0', mt: 1 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ color: '#2d3748', mb: 0.5 }}>
                                                    {todo.text}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                                    Due: {formatDeadline(todo.dueDate)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))}
                            </List>
                        </Paper>

                        {/* Announcements */}
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 3, 
                                borderRadius: 3,
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
                                Announcements
                            </Typography>
                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {mockAnnouncements.map((announcement) => (
                                    <Paper
                                        key={announcement.id}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: '#f7fafc',
                                            border: '1px solid #edf2f7'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                                {announcement.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#718096' }}>
                                                {announcement.date}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                                            {announcement.subtitle}
                                        </Typography>
                                    </Paper>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            
            {/* Chat Bot */}
            {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} />}
        </Box>
    );
};

export default HomeStudent; 