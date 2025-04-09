import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Paper } from '@mui/material';
import { PageHeader, DescriptiveText } from '../components/ui/typography';
import QandASection from '../components/community/QandASection';
import { cardStyles } from '../styles/theme/components/cards';

const Community = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <PageHeader>Community</PageHeader>
            <DescriptiveText sx={{ mb: 4 }}>
                Connect with other students, share knowledge, and get help with your courses.
            </DescriptiveText>

            <Paper sx={{ ...cardStyles.default, mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        <Tab label="Q&A" />
                        <Tab label="Posts" />
                        <Tab label="Drafts" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    {currentTab === 0 && <QandASection view="questions" />}
                    {currentTab === 1 && <QandASection view="posts" />}
                    {currentTab === 2 && <QandASection view="drafts" />}
                </Box>
            </Paper>
        </Container>
    );
};

export default Community; 