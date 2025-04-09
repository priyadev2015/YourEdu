import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const deleteUserAccount = async (userId) => {
  try {
    console.log('Attempting to delete user:', userId);
    console.log('Using URL:', process.env.REACT_APP_SUPABASE_URL);
    console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_KEY);

    // First delete all user data using regular client
    const { error: deleteDataError } = await supabase.rpc('delete_user_data', {
      user_id: userId
    });

    if (deleteDataError) {
      console.error('Error deleting user data:', deleteDataError);
      throw deleteDataError;
    }

    console.log('Successfully deleted user data, now deleting auth user');

    // Delete the user from auth.users using admin client
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      throw deleteUserError;
    }

    console.log('Successfully deleted auth user');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    return { success: false, error };
  }
}; 