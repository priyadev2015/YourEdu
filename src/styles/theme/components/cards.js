
export const cardStyles = {
  // Feature Card (e.g. Compliance and College cards)
  feature: {
    p: 0,
    borderRadius: 'var(--radius-card)',
    backgroundColor: 'white',
    border: '1px solid',
    borderColor: `hsl(var(--neutral-200))`,
    cursor: 'pointer',
    transition: 'all 0.2s',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
      '& .arrow-icon': {
        transform: 'translateX(4px)',
      }
    },
    header: {
      padding: '24px',
      paddingBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    },
    icon: {
      width: '48px',
      height: '48px',
      borderRadius: 'var(--radius-icon)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.1)',
      }
    },
    content: {
      flex: 1,
      '& .title-row': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px',
      },
      '& .highlight': {
        padding: '2px 8px',
        borderRadius: 'var(--radius-badge)',
        fontSize: '0.75rem',
        fontWeight: 500,
      }
    },
    stats: {
      marginTop: '16px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      '& .stat-box': {
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: `hsl(var(--neutral-50))`,
        '& .value': {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1,
          marginBottom: '4px',
        }
      }
    },
    footer: {
      marginTop: 'auto',
      padding: '16px',
      borderTop: '1px solid',
      borderColor: `hsl(var(--neutral-100))`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& .arrow-icon': {
        transition: 'transform 0.2s'
      }
    }
  },

  // Info Card (e.g. Why Compliance Matters section)
  info: {
    padding: '24px',
    borderRadius: 'var(--radius-card)',
    backgroundColor: `hsl(var(--neutral-50))`,
    border: '1px solid',
    borderColor: `hsl(var(--neutral-200))`,
  },

  // Hero Card (e.g. gradient hero sections)
  hero: {
    position: 'relative',
    overflow: 'hidden',
    background: `hsl(var(--background))`,
    borderBottom: '1px solid',
    borderColor: `hsl(var(--border))`,
  },

  // Section Header (for page hero sections)
  section: {
    position: 'relative',
    overflow: 'hidden',
    background: `hsl(var(--background))`,
    borderBottom: '1px solid',
    borderColor: `hsl(var(--border))`,
    pt: 'var(--spacing-8)',
    pb: 'var(--spacing-6)',
  },

  // Action Card (e.g. Parent Tools cards in Home)
  action: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: `hsl(var(--neutral-50))`,
    borderRadius: 'var(--radius-card)',
    border: '1px solid',
    borderColor: `hsl(var(--neutral-200))`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      backgroundColor: 'white',
    },
    icon: {
      width: '40px',
      height: '40px',
      borderRadius: 'var(--radius-icon)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  },

  // Stats Card (e.g. stats in MyHomeschool)
  stats: {
    backgroundColor: `hsla(var(--neutral-100), 0.5)`,
    borderRadius: 'var(--radius-card)',
    padding: '16px',
    value: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: `hsl(var(--text-primary))`,
    },
    label: {
      fontSize: '0.875rem',
      color: `hsl(var(--text-secondary))`,
    }
  },

  // Sub-feature Card (e.g. Document Generation items in MyHomeschool)
  subFeature: {
    display: 'flex',
    alignItems: 'start',
    gap: '16px',
    padding: '16px',
    borderRadius: 'var(--radius-card)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: `hsl(var(--neutral-100))`,
    },
    icon: {
      padding: '8px',
      borderRadius: 'var(--radius-icon)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      textAlign: 'left',
    },
    badge: {
      fontSize: '0.75rem',
      padding: '2px 8px',
      borderRadius: 'var(--radius-badge)',
    }
  }
} 