import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, PDFViewer, StyleSheet, pdf } from '@react-pdf/renderer';
import Modal from 'react-modal';
import OpenAI from 'openai';
import { toast } from 'react-toastify';
import { useAuth } from '../utils/AuthContext';
import { SchoolProfileService } from '../services/SchoolProfileService';
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

// Define the pdfStyles object
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Helvetica-Bold'
  },
  text: {
    marginTop: 10,
    textAlign: 'justify',
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
    color: '#000000'
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: 20,
    right: 40,
  },
  stamp: {
    fontSize: 8,
    textAlign: 'right',
    color: '#666666',
    fontFamily: 'Helvetica'
  }
});

// Single PDF component for both preview and download
const SchoolPhilosophyPDF = ({ aiPhilosophy }) => {
  const storedName = localStorage.getItem('studentName');
  const studentName = storedName && storedName.length > 0 ? storedName : 'Student Name';

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.studentName}>{studentName}</Text>
        <Text style={pdfStyles.title}>School Profile Report</Text>
        <Text style={pdfStyles.text}>{aiPhilosophy}</Text>
        <View style={pdfStyles.copyrightContainer} wrap={false}>
          <Text style={pdfStyles.stamp}>Created by YourEDU ©</Text>
        </View>
      </Page>
    </Document>
  );
};

const SchoolPhilosophy = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataStatus, setDataStatus] = useState('Data saved');
  const [formData, setFormData] = useState({
    prefix: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    title: '',
    phoneNumber: '',
    fax: '',
    emailAddress: '',
    profileURL: '',
    graduatingClassSize: '',
    blockSchedule: '',
    graduationDate: '',
    outsideUS: '',
    volunteerService: '',
    schoolAddress: '',
    oneSentencePhilosophy: '',
    whyHomeschool: '',
    typesOfLearning: '',
    courseStructure: '',
    successMeasurement: '',
    extracurricularOpportunities: '',
    aiPhilosophy: ''
  });

  const fetchSchoolPhilosophy = async () => {
    try {
      const data = await SchoolProfileService.getSchoolProfile();
      
      // Convert snake_case to camelCase
      const formattedData = {
        prefix: data.prefix || '',
        firstName: data.first_name || '',
        middleInitial: data.middle_initial || '',
        lastName: data.last_name || '',
        title: data.title || '',
        phoneNumber: data.phone_number || '',
        fax: data.fax || '',
        emailAddress: data.email_address || '',
        profileURL: data.profile_url || '',
        graduatingClassSize: data.graduating_class_size || '',
        blockSchedule: data.block_schedule || '',
        graduationDate: data.graduation_date || '',
        outsideUS: data.outside_us || '',
        volunteerService: data.volunteer_service || '',
        schoolAddress: data.school_address || '',
        oneSentencePhilosophy: data.one_sentence_philosophy || '',
        whyHomeschool: data.why_homeschool || '',
        typesOfLearning: data.types_of_learning || '',
        courseStructure: data.course_structure || '',
        successMeasurement: data.success_measurement || '',
        extracurricularOpportunities: data.extracurricular_opportunities || '',
        aiPhilosophy: data.ai_philosophy || ''
      };

      setFormData(formattedData);
    } catch (error) {
      console.error('Error fetching school profile:', error);
      toast.error('Failed to load school profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolPhilosophy();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Save after each change
    try {
      setSaving(true);
      setDataStatus('Saving data...');
      await SchoolProfileService.saveSchoolProfile({
        ...formData,
        [name]: value
      });
      setDataStatus('Data saved');
    } catch (error) {
      console.error('Error saving school profile:', error);
      setDataStatus('Error saving data');
      toast.error('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const generateAIDescription = async () => {
    if (!openai) {
      toast.error('AI functionality is disabled in the contractor version');
      return;
    }

    const prompt = `Please create a school profile report that this homeschooled student needs to apply to college. It absolutely NEEDS to be multiple paragraphs and full length. Ideally between 0.75 of a full page and 2 full pages. and it should be similar to the examples that this fine-tuned model was trained on, thanks. Here is the parent user data as context:
      - Prefix: ${formData.prefix}
      - First Name: ${formData.firstName}
      - Middle Initial: ${formData.middleInitial}
      - Last Name: ${formData.lastName}
      - Title: ${formData.title}
      - Phone Number: ${formData.phoneNumber}
      - Fax: ${formData.fax}
      - Email Address: ${formData.emailAddress}
      - Profile URL: ${formData.profileURL}
      - Graduating Class Size: ${formData.graduatingClassSize}
      - Block Schedule: ${formData.blockSchedule}
      - Graduation Date: ${formData.graduationDate}
      - Outside US: ${formData.outsideUS}
      - Volunteer Service: ${formData.volunteerService}
      - One Sentence Philosophy: ${formData.oneSentencePhilosophy}
      - Why Homeschool: ${formData.whyHomeschool}
      - Types of Learning: ${formData.typesOfLearning}
      - Course Structure: ${formData.courseStructure}
      - Success Measurement: ${formData.successMeasurement}
      - Extracurricular Opportunities: ${formData.extracurricularOpportunities}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'ft:gpt-4o-mini-2024-07-18:personal:school-profile-report:AIhlJ0Cv',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.1,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const aiGeneratedText = response.choices[0].message.content.trim();
      handleChange({
        target: {
          name: 'aiPhilosophy',
          value: aiGeneratedText
        }
      });
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error('Failed to generate AI description');
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handlePreview = async () => {
    try {
      setIsModalOpen(true);
      
      // Generate PDF blob directly using @react-pdf/renderer
      const pdfBlob = await pdf(
        <SchoolPhilosophyPDF aiPhilosophy={formData.aiPhilosophy} />
      ).toBlob();
      
      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'school-profile');
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
        <SchoolPhilosophyPDF aiPhilosophy={formData.aiPhilosophy} />
      ).toBlob();
      
      if (user?.id) {
        await savePDFToStorage(user.id, pdfBlob, 'school-profile');
      }

      // Trigger download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'school_profile.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error handling download:', error);
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    input: {
      width: '100%',
      padding: '8px',
      height: '36px',
      borderRadius: '4px',
      border: '1px solid #CED4DA',
      fontSize: '14px',
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '4px',
      border: '1px solid #CED4DA',
      resize: 'vertical',
      minHeight: '36px',
      fontSize: '14px',
      backgroundColor: '#fff',
      fontFamily: 'inherit',
    },
    profileTextarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '4px',
      border: '1px solid #CED4DA',
      resize: 'vertical',
      minHeight: '36px',
      fontSize: '14px',
      backgroundColor: '#fff',
      fontFamily: 'inherit',
    },
    aiTextarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '4px',
      border: '1px solid #CED4DA',
      resize: 'none',
      fontFamily: 'inherit',
      minHeight: '500px',
      backgroundColor: '#e6f3ff',
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
    topSectionContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '20px',
      marginBottom: '20px',
      width: '100%',
    },
    parentDetailsSection: {
      gridColumn: 'span 2',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
    },
    schoolDetailsSection: {
      gridColumn: '3',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button style={styles.backButton} onClick={onBack}>
          Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <h2 style={styles.header}>School Profile Report</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '150px' }}>
          {saving ? (
            <div style={{ color: '#28a745' }}>Saving data...</div>
          ) : (
            <div style={{ color: '#28a745' }}>{dataStatus}</div>
          )}
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

      <div style={styles.topSectionContainer}>
        <div style={styles.parentDetailsSection}>
          <div>
            <h3>Parent/Guardian Details</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Prefix</label>
              <input
                type="text"
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Middle Initial</label>
              <input
                type="text"
                name="middleInitial"
                value={formData.middleInitial}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
          <div>
            <h3>&nbsp;</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fax</label>
              <input
                type="text"
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Profile URL</label>
              <input
                type="url"
                name="profileURL"
                value={formData.profileURL}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.schoolDetailsSection}>
          <h3>School Details</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Graduating Class Size</label>
            <input
              type="number"
              name="graduatingClassSize"
              value={formData.graduatingClassSize}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Are classes taken on a block schedule?</label>
            <select
              name="blockSchedule"
              value={formData.blockSchedule}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Graduation Date</label>
            <input
              type="date"
              name="graduationDate"
              value={formData.graduationDate}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Is your school located outside of the United States?</label>
            <select
              name="outsideUS"
              value={formData.outsideUS}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Does your school require students to perform volunteer service?</label>
            <select
              name="volunteerService"
              value={formData.volunteerService}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>School Address</label>
            <textarea
              name="schoolAddress"
              value={formData.schoolAddress}
              onChange={handleChange}
              rows="3"
              style={styles.textarea}
            />
          </div>
        </div>
      </div>

      <div>
        <h3>School Profile</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Describe your educational philosophy</label>
          <textarea
            name="oneSentencePhilosophy"
            value={formData.oneSentencePhilosophy}
            onChange={handleChange}
            rows="3"
            style={styles.profileTextarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Describe why you chose to homeschool</label>
          <textarea
            name="whyHomeschool"
            value={formData.whyHomeschool}
            onChange={handleChange}
            rows="3"
            style={styles.profileTextarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Describe what types of learning were encouraged</label>
          <textarea
            name="typesOfLearning"
            value={formData.typesOfLearning}
            onChange={handleChange}
            rows="3"
            style={styles.profileTextarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Describe how academic courses were structured</label>
          <textarea
            name="courseStructure"
            value={formData.courseStructure}
            onChange={handleChange}
            rows="3"
            style={styles.profileTextarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Describe how learning goals and course evaluation within courses was measured</label>
          <textarea
            name="successMeasurement"
            value={formData.successMeasurement}
            onChange={handleChange}
            rows="3"
            style={styles.profileTextarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Describe the extracurricular opportunities and activities that were pursued and encouraged
          </label>
          <textarea
            name="extracurricularOpportunities"
            value={formData.extracurricularOpportunities}
            onChange={handleChange}
            rows="3"
            style={styles.profileTextarea}
          />
        </div>
        <div style={styles.formGroup}>
          <button type="button" style={styles.button} onClick={generateAIDescription}>
            Generate AI School Profile Report
          </button>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>AI Generated School Report (You may edit directly as well!)</label>
          <textarea
            name="aiPhilosophy"
            value={formData.aiPhilosophy}
            onChange={handleChange}
            rows="6"
            style={styles.aiTextarea}
          />
        </div>
      </div>

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
        contentLabel="School Profile Preview"
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
              <SchoolPhilosophyPDF aiPhilosophy={formData.aiPhilosophy} />
            </PDFViewer>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SchoolPhilosophy;
