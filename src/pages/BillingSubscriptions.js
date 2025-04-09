import React, { useState } from 'react';
import {
    Box,
    Container,
    Card,
    Grid,
    Typography,
    Button,
    Divider,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import {
    CreditCard as CreditCardIcon,
    Receipt as ReceiptIcon,
    History as HistoryIcon,
    CheckCircle as CheckCircleIcon,
    Edit as EditIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { SectionHeader, DescriptiveText, BodyText } from '../components/ui/typography';
import { cardStyles } from '../styles/theme/components/cards';

const BillingSubscriptions = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [currentPlan] = useState({
        name: 'Premium Plan',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99, // ~$25/month, saving ~17%
        status: 'active',
        nextBilling: '2024-05-01',
        features: {
            free: [
                'Up to 2 Students',
                'Basic Progress Tracking',
                'Standard Support',
                'Core Curriculum Access',
                'Basic Reports',
                'Community Access',
            ],
            premium: [
                'Unlimited Students',
                'Advanced Progress Analytics',
                'Priority 24/7 Support',
                'Full Curriculum Library',
                'Custom Curriculum Builder',
                'Advanced Reports & Insights',
                'Resource Library Access',
                'Personalized Learning Paths',
                'Compliance Tracking',
                'Priority Feature Updates',
            ]
        }
    });

    const handleBillingCycleChange = (event, newCycle) => {
        if (newCycle !== null) {
            setBillingCycle(newCycle);
        }
    };

    const [paymentMethod] = useState({
        type: 'Visa',
        last4: '4242',
        expiry: '12/25'
    });

    const [billingHistory] = useState([
        {
            date: '2024-04-01',
            amount: '$29.99',
            status: 'Paid',
            invoice: '#INV-2024-001'
        },
        {
            date: '2024-03-01',
            amount: '$29.99',
            status: 'Paid',
            invoice: '#INV-2024-002'
        },
        {
            date: '2024-02-01',
            amount: '$29.99',
            status: 'Paid',
            invoice: '#INV-2024-003'
        }
    ]);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            {/* Hero Section */}
            <Box sx={{ ...cardStyles.hero, pt: 'var(--spacing-8)', pb: 'var(--spacing-6)' }}>
                <Container 
                    maxWidth="var(--container-max-width)"
                    sx={{ 
                        position: 'relative',
                        px: 'var(--container-padding-x)',
                        py: 'var(--container-padding-y)',
                        '@media (--tablet)': {
                            px: 'var(--container-padding-x-mobile)',
                        },
                    }}
                >
                    <DescriptiveText sx={{ maxWidth: 'var(--text-max-width)' }}>
                        Manage your subscription, payment methods, and billing history.
                    </DescriptiveText>
                </Container>
            </Box>

            {/* Main Content */}
            <Container 
                maxWidth="var(--container-max-width)"
                sx={{ 
                    px: 'var(--container-padding-x)',
                    py: 'var(--spacing-6)',
                    '@media (--tablet)': {
                        px: 'var(--container-padding-x-mobile)',
                    },
                }}
            >
                <Grid container spacing={3}>
                    {/* Current Plan */}
                    <Grid item xs={12} md={8}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ReceiptIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                                <SectionHeader>Current Plan</SectionHeader>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {currentPlan.name}
                                        <Chip 
                                            label="Active"
                                            size="small"
                                            icon={<CheckCircleIcon />}
                                            sx={{ 
                                                ml: 2,
                                                backgroundColor: 'hsl(var(--success))',
                                                color: 'white',
                                                '& .MuiChip-icon': { color: 'white' }
                                            }}
                                        />
                                    </Typography>
                                    <Typography variant="h4" sx={{ mb: 1, color: 'hsl(var(--brand-primary))' }}>
                                        ${billingCycle === 'monthly' ? 
                                            `${currentPlan.monthlyPrice}/month` : 
                                            `${currentPlan.yearlyPrice}/year`
                                        }
                                        {billingCycle === 'yearly' && (
                                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ml: 2 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    (${(currentPlan.yearlyPrice / 12).toFixed(2)}/mo)
                                                </Typography>
                                                <Chip 
                                                    label="Save ~17%" 
                                                    size="small" 
                                                    sx={{ 
                                                        backgroundColor: 'hsl(var(--success) / 0.1)',
                                                        color: 'hsl(var(--success))',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Next billing date: {currentPlan.nextBilling}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                                    <ToggleButtonGroup
                                        value={billingCycle}
                                        exclusive
                                        onChange={handleBillingCycleChange}
                                        size="small"
                                        sx={{
                                            mb: 2,
                                            '& .MuiToggleButton-root': {
                                                textTransform: 'none',
                                                px: 2,
                                                '&.Mui-selected': {
                                                    backgroundColor: 'hsl(var(--brand-primary))',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'hsl(var(--brand-primary-dark))',
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        <ToggleButton value="monthly">Monthly</ToggleButton>
                                        <ToggleButton value="yearly">Yearly</ToggleButton>
                                    </ToggleButtonGroup>
                                    <Button variant="outlined" color="primary">
                                        Change Plan
                                    </Button>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Grid container spacing={4}>
                                {/* Free Plan Features */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>Free Plan Includes</Typography>
                                    {currentPlan.features.free.map((feature, index) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }} key={index}>
                                            <CheckCircleIcon sx={{ color: 'hsl(var(--text-secondary))', fontSize: '1.25rem' }} />
                                            <BodyText sx={{ color: 'hsl(var(--text-secondary))' }}>{feature}</BodyText>
                                        </Box>
                                    ))}
                                </Grid>

                                {/* Premium Plan Features */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, color: 'hsl(var(--brand-primary))' }}>Premium Plan Includes</Typography>
                                    {currentPlan.features.premium.map((feature, index) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }} key={index}>
                                            <CheckCircleIcon sx={{ color: 'hsl(var(--brand-primary))', fontSize: '1.25rem' }} />
                                            <BodyText>{feature}</BodyText>
                                        </Box>
                                    ))}
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>

                    {/* Payment Method */}
                    <Grid item xs={12} md={4}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CreditCardIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                                <SectionHeader>Payment Method</SectionHeader>
                            </Box>

                            <Box sx={{ 
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 'var(--radius)',
                                mb: 2
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1">{paymentMethod.type} •••• {paymentMethod.last4}</Typography>
                                    <IconButton size="small">
                                        <EditIcon />
                                    </IconButton>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Expires {paymentMethod.expiry}
                                </Typography>
                            </Box>

                            <Button variant="outlined" color="primary" fullWidth>
                                Add Payment Method
                            </Button>
                        </Card>
                    </Grid>

                    {/* Billing History */}
                    <Grid item xs={12}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <HistoryIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                                <SectionHeader>Billing History</SectionHeader>
                            </Box>

                            <List>
                                {billingHistory.map((bill, index) => (
                                    <React.Fragment key={bill.invoice}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1">{bill.invoice}</Typography>
                                                        <Chip 
                                                            label={bill.status}
                                                            size="small"
                                                            sx={{ 
                                                                ml: 2,
                                                                backgroundColor: 'hsl(var(--success) / 0.1)',
                                                                color: 'hsl(var(--success))',
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={bill.date}
                                            />
                                            <ListItemSecondaryAction>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography>{bill.amount}</Typography>
                                                    <IconButton size="small">
                                                        <DownloadIcon />
                                                    </IconButton>
                                                </Box>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < billingHistory.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default BillingSubscriptions; 
