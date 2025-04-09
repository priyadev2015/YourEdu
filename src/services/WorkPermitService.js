import { supabase } from '../utils/supabaseClient';

export const WorkPermitService = {
  // Create a new work permit
  async createWorkPermit(permitData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('work_permits')
        .insert({
          user_id: user.id,
          student_name: permitData.studentName,
          date_of_birth: permitData.dateOfBirth,
          address: permitData.address,
          phone_number: permitData.phoneNumber,
          employer_name: permitData.employerName,
          employer_address: permitData.employerAddress,
          employer_phone: permitData.employerPhone,
          job_title: permitData.jobTitle,
          work_schedule: permitData.workSchedule,
          start_date: permitData.startDate,
          parent_name: permitData.parentName,
          parent_phone: permitData.parentPhone,
          parent_email: permitData.parentEmail
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating work permit:', error);
      throw error;
    }
  },

  // Get all work permits for the current user
  async getUserWorkPermits() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('work_permits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching work permits:', error);
      throw error;
    }
  },

  // Delete a work permit
  async deleteWorkPermit(id) {
    try {
      const { error } = await supabase
        .from('work_permits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting work permit:', error);
      throw error;
    }
  }
}; 