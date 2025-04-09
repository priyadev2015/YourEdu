// src/components/courses/MyCoursesCard.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, IconButton, Menu, MenuItem, Chip } from '@mui/material'
import { MoreVert as MoreVertIcon } from '@mui/icons-material'
import { FeatureHeader, SupportingText } from '../ui/typography'
import { supabase } from '../../utils/supabaseClient'
import { toast } from 'react-toastify'
import { syncUserCalendars } from '../../pages/MyGoogleCalendar'
import { useAuth } from '../../utils/AuthContext'

const getConsistentColor = (courseId) => {
  // Use theme colors instead of hardcoded values
  const colors = [
    'hsl(342, 84%, 49%)', // pink from courseCards.pink
    'hsl(120, 100%, 26%)', // green from courseCards.green
    'hsl(221, 86%, 55%)', // blue from courseCards.blue
    'hsl(24, 86%, 50%)', // orange from courseCards.orange
  ]

  const hash = String(courseId || '')
    .split('')
    .reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

  return colors[Math.abs(hash) % colors.length]
}

// Function to get status chip color based on registration status
const getStatusChipColor = (status) => {
  if (!status) return 'default'

  const statusLower = status.toLowerCase()
  if (statusLower.includes('complete') || statusLower.includes('approved')) {
    return 'success'
  } else if (statusLower.includes('pending') || statusLower.includes('in progress')) {
    return 'warning'
  } else if (statusLower.includes('rejected') || statusLower.includes('failed')) {
    return 'error'
  }
  return 'default'
}

const MyCoursesCard = ({ course, term, onDelete }) => {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const { user } = useAuth()

  if (!course) {
    return null
  }

  const cardColor = getConsistentColor(course?.code || course?.id)

  const handleDelete = async (event) => {
    event.stopPropagation()

    // Use the onDelete prop instead of handling deletion here
    if (onDelete) {
      console.log('Calling onDelete with course ID:', course.id)
      onDelete(course.id, course.title || course.courseTitle || 'Untitled Course')
    } else {
      console.error('onDelete prop is not provided')
    }

    setAnchorEl(null)
  }

  // Determine if we should show the registration status
  const showRegistrationStatus = course?.college && course?.is_college_level && course?.registration_status

  return (
    <Card
      onClick={() => {
        if (course?.id && !course?.preventViewMore) {
          // Store the course title in localStorage
          localStorage.setItem('currentCourseTitle', course.title || 'Course')
          navigate(`/user-course/${course.id}`)
        }
      }}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        boxShadow: 'none',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={(e) => {
          e.stopPropagation()
          setAnchorEl(e.currentTarget)
        }}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={(e) => {
          e.stopPropagation()
          setAnchorEl(null)
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={(e) => handleDelete(e)} sx={{ color: 'error.main' }}>
          Delete Course
        </MenuItem>
      </Menu>
      <Box sx={{ height: '128px', bgcolor: cardColor, flexShrink: 0 }} />
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <FeatureHeader
          sx={{
            color: cardColor,
            fontSize: '1rem',
            fontWeight: 500,
            mb: 1,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {course?.courseTitle || course?.title || 'Unspecified Subject'}
        </FeatureHeader>
        <Box>
          <SupportingText sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 0.5 }}>{term}</SupportingText>
          <SupportingText sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: showRegistrationStatus ? 1 : 0 }}>
            {course?.college || course?.institution || 'YourEDU Course'}
          </SupportingText>

          {/* Display registration status chip for college courses */}
          {showRegistrationStatus && (
            <Chip
              label={course.registration_status}
              size="small"
              color={getStatusChipColor(course.registration_status)}
              sx={{
                fontSize: '0.75rem',
                height: '24px',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          )}
        </Box>
      </Box>
    </Card>
  )
}

export default MyCoursesCard
