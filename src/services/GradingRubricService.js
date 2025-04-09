import { supabase } from '../utils/supabaseClient';

export const GradingRubricService = {
  async getGradingRubric() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('grading_rubrics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return {
          evaluationMethod: '',
          learningGoals: '',
          assignments: '',
          gradingScale: {
            'A+': '',
            'A': '',
            'A-': '',
            'B+': '',
            'B': '',
            'B-': '',
            'C+': '',
            'C': '',
            'C-': '',
            'D+': '',
            'D': '',
            'D-': '',
            'F': '',
          },
          aiGradingScale: '',
        };
      }

      // Convert snake_case to camelCase
      return {
        evaluationMethod: data.evaluation_method || '',
        learningGoals: data.learning_goals || '',
        assignments: data.assignments || '',
        gradingScale: data.grading_scale || {},
        aiGradingScale: data.ai_grading_scale || '',
      };
    } catch (error) {
      console.error('Error in getGradingRubric:', error);
      throw error;
    }
  },

  async saveGradingRubric(rubricData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Convert camelCase to snake_case
      const { error } = await supabase
        .from('grading_rubrics')
        .upsert({
          user_id: user.id,
          evaluation_method: rubricData.evaluationMethod,
          learning_goals: rubricData.learningGoals,
          assignments: rubricData.assignments,
          grading_scale: rubricData.gradingScale,
          ai_grading_scale: rubricData.aiGradingScale,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      return rubricData;
    } catch (error) {
      console.error('Error in saveGradingRubric:', error);
      throw error;
    }
  }
}; 