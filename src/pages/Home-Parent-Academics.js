import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Box,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Typography,
} from '@mui/material'
import {
  Assessment as AssessmentIcon,
  MenuBook as MenuBookIcon,
  ChevronRight as ChevronRightIcon,
  Schedule as ScheduleIcon,
  ChevronLeft as ChevronLeftIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { PageHeader, SectionHeader, FeatureHeader, BodyText, SupportingText } from '../components/ui/typography'
import { cardStyles } from '../styles/theme/components/cards'
import { Calendar as AntCalendar } from 'antd'
import dayjs from 'dayjs'
import PilotNotification from '../components/ui/PilotNotification'

// Mock data for students
const mockStudents = [
  {
    id: 1,
    name: 'Johnny Doe',
    grade: '9TH GRADE',
    currentCourses: [
      { name: 'Algebra I', progress: 85, status: 'on-track' },
      { name: 'Biology', progress: 92, status: 'on-track' },
      { name: 'World History', progress: 78, status: 'attention' },
      { name: 'English Literature', progress: 88, status: 'on-track' },
    ],
    recentGrades: [
      { assignment: 'Math Quiz 3', grade: 'A-', date: '2024-01-20' },
      { assignment: 'Biology Lab Report', grade: 'A', date: '2024-01-18' },
      { assignment: 'History Essay', grade: 'B+', date: '2024-01-15' },
    ],
    upcomingAssignments: [
      { name: 'Math Chapter 4 Test', due: '2024-01-25' },
      { name: 'Biology Midterm', due: '2024-01-28' },
      { name: 'History Project', due: '2024-02-01' },
    ],
  },
  {
    id: 2,
    name: 'Jane Doe',
    grade: '11TH GRADE',
    currentCourses: [
      { name: 'Pre-Calculus', progress: 90, status: 'on-track' },
      { name: 'Physics', progress: 95, status: 'on-track' },
      { name: 'American History', progress: 82, status: 'on-track' },
      { name: 'AP English', progress: 88, status: 'on-track' },
    ],
    recentGrades: [
      { assignment: 'Physics Lab', grade: 'A', date: '2024-01-19' },
      { assignment: 'Calculus Quiz', grade: 'A-', date: '2024-01-17' },
      { assignment: 'English Essay', grade: 'B+', date: '2024-01-14' },
    ],
    upcomingAssignments: [
      { name: 'Physics Midterm', due: '2024-01-26' },
      { name: 'English Research Paper', due: '2024-01-29' },
      { name: 'Math Final', due: '2024-02-02' },
    ],
  },
]

// Add mock calendar events data
const mockCalendarEvents = [
  {
    title: 'Math Course Final Deadline',
    type: 'Math Course Deadline',
    date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
  },
  {
    title: 'Monthly Compliance Check',
    type: 'Compliance Reminder',
    date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
  },
  {
    title: 'Homeschool Tips & Tricks',
    type: 'Webinar',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  },
  {
    title: 'Local Homeschool Meetup',
    type: 'Community Meetup',
    date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
  },
];

const HomeParentAcademics = () => {
  const { user } = useAuth()
  const [selectedStudent, setSelectedStudent] = useState(() => {
    const saved = localStorage.getItem('selectedStudent')
    if (saved) {
      const parsedStudent = JSON.parse(saved)
      const fullMockStudent = mockStudents.find(student => student.id === parsedStudent.id)
      return fullMockStudent || mockStudents[0]
    }
    return mockStudents[0]
  })
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [currentDate, setCurrentDate] = useState(dayjs());

  // Listen for student changes from navbar
  useEffect(() => {
    const handleStudentChange = (event) => {
      // If event has detail, use it directly
      if (event?.detail) {
        setSelectedStudent(event.detail)
        return
      }

      // Otherwise check localStorage
      const saved = localStorage.getItem('selectedStudent')
      if (saved) {
        const parsedStudent = JSON.parse(saved)
        const fullMockStudent = mockStudents.find(student => student.id === parsedStudent.id)
        if (fullMockStudent) {
          setSelectedStudent(fullMockStudent)
        }
      }
    }

    // Add event listener
    window.addEventListener('studentChanged', handleStudentChange)
    
    // Initial check
    handleStudentChange()
    
    // Cleanup
    return () => window.removeEventListener('studentChanged', handleStudentChange)
  }, [])

  // Also update when localStorage changes directly
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'selectedStudent') {
        const saved = e.newValue
        if (saved) {
          const parsedStudent = JSON.parse(saved)
          const fullMockStudent = mockStudents.find(student => student.id === parsedStudent.id)
          if (fullMockStudent) {
            setSelectedStudent(fullMockStudent)
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'hsl(var(--secondary-green))'
      case 'attention':
        return 'hsl(var(--secondary-orange))'
      case 'behind':
        return 'hsl(var(--destructive))'
      default:
        return 'hsl(var(--muted-foreground))'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'hsl(var(--secondary-green-light))'
      case 'attention':
        return 'hsl(var(--secondary-orange-light))'
      case 'behind':
        return 'hsl(var(--destructive) / 0.1)'
      default:
        return 'hsl(var(--muted))'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Helper function to properly format name
  const formatName = (name) => {
    if (!name) return ''
    return name.split(' ')[0] // Get first name
  }

  const getEventsForDate = (date) => {
    return mockCalendarEvents.filter((event) => dayjs(event.date).isSame(date, 'day'));
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'Webinar':
        return 'hsl(var(--secondary-blue))'
      case 'Compliance Reminder':
        return 'hsl(var(--secondary-green))'
      case 'Math Course Deadline':
        return 'hsl(var(--secondary-purple))'
      case 'Community Meetup':
        return 'hsl(var(--secondary-purple))'
      default:
        return 'hsl(var(--text-secondary))'
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Main Content */}
      <Container 
        maxWidth="var(--container-max-width)"
        sx={{ 
          px: 'var(--container-padding-x)',
          py: 'var(--spacing-1)',
          position: 'relative',
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}
      >
        <Box sx={{ position: 'relative', mb: 2 }}>
          <PilotNotification message="This is a demo page using mock data. In production, this will display real student data." />
        </Box>

        <Grid container spacing={2}>
          {/* Left Column - Current Courses */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                ...cardStyles.feature,
                mb: 2,
                height: 'fit-content',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  px: 2,
                  pt: 2,
                }}
              >
                <SectionHeader>Current Courses</SectionHeader>
                <Button
                  startIcon={<MenuBookIcon />}
                  component={Link}
                  to="/courses"
                  sx={{
                    color: 'hsl(var(--brand-primary))',
                    '&:hover': { backgroundColor: 'hsl(var(--brand-primary-light))' },
                    py: 0.5,
                  }}
                >
                  View All Courses
                </Button>
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Grid container spacing={1.5}>
                  {selectedStudent.currentCourses.map((course, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper
                        sx={{
                          p: 1.5,
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid hsl(var(--border))',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 'var(--shadow-lg)',
                            borderColor: getStatusColor(course.status),
                          },
                        }}
                      >
                        <Box sx={{ mb: 'var(--spacing-2)' }}>
                          <FeatureHeader sx={{ mb: 'var(--spacing-1)' }}>{course.name}</FeatureHeader>
                          <Chip
                            label={course.status === 'on-track' ? 'On Track' : 'Needs Attention'}
                            size="small"
                            sx={{
                              backgroundColor: getStatusBgColor(course.status),
                              color: getStatusColor(course.status),
                              fontWeight: 600,
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </Box>
                        <Box sx={{ mb: 'var(--spacing-2)' }}>
                          <SupportingText sx={{ mb: 'var(--spacing-1)' }}>
                            Progress
                          </SupportingText>
                          <LinearProgress
                            variant="determinate"
                            value={course.progress}
                            sx={{
                              height: 8,
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'hsl(var(--background-alt))',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getStatusColor(course.status),
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <BodyText sx={{ fontWeight: 600 }}>
                            {course.progress}% Complete
                          </BodyText>
                          <IconButton 
                            size="small"
                            sx={{
                              color: 'hsl(var(--text-secondary))',
                              '&:hover': {
                                backgroundColor: 'hsl(var(--background-alt))',
                              }
                            }}
                          >
                            <ChevronRightIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>

            {/* Recent Grades */}
            <Paper
              elevation={0}
              sx={{
                ...cardStyles.feature,
                mb: 2,
                height: 'fit-content',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  px: 2,
                  pt: 2,
                }}
              >
                <SectionHeader>Recent Grades</SectionHeader>
                <Button
                  startIcon={<AssessmentIcon />}
                  component={Link}
                  to="/grades"
                  sx={{
                    color: 'hsl(var(--brand-primary))',
                    '&:hover': { backgroundColor: 'hsl(var(--brand-primary-light))' },
                    py: 0.5,
                  }}
                >
                  View All Grades
                </Button>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.5,
                  px: 2,
                  pb: 2,
                }}
              >
                {selectedStudent.recentGrades.map((grade, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--background))',
                        transform: 'translateX(4px)',
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <FeatureHeader sx={{ mb: 'var(--spacing-1)' }}>{grade.assignment}</FeatureHeader>
                        <SupportingText>{formatDate(grade.date)}</SupportingText>
                      </Box>
                      <Chip
                        label={grade.grade}
                        size="small"
                        sx={{
                          backgroundColor: 'hsl(var(--brand-primary-light))',
                          color: 'hsl(var(--brand-primary))',
                          fontWeight: 600,
                          minWidth: '48px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Calendar and Upcoming */}
          <Grid item xs={12} md={4}>
            {/* Calendar */}
            <Paper
              elevation={0}
              sx={{
                ...cardStyles.feature,
                mb: 2,
                height: 'fit-content',
              }}
            >
              <Box sx={{ p: 2 }}>
                <SectionHeader sx={{ mb: 2 }}>Calendar</SectionHeader>
                <AntCalendar
                  value={currentDate}
                  onChange={(date) => setCurrentDate(date)}
                  fullscreen={false}
                  onSelect={setSelectedDate}
                  headerRender={({ value, onChange }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                        px: 2,
                        pt: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={handlePrevMonth} size="small">
                          <ChevronLeftIcon />
                        </IconButton>
                        <Typography
                          sx={{
                            minWidth: 120,
                            textAlign: 'center',
                            fontWeight: 500,
                            color: 'hsl(var(--text-primary))',
                          }}
                        >
                          {currentDate.format('MMMM YYYY')}
                        </Typography>
                        <IconButton onClick={handleNextMonth} size="small">
                          <ChevronRightIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                  cellRender={(date) => {
                    const events = getEventsForDate(date);
                    return events.length > 0 ? (
                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        {events.map((event, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: '100%',
                              height: 4,
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: getEventColor(event.type),
                            }}
                          />
                        ))}
                      </Box>
                    ) : null;
                  }}
                />

                {selectedDate && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid hsl(var(--border))',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.5,
                      }}
                    >
                      <FeatureHeader>{selectedDate.format('MMMM D, YYYY')}</FeatureHeader>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedDate(null)}
                        sx={{ color: 'hsl(var(--text-secondary))' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {getEventsForDate(selectedDate).length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {getEventsForDate(selectedDate).map((event, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: getEventColor(event.type),
                                flexShrink: 0,
                              }}
                            />
                            <Box>
                              <BodyText
                                sx={{
                                  fontSize: '0.9rem',
                                  fontWeight: 500,
                                  color: 'hsl(var(--text-primary))',
                                }}
                              >
                                {event.title}
                              </BodyText>
                              <SupportingText
                                sx={{
                                  fontSize: '0.8rem',
                                  color: 'hsl(var(--text-secondary))',
                                }}
                              >
                                {event.type}
                              </SupportingText>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 2,
                        }}
                      >
                        <SupportingText>No events on this day</SupportingText>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Upcoming Assignments */}
            <Paper
              elevation={0}
              sx={{
                ...cardStyles.feature,
                height: 'fit-content',
              }}
            >
              <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <SectionHeader>Upcoming Assignments</SectionHeader>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.5,
                  px: 2,
                  pb: 2,
                }}
              >
                {selectedStudent.upcomingAssignments.map((assignment, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 'var(--spacing-3)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'hsl(var(--background))',
                        transform: 'translateX(4px)',
                        borderColor: 'hsl(var(--brand-primary))',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <FeatureHeader sx={{ mb: 'var(--spacing-2)' }}>{assignment.name}</FeatureHeader>
                        <Chip
                          icon={<ScheduleIcon sx={{ fontSize: '16px !important' }} />}
                          label={`Due ${formatDate(assignment.due)}`}
                          size="small"
                          sx={{
                            backgroundColor: 'hsl(var(--brand-primary-light))',
                            color: 'hsl(var(--brand-primary))',
                            fontWeight: 500,
                            borderRadius: 'var(--radius-full)',
                          }}
                        />
                      </Box>
                      <IconButton 
                        size="small"
                        sx={{
                          color: 'hsl(var(--text-secondary))',
                          '&:hover': {
                            backgroundColor: 'hsl(var(--background-alt))',
                          }
                        }}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default HomeParentAcademics
