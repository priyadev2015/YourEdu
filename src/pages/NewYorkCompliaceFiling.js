import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box,
    Button,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Alert,
    Snackbar,
    TextField,
    ListItemButton,
} from '@mui/material';
import { 
    CloudUpload as CloudUploadIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Article as ArticleIcon,
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import { BodyText } from '../components/ui/typography';
import RecordOfAttendance from './RecordOfAttendance';

const NewYorkComplianceFiling = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState(data);
    const { user } = useAuth();
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadType, setUploadType] = useState('');
    const [message, setMessage] = useState({ type: '', content: '' });
    const [documents, setDocuments] = useState([]);
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [userData, setUserData] = useState(null);
    const [ihipSubmission, setIhipSubmission] = useState(null);
    const [selectedTab, setSelectedTab] = useState('required_submissions');
    const [completionStatus, setCompletionStatus] = useState(null);
    
    const loadIHIPProgress = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('ny_compliance_forms')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            const requiredFields = [
                'parent_name', 'address', 'student_name', 'dob', 'grade_level',
                'courses.english.plan', 'courses.math.plan', 'courses.science.plan',
                'courses.social_studies.plan', 'instructor_name',
                'acknowledgments.quarterly_reports'
            ];

            let progress = 0;
            if (data) {
                let filledFields = 0;
                requiredFields.forEach(field => {
                    const parts = field.split('.');
                    if (parts.length === 3) {
                        if (data[parts[0]]?.[parts[1]]?.[parts[2]]) filledFields++;
                    } else if (data[field]) filledFields++;
                });
                progress = Math.round((filledFields / requiredFields.length) * 100);
            }

            let status = 'not_started';
            if (progress === 100) status = 'submitted';
            else if (progress > 0) status = 'started';

           

            setCompletionStatus({ percent: progress });
        } catch (error) {
            console.error('Error loading IHIP progress:', error);
        }
    };

    useEffect(() => {
        if (user) {
            loadIHIPProgress();
            fetchUserData();
            loadSubmissions();
            loadDocuments();
        }
    }, [user]);

    const loadDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('compliance_documents')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const fetchUserData = async () => {
        try {
            const { data, error } = await supabase
                .from('account_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();
            if (error) throw error;
            setUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 10 * 1024 * 1024) {
            setSelectedFile(file);
        } else {
            setMessage({ type: 'error', content: 'File size must be less than 10MB' });
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadType) return;
        try {
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.id}/${uploadType}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('compliance_documents')
                .upload(fileName, selectedFile);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('compliance_documents')
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase
                .from('compliance_documents')
                .insert([{
                    user_id: user.id,
                    document_type: uploadType,
                    file_name: selectedFile.name,
                    file_path: fileName,
                    file_url: publicUrl,
                    status: 'pending',
                    uploaded_at: new Date().toISOString()
                }]);
            if (dbError) throw dbError;

            setMessage({ type: 'success', content: 'Document uploaded successfully' });
            setUploadOpen(false);
            setSelectedFile(null);
            loadDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            setMessage({ type: 'error', content: 'Failed to upload document' });
        }
    };

    const handleDelete = async (documentId) => {
        try {
            const document = documents.find(d => d.id === documentId);
            const { error: storageError } = await supabase.storage
                .from('compliance_documents')
                .remove([document.file_path]);
            if (storageError) throw storageError;

            const { error: dbError } = await supabase
                .from('compliance_documents')
                .delete()
                .eq('id', documentId);
            if (dbError) throw dbError;

            setMessage({ type: 'success', content: 'Document deleted successfully' });
            loadDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            setMessage({ type: 'error', content: 'Failed to upload document' });
        }
    };

    const getStatusText = (status) => {
        if (status === 'submitted') return 'Submitted';
        if (status === 'optional') return 'Optional';
        if (status === 'record_keeping') return 'Record Keeping';
        if (completionStatus && completionStatus.percent > 0) return 'In Progress';
        return 'Not Started';
    };

    const getStatusColor = (status) => {
        if (status === 'submitted') return 'hsl(var(--success))';
        if (status === 'optional') return 'hsl(var(--warning))';
        if (status === 'record_keeping') return '#4169e1';
        if (completionStatus && completionStatus.percent > 0) return '#4169e1';
        return 'hsl(var(--muted))';
    };

    const handleCopyTemplate = (template) => {
        navigator.clipboard.writeText(template);
        setMessage({ type: 'success', content: 'Template copied to clipboard!' });
    };

    const loadSubmissions = async () => {
        try {
            const { data: submissions, error } = await supabase
                .from('ny_compliance_forms')
                .select('*')
                .eq('user_id', user.id)
                .order('submitted_at', { ascending: false })
                .limit(1)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            setIhipSubmission(submissions);
        } catch (error) {
            console.error('Error loading IHIP submission:', error);
        }
    };

    const renderTabContent = () => {debugger
        const form = forms.find(f => f.id === selectedTab);
        if (!form) return null;

        return (
            <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: '8px 0 0 8px', height: '100%' }}>
            {/* Handle "Required Submissions" separately */}
            {selectedTab === 'required_submissions' && (
                <Box>
                    {/* Optional: Add a description if you decide to include one later */}
                    {form.description && (
                        <Typography variant="h6" sx={{ mb: 2 }}>{form.description}</Typography>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => navigate('/newyork-psa')}
                        sx={{
                            backgroundColor: '#2563EB',
                            color: 'white',
                            height: 36,
                            '&:hover': {
                                backgroundColor: '#2563EB',
                                boxShadow: 'none'
                            },
                            transition: 'none',
                            boxShadow: 'none',
                            textTransform: 'none'
                        }}
                    >
                        {completionStatus?.percent > 0 ? 'Continue Filing' : 'Start Filing'}
                    </Button>
                </Box>
            )}

            {/* Handle other tabs with full content */}
            {selectedTab !== 'required_submissions' && (
                <>
                    <Box sx={{ mb: 3 }}>
                        {form.summary && (
                            <>
                                <Typography variant="h6" sx={{ mb: 1 }}>Summary</Typography>
                                <BodyText sx={{ color: 'hsl(var(--muted-foreground))', mb: 2 }}>
                                    {form.summary}
                                </BodyText>
                            </>
                        )}

                        {form.instructions && (
                            <>
                                <Typography variant="h6" sx={{ mb: 1 }}>Instructions for Parents</Typography>
                                <BodyText sx={{ color: 'hsl(var(--muted-foreground))', mb: 2 }}>
                                    {form.instructions}
                                </BodyText>
                            </>
                        )}

                        {form.template && (
                            <Typography variant="h6" sx={{ mb: 1 }}>Sample Templates / Links</Typography>
                        )}
                    </Box>

                    {selectedTab === 'ihip' && (
                        <Box>
                            {ihipSubmission?.status === 'submitted' ? (
                                <>
                                    <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                                        Your IHIP has been submitted to your superintendent.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button variant="contained" disabled>Submitted</Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate('/new-york-ihip')}
                                            sx={{ backgroundColor: '#2563EB', color: 'white' }}
                                        >
                                            Submit New IHIP
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    {completionStatus?.percent > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={completionStatus.percent}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                            <Typography>{completionStatus.percent}% Complete</Typography>
                                        </Box>
                                    )}
                                   <Button
                                        variant="contained"
                                        onClick={() => window.location.href = 'https://hslda.org/post/new-york-individualized-home-instruction-plan'}
                                        sx={{ backgroundColor: '#2563EB', color: 'white' }}
                                    >
                                        {completionStatus?.percent > 0 ? 'Continue IHIP' : 'Start IHIP'}
                                    </Button>
                                </>
                            )}
                        </Box>
                    )}

                    {selectedTab === 'attendance' && (
                        <Box>
                            <RecordOfAttendance showHero={false} />
                        </Box>
                    )}

                    {selectedTab === 'quarterly_reports' && (
                        <Box>
                            <Button
                                variant="contained"
                                href={form.template}
                                target="_blank"
                                sx={{ backgroundColor: '#2563EB', color: 'white', mr: 2 }}
                            >
                                View Sample Report
                            </Button>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ backgroundColor: '#2563EB', color: 'white' }}
                            >
                                Upload Report
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        setSelectedFile(e.target.files[0]);
                                        setUploadType('quarterly_report');
                                        handleUpload();
                                    }}
                                />
                            </Button>
                            {documents.filter(doc => doc.document_type === 'quarterly_report').map(doc => (
                                <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <ArticleIcon />
                                    <Typography>{doc.file_name}</Typography>
                                    <IconButton href={doc.file_url} target="_blank"><DownloadIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(doc.id)}><DeleteIcon /></IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {selectedTab === 'annual_assessment' && (
                        <Box>
                            <Button
                                variant="contained"
                                href={form.template}
                                target="_blank"
                                sx={{ backgroundColor: '#2563EB', color: 'white', mr: 2 }}
                            >
                                NYSED Assessment Info
                            </Button>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ backgroundColor: '#2563EB', color: 'white' }}
                            >
                                Upload Assessment
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        setSelectedFile(e.target.files[0]);
                                        setUploadType('annual_assessment');
                                        handleUpload();
                                    }}
                                />
                            </Button>
                            {documents.filter(doc => doc.document_type === 'annual_assessment').map(doc => (
                                <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <ArticleIcon />
                                    <Typography>{doc.file_name}</Typography>
                                    <IconButton href={doc.file_url} target="_blank"><DownloadIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(doc.id)}><DeleteIcon /></IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {selectedTab === 'notice_of_intent' && (
                        <Box>
                            <Box sx={{ backgroundColor: '#f8fafc', p: 3, borderRadius: 1 }}>
                                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{form.template}</Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => handleCopyTemplate(form.template)}
                                    sx={{ backgroundColor: '#2563EB', color: 'white' }}
                                >
                                    Copy Template
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {selectedTab === 'immunization' && (
                        <Box>
                            <Button
                                variant="contained"
                                href={form.template}
                                target="_blank"
                                sx={{ backgroundColor: '#2563EB', color: 'white', mr: 2 }}
                            >
                                Exemption Form
                            </Button>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                sx={{ backgroundColor: '#2563EB', color: 'white' }}
                            >
                                Upload Records
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        setSelectedFile(e.target.files[0]);
                                        setUploadType('immunization');
                                        handleUpload();
                                    }}
                                />
                            </Button>
                            {documents.filter(doc => doc.document_type === 'immunization').map(doc => (
                                <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <ArticleIcon />
                                    <Typography>{doc.file_name}</Typography>
                                    <IconButton href={doc.file_url} target="_blank"><DownloadIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(doc.id)}><DeleteIcon /></IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            <Container maxWidth="var(--container-max-width)" sx={{ py: 'var(--spacing-8)' }}>
           
    
                
                <Box sx={{ display: 'flex', minHeight: '600px' }}>
                    <Box sx={{ width: '300px', flexShrink: 0, backgroundColor: 'white', borderRadius: '8px 0 0 8px', border: '1px solid hsl(var(--border))' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
        <Typography sx={{ color: '#000000', fontWeight: 600, fontSize: '1.125rem' }}>Required Submissions</Typography>
    </Box>
    <List sx={{ px: 2, py: 1.5 }}>
        <ListItem disablePadding>
            <ListItemButton
                selected={selectedTab === 'required_submissions'}
                onClick={() => setSelectedTab('required_submissions')}
                sx={{ borderRadius: 1, mb: 0.5 }}
            >
                <ListItemText primary={<Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>2024-2025 Private School Affidavit Form - NewYork</Typography>} />
            </ListItemButton>
        </ListItem>
    </List>
                        
                        <Box sx={{ p: 2, borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                            <Typography sx={{ color: '#000000', fontWeight: 600, fontSize: '1.125rem' }}>Record-Keeping</Typography>
                        </Box>
                        <List sx={{ px: 2, py: 1.5 }}>
                            {forms.filter(f => ['ihip', 'attendance', 'quarterly_reports'].includes(f.id)).map(form => (
                                <ListItem key={form.id} disablePadding>
                                    <ListItemButton
                                        selected={selectedTab === form.id}
                                        onClick={() => setSelectedTab(form.id)}
                                        sx={{ borderRadius: 1, mb: 0.5 }}
                                    >
                                        <ListItemText primary={<Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>{form.name}</Typography>} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ p: 2, borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                            <Typography sx={{ color: '#000000', fontWeight: 600, fontSize: '1.125rem' }}>Testing/Evaluation</Typography>
                        </Box>
                        <List sx={{ px: 2, py: 1.5 }}>
                            {forms.filter(f => ['annual_assessment'].includes(f.id)).map(form => (
                                <ListItem key={form.id} disablePadding>
                                    <ListItemButton
                                        selected={selectedTab === form.id}
                                        onClick={() => setSelectedTab(form.id)}
                                        sx={{ borderRadius: 1, mb: 0.5 }}
                                    >
                                        <ListItemText primary={<Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>{form.name}</Typography>} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ p: 2, borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                            <Typography sx={{ color: '#000000', fontWeight: 600, fontSize: '1.125rem' }}>Other Requirements</Typography>
                        </Box>
                        <List sx={{ px: 2, py: 1.5 }}>
                            {forms.filter(f => ['notice_of_intent', 'immunization'].includes(f.id)).map(form => (
                                <ListItem key={form.id} disablePadding>
                                    <ListItemButton
                                        selected={selectedTab === form.id}
                                        onClick={() => setSelectedTab(form.id)}
                                        sx={{ borderRadius: 1, mb: 0.5 }}
                                    >
                                        <ListItemText primary={<Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>{form.name}</Typography>} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ backgroundColor: 'white', borderRadius: '0 8px 8px 0', border: '1px solid hsl(var(--border))', borderLeft: 'none', height: '100%' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                                <Typography sx={{ color: '#000000', fontWeight: 600, fontSize: '1.125rem' }}>
                                    {forms.find(form => form.id === selectedTab)?.name || 'Content'}
                                </Typography>
                            </Box>
                            {renderTabContent()}
                        </Box>
                    </Box>
                </Box>

                <Snackbar open={Boolean(message.content)} autoHideDuration={6000} onClose={() => setMessage({ type: '', content: '' })}>
                    <Alert onClose={() => setMessage({ type: '', content: '' })} severity={message.type} sx={{ width: '100%' }}>
                        {message.content}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default NewYorkComplianceFiling;

const data =  [
    {
        id: 'required_submissions',
        name: 'Required Submissions',
      description:"Annual filing requirement for home-based private schools",
        status : "",
        progress : 0,
       
      
    },
    // Record-Keeping Section
    {
        id: 'ihip',
        name: 'Individualized Home Instruction Plan (IHIP)',
        dueDate: 'August 1',
        status : "",
        progress : 0,
        summary: 'New York requires homeschooling parents to maintain an Individualized Home Instruction Plan (IHIP) for each child, including course plans, materials, quarterly report dates, and instructor information.',
        instructions: 'Submit your IHIP to your local school superintendent by August 1 each year. Keep a copy for your records as it may be requested during audits.',
        template: '/new-york-ihip' // Internal link to IHIP form
    },
    {
        id: 'attendance',
        name: 'Record of Attendance',
        dueDate: 'Daily',
        status: 'record_keeping',
        progress: 0,
        summary: 'Parents must maintain daily attendance records showing at least 180 days of instruction (900 hours for grades 1-6, 990 hours for grades 7-12).',
        instructions: 'Track daily attendance using our module below. Keep these records on file; they don’t need to be submitted unless requested.',
        template: '/record-of-attendance' // Reference to separate module
    },
    {
        id: 'quarterly_reports',
        name: 'Quarterly Reports',
        dueDate: 'Quarterly',
        status: 'record_keeping',
        progress: 0,
        summary: 'Quarterly reports must document hours of instruction, material covered, and student progress for each subject in the IHIP.',
        instructions: 'Submit four quarterly reports to your superintendent on dates specified in your IHIP. Keep copies for your records.',
        template: 'https://www.nysed.gov/nonpublic-schools/home-instruction'
    },

    // Testing/Evaluation Section
    {
        id: 'annual_assessment',
        name: 'Annual Assessment',
        dueDate: 'July 1',
        status: 'record_keeping',
        progress: 0,
        summary: 'An annual assessment is required each year, either through standardized testing (grades 4-12) or a written narrative evaluation by a certified teacher (all grades).',
        instructions: 'For grades 4-8, test every other year; for grades 9-12, test annually. Submit results or narrative to the superintendent by July 1. Acceptable tests include CAT, Iowa Test, or Stanford Achievement Test.',
        template: 'https://www.nysed.gov/state-assessment/new-york-state-alternate-assessment'
    },

    // Other Requirements Section
    {
        id: 'notice_of_intent',
        name: 'Notice of Intent',
        dueDate: 'July 1',
        status: 'optional',
        progress: 0,
        summary: 'Parents must notify their local superintendent of their intent to homeschool by July 1 each year (or within 14 days of starting mid-year).',
        instructions: 'Submit a simple letter to your superintendent stating your intent to homeschool. Keep a copy for your records.',
        template: `Dear [Superintendent Name],

I am writing to notify you of my intent to provide home instruction for my child, [Child's Name], for the [School Year] school year, pursuant to Section 100.10 of the Regulations of the Commissioner of Education.

Sincerely,
[Parent Name]
[Address]
[Date]`
    },
    {
        id: 'immunization',
        name: 'Immunization Records/Exemption',
        dueDate: 'Maintain Records',
        status: 'record_keeping',
        progress: 0,
        summary: 'Parents must maintain immunization records or a religious/medical exemption if not vaccinating.',
        instructions: 'Keep these records on file; they don’t need to be submitted unless requested. For exemptions, submit a written statement to the superintendent.',
        template: 'https://www.health.ny.gov/forms/doh-2168.pdf' // NY DOH exemption form
    }
];
