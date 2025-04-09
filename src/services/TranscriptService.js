import { supabase } from '../utils/supabaseClient'

export class TranscriptService {
  static async getTranscript(studentId) {
    console.log('=== START getTranscript ===')
    console.log('Getting transcript for student:', studentId)
    try {
      if (!studentId) throw new Error('Student ID is required')

      // First get the transcript
      console.log('Fetching transcript from database...')
      const { data: transcripts, error: transcriptError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (transcriptError) {
        console.error('Error fetching transcript:', transcriptError)
        if (transcriptError.code === 'PGRST116') {
          console.log('No transcript found for student:', studentId)
          return null
        }
        throw transcriptError
      }

      if (!transcripts) {
        console.log('No transcript found for student:', studentId)
        return null
      }

      console.log('Found transcript:', transcripts.id, 'Updated at:', transcripts.updated_at)
      console.log('Parent data in transcript:', {
        parent_guardian: transcripts.parent_guardian,
        parent_email: transcripts.parent_email,
        address: transcripts.address,
        city: transcripts.city,
        state: transcripts.state,
        zip: transcripts.zip
      })
      console.log('Student data in transcript:', {
        name: transcripts.name,
        student_email: transcripts.student_email,
        dob: transcripts.dob,
        gender: transcripts.gender
      })
      console.log('Student email in transcript:', transcripts.student_email || 'Not provided')
      console.log('School data in transcript:', {
        school_name: transcripts.school_name,
        school_phone: transcripts.school_phone,
        school_address: transcripts.school_address,
        school_city: transcripts.school_city,
        school_state: transcripts.school_state,
        school_zip: transcripts.school_zip
      })
      console.log('School phone in transcript:', transcripts.school_phone || 'Not provided')

      // Then get the courses for this transcript
      console.log('Fetching courses for transcript:', transcripts.id)
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('transcript_id', transcripts.id)
        .order('sort_order', { ascending: true })

      if (coursesError) {
        console.error('Error fetching courses:', coursesError)
        throw coursesError
      }

      console.log('Found courses:', courses?.length || 0)

      // Organize courses by grade level
      console.log('Organizing courses by grade level...')
      console.log('Raw courses with grade levels:', courses?.map(c => ({ 
        id: c.id, 
        title: c.course_title, 
        grade_level: c.grade_level 
      })))
      
      const coursesByGrade = {
        '9thCourses': (courses || []).filter(c => c.grade_level === 'freshman').map(this.formatCourseFromDB),
        '10thCourses': (courses || []).filter(c => c.grade_level === 'sophomore').map(this.formatCourseFromDB),
        '11thCourses': (courses || []).filter(c => c.grade_level === 'junior').map(this.formatCourseFromDB),
        '12thCourses': (courses || []).filter(c => c.grade_level === 'senior').map(this.formatCourseFromDB),
        'preHighSchoolCourses': (courses || []).filter(c => c.grade_level === 'preHighSchool').map(this.formatCourseFromDB)
      }

      console.log('Course distribution:', {
        '9th (freshman)': coursesByGrade['9thCourses'].length,
        '10th (sophomore)': coursesByGrade['10thCourses'].length,
        '11th (junior)': coursesByGrade['11thCourses'].length,
        '12th (senior)': coursesByGrade['12thCourses'].length,
        'preHS (preHighSchool)': coursesByGrade['preHighSchoolCourses'].length
      })

      // Format dates for display
      const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        try {
          // Handle both date strings and date objects
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date: ${dateStr}`);
            return '';
          }
          const formatted = date.toISOString().split('T')[0];
          console.log(`Formatting date: ${dateStr} -> ${formatted}`);
          return formatted;
        } catch (e) {
          console.warn(`Error formatting date: ${dateStr}`, e);
          return '';
        }
      };

      // Ensure all fields are properly populated from the database
      console.log('Formatting transcript data...')
      const formattedData = {
        id: transcripts.id,
        name: transcripts.name || '',
        gender: transcripts.gender || '',
        address: transcripts.address || '',
        city: transcripts.city || '',
        state: transcripts.state || '',
        zip: transcripts.zip || '',
        dob: formatDateForDisplay(transcripts.dob),
        parentGuardian: transcripts.parent_guardian || '',
        studentEmail: transcripts.student_email || '',
        projectedGradDate: formatDateForDisplay(transcripts.projected_grad_date),
        parentEmail: transcripts.parent_email || '',
        schoolName: transcripts.school_name || '',
        schoolPhone: transcripts.school_phone || '',
        schoolAddress: transcripts.school_address || '',
        schoolCity: transcripts.school_city || '',
        schoolState: transcripts.school_state || '',
        schoolZip: transcripts.school_zip || '',
        issueDate: formatDateForDisplay(transcripts.issue_date),
        graduationDate: formatDateForDisplay(transcripts.graduation_date),
        signatureDate: formatDateForDisplay(transcripts.signature_date),
        signatureFullName: transcripts.signature_full_name || '',
        '9thYear': transcripts.freshman_year || '',
        '10thYear': transcripts.sophomore_year || '',
        '11thYear': transcripts.junior_year || '',
        '12thYear': transcripts.senior_year || '',
        preHighSchoolYear: transcripts.pre_high_school_year || '',
        ...coursesByGrade,
        cumulativeSummary: transcripts.cumulative_summary || {
          totalCredits: '0',
          gpaCredits: '0',
          gpaPoints: '0',
          cumulativeGPA: '0',
          weightedGPA: '',
        },
        testScores: transcripts.test_scores || '',
        gradingScale: transcripts.grading_scale || { show: false },
        miscellaneous: transcripts.miscellaneous || '',
      }

      console.log('=== END getTranscript ===')
      console.log('Returning formatted data with ID:', formattedData.id)
      return formattedData
    } catch (error) {
      console.error('=== ERROR in getTranscript ===')
      console.error('Error details:', error)
      throw error
    }
  }

  static async saveTranscript(studentId, transcriptData) {
    console.log('=== START saveTranscript ===')
    console.log('Saving transcript for student:', studentId)
    console.log('Transcript data grade levels:', {
      has9th: transcriptData['9thCourses']?.length > 0,
      has10th: transcriptData['10thCourses']?.length > 0,
      has11th: transcriptData['11thCourses']?.length > 0,
      has12th: transcriptData['12thCourses']?.length > 0,
      hasPreHS: transcriptData.preHighSchoolCourses?.length > 0
    })

    try {
      if (!studentId) throw new Error('Student ID is required')
      if (!transcriptData) throw new Error('Transcript data is required')

      // Validate that we're not saving empty data
      const hasAnyCourses = 
        (transcriptData['9thCourses']?.length > 0) ||
        (transcriptData['10thCourses']?.length > 0) ||
        (transcriptData['11thCourses']?.length > 0) ||
        (transcriptData['12thCourses']?.length > 0) ||
        (transcriptData.preHighSchoolCourses?.length > 0);

      const hasRequiredFields = 
        transcriptData.name ||
        transcriptData.studentEmail ||
        transcriptData.schoolPhone;

      if (!hasAnyCourses && !hasRequiredFields) {
        console.warn('Attempting to save empty transcript data - operation aborted')
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // First check if a transcript exists
      const { data: existingTranscript, error: existingError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing transcript:', existingError)
        throw existingError
      }

      // Format all courses with their proper grade levels
      const allCourses = [
        ...this.formatCoursesForDB(transcriptData['9thCourses'] || [], '9thCourses', existingTranscript?.id),
        ...this.formatCoursesForDB(transcriptData['10thCourses'] || [], '10thCourses', existingTranscript?.id),
        ...this.formatCoursesForDB(transcriptData['11thCourses'] || [], '11thCourses', existingTranscript?.id),
        ...this.formatCoursesForDB(transcriptData['12thCourses'] || [], '12thCourses', existingTranscript?.id),
        ...this.formatCoursesForDB(transcriptData.preHighSchoolCourses || [], 'preHighSchoolCourses', existingTranscript?.id)
      ];

      console.log('Prepared courses for saving:', {
        totalCourses: allCourses.length,
        coursesByGradeLevel: allCourses.reduce((acc, course) => {
          acc[course.grade_level] = (acc[course.grade_level] || 0) + 1;
          return acc;
        }, {})
      });

      // Format dates or set to null if empty
      const formatDateOrNull = (dateStr) => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date for save: ${dateStr}`);
            return null;
          }
          const formatted = date.toISOString().split('T')[0];
          console.log(`Formatting date for save: ${dateStr} -> ${formatted}`);
          return formatted;
        } catch (e) {
          console.warn(`Error formatting date for save: ${dateStr}`, e);
          return null;
        }
      }

      // Prepare transcript data, preserving existing values if new values are empty
      const transcriptPayload = {
        user_id: user.id,
        student_id: studentId,
        name: transcriptData.name || existingTranscript?.name || '',
        gender: transcriptData.gender || existingTranscript?.gender || '',  // Preserve user-entered gender
        address: transcriptData.address || existingTranscript?.address || '',
        city: transcriptData.city || existingTranscript?.city || '',
        state: transcriptData.state || existingTranscript?.state || '',
        zip: transcriptData.zip || existingTranscript?.zip || '',
        dob: formatDateOrNull(transcriptData.dob) || existingTranscript?.dob,
        parent_guardian: transcriptData.parentGuardian || existingTranscript?.parent_guardian || '',
        student_email: transcriptData.studentEmail || existingTranscript?.student_email || '',
        projected_grad_date: formatDateOrNull(transcriptData.projectedGradDate) || existingTranscript?.projected_grad_date,
        parent_email: transcriptData.parentEmail || existingTranscript?.parent_email || '',
        school_name: transcriptData.schoolName || existingTranscript?.school_name || '',
        // Preserve user-entered school phone
        school_phone: transcriptData.schoolPhone || existingTranscript?.school_phone || '',
        school_address: transcriptData.schoolAddress || existingTranscript?.school_address || '',
        school_city: transcriptData.schoolCity || existingTranscript?.school_city || '',
        school_state: transcriptData.schoolState || existingTranscript?.school_state || '',
        school_zip: transcriptData.schoolZip || existingTranscript?.school_zip || '',
        issue_date: formatDateOrNull(transcriptData.issueDate) || existingTranscript?.issue_date,
        graduation_date: formatDateOrNull(transcriptData.graduationDate) || existingTranscript?.graduation_date,
        signature_date: formatDateOrNull(transcriptData.signatureDate) || existingTranscript?.signature_date,
        signature_full_name: transcriptData.signatureFullName || existingTranscript?.signature_full_name || '',
        freshman_year: transcriptData['9thYear'] || existingTranscript?.freshman_year || '',
        sophomore_year: transcriptData['10thYear'] || existingTranscript?.sophomore_year || '',
        junior_year: transcriptData['11thYear'] || existingTranscript?.junior_year || '',
        senior_year: transcriptData['12thYear'] || existingTranscript?.senior_year || '',
        pre_high_school_year: transcriptData.preHighSchoolYear || existingTranscript?.pre_high_school_year || '',
        cumulative_summary: transcriptData.cumulativeSummary || existingTranscript?.cumulative_summary || {},
        test_scores: transcriptData.testScores || existingTranscript?.test_scores || '',
        grading_scale: transcriptData.gradingScale || existingTranscript?.grading_scale || { show: false },
        miscellaneous: transcriptData.miscellaneous || existingTranscript?.miscellaneous || '',
        updated_at: new Date().toISOString()
      }

      console.log('Transcript payload prepared:', transcriptPayload)
      console.log('Parent data being saved:', {
        parent_guardian: transcriptPayload.parent_guardian,
        parent_email: transcriptPayload.parent_email,
        address: transcriptPayload.address,
        city: transcriptPayload.city,
        state: transcriptPayload.state,
        zip: transcriptPayload.zip
      })
      console.log('Student data being saved:', {
        name: transcriptPayload.name,
        student_email: transcriptPayload.student_email,
        dob: transcriptPayload.dob,
        gender: transcriptPayload.gender
      })
      console.log('School data being saved:', {
        school_name: transcriptPayload.school_name,
        school_phone: transcriptPayload.school_phone,
        school_address: transcriptPayload.school_address,
        school_city: transcriptPayload.school_city,
        school_state: transcriptPayload.school_state,
        school_zip: transcriptPayload.school_zip
      })

      let savedTranscript
      
      if (existingTranscript) {
        // Update existing transcript
        console.log('Updating existing transcript:', existingTranscript.id)
        const { data, error: updateError } = await supabase
          .from('transcripts')
          .update(transcriptPayload)
          .eq('id', existingTranscript.id)
          .select()
          .single()

        if (updateError) throw updateError
        savedTranscript = data
      } else {
        // Insert new transcript
        console.log('Creating new transcript')
        const { data, error: insertError } = await supabase
          .from('transcripts')
          .insert(transcriptPayload)
          .select()
          .single()

        if (insertError) throw insertError
        savedTranscript = data
      }

      console.log('Transcript saved successfully:', savedTranscript)

      // Delete existing courses with additional logging
      console.log('Deleting existing courses for transcript:', savedTranscript.id)
      const { data: deletedCourses, error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('transcript_id', savedTranscript.id)
        .select()

      if (deleteError) {
        console.error('Error deleting existing courses:', deleteError)
        throw deleteError
      }
      console.log('Successfully deleted existing courses:', deletedCourses?.length || 0)

      // Insert new courses if any exist
      if (allCourses.length > 0) {
        console.log(`Inserting ${allCourses.length} new courses into transcript`)
        console.log('Course details being inserted:', allCourses.map(c => ({
          title: c.course_title,
          grade_level: c.grade_level,
          source_id: c.source_id
        })))
        
        try {
          const { data: insertedCourses, error: insertError } = await supabase
            .from('courses')
            .insert(allCourses)
            .select()

          if (insertError) {
            console.error('Error inserting new courses:', insertError)
            throw insertError
          }
          console.log('Successfully inserted new courses:', insertedCourses?.length || 0)
          console.log('Inserted course details:', insertedCourses?.map(c => ({
            title: c.course_title,
            grade_level: c.grade_level,
            source_id: c.source_id
          })))
        } catch (insertError) {
          console.error('Exception during course insertion:', insertError)
          throw insertError // Now throwing error instead of continuing
        }
      } else {
        console.log('No new courses to insert - WARNING: This may indicate data loss if courses were expected')
      }

      // Return the complete saved data
      return {
        ...transcriptData,
        id: savedTranscript.id,
        '9thYear': savedTranscript.freshman_year || '',
        '10thYear': savedTranscript.sophomore_year || '',
        '11thYear': savedTranscript.junior_year || '',
        '12thYear': savedTranscript.senior_year || '',
        preHighSchoolYear: savedTranscript.pre_high_school_year || ''
      }
    } catch (error) {
      console.error('=== ERROR in saveTranscript ===')
      console.error('Error details:', error)
      throw error
    }
  }

  static formatCoursesForDB(courses, gradeLevel, transcriptId) {
    if (!Array.isArray(courses)) {
      console.warn(`Invalid courses data for ${gradeLevel}:`, courses)
      return []
    }

    // Map the grade level strings to database values
    const gradeLevelMap = {
      '9thCourses': 'freshman',
      '10thCourses': 'sophomore',
      '11thCourses': 'junior',
      '12thCourses': 'senior',
      'preHighSchoolCourses': 'preHighSchool',
      // Also include the database values themselves to prevent double mapping
      'freshman': 'freshman',
      'sophomore': 'sophomore',
      'junior': 'junior',
      'senior': 'senior',
      'preHighSchool': 'preHighSchool'
    };

    // Get the correct grade level from the map or use the provided grade level
    const mappedGradeLevel = gradeLevelMap[gradeLevel] || gradeLevel;
    
    console.log(`Formatting courses for grade level: ${gradeLevel} -> ${mappedGradeLevel}`);

    return courses.map((course, index) => {
      // If the course already has a grade_level, preserve it
      const courseGradeLevel = course.grade_level ? gradeLevelMap[course.grade_level] || course.grade_level : mappedGradeLevel;

      // Validate source_type - can only be 'youredu_course', 'user_course', or 'manual'
      const isValidSourceType = (type) => {
        return ['youredu_course', 'user_course'].includes(type);
      };

      const sourceType = isValidSourceType(course.source_type) ? course.source_type : 'manual';
      const isManualCourse = sourceType === 'manual';

      // Generate UUID for manual courses
      const generateUUID = () => {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        array[6] = (array[6] & 0x0f) | 0x40;
        array[8] = (array[8] & 0x3f) | 0x80;
        const hex = [...array].map(b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
      };

      // Log course details for debugging
      console.log('Processing course:', {
        title: course.courseTitle || '',
        gradeLevel: courseGradeLevel,
        sourceType,
        isManualCourse
      });
      
      return {
        transcript_id: transcriptId,
        grade_level: courseGradeLevel,  // Use the preserved grade level
        method: course.method || 'Traditional',
        course_title: course.courseTitle || '',
        term1_grade: course.term1Grade || '',
        term2_grade: course.term2Grade || '',
        term3_grade: course.term3Grade || '',
        credits: course.credits || '',
        sort_order: index,
        source_type: sourceType,
        source_id: isManualCourse ? generateUUID() : course.source_id,
        is_pulled_in: !isManualCourse,
        updated_at: new Date().toISOString()
      }
    })
  }

  static formatCourseFromDB(course) {
    return {
      method: course.method || 'Traditional',
      courseTitle: course.course_title || '',
      term1Grade: course.term1_grade || '',
      term2Grade: course.term2_grade || '',
      term3Grade: course.term3_grade || '',
      credits: course.credits || '',
      source_type: course.source_type || 'manual',
      source_id: course.source_id || null,
      is_pulled_in: course.is_pulled_in || false,
      _debug_source_id: course.source_id // This will help us verify the source_id is being passed correctly
    }
  }

  static generateCourseKey(course) {
    if (!course?.course_title) {
      console.log('generateCourseKey: Missing course_title, returning null')
      return null
    }
    
    // Normalize all components - no longer using term_start
    const title = (course.course_title || '').toLowerCase().trim()
    const studentId = course.student_id || ''
    
    // Create composite key without term_start
    const key = `${title}|${studentId}`
    console.log(`generateCourseKey: Created key "${key}" for course "${course.course_title}"`)
    return key
  }

  static isSameCourse(course1, course2) {
    // Helper function to compare two courses
    return course1.course_title?.toLowerCase().trim() === course2.course_title?.toLowerCase().trim()
  }

  static async syncCoursesFromMyCourses(studentId) {
    console.log('=== START syncCoursesFromMyCourses ===')
    console.log('Syncing courses for student:', studentId)
    
    // Add this tracking variable to ensure this function only runs once at a time per student
    if (!this._inProgressSyncs) {
      this._inProgressSyncs = new Set();
    }
    
    // If a sync is already in progress for this student, exit
    if (this._inProgressSyncs.has(studentId)) {
      console.log(`Sync already in progress for student ${studentId}, skipping duplicate call`);
      return [];
    }
    
    // Mark this student as having a sync in progress
    this._inProgressSyncs.add(studentId);
    
    try {
      // 1. Get student details to determine grade level
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

      console.log('Student grade level from database:', student.grade_level)
      console.log('Student grade level type:', typeof student.grade_level)
      
      // 2. Map grade level to transcript format (freshman, sophomore, etc.)
      const gradeLevel = this.determineGradeLevel(student.grade_level)
      console.log('Mapped grade level for transcript:', gradeLevel)

      // 3. Get or create transcript for this student
      const { data: transcripts, error: transcriptsError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })

      if (transcriptsError) {
        console.error('Error fetching transcripts:', transcriptsError)
        throw transcriptsError
      }

      let transcriptId
      if (!transcripts || transcripts.length === 0) {
        console.log('No transcript found, creating new one')
        // Create new transcript
        const { data: newTranscript, error: createError } = await supabase
          .from('transcripts')
          .insert({
            user_id: student.parent_id,
            student_id: studentId,
            name: student.student_name
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating transcript:', createError)
          throw createError
        }
        transcriptId = newTranscript.id
      } else {
        // Use the most recent transcript
        console.log(`Found ${transcripts.length} transcripts, using the most recent one`)
        transcriptId = transcripts[0].id
      }

      // 4. Get existing courses for this transcript
      const { data: existingCourses, error: existingCoursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('transcript_id', transcriptId)

      if (existingCoursesError) {
        console.error('Error fetching existing courses:', existingCoursesError)
        throw existingCoursesError
      }

      console.log('Found existing courses:', existingCourses?.length || 0)
      
      // Log existing course titles and source IDs for debugging
      if (existingCourses && existingCourses.length > 0) {
        console.log('Existing courses:', existingCourses.map(c => ({
          title: c.course_title,
          source_id: c.source_id,
          source_type: c.source_type
        })));
      }

      // Get all courses from both youredu_courses and user_courses
      console.log('Fetching courses from youredu_courses')
      const { data: youreduCourses, error: youreduError } = await supabase
        .from('youredu_courses')
        .select('*')
        .eq('student_id', studentId)

      if (youreduError) {
        console.error('Error fetching youredu courses:', youreduError)
        throw youreduError
      }

      console.log('Fetching courses from user_courses')
      const { data: userCourses, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('*')
        .eq('student_id', studentId)

      if (userCoursesError) {
        console.error('Error fetching user courses:', userCoursesError)
        throw userCoursesError
      }

      // Create a Map to track courses by source ID
      const existingSourceIds = new Map(
        (existingCourses || []).map(course => [course.source_id, course])
      );

      // Create a Map for all courses (both new and updated)
      const coursesMap = new Map()

      // Process YouredU courses
      console.log(`Processing ${youreduCourses?.length || 0} YouredU courses`)
      ;(youreduCourses || []).forEach(course => {
        const courseTitle = course.title || '';
        
        // Skip if the course title is empty
        if (!courseTitle) {
          console.log(`Skipping course with empty title`);
          return;
        }
        
        // Create a course object
        const newCourse = {
          transcript_id: transcriptId,
          grade_level: gradeLevel,
          method: course.instruction_method || 'Traditional',
          course_title: courseTitle,
          term1_grade: '',
          term2_grade: '',
          term3_grade: '',
          credits: course.units || '',
          updated_at: new Date().toISOString(),
          source_type: 'youredu_course',
          source_id: course.id,
          is_pulled_in: true
        };

        // If this course already exists, preserve its grades
        const existingCourse = existingSourceIds.get(course.id);
        if (existingCourse) {
          console.log(`Updating existing course: ${courseTitle}`);
          newCourse.term1_grade = existingCourse.term1_grade || '';
          newCourse.term2_grade = existingCourse.term2_grade || '';
          newCourse.term3_grade = existingCourse.term3_grade || '';
          newCourse.sort_order = existingCourse.sort_order;
        }
        
        // Add to the map of courses
        coursesMap.set(course.id, newCourse);
        console.log(`Processed YouredU course:`, {
          title: courseTitle,
          source_id: course.id,
          source_type: 'youredu_course',
          isUpdate: !!existingCourse
        });
      });

      // Process user courses
      console.log(`Processing ${userCourses?.length || 0} user courses`)
      ;(userCourses || []).forEach(course => {
        const courseTitle = course.title || '';
        
        // Skip if the course title is empty
        if (!courseTitle) {
          console.log(`Skipping course with empty title`);
          return;
        }
        
        // Create a course object
        const newCourse = {
          transcript_id: transcriptId,
          grade_level: gradeLevel,
          method: course.instruction_method || 'Traditional',
          course_title: courseTitle,
          term1_grade: '',
          term2_grade: '',
          term3_grade: '',
          credits: course.units || '',
          updated_at: new Date().toISOString(),
          source_type: 'user_course',
          source_id: course.id,
          is_pulled_in: true
        };

        // If this course already exists, preserve its grades
        const existingCourse = existingSourceIds.get(course.id);
        if (existingCourse) {
          console.log(`Updating existing course: ${courseTitle}`);
          newCourse.term1_grade = existingCourse.term1_grade || '';
          newCourse.term2_grade = existingCourse.term2_grade || '';
          newCourse.term3_grade = existingCourse.term3_grade || '';
          newCourse.sort_order = existingCourse.sort_order;
        }
        
        // Add to the map of courses
        coursesMap.set(course.id, newCourse);
        console.log(`Processed user course:`, {
          title: courseTitle,
          source_id: course.id,
          source_type: 'user_course',
          isUpdate: !!existingCourse
        });
      });

      // Convert map to array and add sort order for new courses
      const allCourses = Array.from(coursesMap.values()).map((course, index) => ({
        ...course,
        sort_order: course.sort_order ?? index + (existingCourses?.length || 0)
      }));

      console.log(`Prepared ${allCourses.length} courses for transcript (new + updated)`)

      // Delete all pulled-in courses (we'll reinsert them with updated data)
      console.log('Deleting existing pulled-in courses')
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('transcript_id', transcriptId)
        .eq('is_pulled_in', true)

      if (deleteError) {
        console.error('Error deleting existing courses:', deleteError)
        throw deleteError
      }

      // Insert all courses
      if (allCourses.length > 0) {
        console.log(`Inserting ${allCourses.length} courses into transcript`)
        console.log('Course details being inserted:', allCourses.map(c => ({
          title: c.course_title,
          grade_level: c.grade_level,
          source_id: c.source_id,
          is_update: existingSourceIds.has(c.source_id)
        })))
        
        try {
          const { data: insertedCourses, error: insertError } = await supabase
            .from('courses')
            .insert(allCourses)
            .select()

          if (insertError) {
            console.error('Error inserting courses:', insertError)
            throw insertError
          }
          console.log('Successfully inserted/updated courses:', insertedCourses?.length || 0)
        } catch (insertError) {
          console.error('Exception during course insertion:', insertError)
          throw insertError
        }
      } else {
        console.log('No courses to insert/update')
      }

      // Continue with other syncs
      console.log('Syncing parent data to transcript')
      await this.syncParentDataToTranscript(studentId)
      
      console.log('Syncing student data to transcript')
      await this.syncStudentDataToTranscript(studentId)
      
      console.log('Successfully synced courses to transcript')
      return allCourses
    } catch (error) {
      console.error('Error syncing courses to transcript:', error)
      throw error
    } finally {
      // Always remove the in-progress marker when done, even if there was an error
      this._inProgressSyncs.delete(studentId);
    }
  }

  static determineGradeLevel(gradeLevel) {
    // Map grade level to transcript format
    const gradeMap = {
      '9': 'freshman',
      '10': 'sophomore',
      '11': 'junior',
      '12': 'senior',
      '9th Grade': 'freshman',
      '10th Grade': 'sophomore',
      '11th Grade': 'junior',
      '12th Grade': 'senior',
      'K': 'preHighSchool',
      '1': 'preHighSchool',
      '2': 'preHighSchool',
      '3': 'preHighSchool',
      '4': 'preHighSchool',
      '5': 'preHighSchool',
      '6': 'preHighSchool',
      '7': 'preHighSchool',
      '8': 'preHighSchool',
      'K Grade': 'preHighSchool',
      '1st Grade': 'preHighSchool',
      '2nd Grade': 'preHighSchool',
      '3rd Grade': 'preHighSchool',
      '4th Grade': 'preHighSchool',
      '5th Grade': 'preHighSchool',
      '6th Grade': 'preHighSchool',
      '7th Grade': 'preHighSchool',
      '8th Grade': 'preHighSchool',
    }
    
    console.log(`Mapping grade level: "${gradeLevel}" to transcript format`)
    const mappedGrade = gradeMap[gradeLevel] || 'freshman'
    console.log(`Mapped to: "${mappedGrade}"`)
    
    return mappedGrade
  }
  
  // New method to sync parent data from account_profiles to transcript
  static async syncParentDataToTranscript(studentId) {
    console.log('=== START syncParentDataToTranscript ===')
    console.log('Syncing parent data for student:', studentId)
    
    try {
      if (!studentId) throw new Error('Student ID is required')
      
      // 1. Get the student to find the parent_id
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()
        
      if (studentError) {
        console.error('Error fetching student:', studentError)
        throw studentError
      }
      
      if (!student || !student.parent_id) {
        console.error('Student or parent_id not found')
        throw new Error('Student or parent_id not found')
      }
      
      const parentId = student.parent_id
      console.log('Found parent ID:', parentId)
      
      // 2. Get the parent profile data
      const { data: parentProfile, error: parentError } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('id', parentId)
        .single()
        
      if (parentError) {
        console.error('Error fetching parent profile:', parentError)
        throw parentError
      }
      
      if (!parentProfile) {
        console.error('Parent profile not found')
        throw new Error('Parent profile not found')
      }
      
      console.log('Found parent profile:', {
        name: parentProfile.name,
        first_name: parentProfile.first_name,
        last_name: parentProfile.last_name,
        email: parentProfile.email,
        phone_number: parentProfile.phone_number,
        street_address: parentProfile.street_address,
        city: parentProfile.city,
        state: parentProfile.state,
        zip: parentProfile.zip
      })
      
      // 3. Get the transcript
      const { data: transcript, error: transcriptError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
        
      if (transcriptError && transcriptError.code !== 'PGRST116') {
        console.error('Error fetching transcript:', transcriptError)
        throw transcriptError
      }
      
      if (!transcript) {
        console.log('No transcript found to update')
        return null
      }
      
      // 4. Determine parent name
      let parentName = '';
      if (parentProfile.first_name && parentProfile.last_name) {
        parentName = `${parentProfile.first_name} ${parentProfile.last_name}`;
      } else {
        parentName = parentProfile.name || '';
      }
      
      // 5. Update the transcript with parent data, preserving existing values
      const updateData = {
        parent_guardian: parentName || transcript.parent_guardian || '',
        parent_email: parentProfile.email || transcript.parent_email || '',
        address: parentProfile.street_address || transcript.address || '',
        city: parentProfile.city || transcript.city || '',
        state: parentProfile.state || transcript.state || '',
        zip: parentProfile.zip || transcript.zip || '',
        // Only update school_phone if it's empty in transcript
        school_phone: transcript.school_phone || parentProfile.phone_number || '',
        updated_at: new Date().toISOString()
      }
      
      console.log('Updating transcript with parent data:', updateData)
      
      const { data: updatedTranscript, error: updateError } = await supabase
        .from('transcripts')
        .update(updateData)
        .eq('id', transcript.id)
        .select()
        .single()
        
      if (updateError) {
        console.error('Error updating transcript with parent data:', updateError)
        throw updateError
      }
      
      console.log('Successfully synced parent data to transcript')
      return updatedTranscript
    } catch (error) {
      console.error('Error syncing parent data to transcript:', error)
      throw error
    }
  }

  // New method to update existing courses to the correct grade level
  static async updateCoursesGradeLevel(studentId) {
    console.log('=== START updateCoursesGradeLevel ===')
    console.log('Updating course grade levels for student:', studentId)
    
    try {
      if (!studentId) throw new Error('Student ID is required')
      
      // 1. Get student details to determine grade level
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

      console.log('Student grade level from database:', student.grade_level)
      
      // 2. Map grade level to transcript format (freshman, sophomore, etc.)
      const correctGradeLevel = this.determineGradeLevel(student.grade_level)
      console.log('Correct grade level for transcript:', correctGradeLevel)
      
      // 3. Get the transcript
      const { data: transcript, error: transcriptError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
        
      if (transcriptError) {
        console.error('Error fetching transcript:', transcriptError)
        if (transcriptError.code === 'PGRST116') {
          console.log('No transcript found for student:', studentId)
          return null
        }
        throw transcriptError
      }
      
      // 4. Get all courses for this transcript
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('transcript_id', transcript.id)
        
      if (coursesError) {
        console.error('Error fetching courses:', coursesError)
        throw coursesError
      }
      
      console.log(`Found ${courses?.length || 0} courses for transcript`)
      
      // 5. Update all courses to the correct grade level
      if (courses && courses.length > 0) {
        console.log(`Updating ${courses.length} courses to grade level: ${correctGradeLevel}`)
        
        const { error: updateError } = await supabase
          .from('courses')
          .update({ grade_level: correctGradeLevel })
          .eq('transcript_id', transcript.id)
          
        if (updateError) {
          console.error('Error updating courses:', updateError)
          throw updateError
        }
        
        console.log('Successfully updated course grade levels')
      } else {
        console.log('No courses found to update')
      }
      
      return { success: true, updatedCount: courses?.length || 0 }
    } catch (error) {
      console.error('Error updating course grade levels:', error)
      throw error
    }
  }

  // New method to sync student data from students table to transcript
  static async syncStudentDataToTranscript(studentId) {
    console.log('=== START syncStudentDataToTranscript ===')
    console.log('Syncing student data for student:', studentId)
    
    try {
      if (!studentId) throw new Error('Student ID is required')
      
      // 1. Get the student details
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()
        
      if (studentError) {
        console.error('Error fetching student:', studentError)
        throw studentError
      }
      
      if (!student) {
        console.error('Student not found')
        throw new Error('Student not found')
      }
      
      console.log('Found student:', {
        id: student.id,
        name: student.student_name,
        email: student.email,
        dob: student.date_of_birth,
        gender: student.gender,
        grade_level: student.grade_level,
        graduation_year: student.graduation_year
      })
      
      // 2. Get the transcript
      const { data: transcript, error: transcriptError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
        
      if (transcriptError && transcriptError.code !== 'PGRST116') {
        console.error('Error fetching transcript:', transcriptError)
        throw transcriptError
      }
      
      if (!transcript) {
        console.log('No transcript found to update')
        return null
      }
      
      // 3. Update the transcript with student data, preserving existing values if they exist
      const updateData = {
        name: student.student_name || transcript.name || '',
        student_email: student.email || transcript.student_email || '',
        dob: student.date_of_birth || transcript.dob || null,
        // Only update gender if the transcript's gender is empty and student has a gender
        gender: transcript.gender || student.gender || '',
        updated_at: new Date().toISOString()
      }
      
      console.log('Updating transcript with student data:', updateData)
      
      const { data: updatedTranscript, error: updateError } = await supabase
        .from('transcripts')
        .update(updateData)
        .eq('id', transcript.id)
        .select()
        .single()
        
      if (updateError) {
        console.error('Error updating transcript with student data:', updateError)
        throw updateError
      }
      
      console.log('Successfully synced student data to transcript')
      return updatedTranscript
    } catch (error) {
      console.error('Error syncing student data to transcript:', error)
      throw error
    }
  }
} 