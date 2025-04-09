// Base spacing unit (4px)
const unit = 4

// Create a spacing scale
const createScale = (base) => {
  const scale = {}
  for (let i = 0; i <= 64; i++) {
    scale[i] = base * i
  }
  return scale
}

export const spacing = {
  // Base spacing units (0-256px)
  ...createScale(unit),

  // Named spacing aliases
  none: 0,
  xs: unit, // 4px
  sm: unit * 2, // 8px
  md: unit * 4, // 16px
  lg: unit * 6, // 24px
  xl: unit * 8, // 32px
  '2xl': unit * 12, // 48px
  '3xl': unit * 16, // 64px
  '4xl': unit * 24, // 96px
  '5xl': unit * 32, // 128px
  '6xl': unit * 48, // 192px
  '7xl': unit * 64, // 256px

  // Component-specific spacing
  components: {
    // Page Sections
    section: {
      spacing: {
        xs: unit * 8,  // 32px
        sm: unit * 12, // 48px
        md: unit * 16, // 64px
        lg: unit * 24, // 96px
        xl: unit * 32, // 128px
      },
      padding: {
        top: unit * 16,    // 64px
        bottom: unit * 16, // 64px
      }
    },

    // Container
    container: {
      maxWidth: '1280px',
      padding: {
        x: {
          default: unit * 6, // 24px
          mobile: unit * 4,  // 16px
        },
        y: unit * 6, // 24px
      },
      gap: unit * 8, // 32px between sections
    },

    // Card
    card: {
      padding: {
        xs: unit * 3,  // 12px
        sm: unit * 4,  // 16px
        md: unit * 6,  // 24px
        lg: unit * 8,  // 32px
        xl: unit * 12, // 48px
      },
      gap: {
        content: unit * 4,  // 16px between content
        grid: unit * 6,     // 24px between grid items
        section: unit * 8,  // 32px between sections
      },
      icon: {
        size: {
          sm: unit * 8,   // 32px
          md: unit * 10,  // 40px
          lg: unit * 12,  // 48px
          xl: unit * 16,  // 64px
        }
      }
    },

    // Form Elements
    form: {
      gap: unit * 6,      // 24px between form groups
      fieldset: unit * 8, // 32px between fieldsets
      label: unit * 2,    // 8px between label and input
    },

    // Button
    button: {
      padding: {
        xs: `${unit}px ${unit * 2}px`,     // 4px 8px
        sm: `${unit * 2}px ${unit * 3}px`,  // 8px 12px
        md: `${unit * 2}px ${unit * 4}px`,  // 8px 16px
        lg: `${unit * 3}px ${unit * 6}px`,  // 12px 24px
        xl: `${unit * 4}px ${unit * 8}px`,  // 16px 32px
      },
      gap: unit * 2, // 8px between button elements
    },

    // Text
    text: {
      margin: {
        paragraph: unit * 4, // 16px between paragraphs
        heading: unit * 6,   // 24px after headings
        list: unit * 2,      // 8px between list items
      },
      maxWidth: {
        paragraph: '65ch',    // Optimal reading length
        heading: '20ch',      // Prevent overly long headings
      }
    }
  }
}

// Layout spacing presets
export const layout = {
  page: {
    x: spacing.components.container.padding.x.default,
    y: spacing.components.container.padding.y,
    maxWidth: spacing.components.container.maxWidth,
  },
  section: {
    x: spacing.components.container.padding.x.mobile,
    y: spacing.components.section.padding.top,
    gap: spacing.components.container.gap,
  },
  grid: {
    gap: {
      xs: spacing[2], // 8px
      sm: spacing[4], // 16px
      md: spacing[6], // 24px
      lg: spacing[8], // 32px
      xl: spacing[12], // 48px
    }
  }
}

// Helper function to get spacing value
export const getSpacing = (value) => {
  if (typeof value === 'number') {
    return `${value * unit}px`
  }
  return spacing[value] || value
}

// Helper to combine spacing values
export const combine = (...values) => {
  return values.map(value => getSpacing(value)).join(' ')
}

export default {
  spacing,
  layout,
  getSpacing,
  combine,
}