import React from 'react';
import exampleLetter from '../assets/example-letter.pdf'; // Ensure the path is correct to where the PDF is stored in src/assets

const GuidanceCounselorLetter = ({ onBack }) => {
  const styles = {
    container: {
      padding: '40px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '1200px',
      margin: '0 auto',
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
      color: '#00356b',
      textAlign: 'center',
      flexGrow: 1,
    },
    comingSoon: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#007BFF',
      marginBottom: '10px',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#00356b',
      marginBottom: '10px',
      textAlign: 'left',
    },
    notes: {
      fontSize: '18px',
      color: '#555',
      textAlign: 'left',
      marginBottom: '40px',
      lineHeight: '1.6',
    },
    iframe: {
      width: '100%',
      height: '600px',
      border: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button style={styles.backButton} onClick={onBack}>Back</button>
        <h1 style={styles.header}>Guidance Counselor/Parent Letter of Recommendation</h1>
      </div>

      {/* Coming Soon */}
      <h2 style={styles.comingSoon}>Coming Soon!</h2>

      {/* Notes Section */}
      <h2 style={styles.subtitle}>
        We're currently finalizing the tools and support around the guidance counselor/parent letter of recommendation. In the meantime, please see some notes below as well as Henry's own guidance counselor letter of rec to serve as an example.
      </h2>
      <p style={styles.notes}>
        In general, the guidance counselor/parent letter of recommendation is heavily discounted in the eye's of an admissions officer because it's written by the parent, so don't put too much pressure on yourself :) The letter is a fantastic opportunity to reinforce your kid's overall application narrative, aka their "hook", as well as show that your kid is especially prepared for college level work. If there's an extracurricular activity that is especially important to the application, or academic work that you think is compelling, take the opportunity to provide more detail here. Admissions officers spend such a short amount of time on each application, sometimes things can be missed, and so thinking through what the things are that are the most important/compelling is a great starting place. 
      </p>

      {/* Example PDF Viewer */}
      <h2 style={styles.subtitle}>Henry's Example</h2>
      <iframe src={exampleLetter} style={styles.iframe} title="Henry's Example Letter"></iframe>
    </div>
  );
};

export default GuidanceCounselorLetter;
