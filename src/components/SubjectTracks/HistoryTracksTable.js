import React from 'react';
import { Box, Button } from '@mui/material';

const HistoryTracksTable = ({ handleCourseClick: parentHandleClick }) => {
  const cardHeight = '60px';
  
  const electives = [
    { id: 'psychology', name: 'Psychology' },
    { id: 'sociology', name: 'Sociology' },
    { id: 'economics', name: 'Economics' },
    { id: 'political-science', name: 'Political Science' }
  ];
  
  const tracks = [
    {
      name: 'Advanced',
      courses: [
        { id: 'world-history-h', name: 'World History Honors', year: 1 },
        { id: 'us-history-h', name: 'US History Honors', year: 2 },
        { 
          id: 'year3',
          year: 3,
          options: [
            { id: 'ap-world', name: 'AP World History' },
            { id: 'ap-euro', name: 'AP European History' }
          ]
        },
        { id: 'ap-us-history', name: 'AP US History', year: 4 }
      ],
      color: 'hsl(45, 100%, 25%)' // Dark gold
    },
    {
      name: 'Standard',
      courses: [
        { id: 'world-history', name: 'World History', year: 1 },
        { id: 'us-history', name: 'US History', year: 2 },
        { id: 'civics', name: 'Civics', year: 3 },
        { id: 'government', name: 'American Government', year: 4 }
      ],
      color: 'hsl(45, 80%, 45%)' // Medium gold
    },
    {
      name: 'Minimum',
      courses: [
        { id: 'world-history-min', name: 'World History', year: 1 },
        { id: 'us-history-min', name: 'US History', year: 2 },
        { id: 'civics-min', name: 'Civics', year: 3 },
        { id: 'not-required', name: 'Not required', year: 4 }
      ],
      color: 'hsl(45, 70%, 65%)' // Light gold, one shade darker
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
    backgroundColor: 'white',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    padding: '0.75rem 1rem',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'hsl(var(--foreground))',
    fontSize: '0.9rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    textTransform: 'none',
    whiteSpace: 'normal',
    lineHeight: 1.2,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }
  };

  const staticTextStyles = {
    ...commonButtonStyles,
    border: '2px dashed hsl(var(--border))',
    backgroundColor: 'transparent',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
    cursor: 'default',
    '&:hover': {
      transform: 'none',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: 'hsl(var(--muted-foreground))',
    }
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
                height: track.name === 'Advanced' ? cardHeight * 2 : cardHeight // Only Advanced track is taller
              }}>
                {track.name}
              </Box>
              {track.courses.map((course, index) => (
                <Box key={course.id} sx={{ 
                  position: 'relative',
                  height: track.name === 'Advanced' ? cardHeight * 2 : cardHeight, // Only Advanced track is taller
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {course.name === 'Not required' ? (
                    <Box sx={{
                      ...staticTextStyles,
                      width: '100%',
                      height: cardHeight // Keep original height
                    }}>
                      {course.name}
                    </Box>
                  ) : course.options ? (
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      position: 'relative',
                      height: 'auto',
                      width: '100%'
                    }}>
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
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={(event) => handleCourseClick(event, course)}
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
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        mt: 2
      }}>
        <Box sx={{ 
          color: '#000000',
          fontWeight: 600,
          fontSize: '1.125rem',
          pl: 2
        }}>
          Popular Electives
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
          width: '100%'
        }}>
          {electives.map((elective) => (
            <Button
              key={elective.id}
              variant="outlined"
              onClick={(event) => handleCourseClick(event, elective)}
              sx={{
                ...commonButtonStyles,
                backgroundColor: 'hsl(45, 30%, 97%)',
                color: 'hsl(45, 30%, 30%)',
                borderColor: 'hsl(45, 30%, 70%)',
                '&:hover': {
                  backgroundColor: 'hsl(45, 30%, 95%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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

export default HistoryTracksTable; 