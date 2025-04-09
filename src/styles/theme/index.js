import * as colors from './colors'
import * as typography from './typography'
import * as spacing from './spacing'
import * as breakpoints from './breakpoints'
import { cssVariables } from './css-variables'
import { hslToVar } from './colors'

const theme = {
  colors: colors.colors,
  getColor: colors.getColor,
  hslToVar: colors.hslToVar,
  
  // Typography
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  letterSpacing: typography.letterSpacing,
  lineHeight: typography.lineHeight,
  textStyles: typography.textStyles,
  
  // Spacing
  spacing: spacing.spacing,
  layout: spacing.layout,
  getSpacing: spacing.getSpacing,
  
  // Breakpoints
  breakpoints: breakpoints.breakpoints,
  mediaQueries: breakpoints.mediaQueries,
  getBreakpoint: breakpoints.getBreakpoint,
  createMediaQuery: breakpoints.createMediaQuery,

  // CSS Variables
  cssVariables: cssVariables,
}

// Inject CSS variables into :root
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = cssVariables.root
  document.head.appendChild(style)
}

export const themeColors = {
  // Brand
  brandPrimary: 'hsl(var(--brand-primary))',
  brandPrimaryLight: 'hsl(var(--brand-primary-light))',
  brandPrimaryDark: 'hsl(var(--brand-primary-dark))',
  brandPrimaryForeground: 'hsl(var(--brand-primary-foreground))',

  // Background
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',

  // Text
  textPrimary: 'hsl(var(--text-primary))',
  textSecondary: 'hsl(var(--text-secondary))',

  // Neutral
  neutral50: 'hsl(var(--neutral-50))',
  neutral100: 'hsl(var(--neutral-100))',
  neutral200: 'hsl(var(--neutral-200))',
  neutral300: 'hsl(var(--neutral-300))',
  neutral400: 'hsl(var(--neutral-400))',
  neutral500: 'hsl(var(--neutral-500))',
  neutral600: 'hsl(var(--neutral-600))',
  neutral700: 'hsl(var(--neutral-700))',
  neutral800: 'hsl(var(--neutral-800))',
  neutral900: 'hsl(var(--neutral-900))',

  // Status
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--error))',
}

export { hslToVar }

// CSS Variables root styles
export const cssVariables = {
  root: `
    :root {
      /* Colors */
      --brand-primary: 215 100% 21%;
      --brand-primary-light: 215 100% 96%;
      --brand-primary-dark: 215 100% 15%;
      --brand-primary-foreground: 0 0% 100%;
    
      --background: 0 0% 100%;
      --foreground: 222.2 47.4% 11.2%;
      
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
    
      --border: 214.3 31.8% 91.4%;
      
      --text-primary: 215 25% 27%;
      --text-secondary: 215 16% 47%;
      
      --success: 142 76% 36%;
      --warning: 38 92% 50%;
      --error: 0 84% 60%;
    
      --neutral-50: 210 40% 98%;
      --neutral-100: 210 40% 96%;
      --neutral-200: 214 32% 91%;
      --neutral-300: 213 27% 84%;
      --neutral-400: 215 20% 65%;
      --neutral-500: 215 16% 47%;
      --neutral-600: 215 19% 35%;
      --neutral-700: 215 25% 27%;
      --neutral-800: 217 33% 17%;
      --neutral-900: 222 47% 11%;
    }
  `
}

export default {
  colors: themeColors,
  cssVariables
} 