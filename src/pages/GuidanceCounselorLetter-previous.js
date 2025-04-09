import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, PDFViewer, StyleSheet } from '@react-pdf/renderer';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

// Define the pdfStyles object
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    marginTop: 5,
    textAlign: 'justify',
  },
  logoStampContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  copyrightContainer: {
    position: 'absolute',   
    bottom: 10,            
    right: 10,            
  },
  stamp: {
    fontSize: 8,
    textAlign: 'right',
  },
});

const GuidanceCounselorLetter = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const saveTimeoutRef = useRef(null);

  // Fetch guidance counselor letter data on mount
  useEffect(() => {
    const fetchLetterContent = async () => {
      if (!user || !user.id) {
        console.error('No user or user ID found, aborting fetchLetterContent');
        return;
      }
      try {
        setLoading(true);
        console.log('Fetching Guidance Counselor Letter for user ID:', user.id);
        const response = await fetch(`/api/guidance-letter?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setLetterContent(data.letterContent || '');
          setIsInitialized(true); // Mark as initialized after fetching data
          console.log('Fetched Guidance Counselor Letter data:', data);
        } else {
          console.log('No existing Guidance Counselor Letter found, showing empty state.');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error fetching Guidance Counselor Letter:', error);
        alert(`Failed to fetch Guidance Counselor Letter: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLetterContent();
  }, [user]);

  // Save guidance counselor letter data to the backend
  const saveLetterContent = useCallback(async (updatedContent) => {
    if (!user || !user.id || !isInitialized) {
      console.error('No user or user ID found or not initialized, aborting saveLetterContent');
      return;
    }
    try {
      setSaving(true);
      console.log('Saving Guidance Counselor Letter data for user ID:', user.id);
      const response = await fetch('/api/guidance-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, letterContent: updatedContent }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const savedData = await response.json();
      console.log('Guidance Counselor Letter saved successfully:', savedData);
    } catch (error) {
      console.error('Error saving Guidance Counselor Letter:', error);
      alert(`Failed to save Guidance Counselor Letter: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, isInitialized]);

  // Debounced save function
  const debouncedSave = useCallback((updatedContent) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveLetterContent(updatedContent);
    }, 1000);
  }, [saveLetterContent]);

  // Handling form input changes
  const handleLetterChange = (e) => {
    setLetterContent(e.target.value);
    debouncedSave(e.target.value);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const LetterDocument = () => (
    <Document>
      <Page style={pdfStyles.page}>
        
         <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Guidance Counselor/Parent Letter</Text>
        </View>

        <Text>{letterContent}</Text>
        <View style={pdfStyles.copyrightContainer} fixed>
          <Text style={pdfStyles.stamp}>Created by YourEDU ©</Text>
        </View>
      </Page>
    </Document>
  );

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '20px auto',
      border: '1px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    backButton: {
      padding: '10px 20px',
      backgroundColor: '#007BFF',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007BFF',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginLeft: '10px',
      textDecoration: 'none',
      fontFamily: 'Arial',
    },
    textarea: {
      width: '100%',
      height: '200px',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #CED4DA',
      marginBottom: '10px',
    },
    modal: {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  };

  return (
    <div style={styles.container}>
      {loading && <p>Loading data...</p>}
      {saving && <p>Saving data...</p>}
      <div style={styles.headerContainer}>
        <button style={styles.backButton} onClick={() => navigate('/admin-materials')}>Back</button>
        <h2 style={styles.header}>Guidance Counselor/Parent Letter of Recommendation</h2>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={openModal}>Preview</button>
          <PDFDownloadLink
            document={<LetterDocument />}
            fileName="guidance_counselor_letter.pdf"
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <button type="button" style={styles.button}>
                {loading ? 'Generating PDF...' : 'Download'}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>
      <textarea
        placeholder="Type the letter of recommendation here..."
        value={letterContent}
        onChange={handleLetterChange}
        style={styles.textarea}
      />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={styles.modal}
        contentLabel="Guidance Counselor/Parent Letter of Recommendation Preview"
      >
        <button onClick={closeModal} style={{ ...styles.button, marginBottom: '10px' }}>Close</button>
        <PDFViewer width="100%" height="100%">
          <LetterDocument />
        </PDFViewer>
      </Modal>
    </div>
  );
};

export default GuidanceCounselorLetter;
