import React, { useState } from 'react';

const MaterialSection = ({ category, materials, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    file: null
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setNewMaterial(prev => ({ ...prev, file }));
  };

  const handleUpload = () => {
    if (!newMaterial.file || !newMaterial.title) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const materialData = {
        id: Date.now().toString(),
        title: newMaterial.title,
        description: newMaterial.description,
        fileName: newMaterial.file.name,
        fileType: newMaterial.file.type,
        fileData: e.target.result,
        uploadDate: new Date().toISOString(),
        category
      };

      onUpload(category, materialData);
      setNewMaterial({ title: '', description: '', file: null });
      setIsUploading(false);
    };

    reader.readAsArrayBuffer(newMaterial.file);
  };

  const handleDownload = (material) => {
    const blob = new Blob([material.fileData], { type: material.fileType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = material.fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.categoryTitle}>{category}</h3>
        <button 
          onClick={() => setIsUploading(!isUploading)}
          style={styles.uploadButton}
        >
          {isUploading ? '- Cancel' : '+ Upload'}
        </button>
      </div>

      {isUploading && (
        <div style={styles.uploadForm}>
          <input
            type="text"
            placeholder="Title"
            value={newMaterial.title}
            onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
            style={styles.input}
          />
          <textarea
            placeholder="Description (optional)"
            value={newMaterial.description}
            onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
            style={styles.textarea}
          />
          <input
            type="file"
            onChange={handleFileSelect}
            style={styles.fileInput}
          />
          <button 
            onClick={handleUpload}
            style={styles.submitButton}
            disabled={!newMaterial.file || !newMaterial.title}
          >
            Upload Material
          </button>
        </div>
      )}

      <div style={styles.materialsList}>
        {materials.map(material => (
          <div key={material.id} style={styles.materialCard}>
            <div style={styles.materialInfo}>
              <h4 style={styles.materialTitle}>{material.title}</h4>
              {material.description && (
                <p style={styles.materialDescription}>{material.description}</p>
              )}
              <span style={styles.fileName}>{material.fileName}</span>
              <span style={styles.uploadDate}>
                Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={() => handleDownload(material)}
              style={styles.downloadButton}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  categoryTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#333',
  },
  uploadButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  uploadForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  fileInput: {
    padding: '0.5rem',
  },
  submitButton: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
  },
  materialsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  materialCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #eee',
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  materialDescription: {
    margin: '0 0 0.5rem 0',
    color: '#666',
    fontSize: '0.875rem',
  },
  fileName: {
    display: 'block',
    color: '#666',
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },
  uploadDate: {
    display: 'block',
    color: '#666',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  downloadButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginLeft: '1rem',
  },
};

export default MaterialSection; 