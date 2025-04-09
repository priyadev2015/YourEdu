import React from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    Box,
    Grid,
    Link,
} from '@mui/material';

const TestingResources = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 2, pl: 2 }}>
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: '#2B6CB0',
                    color: 'white'
                }}
            >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Testing Resources
                </Typography>
                <Typography variant="body1">
                    Find information about standardized tests, testing centers, and preparation resources.
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            backgroundColor: '#f8fafc'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3, color: '#2B6CB0', fontWeight: 600 }}>
                            AP Tests
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, color: '#2B6CB0', fontWeight: 600 }}>
                                2024 AP Exam Schedule
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, color: '#4A5568' }}>
                                AP Exams will be administered in schools between May 6-17, 2024.
                            </Typography>
                            <Link 
                                href="https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates" 
                                target="_blank"
                                sx={{ color: '#2B6CB0' }}
                            >
                                View Complete AP Calendar
                            </Link>
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, color: '#2B6CB0', fontWeight: 600 }}>
                                Test Centers
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                Contact us for help finding available AP test centers in your area.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            backgroundColor: '#f8fafc'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3, color: '#2B6CB0', fontWeight: 600 }}>
                            SAT Information
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, color: '#2B6CB0', fontWeight: 600 }}>
                                Upcoming Test Dates
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#4A5568' }}>
                                • March 9, 2024
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#4A5568' }}>
                                • May 4, 2024
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, color: '#4A5568' }}>
                                • June 1, 2024
                            </Typography>
                            <Link 
                                href="https://satsuite.collegeboard.org/sat/registration/dates-deadlines" 
                                target="_blank"
                                sx={{ color: '#2B6CB0' }}
                            >
                                Register for the SAT
                            </Link>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            backgroundColor: '#f8fafc'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 3, color: '#2B6CB0', fontWeight: 600 }}>
                            Free Test Prep Resources
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ p: 2, backgroundColor: '#EBF8FF', borderRadius: 1 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#2B6CB0', fontWeight: 600 }}>
                                        Khan Academy
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#2B6CB0' }}>
                                        Official SAT practice tests and personalized study plans
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ p: 2, backgroundColor: '#EBF8FF', borderRadius: 1 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#2B6CB0', fontWeight: 600 }}>
                                        College Board
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#2B6CB0' }}>
                                        Official AP and SAT study materials and guides
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ p: 2, backgroundColor: '#EBF8FF', borderRadius: 1 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1, color: '#2B6CB0', fontWeight: 600 }}>
                                        Local Libraries
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#2B6CB0' }}>
                                        Free access to test prep books and study materials
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TestingResources; 