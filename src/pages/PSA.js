import React, { useState } from 'react';

const EnrollmentForm = () => {
  const [formData, setFormData] = useState({
    parentFirstName: '',
    parentLastName: '',
    parentPronouns: '',
    email: '',
    phoneNumber: '',
    residentialAddress: '',
    mailingAddress: '',
    studentFirstName: '',
    studentMiddleInitial: '',
    studentLastName: '',
    studentPronouns: '',
    studentBirthdate: '',
    previousSchoolName: '',
    previousSchoolPhone: '',
    previousSchoolAddress: '',
    gradeLevel: '',
    immunizationRecords: null,
    curriculum: '',
    specialEducationNeeds: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, log the data for now
    console.log(formData);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>YourEDU Enrollment Form</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Parent or Guardian Information</h2>
          <label style={styles.label}>
            First Name:
            <input
              type="text"
              name="parentFirstName"
              value={formData.parentFirstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Last Name:
            <input
              type="text"
              name="parentLastName"
              value={formData.parentLastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Pronouns (optional):
            <input
              type="text"
              name="parentPronouns"
              value={formData.parentPronouns}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., they/them/their, she/her/hers, he/him/his"
            />
          </label>
          <label style={styles.label}>
            Email Address:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Phone Number:
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="000-000-0000"
            />
          </label>
          <label style={styles.label}>
            Residential Address:
            <input
              type="text"
              name="residentialAddress"
              value={formData.residentialAddress}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Mailing Address (if different):
            <input
              type="text"
              name="mailingAddress"
              value={formData.mailingAddress}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Student Information</h2>
          <label style={styles.label}>
            First Name:
            <input
              type="text"
              name="studentFirstName"
              value={formData.studentFirstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Middle Initial:
            <input
              type="text"
              name="studentMiddleInitial"
              value={formData.studentMiddleInitial}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Last Name:
            <input
              type="text"
              name="studentLastName"
              value={formData.studentLastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Pronouns (optional):
            <input
              type="text"
              name="studentPronouns"
              value={formData.studentPronouns}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., they/them/their, she/her/hers, he/him/his"
            />
          </label>
          <label style={styles.label}>
            Date of Birth:
            <input
              type="date"
              name="studentBirthdate"
              value={formData.studentBirthdate}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.label}>
            Name of Previous School:
            <input
              type="text"
              name="previousSchoolName"
              value={formData.previousSchoolName}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Phone Number of Previous School:
            <input
              type="text"
              name="previousSchoolPhone"
              value={formData.previousSchoolPhone}
              onChange={handleChange}
              style={styles.input}
              placeholder="000-000-0000"
            />
          </label>
          <label style={styles.label}>
            Address of Previous School:
            <input
              type="text"
              name="previousSchoolAddress"
              value={formData.previousSchoolAddress}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Grade Level:
            <input
              type="text"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="e.g., 6th Grade"
            />
          </label>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Immunization Records</h2>
          <label style={styles.label}>
            Immunization Records (Optional):
            <input
              type="file"
              name="immunizationRecords"
              onChange={handleChange}
              style={styles.fileInput}
            />
          </label>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>Additional Information (Optional, for us to better serve you)</h2>
          <label style={styles.label}>
            Current Curriculum Information:
            <textarea
              name="curriculum"
              value={formData.curriculum}
              onChange={handleChange}
              style={styles.textarea}
            />
          </label>
          <label style={styles.label}>
            Special Education Needs:
            <textarea
              name="specialEducationNeeds"
              value={formData.specialEducationNeeds}
              onChange={handleChange}
              style={styles.textarea}
            />
          </label>
        </div>
        <button type="submit" style={styles.submitButton}>Apply to YourEDU PSP</button>
        <p style={styles.confirmationNote}>
          You will receive an email confirmation from YourEDU that your application has been submitted, and we will reach out as soon as possible for an introductory call.
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    maxWidth: '800px',
    margin: '0 auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    fontSize: '28px',
    color: '#00356b',
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    marginBottom: '20px',
  },
  sectionHeader: {
    fontSize: '20px',
    color: '#007BFF',
    marginBottom: '10px',
  },
  label: {
    marginBottom: '10px',
    fontSize: '16px',
    display: 'block',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    marginBottom: '10px',
  },
  fileInput: {
    marginTop: '10px',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    height: '100px',
    marginBottom: '10px',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'center',
  },
  confirmationNote: {
    fontSize: '14px',
    color: '#555',
    textAlign: 'center',
    marginTop: '10px',
  },
};

export default EnrollmentForm;
