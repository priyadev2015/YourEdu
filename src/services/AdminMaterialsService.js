import { supabase } from '../utils/supabaseClient';

export const AdminMaterialsService = {
  async getCompletionStatus() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Fetch all documents for the current user
      const [
        { data: schoolProfile },
        { data: transcript },
        { data: courseDescriptions },
        { data: gradingRubric }
      ] = await Promise.all([
        supabase.from('school_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('transcripts').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('course_descriptions').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('grading_rubrics').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      // Calculate completion percentage for school profile
      const schoolProfileProgress = schoolProfile ? this._calculateSchoolProfileProgress(schoolProfile) : 0;

      // Calculate completion percentage for transcript
      const transcriptProgress = transcript ? this._calculateTranscriptProgress(transcript) : 0;

      // Calculate completion percentage for course descriptions
      const courseDescriptionsProgress = courseDescriptions ? this._calculateCourseDescriptionsProgress(courseDescriptions) : 0;

      // Calculate completion percentage for grading rubric
      const gradingRubricProgress = gradingRubric ? this._calculateGradingRubricProgress(gradingRubric) : 0;

      return {
        schoolPhilosophy: schoolProfileProgress,
        transcript: transcriptProgress,
        courseDescription: courseDescriptionsProgress,
        gradingRubric: gradingRubricProgress,
        guidanceLetter: 0 // Will be implemented when guidance letter is migrated
      };
    } catch (error) {
      console.error('Error getting completion status:', error);
      throw error;
    }
  },

  _calculateSchoolProfileProgress(profile) {
    const fields = [
      profile.prefix,
      profile.first_name,
      profile.last_name,
      profile.school_name,
      profile.school_address,
      profile.school_phone,
      profile.philosophy_statement
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  },

  _calculateTranscriptProgress(transcript) {
    const mainFields = [
      transcript.name,
      transcript.address,
      transcript.parent_guardian,
      transcript.school_name,
      transcript.school_address
    ];
    
    const hasMainFields = mainFields.filter(field => field && field.trim() !== '').length;
    const mainFieldsWeight = 0.4; // 40% of progress

    // Check if there are any courses
    const hasCourses = transcript.courses && transcript.courses.length > 0;
    const coursesWeight = 0.6; // 60% of progress

    const mainProgress = (hasMainFields / mainFields.length) * mainFieldsWeight * 100;
    const coursesProgress = hasCourses ? coursesWeight * 100 : 0;

    return Math.round(mainProgress + coursesProgress);
  },

  _calculateCourseDescriptionsProgress(descriptions) {
    const grades = ['freshman', 'sophomore', 'junior', 'senior'];
    let totalCourses = 0;
    let coursesWithDescriptions = 0;

    grades.forEach(grade => {
      if (descriptions[grade] && Array.isArray(descriptions[grade])) {
        descriptions[grade].forEach(course => {
          totalCourses++;
          if (course.courseTitle && course.aiDescription) {
            coursesWithDescriptions++;
          }
        });
      }
    });

    return totalCourses === 0 ? 0 : Math.round((coursesWithDescriptions / totalCourses) * 100);
  },

  _calculateGradingRubricProgress(rubric) {
    const mainFields = [
      rubric.evaluation_method,
      rubric.learning_goals,
      rubric.assignments
    ];
    
    const hasMainFields = mainFields.filter(field => field && field.trim() !== '').length;
    const mainFieldsWeight = 0.5; // 50% of progress

    // Check grading scale completion
    const gradingScaleFields = Object.values(rubric.grading_scale || {});
    const filledGradingScaleFields = gradingScaleFields.filter(field => field && field.trim() !== '').length;
    const gradingScaleWeight = 0.5; // 50% of progress

    const mainProgress = (hasMainFields / mainFields.length) * mainFieldsWeight * 100;
    const gradingScaleProgress = filledGradingScaleFields > 0 ? 
      (filledGradingScaleFields / gradingScaleFields.length) * gradingScaleWeight * 100 : 0;

    return Math.round(mainProgress + gradingScaleProgress);
  }
}; 