/* This file should slowly be phased out in favor of the theme/theme.js file */

// Import the MUI theme as source of truth
import { theme } from '../../theme/theme'

// Helper function to convert MUI HSL to our format
const extractHSL = (hslString) => {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`
  }
  return hslString
}

export const colors = {
  // Brand Colors - Derived from MUI theme
  brand: {
    primary: extractHSL(theme.palette.primary.main),
    primaryLight: extractHSL(theme.palette.primary.light),
    primaryDark: extractHSL(theme.palette.primary.dark),
    accent: '255 92% 76%', // Secondary brand color for highlights
  },

  // UI Colors - For interface elements
  ui: {
    background: extractHSL(theme.palette.background.default),
    surface: extractHSL(theme.palette.background.paper),
    border: '214 32% 91%', // Subtle borders
    hover: '210 40% 96%', // Hover state background
    focus: '221 65% 46% / 0.1', // Focus state ring
    overlay: '222 47% 11% / 0.5', // Modal overlays
  },

  // Feedback Colors - For system messaging
  feedback: {
    success: '142 72% 29%', // Darker green for better contrast
    successLight: '142 76% 95%',
    warning: '38 92% 50%', // Optimized orange
    warningLight: '38 96% 95%',
    error: '0 84% 60%', // Standard red
    errorLight: '0 86% 97%',
    info: '217 91% 60%', // Clear blue
    infoLight: '214 100% 97%',
  },

  // Text Colors - Optimized for readability
  text: {
    primary: '222 47% 11%', // Near-black for primary text
    secondary: '215 25% 27%', // Dark gray for secondary text
    tertiary: '215 20% 65%', // Medium gray for supporting text
    onDark: '210 40% 98%', // Light text for dark backgrounds
    disabled: '215 20% 65% / 0.7', // Faded text for disabled states
  },

  // Action Colors - For interactive elements
  action: {
    primary: '221 65% 46%', // Same as brand.primary
    hover: '222 67% 33%', // Darker for hover
    selected: '225 100% 97%', // Light for selected state
    disabled: '215 20% 65% / 0.4', // Faded for disabled state
  },

  // Neutral Colors - For UI construction
  neutral: {
    50: '210 40% 98%',
    100: '210 40% 96%',
    200: '214 32% 91%',
    300: '213 27% 84%',
    400: '215 20% 65%',
    500: '215 25% 27%',
    600: '217 33% 17%',
    700: '222 47% 11%',
  },

  // Accent Colors - For data visualization and highlights
  accent: {
    blue: '217 91% 60%',
    green: '142 72% 29%',
    yellow: '38 92% 50%',
    purple: '255 92% 76%',
    teal: '173 80% 40%',
    orange: '25 95% 53%',
  },

  // Secondary Colors (for cards and icons - keeping what works in Home.js)
  secondary: {
    green: '142 70% 45%',
    greenLight: '142 76% 95%',
    orange: '25 95% 53%',
    orangeLight: '27 100% 95%',
    purple: '255 92% 76%',
    purpleLight: '270 100% 95%',
  },

  // New YourEDU Colors (as alternates/additions)
  youredu: {
    navy: '212 100% 21%', // #00356B
    background: '0 29% 95%', // #F7F0F0
    card: '210 33% 98%', // #F8FAFB
    cardHover: '210 5% 88%', // #DFE1E2
  },
}

// Helper function to get a color value
export const getColor = (path) => {
  const parts = path.split('.')
  return parts.reduce((obj, key) => obj?.[key], colors)
}

// Convert HSL values to CSS variable reference
export const hslToVar = (colorPath) => {
  const color = getColor(colorPath)
  return color ? `hsl(${color})` : undefined
}

// Helper functions for color manipulation
export const colorUtils = {
  // Darken a color by reducing lightness
  darken: (color, amount = 10) => {
    const [h, s, l] = color.split(' ')
    const newL = Math.max(0, parseInt(l) - amount)
    return `${h} ${s} ${newL}%`
  },

  // Lighten a color by increasing lightness
  lighten: (color, amount = 10) => {
    const [h, s, l] = color.split(' ')
    const newL = Math.min(100, parseInt(l) + amount)
    return `${h} ${s} ${newL}%`
  },

  // Adjust opacity
  alpha: (color, opacity) => {
    return `${color} / ${opacity}`
  },
}

export default {
  colors,
  getColor,
  hslToVar,
  colorUtils,
}
