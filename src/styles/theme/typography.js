// Font Scale - Using a modular scale with a 1.25 ratio
const createScale = (base) => ({
  xs: `${base * 0.75}rem`, // 12px
  sm: `${base * 0.875}rem`, // 14px
  base: `${base}rem`, // 16px
  lg: `${base * 1.25}rem`, // 20px
  xl: `${base * 1.5}rem`, // 24px
  '2xl': `${base * 2}rem`, // 32px
  '3xl': `${base * 2.5}rem`, // 40px
  '4xl': `${base * 3}rem`, // 48px
  '5xl': `${base * 4}rem`, // 64px
})

// Font families
export const fontFamily = {
  primary:
    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
}

// Font sizes using modular scale
export const fontSize = {
  // UI Elements
  caption: '0.75rem', // 12px
  supporting: '0.875rem', // 14px
  body: '1rem', // 16px
  descriptive: '1.125rem', // 18px

  // Headings
  'feature-header': '24px',
  'section-header': '32px',
  'big-title': '48px',
  'page-header': '2.5rem', // New size for page headers

  // Scale for flexible use
  ...createScale(1),
}

// Font weights
export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

// Letter spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',

  // Semantic
  'big-title': '-0.03em',
  'section-header': '-0.015em',
  'feature-header': '-0.01em',
}

// Line heights
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,

  // Semantic
  'big-title': '56px',
  'section-header': '40px',
  'feature-header': '32px',
  descriptive: '28px',
  body: '24px',
  supporting: '20px',
  'page-header': 1.2, // Adjusted line height for page headers
}

// Semantic text styles that combine multiple properties
export const textStyles = {
  // Display & Headings
  'big-title': {
    fontFamily: fontFamily.primary,
    fontSize: fontSize['big-title'],
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing['big-title'],
    lineHeight: lineHeight['big-title'],
  },
  'section-header': {
    fontFamily: fontFamily.primary,
    fontSize: fontSize['section-header'],
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing['section-header'],
    lineHeight: lineHeight['section-header'],
  },
  'feature-header': {
    fontFamily: fontFamily.primary,
    fontSize: fontSize['feature-header'],
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing['feature-header'],
    lineHeight: lineHeight['feature-header'],
  },

  // Body Text
  descriptive: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.descriptive,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeight.descriptive,
  },
  body: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeight.body,
  },
  supporting: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.supporting,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeight.supporting,
  },
  caption: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeight.normal,
  },

  // Interactive
  button: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.supporting,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeight.none,
  },
  input: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeight.normal,
  },

  // Add a new semantic text style for page headers
  pageHeader: {
    fontFamily: fontFamily.primary,
    fontSize: '1.75rem', // 28px - more appropriate for page headers
    lineHeight: '2.25rem', // 36px
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
    color: 'hsl(var(--text-primary))',
  },
}

// Responsive adjustments
export const responsiveTypography = {
  mobile: {
    'big-title': '2.5rem', // 40px
    'section-header': '1.75rem', // 28px
    'feature-header': '1.25rem', // 20px
    descriptive: '1rem', // 16px
  },
  tablet: {
    'big-title': '3rem', // 48px
    'section-header': '2rem', // 32px
  },
}

export default {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  textStyles,
  responsiveTypography,
}
