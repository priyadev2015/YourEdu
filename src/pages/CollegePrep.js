import React from 'react';
import { Container } from '@mui/material';
import { BsPencil, BsBook, BsCalendar, BsCheckCircle } from 'react-icons/bs';

const CollegePrep = () => {
  const testPrepTips = [
    {
      title: 'SAT/ACT Strategy',
      description: 'Develop a structured study plan that fits your schedule and learning style.',
      examples: [
        'Weak: "Study when you can"',
        'Strong: "Dedicate 2 hours daily, focusing on weak areas identified through practice tests"'
      ]
    },
    {
      title: 'Practice Tests',
      description: 'Take regular practice tests under timed conditions to build familiarity and confidence.',
      examples: [
        'Weak: "Do some practice questions"',
        'Strong: "Complete one full practice test every two weeks, review mistakes thoroughly"'
      ]
    },
    {
      title: 'Subject Focus',
      description: 'Prioritize subjects based on your strengths and college program requirements.',
      examples: [
        'Weak: "Study everything equally"',
        'Strong: "Allocate extra time to math if applying for STEM programs"'
      ]
    }
  ];

  const timelineSteps = [
    {
      title: 'Junior Year Fall',
      description: 'Begin SAT/ACT prep, research colleges, plan campus visits'
    },
    {
      title: 'Junior Year Spring',
      description: 'Take SAT/ACT, start college essays, prepare activity list'
    },
    {
      title: 'Senior Year Fall',
      description: 'Complete applications, request recommendations, submit early applications'
    },
    {
      title: 'Senior Year Winter',
      description: 'Submit regular applications, apply for scholarships, complete FAFSA'
    }
  ];

  const keyResources = [
    'Khan Academy - Free SAT preparation and practice tests',
    'Common App - Streamlined college application platform',
    'College Board BigFuture - College search and planning tools',
    'FAFSA - Federal student aid application',
    'College Essay Guy - Essay writing resources and tips'
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
            Test Preparation Tips
          </h3>
          <div style={styles.tipsGrid}>
            {testPrepTips.map((tip, index) => (
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
            <BsCalendar style={styles.sectionIcon} />
            Application Timeline
          </h3>
          <div style={styles.stepsGrid}>
            {timelineSteps.map((step, index) => (
              <div key={index} style={styles.stepCard}>
                <div style={styles.stepNumber}>{index + 1}</div>
                <div style={styles.stepContent}>
                  <h4 style={styles.stepTitle}>{step.title}</h4>
                  <p style={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <BsBook style={styles.sectionIcon} />
            Key Resources
          </h3>
          <div style={styles.mistakesCard}>
            {keyResources.map((resource, index) => (
              <div key={index} style={styles.mistakeItem}>
                <BsCheckCircle style={styles.checkIcon} />
                <span>{resource}</span>
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
  stepsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  stepCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3182CE',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3748',
  },
  stepDescription: {
    fontSize: '14px',
    color: '#4A5568',
    margin: 0,
  },
  mistakesCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },
  mistakeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  checkIcon: {
    fontSize: '16px',
    color: '#48BB78',
  },
};

export default CollegePrep;
