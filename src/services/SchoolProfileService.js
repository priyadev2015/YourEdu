import { supabase } from '../utils/supabaseClient';

export const SchoolProfileService = {
  // Get the school profile for the current user
  async getSchoolProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('school_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {};
    } catch (error) {
      console.error('Error in getSchoolProfile:', error);
      throw error;
    }
  },

  // Save or update the school profile
  async saveSchoolProfile(profileData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Clean and format the data
      const formattedData = {
        user_id: user.id,
        prefix: profileData.prefix?.trim(),
        first_name: profileData.firstName?.trim(),
        middle_initial: profileData.middleInitial?.trim(),
        last_name: profileData.lastName?.trim(),
        title: profileData.title?.trim(),
        phone_number: profileData.phoneNumber?.trim(),
        fax: profileData.fax?.trim(),
        email_address: profileData.emailAddress?.trim(),
        profile_url: profileData.profileURL?.trim(),
        graduating_class_size: profileData.graduatingClassSize?.toString().trim(),
        block_schedule: profileData.blockSchedule?.trim(),
        graduation_date: profileData.graduationDate ? profileData.graduationDate : null,
        outside_us: profileData.outsideUS?.trim(),
        volunteer_service: profileData.volunteerService?.trim(),
        school_address: profileData.schoolAddress?.trim(),
        one_sentence_philosophy: profileData.oneSentencePhilosophy?.trim(),
        why_homeschool: profileData.whyHomeschool?.trim(),
        types_of_learning: profileData.typesOfLearning?.trim(),
        course_structure: profileData.courseStructure?.trim(),
        success_measurement: profileData.successMeasurement?.trim(),
        extracurricular_opportunities: profileData.extracurricularOpportunities?.trim(),
        ai_philosophy: profileData.aiPhilosophy?.trim()
      };

      // Remove any undefined values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined) {
          formattedData[key] = '';
        }
      });

      const { data, error } = await supabase
        .from('school_profiles')
        .upsert(formattedData, {
          onConflict: 'user_id',
          returning: 'representation'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in saveSchoolProfile:', error);
      throw error;
    }
  }
}; 