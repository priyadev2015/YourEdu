import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { DescriptiveText } from '../components/ui/typography.jsx';
import { BsDownload, BsPrinter, BsTrash } from 'react-icons/bs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

const WorkPermit = ({ permit, onDownload, onPrint, onDelete }) => {
  const permitRef = React.useRef();

  return (
    <div style={styles.permitContainer}>
      <div ref={permitRef} style={styles.permit}>
        <h2 style={styles.permitTitle}>STUDENT WORK PERMIT</h2>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Student Information</h3>
          <div style={styles.field}>
            <span style={styles.label}>Name:</span>
            <span style={styles.value}>{permit.student_name}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Date of Birth:</span>
            <span style={styles.value}>{new Date(permit.date_of_birth).toLocaleDateString()}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Address:</span>
            <span style={styles.value}>{permit.address}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Phone:</span>
            <span style={styles.value}>{permit.phone_number}</span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Employer Information</h3>
          <div style={styles.field}>
            <span style={styles.label}>Employer:</span>
            <span style={styles.value}>{permit.employer_name}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Address:</span>
            <span style={styles.value}>{permit.employer_address}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Phone:</span>
            <span style={styles.value}>{permit.employer_phone}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Job Title:</span>
            <span style={styles.value}>{permit.job_title}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Work Schedule:</span>
            <span style={styles.value}>{permit.work_schedule}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Start Date:</span>
            <span style={styles.value}>{new Date(permit.start_date).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Parent/Guardian Information</h3>
          <div style={styles.field}>
            <span style={styles.label}>Name:</span>
            <span style={styles.value}>{permit.parent_name}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Phone:</span>
            <span style={styles.value}>{permit.parent_phone}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{permit.parent_email}</span>
          </div>
        </div>

        <div style={styles.status}>
          Status: <span style={styles.statusBadge}>{permit.status.toUpperCase()}</span>
        </div>
      </div>

      <div style={styles.permitActions}>
        <button 
          onClick={() => onDownload(permitRef.current)}
          style={styles.actionButton}
        >
          <BsDownload /> Download
        </button>
        <button 
          onClick={() => onPrint(permitRef.current)}
          style={styles.actionButton}
        >
          <BsPrinter /> Print
        </button>
        <button 
          onClick={() => onDelete(permit.id)}
          style={styles.deleteButton}
        >
          <BsTrash /> Delete
        </button>
      </div>
    </div>
  );
};

const WorkPermitsView = ({ onShowWorkPermitForm }) => {
  const navigate = useNavigate();
  const [permits, setPermits] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadPermits();
  }, []);

  const loadPermits = async () => {
    try {
      const { WorkPermitService } = await import('../services/WorkPermitService');
      const loadedPermits = await WorkPermitService.getUserWorkPermits();
      setPermits(loadedPermits);
    } catch (error) {
      console.error('Error loading permits:', error);
      toast.error('Failed to load work permits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work permit?')) return;

    try {
      const { WorkPermitService } = await import('../services/WorkPermitService');
      await WorkPermitService.deleteWorkPermit(id);
      toast.success('Work permit deleted successfully');
      await loadPermits();
    } catch (error) {
      console.error('Error deleting permit:', error);
      toast.error('Failed to delete work permit');
    }
  };

  const handleDownload = async (element) => {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
      pdf.save(`work-permit-${Date.now()}.pdf`);
      
      toast.success('Work permit downloaded successfully');
    } catch (error) {
      console.error('Error downloading permit:', error);
      toast.error('Failed to download work permit');
    }
  };

  const handlePrint = async (element) => {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const win = window.open('', '', 'width=800,height=600');
      win.document.write(`
        <html>
          <head>
            <title>Print Work Permit</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: white;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                body {
                  background-color: white;
                }
                img {
                  max-width: 100%;
                }
              }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/jpeg', 1.0)}" />
          </body>
        </html>
      `);
      win.document.close();
      
      setTimeout(() => {
        win.focus();
        win.print();
        win.close();
      }, 250);

      toast.success('Print window opened');
    } catch (error) {
      console.error('Error printing permit:', error);
      toast.error('Failed to print work permit');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Benefits section */}
      <Box sx={{ pt: 0, pb: 0 }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 0,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Box sx={{ maxWidth: 'var(--text-max-width)', mb: 0.5 }}>
            <DescriptiveText sx={{ 
              fontSize: '1.1rem',
              lineHeight: '1.5',
              color: 'hsl(var(--muted-foreground))',
              mb: 1
            }}>
              Access and manage your previously generated work permits. Download, print, or request updates to existing permits.
            </DescriptiveText>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: 'transparent', pt: 0 }}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 0,
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          {isLoading ? (
            <div style={styles.loading}>Loading...</div>
          ) : permits.length === 0 ? (
            <div style={{...styles.noPermits, marginTop: 0, padding: '24px 0'}}>
              <p style={{ marginBottom: '16px' }}>No work permits generated yet.</p>
              <button 
                onClick={onShowWorkPermitForm}
                style={{
                  ...styles.generateButton,
                  marginTop: 0
                }}
              >
                Generate Your First Work Permit
              </button>
            </div>
          ) : (
            <div style={{...styles.permitsGrid, paddingTop: '8px', paddingBottom: '16px'}}>
              {permits.map(permit => (
                <WorkPermit
                  key={permit.id}
                  permit={permit}
                  onDownload={handleDownload}
                  onPrint={handlePrint}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </Container>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  permitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
    gap: '24px',
    padding: '24px 0',
  },
  permitContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  permit: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '32px',
    border: '1px solid #E2E8F0',
  },
  permitTitle: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '32px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '16px',
    borderBottom: '2px solid #E2E8F0',
    paddingBottom: '8px',
  },
  field: {
    display: 'flex',
    marginBottom: '8px',
  },
  label: {
    width: '120px',
    fontWeight: '500',
    color: '#4A5568',
  },
  value: {
    flex: 1,
    color: '#2D3748',
  },
  status: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    backgroundColor: '#EBF8FF',
    color: '#2B6CB0',
    fontWeight: '600',
  },
  permitActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    justifyContent: 'center',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#EBF8FF',
    color: '#2B6CB0',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#BEE3F8',
    },
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#FED7D7',
    color: '#C53030',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#FEB2B2',
    },
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: '#4A5568',
    fontSize: '16px',
  },
  noPermits: {
    textAlign: 'center',
    padding: '48px',
    color: '#4A5568',
  },
  generateButton: {
    marginTop: '16px',
    padding: '12px 24px',
    backgroundColor: '#3182CE',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#2C5282',
    },
  },
};

export default WorkPermitsView; 