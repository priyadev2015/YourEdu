import { Box, Button } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'
import { PROVIDER_CONFIG } from '../constants/courseConstants'

export default function ProviderHeader({ provider }) {
  const providerConfig = PROVIDER_CONFIG[provider]

  if (!providerConfig) return null

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 4,
        p: 3,
        borderRadius: 'var(--radius)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <img
          src={providerConfig.logo}
          alt={`${provider} logo`}
          style={{
            height: providerConfig.logoHeight,
            width: 'auto',
          }}
        />
        <Button
          component="a"
          href={providerConfig.lmsUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<OpenInNew />}
          size="large"
          sx={{
            color: 'hsl(var(--brand-primary))',
            fontSize: '1rem',
            padding: '10px 24px',
            '&:hover': {
              backgroundColor: 'hsla(var(--brand-primary), 0.1)',
            },
          }}
        >
          Go to course page
        </Button>
      </Box>
    </Box>
  )
}
