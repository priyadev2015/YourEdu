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

const StateComplianceFiling = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const { user } = useAuth();
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadType, setUploadType] = useState('');
    const [message, setMessage] = useState({ type: '', content: '' });
    const [documents, setDocuments] = useState([]);
    const [recentSubmissions, setRecentSubmissions] = useState([]);
    const [userData, setUserData] = useState(null);
    const [psaSubmission, setPsaSubmission] = useState(null);
    const [selectedTab, setSelectedTab] = useState('psa');
    const [completionStatus, setCompletionStatus] = useState(null);

    const loadPSAProgress = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('california_psa')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            // Calculate progress based on filled fields
            const requiredFields = [
                'school_name', 'cds_code', 'county', 'district',
                'is_full_time_private', 'physical_street',
                'physical_city', 'physical_state', 'physical_zip', 'phone',
                'primary_email', 'youngest_years', 'youngest_months',
                'oldest_years', 'site_admin_first_name', 'site_admin_last_name',
                'site_admin_title', 'site_admin_phone', 'site_admin_email',
                'statutory_acknowledgment'
            ];

            let progress = 0;
            if (data) {
                let filledFields = 0;
                requiredFields.forEach(field => {
                    if (data[field]) filledFields++;
                });

                // Check enrollment fields
                const enrollmentFields = Object.values(data.enrollment || {}).filter(value => value > 0).length;
                if (enrollmentFields > 0) filledFields++;

                // Check tax status
                const taxStatusSelected = Object.values(data.tax_status || {}).some(value => value === true);
                if (taxStatusSelected) filledFields++;

                progress = Math.round((filledFields / (requiredFields.length + 2)) * 100);
            }

            let status = 'not_started';
            if (progress === 100) {
                status = 'submitted';
            } else if (progress > 0) {
                status = 'started';
            }

            setForms([{
                id: 'psa',
                name: '2024-2025 Private School Affidavit Form - California',
                dueDate: 'Rolling',
                status,
                progress,
                description: 'Annual filing requirement for home-based private schools'
            },
            {
                id: 'withdrawal',
                name: 'Letter of Withdrawal',
                dueDate: 'One-time',
                status: 'optional',
                progress: 0,
                description: 'Required only if withdrawing from public school',
                template: `Subject line: Letter of Withdrawal of student

Dear [insert administrators name]:

Pursuant to California Education Code § 48222, this letter is formally notifying you of my intention to withdraw my child, [insert child's full name], from your school as of [insert withdrawal date] in order to homeschool them. 

Additionally, as the administrator of said homeschool, I am requesting that you provide me with your cumulative records for [insert child's full name].

Should you have any questions, please provide them in writing and I will be happy to provide them to the appropriate agency.

Best,
[Insert parent's full name]`
            },
            {
                id: 'attendance',
                name: 'Record of Attendance',
                dueDate: 'Daily',
                status: 'record_keeping',
                progress: 0,
                description: 'Required to maintain daily attendance records',
                info: 'California requires that homeschools maintain attendance records for each student. These records should track daily attendance and absences.'
            },
            {
                id: 'instructors',
                name: 'Record of Instructor(s)',
                dueDate: 'Maintain Records',
                status: 'record_keeping',
                progress: 0,
                description: 'Required to maintain records of instructors and qualifications',
                template: `John Doe
Name

parent@youredu.school
Email

9195995301
Phone

729 Guerrro St, San Francisco, CA 94110
Address`
            },
            {
                id: 'courses',
                name: 'Courses and Curriculum',
                dueDate: 'Maintain Records',
                status: 'record_keeping',
                progress: 0,
                description: 'Required to maintain records of courses taught',
                info: 'California requires that homeschools generally provide instruction in courses commonly taught in public schools. Additionally, schools must maintain records of what courses each student enrolls in.'
            },
            {
                id: 'immunization',
                name: 'Immunization Records',
                dueDate: 'Maintain Records',
                status: 'record_keeping',
                progress: 0,
                description: 'Required to maintain immunization records or exemptions',
                info: 'California requires that every school, including homeschools, maintain immunization records, or records of exemptions, for all of their students. YourEDU does not currently allow for uploading of student\'s immunization records.'
            }]);

            setCompletionStatus({ percent: progress });
        } catch (error) {
            console.error('Error loading PSA progress:', error);
        }
    };

    useEffect(() => {
        if (user) {
            loadPSAProgress();
            fetchUserData();
            loadSubmissions();
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
            setMessage({ type: 'error', content: 'Failed to load documents' });
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
        if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
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
            
            // Upload file to storage
            const { error: uploadError } = await supabase.storage
                .from('compliance_documents')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('compliance_documents')
                .getPublicUrl(fileName);

            // Save document metadata
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

            // If this is a completed PSA, send email
            if (uploadType === 'completed_psa') {
                await sendPSAEmail(publicUrl);
            }

            setMessage({ type: 'success', content: 'Document uploaded successfully' });
            setUploadOpen(false);
            setSelectedFile(null);
            loadDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            setMessage({ type: 'error', content: 'Failed to upload document' });
        }
    };

    const sendPSAEmail = async (fileUrl) => {
        try {
            const { error } = await supabase.functions.invoke('send-psa-email', {
                body: {
                    userId: user.id,
                    fileUrl: fileUrl,
                    email: user.email
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending PSA email:', error);
            setMessage({ type: 'warning', content: 'Document uploaded but email notification failed' });
        }
    };

    const handleDelete = async (documentId) => {
        try {
            const document = documents.find(d => d.id === documentId);
            
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('compliance_documents')
                .remove([document.file_path]);

            if (storageError) throw storageError;

            // Delete from database
            const { error: dbError } = await supabase
                .from('compliance_documents')
                .delete()
                .eq('id', documentId);

            if (dbError) throw dbError;

            setMessage({ type: 'success', content: 'Document deleted successfully' });
            loadDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            setMessage({ type: 'error', content: 'Failed to delete document' });
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

    const getStatusProgress = (form) => {
        if (form.id === 'psa') {
            if (psaSubmission?.status === 'submitted') return 100;
            return form.progress;
        }
        return 0;
    };

    const handleCopyTemplate = (template) => {
        navigator.clipboard.writeText(template);
        setMessage({
            type: 'success',
            content: 'Template copied to clipboard!'
        });
    };

    const loadSubmissions = async () => {
        try {
            const { data: submissions, error } = await supabase
                .from('psa_submissions')
                .select('*')
                .eq('school_year', '2024-2025')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error loading PSA submission:', error);
                return;
            }
            
            setPsaSubmission(submissions);
        } catch (error) {
            console.error('Error loading PSA submission:', error);
        }
    };

    const renderTabContent = () => {
        const form = forms.find(f => f.id === selectedTab);
        if (!form) return null;

        return (
            <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: '8px 0 0 8px', height: '100%' }}>
                <Box sx={{ mb: 3 }}>
                    <BodyText sx={{ color: 'hsl(var(--muted-foreground))', mb: 3 }}>
                        {form.description}
                    </BodyText>
                </Box>

                {/* Render specific content based on tab */}
                {selectedTab === 'psa' && (
                    <Box>
                        {psaSubmission?.status === 'submitted' ? (
                            <>
                                <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                                    Your PSA has been submitted and is being processed by the California Department of Education. 
                                    This typically takes 2-3 business days. You will receive updates via email.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        disabled
                                        sx={{
                                            backgroundColor: 'hsl(var(--muted))',
                                            color: 'hsl(var(--muted-foreground))',
                                            '&.Mui-disabled': {
                                                backgroundColor: 'hsl(var(--muted))',
                                                color: 'hsl(var(--muted-foreground))',
                                            },
                                        }}
                                    >
                                        Submitted - Processing
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={async () => {
                                            try {
                                                await supabase.from('california_psa').delete().eq('user_id', user.id);
                                                await supabase.from('psa_submissions').delete().eq('user_id', user.id).eq('school_year', '2024-2025');
                                                setPsaSubmission(null);
                                                setCompletionStatus({ percent: 0 });
                                                navigate('/california-psa');
                                            } catch (error) {
                                                console.error('Error clearing PSA data:', error);
                                                setMessage({ type: 'error', content: 'Failed to clear PSA data' });
                                            }
                                        }}
                                        sx={{
                                            backgroundColor: '#2563EB',
                                            color: 'white',
                                            height: 36,
                                            '&:hover': { backgroundColor: '#2563EB', boxShadow: 'none' },
                                            transition: 'none',
                                            boxShadow: 'none',
                                            textTransform: 'none'
                                        }}
                                    >
                                        Submit Another
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <>
                                {completionStatus.percent > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" sx={{ color: '#4a5568' }}>
                                                Filing Progress
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#4a5568' }}>
                                                {completionStatus.percent}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={completionStatus.percent}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#E2E8F0',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: '#2563EB',
                                                    borderRadius: 4,
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/california-psa')}
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
                                    {completionStatus.percent > 0 ? 'Continue Filing' : 'Start Filing'}
                                </Button>
                            </>
                        )}
                    </Box>
                )}

                {selectedTab === 'withdrawal' && (
                    <Box>
                        <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                            If your child currently attends a public school, you are required to formally notify the public school of your intention to homeschool and to request their records for your child. If you're already homeschooling, no need to submit said letter.
                        </Typography>
                        <Box sx={{ 
                            backgroundColor: '#f8fafc',
                            p: 3,
                            borderRadius: 1,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontFamily: 'Arial, sans-serif',
                                    whiteSpace: 'pre-wrap',
                                    mb: 2
                                }}
                            >
                                {form.template}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => handleCopyTemplate(form.template)}
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
                                Copy Template
                            </Button>
                        </Box>
                    </Box>
                )}

                {selectedTab === 'attendance' && (
                    <Box>
                        <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                            {form.info}
                        </Typography>
                        <RecordOfAttendance showHero={false} />
                    </Box>
                )}

                {selectedTab === 'instructors' && (
                    <Box>
                        <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                            California requires that all schools, including homeschools, maintain records of their instructors and their qualifications and credentials. For the purposes of homeschools, you only need a record of one instructor, which can be the parent.
                        </Typography>
                        <Box sx={{ 
                            backgroundColor: '#f8fafc',
                            p: 3,
                            borderRadius: 1,
                            border: '1px solid #e2e8f0',
                            mb: 4
                        }}>
                            <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                    value={userData?.name || '[Auto-populated]'}
                                />
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                    value={user?.email || '[Auto-populated]'}
                                />
                                <TextField
                                    label="Phone"
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                    value={userData?.phone_number || '[Auto-populated]'}
                                />
                                <TextField
                                    label="Address"
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                    value={userData ? `${userData.street_address}, ${userData.city}, ${userData.state} ${userData.zip}` : '[Auto-populated]'}
                                />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                                    The information above is automatically populated from your Account Profile. You can edit this information in your Account Profile settings.
                                </Typography>
                                <Button
                                    variant="contained"
                                    component={Link}
                                    to="/account/profile"
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
                                    Edit Profile Information
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ 
                            backgroundColor: '#f8fafc',
                            p: 3,
                            borderRadius: 1,
                            border: '1px solid #e2e8f0'
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2d3748' }}>
                                Instructor Qualifications Record
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4a5568', mb: 3 }}>
                                California requires homeschools to maintain records of instructor qualifications. While no specific credentials are required, you must keep documentation of the instructor's capability to teach. This can include education history, teaching experience, relevant qualifications, or a general summary of competencies. Upload your qualification record below - this will be kept on file and may be required in case of an audit.
                            </Typography>
                            
                            {documents.some(doc => doc.document_type === 'instructor_qualifications') ? (
                                <Box sx={{ mb: 3 }}>
                                    {documents
                                        .filter(doc => doc.document_type === 'instructor_qualifications')
                                        .map(doc => (
                                            <Box 
                                                key={doc.id}
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    backgroundColor: 'white',
                                                    p: 2,
                                                    borderRadius: 1,
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <ArticleIcon sx={{ color: 'hsl(var(--brand-primary))' }} />
                                                    <Typography>{doc.file_name}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => window.open(doc.file_url, '_blank')}
                                                        sx={{ color: 'hsl(var(--brand-primary))' }}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleDelete(doc.id)}
                                                        sx={{ color: 'hsl(var(--destructive))' }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                                </Box>
                            ) : (
                                <Box sx={{ 
                                    textAlign: 'center',
                                    py: 4,
                                    backgroundColor: 'white',
                                    borderRadius: 1,
                                    border: '1px dashed #e2e8f0',
                                    mb: 3
                                }}>
                                    <Typography sx={{ color: '#718096', mb: 2 }}>
                                        No qualifications document uploaded yet
                                    </Typography>
                                </Box>
                            )}
                            
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
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
                                Upload Qualifications
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        setSelectedFile(e.target.files[0]);
                                        setUploadType('instructor_qualifications');
                                        handleUpload();
                                    }}
                                />
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#718096' }}>
                                Accepted file types: PDF, DOC, DOCX (Max size: 10MB)
                            </Typography>
                        </Box>
                    </Box>
                )}

                {selectedTab === 'courses' && (
                    <Box>
                        <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                            {form.info}
                        </Typography>
                        <Box sx={{ 
                            display: 'flex',
                            gap: 2,
                            mb: 3
                        }}>
                            <Button 
                                variant="contained"
                                component={Link}
                                to="/my-homeschool?tab=transcript"
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
                                View/Edit Transcripts
                            </Button>
                            <Button
                                variant="contained"
                                component={Link}
                                to="/my-homeschool?tab=course-descriptions"
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
                                View/Edit Course Descriptions
                            </Button>
                        </Box>
                    </Box>
                )}

                {selectedTab === 'immunization' && (
                    <Box>
                        <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
                            {form.info}
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    };

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
                <Box sx={{ 
                    display: 'flex', 
                    minHeight: '600px'
                }}>
                    {/* Left Sidebar */}
                    <Box sx={{ 
                        width: '300px',
                        flexShrink: 0,
                        backgroundColor: 'white',
                        borderRadius: '8px 0 0 8px',
                        border: '1px solid hsl(var(--border))',
                        overflow: 'hidden'
                    }}>
                        <Box>
                            <Box sx={{ 
                                p: 2, 
                                borderBottom: '1px solid hsl(var(--border))',
                                backgroundColor: 'hsl(var(--muted))'
                            }}>
                                <Typography sx={{ 
                                    color: '#000000',
                                    fontWeight: 600,
                                    fontSize: '1.125rem'
                                }}>
                                    Required Submissions
                                </Typography>
                            </Box>
                            <List sx={{ px: 2, py: 1.5 }}>
                                {forms.filter(form => ['psa'].includes(form.id)).map((form) => (
                                    <ListItem
                                        key={form.id}
                                        disablePadding
                                    >
                                        <ListItemButton
                                            selected={selectedTab === form.id}
                                            onClick={() => setSelectedTab(form.id)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 0.5,
                                                '&.Mui-selected': {
                                                    backgroundColor: 'hsl(var(--brand-primary-light))',
                                                    '&:hover': {
                                                        backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                                                    }
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                                                        {form.name}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Box>
                            <Box sx={{ 
                                p: 2, 
                                borderBottom: '1px solid hsl(var(--border))',
                                backgroundColor: 'hsl(var(--muted))'
                            }}>
                                <Typography sx={{ 
                                    color: '#000000',
                                    fontWeight: 600,
                                    fontSize: '1.125rem'
                                }}>
                                    Additional Requirements
                                </Typography>
                            </Box>
                            <List sx={{ px: 2, py: 1.5 }}>
                                {forms.filter(form => ['withdrawal', 'attendance', 'instructors', 'courses', 'immunization'].includes(form.id)).map((form) => (
                                    <ListItem
                                        key={form.id}
                                        disablePadding
                                    >
                                        <ListItemButton
                                            selected={selectedTab === form.id}
                                            onClick={() => setSelectedTab(form.id)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 0.5,
                                                '&.Mui-selected': {
                                                    backgroundColor: 'hsl(var(--brand-primary-light))',
                                                    '&:hover': {
                                                        backgroundColor: 'hsla(var(--brand-primary), 0.12)',
                                                    }
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'hsla(var(--brand-primary), 0.04)',
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                                                        {form.name}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Right Content Area */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ 
                            backgroundColor: 'white', 
                            borderRadius: '0 8px 8px 0',
                            border: '1px solid hsl(var(--border))',
                            borderLeft: 'none',
                            height: '100%'
                        }}>
                            <Box sx={{ 
                                p: 2, 
                                borderBottom: '1px solid hsl(var(--border))',
                                backgroundColor: 'hsl(var(--muted))'
                            }}>
                                <Typography sx={{ 
                                    color: '#000000',
                                    fontWeight: 600,
                                    fontSize: '1.125rem'
                                }}>
                                    {forms.find(form => form.id === selectedTab)?.name || 'Content'}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ p: 4 }}>
                                {renderTabContent()}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Snackbar
                    open={Boolean(message.content)}
                    autoHideDuration={6000}
                    onClose={() => setMessage({ type: '', content: '' })}
                >
                    <Alert 
                        onClose={() => setMessage({ type: '', content: '' })} 
                        severity={message.type}
                        sx={{ width: '100%' }}
                    >
                        {message.content}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default StateComplianceFiling; 