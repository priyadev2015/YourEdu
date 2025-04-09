import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Box,
    List,
    ListItem,
    ListItemText,
    Link as MuiLink,
} from '@mui/material';
import { BodyText, SupportingText, SectionHeader } from '../components/ui/typography';

const StateFundingOpportunities = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This will be replaced with actual API call to fetch state funding opportunities
        setLoading(true);
        setOpportunities([]);
        setLoading(false);
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            <Container 
                maxWidth="var(--container-max-width)"
                sx={{ 
                    py: 'var(--spacing-8)',
                    px: 'var(--container-padding-x)',
                    '@media (max-width: 768px)': {
                        px: 'var(--container-padding-x-mobile)',
                    },
                }}
            >
                <Box 
                    component="section"
                    sx={{ 
                        p: 'var(--spacing-4)', 
                        backgroundColor: 'hsl(var(--muted))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius-lg)'
                    }}
                >
                    {loading ? (
                        <SupportingText>Loading funding opportunities...</SupportingText>
                    ) : opportunities.length > 0 ? (
                        <>
                            <BodyText sx={{ mb: 'var(--spacing-4)' }}>
                                Below are the current funding opportunities available for homeschooling families:
                            </BodyText>
                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                                {opportunities.map((opportunity, index) => (
                                    <ListItem 
                                        key={index} 
                                        sx={{ 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            p: 'var(--spacing-4)',
                                            backgroundColor: 'hsl(var(--background))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <SectionHeader sx={{ fontSize: '1.1rem', mb: 'var(--spacing-2)' }}>
                                                    {opportunity.title}
                                                </SectionHeader>
                                            }
                                            secondary={
                                                <>
                                                    <BodyText sx={{ mb: 'var(--spacing-2)' }}>
                                                        {opportunity.description}
                                                    </BodyText>
                                                    {opportunity.link && (
                                                        <MuiLink 
                                                            href={opportunity.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            sx={{ 
                                                                color: 'hsl(var(--brand-primary))',
                                                                '&:hover': {
                                                                    color: 'hsl(var(--brand-primary-dark))'
                                                                }
                                                            }}
                                                        >
                                                            Learn More
                                                        </MuiLink>
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    ) : (
                        <BodyText>
                            There are currently no direct state funding opportunities for homeschooling available.
                        </BodyText>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default StateFundingOpportunities; 