import { Button as MuiButton } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledButton = styled(MuiButton)(({ theme, variant = 'contained' }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
  // Add custom styles here
}))

export const Button = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>
}
