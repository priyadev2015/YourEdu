import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Tables } from '../supabase/types/database.types';

type Profile = Tables['profiles']['Row'];
type ProfileUpdate = Tables['profiles']['Update'];

export function useProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      getProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (err) {
        throw err;
      }

      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Error fetching profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    try {
      setLoading(true);

      const { error: err } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user?.id);

      if (err) {
        throw err;
      }

      // Refresh profile data
      await getProfile();
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Tables['profiles']['Insert']) => {
    try {
      setLoading(true);

      const { error: err } = await supabase
        .from('profiles')
        .insert([{ ...profileData, user_id: user?.id }]);

      if (err) {
        throw err;
      }

      // Refresh profile data
      await getProfile();
      setError(null);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Error creating profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    getProfile,
    updateProfile,
    createProfile,
  };
} 