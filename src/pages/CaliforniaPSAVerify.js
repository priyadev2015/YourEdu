import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import { PrintPreview } from './CaliforniaPSA';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '2rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#4a5568',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#2d3748',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.5rem',
  },
  emailPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emailField: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  emailLabel: {
    minWidth: '80px',
    fontWeight: 'bold',
    color: '#4a5568',
  },
  emailValue: {
    color: '#2d3748',
    flex: 1,
  },
  emailContent: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f7fafc',
    borderRadius: '4px',
    color: '#4a5568',
    whiteSpace: 'pre-wrap',
  },
  pdfPreview: {
    backgroundColor: '#f7fafc',
    borderRadius: '4px',
    padding: '1rem',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: '400px',
    width: '90%',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#2d3748',
    fontSize: '1.25rem',
    fontWeight: '500',
    margin: 0,
    textAlign: 'center',
  },
  loadingDetails: {
    color: '#4a5568',
    fontSize: '1rem',
    margin: 0,
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};

const CaliforniaPSAVerify = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [submissionProgress, setSubmissionProgress] = useState({
    status: '',
    details: ''
  });

  useEffect(() => {
    const loadAndPrepareData = async () => {
      // Load verification data from localStorage
      const data = localStorage.getItem('psaVerificationData');
      if (!data) {
        navigate('/california-psa');
        return;
      }

      const parsedData = JSON.parse(data);
      setVerificationData(parsedData);

      // Generate PDF preview
      try {
        const printPreviewElement = document.createElement('div');
        document.body.appendChild(printPreviewElement);

        const root = createRoot(printPreviewElement);
        root.render(
          <PrintPreview 
            formData={parsedData.formData} 
            calculateTotalStaff={(data) => {
              return (
                parseInt(data.full_time_teachers || 0) +
                parseInt(data.part_time_teachers || 0) +
                parseInt(data.administrators || 0) +
                parseInt(data.other_staff || 0)
              );
            }} 
          />
        );

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(printPreviewElement);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        setPdfPreview(pdf.output('datauristring'));

        // Cleanup
        root.unmount();
        document.body.removeChild(printPreviewElement);
      } catch (err) {
        console.error('Error generating PDF:', err);
        setError('Error generating PDF preview');
      }
    };

    loadAndPrepareData();
  }, [navigate]);

  const handleCancel = () => {
    localStorage.removeItem('psaVerificationData');
    navigate('/california-psa');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setSubmissionProgress({
        status: 'Submitting PSA...',
        details: 'Saving form data to database...'
      });

      // Get verification data from localStorage
      const verificationData = JSON.parse(localStorage.getItem('psaVerificationData'));
      const { formData } = verificationData;

      // Clean the data to match database schema
      const cleanData = {
        user_id: formData.user_id,
        school_name: formData.school_name,
        cds_code: formData.cds_code,
        county: formData.county,
        district: formData.district,
        is_full_time_private: formData.is_full_time_private,
        previously_filed: formData.previously_filed,
        school_type: formData.school_type,
        special_education: formData.special_education,
        high_school_diploma: formData.high_school_diploma,
        low_grade: formData.low_grade,
        high_grade: formData.high_grade,
        classification: formData.classification,
        physical_street: formData.physical_street,
        physical_city: formData.physical_city,
        physical_state: formData.physical_state,
        physical_zip: formData.physical_zip,
        physical_zip4: formData.physical_zip4,
        mailing_street: formData.mailing_street,
        mailing_city: formData.mailing_city,
        mailing_state: formData.mailing_state,
        mailing_zip: formData.mailing_zip,
        mailing_zip4: formData.mailing_zip4,
        phone: formData.phone,
        fax_number: formData.fax_number,
        primary_email: formData.primary_email,
        website: formData.website,
        name_changed: formData.name_changed,
        previous_name: formData.previous_name,
        district_changed: formData.district_changed,
        previous_district: formData.previous_district,
        youngest_years: formData.youngest_years,
        youngest_months: formData.youngest_months,
        oldest_years: formData.oldest_years,
        enrollment: formData.enrollment,
        previous_year_graduates: formData.previous_year_graduates,
        full_time_teachers: formData.full_time_teachers,
        part_time_teachers: formData.part_time_teachers,
        administrators: formData.administrators,
        other_staff: formData.other_staff,
        site_admin_salutation: formData.site_admin_salutation,
        site_admin_first_name: formData.site_admin_first_name,
        site_admin_last_name: formData.site_admin_last_name,
        site_admin_title: formData.site_admin_title,
        site_admin_phone: formData.site_admin_phone,
        site_admin_extension: formData.site_admin_extension,
        site_admin_email: formData.site_admin_email,
        site_admin_street: formData.site_admin_street,
        site_admin_city: formData.site_admin_city,
        site_admin_state: formData.site_admin_state,
        site_admin_zip: formData.site_admin_zip,
        site_admin_zip4: formData.site_admin_zip4,
        tax_status: formData.tax_status,
        statutory_acknowledgment: formData.statutory_acknowledgment,
        updated_at: new Date().toISOString()
      };

      // Save to database
      const { error: saveError } = await supabase
        .from('california_psa')
        .upsert(cleanData, { onConflict: 'user_id' });

      if (saveError) throw saveError;

      setSubmissionProgress({
        status: 'Generating PDF...',
        details: 'Creating PDF document for email attachment...'
      });

      // Convert base64 PDF to blob
      const response = await fetch(pdfPreview);
      const pdfBlob = await response.blob();
      const fileName = `${user.id}/completed_psa_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('compliance_documents')
        .upload(fileName, pdfBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('compliance_documents')
        .getPublicUrl(fileName);

      setSubmissionProgress({ 
        status: 'Sending email...', 
        details: `Sending confirmation to ${user.email}\nAttachment: PSA_Submission.pdf` 
      });

      const { error: emailError } = await supabase.functions.invoke('send-psa-email', {
        body: {
          userId: user.id,
          fileUrl: publicUrl,
          email: user.email
        }
      });

      if (emailError) throw emailError;

      // Clean up localStorage
      localStorage.removeItem('psaVerificationData');

      // Navigate back to compliance page
      navigate('/state-compliance-filing');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!verificationData || !pdfPreview) return null;

  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner} />
            <h3 style={styles.loadingText}>
              {submissionProgress.status || 'Submitting PSA...'}
            </h3>
            <p style={styles.loadingDetails}>
              {submissionProgress.details}
            </p>
          </div>
        </div>
      )}

      <div style={styles.headerContainer}>
        <button 
          onClick={handleCancel}
          style={styles.backButton}
        >
          ← Back to PSA Form
        </button>
        <PageHeader title="Verify PSA Submission" />
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Email Preview</h2>
          <div style={styles.emailPreview}>
            <div style={styles.emailField}>
              <span style={styles.emailLabel}>To:</span>
              <span style={styles.emailValue}>{verificationData.emailDetails.to}</span>
            </div>
            <div style={styles.emailField}>
              <span style={styles.emailLabel}>Subject:</span>
              <span style={styles.emailValue}>{verificationData.emailDetails.subject}</span>
            </div>
            <div style={styles.emailField}>
              <span style={styles.emailLabel}>Attachment:</span>
              <span style={styles.emailValue}>{verificationData.emailDetails.attachment}</span>
            </div>
            <div style={styles.emailContent}>
              <div dangerouslySetInnerHTML={{ __html: verificationData.emailDetails.content }} />
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Document Preview</h2>
          <div style={styles.pdfPreview}>
            <iframe
              src={pdfPreview}
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
              }}
              title="PSA PDF Preview"
            />
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={handleCancel}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={styles.submitButton}
          >
            Verify and Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaliforniaPSAVerify; 