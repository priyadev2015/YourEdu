import SierraCollege from '../assets/College Logos/Sierra College.png'
import Polygence from '../assets/polygence.png'
import FoothillCollege from '../assets/College Logos/Foothill College.png'
import DeAnzaCollege from '../assets/College Logos/DeAnzaCollege.png'
import SanFranciscoCityCollege from '../assets/College Logos/CCSF.png'
import MissionCollege from '../assets/College Logos/Mission College.png'
import DescriptionIcon from '@mui/icons-material/Description'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AssignmentIcon from '@mui/icons-material/Assignment'
import NotesIcon from '@mui/icons-material/Notes'
import FolderIcon from '@mui/icons-material/Folder'

// Course schedule constants
export const DAYS_OF_WEEK = [
  { value: 'M', shortLabel: 'Mon', label: 'Monday' },
  { value: 'T', shortLabel: 'Tue', label: 'Tuesday' },
  { value: 'W', shortLabel: 'Wed', label: 'Wednesday' },
  { value: 'R', shortLabel: 'Thu', label: 'Thursday' },
  { value: 'F', shortLabel: 'Fri', label: 'Friday' },
  { value: 'S', shortLabel: 'Sat', label: 'Saturday' },
  { value: 'U', shortLabel: 'Sun', label: 'Sunday' },
]

// Term-related constants
export const TERM_STARTS = ['Fall', 'Winter', 'Spring', 'Summer']

export const TERM_DURATIONS = [
  { value: 'quarter', label: 'Quarter' },
  { value: 'semester', label: 'Semester' },
  { value: 'school year', label: 'School Year' },
  { value: 'summer', label: 'Summer' },
  { value: '6 weeks', label: '6 Weeks' },
  { value: '8 weeks', label: '8 Weeks' },
  { value: '12 weeks', label: '12 Weeks' },
]

// Page section definitions
export const COURSE_PAGE_SECTIONS = [
  { id: 'info', label: 'Course Information' },
  { id: 'materials', label: 'Course Materials' },
  { id: 'modules', label: 'Course Modules' },
  { id: 'grading', label: 'Grading' },
]

// Add provider configuration map
export const PROVIDER_CONFIG = {
  'Sierra College': {
    logo: SierraCollege,
    lmsUrl: 'https://sierra.instructure.com/login/ldap',
    logoHeight: 40, // Adjust based on logo dimensions
  },
  'Foothill College': {
    logo: FoothillCollege,
    lmsUrl: 'https://foothill.instructure.com/login/ldap',
    logoHeight: 40, // Adjust based on logo dimensions
  },
  'Foothill': {
    logo: FoothillCollege,
    lmsUrl: 'https://foothill.instructure.com/login/ldap',
    logoHeight: 40, // Adjust based on logo dimensions
  },
  'DeAnza': {
    logo: DeAnzaCollege,
    lmsUrl: 'https://deanza.instructure.com/login/ldap',
    logoHeight: 40, // Adjust based on logo dimensions
  },
  'CCSF': {
    logo: SanFranciscoCityCollege,
    lmsUrl: 'https://ccsf.instructure.com/login/ldap',
    logoHeight: 40, // Adjust based on logo dimensions
  },
  'Mission College': {
    logo: MissionCollege,
    lmsUrl: 'https://missioncollege.instructure.com/login/ldap',
    logoHeight: 40, // Adjust based on logo dimensions
  },
  'Mission': {
    logo: MissionCollege,
    lmsUrl: 'https://missioncollege.instructure.com/login/ldap',
    logoHeight: 40, // Adjust based on logo dimensions
  },
  Polygence: {
    logo: Polygence,
    lmsUrl: 'https://app.polygence.org/user/login',
    logoHeight: 32, // Adjust based on logo dimensions
  },
}

// Add material categories
export const MATERIAL_CATEGORIES = [
  { id: 'syllabus', label: 'Syllabus', icon: DescriptionIcon },
  { id: 'readings', label: 'Readings', icon: MenuBookIcon },
  { id: 'problem_sets', label: 'Problem Sets', icon: AssignmentIcon },
  { id: 'lecture_notes', label: 'Lecture Notes', icon: NotesIcon }
]

// Add assignment type options
export const ASSIGNMENT_TYPES = [
  'Essay',
  'Problem Set',
  'Project',
  'Presentation',
  'Quiz',
  'Test',
  'Lab Report',
  'Discussion',
  'Research Paper',
  'Other',
]

export const EDITABLE_FIELDS = {
  title: true,
  description: true,
  hs_subject: true,
  units: true,
  total_hours: true,
  instruction_method: true,
  evaluation_method: true,
  days: true,
  times: true,
  year: true,
  term_start: true,
  term_duration: true,
  textbooks: true,
  materials: true,
  teacher: true,
}
