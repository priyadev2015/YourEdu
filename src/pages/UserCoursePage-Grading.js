import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Link,
  Chip,
} from '@mui/material';
import {
  Info as InfoIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';

const UserCourseGrading = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
          border: '1px solid hsl(var(--brand-primary) / 0.2)',
          borderRadius: '12px',
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: '800px' }}>
          <Typography
            variant="h5"
            sx={{
              color: 'hsl(var(--brand-primary))',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Student Progress & Grading
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'hsl(var(--foreground))',
              lineHeight: 1.6,
            }}
          >
            Track and manage student progress, review submissions, and assign grades. This comprehensive grading system helps you maintain accurate records of student performance and provide timely feedback on their work.
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mb: 3, p: 2, backgroundColor: 'hsl(var(--muted))', borderRadius: 1 }}>
        <Typography variant="subtitle1" sx={{ color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon fontSize="small" />
          This feature is currently in development. Grading functionality will be available soon.
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ opacity: 0.7 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Submission Link</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                id: 1,
                studentName: 'John Doe (Mock Data)',
                assignment: 'Chapter 1 Exercise',
                link: '#',
                status: 'Submitted',
                grade: null,
              },
              {
                id: 2,
                studentName: 'Jane Smith (Mock Data)',
                assignment: 'Chapter 1 Exercise',
                link: '#',
                status: 'Graded',
                grade: 95,
              },
            ].map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.studentName}</TableCell>
                <TableCell>{submission.assignment}</TableCell>
                <TableCell>
                  <Link
                    component="span"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'hsl(var(--muted-foreground))',
                      cursor: 'not-allowed',
                      textDecoration: 'none',
                    }}
                  >
                    <GoogleIcon sx={{ fontSize: 16 }} />
                    View Submission
                  </Link>
                </TableCell>
                <TableCell>
                  <Chip
                    label={submission.status}
                    color={submission.status === 'Graded' ? 'success' : 'primary'}
                    size="small"
                    sx={{ opacity: 0.7 }}
                  />
                </TableCell>
                <TableCell>{submission.grade ?? '-'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled
                    sx={{ cursor: 'not-allowed' }}
                  >
                    {submission.status === 'Graded' ? 'Update Grade' : 'Grade'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserCourseGrading; 