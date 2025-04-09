import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import { StudentDataService } from '../services/StudentDataService';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActionArea,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    Assignment as AssignmentIcon,
    CalendarToday as CalendarIcon,
    Description as DescriptionIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import { cardStyles } from '../styles/theme/components/cards';
import { PageHeader, DescriptiveText } from '../components/ui/typography';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (user) {
            loadStudentData();
        }
    }, [user]);

    const loadStudentData = async () => {
        try {
            setLoading(true);
            
            // Get student data for the current user
            const data = await StudentDataService.getCurrentUserStudentData();
            
            if (!data || data.length === 0) {
                setError('No student data found for your account. Please contact your parent or administrator.');
                setLoading(false);
                return;
            }
            
            // For student accounts, there should only be one record
            const studentRecord = data[0];
            setStudentData(studentRecord);
            
            // Load recent attendance
            const today = new Date();
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(today.getDate() - 14);
            
            const attendanceRecords = await StudentDataService.getAttendanceRecords(
                studentRecord.student_id,
                twoWeeksAgo.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
            );
            
            setRecentAttendance(attendanceRecords);
            
            // Load courses
            const studentCourses = await StudentDataService.getStudentCourses(studentRecord.student_id);
            setCourses(studentCourses);
            
        } catch (error) {
            console.error('Error loading student data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'hsl(var(--success))';
            case 'absent':
                return 'hsl(var(--error))';
            default:
                return 'hsl(var(--muted))';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
            {/* Hero Section */}
            <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-6)' }}>
                <Container maxWidth="var(--container-max-width)">
                    <PageHeader>Student Dashboard</PageHeader>
                    {studentData && (
                        <DescriptiveText>
                            Welcome back, {studentData.student_name}! Here's an overview of your academic progress.
                        </DescriptiveText>
                    )}
                </Container>
            </Box>

            <Container maxWidth="var(--container-max-width)" sx={{ py: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                )}

                {studentData && (
                    <Grid container spacing={3}>
                        {/* Left Column - Quick Links */}
                        <Grid item xs={12} md={4}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    mb: 3
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2,
                                        fontWeight: 600,
                                        color: 'hsl(var(--brand-primary))',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    Quick Links
                                </Typography>
                                
                                <List>
                                    <ListItem 
                                        button 
                                        onClick={() => navigate('/transcript')}
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <ListItemIcon>
                                            <DescriptionIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                                        </ListItemIcon>
                                        <ListItemText primary="Transcript" />
                                    </ListItem>
                                    
                                    <ListItem 
                                        button 
                                        onClick={() => navigate('/course-descriptions')}
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <ListItemIcon>
                                            <MenuBookIcon sx={{ color: 'hsl(var(--brand-secondary))' }} />
                                        </ListItemIcon>
                                        <ListItemText primary="Course Descriptions" />
                                    </ListItem>
                                    
                                    <ListItem 
                                        button 
                                        onClick={() => navigate('/attendance')}
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <ListItemIcon>
                                            <CalendarIcon sx={{ color: 'hsl(var(--brand-tertiary))' }} />
                                        </ListItemIcon>
                                        <ListItemText primary="Attendance Records" />
                                    </ListItem>
                                    
                                    <ListItem 
                                        button 
                                        onClick={() => navigate('/four-year-plan')}
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <ListItemIcon>
                                            <TimelineIcon sx={{ color: 'hsl(var(--secondary-purple))' }} />
                                        </ListItemIcon>
                                        <ListItemText primary="Four Year Plan" />
                                    </ListItem>
                                </List>
                            </Paper>

                            {/* Recent Attendance */}
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2,
                                        fontWeight: 600,
                                        color: 'hsl(var(--brand-primary))',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    Recent Attendance
                                </Typography>
                                
                                {recentAttendance.length > 0 ? (
                                    <List>
                                        {recentAttendance.slice(0, 5).map((record) => (
                                            <ListItem key={record.id}>
                                                <ListItemText 
                                                    primary={formatDate(record.date)} 
                                                    secondary={
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                color: getStatusColor(record.status),
                                                                textTransform: 'capitalize'
                                                            }}
                                                        >
                                                            {record.status}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No recent attendance records found.
                                    </Typography>
                                )}
                                
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => navigate('/attendance')}
                                    sx={{
                                        mt: 2,
                                        borderColor: 'hsl(var(--brand-primary))',
                                        color: 'hsl(var(--brand-primary))',
                                        '&:hover': {
                                            borderColor: 'hsl(var(--brand-primary-dark))',
                                            backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                                        },
                                    }}
                                >
                                    View All Attendance
                                </Button>
                            </Paper>
                        </Grid>

                        {/* Right Column - Courses */}
                        <Grid item xs={12} md={8}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 3,
                                        fontWeight: 600,
                                        color: 'hsl(var(--brand-primary))',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    My Courses
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    {courses.length > 0 ? (
                                        courses.map((course) => (
                                            <Grid item xs={12} sm={6} key={course.id}>
                                                <Card 
                                                    elevation={0}
                                                    sx={{ 
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <CardActionArea 
                                                        onClick={() => navigate(`/courses/${course.id}`)}
                                                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                                                    >
                                                        <CardContent sx={{ width: '100%' }}>
                                                            <Box 
                                                                sx={{ 
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    mb: 1
                                                                }}
                                                            >
                                                                <SchoolIcon 
                                                                    sx={{ 
                                                                        mr: 1, 
                                                                        color: course.source === 'youredu' 
                                                                            ? 'hsl(var(--brand-primary))' 
                                                                            : 'hsl(var(--brand-secondary))'
                                                                    }} 
                                                                />
                                                                <Typography 
                                                                    variant="subtitle1"
                                                                    sx={{ 
                                                                        fontWeight: 600,
                                                                        color: 'hsl(var(--foreground))',
                                                                    }}
                                                                >
                                                                    {course.title}
                                                                </Typography>
                                                            </Box>
                                                            
                                                            <Typography 
                                                                variant="body2" 
                                                                color="text.secondary"
                                                                sx={{ 
                                                                    mb: 1,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                }}
                                                            >
                                                                {course.description || 'No description available'}
                                                            </Typography>
                                                            
                                                            <Divider sx={{ my: 1 }} />
                                                            
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {course.hs_subject || 'General'}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {course.units || '0'} Units
                                                                </Typography>
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </Card>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid item xs={12}>
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <Typography color="text.secondary">
                                                    No courses found. Contact your parent or administrator to add courses.
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                                
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate('/courses')}
                                    sx={{
                                        mt: 3,
                                        backgroundColor: 'hsl(var(--brand-primary))',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'hsl(var(--brand-primary-dark))',
                                        },
                                    }}
                                >
                                    View All Courses
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default StudentDashboard; 