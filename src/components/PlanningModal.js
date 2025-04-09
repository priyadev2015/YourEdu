import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PlanningModal = ({ course, onClose, onPlan }) => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const years = ['9th', '10th', '11th', '12th'];
  const terms = ['Fall 2024-2025', 'Winter 2024-2025', 'Spring 2024-2025', 'Summer 2024-2025'];
  const subjects = [
    { name: 'Math', key: 'math' },
    { name: 'Science', key: 'science' },
    { name: 'English', key: 'english' },
    { name: 'History', key: 'history' },
    { name: 'Language', key: 'language' },
    { name: 'Fine Arts', key: 'fineArts' },
    { name: 'PE', key: 'pe' }
  ];

  const handleSubmit = () => {
    const timeRegex = /(\d{1,2}):(\d{2})(?:am|pm)?\s*-\s*(\d{1,2}):(\d{2})(?:am|pm)?/i;
    const timeMatch = course.courseSchedule.match(timeRegex);
    
    let startTime = '09:15';
    let endTime = '12:20';
    
    if (timeMatch) {
      let startHour = parseInt(timeMatch[1]);
      const startMinute = timeMatch[2];
      let endHour = parseInt(timeMatch[3]);
      const endMinute = timeMatch[4];
      
      const timeStr = course.courseSchedule.toLowerCase();
      const isPM = timeStr.includes('pm') || (endHour < startHour);
      if (isPM && startHour < 12) startHour += 12;
      if (isPM && endHour < 12) endHour += 12;
      
      startTime = `${startHour.toString().padStart(2, '0')}:${startMinute}`;
      endTime = `${endHour.toString().padStart(2, '0')}:${endMinute}`;
    }

    const daysRegex = /(Monday|Tuesday|Wednesday|Thursday|Friday)(?:\s*&\s*|\s*,\s*)?(Monday|Tuesday|Wednesday|Thursday|Friday)?/i;
    const daysMatch = course.courseSchedule.match(daysRegex);
    const days = daysMatch 
      ? [daysMatch[1]].concat(daysMatch[2] || [])
        .filter(Boolean)
        .map(day => day.substring(0, 3))
      : [];

    const formattedCourse = {
      id: course.courseCode || course.id,
      courseTitle: course.courseTitle || course.name,
      name: course.courseTitle || course.name,
      section: course.section || '01',
      days: days,
      startTime: startTime,
      endTime: endTime,
      instructor: course.instructor,
      courseSchedule: course.courseSchedule,
      courseDates: course.courseDates,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      selected: true
    };

    const savedPlanningData = JSON.parse(localStorage.getItem('coursePlanningData') || '{}');
    if (!savedPlanningData[selectedSubject]) {
      savedPlanningData[selectedSubject] = {
        '9th': [], '10th': [], '11th': [], '12th': []
      };
    }

    if (!savedPlanningData[selectedSubject][selectedYear]) {
      savedPlanningData[selectedSubject][selectedYear] = [];
    }

    savedPlanningData[selectedSubject][selectedYear].push(formattedCourse);
    localStorage.setItem('coursePlanningData', JSON.stringify(savedPlanningData));
    console.log('Saved planning data:', savedPlanningData);

    const savedScheduleData = JSON.parse(localStorage.getItem('scheduleData') || '{}');
    if (!savedScheduleData[selectedTerm]) {
      savedScheduleData[selectedTerm] = [];
    }

    savedScheduleData[selectedTerm].push(formattedCourse);
    localStorage.setItem('scheduleData', JSON.stringify(savedScheduleData));
    console.log('Saved schedule data:', savedScheduleData);

    onPlan({
      course: formattedCourse,
      year: selectedYear,
      term: selectedTerm,
      subject: selectedSubject
    });
    
    onClose();
    navigate('/course-planning');
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Plan Course</h2>
        
        <div style={styles.courseInfo}>
          <h3>{course.courseTitle || course.name}</h3>
          <p>{course.courseCode} - {course.instructor}</p>
          <p>{course.courseSchedule || `${course.days?.join(', ')} ${course.startTime}-${course.endTime}`}</p>
          <p>{course.courseDates}</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Grade Year*</label>
          <select
            style={styles.input}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            required
          >
            <option value="">Select a grade</option>
            {years.map(year => (
              <option key={year} value={year}>{year} Grade</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Term*</label>
          <select
            style={styles.input}
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            required
          >
            <option value="">Select a term</option>
            {terms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Subject*</label>
          <select
            style={styles.input}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option key={subject.key} value={subject.key}>{subject.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            style={styles.submitButton}
            disabled={!selectedYear || !selectedTerm || !selectedSubject}
          >
            Plan Course
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  title: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1.5rem',
  },
  courseInfo: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    '&:disabled': {
      backgroundColor: '#a0aec0',
      cursor: 'not-allowed',
    },
  }
};

export default PlanningModal; 