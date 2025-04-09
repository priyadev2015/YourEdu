import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define entry type colors
const entryTypeStyles = {
  achievement: { color: '#2196f3', bgColor: '#e3f2fd' },
  project: { color: '#4caf50', bgColor: '#e8f5e9' },
  certification: { color: '#9c27b0', bgColor: '#f3e5f5' },
  skill: { color: '#ff9800', bgColor: '#fff3e0' },
  course: { color: '#f44336', bgColor: '#ffebee' },
  research: { color: '#3f51b5', bgColor: '#e8eaf6' },
  art: { color: '#e91e63', bgColor: '#fce4ec' },
  language: { color: '#009688', bgColor: '#e0f2f1' },
  innovation: { color: '#ff5722', bgColor: '#fbe9e7' }
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: 1,
    borderColor: '#e0e0e0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  entryContent: {
    flexDirection: 'row',
    gap: 15,
  },
  entryMainContent: {
    flex: 1,
  },
  entryImageContainer: {
    width: 100,
    marginLeft: 15,
  },
  entryImage: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    borderRadius: 4,
  },
  entryTypeContainer: {
    padding: '4 8',
    borderRadius: 4,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  entryType: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  entryTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  entryDate: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 8,
  },
  entryDescription: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 10,
    color: '#2c3e50',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
  },
  skill: {
    fontSize: 10,
    padding: '4 8',
    borderRadius: 4,
  },
  divider: {
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
    marginVertical: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666666',
    fontSize: 10,
    borderTop: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  evidence: {
    fontSize: 10,
    color: '#1976d2',
    textDecoration: 'underline',
    marginTop: 5,
  },
});

const LedgerPDF = ({ entries, header }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{header.title}</Text>
        <Text style={styles.subtitle}>{header.subtitle}</Text>
      </View>

      {entries.map((entry, index) => {
        const typeStyle = entryTypeStyles[entry.type] || entryTypeStyles.project;
        
        return (
          <View key={entry.id} style={styles.section}>
            <View style={[styles.entryTypeContainer, { backgroundColor: typeStyle.bgColor }]}>
              <Text style={[styles.entryType, { color: typeStyle.color }]}>
                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
              </Text>
            </View>
            
            <View style={styles.entryContent}>
              <View style={styles.entryMainContent}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
                
                <Text style={styles.entryDescription}>{entry.description}</Text>
                
                {entry.evidence_url && (
                  <Text style={styles.evidence}>
                    Evidence: {entry.evidence_url}
                  </Text>
                )}
                
                {entry.skills && entry.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {entry.skills.map((skill, skillIndex) => (
                      <Text 
                        key={skillIndex} 
                        style={[
                          styles.skill,
                          { 
                            backgroundColor: typeStyle.bgColor,
                            color: typeStyle.color
                          }
                        ]}
                      >
                        {skill}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              
              {entry.image_url && (
                <View style={styles.entryImageContainer}>
                  <Image 
                    src={entry.image_url} 
                    style={styles.entryImage}
                  />
                </View>
              )}
            </View>
          </View>
        );
      })}

      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} • {header.title}
      </Text>
    </Page>
  </Document>
);

export default LedgerPDF; 