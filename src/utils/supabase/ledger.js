import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Fetch user's ledger entries
export const fetchLedgerEntries = async () => {
  try {
    const { data: entries, error: entriesError } = await supabase
      .from('ledger_entries')
      .select(`
        *,
        ledger_entry_skills (
          skill
        )
      `)
      .order('date', { ascending: false });

    if (entriesError) throw entriesError;

    // Format entries to match the expected structure
    return entries.map(entry => ({
      ...entry,
      skills: entry.ledger_entry_skills.map(s => s.skill)
    }));
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    throw error;
  }
};

// Create a new ledger entry
export const createLedgerEntry = async (entry) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // First, create the entry
    const { data: newEntry, error: entryError } = await supabase
      .from('ledger_entries')
      .insert({
        type: entry.type,
        title: entry.title,
        description: entry.description,
        date: entry.date,
        evidence_url: entry.evidence,
        image_url: entry.image,
        verified: false,
        user_id: user.id
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // Then, add skills if any
    if (entry.skills && entry.skills.length > 0) {
      const skillRecords = entry.skills.map(skill => ({
        entry_id: newEntry.id,
        skill: skill
      }));

      const { error: skillsError } = await supabase
        .from('ledger_entry_skills')
        .insert(skillRecords);

      if (skillsError) throw skillsError;
    }

    return {
      ...newEntry,
      skills: entry.skills || []
    };
  } catch (error) {
    console.error('Error creating ledger entry:', error);
    throw error;
  }
};

// Update an existing ledger entry
export const updateLedgerEntry = async (entryId, updates) => {
  try {
    // Update the main entry
    const { data: updatedEntry, error: entryError } = await supabase
      .from('ledger_entries')
      .update({
        type: updates.type,
        title: updates.title,
        description: updates.description,
        date: updates.date,
        evidence_url: updates.evidence,
        image_url: updates.image
      })
      .eq('id', entryId)
      .select()
      .single();

    if (entryError) throw entryError;

    // Update skills if provided
    if (updates.skills) {
      // Delete existing skills
      const { error: deleteError } = await supabase
        .from('ledger_entry_skills')
        .delete()
        .eq('entry_id', entryId);

      if (deleteError) throw deleteError;

      // Add new skills
      const skills = updates.skills.split(',').map(skill => skill.trim());
      const skillRecords = skills.map(skill => ({
        entry_id: entryId,
        skill: skill
      }));

      const { error: skillsError } = await supabase
        .from('ledger_entry_skills')
        .insert(skillRecords);

      if (skillsError) throw skillsError;
    }

    return updatedEntry;
  } catch (error) {
    console.error('Error updating ledger entry:', error);
    throw error;
  }
};

// Delete a ledger entry
export const deleteLedgerEntry = async (entryId) => {
  try {
    const { error } = await supabase
      .from('ledger_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting ledger entry:', error);
    throw error;
  }
};

// Fetch user's ledger settings
export const fetchLedgerSettings = async () => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('ledger_settings')
      .select('title, subtitle, profile_image_url, cover_image_url, theme_color')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    // Return default settings if none exist
    return data || {
      title: 'My Educational Journey',
      subtitle: 'A collection of achievements, skills, and experiences',
      profile_image_url: null,
      cover_image_url: null,
      theme_color: '#1976d2'
    };
  } catch (error) {
    console.error('Error fetching ledger settings:', error);
    throw error;
  }
};

// Update ledger settings
export const updateLedgerSettings = async (settings) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('ledger_settings')
      .upsert({
        user_id: user.id,
        title: settings.title || 'My Educational Journey',
        subtitle: settings.subtitle || 'A collection of achievements, skills, and experiences',
        profile_image_url: settings.profileImage || null,
        cover_image_url: settings.coverImage || null,
        theme_color: settings.themeColor || '#1976d2'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating ledger settings:', error);
    throw error;
  }
};

// Upload an image to storage
export const uploadLedgerImage = async (file, type) => {
  try {
    if (!file) return null;

    // Convert base64 to blob if needed
    let fileToUpload = file;
    if (typeof file === 'string' && file.startsWith('data:')) {
      const response = await fetch(file);
      fileToUpload = await response.blob();
    }

    const fileExt = fileToUpload.type.split('/')[1] || 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${type}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ledger-images')
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('ledger-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}; 