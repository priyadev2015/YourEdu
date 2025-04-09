export const cssVariables = {
  colors: {
    textPrimary: 'hsl(var(--neutral-900))',   // Keep existing text color
    textSecondary: 'hsl(var(--neutral-500))',  // Keep existing secondary text color
  },
  
  // CSS Variables to be injected into :root
  root: `
    :root {
      /* Brand Colors */
      --brand-primary: 221 65% 46%;
      --brand-primary-light: 225 100% 97%;
      --brand-primary-dark: 222 67% 33%;

      /* Secondary Colors */
      --secondary-green: 142 70% 45%;
      --secondary-green-light: 142 76% 95%;
      --secondary-orange: 25 95% 53%;
      --secondary-orange-light: 27 100% 95%;
      --secondary-purple: 255 92% 76%;
      --secondary-purple-light: 270 100% 95%;

      /* Neutral Colors */
      --neutral-50: 210 40% 98%;
      --neutral-100: 210 40% 96%;
      --neutral-200: 214 32% 91%;
      --neutral-300: 213 27% 84%;
      --neutral-400: 215 20% 65%;
      --neutral-500: 215 25% 27%;
      --neutral-600: 217 33% 17%;
      --neutral-700: 222 47% 11%;

      /* Semantic Colors */
      --success: 142 70% 45%;
      --success-light: 142 76% 95%;
      --warning: 35 92% 51%;
      --warning-light: 48 96% 89%;
      --error: 0 84% 60%;
      --error-light: 0 86% 97%;
      --info: 217 91% 60%;
      --info-light: 214 100% 97%;

      /* Background Colors */
      --background: 0 0% 100%;
      --background-alt: 210 40% 98%;
      --card-background: 0 0% 100%;
      --card-background-hover: 210 40% 98%;

      /* Border Colors */
      --border-light: hsl(var(--neutral-100));
      --border-default: hsl(var(--neutral-200));
      --border-hover: hsl(var(--brand-primary));

      /* Shadow Colors */
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.05);

      /* Border Radius */
      --radius-xs: 2px;
      --radius-sm: 4px;
      --radius-md: 6px;
      --radius-lg: 8px;
      --radius-full: 9999px;

      /* Component-Specific Border Radius */
      --radius-card: var(--radius-sm);
      --radius-button: var(--radius-sm);
      --radius-input: var(--radius-sm);
      --radius-badge: var(--radius-xs);
      --radius-icon: var(--radius-sm);

      /* Spacing */
      --spacing-1: 4px;
      --spacing-2: 8px;
      --spacing-3: 12px;
      --spacing-4: 16px;
      --spacing-5: 20px;
      --spacing-6: 24px;
      --spacing-8: 32px;
      --spacing-10: 40px;
      --spacing-12: 48px;
      --spacing-16: 64px;

      /* Container */
      --container-max-width: 1280px;
      --container-padding-x: 24px;
      --container-padding-y: 24px;
      --container-padding-x-mobile: 16px;

      /* Card */
      --card-padding-outer: 24px;
      --card-padding-inner: 16px;
      --card-padding-footer: 16px;
      --card-gap-grid: 16px;
      --card-gap-elements: 16px;
      --card-gap-icon: 16px;
      --card-icon-size: 48px;
      --card-icon-font-size: 24px;
      --card-stats-gap: 12px;
      --card-stats-padding: 12px;

      /* Typography */
      --font-primary: "IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-size-big-title: 4.5rem;
      --font-size-section-header: 2rem;
      --font-size-feature-header: 1.5rem;
      --font-size-descriptive: 1.125rem;
      --font-size-body: 1rem;
      --font-size-supporting: 0.875rem;
      --font-size-small: 0.75rem;

      /* Line Heights */
      --line-height-big-title: 1.1;
      --line-height-section-header: 1.2;
      --line-height-feature-header: 1.3;
      --line-height-descriptive: 1.6;
      --line-height-body: 1.5;
      --line-height-supporting: 1.5;

      /* Letter Spacing */
      --letter-spacing-big-title: -0.03em;
      --letter-spacing-section-header: -0.015em;
      --letter-spacing-feature-header: -0.01em;
      --letter-spacing-normal: 0;

      /* Font Weights */
      --font-weight-regular: 400;
      --font-weight-medium: 500;
      --font-weight-semibold: 600;
      --font-weight-bold: 700;

      /* Transitions */
      --transition-all: all 0.2s;
      --transition-transform: transform 0.2s;
      --transition-colors: background-color 0.2s, border-color 0.2s, color 0.2s;

      /* Z-Index */
      --z-index-dropdown: 1000;
      --z-index-sticky: 1020;
      --z-index-fixed: 1030;
      --z-index-modal-backdrop: 1040;
      --z-index-modal: 1050;
      --z-index-popover: 1060;
      --z-index-tooltip: 1070;
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
      :root {
        --font-size-big-title: 3rem;
        --font-size-section-header: 1.75rem;
        --font-size-feature-header: 1.25rem;
        --container-padding-x: var(--container-padding-x-mobile);
      }
    }
  `,
  
  // Media query helpers
  mediaQueries: {
    mobile: '@media (max-width: 640px)',
    tablet: '@media (max-width: 768px)',
    desktop: '@media (min-width: 1024px)',
    wide: '@media (min-width: 1280px)',
  },

  // Border radius
  radius: {
    '--radius-none': '0px',
    '--radius-sm': '4px',
    '--radius-md': '6px',
    '--radius-lg': '8px',
    '--radius-xl': '12px',
    '--radius-full': '9999px',
    
    // Component-specific radius
    '--radius-card': '6px',
    '--radius-button': '4px',
    '--radius-input': '4px',
    '--radius-badge': '4px',
    '--radius-icon': '4px',
    '--radius-avatar': '6px',
    '--radius-tooltip': '4px',
    '--radius-popover': '6px',
    '--radius-dialog': '8px',
  }
} 