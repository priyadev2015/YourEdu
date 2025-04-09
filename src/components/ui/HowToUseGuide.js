import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Collapse, 
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/material/styles';
import { theme } from '../../theme/theme';

// Styled expand button for animation
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

/**
 * A collapsible "How to Use" guide component
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Guide title
 * @param {Array} props.sections - Array of section objects with { title, content }
 * @param {Object} props.sx - Additional styles to apply to the container
 * @param {boolean} props.defaultExpanded - Whether the guide is expanded by default
 * @returns {JSX.Element} The HowToUseGuide component
 */
const HowToUseGuide = ({ 
  title = "How to Use",
  sections = [],
  sx = {},
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        mb: 3,
        ...sx
      }}
    >
      {/* Header section */}
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 2,
          backgroundColor: 'hsl(var(--card))',
          borderBottom: expanded ? `1px solid ${theme.palette.divider}` : 'none',
          cursor: 'pointer'
        }}
        onClick={handleExpandClick}
      >
        <HelpOutlineIcon sx={{ color: 'hsl(var(--primary))', mr: 1.5 }} />
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600,
            flexGrow: 1
          }}
        >
          {title}
        </Typography>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </Box>

      {/* Content section */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 3 }}>
          <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
            {sections.map((section, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ 
                py: 1.5, 
                borderBottom: index < sections.length - 1 ? '1px solid hsl(var(--border))' : 'none',
              }}>
                <ListItemText
                  primary={
                    <Typography 
                      component="span" 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        display: 'inline-block',
                        mr: 0.5 
                      }}
                    >
                      {section.title}:
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      component="span" 
                      variant="body2" 
                      color="text.primary"
                    >
                      {section.content}
                    </Typography>
                  }
                  sx={{ 
                    my: 0,
                    '& .MuiTypography-root': { 
                      display: 'inline' 
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default HowToUseGuide; 