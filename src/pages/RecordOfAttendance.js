import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Container,
  Button,
  Grid,
  ListItemButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { AttendanceService } from '../services/AttendanceService';
import { useAuth } from '../utils/AuthContext';
import { styled } from '@mui/material/styles';

// Custom styled components
const CalendarDay = styled(Box)(({ theme, status, isWeekend, isFuture, isSelected }) => ({
  width: '100%',
  height: '100%',
  minHeight: '80px',
  padding: '8px',
  cursor: isFuture ? 'not-allowed' : 'pointer',
  backgroundColor: 
    isFuture ? 'hsl(var(--muted))' :
    status === 'present' ? 'hsla(var(--success), 0.1)' :
    status === 'absent' ? 'hsla(var(--error), 0.1)' :
    'white',
  color: isFuture ? 'hsl(var(--muted-foreground))' : 'hsl(var(--text-primary))',
  opacity: 1,
  transition: 'all 0.2s ease',
  border: '1px solid hsl(var(--border))',
  borderRadius: 'var(--radius-sm)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&:hover': {
    backgroundColor: 
      !isFuture ? (
        status === 'present' ? 'hsla(var(--success), 0.2)' :
        status === 'absent' ? 'hsla(var(--error), 0.2)' :
        'hsla(var(--muted), 0.1)'
      ) : 'hsl(var(--muted-foreground))',
    '&::after': isFuture ? {
      content: '"✗"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '1.5rem',
      fontWeight: 600,
      color: 'hsl(var(--error))',
      opacity: 0.7
    } : undefined
  },
}));

const StudentListItem = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: 1,
  marginBottom: '4px',
  '&.Mui-selected': {
    backgroundColor: 'hsl(var(--brand-primary-light))',
    '&:hover': {
      backgroundColor: 'hsla(var(--brand-primary), 0.12)',
    }
  },
  '&:hover': {
    backgroundColor: 'hsla(var(--brand-primary), 0.04)',
  }
}));

const MonthNavigator = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-2)',
  marginBottom: 'var(--spacing-4)',
  '& .MuiIconButton-root': {
    color: 'hsl(var(--text-primary))',
    '&:hover': {
      backgroundColor: 'hsla(var(--brand-primary), 0.1)',
    },
  },
});

const RecordOfAttendance = ({ showHero = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [totalPresentDays, setTotalPresentDays] = useState(0);

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsList = await AttendanceService.getStudents();
        setStudents(studentsList);
        // Auto-select the first student if there are any students
        if (studentsList.length > 0 && !selectedStudent) {
          setSelectedStudent(studentsList[0]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  // Fetch attendance data when month changes or students are loaded
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (students.length === 0) return;

      setLoading(true);
      try {
        const startDate = currentMonth.startOf('month').format('YYYY-MM-DD');
        const endDate = currentMonth.endOf('month').format('YYYY-MM-DD');
        
        // Fetch attendance records for all students
        const attendancePromises = students.map(student =>
          AttendanceService.getAttendanceRecords(student.id, startDate, endDate)
        );
        
        const allRecords = await Promise.all(attendancePromises);
        
        // Organize records by student and date
        const organized = {};
        students.forEach((student, index) => {
          organized[student.id] = {};
          allRecords[index].forEach(record => {
            organized[student.id][record.date] = record.status;
          });
        });

        setAttendanceData(organized);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to fetch attendance records');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [students, currentMonth]);

  // Calculate total present days when attendance data changes
  useEffect(() => {
    if (selectedStudent && attendanceData[selectedStudent.id]) {
      const presentCount = Object.values(attendanceData[selectedStudent.id])
        .filter(status => status === 'present')
        .length;
      setTotalPresentDays(presentCount);
    }
  }, [selectedStudent, attendanceData]);

  const handleAttendanceClick = async (studentId, date) => {
    if (loading) return;

    const currentStatus = attendanceData[studentId]?.[date] || 'not_marked';
    const newStatus = currentStatus === 'present' ? 'absent' :
                     currentStatus === 'absent' ? 'not_marked' : 'present';

    try {
      await AttendanceService.upsertAttendanceRecord(studentId, date, newStatus);
      
      setAttendanceData(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [date]: newStatus
        }
      }));
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance');
    }
  };

  const getCalendarDays = () => {
    const start = currentMonth.startOf('month').startOf('week');
    const end = currentMonth.endOf('month').endOf('week');
    const days = [];
    let day = start;

    while (day.isBefore(end) || day.isSame(end, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    return days;
  };

  const getCalendarWeeks = () => {
    const days = getCalendarDays();
    const weeks = [];
    let week = [];

    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    return weeks;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => direction === 'next' ? 
      prev.add(1, 'month') : 
      prev.subtract(1, 'month')
    );
  };

  if (loading && students.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (students.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        {showHero && (
          <Box sx={{ 
            backgroundColor: 'white',
            borderBottom: '1px solid hsl(var(--border))',
            mb: 3
          }}>
            <Container maxWidth="var(--container-max-width)" sx={{
              px: 'var(--container-padding-x)',
              py: 3,
              '@media (--tablet)': {
                px: 'var(--container-padding-x-mobile)',
              },
            }}>
              <Typography sx={{ 
                color: '#000000',
                fontWeight: 400,
                fontSize: '1.125rem',
                pl: 2.1
              }}>
                Mark Daily Attendance - Click once to mark present (✓), twice for absent (✗), and a third time to clear.
              </Typography>
            </Container>
          </Box>
        )}
        <Container maxWidth="var(--container-max-width)" sx={{ 
          position: 'relative',
          px: 'var(--container-padding-x)',
          py: 2,
          flex: 1,
          '@media (--tablet)': {
            px: 'var(--container-padding-x-mobile)',
          },
        }}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid hsl(var(--border))'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'hsl(var(--foreground))' }}>
              No Students Added Yet
            </Typography>
            <Typography sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>
              Add your first student to start tracking attendance!
            </Typography>
            <Typography sx={{ color: 'hsl(var(--muted-foreground))', mb: 3 }}>
              You need to add your students in the My Students section to begin.
            </Typography>
            <Button 
              variant="contained"
              onClick={() => navigate('/add-student')}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                height: 36,
                '&:hover': {
                  backgroundColor: '#2563EB',
                  boxShadow: 'none'
                },
                transition: 'none',
                boxShadow: 'none',
                textTransform: 'none'
              }}
            >
              Add Students
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {showHero && (
        <Box sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid hsl(var(--border))',
          mb: 3
        }}>
          <Container maxWidth="var(--container-max-width)" sx={{
            px: 'var(--container-padding-x)',
            py: 3,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}>
            <Typography sx={{ 
              color: '#000000',
              fontWeight: 400,
              fontSize: '1.125rem',
              pl: 2.1
            }}>
              Mark Daily Attendance - Click once to mark present (✓), twice for absent (✗), and a third time to clear.
            </Typography>
          </Container>
        </Box>
      )}

      <Container maxWidth="var(--container-max-width)" sx={{
        px: 'var(--container-padding-x)',
        py: 3,
        '@media (--tablet)': {
          px: 'var(--container-padding-x-mobile)',
        },
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container>
          <Paper 
            elevation={0}
            sx={{ 
              width: '100%',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border))',
              display: 'flex',
            }}
          >
            {/* Student List */}
            <Box sx={{ 
              width: '300px',
              flexShrink: 0,
              borderRight: '1px solid hsl(var(--border))',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--muted))'
              }}>
                <Typography 
                  sx={{ 
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '1.125rem'
                  }}
                >
                  My Students
                </Typography>
              </Box>
              <List sx={{ px: 2, py: 1.5 }}>
                {students.map((student) => (
                  <ListItem
                    key={student.id}
                    disablePadding
                  >
                    <StudentListItem
                      selected={selectedStudent?.id === student.id}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                            {student.student_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#718096' }}>
                            {student.grade_level}
                          </Typography>
                        }
                      />
                    </StudentListItem>
                  </ListItem>
                ))}
                {students.length === 0 && (
                  <Typography sx={{ 
                    color: 'hsl(var(--text-secondary))',
                    textAlign: 'center',
                    py: 2,
                    fontSize: '0.875rem'
                  }}>
                    No students added yet
                  </Typography>
                )}
              </List>
            </Box>

            {/* Calendar View */}
            <Box sx={{ flex: 1, p: 3 }}>
              {selectedStudent && (
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  py: 1.5,
                  px: 2,
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'hsla(var(--brand-primary), 0.05)',
                  border: '1px solid hsla(var(--brand-primary), 0.1)'
                }}>
                  <Typography sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'hsl(var(--brand-primary))',
                    textAlign: 'center'
                  }}>
                    {selectedStudent.student_name} ({selectedStudent.grade_level}) • Required School Days (CA): 180 • Current Attendance: {totalPresentDays} days
                  </Typography>
                </Box>
              )}
              <MonthNavigator>
                <IconButton onClick={() => navigateMonth('prev')} size="large">
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: 'hsl(var(--text-primary))',
                  minWidth: '200px',
                  textAlign: 'center'
                }}>
                  {currentMonth.format('MMMM YYYY')}
                </Typography>
                <IconButton onClick={() => navigateMonth('next')} size="large">
                  <ChevronRight />
                </IconButton>
              </MonthNavigator>

              {/* Calendar Grid */}
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={0}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Grid item xs={12/7} key={day}>
                      <Box sx={{
                        textAlign: 'center',
                        py: 1,
                        fontWeight: 600,
                        color: 'hsl(var(--text-secondary))',
                        fontSize: '0.875rem'
                      }}>
                        {day}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {getCalendarWeeks().map((week, weekIndex) => (
                <Grid container spacing={1} key={weekIndex}>
                  {week.map((date) => {
                    const dateStr = date.format('YYYY-MM-DD');
                    const isCurrentMonth = date.month() === currentMonth.month();
                    const status = selectedStudent ? 
                      attendanceData[selectedStudent.id]?.[dateStr] || 'not_marked' : 
                      'not_marked';
                    const isWeekend = date.day() === 0 || date.day() === 6;
                    const isFuture = date.isAfter(dayjs(), 'day');
                    const isToday = date.isSame(dayjs(), 'day');

                    return (
                      <Grid item xs={12/7} key={dateStr}>
                        <CalendarDay
                          status={status}
                          isWeekend={isWeekend}
                          isFuture={isFuture}
                          onClick={() => {
                            if (selectedStudent && !isFuture) {
                              handleAttendanceClick(selectedStudent.id, dateStr);
                            }
                          }}
                          sx={{
                            opacity: isCurrentMonth ? 1 : 0.3
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Typography sx={{ 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              mb: 1
                            }}>
                              {date.format('D')}
                            </Typography>
                            {isToday && (
                              <Box
                                sx={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: 'hsl(var(--brand-primary))',
                                  mb: 1
                                }}
                              />
                            )}
                          </Box>
                          {selectedStudent && status !== 'not_marked' && (
                            <Box sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '1.5rem',
                              fontWeight: 600,
                              color: status === 'present' ? 'hsl(var(--success))' : 'hsl(var(--error))'
                            }}>
                              {status === 'present' ? '✓' : '✗'}
                            </Box>
                          )}
                        </CalendarDay>
                      </Grid>
                    );
                  })}
                </Grid>
              ))}

              {/* Legend */}
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                mt: 3,
                justifyContent: 'center',
                color: 'hsl(var(--text-secondary))',
                fontSize: '0.875rem'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'hsla(var(--success), 0.1)',
                    color: 'hsl(var(--success))',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500,
                  }}>✓</Box>
                  <span>Present</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'hsla(var(--error), 0.1)',
                    color: 'hsl(var(--error))',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500,
                  }}>✗</Box>
                  <span>Absent</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius-sm)',
                  }}></Box>
                  <span>Not Marked</span>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Container>
    </Box>
  );
};

export default RecordOfAttendance; 