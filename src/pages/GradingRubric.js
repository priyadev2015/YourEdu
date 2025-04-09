import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import OpenAI from 'openai';
import Modal from 'react-modal';
import { useAuth } from '../utils/AuthContext';
import { GradingRubricService } from '../services/GradingRubricService';
import { toast } from 'react-toastify';
import { savePDFToStorage } from '../utils/pdfStorage';
import { modalStyles } from '../styles/modalStyles';

// Set up Modal
Modal.setAppElement('#root');

// Initialize OpenAI client with error handling
let openai;
try {
  if (process.env.REACT_APP_OPENAI_API_KEY && process.env.REACT_APP_OPENAI_API_KEY !== 'DISABLED_FOR_CONTRACTORS') {
    openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  text: {
    marginTop: 5,
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
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
});

const GradingRubricPDF = ({ aiGradingScale, gradingScale }) => {
  // Fetch student name from localStorage or another source
  const storedName = localStorage.getItem('studentName');
  const studentName = storedName && storedName.length > 0 ? storedName : 'Student Name';

  // Log the retrieved name for debugging
  console.log('Retrieved student name:', studentName);

  return (
    <Document>
      <Page style={pdfStyles.page}>
        <Text style={pdfStyles.studentName}>{studentName}</Text>  // Display student name
        <Text style={pdfStyles.title}>Grading Rubric</Text>  // Display Grading Rubric title
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.text}>{aiGradingScale}</Text>
        </View>
        <View style={pdfStyles.section}>
          {Object.keys(gradingScale).map((grade) => (
            <Text style={pdfStyles.text} key={grade}>
              {grade}: {gradingScale[grade]}
            </Text>
          ))}
        </View>
        <View style={pdfStyles.copyrightContainer} fixed>
          <Text style={pdfStyles.stamp}>Created by YourEDU ©</Text>
        </View>
      </Page>
    </Document>
  );
};

// Define default form data structure
const defaultFormData = {
  evaluationMethod: '',
  learningGoals: '',
  assignments: '',
  gradingScale: {
    'A+': '',
    'A': '',
    'A-': '',
    'B+': '',
    'B': '',
    'B-': '',
    'C+': '',
    'C': '',
    'C-': '',
    'D+': '',
    'D': '',
    'D-': '',
    'F': '',
  },
  aiGradingScale: '',
};

const GradingRubric = ({ onBack }) => {
  const { user } = useAuth();
  const saveTimeoutRef = useRef(null);

  // Initialize states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataStatus, setDataStatus] = useState('Data saved');

  // Initialize formData from localStorage first
  const [formData, setFormData] = useState(() => {
    const cachedData = localStorage.getItem(`gradingRubric_${user?.id}`);
    return cachedData ? JSON.parse(cachedData) : defaultFormData;
  });

  // Fetch data from backend if no cached data exists
  const fetchGradingRubric = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setDataStatus('Loading data...');
      
      const data = await GradingRubricService.getGradingRubric();
      
      setFormData(data);
      localStorage.setItem(`gradingRubric_${user.id}`, JSON.stringify(data));
      setDataStatus('Data loaded');
    } catch (error) {
      console.error('Failed to fetch Grading Rubric:', error);
      setDataStatus('Error loading data');
      toast.error('Failed to load grading rubric');
      
      // Try to load from localStorage as fallback
      const cachedData = localStorage.getItem(`gradingRubric_${user.id}`);
      if (cachedData) {
        setFormData(JSON.parse(cachedData));
        setDataStatus('Loaded from cache');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check for cached data on mount
  useEffect(() => {
    if (user?.id) {
      const cachedData = localStorage.getItem(`gradingRubric_${user.id}`);
      if (!cachedData) {
        fetchGradingRubric();
      }
    }
  }, [fetchGradingRubric, user]);

  // Save function updates both backend and localStorage
  const saveGradingRubric = useCallback(async (updatedFormData) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setDataStatus('Saving data...');
      
      await GradingRubricService.saveGradingRubric(updatedFormData);
      
      localStorage.setItem(`gradingRubric_${user.id}`, JSON.stringify(updatedFormData));
      setFormData(updatedFormData);
      setDataStatus('Data saved');
      toast.success('Grading rubric saved successfully');
    } catch (error) {
      console.error('Error saving Grading Rubric:', error);
      setDataStatus('Save failed');
      toast.error('Failed to save grading rubric');
      // Revert to backend data on save error
      fetchGradingRubric();
    } finally {
      setSaving(false);
    }
  }, [user, fetchGradingRubric]);

  const debouncedSave = useCallback((updatedFormData) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveGradingRubric(updatedFormData);
    }, 1000);
  }, [saveGradingRubric]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    debouncedSave({ ...formData, [name]: value });
  };

  const handleGradingScaleChange = (e) => {
    const { name, value } = e.target;
    const updatedGradingScale = { ...formData.gradingScale, [name]: value };
    setFormData({ ...formData, gradingScale: updatedGradingScale });
    debouncedSave({ ...formData, gradingScale: updatedGradingScale });
  };

  const generateAIRubric = async () => {
    if (!openai) {
      toast.error('AI functionality is disabled in the contractor version');
      return;
    }
    const userGrades = formData.gradingScale;
    const prompt = `Please create a grading rubric that this homeschooled student needs to apply to college. Please use the fields the user has filled out as background info on the student and incorporate that info as well as possislbe into your response, as well as use the examples that this model is fine-tuned on for structure and content, thanks. 
      User background info: 
      Evaluation Method: ${formData.evaluationMethod},
      Learning Goals: ${formData.learningGoals},
      Assignments: ${formData.assignments},
      Grading Scale: ${JSON.stringify(formData.gradingScale, null, 2)},
      User Grades: ${JSON.stringify(userGrades, null, 2)}.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'ft:gpt-4o-mini-2024-07-18:personal:grading-rubric-3:ALd8DpEr',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const aiGradingScale = response.choices[0].message.content.trim();
      setFormData({ ...formData, aiGradingScale });
      debouncedSave({ ...formData, aiGradingScale });
    } catch (error) {
      console.error('Error generating AI Grading Scale:', error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
      form: {
        display: 'flex',
        flexDirection: 'column',
      },
      formGroup: {
        marginBottom: '20px',
      },
      label: {
        display: 'block',
        fontWeight: 'bold',
        marginBottom: '5px',
      },
      textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #CED4DA',
        fontFamily: 'Arial',
      },
      scaleInput: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        justifyContent: 'flex-start', // Aligns grade input with typical range
      },
      gradeLabel: {
          flex: '0 0 50px', // Set a consistent width for grade labels
          fontWeight: 'bold',
        },
      input: {
        padding: '5px',
        borderRadius: '4px',
        border: '1px solid #CED4DA',
        width: '80px',
      },
      typicalRange: {
        marginLeft: '10px',
        fontStyle: 'italic',
        fontSize: '12px',
        color: '#555',
      },
      aiTextarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #CED4DA',
        resize: 'none',  // Locked size
        fontFamily: 'Arial',
        height: '500px', // Increased the length to 500px
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

  const handlePreview = async () => {
    try {
      setIsModalOpen(true);
      
      // Generate PDF blob directly using @react-pdf/renderer
      const pdfBlob = await pdf(
        <GradingRubricPDF 
          aiGradingScale={formData.aiGradingScale} 
          gradingScale={formData.gradingScale} 
        />
      ).toBlob();
      
      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'grading-rubric');
      }
    } catch (error) {
      console.error('Error handling preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  const handleDownload = async () => {
    try {
      // Generate PDF blob directly using @react-pdf/renderer
      const pdfBlob = await pdf(
        <GradingRubricPDF 
          aiGradingScale={formData.aiGradingScale} 
          gradingScale={formData.gradingScale} 
        />
      ).toBlob();
      
      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'grading-rubric');
      }

      // Trigger download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grading_rubric.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error handling download:', error);
      toast.error('Failed to download document');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button style={styles.backButton} onClick={onBack}>
          Back
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <h2 style={styles.header}>Grading Rubric</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '150px' }}>
          {loading && <div style={{ color: '#28a745' }}>Loading data...</div>}
          {saving && <div style={{ color: '#28a745' }}>Saving data...</div>}
          {!loading && !saving && <div style={{ color: '#28a745' }}>Data saved</div>}
        </div>
        
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={handlePreview}>
            Preview
          </button>
          <button style={styles.button} onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
      <form style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>1. How were students evaluated in academic courses?</label>
          <textarea
            name="evaluationMethod"
            value={formData.evaluationMethod}
            onChange={handleChange}
            rows="3"
            style={styles.textarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>2. What learning goals needed to be met?</label>
          <textarea
            name="learningGoals"
            value={formData.learningGoals}
            onChange={handleChange}
            rows="3"
            style={styles.textarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>3. What type of assignments were conducted?</label>
          <textarea
            name="assignments"
            value={formData.assignments}
            onChange={handleChange}
            rows="3"
            style={styles.textarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Grading Scale:</label>
          {Object.keys(formData.gradingScale)
            .filter((grade) => grade !== '_id')  // Filter out the '_id' key
            .map((grade) => (
              <div style={styles.scaleInput} key={grade}>
                <label style={styles.gradeLabel}>{grade}:</label>
                <input
                  type="text"
                  name={grade}
                  value={formData.gradingScale[grade]}
                  onChange={handleGradingScaleChange}
                  style={styles.input}
                />
              </div>
            ))}
        </div>
        <div style={styles.formGroup}>
          <button type="button" style={styles.button} onClick={generateAIRubric}>
            Generate AI Grading Scale
          </button>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>AI Generated Grading Scale</label>
          <textarea
            name="aiGradingScale"
            value={formData.aiGradingScale}
            onChange={handleChange}
            rows="10"
            style={styles.aiTextarea}  // Locked size and increased length to 500px
          />
        </div>
      </form>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            ...modalStyles.overlay,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            maxWidth: '95%',
            width: '1000px',
            height: '90vh',
            margin: '0 auto',
            padding: '20px',
            border: 'none',
            background: '#fff',
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        }}
        contentLabel="Grading Rubric Preview"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <button 
            onClick={closeModal} 
            style={{ 
              ...styles.button, 
              marginBottom: '10px',
              alignSelf: 'flex-end'
            }}
          >
            Close
          </button>
          <div style={{ flex: 1, minHeight: 0 }}>
            <PDFViewer 
              width="100%" 
              height="100%" 
              style={{ 
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <GradingRubricPDF 
                aiGradingScale={formData.aiGradingScale} 
                gradingScale={formData.gradingScale} 
              />
            </PDFViewer>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradingRubric;
