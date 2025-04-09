// src/components/CourseCard.js
import React from 'react'
import { Box, Card, CardContent, Button, Collapse, Divider, Chip } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { FeatureHeader, DescriptiveText, BodyText, SupportingText } from '../ui/typography'
import { getStatusTag } from '../../utils/courseTagUtils'
import { formatTerms } from '../../utils/courseDataUtils'
import { getInstitutionLogo } from '../../utils/institutionLogoUtils'

const CourseCard = ({
  courseGroup,
  expandedCourses,
  toggleCourseExpansion,
  handleRegisterClick,
  tags = [],
  handleInteraction,
}) => {
  const [title = '', courses = []] = courseGroup || []
  const mainCourse = courses?.[0] || {}
  const navigate = useNavigate()
  const location = useLocation()
  const [showFullDescription, setShowFullDescription] = React.useState(false)

  // Add debug logs
  console.log('CourseCard mainCourse:', mainCourse)
  console.log('CourseCard sections:', mainCourse.sections)

  const seatStatus = getStatusTag(mainCourse.sections || [])
  console.log('CourseCard seatStatus:', seatStatus)

  const uniqueTerms = formatTerms(mainCourse.sections)

  const handleProviderClick = (e, providerId) => {
    e.stopPropagation()
    if (handleInteraction && handleInteraction(e)) {
      return
    }
    navigate(`/provider/${providerId}`, {
      state: { from: location.pathname + location.search },
    })
  }

  const chipStyles = {
    borderRadius: 'var(--radius-md)',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    fontWeight: 600,
    height: '28px',
    '& .MuiChip-label': {
      padding: '0 var(--spacing-3)',
    },
  }

  if (!mainCourse?.courseTitle || !courses?.length) {
    return null
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Card
        onDoubleClick={() =>
          !mainCourse.preventViewMore &&
          mainCourse.institution &&
          mainCourse.courseCode &&
          navigate(`/course-detail/${mainCourse.institution}/${mainCourse.courseCode}`)
        }
        sx={{
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, pr: 3 }}>
              {mainCourse.institution && getInstitutionLogo(mainCourse.institution) && (
                <Box
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    display: 'inline-block',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={(e) => handleProviderClick(e, mainCourse.institution.toLowerCase().replace(' ', '-'))}
                >
                  <img
                    src={getInstitutionLogo(mainCourse.institution)}
                    alt={`${mainCourse.institution} Logo`}
                    style={{ width: '120px', height: 'auto' }}
                  />
                </Box>
              )}
              <FeatureHeader>{mainCourse.courseTitle || 'Untitled Course'}</FeatureHeader>
              <Box>
                <BodyText>
                  {mainCourse.showFullDescription
                    ? (mainCourse.description || 'No description available.').split('\\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))
                    : (
                        (mainCourse.description || 'No description available.').slice(0, 500) +
                        (mainCourse.description?.length > 500 ? '...' : '')
                      )
                        .split('\\n')
                        .map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                </BodyText>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '200px' }}>
              <Chip
                label={seatStatus.text}
                sx={{
                  ...chipStyles,
                  bgcolor: seatStatus.color,
                  color: seatStatus.textColor,
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 4 }}>
              <SupportingText>Units: {mainCourse.credits || 'N/A'}</SupportingText>
              <SupportingText>Hours: {mainCourse.totalHours || 'N/A'}</SupportingText>
              {uniqueTerms && <SupportingText>Terms Offered: {uniqueTerms}</SupportingText>}
            </Box>
            {!mainCourse.preventViewMore && mainCourse.institution && mainCourse.courseCode && (
              <Button
                variant="outlined"
                onClick={() =>
                  navigate(`/course-detail/${mainCourse.institution}/${mainCourse.courseCode}`, {
                    state: { from: location.pathname + location.search },
                  })
                }
                sx={{
                  color: 'hsl(var(--brand-primary))',
                  borderColor: 'hsl(var(--brand-primary))',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--brand-primary-light))',
                    borderColor: 'hsl(var(--brand-primary))',
                  },
                }}
              >
                {expandedCourses[mainCourse.courseCode] ? 'Hide Details' : 'View Details'}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag.title}
                sx={{
                  ...chipStyles,
                  bgcolor: tag.isSubjectTag ? tag.color : tag.color.replace('hsl', 'hsla').replace(')', ', 0.3)'),
                  color: tag.isSubjectTag ? 'hsl(var(--background))' : 'hsl(var(--foreground))',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
      <Collapse in={expandedCourses[mainCourse.courseCode]}>
        <Card
          sx={{
            mt: 1,
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <FeatureHeader>Course Description</FeatureHeader>
                <DescriptiveText sx={{ mt: 1 }}>{mainCourse.description}</DescriptiveText>
              </Box>
              {mainCourse.prerequisites && (
                <Box>
                  <BodyText sx={{ fontWeight: 600 }}>Prerequisites: {mainCourse.prerequisites}</BodyText>
                </Box>
              )}
              <Divider sx={{ borderColor: 'hsl(var(--border))' }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {courses.map((section) => (
                  <Box
                    key={section.id}
                    sx={{
                      p: 2,
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 2,
                      backgroundColor: 'hsl(var(--muted))',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <BodyText>Professor: {section.instructor}</BodyText>
                        <BodyText>Schedule: {section.courseSchedule}</BodyText>
                        <BodyText>Total Hours: {section.totalHours}</BodyText>
                        <BodyText>Location: {section.location}</BodyText>
                        <BodyText>Term: {section.term}</BodyText>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                        <BodyText>Capacity: {section.maxStudents}</BodyText>
                        <BodyText>Enrolled: {section.enrolled}</BodyText>
                        <BodyText>Waitlist: {section.waitlisted}</BodyText>
                        <Button
                          variant="contained"
                          onClick={() => handleRegisterClick(section)}
                          disabled={section.enrolled >= section.maxStudents}
                          sx={{
                            mt: 1,
                            backgroundColor: 'hsl(var(--brand-primary))',
                            color: 'hsl(var(--background))',
                            '&:hover': {
                              backgroundColor: 'hsl(var(--brand-primary-dark))',
                            },
                            '&:disabled': {
                              backgroundColor: 'hsl(var(--muted))',
                              color: 'hsl(var(--muted-foreground))',
                            },
                          }}
                        >
                          {section.enrolled >= section.maxStudents ? 'Full' : 'Enroll'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  )
}

export default CourseCard
