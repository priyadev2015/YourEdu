const { themeColors } = require('./src/styles/theme.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '!./node_modules', // Explicitly exclude node_modules
  ],
  theme: {
    extend: {
      fontSize: {
        // Custom font sizes
        'section-header': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'feature-header': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        descriptive: ['1.125rem', { lineHeight: '1.6' }],
        body: ['1rem', { lineHeight: '1.5' }],
        supporting: ['0.875rem', { lineHeight: '1.5' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          primary: `hsl(${themeColors.brand.primary})`,
          'primary-light': `hsl(${themeColors.brand.primaryLight})`,
          'primary-dark': `hsl(${themeColors.brand.primaryDark})`,
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
