// This is a MUI theme file. The colors are taken from Diya's color palette.
// Please move toward using this file as the source of truth for colors
// and other theme settings.

import { createTheme } from '@mui/material/styles'

// Define font stack once to maintain consistency
const fontStack = ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'].join(',')

export const theme = createTheme({
  palette: {
    // Brand Colors
    primary: {
      main: 'hsl(207, 100%, 21%)', // #00356B
      light: 'hsl(208, 43%, 73%)', // #A0BDD6
      // dark variant for hover states (10% darker than main)
      dark: 'hsl(207, 100%, 11%)',
    },
    secondary: {
      main: 'hsl(210, 40%, 96%)',
      light: 'hsl(210, 40%, 98%)',
      dark: 'hsl(210, 40%, 88%)',
    },
    // Icon Colors
    icons: {
      blue: 'hsl(221, 67%, 46%)', // #2959C2
      green: 'hsl(142, 70%, 45%)', // #22C35D
      orange: 'hsl(24, 94%, 53%)', // #F97415
      purple: 'hsl(255, 92%, 76%)', // #A689FA
    },
    // Background Colors
    background: {
      default: 'hsl(0, 0%, 100%)', // #FFFFFF
      paper: 'hsl(0, 0%, 100%)', // #FFFFFF
      card: 'hsl(210, 33%, 98%)', // #F8FAFB
      cardHover: 'hsl(210, 6%, 88%)', // #DFE1E2
      gradient: 'linear-gradient(1deg, hsl(0, 0%, 100%) 0%, hsl(222, 47%, 90%) 100%)',
    },
    // Text Colors
    text: {
      primary: 'hsl(207, 100%, 21%)', // #00356B
      secondary: 'hsl(207, 100%, 21%, 0.7)', // #00356B with opacity
      white: 'hsl(0, 0%, 100%)', // #FFFFFF
    },
    // Semantic Colors
    success: {
      main: 'hsl(142, 70%, 45%)',
      light: 'hsl(142, 76%, 95%)',
      dark: 'hsl(142, 70%, 35%)',
    },
    warning: {
      main: 'hsl(35, 92%, 50%)',
      light: 'hsl(35, 92%, 95%)',
      dark: 'hsl(35, 92%, 40%)',
    },
    error: {
      main: 'hsl(0, 84%, 60%)', // #EF4444
      light: 'hsl(0, 84%, 95%)', // #FEE2E2
      dark: 'hsl(0, 84%, 50%)',
    },
    info: {
      main: 'hsl(217, 91%, 60%)',
      light: 'hsl(217, 91%, 97%)',
      dark: 'hsl(217, 91%, 50%)',
    },
    // Additional utility colors
    divider: 'hsl(210, 6%, 88%)', // #DFE1E2
    // Course card colors - used for random assignment
    courseCards: {
      pink: 'hsl(342, 84%, 49%)', // #E1195C
      green: 'hsl(120, 100%, 26%)', // #008400
      blue: 'hsl(221, 86%, 55%)', // #2A62EE
      orange: 'hsl(24, 86%, 50%)', // #EF6712
    },
    // Filter button colors
    filter: {
      active: 'hsl(225, 62%, 44%)', // #2B52B4
      inactive: 'hsl(222, 47%, 90%)', // #D8E0F3
    },
  },
  // Custom CSS properties for direct HSL usage
  variables: {
    '--background': '0, 29%, 95%',
    '--foreground': '207, 100%, 21%',
    '--card': '210, 33%, 98%',
    '--card-hover': '210, 6%, 88%',
    '--primary': '207, 100%, 21%',
    '--primary-hover': '207, 100%, 11%',
  },
  typography: {
    fontFamily: ['Inter', ...fontStack].join(','),
    // Override typography variants to ensure consistent font usage
    h1: {
      fontFamily: fontStack,
    },
    h2: {
      fontFamily: fontStack,
    },
    h3: {
      fontFamily: fontStack,
    },
    h4: {
      fontFamily: fontStack,
    },
    h5: {
      fontFamily: fontStack,
    },
    h6: {
      fontFamily: fontStack,
    },
    subtitle1: {
      fontFamily: fontStack,
    },
    subtitle2: {
      fontFamily: fontStack,
    },
    body1: {
      fontFamily: fontStack,
    },
    body2: {
      fontFamily: fontStack,
    },
    button: {
      fontFamily: fontStack,
      textTransform: 'none', // Prevent MUI's default uppercase transform
    },
    // Custom variants we defined earlier
    pageHeader: {
      fontFamily: fontStack,
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    sectionHeader: {
      fontFamily: fontStack,
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
  },
  // Add custom shadows or other theme customizations if needed
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    // Add other component customizations as needed
  },
})
