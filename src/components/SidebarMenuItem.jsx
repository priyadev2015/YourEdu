import { ListItem, ListItemText, Typography, Box } from '@mui/material'

export default function SidebarMenuItem({ label, isActive, onClick, notificationCount }) {
  return (
    <ListItem
      button
      onClick={onClick}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        px: 1.5,
        py: 1,
        '&.Mui-selected': {
          backgroundColor: 'rgba(66, 153, 225, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(66, 153, 225, 0.2)',
          },
        },
        '&:hover': {
          backgroundColor: 'rgba(66, 153, 225, 0.05)',
        },
        position: 'relative',
      }}
      selected={isActive}
    >
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={{
              color: isActive ? '#2d3748' : '#4a5568',
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
        }
      />

      {notificationCount > 0 && (
        <Box
          sx={{
            position: 'absolute',
            right: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '20px',
            height: '20px',
            borderRadius: '10px',
            backgroundColor: 'hsl(var(--destructive))',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            padding: '0 6px',
          }}
        >
          {notificationCount}
        </Box>
      )}
    </ListItem>
  )
}
