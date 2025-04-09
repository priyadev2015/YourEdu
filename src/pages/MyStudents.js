// src/pages/MyStudents.js
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

const MyStudents = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      email: 'student1@example.com',
      status: 'Not Started',
      fullName: 'John Doe',
      gpa: '3.8',
      school: 'Example High School',
      contact: '123-456-7890',
      adminMaterials: {
        schoolProfile: 'Not Started',
        transcript: 'Complete',
        courseDescriptions: 'Started',
        gradingRubric: 'Not Started',
        counselorLetter: 'Not Started'
      },
      schoolMaterials: {
        stanford: 'Not Started',
        harvard: 'Not Started',
        wisconsin: 'Not Started'
      }
    },
    {
      id: 2,
      email: 'student2@example.com',
      status: 'In Progress',
      fullName: 'Jane Smith',
      gpa: '3.9',
      school: 'Sample High School',
      contact: '987-654-3210',
      adminMaterials: {
        schoolProfile: 'In Progress',
        transcript: 'In Progress',
        courseDescriptions: 'Not Started',
        gradingRubric: 'Not Started',
        counselorLetter: 'In Progress'
      },
      schoolMaterials: {
        stanford: 'Not Started',
        harvard: 'In Progress',
        wisconsin: 'Not Started'
      }
    },
    {
      id: 3,
      email: 'student3@example.com',
      status: 'Completed',
      fullName: 'Alice Johnson',
      gpa: '4.0',
      school: 'Demo High School',
      contact: '555-555-5555',
      adminMaterials: {
        schoolProfile: 'Complete',
        transcript: 'Complete',
        courseDescriptions: 'Complete',
        gradingRubric: 'Complete',
        counselorLetter: 'Complete'
      },
      schoolMaterials: {
        stanford: 'Complete',
        harvard: 'Complete',
        wisconsin: 'Complete'
      }
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const handleAddStudent = () => {
    const email = prompt('Enter student email:');
    if (email) {
      setStudents([...students, { id: students.length + 1, email, status: 'Not Started', fullName: 'New Student', gpa: 'N/A', school: 'New School', contact: 'N/A' }]);
      alert('Student added successfully');
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setPdfFile(null);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    setPdfFile(null);
  };

  const handlePdfClick = (fileName) => {
    setPdfFile(`${process.env.PUBLIC_URL}/${fileName}`);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>My Students</h2>
      <button style={styles.addButton} onClick={handleAddStudent}>Add Student</button>
      <ul style={styles.studentList}>
        {students.map((student, index) => (
          <li key={index} style={styles.studentItem}>
            <span>{student.email} - {student.status}</span>
            <button style={styles.detailsButton} onClick={() => handleViewDetails(student)}>View Details</button>
          </li>
        ))}
      </ul>
      {selectedStudent && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>{selectedStudent.fullName}'s Application</h3>
            <h4>Admin Material Status</h4>
            <div style={styles.statusContainer}>
              <div style={styles.statusItem}>
                <span>School Profile</span>
                <button style={styles.pdfButton} onClick={() => handlePdfClick('example_philosophy.pdf')}>
                  {selectedStudent.adminMaterials.schoolProfile}
                </button>
              </div>
              <div style={styles.statusItem}>
                <span>Transcript</span>
                <button style={styles.pdfButton} onClick={() => handlePdfClick('example_transcript.pdf')}>
                  {selectedStudent.adminMaterials.transcript}
                </button>
              </div>
              <div style={styles.statusItem}>
                <span>Course Descriptions</span>
                <button style={styles.pdfButton} onClick={() => handlePdfClick('example_course_descriptions.pdf')}>
                  {selectedStudent.adminMaterials.courseDescriptions}
                </button>
              </div>
              <div style={styles.statusItem}>
                <span>Grading Rubric</span>
                <button style={styles.pdfButton} onClick={() => handlePdfClick('example_grading_rubric.pdf')}>
                  {selectedStudent.adminMaterials.gradingRubric}
                </button>
              </div>
              <div style={styles.statusItem}>
                <span>Counselor Letter</span>
                <button style={styles.pdfButton} onClick={() => handlePdfClick('example_counselor_letter.pdf')}>
                  {selectedStudent.adminMaterials.counselorLetter}
                </button>
              </div>
            </div>
            <h4>School Material Status</h4>
            <div style={styles.statusContainer}>
              <div style={styles.statusItem}>
                <span style={styles.boldText}>Stanford</span>
                <span>{selectedStudent.schoolMaterials.stanford}</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.boldText}>Harvard</span>
                <span>{selectedStudent.schoolMaterials.harvard}</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.boldText}>Wisconsin</span>
                <span>{selectedStudent.schoolMaterials.wisconsin}</span>
              </div>
            </div>
            {pdfFile && (
              <div style={styles.pdfModal}>
                <button style={styles.backButton} onClick={() => setPdfFile(null)}>Back</button>
                <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} onLoadError={(error) => console.error('Error loading PDF:', error)}>
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                  ))}
                </Document>
              </div>
            )}
            {!pdfFile && <button style={styles.closeButton} onClick={handleCloseDetails}>Close</button>}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  studentList: {
    listStyleType: 'none',
    padding: 0,
  },
  studentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
  detailsButton: {
    padding: '5px 10px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    width: '80%',
    maxWidth: '800px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  statusContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  statusItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    margin: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: 'calc(33% - 20px)',
    textAlign: 'center',
  },
  pdfButton: {
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '5px',
    padding: '5px 10px',
  },
  pdfModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  boldText: {
    fontWeight: 'bold',
  },
};

export default MyStudents;
