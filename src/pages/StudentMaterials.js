import React from 'react';
import { Container } from '@mui/material';
import { BsPencil, BsCheckCircle, BsTrophy, BsFileText } from 'react-icons/bs';

const StudentMaterials = () => {
  const essayTips = [
    {
      title: 'Personal Statement',
      description: 'Your main college application essay that tells your unique story.',
      examples: [
        'Weak: "I like helping people"',
        'Strong: "Through tutoring younger students in math, I discovered my passion for education"'
      ]
    },
    {
      title: 'Supplemental Essays',
      description: 'Additional essays required by specific colleges.',
      examples: [
        'Weak: "Your college is good"',
        'Strong: "The research opportunities in quantum computing at your university align with my interests"'
      ]
    },
    {
      title: 'Activity Essays',
      description: 'Short descriptions of your extracurricular activities and achievements.',
      examples: [
        'Weak: "Member of debate club"',
        'Strong: "Led debate team to state finals, developing public speaking and research skills"'
      ]
    }
  ];

  const testScores = [
    {
      title: 'SAT/ACT Scores',
      description: 'Track your standardized test scores and improvement over time.',
      date: 'Last Updated: June 2024'
    },
    {
      title: 'AP/IB Exams',
      description: 'Record scores from Advanced Placement or International Baccalaureate tests.',
      date: 'Last Updated: July 2024'
    },
    {
      title: 'Subject Tests',
      description: 'Keep track of SAT Subject Tests or other specialized exams.',
      date: 'Last Updated: May 2024'
    }
  ];

  const activities = [
    'Leadership roles and positions',
    'Academic competitions and achievements',
    'Community service and volunteer work',
    'Sports and athletic achievements',
    'Arts and creative pursuits',
    'Research projects and publications'
  ];

  return (
    <Container 
      maxWidth="var(--container-max-width)"
      sx={{ 
        px: 'var(--container-padding-x)',
        py: 'var(--spacing-6)',
        '@media (--tablet)': {
          px: 'var(--container-padding-x-mobile)',
        },
      }}
    >
      <div style={styles.content}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <BsPencil style={styles.sectionIcon} />
            Essay Writing Tips
          </h3>
          <div style={styles.tipsGrid}>
            {essayTips.map((tip, index) => (
              <div key={index} style={styles.tipCard}>
                <h4 style={styles.tipTitle}>{tip.title}</h4>
                <p style={styles.tipDescription}>{tip.description}</p>
                <div style={styles.examplesSection}>
                  <div style={styles.exampleLabel}>Examples:</div>
                  {tip.examples.map((example, i) => (
                    <div key={i} style={styles.example}>
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <BsTrophy style={styles.sectionIcon} />
            Test Score Tracking
          </h3>
          <div style={styles.scoresGrid}>
            {testScores.map((score, index) => (
              <div key={index} style={styles.scoreCard}>
                <div style={styles.scoreContent}>
                  <h4 style={styles.scoreTitle}>{score.title}</h4>
                  <p style={styles.scoreDescription}>{score.description}</p>
                  <span style={styles.scoreDate}>{score.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <BsFileText style={styles.sectionIcon} />
            Activities & Achievements
          </h3>
          <div style={styles.activitiesCard}>
            {activities.map((activity, index) => (
              <div key={index} style={styles.activityItem}>
                <BsCheckCircle style={styles.checkIcon} />
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

const styles = {
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-card)',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid hsl(var(--neutral-200))',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '0 0 24px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: 'hsl(var(--text-primary))',
  },
  sectionIcon: {
    fontSize: '24px',
    color: 'hsl(var(--brand-primary))',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  tipCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  tipTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3748',
  },
  tipDescription: {
    fontSize: '14px',
    color: '#4A5568',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  examplesSection: {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    padding: '16px',
  },
  exampleLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: '8px',
  },
  example: {
    fontSize: '14px',
    color: '#718096',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: '#f7fafc',
    marginBottom: '8px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  scoreCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  scoreContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  scoreTitle: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3748',
  },
  scoreDescription: {
    fontSize: '14px',
    color: '#4A5568',
    margin: '0',
  },
  scoreDate: {
    fontSize: '12px',
    color: '#718096',
    fontStyle: 'italic',
  },
  activitiesCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#4A5568',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  checkIcon: {
    fontSize: '16px',
    color: '#48BB78',
  },
};

export default StudentMaterials;