import React from 'react';

const PageHeader = ({ title, buttonText, onButtonClick }) => {
  return (
    <div style={styles.header}>
      <h1 style={styles.title}>{title}</h1>
      {buttonText && (
        <button onClick={onButtonClick} style={styles.createButton}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    marginTop: '0',
    padding: '20px 0',
  },
  title: {
    fontSize: '1.75rem',
    color: '#333',
    margin: 0,
  },
  createButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default PageHeader; 