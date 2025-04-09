import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { 
  BsPersonBadge, 
  BsBriefcase,
  BsFileText,
  BsCalendar,
  BsAward,
  BsClipboard
} from 'react-icons/bs';

const DocumentGeneration = () => {
  const documentTypes = [
    {
      id: 'ids',
      title: 'Student/Teacher ID Cards',
      description: 'Generate professional ID cards for students and teachers',
      icon: BsPersonBadge,
      link: '/documents/ids',
      color: '#3182CE'
    },
    {
      id: 'permits',
      title: 'Work Permits',
      description: 'Create work permits for students',
      icon: BsBriefcase,
      link: '/documents/permits',
      color: '#38A169'
    },
    {
      id: 'transcripts',
      title: 'Transcripts',
      description: 'Generate official academic transcripts',
      icon: BsFileText,
      link: '/documents/transcripts',
      color: '#805AD5'
    },
    {
      id: 'calendar',
      title: 'School Calendar',
      description: 'Create a customized school year calendar',
      icon: BsCalendar,
      link: '/documents/calendar',
      color: '#D69E2E'
    },
    {
      id: 'certificates',
      title: 'Certificates',
      description: 'Generate certificates of completion and achievement',
      icon: BsAward,
      link: '/documents/certificates',
      color: '#DD6B20'
    },
    {
      id: 'forms',
      title: 'Custom Forms',
      description: 'Create custom forms for your homeschool needs',
      icon: BsClipboard,
      link: '/documents/forms',
      color: '#319795'
    },
  ];

  return (
    <div style={styles.container}>
      <PageHeader 
        title="Document Generation" 
        buttonText="View Generated History"
        onButtonClick={() => {/* Handle history view */}}
      />

      <div style={styles.content}>
        <div style={styles.description}>
          Create and manage various documents for your homeschool program. Select from the options below to get started.
        </div>

        <div style={styles.documentGrid}>
          {documentTypes.map(doc => (
            <Link key={doc.id} to={doc.link} style={styles.documentCard}>
              <div style={styles.iconContainer}>
                <doc.icon size={24} color={doc.color} />
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{doc.title}</h3>
                <p style={styles.cardDescription}>{doc.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  description: {
    fontSize: '16px',
    color: '#4A5568',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  documentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    padding: '12px',
  },
  documentCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
    },
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3748',
  },
  cardDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#718096',
    lineHeight: '1.4',
  },
};

export default DocumentGeneration; 