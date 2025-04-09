import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    TextField,
    Button,
    Card,
    CardContent,
    Chip,
    InputAdornment,
} from '@mui/material';
import {
    Search as SearchIcon,
    School as SchoolIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';

const communityColleges = [
    {
        name: "Los Angeles City College (LACC)",
        type: "Community College",
        location: "Los Angeles",
        zipCode: "90029",
        description: "Comprehensive public community college offering academic and vocational programs.",
        website: "https://www.lacitycollege.edu",
        featured: true
    },
    {
        name: "Glendale Community College",
        type: "Community College",
        location: "Glendale",
        zipCode: "91208",
        description: "Known for strong transfer programs and career technical education.",
        website: "https://www.glendale.edu",
        featured: true
    },
    {
        name: "Los Angeles Southwest College",
        type: "Community College",
        location: "Los Angeles",
        zipCode: "90047",
        description: "Emphasizes academic excellence and career technical education.",
        website: "https://www.lasc.edu",
        featured: true
    },
    {
        name: "Los Angeles Trade Technical College",
        type: "Community College",
        location: "Los Angeles",
        zipCode: "90015",
        description: "Specializes in career technical education and academic programs.",
        website: "https://www.lattc.edu",
        featured: true
    },
    {
        name: "ASU Online",
        type: "Online University",
        location: "Online",
        description: "Comprehensive online degree programs from Arizona State University.",
        website: "https://asuonline.asu.edu",
        featured: true
    }
];

const LACourseSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [filteredColleges, setFilteredColleges] = useState(communityColleges);

    const handleSearch = () => {
        const filtered = communityColleges.filter(college => {
            const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                college.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (!zipCode) return matchesSearch;
            
            // Simple distance check based on zip code first two digits
            const collegeZip = college.zipCode || '00000';
            return matchesSearch && collegeZip.substring(0, 2) === zipCode.substring(0, 2);
        });
        
        setFilteredColleges(filtered);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 2, pl: 2 }}>
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: '#2B6CB0',
                    color: 'white'
                }}
            >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    LA Area Course Search
                </Typography>
                <Typography variant="body1">
                    Find local community colleges and online learning opportunities in the Greater Los Angeles area.
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by college name or program..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter ZIP code..."
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        height: '100%',
                                        backgroundColor: '#2B6CB0',
                                        '&:hover': {
                                            backgroundColor: '#2C5282'
                                        }
                                    }}
                                >
                                    Search
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2D3748', fontWeight: 600 }}>
                        Featured Institutions
                    </Typography>
                    <Grid container spacing={3}>
                        {filteredColleges.map((college, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card 
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <SchoolIcon sx={{ color: '#2B6CB0', mr: 1 }} />
                                            <Typography variant="h6" sx={{ color: '#2D3748' }}>
                                                {college.name}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {college.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <Chip 
                                                label={college.type}
                                                size="small"
                                                sx={{ backgroundColor: '#EBF8FF', color: '#2B6CB0' }}
                                            />
                                            {college.location && (
                                                <Chip 
                                                    icon={<LocationIcon sx={{ fontSize: '16px' }} />}
                                                    label={college.location}
                                                    size="small"
                                                    sx={{ backgroundColor: '#EBF8FF', color: '#2B6CB0' }}
                                                />
                                            )}
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            href={college.website}
                                            target="_blank"
                                            sx={{ 
                                                color: '#2B6CB0',
                                                borderColor: '#2B6CB0',
                                                '&:hover': {
                                                    borderColor: '#2C5282',
                                                    backgroundColor: '#EBF8FF'
                                                }
                                            }}
                                        >
                                            Visit Website
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default LACourseSearch; 