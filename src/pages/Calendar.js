import React, { useState } from 'react';
import { Calendar as AntCalendar, Badge } from 'antd';
import dayjs from 'dayjs';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  // Mock data for calendar events
  const [events] = useState([
    {
      type: 'deadline',
      title: 'Course Registration Deadline',
      date: '2025-01-15',
    },
    {
      type: 'assessment',
      title: 'Math Assessment',
      date: '2025-01-20',
    },
    {
      type: 'filing',
      title: 'State Filing Due',
      date: '2025-01-31',
    },
    {
      type: 'event',
      title: 'Virtual College Fair',
      date: '2025-02-05',
    },
  ]);

  const getListData = (value) => {
    const date = value.format('YYYY-MM-DD');
    return events.filter(event => event.date === date);
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={styles.events}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge 
              status={getBadgeStatus(item.type)} 
              text={item.title} 
              style={styles.badge}
            />
          </li>
        ))}
      </ul>
    );
  };

  const getBadgeStatus = (type) => {
    switch (type) {
      case 'deadline':
        return 'error';
      case 'assessment':
        return 'warning';
      case 'filing':
        return 'processing';
      case 'event':
        return 'success';
      default:
        return 'default';
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const headerRender = ({ value }) => {
    const formattedDate = value.format('MMMM YYYY');
    return (
      <div style={styles.headerContainer}>
        <button onClick={handlePrevMonth} style={styles.arrowButton}>
          <LeftOutlined />
        </button>
        <span style={styles.monthDisplay}>{formattedDate}</span>
        <button onClick={handleNextMonth} style={styles.arrowButton}>
          <RightOutlined />
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Calendar</h1>
        <div style={styles.legend}>
          <Badge status="error" text="Deadlines" />
          <Badge status="warning" text="Assessments" />
          <Badge status="processing" text="Filings" />
          <Badge status="success" text="Events" />
        </div>
      </div>
      
      <AntCalendar 
        cellRender={dateCellRender}
        mode="month"
        value={currentDate}
        headerRender={headerRender}
        style={styles.calendar}
      />
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: '800px',
  },
  header: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px 0',
    gap: '24px',
  },
  arrowButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04)',
    },
  },
  monthDisplay: {
    fontSize: '16px',
    fontWeight: '500',
    minWidth: '140px',
    textAlign: 'center',
  },
  legend: {
    display: 'flex',
    gap: '16px',
  },
  events: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  badge: {
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  calendar: {
    backgroundColor: '#ffffff',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    height: 'calc(100% - 80px)',
  },
};

export default Calendar; 