import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'

const TranscriptDocument = ({ data }) => (
  <Document>
    <Page style={pdfStyles.page}>
      {/* Header Section */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.studentName}>{data.name}</Text>
        <Text style={pdfStyles.title}>High School Transcript</Text>
      </View>

      {/* Student and School Information */}
      <View style={pdfStyles.section}>
        <View style={pdfStyles.rowCentered}>
          <View style={pdfStyles.column}>
            <Text style={pdfStyles.underlineBold}>Student Information</Text>
            <Text style={pdfStyles.text}>{data.name}</Text>
            <Text style={pdfStyles.text}>{data.address}</Text>
            <Text style={pdfStyles.text}>{`${data.city}, ${data.state} ${data.zip}`}</Text>
            <Text style={pdfStyles.text}>
              DOB:{' '}
              {data.dob
                ? new Date(data.dob + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  })
                : 'No Date Provided'}
            </Text>
            <Text style={pdfStyles.text}>{data.studentEmail}</Text>
          </View>

          <View style={pdfStyles.column}>
            <Text style={pdfStyles.underlineBold}>School Information</Text>
            <Text style={pdfStyles.text}>{data.schoolName}</Text>
            <Text style={pdfStyles.text}>{data.schoolAddress}</Text>
            <Text style={pdfStyles.text}>{`${data.schoolCity}, ${data.schoolState} ${data.schoolZip}`}</Text>
            <Text style={pdfStyles.text}>Phone: {data.schoolPhone}</Text>
            <Text style={pdfStyles.text}>Contact: {data.parentGuardian}</Text>
            <Text style={pdfStyles.text}>{data.parentEmail}</Text>
          </View>

          <View style={pdfStyles.column}>
            <Text style={pdfStyles.underlineBold}>Issue Date</Text>
            <Text style={pdfStyles.text}>{new Date().toLocaleDateString('en-US')}</Text>
            <Text style={pdfStyles.underlineBold}>Graduation Date</Text>
            <Text style={pdfStyles.text}>
              {data.projectedGradDate
                ? new Date(data.projectedGradDate + 'T00:00:00').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  })
                : 'No Date Provided'}
            </Text>
          </View>
        </View>
      </View>

      {/* Pre-High School Section */}
      {data.preHighSchoolCourses?.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.bold}>Pre-High School, {data.preHighSchoolYear}</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.courseTitleCellWide, pdfStyles.tableHeader]}>Course Title</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableHeader]}>T1</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableHeader]}>T2</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableHeader]}>T3</Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.tableHeader]}>Credit</Text>
            </View>
            {data.preHighSchoolCourses.map((course, i) => (
              <View key={i} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.courseTitleCellWide}>{course.courseTitle}</Text>
                <Text style={pdfStyles.tableCell}>{course.term1Grade}</Text>
                <Text style={pdfStyles.tableCell}>{course.term2Grade}</Text>
                <Text style={pdfStyles.tableCell}>{course.term3Grade}</Text>
                <Text style={pdfStyles.tableCell}>{course.credits}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* High School Courses in 2x2 Grid */}
      <View style={pdfStyles.quadrants}>
        {['9thCourses', '10thCourses', '11thCourses', '12thCourses'].map(
          (grade) =>
            data[grade]?.length > 0 && (
              <View key={grade} style={pdfStyles.quadrant}>
                <Text style={pdfStyles.bold}>
                  {`${gradeMapping[grade]}, ${data[`${grade.replace('Courses', '')}Year`]}`}
                </Text>
                <View style={pdfStyles.table}>
                  <View style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.courseTitleCellWide, pdfStyles.tableHeader]}>Course Title</Text>
                    <Text style={[pdfStyles.tableCellLeftAlign, pdfStyles.tableHeader]}>T1</Text>
                    <Text style={[pdfStyles.tableCellLeftAlign, pdfStyles.tableHeader]}>T2</Text>
                    <Text style={[pdfStyles.tableCellLeftAlign, pdfStyles.tableHeader]}>T3</Text>
                    <Text style={[pdfStyles.tableCell, pdfStyles.tableHeader]}>Credit</Text>
                  </View>
                  {data[grade].map((course, i) => (
                    <View key={i} style={pdfStyles.tableRow}>
                      <Text style={pdfStyles.courseTitleCellWide}>{course.courseTitle}</Text>
                      <Text style={pdfStyles.tableCellLeftAlign}>{course.term1Grade}</Text>
                      <Text style={pdfStyles.tableCellLeftAlign}>{course.term2Grade}</Text>
                      <Text style={pdfStyles.tableCellLeftAlign}>{course.term3Grade}</Text>
                      <Text style={pdfStyles.tableCell}>{course.credits}</Text>
                    </View>
                  ))}
                  <View style={pdfStyles.gpaBox1}>
                    <Text style={pdfStyles.bold}>Term GPA: {calculateTermGPA(data[grade])}</Text>
                  </View>
                </View>
              </View>
            )
        )}
      </View>

      {/* Summary Box */}
      <View style={pdfStyles.fullWidthBox}>
        <View style={pdfStyles.twoColumnSection}>
          {/* Cumulative Summary */}
          <View style={pdfStyles.column50}>
            <Text style={pdfStyles.underlineBold}>Cumulative Summary</Text>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Total Credits: </Text>
              <Text style={pdfStyles.text}>{data.cumulativeSummary.totalCredits}</Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Unweighted GPA: </Text>
              <Text style={pdfStyles.text}>{data.cumulativeSummary.cumulativeGPA}</Text>
            </View>
            {data.cumulativeSummary.weightedGPA && (
              <View style={pdfStyles.summaryRow}>
                <Text style={pdfStyles.summaryLabel}>Weighted GPA: </Text>
                <Text style={pdfStyles.text}>{data.cumulativeSummary.weightedGPA}</Text>
              </View>
            )}
          </View>

          {/* Test Scores */}
          {data.testScores && (
            <View style={pdfStyles.column50}>
              <Text style={pdfStyles.underlineBold}>Test Scores</Text>
              <Text style={pdfStyles.text}>{data.testScores}</Text>
            </View>
          )}
        </View>

        {/* Miscellaneous */}
        {data.miscellaneous && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.underlineBold}>Miscellaneous</Text>
            <Text style={pdfStyles.text}>{data.miscellaneous}</Text>
          </View>
        )}
      </View>

      {/* Certification and Signature */}
      <Text style={pdfStyles.italic}>
        I hereby certify and affirm that this is the official transcript and record of {data.name} in their high school
        academic studies.
      </Text>
      <View style={pdfStyles.signatureSection}>
        <Text>
          <Text style={pdfStyles.text}>Signature:</Text>
          <Text style={pdfStyles.signatureFont}> {data.signatureFullName || data.parentGuardian}</Text>
        </Text>
        <Text style={pdfStyles.signatureDate}>Date: {data.signatureDate ? new Date(data.signatureDate + 'T00:00:00').toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US')}</Text>
      </View>

      {/* YourEDU Stamp */}
      <View style={pdfStyles.copyrightContainer}>
        <Text style={pdfStyles.stamp}>Created by YourEDU ©</Text>
      </View>
    </Page>
  </Document>
)

// Helper function to calculate Term GPA
const calculateTermGPA = (courses) => {
  const gradeValues = {
    'A+': 4.3,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    'C-': 1.7,
    'D+': 1.3,
    D: 1.0,
    'D-': 0.7,
    F: 0,
  }

  let totalCredits = 0
  let totalPoints = 0

  courses.forEach((course) => {
    const credits = parseFloat(course.credits) || 0
    const termGrades = [course.term1Grade, course.term2Grade, course.term3Grade]

    const validTermGrades = termGrades.filter((termGrade) => gradeValues[termGrade] !== undefined)

    if (validTermGrades.length > 0) {
      const creditPerTerm = credits / validTermGrades.length

      validTermGrades.forEach((termGrade) => {
        totalCredits += creditPerTerm
        totalPoints += creditPerTerm * gradeValues[termGrade]
      })
    }
  })

  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 'N/A'
}

// Replace the grade mapping in the courses section
const gradeMapping = {
  '9thCourses': '9th Grade',
  '10thCourses': '10th Grade',
  '11thCourses': '11th Grade',
  '12thCourses': '12th Grade',
}

export default TranscriptDocument
