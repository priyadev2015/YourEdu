import React, { useState } from 'react';

const AttendanceTracker = ({ attendance = [], students = [], onSave }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHistory, setShowHistory] = useState(false);

  const statuses = ['Present', 'Absent', 'Late', 'Excused'];

  const getAttendanceForDate = (date) => {
    const existingAttendance = attendance.find(a => a.date === date);
    
    if (existingAttendance) {
      return existingAttendance;
    }

    return {
      date,
      records: students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        status: 'Present'
      }))
    };
  };

  if (students.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No students have been added to this course yet.</p>
        <p>Add students to begin tracking attendance.</p>
      </div>
    );
  }

  const handleStatusChange = (studentId, newStatus) => {
    const currentAttendance = getAttendanceForDate(selectedDate);
    const updatedRecords = currentAttendance.records.map(record =>
      record.studentId === studentId ? { ...record, status: newStatus } : record
    );

    const updatedAttendance = attendance.filter(a => a.date !== selectedDate);
    updatedAttendance.push({
      date: selectedDate,
      records: updatedRecords
    });

    onSave(updatedAttendance);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return '#28a745';
      case 'Absent': return '#dc3545';
      case 'Late': return '#ffc107';
      case 'Excused': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getAttendanceStats = () => {
    const stats = {
      total: attendance.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    attendance.forEach(day => {
      day.records.forEach(record => {
        stats[record.status.toLowerCase()]++;
      });
    });

    return stats;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Attendance Tracker</h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={styles.historyButton}
        >
          {showHistory ? 'Show Today' : 'View History'}
        </button>
      </div>

      {!showHistory ? (
        <div style={styles.todaySection}>
          <div style={styles.dateSelector}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          <div style={styles.attendanceGrid}>
            {getAttendanceForDate(selectedDate).records.map(record => (
              <div key={record.studentId} style={styles.studentRow}>
                <span style={styles.studentName}>{record.studentName}</span>
                <div style={styles.statusButtons}>
                  {statuses.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(record.studentId, status)}
                      style={{
                        ...styles.statusButton,
                        backgroundColor: getStatusColor(status),
                        opacity: record.status === status ? 1 : 0.6
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.historySection}>
          <div style={styles.statsCards}>
            {Object.entries(getAttendanceStats()).map(([key, value]) => (
              <div key={key} style={styles.statCard}>
                <h4 style={styles.statTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                <span style={styles.statValue}>{value}</span>
              </div>
            ))}
          </div>

          <div style={styles.historyList}>
            {attendance.sort((a, b) => new Date(b.date) - new Date(a.date)).map(day => (
              <div key={day.date} style={styles.historyDay}>
                <h4 style={styles.historyDate}>
                  {new Date(day.date).toLocaleDateString()}
                </h4>
                <div style={styles.historyRecords}>
                  {day.records.map(record => (
                    <div key={record.studentId} style={styles.historyRecord}>
                      <span style={styles.historyName}>{record.studentName}</span>
                      <span style={{
                        ...styles.historyStatus,
                        backgroundColor: getStatusColor(record.status)
                      }}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#333',
  },
  historyButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  dateSelector: {
    marginBottom: '1.5rem',
  },
  dateInput: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    width: '200px',
  },
  attendanceGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  studentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #eee',
  },
  studentName: {
    fontSize: '1rem',
    color: '#333',
    flex: 1,
  },
  statusButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  statusButton: {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'opacity 0.2s',
  },
  statsCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    textAlign: 'center',
    border: '1px solid #eee',
  },
  statTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.875rem',
    color: '#666',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  historyDay: {
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    padding: '1rem',
    border: '1px solid #eee',
  },
  historyDate: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  historyRecords: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  historyRecord: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: 'white',
    borderRadius: '4px',
  },
  historyName: {
    fontSize: '0.875rem',
    color: '#333',
  },
  historyStatus: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.75rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
};

export default AttendanceTracker; 