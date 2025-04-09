export const themeColors = {
  brand: {
    primary: '221 65% 46%', // Royal Blue converted to HSL
    // primary: '217 91% 53%',
    primaryLight: '225 100% 97%',
    primaryDark: '222 67% 33%',
  },
  secondary: {
    green: '142 70% 45%',
    greenLight: '142 76% 95%',
    orange: '25 95% 53%',
    orangeLight: '27 100% 95%',
    purple: '255 92% 76%',
    purpleLight: '270 100% 95%',
  },
  neutral: {
    50: '210 40% 98%',
    100: '210 40% 96%',
    200: '214 32% 91%',
    300: '213 27% 84%',
    500: '215 20% 65%',
    700: '215 25% 27%',
    900: '222 47% 11%',
  },
  semantic: {
    success: '142 70% 45%',
    successLight: '142 76% 95%',
    warning: '35 92% 51%',
    warningLight: '48 96% 89%',
    error: '0 84% 60%',
    errorLight: '0 86% 97%',
    info: '217 91% 60%',
    infoLight: '214 100% 97%',
  },
}

// Helper function to convert HSL values to CSS custom property format
export const hslToVar = (value) => `hsl(var(--${value}))`
