import React, { useState } from 'react';
import { 
    Container, 
    Box, 
    TextField,
    Button,
    Grid,
    Paper,
    Chip,
    InputAdornment,
} from '@mui/material';
import {
    Search as SearchIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { PageHeader, SectionHeader, FeatureHeader, DescriptiveText, BodyText, SupportingText } from '../components/ui/typography';
import { cardStyles } from '../styles/theme/components/cards';

const Extracurriculars = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        locations: true,
        ageGroups: true
    });

    // Mock data for extracurricular activities
    const mockActivities = [
        {
            id: 1,
            name: 'Youth Soccer League',
            category: 'Sports',
            location: 'San Francisco',
            ageRange: '8-12 years',
            schedule: 'Tuesdays and Thursdays, 4:00 PM - 5:30 PM',
            description: 'Recreational soccer league focused on skill development and teamwork.',
            participantCount: 24,
            price: '$150/season',
            provider: 'SF Youth Sports',
            type: 'In Person'
        },
        {
            id: 2,
            name: 'Digital Art Workshop',
            category: 'Arts',
            location: 'Online',
            ageRange: '13-17 years',
            schedule: 'Mondays, 3:00 PM - 4:30 PM',
            description: 'Learn digital art techniques using professional software.',
            participantCount: 15,
            price: '$75/month',
            provider: 'Creative Arts Academy',
            type: 'Online'
        },
        {
            id: 3,
            name: 'Science Club',
            category: 'STEM',
            location: 'San Jose',
            ageRange: '10-14 years',
            schedule: 'Wednesdays, 2:00 PM - 4:00 PM',
            description: 'Hands-on science experiments and projects.',
            participantCount: 18,
            price: '$200/semester',
            provider: 'Bay Area Science Institute',
            type: 'Hybrid'
        }
    ];

    const categories = [
        { name: 'Sports', examples: ['Soccer', 'Basketball', 'Swimming', 'Tennis'] },
        { name: 'Arts', examples: ['Music', 'Dance', 'Visual Arts', 'Theater'] },
        { name: 'STEM', examples: ['Robotics', 'Coding', 'Science Club', 'Math Club'] },
        { name: 'Community Service', examples: ['Volunteering', 'Environmental', 'Social Work'] },
        { name: 'Academic Clubs', examples: ['Debate', 'Model UN', 'Chess Club'] },
        { name: 'Leadership', examples: ['Student Government', 'Youth Leadership'] }
    ];

    const locations = ['San Francisco', 'San Jose', 'Oakland', 'Berkeley', 'Online', 'Hybrid'];
    const ageGroups = ['5-7 years', '8-10 years', '11-13 years', '14-16 years', '17-18 years'];

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setShowSearchResults(query.length > 0);
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            {/* Hero Section */}
            <Box sx={cardStyles.section}>
                <Container 
                    maxWidth="var(--container-max-width)"
                    sx={{ 
                        position: 'relative',
                        px: 'var(--container-padding-x)',
                        py: 'var(--container-padding-y)',
                        '@media (max-width: 768px)': {
                            px: 'var(--container-padding-x-mobile)',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box>
                            <PageHeader>Extracurricular Activities</PageHeader>
                            <DescriptiveText sx={{ maxWidth: 'var(--text-max-width)' }}>
                                Discover and explore a wide range of extracurricular activities to enrich your educational journey.
                                From sports to arts, find opportunities that match your interests and goals.
                            </DescriptiveText>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Container 
                maxWidth="var(--container-max-width)"
                sx={{ 
                    px: 'var(--container-padding-x)',
                    py: 'var(--spacing-6)',
                    '@media (max-width: 768px)': {
                        px: 'var(--container-padding-x-mobile)',
                    },
                }}
            >
                {/* Search Bar */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius-lg)',
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Search activities, locations, or providers..."
                        value={searchQuery}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'hsl(var(--muted-foreground))' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'hsl(var(--border))',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'hsl(var(--brand-primary))',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'hsl(var(--brand-primary))',
                                },
                            },
                        }}
                    />
                </Paper>

                {/* Main Content */}
                {showSearchResults ? (
                    <Grid container spacing={3}>
                        {mockActivities.map((activity) => (
                            <Grid item xs={12} md={6} lg={4} key={activity.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <FeatureHeader sx={{ mb: 2 }}>{activity.name}</FeatureHeader>

                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                        <Chip
                                            icon={<LocationIcon sx={{ fontSize: '1rem' }} />}
                                            label={activity.location}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'hsl(var(--accent))',
                                                color: 'hsl(var(--accent-foreground))',
                                            }}
                                        />
                                        <Chip
                                            label={activity.category}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'hsl(var(--accent))',
                                                color: 'hsl(var(--accent-foreground))',
                                            }}
                                        />
                                        <Chip
                                            icon={<TimeIcon sx={{ fontSize: '1rem' }} />}
                                            label={activity.type}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'hsl(var(--accent))',
                                                color: 'hsl(var(--accent-foreground))',
                                            }}
                                        />
                                    </Box>

                                    <BodyText sx={{ mb: 2, flexGrow: 1 }}>
                                        {activity.description}
                                    </BodyText>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <SupportingText>
                                            <strong>Schedule:</strong> {activity.schedule}
                                        </SupportingText>
                                        <SupportingText>
                                            <strong>Age Range:</strong> {activity.ageRange}
                                        </SupportingText>
                                        <SupportingText>
                                            <strong>Price:</strong> {activity.price}
                                        </SupportingText>
                                        <SupportingText>
                                            <strong>Provider:</strong> {activity.provider}
                                        </SupportingText>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                flex: 1,
                                                borderColor: 'hsl(var(--border))',
                                                color: 'hsl(var(--muted-foreground))',
                                                '&:hover': {
                                                    backgroundColor: 'hsl(var(--accent))',
                                                    borderColor: 'hsl(var(--border))',
                                                },
                                            }}
                                        >
                                            Plan
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                flex: 1,
                                                backgroundColor: 'hsl(var(--brand-primary))',
                                                color: 'hsl(var(--brand-primary-foreground))',
                                                '&:hover': {
                                                    backgroundColor: 'hsl(var(--brand-primary-dark))',
                                                },
                                            }}
                                        >
                                            Register
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Categories Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                            }}
                        >
                            <Button
                                onClick={() =>
                                    setExpandedSections({
                                        ...expandedSections,
                                        categories: !expandedSections.categories,
                                    })
                                }
                                sx={{
                                    width: '100%',
                                    p: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: 'hsl(var(--foreground))',
                                    textTransform: 'none',
                                }}
                            >
                                <SectionHeader>By Category</SectionHeader>
                                <span>{expandedSections.categories ? '−' : '+'}</span>
                            </Button>

                            {expandedSections.categories && (
                                <Grid container spacing={2} sx={{ p: 3 }}>
                                    {categories.map((category) => (
                                        <Grid item xs={12} sm={6} md={4} key={category.name}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    backgroundColor: 'hsl(var(--muted))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: 'var(--radius)',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'hsl(var(--accent))',
                                                    },
                                                }}
                                                onClick={() => {
                                                    setSearchQuery(category.name)
                                                    setShowSearchResults(true)
                                                }}
                                            >
                                                <FeatureHeader sx={{ mb: 1 }}>{category.name}</FeatureHeader>
                                                <SupportingText>{category.examples.join(', ')}</SupportingText>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Paper>

                        {/* Locations Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                            }}
                        >
                            <Button
                                onClick={() =>
                                    setExpandedSections({
                                        ...expandedSections,
                                        locations: !expandedSections.locations,
                                    })
                                }
                                sx={{
                                    width: '100%',
                                    p: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: 'hsl(var(--foreground))',
                                    textTransform: 'none',
                                }}
                            >
                                <SectionHeader>By Location</SectionHeader>
                                <span>{expandedSections.locations ? '−' : '+'}</span>
                            </Button>

                            {expandedSections.locations && (
                                <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {locations.map((location) => (
                                        <Chip
                                            key={location}
                                            label={location}
                                            onClick={() => {
                                                setSearchQuery(location)
                                                setShowSearchResults(true)
                                            }}
                                            sx={{
                                                backgroundColor: 'hsl(var(--accent))',
                                                color: 'hsl(var(--accent-foreground))',
                                                '&:hover': {
                                                    backgroundColor: 'hsl(var(--accent-dark))',
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Paper>

                        {/* Age Groups Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                            }}
                        >
                            <Button
                                onClick={() =>
                                    setExpandedSections({
                                        ...expandedSections,
                                        ageGroups: !expandedSections.ageGroups,
                                    })
                                }
                                sx={{
                                    width: '100%',
                                    p: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: 'hsl(var(--foreground))',
                                    textTransform: 'none',
                                }}
                            >
                                <SectionHeader>By Age Group</SectionHeader>
                                <span>{expandedSections.ageGroups ? '−' : '+'}</span>
                            </Button>

                            {expandedSections.ageGroups && (
                                <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {ageGroups.map((age) => (
                                        <Chip
                                            key={age}
                                            label={age}
                                            onClick={() => {
                                                setSearchQuery(age)
                                                setShowSearchResults(true)
                                            }}
                                            sx={{
                                                backgroundColor: 'hsl(var(--accent))',
                                                color: 'hsl(var(--accent-foreground))',
                                                '&:hover': {
                                                    backgroundColor: 'hsl(var(--accent-dark))',
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default Extracurriculars;
