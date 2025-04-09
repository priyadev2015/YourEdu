import { cn } from '../../lib/utils'
import { textStyles } from '../../styles/theme/typography'

export const PageHeader = ({ children, className, ...props }) => (
  <div 
    style={{
      paddingTop: 0,
      paddingBottom: 'var(--spacing-4)',
      borderBottom: '1px solid hsl(var(--border-light))',
      marginTop: '-12px',
      marginBottom: 'var(--spacing-6)',
    }}
  >
    <h1 
      className={cn(className)} 
      style={{
        ...textStyles.pageHeader,
        margin: 0,
      }} 
      {...props}
    >
      {children}
    </h1>
  </div>
)

export const SectionHeader = ({ children, className, ...props }) => (
  <h2 className={cn('text-section-header font-bold text-foreground mb-6', className)} {...props}>
    {children}
  </h2>
)

export const FeatureHeader = ({ children, className, ...props }) => (
  <h3 className={cn('text-feature-header font-semibold text-foreground mb-3', className)} {...props}>
    {children}
  </h3>
)

export const DescriptiveText = ({ children, className, ...props }) => (
  <p className={cn('text-descriptive text-foreground mb-8', className)} {...props}>
    {children}
  </p>
)

export const BodyText = ({ children, className, ...props }) => (
  <p className={cn('text-body text-foreground', className)} {...props}>
    {children}
  </p>
)

export const SupportingText = ({ children, className, ...props }) => (
  <p className={cn('text-supporting text-muted-foreground', className)} {...props}>
    {children}
  </p>
)
