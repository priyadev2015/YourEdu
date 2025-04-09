import React from 'react'
import { Box, Grid, TextField, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { theme } from '../../theme/theme'
import { supabase } from '../../utils/supabaseClient'
import { toast } from 'react-toastify'

const CourseEntryForm = ({
  course,
  index,
  grade,
  handleChange,
  handleRemoveCourse,
  moveCourseUp,
  moveCourseDown,
  stylesForm,
}) => {
  const navigate = useNavigate()

  // Check if course is pulled in from My Courses
  const isPulledIn = course.is_pulled_in
  const sourceType = course.source_type
  const sourceId = course.source_id

  const handleEditSource = async () => {
    if (!sourceId) return;

    try {
      // Check youredu_courses first
      const { data: youreduCourse } = await supabase
        .from('youredu_courses')
        .select('id')
        .eq('id', sourceId)
        .single();

      // Check user_courses if not found in youredu_courses
      const { data: userCourse } = await supabase
        .from('user_courses')
        .select('id')
        .eq('id', sourceId)
        .single();

      if (youreduCourse || userCourse) {
        navigate(`/user-course/${sourceId}`);
      } else {
        toast.error('Course not found. It may have been deleted.');
      }
    } catch (error) {
      console.error('Error checking course:', error);
      toast.error('Error accessing course details');
    }
  }

  const commonTextFieldProps = {
    variant: "outlined",
    fullWidth: true,
    disabled: isPulledIn,
    InputLabelProps: {
      shrink: true,
    },
    sx: {
      ...stylesForm.input,
      '& .MuiInputBase-root': {
        backgroundColor: isPulledIn ? 'hsl(var(--muted))' : 'white',
        height: '40px',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'hsl(var(--border))',
      },
      '& .MuiInputLabel-root': {
        color: 'hsl(var(--foreground))',
        '&.Mui-focused': {
          color: 'hsl(var(--brand-primary))',
        },
      },
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isPulledIn ? 'hsla(var(--brand-primary), 0.05)' : 'white',
        border: '1px solid',
        borderColor: isPulledIn ? 'hsla(var(--brand-primary), 0.2)' : 'hsl(var(--border))',
        borderRadius: 'var(--radius-lg)',
        p: 2,
        mb: 2,
      }}
    >
      {isPulledIn && (
        <Typography
          variant="caption"
          sx={{
            color: 'hsl(var(--brand-primary))',
            fontStyle: 'italic',
            display: 'block',
            mb: 1,
          }}
        >
          Pulled in from My Courses
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Course Information */}
        <Grid container spacing={2} alignItems="center" sx={{ flex: 1 }}>
          <Grid item xs={12} md={4}>
            <TextField
              {...commonTextFieldProps}
              label="Course Title"
              name="courseTitle"
              value={course.courseTitle || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              {...commonTextFieldProps}
              label="Term 1 Grade"
              name="term1Grade"
              value={course.term1Grade || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              {...commonTextFieldProps}
              label="Term 2 Grade"
              name="term2Grade"
              value={course.term2Grade || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              {...commonTextFieldProps}
              label="Term 3 Grade"
              name="term3Grade"
              value={course.term3Grade || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              {...commonTextFieldProps}
              label="Credits"
              name="credits"
              value={course.credits || ''}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          alignItems: 'center',
          height: '40px',
          ml: 1,
        }}>
          {isPulledIn ? (
            <Button
              onClick={handleEditSource}
              variant="contained"
              sx={{
                backgroundColor: 'hsl(var(--brand-primary))',
                color: 'white',
                height: '40px',
                minWidth: '80px',
                '&:hover': {
                  backgroundColor: 'hsl(var(--brand-primary-dark))',
                },
                textTransform: 'none',
                boxShadow: 'none',
              }}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleRemoveCourse(grade, index)}
                variant="outlined"
                sx={{
                  color: 'hsl(var(--destructive))',
                  borderColor: 'hsl(var(--destructive))',
                  height: '40px',
                  minWidth: '80px',
                  '&:hover': {
                    borderColor: 'hsl(var(--destructive))',
                    backgroundColor: 'hsl(var(--destructive) / 0.1)',
                  },
                  textTransform: 'none',
                }}
              >
                Delete
              </Button>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px',
                height: '40px',
                justifyContent: 'center'
              }}>
                <Button
                  onClick={() => moveCourseUp(grade, index)}
                  variant="outlined"
                  size="small"
                  disabled={index === 0}
                  sx={{
                    minWidth: '32px',
                    height: '19px',
                    padding: 0,
                    lineHeight: 1,
                    color: '#2563EB',
                    borderColor: '#2563EB',
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: 'rgba(37, 99, 235, 0.04)',
                    },
                  }}
                >
                  ▲
                </Button>
                <Button
                  onClick={() => moveCourseDown(grade, index)}
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: '32px',
                    height: '19px',
                    padding: 0,
                    lineHeight: 1,
                    color: '#2563EB',
                    borderColor: '#2563EB',
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: 'rgba(37, 99, 235, 0.04)',
                    },
                  }}
                >
                  ▼
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CourseEntryForm
