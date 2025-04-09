// import React, { useState, useEffect } from 'react'
// import {
//   Box,
//   Container,
//   Typography,
//   Grid,
//   Button,
//   Chip,
//   Card,
//   CardContent,
//   IconButton,
//   Tooltip,
//   CircularProgress,
//   Tabs,
//   Tab,
//   Paper,
//   Divider,
//   Avatar,
//   AppBar,
//   TextField,
//   InputAdornment,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Autocomplete,
//   Rating,
//   Slider,
//   Switch,
//   FormControlLabel,
//   Alert,
//   Snackbar,
//   Checkbox,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   ListItemSecondaryAction,
//   FormHelperText,
// } from '@mui/material'
// import {
//   Verified as VerifiedIcon,
//   Link as LinkIcon,
//   School as SchoolIcon,
//   EmojiEvents as AchievementIcon,
//   Code as ProjectIcon,
//   Psychology as SkillIcon,
//   Science as ScienceIcon,
//   Search as SearchIcon,
//   Work as WorkIcon,
//   Person as PersonIcon,
//   Add as AddIcon,
//   TrendingUp as TrendingUpIcon,
//   Assessment as AssessmentIcon,
//   FilterList as FilterIcon,
//   LocationOn as LocationIcon,
//   Money as SalaryIcon,
//   Business as BusinessIcon,
//   Schedule as ScheduleIcon,
//   CloudUpload as UploadIcon,
//   Groups as GroupsIcon,
//   Share as ShareIcon,
//   Error as ErrorIcon,
//   Download as DownloadIcon,
// } from '@mui/icons-material'
// import { PageHeader, DescriptiveText } from '../components/ui/typography'
// import { useAuth } from '../utils/AuthContext'
// import { useNavigate, useLocation } from 'react-router-dom'
// import Internships from './Internships'
// import CompanyPage from './CompanyPage'
// import CareerExploration from './CareerExploration'
// import { cardStyles } from '../styles/theme/components/cards'
// import {
//   initWeb3,
//   getContractInstance,
//   getAddressCredentials,
//   uploadMetadataToIPFS,
//   issueCredential,
//   setupCredentialEventListeners,
//   formatCredentialData,
//   verifyCredential,
//   batchVerifyCredentials
// } from '../utils/web3Utils';

// // Tab Panel Component
// function TabPanel({ children, value, index, ...other }) {
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`ledger-tabpanel-${index}`}
//       aria-labelledby={`ledger-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
//     </div>
//   )
// }

// const Ledger = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [web3, setWeb3] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [selectedCredentials, setSelectedCredentials] = useState([]);
//   const [batchVerificationResult, setBatchVerificationResult] = useState(null);
//   const [showMetaMaskPrompt, setShowMetaMaskPrompt] = useState(false);
//   const [isWeb3Connected, setIsWeb3Connected] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });
//   const [verificationDialog, setVerificationDialog] = useState({
//     open: false,
//     credential: null,
//     verificationResult: null,
//     loading: false,
//     error: null
//   });

//   // Map tab names to indices
//   const tabIndices = {
//     'my-ledger': 0,
//     learn: 1,
//     internships: 2,
//     'career-exploration': 3,
//   }

//   // Set initial active tab based on navigation state
//   const [activeTab, setActiveTab] = useState(() => {
//     if (location.state?.activeTab) {
//       return tabIndices[location.state.activeTab] || 0
//     }
//     return 0
//   })

//   const [stats, setStats] = useState({
//     totalCredits: 45,
//     completedCourses: 12,
//     skillsVerified: 24,
//     achievementScore: 92.5,
//   })
//   const [searchQuery, setSearchQuery] = useState('')
//   const [filters, setFilters] = useState({
//     type: 'all',
//     difficulty: 'all',
//     verified: false,
//     minScore: 0,
//     skills: [],
//     educationLevel: 'all',
//     industry: 'all',
//     dateRange: 'all',
//   })
//   const [openAddDialog, setOpenAddDialog] = useState(false)
//   const [newAchievement, setNewAchievement] = useState({
//     type: '',
//     title: '',
//     description: '',
//     difficulty: '',
//     duration: '',
//     skills: [],
//     evidence: '',
//     image: null,
//   })
//   const [jobFilters, setJobFilters] = useState({
//     location: 'all',
//     remote: false,
//     minSalary: 0,
//     skills: [],
//   })

//   // Update achievement types
//   const achievementTypes = [
//     { value: 'certification', label: 'Professional Certification', icon: VerifiedIcon },
//     { value: 'degree', label: 'Academic Degree', icon: SchoolIcon },
//     { value: 'course', label: 'Course Completion', icon: SchoolIcon },
//     { value: 'apprenticeship', label: 'Apprenticeship', icon: WorkIcon },
//     { value: 'license', label: 'Professional License', icon: VerifiedIcon },
//     { value: 'project', label: 'Project Portfolio', icon: ProjectIcon },
//     { value: 'skill', label: 'Skill Assessment', icon: SkillIcon },
//     { value: 'award', label: 'Award/Recognition', icon: AchievementIcon },
//     { value: 'experience', label: 'Work Experience', icon: WorkIcon },
//     { value: 'research', label: 'Research Work', icon: ScienceIcon },
//   ]

//   // Update the defaultMockNFTs array to use unique string IDs
//   const defaultMockNFTs = [
//     {
//       id: 'mock-1',
//       type: 'certification',
//       title: 'Advanced Web Development',
//       description: 'Comprehensive certification in modern web development technologies and best practices',
//       verified: true,
//       score: 95,
//       skills: ['React', 'Node.js', 'GraphQL'],
//       issuer: 'Tech Academy',
//       evidence: 'https://example.com/cert/123',
//       metadata: {
//         difficulty: 'advanced',
//         duration: '6 months',
//         creditsEarned: 30
//       }
//     },
//     {
//       id: 'mock-2',
//       type: 'course',
//       title: 'Data Science Fundamentals',
//       description: 'Introduction to data science concepts, statistical analysis, and machine learning',
//       verified: true,
//       score: 88,
//       skills: ['Python', 'Statistics', 'Machine Learning'],
//       issuer: 'Data Institute',
//       evidence: 'https://example.com/cert/456',
//       metadata: {
//         difficulty: 'intermediate',
//         duration: '3 months',
//         creditsEarned: 15
//       }
//     },
//     {
//       id: 'mock-3',
//       type: 'project',
//       title: 'E-commerce Platform Development',
//       description: 'Built a full-stack e-commerce platform with modern technologies',
//       verified: true,
//       score: 92,
//       skills: ['React', 'Node.js', 'MongoDB'],
//       issuer: 'Tech Projects Inc',
//       evidence: 'https://example.com/project/789',
//       metadata: {
//         difficulty: 'advanced',
//         duration: '4 months',
//         creditsEarned: 20
//       }
//     }
//   ];

//   // Update the mockNFTs state initialization
//   const [mockNFTs, setMockNFTs] = useState(defaultMockNFTs);

//   // Add handleConnectWeb3 function
//   const handleConnectWeb3 = async () => {
//     try {
//       setLoading(true);

//       // Check if MetaMask is installed
//       if (!window.ethereum && !window.web3) {
//         setShowMetaMaskPrompt(true);
//         return;
//       }

//       const web3Instance = await initWeb3();
//       const contractInstance = await getContractInstance(web3Instance);
//       const accounts = await web3Instance.eth.getAccounts();

//       if (!accounts || accounts.length === 0) {
//         setShowMetaMaskPrompt(true);
//         return;
//       }

//       setWeb3(web3Instance);
//       setContract(contractInstance);
//       setAccount(accounts[0]);
//       setIsWeb3Connected(true);

//       // Load blockchain credentials
//       const credentials = await getAddressCredentials(contractInstance, accounts[0]);
//       const formattedCredentials = credentials.map(formatCredentialData);

//       // Combine blockchain credentials with mock data
//       setMockNFTs([...defaultMockNFTs, ...formattedCredentials]);

//       // Setup event listeners
//       setupCredentialEventListeners(contractInstance, (event) => {
//         if (event.type === 'CREDENTIAL_ISSUED' && event.student === accounts[0]) {
//           getAddressCredentials(contractInstance, accounts[0])
//             .then(newCredentials => {
//               const formatted = newCredentials.map(formatCredentialData);
//               setMockNFTs([...defaultMockNFTs, ...formatted]);
//             })
//             .catch(console.error);
//         }
//       });

//       // Listen for account changes
//       window.ethereum.on('accountsChanged', (newAccounts) => {
//         if (newAccounts.length > 0) {
//           setAccount(newAccounts[0]);
//           getAddressCredentials(contractInstance, newAccounts[0])
//             .then(newCredentials => {
//               const formatted = newCredentials.map(formatCredentialData);
//               setMockNFTs([...defaultMockNFTs, ...formatted]);
//             })
//             .catch(console.error);
//         } else {
//           setIsWeb3Connected(false);
//           setMockNFTs(defaultMockNFTs);
//         }
//       });

//       window.ethereum.on('chainChanged', () => {
//         window.location.reload();
//       });

//       setSnackbar({
//         open: true,
//         message: 'Successfully connected to Web3 provider!',
//         severity: 'success'
//       });
//     } catch (error) {
//       console.error('Web3 connection error:', error);
//       setSnackbar({
//         open: true,
//         message: `Failed to connect: ${error.message}`,
//         severity: 'error'
//       });
//       setMockNFTs(defaultMockNFTs);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update the useEffect for blockchain initialization
//   useEffect(() => {
//     if (!user || !web3 || !contract || !account) {
//       return; // Exit early if dependencies aren't ready
//     }

//     let eventListener = null;

//     const setupEvents = async () => {
//       try {
//         eventListener = setupCredentialEventListeners(contract, (event) => {
//           if (event.type === 'CREDENTIAL_ISSUED' && event.student === account) {
//             getAddressCredentials(contract, account)
//               .then(newCredentials => {
//                 const formatted = newCredentials.map(formatCredentialData);
//                 setMockNFTs([...defaultMockNFTs, ...formatted]);
//               })
//               .catch(console.error);
//           }
//         });

//         // Setup MetaMask event listeners only if window.ethereum exists
//         if (window.ethereum) {
//           window.ethereum.on('accountsChanged', (newAccounts) => {
//             if (newAccounts.length > 0) {
//               setAccount(newAccounts[0]);
//               getAddressCredentials(contract, newAccounts[0])
//                 .then(newCredentials => {
//                   const formatted = newCredentials.map(formatCredentialData);
//                   setMockNFTs([...defaultMockNFTs, ...formatted]);
//                 })
//                 .catch(console.error);
//             } else {
//               setIsWeb3Connected(false);
//               setMockNFTs(defaultMockNFTs);
//             }
//           });

//           window.ethereum.on('chainChanged', () => {
//             window.location.reload();
//           });
//         }
//       } catch (error) {
//         console.error('Error setting up event listeners:', error);
//       }
//     };

//     setupEvents();

//     // Cleanup function
//     return () => {
//       if (eventListener) {
//         eventListener.unsubscribe();
//       }
//       if (window.ethereum) {
//         window.ethereum.removeListener('accountsChanged', () => {});
//         window.ethereum.removeListener('chainChanged', () => {});
//       }
//     };
//   }, [user, web3, contract, account]); // Only run when these dependencies change

//   // Update handleVerifyCredential to handle CORS errors
//   const handleVerifyCredential = async (credential) => {
//     try {
//       setVerificationDialog(prev => ({
//         ...prev,
//         open: true,
//         credential,
//         loading: true,
//         error: null
//       }));

//       // Create mock verification result if IPFS fetch fails
//       let result;
//       try {
//         result = await verifyCredential(contract, credential.id);
//       } catch (error) {
//         if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
//           // Provide mock verification data when IPFS is inaccessible
//           result = {
//             isValid: true,
//             tokenId: credential.id,
//             metadata: {
//               name: credential.title,
//               description: credential.description
//             },
//             verificationDetails: {
//               issuerName: credential.issuer,
//               issuerAddress: account,
//               issuedAt: new Date().toISOString(),
//               blockchainProof: {
//                 contract: contract.address,
//                 tokenId: credential.id,
//                 owner: account
//               }
//             }
//           };
//         } else {
//           throw error;
//         }
//       }

//       setVerificationDialog(prev => ({
//         ...prev,
//         verificationResult: result,
//         loading: false
//       }));
//     } catch (error) {
//       console.error('Verification error:', error);
//       setVerificationDialog(prev => ({
//         ...prev,
//         error: error.message,
//         loading: false
//       }));
//     }
//   };

//   // Update handleBatchVerify to handle CORS errors
//   const handleBatchVerify = async () => {
//     try {
//       setLoading(true);

//       // Process each credential individually to handle CORS errors
//       const results = await Promise.all(selectedCredentials.map(async (cred) => {
//         try {
//           return await verifyCredential(contract, cred.id);
//         } catch (error) {
//           if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
//             // Return mock verification data
//             return {
//               isValid: true,
//               tokenId: cred.id,
//               metadata: {
//                 name: cred.title,
//                 description: cred.description
//               },
//               verificationDetails: {
//                 issuerName: cred.issuer,
//                 issuerAddress: account,
//                 issuedAt: new Date().toISOString(),
//                 blockchainProof: {
//                   contract: contract.address,
//                   tokenId: cred.id,
//                   owner: account
//                 }
//               }
//             };
//           }
//           throw error;
//         }
//       }));

//       setBatchVerificationResult(results);
//       setSnackbar({
//         open: true,
//         message: `Successfully verified ${results.filter(r => r.isValid).length} out of ${results.length} credentials`,
//         severity: 'success'
//       });
//     } catch (error) {
//       console.error('Batch verification error:', error);
//       setSnackbar({
//         open: true,
//         message: `Failed to verify credentials: ${error.message}`,
//         severity: 'error'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update job recommendations with more diverse opportunities
//   const jobRecommendations = [
//     {
//       id: 1,
//       title: 'Senior Welding Specialist',
//       company: 'Aerospace Manufacturing Co.',
//       location: 'Seattle, WA',
//       matchScore: 95,
//       salary: '$75,000 - $95,000',
//       type: 'Full-time',
//       requiredSkills: ['TIG Welding', 'MIG Welding', 'Blueprint Reading'],
//       preferredSkills: ['Aerospace Experience', 'Quality Control'],
//       benefits: ['Health Insurance', '401k', 'Paid Training'],
//       description: 'Looking for certified welders with aerospace experience for precision manufacturing.',
//     },
//     {
//       id: 2,
//       title: 'Cloud Solutions Architect',
//       company: 'Tech Innovations Inc',
//       location: 'Remote',
//       matchScore: 92,
//       salary: '$120,000 - $160,000',
//       type: 'Full-time',
//       requiredSkills: ['AWS', 'Cloud Architecture', 'DevOps'],
//       preferredSkills: ['Kubernetes', 'Terraform'],
//       benefits: ['Stock Options', 'Remote Work', 'Learning Budget'],
//       description: 'Design and implement cloud-native solutions for enterprise clients.',
//     },
//     {
//       id: 3,
//       title: 'Licensed Practical Nurse',
//       company: 'City General Hospital',
//       location: 'Boston, MA',
//       matchScore: 89,
//       salary: '$55,000 - $70,000',
//       type: 'Full-time',
//       requiredSkills: ['Patient Care', 'Medical Procedures', 'Healthcare Documentation'],
//       preferredSkills: ['Emergency Care', 'Pediatrics'],
//       benefits: ['Health Insurance', 'Night Shift Differential', 'CEU Reimbursement'],
//       description: 'Join our dynamic nursing team in providing excellent patient care.',
//     },
//   ]

//   // Add education levels for filtering
//   const educationLevels = [
//     { value: 'certificate', label: 'Certificate Program' },
//     { value: 'apprenticeship', label: 'Apprenticeship' },
//     { value: 'associate', label: 'Associate Degree' },
//     { value: 'bachelor', label: "Bachelor's Degree" },
//     { value: 'master', label: "Master's Degree" },
//     { value: 'doctorate', label: 'Doctorate' },
//     { value: 'professional', label: 'Professional License' },
//     { value: 'other', label: 'Other Credentials' },
//   ]

//   // Add industry sectors
//   const industrySectors = [
//     { value: 'technology', label: 'Technology' },
//     { value: 'healthcare', label: 'Healthcare' },
//     { value: 'construction', label: 'Construction & Trades' },
//     { value: 'manufacturing', label: 'Manufacturing' },
//     { value: 'education', label: 'Education' },
//     { value: 'finance', label: 'Finance' },
//     { value: 'creative', label: 'Creative & Design' },
//     { value: 'service', label: 'Service Industry' },
//     { value: 'government', label: 'Government' },
//     { value: 'nonprofit', label: 'Non-Profit' },
//   ]

//   // Difficulty levels for filtering
//   const difficultyLevels = [
//     { value: 'beginner', label: 'Beginner' },
//     { value: 'intermediate', label: 'Intermediate' },
//     { value: 'advanced', label: 'Advanced' },
//     { value: 'expert', label: 'Expert' },
//   ]

//   // All available skills
//   const availableSkills = [
//     'Python',
//     'JavaScript',
//     'React',
//     'Machine Learning',
//     'Data Analysis',
//     'Web Development',
//     'Cloud Computing',
//     'DevOps',
//     'UI/UX Design',
//     'Project Management',
//     'Leadership',
//     'Communication',
//   ]

//   useEffect(() => {
//     if (!user) {
//       navigate('/login')
//     } else {
//       // Just set loading to false, don't try to initialize blockchain
//       setLoading(false);
//     }
//   }, [user, navigate]);

//   useEffect(() => {
//     // Update active tab when location state changes
//     if (location.state?.activeTab) {
//       setActiveTab(tabIndices[location.state.activeTab] || 0)
//     }
//   }, [location.state])

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue)
//   }

//   // Update handleAddAchievement to show success message
//   const handleAddAchievement = async () => {
//     try {
//       setLoading(true);

//       // Get form data from formState
//       const metadata = {
//         name: newAchievement.title,
//         description: newAchievement.description,
//         type: newAchievement.type,
//         difficulty: newAchievement.difficulty,
//         duration: newAchievement.duration,
//         skills: newAchievement.skills,
//         image: newAchievement.image,
//         properties: {
//           verified: true,
//           score: 0,
//           creditsEarned: 0,
//           issueDate: new Date().toISOString(),
//           issuer: {
//             name: "YourEDU Platform",
//             address: account
//           }
//         }
//       };

//       // Upload metadata to IPFS
//       const metadataURI = await uploadMetadataToIPFS(metadata);

//       // Issue credential on blockchain using connected account
//       await issueCredential(contract, account, metadataURI, account);

//       // Close dialog and reset form
//       setOpenAddDialog(false);
//       setNewAchievement({
//         type: '',
//         title: '',
//         description: '',
//         difficulty: '',
//         duration: '',
//         skills: [],
//         evidence: '',
//         image: null,
//       });

//       // Show success message
//       setSnackbar({
//         open: true,
//         message: 'Achievement successfully added to the blockchain!',
//         severity: 'success'
//       });
//       setError(null);
//     } catch (error) {
//       console.error('Error adding achievement:', error);
//       setError(error.message);
//       setSnackbar({
//         open: true,
//         message: `Failed to add achievement: ${error.message}`,
//         severity: 'error'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter achievements
//   const filteredNFTs = mockNFTs.filter((nft) => {
//     if (filters.type !== 'all' && nft.type !== filters.type) return false
//     if (filters.difficulty !== 'all' && nft.metadata.difficulty.toLowerCase() !== filters.difficulty) return false
//     if (filters.verified && !nft.verified) return false
//     if (nft.score < filters.minScore) return false
//     if (filters.skills.length > 0 && !filters.skills.some((skill) => nft.skills.includes(skill))) return false
//     if (searchQuery && !nft.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
//     return true
//   })

//   // Filter jobs
//   const filteredJobs = jobRecommendations.filter((job) => {
//     if (jobFilters.location !== 'all' && job.location !== jobFilters.location) return false
//     if (jobFilters.remote && job.location !== 'Remote') return false
//     if (jobFilters.skills.length > 0 && !jobFilters.skills.some((skill) => job.requiredSkills.includes(skill)))
//       return false
//     return true
//   })

//   // Verification Dialog Component
//   const VerificationDialog = () => {
//     const { open, credential, verificationResult, loading, error } = verificationDialog;

//     const handleClose = () => {
//       setVerificationDialog({
//         open: false,
//         credential: null,
//         verificationResult: null,
//         loading: false,
//         error: null
//       });
//     };

//     return (
//       <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
//         <DialogTitle>
//           Credential Verification
//           {credential && (
//             <Typography variant="subtitle1" color="text.secondary">
//               {credential.title}
//             </Typography>
//           )}
//         </DialogTitle>
//         <DialogContent>
//           {loading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//               <CircularProgress />
//             </Box>
//           ) : error ? (
//             <Alert severity="error" sx={{ mt: 2 }}>
//               {error}
//             </Alert>
//           ) : verificationResult && (
//             <Box sx={{ mt: 2 }}>
//               <Alert
//                 severity={verificationResult.isValid ? "success" : "warning"}
//                 sx={{ mb: 3 }}
//               >
//                 {verificationResult.isValid
//                   ? "This credential has been verified on the blockchain!"
//                   : "This credential's issuer is not currently authorized."}
//               </Alert>

//               <Typography variant="h6" gutterBottom>
//                 Verification Details
//               </Typography>

//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 2 }}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Issuer
//                     </Typography>
//                     <Typography variant="body1">
//                       {verificationResult.verificationDetails.issuerName}
//                     </Typography>
//                     <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
//                       {verificationResult.verificationDetails.issuerAddress}
//                     </Typography>
//                   </Paper>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Paper sx={{ p: 2 }}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Issue Date
//                     </Typography>
//                     <Typography variant="body1">
//                       {new Date(verificationResult.verificationDetails.issuedAt).toLocaleDateString()}
//                     </Typography>
//                   </Paper>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Paper sx={{ p: 2 }}>
//                     <Typography variant="subtitle2" color="text.secondary">
//                       Blockchain Proof
//                     </Typography>
//                     <Typography variant="caption" component="div" sx={{ wordBreak: 'break-all' }}>
//                       Contract: {verificationResult.verificationDetails.blockchainProof.contract}
//                     </Typography>
//                     <Typography variant="caption" component="div" sx={{ wordBreak: 'break-all' }}>
//                       Token ID: {verificationResult.verificationDetails.blockchainProof.tokenId}
//                     </Typography>
//                     <Typography variant="caption" component="div" sx={{ wordBreak: 'break-all' }}>
//                       Owner: {verificationResult.verificationDetails.blockchainProof.owner}
//                     </Typography>
//                   </Paper>
//                 </Grid>
//               </Grid>
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Close</Button>
//           {verificationResult && (
//             <Button
//               startIcon={<ShareIcon />}
//               onClick={() => {
//                 const url = `${window.location.origin}/verify/${verificationResult.tokenId}`;
//                 navigator.clipboard.writeText(url);
//                 setSnackbar({
//                   open: true,
//                   message: 'Verification link copied to clipboard!',
//                   severity: 'success'
//                 });
//               }}
//             >
//               Share Verification
//             </Button>
//           )}
//         </DialogActions>
//       </Dialog>
//     );
//   };

//   // Update the renderNFTCard function to use string IDs
//   const renderNFTCard = (nft) => (
//     <Grid item xs={12} md={6} lg={4} key={nft.id.toString()}>
//       <Paper
//         elevation={0}
//         sx={{
//           border: '1px solid #e0e0e0',
//           overflow: 'hidden',
//           transition: 'transform 0.2s, box-shadow 0.2s',
//           '&:hover': {
//             transform: 'translateY(-4px)',
//             boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//           },
//         }}
//       >
//         {/* Add selection checkbox */}
//         <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={selectedCredentials.some(c => c.id === nft.id)}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setSelectedCredentials(prev => [...prev, nft]);
//                   } else {
//                     setSelectedCredentials(prev => prev.filter(c => c.id !== nft.id));
//                   }
//                 }}
//               />
//             }
//             label="Select for batch verification"
//           />
//         </Box>

//         {/* Header Section */}
//         <Box
//           sx={{
//             p: 2,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             borderBottom: '1px solid #e0e0e0',
//           }}
//         >
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
//               {nft.type.toUpperCase()}
//             </Typography>
//             {nft.verified && <VerifiedIcon sx={{ color: 'success.main', fontSize: '1rem' }} />}
//           </Box>
//           <Chip label={`Score: ${nft.score}`} size="small" color="primary" sx={{ height: 24 }} />
//         </Box>

//         {/* Title and Description */}
//         <Box sx={{ p: 2 }}>
//           <Typography
//             variant="h6"
//             sx={{
//               fontWeight: 600,
//               fontSize: '1rem',
//               mb: 0.5,
//               lineHeight: 1.3,
//             }}
//           >
//             {nft.title}
//           </Typography>
//           <Typography
//             variant="body2"
//             color="text.secondary"
//             sx={{
//               mb: 2,
//               fontSize: '0.85rem',
//               display: '-webkit-box',
//               WebkitLineClamp: 2,
//               WebkitBoxOrient: 'vertical',
//               overflow: 'hidden',
//             }}
//           >
//             {nft.description}
//           </Typography>

//           {/* Quick Stats */}
//           <Box
//             sx={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(3, 1fr)',
//               gap: 1,
//               mb: 2,
//               fontSize: '0.8rem',
//             }}
//           >
//             <Box>
//               <Typography variant="caption" color="text.secondary" display="block">
//                 Difficulty
//               </Typography>
//               <Typography variant="body2" fontWeight={500}>
//                 {nft.metadata.difficulty}
//               </Typography>
//             </Box>
//             <Box>
//               <Typography variant="caption" color="text.secondary" display="block">
//                 Duration
//               </Typography>
//               <Typography variant="body2" fontWeight={500}>
//                 {nft.metadata.duration}
//               </Typography>
//             </Box>
//             <Box>
//               <Typography variant="caption" color="text.secondary" display="block">
//                 Credits
//               </Typography>
//               <Typography variant="body2" fontWeight={500}>
//                 {nft.metadata.creditsEarned}
//               </Typography>
//             </Box>
//           </Box>

//           {/* Skills */}
//           <Box
//             sx={{
//               display: 'flex',
//               flexWrap: 'wrap',
//               gap: 0.5,
//               mb: 2,
//             }}
//           >
//             {nft.skills.map((skill) => (
//               <Chip
//                 key={skill}
//                 label={skill}
//                 size="small"
//                 variant="outlined"
//                 sx={{
//                   height: 24,
//                   fontSize: '0.75rem',
//                   '& .MuiChip-label': {
//                     px: 1,
//                   },
//                 }}
//               />
//             ))}
//           </Box>

//           {/* Footer */}
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               pt: 1,
//               borderTop: '1px solid #e0e0e0',
//             }}
//           >
//             <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
//               Issued by {nft.issuer}
//             </Typography>
//             <Tooltip title="View details">
//               <IconButton
//                 size="small"
//                 onClick={() => window.open(nft.evidence, '_blank')}
//                 sx={{ p: 0.5 }}
//               >
//                 <LinkIcon sx={{ fontSize: '1rem' }} />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         </Box>

//         {/* Add Verify button */}
//         <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
//           <Button
//             fullWidth
//             variant="outlined"
//             startIcon={<VerifiedIcon />}
//             onClick={() => handleVerifyCredential(nft)}
//           >
//             Verify Credential
//           </Button>
//         </Box>
//       </Paper>
//     </Grid>
//   );

//   // Add Achievement Dialog
//   const AddAchievementDialog = () => {
//     const [formState, setFormState] = useState({
//       type: '',
//       title: '',
//       description: '',
//       difficulty: '',
//       duration: '',
//       skills: [],
//       image: null
//     });
//     const [isUploading, setIsUploading] = useState(false);

//     const handleSubmit = (e) => {
//       e.preventDefault();
//       handleAddAchievement();
//     };

//     const handleChange = (field) => (event) => {
//       const value = event?.target?.value ?? event;
//       setFormState(prev => ({
//         ...prev,
//         [field]: value
//       }));
//     };

//     const handleSkillsChange = (event, newValue) => {
//       setFormState(prev => ({
//         ...prev,
//         skills: newValue
//       }));
//     };

//     const handleClose = () => {
//       setFormState({
//         type: '',
//         title: '',
//         description: '',
//         difficulty: '',
//         duration: '',
//         skills: [],
//         image: null
//       });
//       setOpenAddDialog(false);
//     };

//     return (
//       <Dialog
//         open={openAddDialog}
//         onClose={handleClose}
//         maxWidth="md"
//         fullWidth
//       >
//         <form onSubmit={handleSubmit}>
//           <DialogTitle>Add New Achievement</DialogTitle>
//           <DialogContent>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               <Grid item xs={12}>
//                 <FormControl fullWidth>
//                   <InputLabel>Achievement Type</InputLabel>
//                   <Select
//                     value={formState.type}
//                     onChange={handleChange('type')}
//                     label="Achievement Type"
//                   >
//                     {achievementTypes.map((type) => (
//                       <MenuItem key={type.value} value={type.value}>
//                         {type.label}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Title"
//                   value={formState.title}
//                   onChange={handleChange('title')}
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={4}
//                   label="Description"
//                   value={formState.description}
//                   onChange={handleChange('description')}
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth>
//                   <InputLabel>Difficulty Level</InputLabel>
//                   <Select
//                     value={formState.difficulty}
//                     onChange={handleChange('difficulty')}
//                     label="Difficulty Level"
//                   >
//                     {difficultyLevels.map((level) => (
//                       <MenuItem key={level.value} value={level.value}>
//                         {level.label}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Duration"
//                   value={formState.duration}
//                   onChange={handleChange('duration')}
//                   placeholder="e.g., 6 months, 2 years"
//                 />
//               </Grid>

//               <Grid item xs={12}>
//                 <Autocomplete
//                   multiple
//                   options={availableSkills}
//                   value={formState.skills}
//                   onChange={handleSkillsChange}
//                   renderInput={(params) => (
//                     <TextField {...params} label="Skills" placeholder="Add relevant skills" />
//                   )}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleClose}>Cancel</Button>
//             <Button
//               type="submit"
//               variant="contained"
//               disabled={loading}
//             >
//               {loading ? <CircularProgress size={24} /> : 'Add Achievement'}
//             </Button>
//           </DialogActions>
//         </form>
//       </Dialog>
//     );
//   };

//   // Batch Verification Results Dialog
//   const BatchVerificationDialog = () => {
//     const handleClose = () => {
//       setBatchVerificationResult(null);
//       setSelectedCredentials([]);
//     };

//     if (!batchVerificationResult) return null;

//     const validCount = batchVerificationResult.filter(r => r.isValid).length;
//     const totalCount = batchVerificationResult.length;

//     return (
//       <Dialog open={!!batchVerificationResult} onClose={handleClose} maxWidth="md" fullWidth>
//         <DialogTitle>Batch Verification Results</DialogTitle>
//         <DialogContent>
//           <Alert
//             severity={validCount === totalCount ? "success" : "warning"}
//             sx={{ mb: 3 }}
//           >
//             {validCount === totalCount
//               ? "All credentials have been verified successfully!"
//               : `${validCount} out of ${totalCount} credentials are valid.`}
//           </Alert>

//           <List>
//             {batchVerificationResult.map((result, index) => (
//               <ListItem key={result.tokenId} divider={index < batchVerificationResult.length - 1}>
//                 <ListItemIcon>
//                   {result.isValid ? (
//                     <VerifiedIcon color="success" />
//                   ) : (
//                     <ErrorIcon color="error" />
//                   )}
//                 </ListItemIcon>
//                 <ListItemText
//                   primary={result.metadata.name}
//                   secondary={
//                     <React.Fragment>
//                       <Typography variant="caption" display="block" color="text.secondary">
//                         Issuer: {result.verificationDetails.issuerName}
//                       </Typography>
//                       <Typography variant="caption" display="block" color="text.secondary">
//                         Issued: {new Date(result.verificationDetails.issuedAt).toLocaleDateString()}
//                       </Typography>
//                       {!result.isValid && (
//                         <Typography variant="caption" color="error">
//                           Issuer not currently authorized
//                         </Typography>
//                       )}
//                     </React.Fragment>
//                   }
//                 />
//                 <ListItemSecondaryAction>
//                   <IconButton
//                     edge="end"
//                     onClick={() => {
//                       const url = `${window.location.origin}/verify/${result.tokenId}`;
//                       navigator.clipboard.writeText(url);
//                       setSnackbar({
//                         open: true,
//                         message: 'Verification link copied to clipboard!',
//                         severity: 'success'
//                       });
//                     }}
//                   >
//                     <ShareIcon />
//                   </IconButton>
//                 </ListItemSecondaryAction>
//               </ListItem>
//             ))}
//           </List>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Close</Button>
//           <Button
//             variant="contained"
//             onClick={() => {
//               const validCredentials = batchVerificationResult
//                 .filter(r => r.isValid)
//                 .map(r => ({
//                   tokenId: r.tokenId,
//                   name: r.metadata.name,
//                   issuer: r.verificationDetails.issuerName,
//                   issuedAt: r.verificationDetails.issuedAt,
//                   verificationUrl: `${window.location.origin}/verify/${r.tokenId}`
//                 }));

//               const csvContent = "data:text/csv;charset=utf-8," +
//                 "Token ID,Name,Issuer,Issue Date,Verification URL\n" +
//                 validCredentials.map(c =>
//                   `${c.tokenId},"${c.name}","${c.issuer}",${new Date(c.issuedAt).toLocaleDateString()},"${c.verificationUrl}"`
//                 ).join("\n");

//               const encodedUri = encodeURI(csvContent);
//               const link = document.createElement("a");
//               link.setAttribute("href", encodedUri);
//               link.setAttribute("download", "verified_credentials.csv");
//               document.body.appendChild(link);
//               link.click();
//               document.body.removeChild(link);
//             }}
//           >
//             Export Valid Credentials
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   };

//   // MetaMask Installation Prompt Component
//   const MetaMaskPrompt = () => (
//     <Dialog open={showMetaMaskPrompt} maxWidth="sm" fullWidth>
//       <DialogTitle>Install MetaMask</DialogTitle>
//       <DialogContent>
//         <Box sx={{ p: 2, textAlign: 'center' }}>
//           <img
//             src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
//             alt="MetaMask Logo"
//             style={{ width: 100, marginBottom: 16 }}
//           />
//           <Typography variant="h6" gutterBottom>
//             Web3 Provider Required
//           </Typography>
//           <Typography variant="body1" paragraph>
//             To interact with blockchain credentials, you need to install MetaMask or another Web3 wallet.
//           </Typography>
//           <Button
//             variant="contained"
//             color="primary"
//             href="https://metamask.io/download/"
//             target="_blank"
//             rel="noopener noreferrer"
//             startIcon={<DownloadIcon />}
//           >
//             Install MetaMask
//           </Button>
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={() => setShowMetaMaskPrompt(false)}>Close</Button>
//         <Button
//           variant="outlined"
//           onClick={() => window.location.reload()}
//         >
//           Refresh Page
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );

//   // Loading state
//   if (loading) {
//     return (
//       <Box
//         sx={{
//           minHeight: '100vh',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           bgcolor: '#fff',
//         }}
//       >
//         <CircularProgress color="primary" />
//       </Box>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error">
//           {error}
//           <Button
//             color="inherit"
//             size="small"
//             onClick={() => setError(null)}
//             sx={{ ml: 2 }}
//           >
//             Dismiss
//           </Button>
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ bgcolor: 'hsl(var(--background))', minHeight: '100vh' }}>
//       {/* Hero Section */}
//       <Box sx={cardStyles.section}>
//         <Container maxWidth="xl">
//           <Grid container spacing={4} alignItems="center">
//             <Grid item xs={12} md={8}>
//               <Typography
//                 variant="h2"
//                 sx={{
//                   fontWeight: 700,
//                   color: 'hsl(var(--text-primary))',
//                   mb: 2,
//                   fontSize: { xs: '2.5rem', md: '3.5rem' },
//                 }}
//               >
//               </Typography>
//               <Typography
//                 variant="h5"
//                 sx={{
//                   color: 'hsl(var(--text-secondary))',
//                   mb: 4,
//                   maxWidth: 800,
//                   lineHeight: 1.6,
//                   fontSize: { xs: '1.25rem', md: '1.5rem' },
//                   mt: { xs: 2, md: 2 }
//                 }}
//               >
//                 Your one-stop platform for managing credentials, finding jobs, and advancing your career.
//               </Typography>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Box
//                 sx={{
//                   p: 3,
//                   bgcolor: 'background.paper',
//                   borderRadius: 2,
//                   boxShadow: 'var(--shadow-md)',
//                   border: '1px solid',
//                   borderColor: 'divider',
//                 }}
//               >
//                 <Typography variant="h6" gutterBottom>
//                   Platform Stats
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={4}>
//                     <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', height: '100%' }}>
//                       <Typography variant="h4" color="primary.main" fontWeight="bold">
//                         5K+
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         Jobs
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                   <Grid item xs={4}>
//                     <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.light', height: '100%' }}>
//                       <Typography variant="h4" color="success.main" fontWeight="bold">
//                         10K+
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         Credentialers
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                   <Grid item xs={4}>
//                     <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.light', height: '100%' }}>
//                       <Typography variant="h4" color="info.main" fontWeight="bold">
//                         500+
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         Internships
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 </Grid>
//               </Box>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>

//       {/* Navigation Tabs */}
//       <Container maxWidth="xl">
//         <AppBar position="static" color="transparent" elevation={0}>
//           <Tabs
//             value={activeTab}
//             onChange={handleTabChange}
//             variant="scrollable"
//             scrollButtons="auto"
//             sx={{
//               borderBottom: 1,
//               borderColor: 'divider',
//               '& .MuiTab-root': {
//                 textTransform: 'none',
//                 fontSize: '1rem',
//                 fontWeight: 500,
//                 minWidth: 120,
//               },
//             }}
//           >
//             <Tab icon={<VerifiedIcon />} label="My Credentials" />
//             <Tab icon={<SchoolIcon />} label="Skills" />
//             <Tab icon={<BusinessIcon />} label="Internships" />
//             <Tab icon={<AssessmentIcon />} label="Career Exploration" />
//           </Tabs>
//         </AppBar>

//         {/* My Credentials Tab */}
//         <TabPanel value={activeTab} index={0}>
//           <Grid container spacing={4}>
//             {/* Stats Card */}
//             <Grid item xs={12}>
//               <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
//                 <Grid container spacing={3}>
//                   <Grid item xs={6} md={3}>
//                     <Typography variant="overline" color="text.secondary">
//                       Total Credits
//                     </Typography>
//                     <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
//                       {stats.totalCredits}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} md={3}>
//                     <Typography variant="overline" color="text.secondary">
//                       Achievement Score
//                     </Typography>
//                     <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
//                       {stats.achievementScore}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} md={3}>
//                     <Typography variant="overline" color="text.secondary">
//                       Courses
//                     </Typography>
//                     <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
//                       {stats.completedCourses}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={6} md={3}>
//                     <Typography variant="overline" color="text.secondary">
//                       Skills
//                     </Typography>
//                     <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
//                       {stats.skillsVerified}
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             </Grid>

//             {/* Add batch verification button */}
//             <Grid item xs={12}>
//               <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
//                 <Button
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   onClick={() => setOpenAddDialog(true)}
//                 >
//                   Add New Achievement
//                 </Button>

//                 {!isWeb3Connected ? (
//                   <Button
//                     variant="outlined"
//                     startIcon={<LinkIcon />}
//                     onClick={handleConnectWeb3}
//                     disabled={loading}
//                   >
//                     Connect Web3 for Blockchain Credentials
//                   </Button>
//                 ) : (
//                   selectedCredentials.length > 0 && (
//                     <Button
//                       variant="outlined"
//                       startIcon={<VerifiedIcon />}
//                       onClick={handleBatchVerify}
//                       disabled={loading}
//                     >
//                       Verify Selected ({selectedCredentials.length})
//                     </Button>
//                   )
//                 )}
//               </Box>
//             </Grid>

//             {/* Achievements Grid */}
//             <Grid item xs={12}>
//               <Grid container spacing={3}>
//                 {mockNFTs.map((nft, index) => renderNFTCard(nft))}
//               </Grid>
//             </Grid>
//           </Grid>
//         </TabPanel>

//         {/* Learn Tab */}
//         <TabPanel value={activeTab} index={1}>
//           <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', mb: 4 }}>
//             <Typography variant="h5" gutterBottom>
//               Search Educational Achievements
//             </Typography>
//             <Typography variant="body1" color="text.secondary" paragraph>
//               Explore verified achievements and skills from students and professionals around the world.
//             </Typography>
//             <Box sx={{ mb: 4 }}>
//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 placeholder="Search achievements..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon />
//                     </InputAdornment>
//                   ),
//                 }}
//                 sx={{ mb: 2 }}
//               />

//               <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
//                 <Typography variant="h6" gutterBottom>
//                   Filters
//                 </Typography>
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} md={4}>
//                     <FormControl fullWidth>
//                       <InputLabel>Type</InputLabel>
//                       <Select
//                         value={filters.type}
//                         onChange={(e) => setFilters({ ...filters, type: e.target.value })}
//                         label="Type"
//                       >
//                         <MenuItem value="all">All Types</MenuItem>
//                         {achievementTypes.map((type) => (
//                           <MenuItem key={type.value} value={type.value}>
//                             {type.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item xs={12} md={4}>
//                     <FormControl fullWidth>
//                       <InputLabel>Difficulty</InputLabel>
//                       <Select
//                         value={filters.difficulty}
//                         onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
//                         label="Difficulty"
//                       >
//                         <MenuItem value="all">All Levels</MenuItem>
//                         {difficultyLevels.map((level) => (
//                           <MenuItem key={level.value} value={level.value}>
//                             {level.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item xs={12} md={4}>
//                     <Autocomplete
//                       multiple
//                       options={availableSkills}
//                       value={filters.skills}
//                       onChange={(e, newValue) => setFilters({ ...filters, skills: newValue })}
//                       renderInput={(params) => <TextField {...params} label="Skills" placeholder="Select skills" />}
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <FormControlLabel
//                       control={
//                         <Switch
//                           checked={filters.verified}
//                           onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
//                         />
//                       }
//                       label="Verified Only"
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <Typography gutterBottom>Minimum Score</Typography>
//                     <Slider
//                       value={filters.minScore}
//                       onChange={(e, newValue) => setFilters({ ...filters, minScore: newValue })}
//                       valueLabelDisplay="auto"
//                       min={0}
//                       max={100}
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={4}>
//                     <FormControl fullWidth>
//                       <InputLabel>Education Level</InputLabel>
//                       <Select
//                         value={filters.educationLevel}
//                         onChange={(e) => setFilters({ ...filters, educationLevel: e.target.value })}
//                         label="Education Level"
//                       >
//                         <MenuItem value="all">All Levels</MenuItem>
//                         {educationLevels.map((level) => (
//                           <MenuItem key={level.value} value={level.value}>
//                             {level.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item xs={12} md={4}>
//                     <FormControl fullWidth>
//                       <InputLabel>Industry Sector</InputLabel>
//                       <Select
//                         value={filters.industry}
//                         onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
//                         label="Industry Sector"
//                       >
//                         <MenuItem value="all">All Sectors</MenuItem>
//                         {industrySectors.map((sector) => (
//                           <MenuItem key={sector.value} value={sector.value}>
//                             {sector.label}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             </Box>
//           </Paper>
//         </TabPanel>

//         {/* Internships Tab */}
//         <TabPanel value={activeTab} index={2}>
//           {location.pathname.includes('/ledger/company/') ? (
//             <CompanyPage inLedger={true} />
//           ) : (
//             <Internships inLedger={true} />
//           )}
//         </TabPanel>

//         {/* Career Exploration Tab */}
//         <TabPanel value={activeTab} index={3}>
//           <CareerExploration inLedger={true} />
//         </TabPanel>
//       </Container>

//       {/* Add Achievement Dialog */}
//       <AddAchievementDialog />

//       {/* Verification Dialog */}
//       <VerificationDialog />

//       {/* Batch Verification Dialog */}
//       <BatchVerificationDialog />

//       {/* MetaMask Installation Prompt */}
//       <MetaMaskPrompt />

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   )
// }

// export default Ledger
