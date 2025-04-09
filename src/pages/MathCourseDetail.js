import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Container } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import { cardStyles } from '../styles/theme/components/cards';

const MathCourseDetail = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Get return state from location or use defaults
    const returnTab = location.state?.returnTab || 'tracks';
    const returnSubject = location.state?.returnSubject || 'math';
    
    // Build the query parameters
    const params = new URLSearchParams();
    params.set('tab', returnTab);
    if (returnTab === 'tracks' || returnTab === 'ag-requirements') {
      params.set('subject', returnSubject);
    }
    
    // Navigate back with preserved state
    navigate(`/course-planning?${params.toString()}`);
  };

  const courseDetails = {
    'algebra-1': {
      title: 'Algebra 1',
      description: 'Fundamental concepts of algebra including linear equations, systems of equations, inequalities, functions, polynomials, and rational expressions.',
      typicalGrade: '9th grade',
      prerequisites: 'Pre-Algebra or equivalent',
      nextCourses: ['Geometry', 'Geometry H'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Algebra 1, CPM Core Connections Algebra',
      },
      tracks: {
        standard: 'Foundation for UC/CSU A-G requirements',
      }
    },
    'algebra-1-min': {
      title: 'Algebra 1 (Minimum)',
      description: 'Essential algebra concepts focused on practical applications and basic problem-solving.',
      typicalGrade: '9th grade',
      prerequisites: 'Pre-Algebra',
      nextCourses: ['Geometry (Minimum)'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Algebra 1 Foundations',
      },
      tracks: {
        minimum: 'Meets basic graduation requirements'
      }
    },
    'geometry': {
      title: 'Geometry',
      description: 'Study of geometric concepts including lines, angles, triangles, polygons, circles, and solid figures.',
      typicalGrade: '10th grade',
      prerequisites: 'Algebra 1',
      nextCourses: ['Algebra 2'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Geometry',
      },
      tracks: {
        standard: 'Standard college-prep pathway'
      }
    },
    'geometry-h': {
      title: 'Geometry Honors',
      description: 'Advanced geometry course with emphasis on proofs, transformations, and complex geometric relationships.',
      typicalGrade: '9th grade',
      prerequisites: 'Algebra 1 with A grade',
      nextCourses: ['Algebra 2/Trigonometry Honors'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Geometry Advanced',
      },
      tracks: {
        advanced: 'Accelerated honors pathway'
      }
    },
    'geometry-min': {
      title: 'Geometry (Minimum)',
      description: 'Basic geometric concepts with focus on practical applications.',
      typicalGrade: '10th grade',
      prerequisites: 'Algebra 1 (Minimum)',
      nextCourses: ['Algebra 2 (Minimum)'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Geometry Foundations',
      },
      tracks: {
        minimum: 'Meets basic graduation requirements'
      }
    },
    'algebra-2': {
      title: 'Algebra 2',
      description: 'Advanced algebraic concepts including complex numbers, polynomial functions, and exponential functions.',
      typicalGrade: '11th grade',
      prerequisites: 'Geometry',
      nextCourses: ['Precalculus', 'Statistics'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Algebra 2',
      },
      tracks: {
        standard: 'Standard college-prep pathway'
      }
    },
    'algebra-2-min': {
      title: 'Algebra 2 (Minimum)',
      description: 'Essential Algebra 2 concepts with practical applications.',
      typicalGrade: '11th grade',
      prerequisites: 'Geometry (Minimum)',
      nextCourses: ['Statistics'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Algebra 2 Foundations',
      },
      tracks: {
        minimum: 'Completes graduation requirements'
      }
    },
    'algebra-2-trig-h': {
      title: 'Algebra 2/Trigonometry Honors',
      description: 'Advanced course combining Algebra 2 and Trigonometry with complex problem-solving.',
      typicalGrade: '10th grade',
      prerequisites: 'Geometry Honors with B+ or higher',
      nextCourses: ['Analysis Honors', 'Precalculus Honors'],
      materials: {
        'Common Textbooks': 'Big Ideas Math Algebra 2 Advanced',
      },
      tracks: {
        advanced: 'Accelerated honors pathway'
      }
    },
    'precalculus': {
      title: 'Precalculus',
      description: 'Preparation for calculus including functions, trigonometry, and analytical geometry.',
      typicalGrade: '12th grade',
      prerequisites: 'Algebra 2',
      nextCourses: ['AP Calculus AB', 'Statistics'],
      materials: {
        'Common Textbooks': 'Precalculus with Limits',
      },
      tracks: {
        standard: 'Advanced college-prep pathway'
      }
    },
    'precalculus-h': {
      title: 'AP Precalculus',
      description: 'Advanced Placement course that develops students understanding of functions through mathematical modeling of change. Includes in-depth study of polynomial, rational, exponential, logarithmic, and trigonometric functions.',
      typicalGrade: '11th grade',
      prerequisites: 'Algebra 2/Trigonometry Honors with B+ or higher',
      nextCourses: ['AP Calculus AB', 'AP Calculus BC'],
      materials: {
        'Common Textbooks': 'AP Precalculus Course and Exam Description',
        'AP Exam': 'AP Precalculus Exam typically administered in May'
      },
      tracks: {
        advanced: 'Advanced college-prep pathway'
      }
    },
    'analysis-h': {
      title: 'Analysis Honors',
      description: 'Advanced mathematical analysis including limits, sequences, and introduction to calculus concepts.',
      typicalGrade: '11th grade',
      prerequisites: 'Algebra 2/Trigonometry Honors',
      nextCourses: ['AP Calculus BC'],
      materials: {
        'Common Textbooks': 'Advanced Mathematical Analysis',
      },
      tracks: {
        advanced: 'Accelerated honors pathway'
      }
    },
    'ap-calculus-bc': {
      title: 'AP Calculus BC',
      description: 'College-level calculus covering limits, derivatives, integrals, and series.',
      typicalGrade: '12th grade',
      prerequisites: 'Analysis Honors or Precalculus Honors',
      nextCourses: ['College Mathematics'],
      materials: {
        'Common Textbooks': 'Calculus: Graphical, Numerical, Algebraic AP Edition',
      },
      tracks: {
        advanced: 'Highest level high school mathematics'
      }
    },
    'ap-calculus-ab': {
      title: 'AP Calculus AB',
      description: 'College-level calculus course covering limits, derivatives, and integrals. This course is equivalent to one semester of college calculus.',
      typicalGrade: '12th grade',
      prerequisites: 'Precalculus or Precalculus Honors with B+ or higher',
      nextCourses: ['College Mathematics', 'AP Calculus BC'],
      materials: {
        'Common Textbooks': 'Calculus: Graphical, Numerical, Algebraic AP Edition',
        'AP Exam': 'AP Calculus AB Exam typically administered in May'
      },
      tracks: {
        advanced: 'Advanced college-prep pathway'
      }
    },
    'statistics': {
      title: 'Statistics',
      description: 'Study of data collection, analysis, probability, and statistical inference.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Algebra 2',
      nextCourses: ['AP Statistics'],
      materials: {
        'Common Textbooks': 'The Practice of Statistics',
      },
      tracks: {
        standard: 'Alternative advanced mathematics option'
      }
    },
    'data-science': {
      title: 'Data Science',
      description: 'Introduction to data analysis, visualization, and basic machine learning concepts.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Algebra 2',
      nextCourses: ['College Data Science'],
      materials: {
        'Common Textbooks': 'Introduction to Data Science',
      },
      tracks: {
        elective: 'Modern mathematics application'
      }
    },
    'computer-science': {
      title: 'Computer Science',
      description: 'Introduction to programming, algorithms, and computational thinking.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Algebra 2',
      nextCourses: ['AP Computer Science'],
      materials: {
        'Common Textbooks': 'Python Programming: An Introduction to Computer Science',
      },
      tracks: {
        elective: 'Technology and mathematics integration'
      }
    },
    'business-math': {
      title: 'Business Mathematics',
      description: 'Application of mathematics to business and financial scenarios.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Algebra 2',
      nextCourses: ['College Business Mathematics'],
      materials: {
        'Common Textbooks': 'Business Mathematics in a Digital World',
      },
      tracks: {
        elective: 'Practical mathematics application'
      }
    },
    'not-required': {
      title: 'Mathematics Not Required',
      description: 'No additional mathematics courses required for minimum graduation track.',
      typicalGrade: '12th grade',
      prerequisites: 'Algebra 2 (Minimum)',
      nextCourses: ['College Mathematics if pursuing higher education'],
      materials: {
        'Note': 'No materials required - course not taken'
      },
      tracks: {
        minimum: 'Completed minimum graduation requirements'
      }
    },
    'english-9': {
      title: 'English 9',
      description: 'Introduction to literature analysis, composition, and critical thinking. Covers various genres including novels, poetry, and drama.',
      typicalGrade: '9th grade',
      prerequisites: 'None',
      nextCourses: ['English 10'],
      materials: {
        'Common Textbooks': 'Pearson Literature Grade 9, Various Novels',
      },
      tracks: {
        standard: 'Standard college-prep pathway'
      }
    },
    'english-9h': {
      title: 'English 9 Honors',
      description: 'Advanced freshman English focusing on in-depth literary analysis, advanced composition, and research skills.',
      typicalGrade: '9th grade',
      prerequisites: 'Strong performance in 8th grade English',
      nextCourses: ['English 10 Honors'],
      materials: {
        'Common Textbooks': 'Advanced Literature Grade 9, College-level Novels',
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'english-10': {
      title: 'English 10',
      description: 'World literature, composition, and research skills development.',
      typicalGrade: '10th grade',
      prerequisites: 'English 9',
      nextCourses: ['English 11'],
      materials: {
        'Common Textbooks': 'World Literature Grade 10',
      },
      tracks: {
        standard: 'Standard college-prep pathway'
      }
    },
    'english-10h': {
      title: 'English 10 Honors',
      description: 'Advanced world literature analysis and complex composition skills.',
      typicalGrade: '10th grade',
      prerequisites: 'English 9 Honors',
      nextCourses: ['AP Language'],
      materials: {
        'Common Textbooks': 'Advanced World Literature Grade 10',
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'english-11': {
      title: 'English 11',
      description: 'American literature and advanced composition skills.',
      typicalGrade: '11th grade',
      prerequisites: 'English 10',
      nextCourses: ['English 12'],
      materials: {
        'Common Textbooks': 'American Literature Grade 11',
      },
      tracks: {
        standard: 'Standard college-prep pathway'
      }
    },
    'ap-lang': {
      title: 'AP English Language and Composition',
      description: 'College-level rhetoric and writing course focusing on critical thinking and analysis.',
      typicalGrade: '11th grade',
      prerequisites: 'English 10 Honors',
      nextCourses: ['AP Literature'],
      materials: {
        'Common Textbooks': 'AP Language and Composition Course Materials',
        'AP Exam': 'AP English Language Exam typically administered in May'
      },
      tracks: {
        advanced: 'Advanced placement pathway'
      }
    },
    'english-12': {
      title: 'English 12',
      description: 'British literature and college-preparatory writing.',
      typicalGrade: '12th grade',
      prerequisites: 'English 11',
      nextCourses: ['College English'],
      materials: {
        'Common Textbooks': 'British Literature Grade 12',
      },
      tracks: {
        standard: 'Standard college-prep pathway'
      }
    },
    'ap-lit': {
      title: 'AP English Literature',
      description: 'College-level literary analysis and advanced composition.',
      typicalGrade: '12th grade',
      prerequisites: 'AP Language',
      nextCourses: ['College English'],
      materials: {
        'Common Textbooks': 'AP Literature Course Materials',
        'AP Exam': 'AP English Literature Exam typically administered in May'
      },
      tracks: {
        advanced: 'Advanced placement pathway'
      }
    },
    'biology': {
      title: 'Biology',
      description: 'Study of living organisms, their structure, function, growth, and evolution.',
      typicalGrade: '9th grade',
      prerequisites: 'None',
      nextCourses: ['Chemistry', 'AP Biology'],
      materials: {
        'Common Textbooks': 'Biology: Life on Earth',
        'Lab Materials': 'Biology Lab Kit'
      },
      tracks: {
        standard: 'Core science requirement'
      }
    },
    'biology-h': {
      title: 'Biology Honors',
      description: 'Advanced study of biological concepts with extensive lab work.',
      typicalGrade: '9th grade',
      prerequisites: 'Strong math background',
      nextCourses: ['Chemistry Honors'],
      materials: {
        'Common Textbooks': 'Advanced Biology',
        'Lab Materials': 'Advanced Biology Lab Kit'
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'chemistry': {
      title: 'Chemistry',
      description: 'Study of matter, its properties, and the changes it undergoes.',
      typicalGrade: '10th grade',
      prerequisites: 'Biology, Algebra 1',
      nextCourses: ['Physics', 'AP Chemistry'],
      materials: {
        'Common Textbooks': 'Modern Chemistry',
        'Lab Materials': 'Chemistry Lab Kit'
      },
      tracks: {
        standard: 'Core science requirement'
      }
    },
    'chemistry-h': {
      title: 'Chemistry Honors',
      description: 'Advanced chemistry with complex problem-solving and lab work.',
      typicalGrade: '10th grade',
      prerequisites: 'Biology Honors, Algebra 2',
      nextCourses: ['Physics Honors'],
      materials: {
        'Common Textbooks': 'Advanced Chemistry',
        'Lab Materials': 'Advanced Chemistry Lab Kit'
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'world-hist': {
      title: 'World History',
      description: 'Survey of major events and developments in world history.',
      typicalGrade: '10th grade',
      prerequisites: 'None',
      nextCourses: ['US History', 'AP World History'],
      materials: {
        'Common Textbooks': 'World History: Patterns of Interaction'
      },
      tracks: {
        standard: 'Core history requirement'
      }
    },
    'world-hist-h': {
      title: 'World History Honors',
      description: 'Advanced study of world history with emphasis on analysis and research.',
      typicalGrade: '9th grade',
      prerequisites: 'Strong academic performance',
      nextCourses: ['US History Honors'],
      materials: {
        'Common Textbooks': 'Advanced World History',
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'us-hist': {
      title: 'US History',
      description: 'Survey of American history from colonization to present.',
      typicalGrade: '11th grade',
      prerequisites: 'World History',
      nextCourses: ['Government', 'AP US History'],
      materials: {
        'Common Textbooks': 'The American Journey'
      },
      tracks: {
        standard: 'Core history requirement'
      }
    },
    'us-hist-h': {
      title: 'US History Honors',
      description: 'In-depth analysis of American history with primary source research.',
      typicalGrade: '10th grade',
      prerequisites: 'World History Honors',
      nextCourses: ['AP Government'],
      materials: {
        'Common Textbooks': 'Advanced American History',
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'lang-1': {
      title: 'World Language 1',
      description: 'Introduction to basic vocabulary, grammar, and cultural concepts.',
      typicalGrade: '9th grade',
      prerequisites: 'None',
      nextCourses: ['Language 2'],
      materials: {
        'Common Textbooks': 'Introductory Language Series',
      },
      tracks: {
        standard: 'Standard college-prep pathway'
      }
    },
    'lang-1-h': {
      title: 'World Language 1 Honors',
      description: 'Accelerated first-year language course with advanced content.',
      typicalGrade: '9th grade',
      prerequisites: 'Strong language aptitude',
      nextCourses: ['Language 2 Honors'],
      materials: {
        'Common Textbooks': 'Advanced Language Series Level 1',
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'art-1': {
      title: 'Art 1',
      description: 'Introduction to visual arts and basic art techniques.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'None',
      nextCourses: ['Art 2', 'AP Art 2D'],
      materials: {
        'Common Materials': 'Basic Art Supply Kit'
      },
      tracks: {
        standard: 'Core arts requirement'
      }
    },
    'art-1-h': {
      title: 'Art 1 Honors',
      description: 'Advanced beginning art with emphasis on technique and creativity.',
      typicalGrade: '9th grade',
      prerequisites: 'Portfolio review',
      nextCourses: ['Art 2 Honors'],
      materials: {
        'Art Supplies': 'Advanced Art Kit',
      },
      tracks: {
        advanced: 'Advanced arts pathway'
      }
    },
    'pe-1': {
      title: 'Physical Education 1',
      description: 'Introduction to fitness, sports, and health concepts.',
      typicalGrade: '9th grade',
      prerequisites: 'None',
      nextCourses: ['PE 2'],
      materials: {
        'Equipment': 'Basic PE Equipment',
      },
      tracks: {
        standard: 'Standard PE pathway'
      }
    },
    'pe-1-h': {
      title: 'Physical Education 1 Honors',
      description: 'Advanced fitness program with sports science components.',
      typicalGrade: '9th grade',
      prerequisites: 'Athletic background',
      nextCourses: ['PE 2 Honors'],
      materials: {
        'Equipment': 'Advanced PE Equipment',
      },
      tracks: {
        advanced: 'Advanced PE pathway'
      }
    },
    'physics': {
      title: 'Physics',
      description: 'Study of matter, energy, and their interactions.',
      typicalGrade: '11th grade',
      prerequisites: 'Chemistry, Algebra 2',
      nextCourses: ['AP Physics'],
      materials: {
        'Common Textbooks': 'Conceptual Physics',
        'Lab Materials': 'Physics Lab Kit'
      },
      tracks: {
        standard: 'Advanced science course'
      }
    },
    'physics-h': {
      title: 'Physics Honors',
      description: 'Advanced physics with calculus-based problem solving.',
      typicalGrade: '11th grade',
      prerequisites: 'Chemistry Honors, Precalculus',
      nextCourses: ['AP Physics'],
      materials: {
        'Common Textbooks': 'Advanced Physics',
        'Lab Materials': 'Advanced Physics Lab Kit'
      },
      tracks: {
        advanced: 'Advanced honors pathway'
      }
    },
    'ap-science': {
      title: 'AP Science',
      description: 'Advanced Placement science course (Biology, Chemistry, or Physics).',
      typicalGrade: '12th grade',
      prerequisites: 'Honors science courses',
      nextCourses: ['College Science'],
      materials: {
        'Common Textbooks': 'AP Science Course Materials',
        'Lab Materials': 'AP Science Lab Kit'
      },
      tracks: {
        advanced: 'Advanced placement pathway'
      }
    },
    'env-sci': {
      title: 'Environmental Science',
      description: 'Study of environmental systems and human impact.',
      typicalGrade: '12th grade',
      prerequisites: 'Biology, Chemistry',
      nextCourses: ['College Science'],
      materials: {
        'Common Textbooks': 'Environmental Science: Earth as a Living Planet',
        'Lab Materials': 'Environmental Science Lab Kit'
      },
      tracks: {
        standard: 'Standard science pathway'
      }
    },
    'government': {
      title: 'Government',
      description: 'Study of American government systems and civic responsibility.',
      typicalGrade: '12th grade',
      prerequisites: 'US History',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'American Government: Principles in Practice'
      },
      tracks: {
        standard: 'Core history requirement'
      }
    },
    'ap-gov': {
      title: 'AP Government',
      description: 'College-level study of US government and politics.',
      typicalGrade: '11th grade',
      prerequisites: 'US History Honors',
      nextCourses: ['AP Economics'],
      materials: {
        'Common Textbooks': 'AP Government and Politics',
        'AP Exam': 'AP Government Exam typically administered in May'
      },
      tracks: {
        advanced: 'Advanced placement pathway'
      }
    },
    'economics': {
      title: 'Economics',
      description: 'Introduction to economic principles and financial literacy.',
      typicalGrade: '12th grade',
      prerequisites: 'Government',
      nextCourses: ['College Economics'],
      materials: {
        'Common Textbooks': 'Economics: Principles in Action'
      },
      tracks: {
        standard: 'Standard social studies pathway'
      }
    },
    'ap-econ': {
      title: 'AP Economics',
      description: 'College-level study of micro and macroeconomics.',
      typicalGrade: '12th grade',
      prerequisites: 'AP Government',
      nextCourses: ['College Economics'],
      materials: {
        'Common Textbooks': 'AP Economics Course Materials',
        'AP Exam': 'AP Economics Exam typically administered in May'
      },
      tracks: {
        advanced: 'Advanced placement pathway'
      }
    },
    'lang-2': {
      title: 'World Language 2',
      description: 'Intermediate vocabulary, grammar, and cultural concepts.',
      typicalGrade: '10th grade',
      prerequisites: 'Language 1',
      nextCourses: ['Language 3'],
      materials: {
        'Common Textbooks': 'Intermediate Language Series'
      },
      tracks: {
        standard: 'Standard language pathway'
      }
    },
    'lang-2-h': {
      title: 'World Language 2 Honors',
      description: 'Advanced second-year language course.',
      typicalGrade: '10th grade',
      prerequisites: 'Language 1 Honors',
      nextCourses: ['Language 3 Honors'],
      materials: {
        'Common Textbooks': 'Advanced Language Series Level 2'
      },
      tracks: {
        advanced: 'Advanced language pathway'
      }
    },
    'lang-3': {
      title: 'World Language 3',
      description: 'Advanced language skills and cultural understanding.',
      typicalGrade: '11th grade',
      prerequisites: 'Language 2',
      nextCourses: ['Language 4'],
      materials: {
        'Common Textbooks': 'Advanced Language Series'
      },
      tracks: {
        standard: 'Standard language pathway'
      }
    },
    'lang-3-h': {
      title: 'World Language 3 Honors',
      description: 'Advanced third-year language course.',
      typicalGrade: '11th grade',
      prerequisites: 'Language 2 Honors',
      nextCourses: ['AP Language'],
      materials: {
        'Common Textbooks': 'Advanced Language Series Level 3'
      },
      tracks: {
        advanced: 'Advanced language pathway'
      }
    },
    'lang-4': {
      title: 'World Language 4',
      description: 'Advanced language proficiency and literature.',
      typicalGrade: '12th grade',
      prerequisites: 'Language 3',
      nextCourses: ['College Language'],
      materials: {
        'Common Textbooks': 'Advanced Language Series Level 4'
      },
      tracks: {
        standard: 'Standard language pathway'
      }
    },
    'art-2': {
      title: 'Art 2',
      description: 'Intermediate art techniques and composition.',
      typicalGrade: '10th grade',
      prerequisites: 'Art 1',
      nextCourses: ['Art 3'],
      materials: {
        'Art Supplies': 'Intermediate Art Kit'
      },
      tracks: {
        standard: 'Standard arts pathway'
      }
    },
    'art-2-h': {
      title: 'Art 2 Honors',
      description: 'Advanced intermediate art techniques.',
      typicalGrade: '10th grade',
      prerequisites: 'Art 1 Honors',
      nextCourses: ['Art 3 Honors'],
      materials: {
        'Art Supplies': 'Advanced Art Kit Level 2'
      },
      tracks: {
        advanced: 'Advanced arts pathway'
      }
    },
    'art-3': {
      title: 'Art 3',
      description: 'Advanced art techniques and portfolio development.',
      typicalGrade: '11th grade',
      prerequisites: 'Art 2',
      nextCourses: ['Art 4'],
      materials: {
        'Art Supplies': 'Advanced Art Kit'
      },
      tracks: {
        standard: 'Standard arts pathway'
      }
    },
    'art-3-h': {
      title: 'Art 3 Honors',
      description: 'Advanced art techniques and portfolio preparation.',
      typicalGrade: '11th grade',
      prerequisites: 'Art 2 Honors',
      nextCourses: ['AP Art'],
      materials: {
        'Art Supplies': 'Advanced Art Kit Level 3'
      },
      tracks: {
        advanced: 'Advanced arts pathway'
      }
    },
    'art-4': {
      title: 'Art 4',
      description: 'Advanced art portfolio and exhibition preparation.',
      typicalGrade: '12th grade',
      prerequisites: 'Art 3',
      nextCourses: ['College Art'],
      materials: {
        'Art Supplies': 'Professional Art Kit'
      },
      tracks: {
        standard: 'Standard arts pathway'
      }
    },
    'ap-art': {
      title: 'AP Art',
      description: 'College-level art portfolio development.',
      typicalGrade: '12th grade',
      prerequisites: 'Art 3 Honors',
      nextCourses: ['College Art'],
      materials: {
        'Art Supplies': 'AP Art Kit',
        'AP Portfolio': 'AP Art Portfolio Requirements'
      },
      tracks: {
        advanced: 'Advanced placement pathway'
      }
    },
    'pe-2': {
      title: 'Physical Education 2',
      description: 'Advanced fitness concepts and team sports.',
      typicalGrade: '10th grade',
      prerequisites: 'PE 1',
      nextCourses: ['PE 3'],
      materials: {
        'Equipment': 'Intermediate PE Equipment'
      },
      tracks: {
        standard: 'Standard PE pathway'
      }
    },
    'pe-2-h': {
      title: 'Physical Education 2 Honors',
      description: 'Advanced fitness training and sports performance.',
      typicalGrade: '10th grade',
      prerequisites: 'PE 1 Honors',
      nextCourses: ['PE 3 Honors'],
      materials: {
        'Equipment': 'Advanced PE Equipment Level 2'
      },
      tracks: {
        advanced: 'Advanced PE pathway'
      }
    },
    'pe-3': {
      title: 'Physical Education 3',
      description: 'Specialized sports and fitness programs.',
      typicalGrade: '11th grade',
      prerequisites: 'PE 2',
      nextCourses: ['PE 4'],
      materials: {
        'Equipment': 'Advanced PE Equipment'
      },
      tracks: {
        standard: 'Standard PE pathway'
      }
    },
    'pe-3-h': {
      title: 'Physical Education 3 Honors',
      description: 'Advanced sports training and fitness science.',
      typicalGrade: '11th grade',
      prerequisites: 'PE 2 Honors',
      nextCourses: ['PE 4 Honors'],
      materials: {
        'Equipment': 'Advanced PE Equipment Level 3'
      },
      tracks: {
        advanced: 'Advanced PE pathway'
      }
    },
    'pe-4': {
      title: 'Physical Education 4',
      description: 'Advanced fitness planning and lifetime sports.',
      typicalGrade: '12th grade',
      prerequisites: 'PE 3',
      nextCourses: ['College PE'],
      materials: {
        'Equipment': 'Professional PE Equipment'
      },
      tracks: {
        standard: 'Standard PE pathway'
      }
    },
    'pe-4-h': {
      title: 'Physical Education 4 Honors',
      description: 'Elite sports training and fitness programming.',
      typicalGrade: '12th grade',
      prerequisites: 'PE 3 Honors',
      nextCourses: ['College PE'],
      materials: {
        'Equipment': 'Advanced PE Equipment Level 4'
      },
      tracks: {
        advanced: 'Advanced PE pathway'
      }
    },
    'creative-writing': {
      title: 'Creative Writing',
      description: 'Development of creative writing skills in various genres.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'English 10',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'The Creative Writer\'s Craft'
      },
      tracks: {
        elective: 'English elective'
      }
    },
    'journalism': {
      title: 'Journalism',
      description: 'Study of news writing, reporting, and media production.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'English 10',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'Journalism Today'
      },
      tracks: {
        elective: 'English elective'
      }
    },
    'public-speaking': {
      title: 'Public Speaking',
      description: 'Development of oral communication and presentation skills.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'English 10',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'The Art of Public Speaking'
      },
      tracks: {
        elective: 'English elective'
      }
    },
    'debate': {
      title: 'Debate',
      description: 'Advanced argumentation and competitive debate.',
      typicalGrade: '10th-12th grade',
      prerequisites: 'Public Speaking recommended',
      nextCourses: ['Advanced Debate'],
      materials: {
        'Common Textbooks': 'Competitive Debate: The Official Guide'
      },
      tracks: {
        elective: 'English elective'
      }
    },
    'astronomy': {
      title: 'Astronomy',
      description: 'Study of celestial objects, space, and the universe.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Biology',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'Exploring the Universe',
        'Equipment': 'Telescope and Star Charts'
      },
      tracks: {
        elective: 'Science elective'
      }
    },
    'earth-science': {
      title: 'Earth Science',
      description: 'Study of Earth\'s systems, geology, and climate.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Biology',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'Earth Science: Geology, the Environment, and the Universe',
        'Lab Materials': 'Earth Science Lab Kit'
      },
      tracks: {
        elective: 'Science elective'
      }
    },
    'marine-biology': {
      title: 'Marine Biology',
      description: 'Study of ocean ecosystems and marine life.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Biology',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'Marine Biology: Function, Biodiversity, Ecology',
        'Lab Materials': 'Marine Biology Lab Kit'
      },
      tracks: {
        elective: 'Science elective'
      }
    },
    'forensics': {
      title: 'Forensic Science',
      description: 'Application of science to criminal investigation.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Biology, Chemistry',
      nextCourses: ['Advanced Forensics'],
      materials: {
        'Common Textbooks': 'Forensic Science: An Introduction',
        'Lab Materials': 'Forensics Lab Kit'
      },
      tracks: {
        elective: 'Science elective'
      }
    },
    'psychology': {
      title: 'Psychology',
      description: 'Introduction to psychological concepts and human behavior.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'None',
      nextCourses: ['AP Psychology'],
      materials: {
        'Common Textbooks': 'Psychology: Principles in Practice'
      },
      tracks: {
        elective: 'Social science elective'
      }
    },
    'sociology': {
      title: 'Sociology',
      description: 'Study of human society and social behavior.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'None',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'Sociology and You'
      },
      tracks: {
        elective: 'Social science elective'
      }
    },
    'world-religions': {
      title: 'World Religions',
      description: 'Study of major world religions and belief systems.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'World History',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'World Religions: A Historical Approach'
      },
      tracks: {
        elective: 'Social science elective'
      }
    },
    'current-events': {
      title: 'Current Events',
      description: 'Analysis of contemporary global issues.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'None',
      nextCourses: ['International Relations'],
      materials: {
        'Common Textbooks': 'Understanding Current Events',
        'Materials': 'News Subscriptions'
      },
      tracks: {
        elective: 'Social studies elective'
      }
    },
    'conversation': {
      title: 'Conversation',
      description: 'Focus on speaking and listening skills in foreign language.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Level 2 of any language',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'Conversational Language Practice'
      },
      tracks: {
        elective: 'Language elective'
      }
    },
    'cultural-studies': {
      title: 'Cultural Studies',
      description: 'Study of cultures and traditions of various countries.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Level 2 of any language',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'Cultural Perspectives'
      },
      tracks: {
        elective: 'Language elective'
      }
    },
    'world-lit': {
      title: 'World Literature',
      description: 'Study of literature from various cultures in original languages.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Level 2 of any language',
      nextCourses: [],
      materials: {
        'Common Textbooks': 'World Literature in Translation'
      },
      tracks: {
        elective: 'Language elective'
      }
    },
    'film': {
      title: 'Foreign Film',
      description: 'Analysis of films in target language.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'Language 3',
      nextCourses: ['Advanced Film Studies'],
      materials: {
        'Common Textbooks': 'Cinema and Culture',
        'Materials': 'Film Streaming Service'
      },
      tracks: {
        elective: 'Language elective'
      }
    },
    'ceramics': {
      title: 'Ceramics',
      description: 'Introduction to ceramic art and pottery techniques.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'None',
      nextCourses: ['AP Art 3D'],
      materials: {
        'Common Materials': 'Ceramics Supply Kit'
      },
      tracks: {
        elective: 'Arts elective'
      }
    },
    'photography': {
      title: 'Photography',
      description: 'Introduction to digital and film photography.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'None',
      nextCourses: ['AP Art 2D'],
      materials: {
        'Common Materials': 'Digital Camera'
      },
      tracks: {
        elective: 'Arts elective'
      }
    },
    'digital-art': {
      title: 'Digital Art',
      description: 'Creation of art using digital tools and software.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'None',
      nextCourses: ['AP Art 2D'],
      materials: {
        'Common Materials': 'Digital Art Software'
      },
      tracks: {
        elective: 'Arts elective'
      }
    },
    'theater': {
      title: 'Theater Arts',
      description: 'Introduction to acting and theater production.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'None',
      nextCourses: ['Advanced Theater'],
      materials: {
        'Common Textbooks': 'Introduction to Theater',
        'Materials': 'Scripts and Props'
      },
      tracks: {
        elective: 'Arts elective'
      }
    },
    'team-sports': {
      title: 'Team Sports',
      description: 'Participation in various team sports and competitions.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'PE 2',
      nextCourses: [],
      materials: {
        'Required': 'PE Uniform'
      },
      tracks: {
        elective: 'PE elective'
      }
    },
    'weight-training': {
      title: 'Weight Training',
      description: 'Introduction to weight training and fitness principles.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'PE 2',
      nextCourses: [],
      materials: {
        'Required': 'PE Uniform'
      },
      tracks: {
        elective: 'PE elective'
      }
    },
    'yoga': {
      title: 'Yoga & Fitness',
      description: 'Introduction to yoga, flexibility, and mindfulness.',
      typicalGrade: '11th-12th grade',
      prerequisites: 'PE 2',
      nextCourses: [],
      materials: {
        'Required': 'Yoga Mat'
      },
      tracks: {
        elective: 'PE elective'
      }
    },
    'sports-team': {
      title: 'School Sports Team',
      description: 'Participation in competitive school sports teams.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'Coach Approval',
      nextCourses: [],
      materials: {
        'Required': 'Team Uniform'
      },
      tracks: {
        alternative: 'PE alternative'
      }
    },
    'dance-team': {
      title: 'School Dance Team',
      description: 'Participation in school dance team and performances.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'Audition',
      nextCourses: [],
      materials: {
        'Required': 'Dance Attire'
      },
      tracks: {
        alternative: 'PE alternative'
      }
    },
    'cheer-team': {
      title: 'School Cheer Team',
      description: 'Participation in school cheerleading team.',
      typicalGrade: '9th-12th grade',
      prerequisites: 'Audition',
      nextCourses: [],
      materials: {
        'Required': 'Cheer Uniform'
      },
      tracks: {
        alternative: 'PE alternative'
      }
    },
    'spanish-1': {
      title: 'Spanish 1',
      description: 'Introduction to Spanish language and culture.',
      typicalGrade: '9th grade',
      prerequisites: 'None',
      nextCourses: ['Spanish 2'],
      materials: {
        'Common Textbooks': '¡Avancemos! Level 1'
      },
      tracks: {
        standard: 'Core language requirement'
      }
    },
    'spanish-2': {
      title: 'Spanish 2',
      description: 'Intermediate Spanish language and culture.',
      typicalGrade: '10th grade',
      prerequisites: 'Spanish 1',
      nextCourses: ['Spanish 3', 'AP Spanish'],
      materials: {
        'Common Textbooks': '¡Avancemos! Level 2'
      },
      tracks: {
        standard: 'Core language requirement'
      }
    }
  };

  const course = courseDetails[courseName] || null;

  if (!course) {
    return <div>Course not found</div>;
  }

  const handleFindOpportunities = () => {
    navigate(`/course-search/results?q=${encodeURIComponent(course.title)}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero Section */}
      <Box sx={cardStyles.section}>
        <Container
          maxWidth="var(--container-max-width)"
          sx={{
            position: 'relative',
            px: 'var(--container-padding-x)',
            py: 'var(--spacing-2)',
            '@media (--tablet)': {
              px: 'var(--container-padding-x-mobile)',
            },
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              mb: 2,
              color: 'hsl(var(--foreground))',
              '&:hover': {
                backgroundColor: 'hsl(var(--accent))',
              },
            }}
          >
            Back to Course Planning
          </Button>
      <PageHeader title={course.title} />
        </Container>
      </Box>

      {/* Main Content */}
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
      <div style={styles.courseInfo}>
        <div style={styles.contentGrid}>
          {/* Left Column */}
          <div style={styles.mainContent}>
            {/* Overview Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Course Overview</h2>
              <p style={styles.description}>{course.description}</p>
              
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Grade Level</span>
                  <span style={styles.infoValue}>{course.typicalGrade}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Prerequisites</span>
                  <span style={styles.infoValue}>{course.prerequisites}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Next Courses</span>
                  <span style={styles.infoValue}>{course.nextCourses.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Course Materials</h2>
              {Object.entries(course.materials).map(([category, items]) => (
                <div key={category} style={styles.materialItem}>
                  <span style={styles.materialLabel}>{category}:</span>
                  <span style={styles.materialValue}>{items}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.sidebar}>
            <div style={styles.trackInfo}>
              <h3 style={styles.sidebarTitle}>Track Information</h3>
              {Object.entries(course.tracks).map(([track, info]) => (
                <div key={track} style={styles.trackItem}>
                  <span style={styles.trackName}>{track}</span>
                  <span style={styles.trackDescription}>{info}</span>
                </div>
              ))}
            </div>

            <div style={styles.actionButtons}>
              <button onClick={handleFindOpportunities} style={styles.findButton}>
                Find Course Opportunities
              </button>
            </div>
          </div>
        </div>
      </div>
      </Container>
    </Box>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  courseInfo: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    padding: '2rem',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#00356b',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#4a5568',
  },
  infoGrid: {
    display: 'grid',
    gap: '1rem',
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#2d3748',
    fontSize: '0.875rem',
  },
  infoValue: {
    color: '#4a5568',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  trackInfo: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    color: '#00356b',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  trackItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  trackName: {
    fontWeight: '600',
    color: '#2d3748',
    textTransform: 'capitalize',
  },
  trackDescription: {
    color: '#4a5568',
    fontSize: '0.875rem',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  findButton: {
    backgroundColor: '#00356b',
    color: 'white',
    padding: '1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#002548',
    },
  },
};

export default MathCourseDetail; 