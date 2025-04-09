
export const inputStyles = {
  // Search Bar (e.g. Events search in Home)
  searchBar: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    input: {
      width: '100%',
      height: '40px',
      paddingLeft: '40px',
      paddingRight: '16px',
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: `hsl(var(--neutral-200))`,
      borderRadius: '6px',
      fontSize: '0.875rem',
      color: `hsl(var(--text-primary))`,
      transition: 'all 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        borderColor: `hsl(var(--brand-primary))`,
        boxShadow: '0 0 0 2px hsla(var(--brand-primary), 0.1)',
      },
      '&::placeholder': {
        color: `hsl(var(--text-secondary))`,
      }
    },
    icon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: `hsl(var(--text-secondary))`,
      width: '20px',
      height: '20px',
      pointerEvents: 'none',
    }
  },

  // Text Field (e.g. form inputs)
  textField: {
    marginBottom: '16px',
    label: {
      display: 'block',
      marginBottom: '4px',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: `hsl(var(--text-primary))`,
    },
    input: {
      width: '100%',
      height: '40px',
      padding: '8px 12px',
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: `hsl(var(--neutral-200))`,
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: `hsl(var(--text-primary))`,
      transition: 'all 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        borderColor: `hsl(var(--brand-primary))`,
        boxShadow: '0 0 0 2px hsla(var(--brand-primary), 0.1)',
      },
      '&::placeholder': {
        color: `hsl(var(--text-secondary))`,
      },
      '&:disabled': {
        backgroundColor: `hsl(var(--neutral-100))`,
        cursor: 'not-allowed',
      }
    },
    helperText: {
      marginTop: '4px',
      fontSize: '0.75rem',
      color: `hsl(var(--text-secondary))`,
    },
    error: {
      borderColor: `hsl(var(--semantic-error))`,
      '&:focus': {
        boxShadow: '0 0 0 2px hsla(var(--semantic-error), 0.1)',
      }
    },
    errorText: {
      color: `hsl(var(--semantic-error))`,
    }
  },

  // Select Field
  select: {
    marginBottom: '16px',
    select: {
      width: '100%',
      height: '40px',
      padding: '8px 12px',
      paddingRight: '32px',
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: `hsl(var(--neutral-200))`,
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: `hsl(var(--text-primary))`,
      transition: 'all 0.2s ease-in-out',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 8px center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '20px 20px',
      '&:focus': {
        outline: 'none',
        borderColor: `hsl(var(--brand-primary))`,
        boxShadow: '0 0 0 2px hsla(var(--brand-primary), 0.1)',
      }
    }
  }
} 