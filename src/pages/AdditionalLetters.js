import React, { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { Document, Page, Text, PDFViewer } from '@react-pdf/renderer';

const AdditionalLetters = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [email, setEmail] = useState('');
  const [requestedLetters, setRequestedLetters] = useState([]);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLetterChange = (e) => setLetterContent(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSubmitLetter = () => {
    alert('Letter of Recommendation submitted successfully.');
    setLetterContent('');
    closeModal();
  };

  const handleSendEmail = () => {
    const newRequest = {
      email: email,
      date: new Date().toLocaleDateString(),
      status: 'Requested',
    };
    setRequestedLetters([...requestedLetters, newRequest]);
    alert(`Request for a letter of recommendation sent to ${email}.`);
    setEmail('');
  };

  const LetterDocument = () => (
    <Document>
      <Page>
        <Text>Additional Letter of Recommendation</Text>
        <Text>{letterContent}</Text>
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
    },
    textarea: {
      width: '100%',
      height: '200px',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #CED4DA',
      marginBottom: '10px',
    },
    input: {
      width: '100%',
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
    requestedLettersContainer: {
      marginTop: '20px',
    },
    requestedLetter: {
      padding: '10px',
      borderBottom: '1px solid #CED4DA',
    },
    requestedLetterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button style={styles.backButton} onClick={() => navigate('/admin-materials')}>Back</button>
        <h2 style={styles.header}>Additional Letters of Recommendation</h2>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={openModal}>Add New Letter</button>
        </div>
      </div>
      <input
        type="email"
        placeholder="Enter email to request a letter"
        value={email}
        onChange={handleEmailChange}
        style={styles.input}
      />
      <button style={styles.button} onClick={handleSendEmail}>Send Request</button>
      <div style={styles.requestedLettersContainer}>
        <h3>Letters Requested</h3>
        {requestedLetters.map((letter, index) => (
          <div key={index} style={styles.requestedLetter}>
            <div style={styles.requestedLetterHeader}>
              <span>{letter.email}</span>
              <span>{letter.date}</span>
            </div>
            <div>Status: {letter.status}</div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={styles.modal}
        contentLabel="Add New Letter of Recommendation"
      >
        <button onClick={closeModal} style={{ ...styles.button, marginBottom: '10px' }}>Close</button>
        <textarea
          placeholder="Type the letter of recommendation here..."
          value={letterContent}
          onChange={handleLetterChange}
          style={styles.textarea}
        />
        <button style={styles.button} onClick={handleSubmitLetter}>Submit Letter</button>
        <PDFViewer width="100%" height="100%">
          <LetterDocument />
        </PDFViewer>
      </Modal>
    </div>
  );
};

export default AdditionalLetters;
