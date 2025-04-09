import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { supabase } from '../utils/supabaseClient'
import { Box, Paper, CircularProgress, Button, Popover } from '@mui/material'
import { FeatureHeader, BodyText, SupportingText } from './ui/typography'
import { formatSchedule, formatTimes } from '../utils/formatters'
import { getInstitutionLogo } from '../utils/institutionLogoUtils'

const CartItem = ({ item, onRemove, onSaveForLater, onMoveToCart, selectedSection, onSectionSelect }) => {
  const [courseDetails, setCourseDetails] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [sectionAnchorEl, setSectionAnchorEl] = useState(null)
  const openSectionSelect = Boolean(sectionAnchorEl)

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        let courseData
        if (item.course_type === 'youredu') {
          const { data, error } = await supabase.from('youredu_courses').select('*').eq('id', item.course_id).single()
          if (error) throw error
          courseData = data
        } else {
          // Fetch both course details and available sections
          const [courseResponse, sectionsResponse] = await Promise.all([
            supabase
              .from('college_courses')
              .select('*')
              .eq('code', item.course_id)
              .eq('college', item.college)
              .single(),
            supabase
              .from('college_courses_schedules')
              .select('*')
              .eq('course_code', item.course_id)
              .eq('college', item.college),
          ])

          if (courseResponse.error) throw courseResponse.error
          if (sectionsResponse.error) throw sectionsResponse.error

          courseData = {
            ...courseResponse.data,
            term: sectionsResponse.data.find((s) => s.crn === item.crn)?.term,
          }
          setSections(sectionsResponse.data)

          // If there's a crn in the cart item, select that section by default
          if (item.crn && !selectedSection) {
            onSectionSelect(item.crn)
          }
        }
        setCourseDetails(courseData)
      } catch (error) {
        console.error('Error fetching course details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [item, selectedSection, onSectionSelect])

  const handleViewDetails = (e) => {
    e.stopPropagation()
    navigate(`/course-detail/${item.college}/${item.course_id}`)
  }

  const handleOpenSectionSelect = (event) => {
    event.stopPropagation()
    setSectionAnchorEl(event.currentTarget)
  }

  const handleCloseSectionSelect = () => {
    setSectionAnchorEl(null)
  }

  if (loading) return <CircularProgress size={20} />
  if (!courseDetails) return null

  const displayPrice = item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`
  const displayDiscount = item.discount > 0 ? `$${item.discount.toFixed(2)}` : null

  return (
    <Paper
      elevation={0}
      onDoubleClick={handleViewDetails}
      sx={{
        p: 'var(--spacing-4)',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'hsl(var(--card))',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-md)',
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FeatureHeader style={{ marginBottom: 0 }}>{courseDetails.title}</FeatureHeader>
          </Box>
        </Box>

        {/* Price Display */}
        <Box sx={{ textAlign: 'right' }}>
          {item.price > 0 ? (
            <>
              <Box
                component="span"
                sx={{
                  textDecoration: 'line-through',
                  color: 'black',
                  fontSize: '1rem',
                  display: 'block',
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                ${item.price.toFixed(2)}
              </Box>
              <Box
                component="span"
                sx={{
                  color: '#22c55e',
                  fontSize: '1rem',
                  display: 'block',
                  fontWeight: 500,
                }}
              >
                ${(item.price * 0.9).toFixed(2)}
              </Box>
            </>
          ) : (
            <FeatureHeader>Free</FeatureHeader>
          )}
          {displayDiscount && (
            <SupportingText sx={{ color: 'hsl(var(--success))' }}>Save {displayDiscount}</SupportingText>
          )}
        </Box>
      </Box>

      {/* Course Details Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
          mb: 3,
        }}
      >
        <Box>
          <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Course Info</SupportingText>
          <BodyText sx={{ mb: 0.5 }}>{item.course_id}</BodyText>
          <BodyText>{courseDetails.hs_subject}</BodyText>
        </Box>

        <Box>
          <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Section</SupportingText>
          <BodyText sx={{ mb: 0.5 }}>CRN: {item.crn}</BodyText>
          <BodyText>{courseDetails.term || 'Term not set'}</BodyText>
        </Box>

        {selectedSection && (
          <Box>
            <SupportingText sx={{ color: 'hsl(var(--muted-foreground))', mb: 1 }}>Schedule</SupportingText>
            <BodyText
              sx={{
                color: 'hsl(var(--brand-primary))',
                fontWeight: 500,
              }}
            >
              {sections
                .filter((section) => section.crn === selectedSection)
                .map((section) => (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <span>
                      {formatSchedule(section.section_times?.[0])} {formatTimes(section.section_times?.[1])}
                    </span>
                    <span>{section.section_dates?.[0] || 'Dates not set'}</span>
                  </Box>
                ))}
            </BodyText>
          </Box>
        )}
      </Box>

      {/* Bottom Row - College Name and Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid hsl(var(--border))',
          pt: 3,
        }}
      >
        {/* Institution Logo/Name */}
        {item.college ? (
          <Box
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/provider/${item.college.toLowerCase().replace(' ', '-')}`)
            }}
          >
            <img
              src={getInstitutionLogo(item.college)}
              alt={`${item.college} Logo`}
              style={{ width: '100px', height: 'auto' }}
            />
          </Box>
        ) : (
          <SupportingText
            sx={{
              color: 'hsl(var(--brand-primary))',
              fontWeight: 500,
            }}
          >
            {item.college + '123'}
          </SupportingText>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(item.id)
            }}
            sx={{
              color: 'hsl(var(--destructive))',
              '&:hover': {
                backgroundColor: 'hsl(var(--destructive) / 0.1)',
              },
            }}
          >
            Remove
          </Button>

          <Button
            size="small"
            onClick={handleOpenSectionSelect}
            sx={{
              color: 'hsl(var(--brand-primary))',
              '&:hover': {
                backgroundColor: 'hsl(var(--brand-primary-light))',
              },
            }}
          >
            Change Section
          </Button>

          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              if (item.saved_for_later) {
                onMoveToCart(item.id)
              } else {
                onSaveForLater(item.id)
              }
            }}
            sx={{
              color: 'hsl(var(--brand-primary))',
              '&:hover': {
                backgroundColor: 'hsl(var(--brand-primary-light))',
              },
            }}
          >
            {item.saved_for_later ? 'Move to Cart' : 'Save for Later'}
          </Button>
        </Box>
      </Box>

      <Popover
        open={openSectionSelect}
        anchorEl={sectionAnchorEl}
        onClose={handleCloseSectionSelect}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: '400px',
            p: 2,
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <FeatureHeader sx={{ mb: 2 }}>Available Sections</FeatureHeader>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sections.map((section) => (
            <Paper
              key={section.crn}
              elevation={0}
              onClick={() => {
                onSectionSelect(section.crn)
                handleCloseSectionSelect()
              }}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedSection === section.crn ? 'hsl(var(--brand-primary))' : 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                backgroundColor:
                  selectedSection === section.crn ? 'hsl(var(--brand-primary-light))' : 'hsl(var(--card))',
                '&:hover': {
                  borderColor: 'hsl(var(--brand-primary))',
                  backgroundColor:
                    selectedSection === section.crn ? 'hsl(var(--brand-primary-light))' : 'hsl(var(--accent))',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <BodyText sx={{ fontWeight: 500 }}>CRN: {section.crn}</BodyText>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedSection === section.crn && (
                    <SupportingText sx={{ color: 'hsl(var(--brand-primary))' }}>Selected</SupportingText>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <SupportingText>
                  {formatSchedule(section.section_times?.[0])} {formatTimes(section.section_times?.[1])}
                </SupportingText>
                <SupportingText>{section.section_dates?.[0] || 'Dates not set'}</SupportingText>
              </Box>
            </Paper>
          ))}
        </Box>
      </Popover>
    </Paper>
  )
}

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    course_id: PropTypes.string.isRequired,
    course_type: PropTypes.oneOf(['college', 'youredu']).isRequired,
    college: PropTypes.string.isRequired,
    crn: PropTypes.string,
    price: PropTypes.number,
    discount: PropTypes.number,
    saved_for_later: PropTypes.bool,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onSaveForLater: PropTypes.func.isRequired,
  onMoveToCart: PropTypes.func.isRequired,
  selectedSection: PropTypes.string,
  onSectionSelect: PropTypes.func.isRequired,
}

export default CartItem
