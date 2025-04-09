import React, { useState, useEffect } from 'react';
import { parseCollegeRequirements } from '../utils/parseCollegeRequirements';
import stanfordLogo from '../assets/stanford-logo.png'; // Ensure the logo is in the assets folder

const Tracker = () => {
  const [schoolList, setSchoolList] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem('schoolList')) || [];
    setSchoolList(savedList);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const collegeData = await parseCollegeRequirements();
      setColleges(collegeData);
    };

    fetchData();
  }, []);

  const handleSelectSchool = (school) => {
    const college = colleges.find(c => c.School === school.name);
    setSelectedSchool(college);
  };

  const handleRemoveFromSchoolList = (school) => {
    const updatedList = schoolList.filter((s) => s.name !== school.name);
    setSchoolList(updatedList);
    localStorage.setItem('schoolList', JSON.stringify(updatedList));
    alert(`${school.name} removed from your school list.`);
    setSelectedSchool(null);
  };

  const handleAddToSchoolList = (college) => {
    const updatedCollege = {
      name: college.School,
      deadline: college.deadline || 'January 1st, 2025'
    };
    const updatedList = [...schoolList, updatedCollege];
    setSchoolList(updatedList);
    localStorage.setItem('schoolList', JSON.stringify(updatedList));
    alert(`${college.School} added to your school list.`);
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #ccc',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#00356b',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      border: '1px solid #dddddd',
      textAlign: 'left',
      padding: '8px',
      backgroundColor: '#f8f9fa',
    },
    td: {
      border: '1px solid #dddddd',
      textAlign: 'left',
      padding: '8px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#007BFF',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    backButton: {
      padding: '10px 20px',
      backgroundColor: '#6c757d',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '20px',
    },
    schoolButton: {
      padding: '10px 20px',
      backgroundColor: '#007BFF',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      marginBottom: '10px',
      textDecoration: 'none',
      display: 'block',
    },
    selectedCollegeContainer: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    collegeName: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    logo: {
      width: '150px',
      height: 'auto',
      marginBottom: '20px',
    },
    section: {
      marginBottom: '10px',
    },
    subHeader: {
      fontWeight: 'bold',
      fontSize: '14px',
      marginBottom: '10px',
    },
    text: {
      marginBottom: '5px',
      fontSize: '12px',
    },
    link: {
      color: '#007BFF',
      textDecoration: 'none',
      fontSize: '12px',
    },
    socialLinks: {
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
    },
    deadlineBox: {
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '10px',
      fontSize: '12px',
    },
    thickLine: {
      borderBottom: '3px solid #00356b',
      margin: '20px 0',
    }
  };

  return (
    <div style={styles.container}>
      {!selectedSchool ? (
        <>
          <h2 style={styles.header}>Application Tracker</h2>
          {schoolList.map((school, index) => (
            <button key={index} style={styles.schoolButton} onClick={() => handleSelectSchool(school)}>
              {school.name}
            </button>
          ))}
        </>
      ) : (
        <>
          <button onClick={() => setSelectedSchool(null)} style={styles.backButton}>Back</button>
          {selectedSchool.School === 'Stanford University' ? (
            <div style={styles.selectedCollegeContainer}>
              <div style={styles.header}>
                <img src={stanfordLogo} alt="Stanford University logo" style={styles.logo} />
                <h1>Stanford University</h1>
              </div>
              <div style={styles.section}>
                <div style={styles.subHeader}>Homeschool Info</div>
                <p style={styles.text}><strong>Homeschool Paragraph:</strong> {selectedSchool.Paragraph}</p>
                <p style={styles.text}><strong>State:</strong> {selectedSchool.State}</p>
                <p style={styles.text}><strong>Homeschool Application Website:</strong> <a href={selectedSchool['Homeschool App Website']} target="_blank" rel="noopener noreferrer" style={styles.link}>{selectedSchool['Homeschool App Website']}</a></p>
                <p style={styles.text}><strong>Transcript:</strong> {selectedSchool.Transcript}</p>
                <p style={styles.text}><strong>ACT/SAT:</strong> {selectedSchool['ACT/SAT']}</p>
                <p style={styles.text}><strong>AP/Advanced Courses:</strong> {selectedSchool['AP/Advanced Courses']}</p>
                <p style={styles.text}><strong>LoRs:</strong> {selectedSchool.LoRs}</p>
                <p style={styles.text}><strong>Secondary School Report:</strong> {selectedSchool['Secondary School Report']}</p>
                <p style={styles.text}><strong>Course Descriptions:</strong> {selectedSchool['Course Descriptions']}</p>
                <p style={styles.text}><strong>Academic Portfolio:</strong> {selectedSchool['Academic Portfolio']}</p>
                <p style={styles.text}><strong>Additional Requirements:</strong> {selectedSchool['Additional Requirement']}</p>
              </div>
              <div style={styles.thickLine}></div>
              <div style={styles.section}>
                <div style={styles.subHeader}>Contact Info</div>
                <p style={styles.text}><strong>Phone:</strong> <a href="tel:+16507232091" style={styles.link}>(650) 723-2091</a></p>
                <p style={styles.text}><strong>Fax:</strong> (650) 723-6050</p>
                <p style={styles.text}><strong>Email:</strong> <a href="mailto:admission@stanford.edu" style={styles.link}>admission@stanford.edu</a></p>
                <p style={styles.text}><strong>Address:</strong> Montag Hall, 355 Galvez Street, Stanford, CA 94305-6106, USA</p>
                <div style={styles.socialLinks}>
                  <a href="https://www.facebook.com/Stanford" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
                  <a href="https://www.instagram.com/stanford/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                  <a href="https://twitter.com/Stanford" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                  <a href="https://www.youtube.com/user/stanforduniversity" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
                </div>
              </div>
              <div style={styles.section}>
                <div style={styles.subHeader}>Application Deadlines</div>
                <div style={styles.deadlineBox}>
                  <p style={styles.text}><strong>Fall 2024</strong></p>
                  <p style={styles.text}><strong>First Year:</strong></p>
                  <p style={styles.text}>Restrictive Early Action - 11/01/2023</p>
                  <p style={styles.text}>Regular Decision - 01/05/2024</p>
                </div>
                <p style={styles.text}><strong>Other Deadline Information:</strong></p>
                <p style={styles.text}>If you intend to submit an optional arts portfolio, your Restrictive Early Action (REA) application must be submitted by October 15 or your Regular Decision (RD) application must be submitted by December 5. Your School Report form, teacher/counselor letters of recommendation and transcript(s) can be submitted by November 1 for REA and January 5 for RD.</p>
              </div>
              <div style={styles.section}>
                <div style={styles.subHeader}>Application Information</div>
                <p style={styles.text}><strong>Application Fees:</strong></p>
                <p style={styles.text}>First Year International Fee - $90</p>
                <p style={styles.text}>First Year Domestic Fee - $90</p>
                <p style={styles.text}><strong>Standardized Test Policy:</strong> Never required</p>
                <p style={styles.text}><a href="https://admission.stanford.edu/apply/standardized_testing.html" style={styles.link}>Test Policy Information</a></p>
                <p style={styles.text}><strong>Courses & Grades:</strong> Required</p>
                <p style={styles.text}><strong>Recommendations:</strong></p>
                <p style={styles.text}>School Report Required</p>
                <p style={styles.text}>Counselor Recommendation Required</p>
                <p style={styles.text}>Mid Year Report Required</p>
                <p style={styles.text}>Final Report Required</p>
                <p style={styles.text}>Teacher Evaluation(s): 2 Required, 0 Optional</p>
                <p style={styles.text}>Other Evaluation(s): 0 Required, 1 Optional</p>
                <p style={styles.text}><strong>Saves school forms after matriculation:</strong> No</p>
              </div>
              <div style={styles.section}>
                <div style={styles.subHeader}>Additional Information</div>
                <p style={styles.text}>Current high school students taking dual enrollment courses should apply as first-year students.</p>
                <p style={styles.text}>You must apply as a transfer applicant if both of the following are true:</p>
                <ul>
                  <li style={styles.text}>You have completed high school (earned a high school diploma or equivalent) and</li>
                  <li style={styles.text}>You have completed courses for college credit in an associate's or bachelor's degree program since completing high school.</li>
                </ul>
                <p style={styles.text}>If you have already earned a bachelor's degree, you are not eligible to apply to Stanford as a first-year or transfer applicant.</p>
                <p style={styles.text}>To request a waiver for your application fee, review the criteria under the Common App fee waiver question and the Stanford fee waiver question. If you meet any of the criteria, select Yes and you will not be prompted to pay the fee during application submission. Do not wait for your fee waiver request to be approved before submitting your application. If we need more information, we will reach out to you.</p>
              </div>
              <div style={styles.section}>
                <div style={styles.subHeader}>Writing Requirements</div>
                <p style={styles.text}><strong>Common App Personal Essay:</strong> Required</p>
                <p style={styles.text}><strong>College Questions:</strong> 8 Required Questions</p>
                <p style={styles.text}><strong>Additional Details:</strong> Applicants who have previously applied will be required to complete an additional writing question.</p>
                <p style={styles.text}><strong>Writing Supplement:</strong> This college does not use a writing supplement for any additional writing requirements.</p>
              </div>
              {schoolList.some(school => school.name === selectedSchool.School) ? (
                <button style={styles.button} onClick={() => handleRemoveFromSchoolList(selectedSchool)}>
                  Remove from My School List
                </button>
              ) : (
                <button style={styles.button} onClick={() => handleAddToSchoolList(selectedSchool)}>
                  Add to My School List
                </button>
              )}
            </div>
          ) : (
            <div style={styles.selectedCollegeContainer}>
              <h3 style={styles.collegeName}>{selectedSchool.School}</h3>
              <p><strong>Homeschool Paragraph:</strong> {selectedSchool.Paragraph}</p>
              <p><strong>State:</strong> {selectedSchool.State}</p>
              <p><strong>Homeschool Application Website:</strong> <a href={selectedSchool['Homeschool App Website']} target="_blank" rel="noopener noreferrer" style={styles.link}>{selectedSchool['Homeschool App Website']}</a></p>
              <p><strong>Transcript:</strong> {selectedSchool.Transcript}</p>
              <p><strong>ACT/SAT:</strong> {selectedSchool['ACT/SAT']}</p>
              <p><strong>AP/Advanced Courses:</strong> {selectedSchool['AP/Advanced Courses']}</p>
              <p><strong>LoRs:</strong> {selectedSchool.LoRs}</p>
              <p><strong>Secondary School Report:</strong> {selectedSchool['Secondary School Report']}</p>
              <p><strong>Course Descriptions:</strong> {selectedSchool['Course Descriptions']}</p>
              <p><strong>Academic Portfolio:</strong> {selectedSchool['Academic Portfolio']}</p>
              <p><strong>Additional Requirements:</strong> {selectedSchool['Additional Requirement']}</p>
              {schoolList.some(school => school.name === selectedSchool.School) ? (
                <button style={styles.button} onClick={() => handleRemoveFromSchoolList(selectedSchool)}>
                  Remove from My School List
                </button>
              ) : (
                <button style={styles.button} onClick={() => handleAddToSchoolList(selectedSchool)}>
                  Add to My School List
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tracker;
