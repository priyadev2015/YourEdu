// Breakpoint values in pixels
export const breakpoints = {
  xs: '320px',   // Small phones
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Large laptops/desktops
  '2xl': '1536px', // Extra large screens
}

// Media query strings for min-width
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Max-width queries for targeting specific ranges
  mobile: `@media (max-width: ${breakpoints.sm})`,
  tablet: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
  
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // High-DPI screens
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
}

// Convert pixel values to rems (assuming 16px base)
export const toRem = (pixels) => `${parseInt(pixels) / 16}rem`

// Helper function to get breakpoint value
export const getBreakpoint = (key) => breakpoints[key]

// Helper function to create a custom media query
export const createMediaQuery = (minWidth, maxWidth) => {
  if (maxWidth) {
    return `@media (min-width: ${minWidth}) and (max-width: ${maxWidth})`
  }
  return `@media (min-width: ${minWidth})`
}

// Container sizes that correspond to breakpoints
export const containers = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export default {
  breakpoints,
  mediaQueries,
  toRem,
  getBreakpoint,
  createMediaQuery,
  containers,
} 