import { supabase } from '../utils/supabaseClient';

export const CourseDescriptionService = {
  async getCourseDescriptions(studentId) {
    console.log('CourseDescriptionService.getCourseDescriptions called with studentId:', studentId);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User auth error:', userError);
        throw userError;
      }
      if (!user) {
        console.error('No user found');
        throw new Error('No user found');
      }
      if (!studentId) {
        console.error('Student ID is required');
        throw new Error('Student ID is required');
      }

      console.log('Fetching course descriptions from database...');
      const { data, error } = await supabase
        .from('course_descriptions')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Retrieved course descriptions:', data);
      if (!data) {
        console.log('No data found, returning default structure');
        return {
          preHighSchool: [],
          '9thCourses': [],
          '10thCourses': [],
          '11thCourses': [],
          '12thCourses': []
        };
      }

      // Transform database fields to frontend fields
      const transformCourses = (courses) => {
        if (!courses) return [];
        // Handle both string and array input
        const coursesArray = typeof courses === 'string' ? JSON.parse(courses) : courses;
        return Array.isArray(coursesArray) ? coursesArray.map(course => ({
          courseTitle: course.courseTitle || '',
          method: course.instruction_method || '',
          textbook: course.textbooks || '',
          materials: course.materials || '',
          assignments: course.evaluation_method || '',
          goals: course.description || '',
          aiDescription: course.aiDescription || '',
          source_type: course.source_type || 'manual',
          source_id: course.source_id || null,
          is_pulled_in: course.is_pulled_in || false
        })) : [];
      };

      // Map database fields to frontend fields
      return {
        preHighSchool: transformCourses(data.pre_high_school),
        '9thCourses': transformCourses(data.freshman),
        '10thCourses': transformCourses(data.sophomore),
        '11thCourses': transformCourses(data.junior),
        '12thCourses': transformCourses(data.senior)
      };
    } catch (error) {
      console.error('Error in getCourseDescriptions:', error);
      throw error;
    }
  },

  async saveCourseDescriptions(studentId, descriptions) {
    console.log('CourseDescriptionService.saveCourseDescriptions called with:', { studentId, descriptions });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User auth error:', userError);
        throw userError;
      }
      if (!user) {
        console.error('No user found');
        throw new Error('No user found');
      }
      if (!studentId) {
        console.error('Student ID is required');
        throw new Error('Student ID is required');
      }

      // Transform course objects to match the database structure
      const transformCourses = (courses) => {
        return (courses || []).map(course => ({
          courseTitle: course.courseTitle || '',
          instruction_method: course.method || '',
          textbooks: course.textbook || '',
          materials: course.materials || '',
          evaluation_method: course.assignments || '',
          description: course.goals || '',
          aiDescription: course.aiDescription || '',
          source_type: course.source_type || 'manual',
          source_id: course.source_id || null,
          is_pulled_in: course.is_pulled_in || false
        }));
      };

      // Map frontend fields to database fields
      const mappedDescriptions = {
        user_id: user.id,
        student_id: studentId,
        pre_high_school: transformCourses(descriptions.preHighSchool),
        freshman: transformCourses(descriptions['9thCourses']),
        sophomore: transformCourses(descriptions['10thCourses']),
        junior: transformCourses(descriptions['11thCourses']),
        senior: transformCourses(descriptions['12thCourses'])
      };

      console.log('Saving course descriptions to database:', mappedDescriptions);
      const { data, error } = await supabase
        .from('course_descriptions')
        .upsert(mappedDescriptions, {
          onConflict: 'student_id'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Successfully saved course descriptions:', data);
      return descriptions;
    } catch (error) {
      console.error('Error in saveCourseDescriptions:', error);
      throw error;
    }
  },

  async syncCoursesFromMyCourses(studentId) {
    console.log('=== START syncCoursesFromMyCourses ===')
    console.log('Syncing courses for student:', studentId)
    
    try {
      // First get student details to determine grade level
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (studentError) {
        console.error('Error fetching student:', studentError)
        throw studentError
      }

      if (!student.grade_level) {
        console.error('Student grade level not found')
        throw new Error('Student grade level not found')
      }

      // Map grade level to the correct grade key
      const gradeMap = {
        '9': '9thCourses',
        '10': '10thCourses',
        '11': '11thCourses',
        '12': '12thCourses',
        '9th Grade': '9thCourses',
        '10th Grade': '10thCourses',
        '11th Grade': '11thCourses',
        '12th Grade': '12thCourses'
      }

      // Get current grade key
      const currentGradeKey = gradeMap[student.grade_level]
      if (!currentGradeKey) {
        console.error('Invalid grade level:', student.grade_level)
        throw new Error('Invalid grade level')
      }

      console.log('Student current grade:', student.grade_level, 'mapped to:', currentGradeKey)

      // Get YouredU courses
      const { data: youreduCourses, error: youreduError } = await supabase
        .from('youredu_courses')
        .select('*')
        .eq('student_id', studentId)

      if (youreduError) throw youreduError

      // Get user courses
      const { data: userCourses, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('student_id', studentId)

      if (userCoursesError) throw userCoursesError

      // Transform courses to ensure consistent format with source tracking
      const transformedYoureduCourses = (youreduCourses || []).map(course => ({
        courseTitle: course.title || '',
        method: course.instruction_method || 'Traditional',
        textbook: Array.isArray(course.textbooks) ? course.textbooks.join(', ') : course.textbooks || '',
        materials: Array.isArray(course.materials) ? course.materials.join(', ') : course.materials || '',
        assignments: course.evaluation_method || '',
        goals: course.description || '',
        source_type: 'youredu_course',
        source_id: course.id,
        is_pulled_in: true
      }))

      const transformedUserCourses = (userCourses || []).map(course => ({
        courseTitle: course.title || '',
        method: course.instruction_method || 'Traditional',
        textbook: Array.isArray(course.textbooks) ? course.textbooks.join(', ') : course.textbooks || '',
        materials: Array.isArray(course.materials) ? course.materials.join(', ') : course.materials || '',
        assignments: course.evaluation_method || '',
        goals: course.description || '',
        source_type: 'user_course',
        source_id: course.id,
        is_pulled_in: true
      }))

      // Get existing course descriptions
      const existingDescriptions = await this.getCourseDescriptions(studentId)

      // Initialize updated descriptions with existing data
      const updatedDescriptions = {
        preHighSchool: [...(existingDescriptions.preHighSchool || [])].filter(course => !course.is_pulled_in),
        '9thCourses': [...(existingDescriptions['9thCourses'] || [])].filter(course => !course.is_pulled_in),
        '10thCourses': [...(existingDescriptions['10thCourses'] || [])].filter(course => !course.is_pulled_in),
        '11thCourses': [...(existingDescriptions['11thCourses'] || [])].filter(course => !course.is_pulled_in),
        '12thCourses': [...(existingDescriptions['12thCourses'] || [])].filter(course => !course.is_pulled_in)
      }

      // Add all pulled-in courses to the current grade level only
      updatedDescriptions[currentGradeKey] = [
        ...updatedDescriptions[currentGradeKey],
        ...transformedYoureduCourses,
        ...transformedUserCourses
      ]

      console.log('Updated descriptions:', {
        gradeLevel: currentGradeKey,
        manualCourseCount: updatedDescriptions[currentGradeKey].filter(c => !c.is_pulled_in).length,
        pulledInCourseCount: updatedDescriptions[currentGradeKey].filter(c => c.is_pulled_in).length
      })

      // Save the updated descriptions
      await this.saveCourseDescriptions(studentId, updatedDescriptions)

      console.log('Successfully synced courses to course descriptions')
      return updatedDescriptions
    } catch (error) {
      console.error('Error syncing courses to course descriptions:', error)
      throw error
    }
  }
}; 