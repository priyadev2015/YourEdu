import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import { debounce } from 'lodash';
import { useAuth } from '../utils/AuthContext';
import { toast } from 'react-toastify';
// Add Font Awesome imports
import ImportantNoteCard from '../components/ui/ImportantNoteCard';
import { FeatureHeader } from '../components/ui/typography';

// Move styles to the top of the file, before the component
const styles = {
  container: {
    padding: 'var(--container-padding-x)',
    minHeight: '100vh',
    backgroundColor: 'white',
    '@media (--tablet)': {
      padding: 'var(--container-padding-x-mobile)',
    },
  },
  headerContainer: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#2d3748',
    '&:hover': {
      backgroundColor: '#f7fafc',
    },
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tabContainer: {
    width: '280px',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px 0 0 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderRight: '1px solid #e2e8f0',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
    '&:hover': {
      backgroundColor: '#e2e8f0',
    },
  },
  tabIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: 'calc(100% - 280px)',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2d3748',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
      borderColor: '#4299e1',
    },
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  finalButtons: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    justifyContent: 'flex-end',
  },
  submitAffidavitButton: {
    padding: '12px 24px',
    backgroundColor: '#2563EB',
    color: 'white',
    height: 36,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'none',
    boxShadow: 'none',
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#2563EB',
      boxShadow: 'none'
    }
  },
  printButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#2d3748',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f7fafc',
    },
  },
  tabStep: {
    fontSize: '14px',
    width: '60px',
    textAlign: 'left',
    fontWeight: '600',
  },
  printPreview: {
    padding: '20px',
    backgroundColor: 'white',
    '@media print': {
      padding: '0',
    },
  },
  printTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#00356b',
    textAlign: 'center',
  },
  printSection: {
    marginBottom: '30px',
    pageBreakInside: 'avoid',
  },
  printField: {
    marginBottom: '10px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  printTotal: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #e2e8f0',
    fontWeight: '500',
  },
  printFooter: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#718096',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: '8px',
    top: '8px',
  },
  previewButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '20px',
    '@media print': {
      display: 'none',
    },
  },
  numberInput: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '120px',
    backgroundColor: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#4299e1',
      boxShadow: '0 0 0 1px #4299e1',
    },
  },
  ageInputGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  enrollmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  staffGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  totalEnrollment: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#2d3748',
  },
  totalStaff: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#2d3748',
  },
  subSectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
      marginBottom: '16px',
    marginTop: '32px',
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  progressContainer: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: '200px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
  },
  progressText: {
    fontSize: '14px',
    color: '#4a5568',
    whiteSpace: 'nowrap',
  },
  statusChip: {
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '500',
    marginLeft: '8px',
  },
  formField: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
  },
  stepper: {
    marginBottom: '24px',
  },
  helperText: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '16px',
    lineHeight: '1.5',
    display: 'block' // Add this to ensure it's treated as a block element
  },
  requiredStar: {
    color: '#FF0000',
    marginLeft: '2px',
  },
  errorMessage: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  errorList: {
    marginTop: '8px',
    paddingLeft: '20px',
  },
  errorItem: {
    marginBottom: '4px',
  },
  reviewContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  reviewSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  reviewSubheading: {
    fontSize: '1.25rem',
    color: '#2d3748',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: '600',
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #edf2f7',
  },
  reviewLabel: {
    flex: '0 0 40%',
    color: '#4a5568',
    fontWeight: '500',
    paddingRight: '1rem',
  },
  reviewValue: {
    flex: '0 0 60%',
    color: '#2d3748',
    textAlign: 'left',
    wordBreak: 'break-word',
  },
  reviewTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#edf2f7',
    borderRadius: '6px',
    fontWeight: '600',
  },
  finalButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
    gap: '1rem',
  },
  submitAffidavitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#00356b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
};

// Add these styles to your existing styles object
const additionalStyles = {
  printPreview: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  printTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#2d3748'
  },
  printSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  printSectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#2d3748',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '8px'
  },
  printRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f7fafc'
  },
  printLabel: {
    fontWeight: '500',
    color: '#4a5568',
    flex: '0 0 40%'
  },
  printValue: {
    color: '#2d3748',
    flex: '0 0 55%',
    textAlign: 'right'
  },
  printAcknowledgment: {
    fontSize: '14px',
    color: '#4a5568',
    fontStyle: 'italic'
  }
};

// Merge the additional styles with existing styles
Object.assign(styles, additionalStyles);

// Move PrintPreview component outside of CaliforniaPSA
export const PrintPreview = ({ formData, calculateTotalStaff }) => {
  if (!formData) return null;

  const renderSection = (title, data, formatter = (key, value) => ({ label: key, value })) => {
    if (!data) return null;
    return (
      <div style={styles.printSection}>
        <Typography variant="h3" component="div" style={styles.printSectionTitle}>
          {title}
        </Typography>
        {Object.entries(data).map(([key, value]) => {
          const { label, value: formattedValue } = formatter(key, value);
          if (!value && value !== 0) return null;
          return (
            <div key={key} style={styles.printRow}>
              <Typography component="span" style={styles.printLabel}>
                {label}:
              </Typography>
              <Typography component="span" style={styles.printValue}>
                {formattedValue}
              </Typography>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.printPreview}>
      <Typography variant="h1" component="div" style={styles.printTitle}>
        California Private School Affidavit
      </Typography>
      
      {renderSection('School Information', {
        'School Name': formData.school_name,
        'CDS Code': formData.cds_code,
        'County': formData.county,
        'District': formData.district,
        'Website': formData.website
      })}

      {renderSection('Physical Address', {
        'Street': formData.physical_street,
        'City': formData.physical_city,
        'State': formData.physical_state,
        'ZIP': formData.physical_zip,
        'Phone': formData.phone,
        'Email': formData.primary_email
      })}

      {renderSection('Site Administrator', {
        'Name': `${formData.site_admin_first_name || ''} ${formData.site_admin_last_name || ''}`.trim(),
        'Title': formData.site_admin_title,
        'Phone': formData.site_admin_phone,
        'Email': formData.site_admin_email
      })}

      {renderSection('Enrollment Data', formData.enrollment, (grade, count) => ({
        label: grade.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: count || 0
      }))}

      {renderSection('Staff Information', {
        'Full-time Teachers': formData.full_time_teachers || 0,
        'Part-time Teachers': formData.part_time_teachers || 0,
        'Administrators': formData.administrators || 0,
        'Other Staff': formData.other_staff || 0,
        'Total Staff': calculateTotalStaff(formData)
      })}

      {renderSection('Tax Status', formData.tax_status, (status, isChecked) => ({
        label: status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: isChecked ? 'Yes' : 'No'
      }))}

      {formData.statutory_acknowledgment && (
        <div style={styles.printSection}>
          <h3 style={styles.printSectionTitle}>Acknowledgment</h3>
          <p style={styles.printAcknowledgment}>
            I acknowledge that I have read and understand the Statutory Notices and assure the school's compliance.
          </p>
        </div>
      )}
    </div>
  );
};

// Add renderLabel helper function before the component
const renderLabel = (label, required = false) => {
  if (!required) return label;
  return (
    <span>
      {label}<span style={{ color: '#FF0000' }}>*</span>
    </span>
  );
};

const CaliforniaPSA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const [signature, setSignature] = useState({ 
    name: '', 
    date: new Date().toISOString().split('T')[0] // Initialize with current date in YYYY-MM-DD format
  });
  const [activeTab, setActiveTab] = useState(1);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [completionStatus, setCompletionStatus] = useState({ percent: 0, status: 'Not Started' });
  const [message, setMessage] = useState({ type: null, content: '' });
  const [submissionProgress, setSubmissionProgress] = useState({
    status: '',
    details: ''
  });
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [emailPreview, setEmailPreview] = useState({
    to: '',
    subject: '',
    content: '',
    attachment: ''
  });
  const [formData, setFormData] = useState({
    school_name: '',
    cds_code: '',
    county: '',
    district: '',
    is_full_time_private: '',
    school_type: '',
    special_education: '',
    high_school_diploma: '',
    low_grade: '',
    high_grade: '',
    classification: '',
    physical_street: '',
    physical_city: '',
    physical_state: '',
    physical_zip: '',
    mailing_street: '',
    mailing_city: '',
    mailing_state: '',
    mailing_zip: '',
    phone: '',
    fax_number: '',
    primary_email: '',
    website: '',
    name_changed: false,
    previous_name: '',
    district_changed: false,
    previous_district: '',
    youngest_years: '',
    youngest_months: '',
    oldest_years: '',
    enrollment: {
      kindergarten: '',
      grade1: '',
      grade2: '',
      grade3: '',
      grade4: '',
      grade5: '',
      grade6: '',
      grade7: '',
      grade8: '',
      grade9: '',
      grade10: '',
      grade11: '',
      grade12: ''
    },
    previous_year_graduates: '',
    full_time_teachers: '',
    part_time_teachers: '',
    administrators: '',
    other_staff: '',
    site_admin_salutation: '',
    site_admin_first_name: '',
    site_admin_last_name: '',
    site_admin_title: '',
    site_admin_phone: '',
    site_admin_extension: '',
    site_admin_email: '',
    site_admin_street: '',
    site_admin_city: '',
    site_admin_state: '',
    site_admin_zip: '',
    site_admin_zip4: '',
    tax_status: {
      section501c3: false,
      section23701d: false,
      section214: false,
      none: false
    },
    statutory_acknowledgment: false
  });

  // First, add a new state for the error dialog
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    missingFields: []
  });

  // Add submitPSA function
  const submitPSA = async (finalFormData) => {
    try {
      const { data, error } = await supabase
        .from('california_psa')
        .upsert({
          ...finalFormData,
          user_id: user.id,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting PSA:', error);
      throw error;
    }
  };

  // Move all useEffect hooks here, at the top level
  useEffect(() => {
    if (user) {
      loadFormData();
      loadProfileData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Load user data from MyAccount
    const loadUserData = async () => {
      try {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (userData) {
          setFormData(prevData => ({
            ...prevData,
            mailingAddress: userData.address,
            mailingCity: userData.city,
            mailingState: userData.state,
            mailingZip: userData.zip,
            directorName: userData.fullName,
            directorPhone: userData.phone,
            directorEmail: userData.email,
            recordsContactName: userData.fullName,
            recordsContactPhone: userData.phone,
            recordsContactEmail: userData.email,
            recordsAddress: userData.address,
            recordsCity: userData.city,
            recordsState: userData.state,
            recordsZip: userData.zip
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (profile) {
        setFormData(prev => ({
          ...prev,
          // Auto-populate physical address
          physical_street: profile.street_address || '',
          physical_city: profile.city || '',
          physical_state: profile.state || '',
          physical_zip: profile.zip || '',
          // Auto-populate mailing address
          mailing_street: profile.street_address || '',
          mailing_city: profile.city || '',
          mailing_state: profile.state || '',
          mailing_zip: profile.zip || '',
          // Other fields
          site_admin_first_name: profile.name?.split(' ')[0] || '',
          site_admin_last_name: profile.name?.split(' ').slice(1).join(' ') || '',
          site_admin_email: profile.email || '',
          site_admin_phone: profile.phone_number || '',
          site_admin_street: profile.street_address || '',
          site_admin_city: profile.city || '',
          site_admin_state: profile.state || '',
          site_admin_zip: profile.zip || '',
          primary_email: profile.email || '',
          phone: profile.phone_number || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      setSnackbar({ open: true, message: 'Failed to load profile data', severity: 'error' });
    }
  };

  const loadFormData = async () => {
    try {
      setLoading(true);
      const { data: psaData, error } = await supabase
        .from('california_psa')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (psaData) {
        setFormData(prev => ({
          ...prev,
          ...psaData,
          // Convert text values to boolean for UI state
          name_changed: psaData.name_changed === 'true',
          previous_name: psaData.previous_name || '',
          district_changed: psaData.district_changed === 'true',
          previous_district: psaData.previous_district || '',
          // Preserve any profile data if PSA fields are empty
          physical_street: psaData.physical_street || prev.physical_street,
          physical_city: psaData.physical_city || prev.physical_city,
          physical_state: psaData.physical_state || prev.physical_state,
          physical_zip: psaData.physical_zip || prev.physical_zip,
          phone: psaData.phone || prev.phone,
          primary_email: psaData.primary_email || prev.primary_email,
          site_admin_first_name: psaData.site_admin_first_name || prev.site_admin_first_name,
          site_admin_last_name: psaData.site_admin_last_name || prev.site_admin_last_name,
          site_admin_email: psaData.site_admin_email || prev.site_admin_email,
          site_admin_phone: psaData.site_admin_phone || prev.site_admin_phone,
          site_admin_street: psaData.site_admin_street || prev.site_admin_street,
          site_admin_city: psaData.site_admin_city || prev.site_admin_city,
          site_admin_state: psaData.site_admin_state || prev.site_admin_state,
          site_admin_zip: psaData.site_admin_zip || prev.site_admin_zip,
        }));
      }
    } catch (error) {
      console.error('Error loading PSA data:', error);
      setSnackbar({ open: true, message: 'Failed to load PSA data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveFormData = useCallback(
    debounce(async (data) => {
      if (!user) return;

      setFormData(prev => ({
        ...prev,
        ...data,
        updated_at: new Date().toISOString()
      }));

      try {
        const { error } = await supabase
          .from('california_psa')
          .upsert({
            ...data,
            user_id: user.id,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id',
            returning: 'minimal'
          });

        if (error) throw error;

        setSnackbar({ open: true, message: 'PSA data saved successfully', severity: 'success' });
      } catch (error) {
        console.error('Error saving PSA data:', error.message);
        setSnackbar({ open: true, message: 'Error saving PSA data', severity: 'error' });
      }
    }, 1000),
    [user]
  );

  useEffect(() => {
    if (formData.usePhysicalForMailing) {
      handleCopyAddress();
    }
  }, [formData.usePhysicalForMailing]);

  useEffect(() => {
    if (formData.useSiteAdminForDirector) {
      handleCopyAdminInfo();
    }
  }, [formData.useSiteAdminForDirector]);

  useEffect(() => {
    if (formData.useCustodianAddress) {
      handleCopyCustodianAddress();
    }
  }, [formData.useCustodianAddress]);

  // Update the calculateProgress useEffect to prevent infinite loops
  useEffect(() => {
    const calculateProgress = () => {
      const requiredFields = [
        'school_name',
        'cds_code',
        'county',
        'district',
        'is_full_time_private',
        'physical_street',
        'physical_city',
        'physical_state',
        'physical_zip',
        'phone',
        'primary_email',
        'youngest_years',
        'youngest_months',
        'oldest_years',
        'site_admin_first_name',
        'site_admin_last_name',
        'site_admin_title',
        'site_admin_phone',
        'site_admin_email',
        'statutory_acknowledgment'
      ];

      let filledFields = 0;
      requiredFields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (formData[parent]?.[child]) filledFields++;
        } else if (formData[field]) filledFields++;
      });

      const enrollmentFields = Object.values(formData.enrollment || {}).filter(value => value > 0).length;
      if (enrollmentFields > 0) filledFields++;

      const taxStatusSelected = Object.values(formData.tax_status || {}).some(value => value === true);
      if (taxStatusSelected) filledFields++;

      const percent = Math.round((filledFields / (requiredFields.length + 2)) * 100);
      let status = 'Not Started';
      if (percent === 100) status = 'Completed';
      else if (percent > 0) status = 'In Progress';

      setCompletionStatus({ percent, status });
    };

    calculateProgress();
  }, [formData]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Don't render the form if not authenticated
  if (!user) {
    return null;
  }

  // Update the handleInputChange function to handle null values
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested fields (if name contains dots)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : (value || '')
          }
        };
        saveFormData(newData);
        return newData;
      });
    } else {
      // Handle regular fields
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: type === 'checkbox' ? checked : (value || '')
        };
        saveFormData(newData);
        return newData;
      });
    }
  };

  // Update the handleSubmit function to use the new error dialog
  const handleSubmit = async () => {
    // Check all required fields
    const missingFields = [];
    const requiredFieldsByStep = {
      1: [
        { field: 'school_name', label: 'School Name' },
        { field: 'county', label: 'County' },
        { field: 'district', label: 'District' },
        { field: 'is_full_time_private', label: 'Full-time Private School' },
        { field: 'school_type', label: 'School Type' },
        { field: 'special_education', label: 'Special Education' },
        { field: 'high_school_diploma', label: 'High School Diploma' },
        { field: 'low_grade', label: 'Low Grade' },
        { field: 'high_grade', label: 'High Grade' },
        { field: 'classification', label: 'Classification' }
      ],
      2: [
        { field: 'physical_street', label: 'Physical Street Address' },
        { field: 'physical_city', label: 'Physical City' },
        { field: 'physical_state', label: 'Physical State' },
        { field: 'physical_zip', label: 'Physical ZIP Code' }
      ],
      3: [
        { field: 'phone', label: 'Phone Number' },
        { field: 'primary_email', label: 'Primary Email' }
      ],
      4: [
        ...(formData.name_changed === true || formData.name_changed === 'true' ? [{ field: 'previous_name', label: 'Previous School Name' }] : []),
        ...(formData.district_changed === true || formData.district_changed === 'true' ? [{ field: 'previous_district', label: 'Previous District Name' }] : [])
      ],
      5: [
        { field: 'youngest_years', label: 'Youngest Student Age (Years)' },
        { field: 'youngest_months', label: 'Youngest Student Age (Months)' },
        { field: 'oldest_years', label: 'Oldest Student Age (Years)' },
        { field: 'enrollment', label: 'Grade Level Enrollment' }
      ],
      6: [
        { field: 'site_admin_first_name', label: 'Site Administrator First Name' },
        { field: 'site_admin_last_name', label: 'Site Administrator Last Name' },
        { field: 'site_admin_title', label: 'Site Administrator Title' },
        { field: 'site_admin_phone', label: 'Site Administrator Phone' },
        { field: 'site_admin_email', label: 'Site Administrator Email' }
      ],
      7: [
        { 
          field: 'records_contact_name', 
          label: 'Records Contact Name',
          validate: (data) => data.records_contact_name || (data.site_admin_first_name && data.site_admin_last_name)
        },
        { 
          field: 'records_contact_phone', 
          label: 'Records Contact Phone',
          validate: (data) => data.records_contact_phone || data.site_admin_phone
        },
        { 
          field: 'records_contact_email', 
          label: 'Records Contact Email',
          validate: (data) => data.records_contact_email || data.site_admin_email
        }
      ],
      8: [
        { field: 'tax_status', label: 'Tax Status' }
      ],
      9: [
        { field: 'statutory_acknowledgment', label: 'Statutory Acknowledgment' }
      ]
    };

    // Check each step's required fields
    Object.entries(requiredFieldsByStep).forEach(([step, fields]) => {
      fields.forEach(({ field, label, validate }) => {
        let value;
        if (validate) {
          // Use custom validation if provided
          value = validate(formData);
        } else if (field === 'enrollment') {
          // Check if at least one enrollment field has a value
          value = Object.values(formData.enrollment || {}).some(val => val > 0);
        } else if (field === 'tax_status') {
          // Check if at least one tax status is selected
          value = Object.values(formData.tax_status || {}).some(val => val === true);
        } else if (field.includes('.')) {
          const [parent, child] = field.split('.');
          value = formData[parent]?.[child];
        } else {
          value = formData[field];
        }

        // Special handling for name_changed and district_changed fields
        if (field === 'name_changed' || field === 'district_changed') {
          // These fields are valid if they are either true or false
          value = formData[field] !== undefined && formData[field] !== null && formData[field] !== '';
        }

        if (!value && value !== false) {
          missingFields.push({
            field: label,
            step: `Step ${step}: ${tabs[parseInt(step) - 1].title}`
          });
        }
      });
    });

    // Special validation for Step 4 radio button selections
    const step4RadioValidation = [
      { field: 'name_changed', label: 'School Name Change Status' },
      { field: 'district_changed', label: 'District Change Status' }
    ];

    step4RadioValidation.forEach(({ field, label }) => {
      const value = formData[field];
      if (value !== true && value !== false && value !== 'true' && value !== 'false') {
        missingFields.push({
          field: label,
          step: `Step 4: ${tabs[3].title}`
        });
      }
    });

    if (missingFields.length > 0) {
      // Group missing fields by step
      const groupedMissingFields = missingFields.reduce((acc, item) => {
        const step = item.step;
        if (!acc[step]) {
          acc[step] = [];
        }
        acc[step].push(item.field);
        return acc;
      }, {});

      setErrorDialog({
        open: true,
        missingFields: groupedMissingFields
      });
      return;
    }

    // If all required fields are filled, proceed with submission
    setOpenSignatureDialog(true);
  };

  const handleSignAndSubmit = async () => {
    try {
      setIsSaving(true);
      const finalFormData = { ...formData };

      // Submit PSA data
      const { data: submissionData, error: submissionError } = await supabase
        .from('psa_submissions')
        .insert([
          {
            user_id: user.id,
            school_year: '2024-2025',
            submission_name: finalFormData.school_name,
            status: 'submitted',
            psa_data: finalFormData,
          }
        ])
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Send confirmation emails
      const { success: emailSuccess } = await sendPSAEmail();
      if (!emailSuccess) {
        toast.warning('PSA submitted successfully, but confirmation email may be delayed');
      } else {
        toast.success('PSA submitted successfully!');
      }

      setIsSaving(false);
      
      // Navigate back to compliance page
      navigate('/state-compliance-filing');
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSaving(false);
      toast.error('Failed to submit PSA');
    }
  };

  const counties = [
    "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", 
    "Contra Costa", "Del Norte", "El Dorado", "Fresno", "Glenn", 
    "Humboldt", "Imperial", "Inyo", "Kern", "Kings", "Lake", "Lassen", 
    "Los Angeles", "Madera", "Marin", "Mariposa", "Mendocino", "Merced", 
    "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange", "Placer", 
    "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino", 
    "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", 
    "San Mateo", "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", 
    "Sierra", "Siskiyou", "Solano", "Sonoma", "Stanislaus", "Sutter", 
    "Tehama", "Trinity", "Tulare", "Tuolumne", "Ventura", "Yolo", "Yuba"
  ];

  const grades = [
    "Kindergarten", "Grade One", "Grade Two", "Grade Three", "Grade Four",
    "Grade Five", "Grade Six", "Grade Seven", "Grade Eight", "Grade Nine",
    "Grade Ten", "Grade Eleven", "Grade Twelve"
  ];

  const classifications = [
    "Non-Religious", "Anglican", "Apostolic", "Assembly of God", "Baha'i Faith",
    "Baptist", "Buddhist", "Calvary Chapel", "Charismatic", "Catholic",
    "Chinese Folk/Confucians", "Christian Church (Disciples of Christ)",
    "Christian Science", "Church of Christ", "Church of God",
    "Church of the Brethren", "Church of the Nazarene", "Covenant",
    "Episcopal", "Evangelical", "Four Square Gospel", "Fundamentalist Christian",
    "Hindu", "Interdenominational", "Islamic (Muslim)", "Jehovah's Witnesses",
    "Jewish", "Mormon (Latter-day Saints)", "Lutheran", "Messianic Judaism",
    "Mennonite", "Methodist", "Native American", "New Age", "Nondenominational",
    "Orthodox (Eastern/Greek)", "Other", "Pentecostal", "Presbyterian",
    "Quaker (Friends)", "Reformed", "Scientology", "Seventh-day Adventist",
    "Shinto", "Sikh", "Taoist", "Unitarian (Universalist)", "Vietnamese Folk",
    "Wesleyan"
  ];

  const titles = [
    "Administrator",
    "Principal",
    "Director",
    "Head of School",
    "Superintendent",
    "Owner",
    "President",
    "Other"
  ];

  const securityQuestions = [
    "What is your favorite color?",
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "In what city were you born?",
    "What was your first car?",
    "What elementary school did you attend?",
    "What is your favorite book?",
    "What is your favorite movie?",
  ];

  const tabs = [
    { id: 1, title: "School Information", step: "Step 1" },
    { id: 2, title: "School Address", step: "Step 2" },
    { id: 3, title: "Contact Information", step: "Step 3" },
    { id: 4, title: "Prior Year Changes", step: "Step 4" },
    { id: 5, title: "Statistical Information", step: "Step 5" },
    { id: 6, title: "Administrative Staff", step: "Step 6" },
    { id: 7, title: "School Records", step: "Step 7" },
    { id: 8, title: "Tax Status", step: "Step 8" },
    { id: 9, title: "Acknowledgment", step: "Step 9" },
    { id: 10, title: "Review & Submit", step: "Step 10" }
  ];

  const handleCopyAddress = () => {
    if (formData.usePhysicalForMailing) {
      setFormData(prev => ({
        ...prev,
        mailingStreet: prev.physicalStreet,
        mailingCity: prev.physicalCity,
        mailingState: prev.physicalState,
        mailingZip: prev.physicalZip,
        mailingZip4: prev.physicalZip4,
      }));
    }
  };

  const handleCopyAdminInfo = () => {
    if (formData.useSiteAdminForDirector) {
      setFormData(prev => ({
        ...prev,
        directorSalutation: prev.siteAdminSalutation,
        directorFirstName: prev.siteAdminFirstName,
        directorLastName: prev.siteAdminLastName,
        directorPosition: prev.siteAdminTitle,
        directorPhone: prev.siteAdminPhone,
        directorExtension: prev.siteAdminExtension,
        directorEmail: prev.siteAdminEmail,
        directorStreet: prev.siteAdminStreet,
        directorCity: prev.siteAdminCity,
        directorState: prev.siteAdminState,
        directorZip: prev.siteAdminZip,
        directorZip4: prev.siteAdminZip4,
      }));
    }
  };

  const handleCopyCustodianAddress = () => {
    if (formData.useCustodianAddress) {
      setFormData(prev => ({
        ...prev,
        recordsStreet: prev.custodianStreet,
        recordsCity: prev.custodianCity,
        recordsState: prev.custodianState,
        recordsZip: prev.custodianZip,
        recordsZip4: prev.custodianZip4,
      }));
    }
  };

  const handleTaxStatusChange = (field) => {
    setFormData(prev => ({
      ...prev,
      tax_status: {
        ...prev.tax_status,
        [field]: !prev.tax_status[field],
        none: false // Uncheck "none" if any other option is selected
      }
    }));
  };

  const handleNoneSelected = () => {
    setFormData(prev => ({
      ...prev,
      tax_status: {
        section501c3: false,
        section23701d: false,
        section214: false,
        none: !prev.tax_status.none
      }
    }));
  };

  const calculateTotalEnrollment = () => {
    if (!formData.enrollment) return 0;
    return Object.values(formData.enrollment).reduce(
      (total, current) => total + parseInt(current || 0), 0
    );
  };

  const calculateTotalStaff = (data = formData) => {
    return (
      parseInt(data.full_time_teachers || 0) +
      parseInt(data.part_time_teachers || 0) +
      parseInt(data.administrators || 0) +
      parseInt(data.other_staff || 0)
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 1:
        return (
          <div style={styles.section}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Full-time Private School', true)}
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="is_full_time_private"
                      value="yes"
                      checked={formData.is_full_time_private === 'yes'}
                      onChange={handleInputChange}
                      required
                    /> Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="is_full_time_private"
                      value="no"
                      checked={formData.is_full_time_private === 'no'}
                      onChange={handleInputChange}
                      required
                    /> No
                  </label>
                </div>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Name of School', true)}
                <input
                  type="text"
                  name="school_name"
                  value={formData.school_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('County', true)}
                <select
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select County</option>
                  {counties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('District', true)}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                  <Tooltip title="Don't know your school district? No worries! Click here to look it up!">
                    <IconButton 
                      onClick={() => window.open('https://www.greatschools.org/school-district-boundaries-map/', '_blank')}
                      size="small"
                      style={{ marginLeft: '8px' }}
                    >
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('School Type', true)}
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="school_type"
                      value="coeducational"
                      checked={formData.school_type === 'coeducational'}
                      onChange={handleInputChange}
                      required
                    /> Coeducational
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="school_type"
                      value="boysOnly"
                      checked={formData.school_type === 'boysOnly'}
                      onChange={handleInputChange}
                    /> Boys Only
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="school_type"
                      value="girlsOnly"
                      checked={formData.school_type === 'girlsOnly'}
                      onChange={handleInputChange}
                    /> Girls Only
                  </label>
                </div>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('School Accommodations', true)}
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="accommodations"
                      value="dayOnly"
                      checked={formData.accommodations === 'dayOnly'}
                      onChange={handleInputChange}
                      required
                    /> Day Only
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="accommodations"
                      value="residentialOnly"
                      checked={formData.accommodations === 'residentialOnly'}
                      onChange={handleInputChange}
                    /> Residential Boarding Only
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="accommodations"
                      value="both"
                      checked={formData.accommodations === 'both'}
                      onChange={handleInputChange}
                    /> Both
                  </label>
                </div>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Does the school provide special education?', true)}
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="special_education"
                      value="yes"
                      checked={formData.special_education === 'yes'}
                      onChange={handleInputChange}
                      required
                    /> Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="special_education"
                      value="no"
                      checked={formData.special_education === 'no'}
                      onChange={handleInputChange}
                    /> No
                  </label>
                </div>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Does the school provide a high school diploma?', true)}
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="high_school_diploma"
                      value="yes"
                      checked={formData.high_school_diploma === 'yes'}
                      onChange={handleInputChange}
                      required
                    /> Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="high_school_diploma"
                      value="no"
                      checked={formData.high_school_diploma === 'no'}
                      onChange={handleInputChange}
                    /> No
                  </label>
                </div>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Low Grade', true)}
                <select
                  name="low_grade"
                  value={formData.low_grade}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">-- Select --</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('High Grade', true)}
                <select
                  name="high_grade"
                  value={formData.high_grade}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">-- Select --</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Classification of school', true)}
                <select
                  name="classification"
                  value={formData.classification}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">-- Select --</option>
                  {classifications.map(classification => (
                    <option key={classification} value={classification}>
                      {classification}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        );
      case 2:
        return (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>School Address</h2>
            
            <h3 style={styles.subSectionTitle}>Physical Address</h3>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Street', true)}
                <input
                  type="text"
                  name="physical_street"
                  value={formData.physical_street}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('City', true)}
                <input
                  type="text"
                  name="physical_city"
                  value={formData.physical_city}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('State', true)}
                <input
                  type="text"
                  name="physical_state"
                  value={formData.physical_state}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('ZIP', true)}
                <input
                  type="text"
                  name="physical_zip"
                  value={formData.physical_zip}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  pattern="[0-9]{5}"
                />
              </label>
            </div>

            <h3 style={styles.subSectionTitle}>Mailing Address</h3>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Street', true)}
                <input
                  type="text"
                  name="mailing_street"
                  value={formData.mailing_street}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('City', true)}
                <input
                  type="text"
                  name="mailing_city"
                  value={formData.mailing_city}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('State', true)}
                <input
                  type="text"
                  name="mailing_state"
                  value={formData.mailing_state}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('ZIP', true)}
                <input
                  type="text"
                  name="mailing_zip"
                  value={formData.mailing_zip}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  pattern="[0-9]{5}"
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Fax Number:
                <input
                  type="tel"
                  name="fax_number"
                  value={formData.fax_number}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Primary Email:
                <input
                  type="email"
                  name="primary_email"
                  value={formData.primary_email}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Website:
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contact Information</h2>
            {/* Step 3 content */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Phone', true)}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  title="Please enter a valid phone number in format: 123-456-7890"
                  placeholder="123-456-7890"
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Fax Number:
                <input
                  type="tel"
                  name="fax_number"
                  value={formData.fax_number}
                  onChange={handleInputChange}
                  style={styles.input}
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  title="Please enter a valid fax number in format: 123-456-7890"
                  placeholder="123-456-7890"
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Primary Email:
                <input
                  type="email"
                  name="primary_email"
                  value={formData.primary_email}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="school@example.com"
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Website:
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="https://www.example.com"
                  pattern="https?://.+"
                  title="Please include http:// or https:// in your URL"
                />
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>School Changes</h2>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Has the school\'s name changed since last year\'s filing?', true)}
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="name_changed"
                      value="true"
                      checked={formData.name_changed === true || formData.name_changed === 'true'}
                      onChange={() => {
                        const newData = {
                          ...formData,
                          name_changed: true,
                          previous_name: formData.previous_name || ''
                        };
                        setFormData(newData);
                        saveFormData({
                          ...newData,
                          name_changed: 'true'
                        });
                      }}
                      required
                    /> Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="name_changed"
                      value="false"
                      checked={formData.name_changed === false || formData.name_changed === 'false'}
                      onChange={() => {
                        const newData = {
                          ...formData,
                          name_changed: false,
                          previous_name: ''
                        };
                        setFormData(newData);
                        saveFormData({
                          ...newData,
                          name_changed: 'false'
                        });
                      }}
                      required
                    /> No
                  </label>
                </div>
              </label>
            </div>

            {(formData.name_changed === true || formData.name_changed === 'true') && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {renderLabel('Enter the name that the school last filed under:', true)}
                  <input
                    type="text"
                    name="previous_name"
                    value={formData.previous_name}
                    onChange={(e) => {
                      const newData = {
                        ...formData,
                        previous_name: e.target.value
                      };
                      setFormData(newData);
                      saveFormData(newData);
                    }}
                    style={styles.input}
                    required
                  />
                </label>
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Has the school\'s district changed since last year\'s filing?', true)}
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="district_changed"
                      value="true"
                      checked={formData.district_changed === true || formData.district_changed === 'true'}
                      onChange={() => {
                        const newData = {
                          ...formData,
                          district_changed: true,
                          previous_district: formData.previous_district || ''
                        };
                        setFormData(newData);
                        saveFormData({
                          ...newData,
                          district_changed: 'true'
                        });
                      }}
                      required
                    /> Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="district_changed"
                      value="false"
                      checked={formData.district_changed === false || formData.district_changed === 'false'}
                      onChange={() => {
                        const newData = {
                          ...formData,
                          district_changed: false,
                          previous_district: ''
                        };
                        setFormData(newData);
                        saveFormData({
                          ...newData,
                          district_changed: 'false'
                        });
                      }}
                      required
                    /> No
                  </label>
                </div>
              </label>
            </div>

            {(formData.district_changed === true || formData.district_changed === 'true') && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {renderLabel('Enter the district that the school last filed under:', true)}
                  <input
                    type="text"
                    name="previous_district"
                    value={formData.previous_district}
                    onChange={(e) => {
                      const newData = {
                        ...formData,
                        previous_district: e.target.value
                      };
                      setFormData(newData);
                      saveFormData(newData);
                    }}
                    style={styles.input}
                    required
                  />
                </label>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div style={styles.section}>
            <h3 style={styles.subSectionTitle}>Student Ages</h3>
            <p style={styles.sectionDescription}>
              Report the age range of the students enrolled in kindergarten through grade twelve. 
              Note, the youngest age may not be younger than 4 years and 9 months old.
            </p>
            
            <div style={styles.ageInputGroup}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {renderLabel('Youngest Years', true)}
                  <input
                    type="number"
                    name="youngest_years"
                    value={formData.youngest_years}
                    onChange={handleInputChange}
                    style={styles.numberInput}
                    min="4"
                    max="21"
                    required
                  />
                </label>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {renderLabel('Youngest Months', true)}
                  <input
                    type="number"
                    name="youngest_months"
                    value={formData.youngest_months}
                    onChange={handleInputChange}
                    style={styles.numberInput}
                    min="0"
                    max="11"
                    required
                  />
                </label>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {renderLabel('Oldest Years', true)}
                  <input
                    type="number"
                    name="oldest_years"
                    value={formData.oldest_years}
                    onChange={handleInputChange}
                    style={styles.numberInput}
                    min="4"
                    max="21"
                    required
                  />
                </label>
              </div>
            </div>

            <h3 style={styles.subSectionTitle}>Enrollment</h3>
            <p style={styles.sectionDescription}>
              Report the number of students enrolled in each grade level on or around the date 
              the affidavit is filed. Do not include pre-school enrollment; schools that only 
              offer preschool should not file an affidavit.
            </p>

            <div style={styles.enrollmentGrid}>
              {[
                { key: 'kindergarten', label: 'Kindergarten', number: '37' },
                { key: 'grade1', label: 'Grade 1', number: '38' },
                { key: 'grade2', label: 'Grade 2', number: '39' },
                { key: 'grade3', label: 'Grade 3', number: '40' },
                { key: 'grade4', label: 'Grade 4', number: '41' },
                { key: 'grade5', label: 'Grade 5', number: '42' },
                { key: 'grade6', label: 'Grade 6', number: '43' },
                { key: 'grade7', label: 'Grade 7', number: '44' },
                { key: 'grade8', label: 'Grade 8', number: '45' },
                { key: 'grade9', label: 'Grade 9', number: '46' },
                { key: 'grade10', label: 'Grade 10', number: '47' },
                { key: 'grade11', label: 'Grade 11', number: '48' },
                { key: 'grade12', label: 'Grade 12', number: '49' }
              ].map(({ key, label, number }) => (
                <div key={key} style={styles.fieldGroup}>
                  <label style={styles.label}>
                    {label}:
                    <input
                      type="number"
                      name={`enrollment.${key}`}
                      value={formData.enrollment[key]}
                      onChange={handleInputChange}
                      style={styles.numberInput}
                      min="0"
                      required
                    />
                  </label>
                </div>
              ))}
            </div>

            <div style={styles.totalEnrollment}>
              Total Enrollment Count: {calculateTotalEnrollment()}
            </div>

            <h3 style={styles.subSectionTitle}>Graduates</h3>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Report the number of students who graduated from twelfth grade in the previous school year', true)}
                <input
                  type="number"
                  name="previous_year_graduates"
                  value={formData.previous_year_graduates}
                  onChange={handleInputChange}
                  style={styles.numberInput}
                  min="0"
                  required
                />
              </label>
            </div>

            <h3 style={styles.subSectionTitle}>Number of Staff</h3>
            <p style={styles.sectionDescription}>
              Report the number of staff employed by the school.
            </p>

            <div style={styles.staffGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Full-time Teachers:
                  <input
                    type="number"
                    name="full_time_teachers"
                    value={formData.full_time_teachers}
                    onChange={handleInputChange}
                    style={styles.numberInput}
                    min="0"
                    required
                  />
                </label>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Part-time Teachers:
                  <input
                    type="number"
                    name="part_time_teachers"
                    value={formData.part_time_teachers}
                    onChange={handleInputChange}
                    style={styles.numberInput}
                    min="0"
                    required
                  />
                </label>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Administrators:
                  <input
                    type="number"
                    name="administrators"
                    value={formData.administrators}
                    onChange={handleInputChange}
                    style={styles.numberInput}
                    min="0"
                    required
                  />
                </label>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Other Staff:
                  <input
                    type="number"
                    name="other_staff"
                    value={formData.other_staff}
                    onChange={handleInputChange}
                    style={styles.numberInput}
                    min="0"
                    required
                  />
                </label>
              </div>
            </div>

            <div style={styles.totalStaff}>
              Total Staff Count: {calculateTotalStaff()}
            </div>
          </div>
        );
      case 6:
        return (
          <div style={styles.section}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Salutation', true)}
                <select
                  name="site_admin_salutation"
                  value={formData.site_admin_salutation}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="">Select Salutation</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('First Name', true)}
                <input
                  type="text"
                  name="site_admin_first_name"
                  value={formData.site_admin_first_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Last Name', true)}
                <input
                  type="text"
                  name="site_admin_last_name"
                  value={formData.site_admin_last_name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Title', true)}
                <input
                  type="text"
                  name="site_admin_title"
                  value={formData.site_admin_title}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Phone', true)}
                <input
                  type="tel"
                  name="site_admin_phone"
                  value={formData.site_admin_phone}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Extension:
                <input
                  type="text"
                  name="site_admin_extension"
                  value={formData.site_admin_extension}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Email', true)}
                <input
                  type="email"
                  name="site_admin_email"
                  value={formData.site_admin_email}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Street', true)}
                <input
                  type="text"
                  name="site_admin_street"
                  value={formData.site_admin_street}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('City', true)}
                <input
                  type="text"
                  name="site_admin_city"
                  value={formData.site_admin_city}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('State', true)}
                <input
                  type="text"
                  name="site_admin_state"
                  value={formData.site_admin_state}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('ZIP', true)}
                <input
                  type="text"
                  name="site_admin_zip"
                  value={formData.site_admin_zip}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  pattern="[0-9]{5}"
                />
              </label>
            </div>
          </div>
        );
      case 7: // Step 8
        return (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Records Contact Information</h2>
            <p style={styles.sectionDescription}>
              Enter the contact information for the person responsible for maintaining school records.
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Contact Name', true)}
                <input
                  type="text"
                  name="records_contact_name"
                  value={formData.records_contact_name || `${formData.site_admin_first_name} ${formData.site_admin_last_name}`}
                  onChange={(e) => {
                    const newData = {
                      ...formData,
                      records_contact_name: e.target.value || `${formData.site_admin_first_name} ${formData.site_admin_last_name}`
                    };
                    setFormData(newData);
                    saveFormData(newData);
                  }}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Phone', true)}
                <input
                  type="tel"
                  name="records_contact_phone"
                  value={formData.records_contact_phone || formData.site_admin_phone}
                  onChange={(e) => {
                    const newData = {
                      ...formData,
                      records_contact_phone: e.target.value || formData.site_admin_phone
                    };
                    setFormData(newData);
                    saveFormData(newData);
                  }}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Email', true)}
                <input
                  type="email"
                  name="records_contact_email"
                  value={formData.records_contact_email || formData.site_admin_email}
                  onChange={(e) => {
                    const newData = {
                      ...formData,
                      records_contact_email: e.target.value || formData.site_admin_email
                    };
                    setFormData(newData);
                    saveFormData(newData);
                  }}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <h3 style={styles.subSectionTitle}>Records Location</h3>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('Street', true)}
                <input
                  type="text"
                  name="records_street"
                  value={formData.records_street || formData.site_admin_street}
                  onChange={(e) => {
                    const newData = {
                      ...formData,
                      records_street: e.target.value || formData.site_admin_street
                    };
                    setFormData(newData);
                    saveFormData(newData);
                  }}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('City', true)}
                <input
                  type="text"
                  name="records_city"
                  value={formData.records_city || formData.site_admin_city}
                  onChange={(e) => {
                    const newData = {
                      ...formData,
                      records_city: e.target.value || formData.site_admin_city
                    };
                    setFormData(newData);
                    saveFormData(newData);
                  }}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('State', true)}
                <input
                  type="text"
                  name="records_state"
                  value={formData.records_state || formData.site_admin_state}
                  onChange={(e) => {
                    const newData = {
                      ...formData,
                      records_state: e.target.value || formData.site_admin_state
                    };
                    setFormData(newData);
                    saveFormData(newData);
                  }}
                  style={styles.input}
                  required
                />
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {renderLabel('ZIP', true)}
                <input
                  type="text"
                  name="records_zip"
                  value={formData.records_zip || formData.site_admin_zip}
                  onChange={(e) => {
                    const newData = {
                      ...formData,
                      records_zip: e.target.value || formData.site_admin_zip
                    };
                    setFormData(newData);
                    saveFormData(newData);
                  }}
                  style={styles.input}
                  required
                  pattern="[0-9]{5}"
                />
              </label>
            </div>
          </div>
        );
      case 8: // Step 9
        return (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Tax Status</h2>
            <p style={styles.sectionDescription}>
              Indicate which tax exemption(s) apply to the school. Note: This section is to help identify incorporated, nonprofit, tax exempt schools. If the school is not confirmed by the federal or state governments as nonprofit/tax exempt, which includes homeschools in almost every case, select "None of the above."
            </p>

            <div style={styles.fieldGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="tax_status.section501c3"
                  checked={formData.tax_status?.section501c3}
                  onChange={() => handleTaxStatusChange('section501c3')}
                />
                Section 501(c)(3) of the Internal Revenue Code
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="tax_status.section23701d"
                  checked={formData.tax_status?.section23701d}
                  onChange={() => handleTaxStatusChange('section23701d')}
                />
                Section 23701d of the California Revenue and Taxation Code
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="tax_status.section214"
                  checked={formData.tax_status?.section214}
                  onChange={() => handleTaxStatusChange('section214')}
                />
                Section 214 of the California Revenue and Taxation Code
              </label>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="tax_status.none"
                  checked={formData.tax_status?.none}
                  onChange={handleNoneSelected}
                />
                None of the above
              </label>
            </div>
          </div>
        );
      case 9:
        return (
          <div style={styles.section}>
            <p style={styles.sectionDescription}>
              Please read and acknowledge the following:
            </p>

            <div style={styles.noticesList}>
              <ul style={styles.bulletList}>
                <li>All Private School Affidavits are public documents viewable by the public.</li>
                
                <li>The Private School Affidavit must be filed by persons, firms, associations, partnerships, 
                or corporations offering or conducting full-time day school at the elementary or high school 
                level for students between the ages of six and eighteen years of age.</li>
                
                <li>Preschools should contact the Community Care Licensing Division (CCLD) of the California 
                Department of Social Services. Contact CCLD at 916-229-4530 or contact a regional office.</li>
                
                <li>The Affidavit is not a license or authorization to operate a private school.</li>
                
                <li>The Private School Affidavit does not indicate approval, recognition, or endorsement by 
                the state. Filing of this Affidavit shall not be interpreted to mean, and it shall be unlawful 
                for any school to expressly or impliedly represent by any means whatsoever, that the State of 
                California, the Superintendent of Public Instruction, the State Board of Education, the CDE, or 
                any division or bureau of the Department, or any accrediting agency has made any evaluation, 
                recognition, approval, or endorsement of the school or course unless this is an actual fact.</li>
                
                <li>Private school authorities are responsible for initiating contact with the appropriate local 
                authorities (city and/or county) regarding compliance with ordinances governing health, safety 
                and fire standards, business licensing, and zoning requirements applicable to private schools.</li>
                
                <li>When a school ceases operation, every effort shall be made to give a copy of pupils' permanent 
                records to parents or guardians. If records cannot be given to the parents or guardians, it is 
                recommended that the school's custodian of records retain the records permanently so that former 
                pupils may obtain copies when needed for future education, employment, or other purposes.</li>
                
                <li>You shall retain a copy of this document for a period of three years.</li>
                
                <li>A private school shall not employ a person who has been convicted of a violent or serious 
                felony or a person who would be prohibited from employment by a public school district pursuant 
                to EC Section 44237. This school is in compliance with EC Section 44237 to the extent that it applies.</li>
                
                <li>The students enrolled in this private school and included in the school's enrollment total 
                are full-time students in this school and are not enrolled in any other public or private 
                elementary or secondary school on a full-time basis.</li>
              </ul>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="statutory_acknowledgment"
                  checked={formData.statutory_acknowledgment}
                  onChange={(e) => {
                    handleInputChange({
                      target: {
                        name: 'statutory_acknowledgment',
                        value: e.target.checked
                      }
                    });
                  }}
                  required
                />
                I acknowledge that I have read and understand the above Statutory Notices and assure 
                the school's compliance.
              </label>
            </div>
          </div>
        );
      case 10: // Step 10 - Review & Submit
        return (
          <div style={styles.reviewContainer}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ 
                fontSize: '1.75rem', 
                color: '#1a202c', 
                marginBottom: '1rem',
                fontWeight: '600' 
              }}>
                Review Your PSA Submission
              </h2>
              <p style={{ 
                color: '#4a5568',
                fontSize: '1.1rem',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Please carefully review all information before submitting. Make sure all required fields are filled out correctly.
              </p>
            </div>

            {/* School Information */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 1: School Information</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Full-time Private School</span>
                <span style={styles.reviewValue}>{formData.is_full_time_private ? 'Yes' : 'No'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>School Name</span>
                <span style={styles.reviewValue}>{formData.school_name || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>County</span>
                <span style={styles.reviewValue}>{formData.county || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>District</span>
                <span style={styles.reviewValue}>{formData.district || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>School Type</span>
                <span style={styles.reviewValue}>{formData.school_type || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Special Education</span>
                <span style={styles.reviewValue}>{formData.special_education || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>High School Diploma</span>
                <span style={styles.reviewValue}>{formData.high_school_diploma || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Grade Range</span>
                <span style={styles.reviewValue}>
                  {formData.low_grade && formData.high_grade 
                    ? `${formData.low_grade} to ${formData.high_grade}`
                    : 'Not specified'}
                </span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Classification</span>
                <span style={styles.reviewValue}>{formData.classification || 'Not specified'}</span>
              </div>
            </div>

            {/* School Address */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 2: School Address</h4>
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ 
                  fontSize: '1.1rem', 
                  color: '#4a5568', 
                  marginBottom: '1rem',
                  fontWeight: '500'
                }}>Physical Address</h5>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Street Address</span>
                  <span style={styles.reviewValue}>{formData.physical_street || 'Not specified'}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>City</span>
                  <span style={styles.reviewValue}>{formData.physical_city || 'Not specified'}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>State</span>
                  <span style={styles.reviewValue}>{formData.physical_state || 'Not specified'}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>ZIP Code</span>
                  <span style={styles.reviewValue}>
                    {formData.physical_zip}
                    {formData.physical_zip4 ? `-${formData.physical_zip4}` : ''}
                  </span>
                </div>
              </div>

              <div>
                <h5 style={{ 
                  fontSize: '1.1rem', 
                  color: '#4a5568', 
                  marginBottom: '1rem',
                  fontWeight: '500'
                }}>Mailing Address</h5>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Street Address</span>
                  <span style={styles.reviewValue}>{formData.mailing_street || 'Same as physical address'}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>City</span>
                  <span style={styles.reviewValue}>{formData.mailing_city || 'Same as physical address'}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>State</span>
                  <span style={styles.reviewValue}>{formData.mailing_state || 'Same as physical address'}</span>
                </div>
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>ZIP Code</span>
                  <span style={styles.reviewValue}>
                    {formData.mailing_zip}
                    {formData.mailing_zip4 ? `-${formData.mailing_zip4}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 3: Contact Information</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Phone Number</span>
                <span style={styles.reviewValue}>{formData.phone || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Fax Number</span>
                <span style={styles.reviewValue}>{formData.fax_number || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Primary Email</span>
                <span style={styles.reviewValue}>{formData.primary_email || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Website</span>
                <span style={styles.reviewValue}>{formData.website || 'Not specified'}</span>
              </div>
            </div>

            {/* Prior Year Changes */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 4: Prior Year Changes</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>School Name Changed</span>
                <span style={styles.reviewValue}>{formData.name_changed ? 'Yes' : 'No'}</span>
              </div>
              {formData.name_changed && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Previous Name</span>
                  <span style={styles.reviewValue}>{formData.previous_name || 'Not specified'}</span>
                </div>
              )}
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>District Changed</span>
                <span style={styles.reviewValue}>{formData.district_changed ? 'Yes' : 'No'}</span>
              </div>
              {formData.district_changed && (
                <div style={styles.reviewItem}>
                  <span style={styles.reviewLabel}>Previous District</span>
                  <span style={styles.reviewValue}>{formData.previous_district || 'Not specified'}</span>
                </div>
              )}
            </div>

            {/* Statistical Information */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 5: Statistical Information</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Student Age Range</span>
                <span style={styles.reviewValue}>
                  {`${formData.youngest_years} years ${formData.youngest_months} months to ${formData.oldest_years} years`}
                </span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Total Enrollment</span>
                <span style={styles.reviewValue}>{calculateTotalEnrollment()}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Previous Year Graduates</span>
                <span style={styles.reviewValue}>{formData.previous_year_graduates || '0'}</span>
              </div>
              
              <h5 style={{ 
                fontSize: '1.1rem', 
                color: '#4a5568', 
                margin: '1.5rem 0 1rem',
                fontWeight: '500'
              }}>Staff Information</h5>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Full-time Teachers</span>
                <span style={styles.reviewValue}>{formData.full_time_teachers || '0'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Part-time Teachers</span>
                <span style={styles.reviewValue}>{formData.part_time_teachers || '0'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Administrators</span>
                <span style={styles.reviewValue}>{formData.administrators || '0'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Other Staff</span>
                <span style={styles.reviewValue}>{formData.other_staff || '0'}</span>
              </div>
              <div style={styles.reviewTotal}>
                <span style={styles.reviewLabel}>Total Staff</span>
                <span style={styles.reviewValue}>{calculateTotalStaff()}</span>
              </div>
            </div>

            {/* Site Administrator */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 6: Administrative Staff</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Name</span>
                <span style={styles.reviewValue}>
                  {`${formData.site_admin_salutation || ''} ${formData.site_admin_first_name || ''} ${formData.site_admin_last_name || ''}`}
                </span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Title</span>
                <span style={styles.reviewValue}>{formData.site_admin_title || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Phone</span>
                <span style={styles.reviewValue}>
                  {formData.site_admin_phone}
                  {formData.site_admin_extension ? ` ext. ${formData.site_admin_extension}` : ''}
                </span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Email</span>
                <span style={styles.reviewValue}>{formData.site_admin_email || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Address</span>
                <span style={styles.reviewValue}>
                  {[
                    formData.site_admin_street,
                    formData.site_admin_city,
                    formData.site_admin_state,
                    formData.site_admin_zip && `${formData.site_admin_zip}${formData.site_admin_zip4 ? `-${formData.site_admin_zip4}` : ''}`
                  ].filter(Boolean).join(', ') || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Records Contact */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 7: School Records</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Contact Name</span>
                <span style={styles.reviewValue}>{formData.records_contact_name || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Phone</span>
                <span style={styles.reviewValue}>{formData.records_contact_phone || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Email</span>
                <span style={styles.reviewValue}>{formData.records_contact_email || 'Not specified'}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Address</span>
                <span style={styles.reviewValue}>
                  {[
                    formData.records_street,
                    formData.records_city,
                    formData.records_state,
                    formData.records_zip
                  ].filter(Boolean).join(', ') || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Tax Status */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 8: Tax Status</h4>
              {formData?.tax_status && typeof formData.tax_status === 'object' && (
                <div>
                  {Object.entries(formData.tax_status).map(([status, isChecked]) => (
                    isChecked && (
                      <div key={status} style={styles.reviewItem}>
                        <span style={styles.reviewLabel}>
                          {status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span style={styles.reviewValue}>Yes</span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Acknowledgment */}
            <div style={styles.reviewSection}>
              <h4 style={styles.reviewSubheading}>Step 9: Acknowledgment</h4>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Statutory Acknowledgment</span>
                <span style={styles.reviewValue}>{formData.statutory_acknowledgment ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div style={styles.finalButtons}>
              <button 
                type="button"
                style={styles.submitAffidavitButton}
                onClick={handleSubmit}
              >
                Submit Affidavit
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Add loading overlay component
  const LoadingOverlay = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            border: '4px solid #00356b',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <h3 style={{ 
            color: '#00356b', 
            marginBottom: '8px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            {submissionProgress.status || 'Submitting PSA...'}
          </h3>
          <p style={{ 
            color: '#4a5568',
            whiteSpace: 'pre-line',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {submissionProgress.details}
          </p>
        </div>
      </div>
    </div>
  );

  // Move sendPSAEmail inside the component
  const sendPSAEmail = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-psa-email', {
        body: {
          userId: user.id,
          email: user.email,
          name: `${formData.site_admin_first_name} ${formData.site_admin_last_name}`,
          state: formData.physical_state || 'CA'
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error sending PSA email:', error);
      return { success: false, error };
    }
  };

  return (
    <div style={styles.container}>
      {loading && <LoadingOverlay />}
      
      {/* Note text bubble */}
      <ImportantNoteCard sx={{ mb: 3 }}>
        This filing is the same that traditional private schools use in the state, and as such, some of the questions may not seem relevant for homeschool families. Please answer all questions to the best of your ability, and don't hesitate to reach out to our support team should you have any questions.
      </ImportantNoteCard>

      {/* Error/Success Message */}
      {message.content && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 2000,
            maxWidth: '500px',
            minWidth: '300px',
          }}
        >
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: '', content: '' })}
            sx={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            {message.content}
          </Alert>
        </Box>
      )}

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              Filing Progress
            </Typography>
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              {completionStatus.percent}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionStatus.percent || 0}
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
      </Box>

      {/* Main Card */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))',
          display: 'flex',
          minHeight: '600px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Left Sidebar */}
        <Box sx={{ 
          width: '300px',
          flexShrink: 0,
          borderRight: '1px solid hsl(var(--border))',
          backgroundColor: 'white',
          borderRadius: '8px 0 0 8px'
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
              Required Steps
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: activeTab === tab.id ? 'hsl(var(--brand-primary-light))' : 'transparent',
                    color: activeTab === tab.id ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
                    '&:hover': {
                      backgroundColor: activeTab === tab.id 
                        ? 'hsla(var(--brand-primary), 0.12)'
                        : 'hsla(var(--brand-primary), 0.04)',
                    },
                    textAlign: 'left',
                    px: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  <Box component="span" sx={{ 
                    mr: 2,
                    color: 'hsl(var(--text-secondary))',
                    fontSize: '0.875rem'
                  }}>
                    {tab.step}
                  </Box>
                  {tab.title}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right Content Area */}
        <Box sx={{ 
          flex: 1,
          p: 4,
          backgroundColor: 'white',
          borderRadius: '0 8px 8px 0'
        }}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {renderTabContent()}
          </form>
        </Box>
      </Box>

      {/* Snackbar */}
      {snackbar.open && (
        <Box sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '8px 16px',
          backgroundColor: snackbar.severity === 'success' ? '#48BB78' : '#F6E05E',
          color: snackbar.severity === 'success' ? 'white' : 'black',
          borderRadius: '4px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          {snackbar.message}
        </Box>
      )}

      {/* Keep Print Preview Dialog */}
      <Dialog
        open={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Print Preview
          <IconButton
            aria-label="close"
            onClick={() => setIsPrintPreviewOpen(false)}
            style={styles.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <PrintPreview formData={formData} calculateTotalStaff={calculateTotalStaff} />
          <div style={styles.previewButtons}>
            <button
              onClick={() => window.print()}
              style={styles.printButton}
            >
              Print
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Dialog */}
      <Dialog
        open={openSignatureDialog}
        onClose={() => setOpenSignatureDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-lg)',
            p: 2
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: 2
          }}>
            <FeatureHeader>Please electronically sign below</FeatureHeader>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              I approve the submission of this affidavit, completed to the best of my ability, and approve YourEDU to submit on my behalf.
            </Typography>
            <TextField
              fullWidth
              label="Full Name"
              value={signature.name}
              onChange={(e) => setSignature({ ...signature, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'hsl(var(--background))',
                  '& fieldset': {
                    borderColor: 'hsl(var(--border))',
                  },
                  '&:hover fieldset': {
                    borderColor: 'hsl(var(--brand-primary))',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={signature.date}
              onChange={(e) => setSignature({ ...signature, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'hsl(var(--background))',
                  '& fieldset': {
                    borderColor: 'hsl(var(--border))',
                  },
                  '&:hover fieldset': {
                    borderColor: 'hsl(var(--brand-primary))',
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenSignatureDialog(false)}
            variant="outlined"
            sx={{ 
              borderColor: '#2563EB',
              color: '#2563EB',
              height: 36,
              '&:hover': {
                borderColor: '#2563EB',
                backgroundColor: 'hsla(var(--brand-primary), 0.1)',
                boxShadow: 'none'
              },
              transition: 'none',
              boxShadow: 'none',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSignAndSubmit}
            variant="contained"
            disabled={!signature.name || !signature.date}
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
              textTransform: 'none',
              '&.Mui-disabled': {
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))'
              }
            }}
          >
            Sign & Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ ...errorDialog, open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-lg)',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          '& .MuiTypography-root': {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#DC2626'
          }
        }}>
          Required Fields Missing
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please complete the following required fields before submitting:
          </Typography>
          <Box sx={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            mb: 2,
            '& ul': {
              listStyleType: 'none',
              padding: 0,
              margin: 0
            }
          }}>
            {Object.entries(errorDialog.missingFields).map(([step, fields]) => (
              <Box key={step} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: '#1A202C',
                  mb: 1 
                }}>
                  {step}
                </Typography>
                <ul>
                  {fields.map((field, index) => (
                    <li key={index} style={{
                      padding: '4px 0',
                      color: '#4B5563',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ marginRight: '8px' }}>•</span>
                      {field}
                    </li>
                  ))}
                </ul>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setErrorDialog({ ...errorDialog, open: false })}
            variant="contained"
            sx={{
              backgroundColor: '#2563EB',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1D4ED8'
              },
              textTransform: 'none',
              px: 4
            }}
          >
            Continue Editing
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Add keyframe animation to styles
const keyframeStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add style tag to head
if (!document.getElementById('psa-keyframes')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'psa-keyframes';
  styleTag.innerHTML = keyframeStyles;
  document.head.appendChild(styleTag);
}

export default CaliforniaPSA; 



