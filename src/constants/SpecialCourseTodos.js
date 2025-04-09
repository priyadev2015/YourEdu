// Special todos for different colleges
// Each college has an array of todos that should be created when courses from that college are enrolled

export const COLLEGE_TODOS = {
  'Sierra College': [
    // Shared todos that apply to all Sierra College courses
    {
      special_todo_type: 'sierra_admission',
      name: 'Apply for Sierra College Admission',
      description: 'Complete the Sierra College admission application to get your student ID',
      importance: 15, // Highest priority - must be done first
      route: '/sierra-college-admission-guide',
      buttonText: 'View Admission Guide',
    },
    {
      special_todo_type: 'ae_form',
      name: 'Submit Advanced Education (AE) Form',
      description: 'Generate, complete, and submit the AE form for your courses',
      importance: 14, // Second priority - must be done after admission
      route: '/sierra-college-ae-form',
      buttonText: 'Generate AE Form',
    },
    // Individual course enrollment todo (will be created for each course)
    {
      special_todo_type: 'mysierraenroll',
      name: 'Enroll in {course_title} via MySierra',
      description: 'Complete official enrollment through the MySierra portal',
      importance: 13, // Third priority - must be done after AE form
      perCourse: true, // Flag indicating this todo should be created for each course
      route: '/sierra-college-enrollment-guide',
      buttonText: 'View Enrollment Guide',
    },
  ],

  'Campus Community College': [
    {
      special_todo_type: 'campus_application',
      name: 'Complete Campus Community College Application',
      description:
        'Complete the online application. No fee or standardized test scores required. Note: To be eligible, you must be in your third or fourth year of high school and at least 15 years old, or a recent high school graduate with a minimum 2.5 GPA.',
      importance: 15, // Highest priority
      route: '/campus-college-guide/campus_application',
      buttonText: 'View Application Guide',
    },
    {
      special_todo_type: 'campus_info_session',
      name: 'Attend Campus Community College Info Session',
      description:
        "Once admitted, attend a mandatory information session that gives you a rundown of the program. You'll receive an invitation via email.",
      importance: 14,
      route: '/campus-college-guide/campus_info_session',
      buttonText: 'Session Information',
    },
    {
      special_todo_type: 'campus_enrollment_docs',
      name: 'Sign Campus Community College Enrollment Documents',
      description:
        'Sign the program enrollment agreement, which will be provided via email and can be signed with an electronic signature. A parent or guardian signature is required for students under 18.',
      importance: 13,
      route: '/campus-college-guide/campus_enrollment_docs',
      buttonText: 'View Documents Guide',
    },
    {
      special_todo_type: 'campus_course_registration',
      name: 'Register for Campus Community College Courses',
      description:
        'Reserve your spot in your selected courses. Make sure to complete this before the enrollment deadline.',
      importance: 12,
      route: '/campus-college-guide/campus_course_registration',
      buttonText: 'Registration Guide',
    },
    {
      special_todo_type: 'campus_orientation',
      name: 'Attend Campus Community College Orientation',
      description:
        'Attend the student orientation (typically held the week before classes start) to get an introduction to the program, learn how to navigate the student platform, and meet program staff and fellow classmates.',
      importance: 11,
      route: '/campus-college-guide/campus_orientation',
      buttonText: 'Orientation Details',
    },
  ],
}

// Generate a lookup object for todo type configuration
export const TODO_TYPE_CONFIG = {}

// Populate the TODO_TYPE_CONFIG from COLLEGE_TODOS
Object.values(COLLEGE_TODOS).forEach((collegeTodos) => {
  collegeTodos.forEach((todo) => {
    TODO_TYPE_CONFIG[todo.special_todo_type] = {
      route: todo.route,
      buttonText: todo.buttonText,
    }
  })
})

// Helper function to check if a todo is special
export const isSpecialTodo = (todoType) => {
  return todoType in TODO_TYPE_CONFIG
}

// Helper function to generate todos for a specific college
export const generateCollegeTodos = (college, userId, studentId, courseIds, courses) => {
  if (!COLLEGE_TODOS[college]) {
    return [] // No special todos for this college
  }

  const todos = []

  // Process each todo template for the college
  COLLEGE_TODOS[college].forEach((todoTemplate) => {
    if (todoTemplate.perCourse) {
      // Create individual todos for each course
      courses.forEach((course) => {
        todos.push({
          uid: userId,
          student_id: studentId,
          user_course_ids: [course.id],
          special_todo_type: todoTemplate.special_todo_type,
          name: todoTemplate.name.replace('{course_title}', course.title),
          description: todoTemplate.description,
          importance: todoTemplate.importance,
        })
      })
    } else {
      // Create shared todos that apply to all courses
      todos.push({
        uid: userId,
        student_id: studentId,
        user_course_ids: courseIds,
        special_todo_type: todoTemplate.special_todo_type,
        name: todoTemplate.name,
        description: todoTemplate.description,
        importance: todoTemplate.importance,
      })
    }
  })

  return todos
}
