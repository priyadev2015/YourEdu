import { supabase } from '../supabaseClient';

// Fetch all public events
export const fetchPublicEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      registrations:event_registrations(user_id)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Fetch events created by a user
export const fetchUserCreatedEvents = async (userId) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      registrations:event_registrations(user_id)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Fetch events a user is registered for
export const fetchUserRegisteredEvents = async (userId) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select(`
      event:events(
        *,
        registrations:event_registrations(user_id)
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(registration => registration.event);
};

// Create a new event
export const createEvent = async (eventData) => {
  console.log('Creating event with data:', eventData);
  const { data, error } = await supabase
    .from('events')
    .insert([{
      title: eventData.title,
      category: eventData.category,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      max_attendees: parseInt(eventData.maxAttendees),
      is_public: eventData.isPublic,
      created_by: eventData.userId,
      current_attendees: 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }
  console.log('Successfully created event:', data);
  return data;
};

// Register for an event
export const registerForEvent = async (eventId, userId) => {
  // Start a transaction
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('current_attendees, max_attendees')
    .eq('id', eventId)
    .single();

  if (eventError) throw eventError;

  // Check if event is full
  if (event.current_attendees >= event.max_attendees) {
    throw new Error('Event is full');
  }

  // Check if already registered
  const { data: existingReg, error: regCheckError } = await supabase
    .from('event_registrations')
    .select()
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (regCheckError && regCheckError.code !== 'PGRST116') { // PGRST116 means no rows returned
    throw regCheckError;
  }

  if (existingReg) {
    throw new Error('Already registered for this event');
  }

  // Create registration and update attendee count
  const { error: registrationError } = await supabase
    .from('event_registrations')
    .insert([{
      event_id: eventId,
      user_id: userId,
    }]);

  if (registrationError) throw registrationError;

  const { error: updateError } = await supabase
    .from('events')
    .update({ current_attendees: event.current_attendees + 1 })
    .eq('id', eventId);

  if (updateError) throw updateError;

  return true;
};

// Cancel registration for an event
export const cancelRegistration = async (eventId, userId) => {
  // Start a transaction
  const { error: registrationError } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (registrationError) throw registrationError;

  const { error: updateError } = await supabase
    .from('events')
    .update({
      current_attendees: supabase.raw('current_attendees - 1')
    })
    .eq('id', eventId);

  if (updateError) throw updateError;

  return true;
};

// Delete an event
export const deleteEvent = async (eventId, userId) => {
  console.log('deleteEvent called with:', { eventId, userId });
  
  if (!eventId) {
    throw new Error('Event ID is required');
  }
  
  const { error } = await supabase
    .from('events')
    .delete()
    .match({ id: eventId, created_by: userId });

  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
  
  return true;
};

// Update an event
export const updateEvent = async (eventId, userId, updates) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .eq('created_by', userId) // Ensure only creator can update
    .select()
    .single();

  if (error) throw error;
  return data;
}; 