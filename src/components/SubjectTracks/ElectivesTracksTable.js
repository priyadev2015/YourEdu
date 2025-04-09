import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const ElectivesTracksTable = ({ handleCourseClick: parentHandleClick }) => {
  const cardHeight = '60px';
  
  const electives = [
    { id: 'psychology', name: 'Psychology' },
    { id: 'sociology', name: 'Sociology' },
    { id: 'economics', name: 'Economics' },
    { id: 'computer-science', name: 'Computer Science' },
    { id: 'statistics', name: 'Statistics' }
  ];
  
  const tracks = [
    {
      name: 'Advanced',
      courses: [
        { id: 'ap-psychology', name: 'AP Psychology', year: 1 },
        { id: 'ap-economics', name: 'AP Economics', year: 2 },
        { 
          id: 'year3',
          year: 3,
          options: [
            { id: 'ap-computer-science', name: 'AP Computer Science' },
            { id: 'ap-statistics', name: 'AP Statistics' }
          ]
        },
        { id: 'ap-research', name: 'AP Research', year: 4 }
      ],
      color: 'hsl(280, 100%, 25%)' // Dark purple
    },
    {
      name: 'Standard',
      courses: [
        { id: 'psychology', name: 'Psychology', year: 1 },
        { id: 'economics', name: 'Economics', year: 2 },
        { id: 'computer-science', name: 'Computer Science', year: 3 },
        { id: 'statistics', name: 'Statistics', year: 4 }
      ],
      color: 'hsl(280, 80%, 45%)' // Medium purple
    },
    {
      name: 'Minimum',
      courses: [
        { id: 'psychology-min', name: 'Psychology', year: 1 },
        { id: 'economics-min', name: 'Economics', year: 2 },
        { id: 'not-required-1', name: 'Not required', year: 3 },
        { id: 'not-required-2', name: 'Not required', year: 4 }
      ],
      color: 'hsl(280, 70%, 65%)' // Light purple
    }
  ];

  const handleCourseClick = (event, course) => {
    event.preventDefault();
    event.stopPropagation();
    parentHandleClick(event, course);
  }

  const commonButtonStyles = {
    width: '100%',
    height: cardHeight,
    textTransform: 'none',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    fontSize: '0.9rem',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    }
  };

  const staticTextStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.9rem',
    fontWeight: 500
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
      maxHeight: 'calc(100vh - 400px)',
      overflow: 'auto',
      width: '100%'
    }}>
      {/* Tracks Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(100px, 120px) repeat(4, minmax(120px, 1fr))',
          sm: 'minmax(120px, 150px) repeat(4, minmax(150px, 1fr))'
        },
        gap: { xs: 2, sm: 3 },
        width: '100%'
      }}>
        {/* Track Rows */}
        {tracks.map((track, trackIndex) => (
          <React.Fragment key={track.name}>
            <Box sx={{ 
              gridColumn: '1 / -1',
              display: 'grid',
              gridTemplateColumns: 'inherit',
              gap: 'inherit',
              borderBottom: trackIndex !== tracks.length - 1 ? '1px solid hsl(var(--border))' : 'none',
              pb: trackIndex !== tracks.length - 1 ? 3 : 0,
              mb: trackIndex !== tracks.length - 1 ? 3 : 0,
            }}>
              <Box sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                pl: 2,
                color: track.color,
                height: track.name === 'Advanced' ? cardHeight * 2 : cardHeight
              }}>
                {track.name}
              </Box>
              {track.courses.map((course) => (
                <Box key={course.id} sx={{ 
                  position: 'relative',
                  height: track.name === 'Advanced' ? cardHeight * 2 : cardHeight,
                  width: '100%',
                  display: 'flex',
                  alignItems: track.name === 'Advanced' ? 'center' : 'flex-start'
                }}>
                  {course.options ? (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {course.options.map((option, optionIndex) => (
                        <React.Fragment key={option.id}>
                          <Button
                            variant="outlined"
                            onClick={(event) => handleCourseClick(event, option)}
                            sx={{
                              ...commonButtonStyles,
                              backgroundColor: track.color,
                              color: 'white',
                              borderColor: track.color,
                              '&:hover': {
                                backgroundColor: track.color,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                opacity: 0.9
                              }
                            }}
                          >
                            {option.name}
                          </Button>
                          {optionIndex === 0 && (
                            <Box sx={{ 
                              textAlign: 'center', 
                              color: 'hsl(var(--muted-foreground))',
                              fontSize: '0.9rem',
                              fontWeight: 500,
                              py: 0.25
                            }}>
                              or
                            </Box>
                          )}
                        </React.Fragment>
                      ))}
                    </Box>
                  ) : course.name.includes('Not required') ? (
                    <Box sx={{
                      ...staticTextStyles,
                      width: '100%',
                      height: track.name === 'Advanced' ? cardHeight * 2 : cardHeight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      Not required
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={(event) => handleCourseClick(event, course)}
                      sx={{
                        ...commonButtonStyles,
                        height: track.name === 'Advanced' ? cardHeight : cardHeight,
                        backgroundColor: track.color,
                        color: 'white',
                        borderColor: track.color,
                        '&:hover': {
                          backgroundColor: track.color,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          opacity: 0.9
                        }
                      }}
                    >
                      {course.name}
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          </React.Fragment>
        ))}
      </Box>

      {/* Electives Section */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ 
          borderBottom: '1px solid hsl(var(--border))',
          pb: 2,
          mb: 3
        }}>
          <Typography sx={{ 
            fontWeight: 600,
            color: 'hsl(var(--foreground))'
          }}>
            Additional College-Prep Electives
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2
        }}>
          {electives.map((elective) => (
            <Button
              key={elective.id}
              variant="outlined"
              onClick={(event) => handleCourseClick(event, elective)}
              sx={{
                ...commonButtonStyles,
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'hsl(var(--muted))',
                  borderColor: 'hsl(var(--border))',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {elective.name}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ElectivesTracksTable; 