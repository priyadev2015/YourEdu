import { supabase } from './supabaseClient';

export const sendEmail = async (emailData) => {
  try {
    console.log('Sending email for user:', emailData.userId);

    // Ensure all required fields are present
    if (!emailData.userId || !emailData.email || !emailData.name || !emailData.state) {
      throw new Error('Missing required email data fields');
    }

    const { data, error } = await supabase.functions.invoke('send-psa-email', {
      body: {
        userId: emailData.userId,
        email: emailData.email,
        name: emailData.name,
        state: emailData.state
      }
    });

    if (error) {
      console.error('Function error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const validateFormData = (formData, formType) => {
  const errors = {};
  
  if (formType === 'compliance') {
    if (!formData.schoolType) errors.schoolType = 'School type is required';
    if (!formData.academicYear) errors.academicYear = 'Academic year is required';
  } else if (formType === 'permission') {
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 