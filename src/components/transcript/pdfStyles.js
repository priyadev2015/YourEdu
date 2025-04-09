import { StyleSheet } from '@react-pdf/renderer'
import { theme } from '../../theme/theme'

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 0,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
    color: theme.palette.primary.main,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: theme.palette.text.primary,
  },
  section: {
    marginBottom: 10,
  },
  rowCentered: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    gap: 40,
  },
  column: {
    flex: 1,
    textAlign: 'left',
    maxWidth: '30%',
    marginHorizontal: 10,
  },
  text: {
    fontSize: 10,
    marginTop: 0,
    marginBottom: 2,
    color: theme.palette.text.primary,
  },
  underlineBold: {
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginBottom: 2,
    color: theme.palette.primary.main,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  tableHeader: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableCell: {
    flexGrow: 1,
    flexBasis: '12%',
    padding: 3,
    textAlign: 'center',
  },
  tableCellLeftAlign: {
    flexGrow: 1,
    flexBasis: '12%',
    padding: 3,
    textAlign: 'left',
  },
  courseTitleCellWide: {
    flexBasis: '50%',
    textAlign: 'left',
    padding: 3,
  },
  quadrants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  quadrant: {
    width: '48%',
    marginBottom: 3,
  },
  gpaBox1: {
    borderWidth: 1,
    borderColor: theme.palette.divider,
    padding: 5,
    marginTop: 5,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  fullWidthBox: {
    borderWidth: 1,
    borderColor: theme.palette.divider,
    padding: 3,
    marginTop: 3,
    marginBottom: 3,
    width: '100%',
  },
  twoColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  column50: {
    flex: 1,
    maxWidth: '50%',
    textAlign: 'left',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 2,
  },
  summaryLabel: {
    fontFamily: 'Helvetica-Bold',
    width: '60%',
    textAlign: 'left',
  },
  italic: {
    fontFamily: 'Helvetica',
    fontStyle: 'italic',
    marginTop: 0,
    marginBottom: 2,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  signatureLine: {
    fontFamily: 'Helvetica',
    width: '60%',
    textDecorationLine: 'underline',
  },
  signatureFont: {
    fontFamily: 'Times-Italic',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  signatureDate: {
    fontFamily: 'Helvetica',
    fontStyle: 'italic',
    textAlign: 'right',
    width: '40%',
    marginBottom: 1,
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  stamp: {
    fontSize: 8,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    color: theme.palette.text.secondary,
  },
})
