import { supabase } from '../utils/supabaseClient';

/**
 * Service for handling student data access for both parent and student accounts
 */
export class StudentDataService {
    /**
     * Get the current user's student data
     * For student accounts: returns their own student record
     * For parent accounts: returns all their student records
     */
    static async getCurrentUserStudentData() {
        try {
            const { data, error } = await supabase.rpc('get_student_data');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting student data:', error);
            throw error;
        }
    }

    /**
     * Get a specific student's data by ID
     * Checks permissions automatically via RLS
     */
    static async getStudentById(studentId) {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', studentId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting student by ID:', error);
            throw error;
        }
    }

    /**
     * Get transcript data for a student
     */
    static async getTranscript(studentId) {
        try {
            // First get the transcript record
            const { data: transcript, error: transcriptError } = await supabase
                .from('transcripts')
                .select('*')
                .eq('student_id', studentId)
                .maybeSingle();
            
            if (transcriptError) throw transcriptError;
            
            if (!transcript) {
                return null; // No transcript found
            }
            
            // Get the courses for this transcript
            const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('*')
                .eq('transcript_id', transcript.id)
                .order('sort_order', { ascending: true });
            
            if (coursesError) throw coursesError;
            
            // Format and return the data
            return {
                transcript,
                courses: courses || []
            };
        } catch (error) {
            console.error('Error getting transcript:', error);
            throw error;
        }
    }

    /**
     * Get course descriptions for a student
     */
    static async getCourseDescriptions(studentId) {
        try {
            const { data, error } = await supabase
                .from('course_descriptions')
                .select('*')
                .eq('student_id', studentId)
                .maybeSingle();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting course descriptions:', error);
            throw error;
        }
    }

    /**
     * Get attendance records for a student
     */
    static async getAttendanceRecords(studentId, startDate, endDate) {
        try {
            let query = supabase
                .from('attendance_records')
                .select('*')
                .eq('student_id', studentId)
                .order('date', { ascending: true });
            
            if (startDate) {
                query = query.gte('date', startDate);
            }
            
            if (endDate) {
                query = query.lte('date', endDate);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting attendance records:', error);
            throw error;
        }
    }

    /**
     * Update attendance record for a student
     */
    static async updateAttendanceRecord(studentId, date, status) {
        try {
            // Check if record exists
            const { data: existingRecord, error: checkError } = await supabase
                .from('attendance_records')
                .select('id')
                .eq('student_id', studentId)
                .eq('date', date)
                .maybeSingle();
            
            if (checkError) throw checkError;
            
            if (existingRecord) {
                // Update existing record
                const { data, error } = await supabase
                    .from('attendance_records')
                    .update({ status })
                    .eq('id', existingRecord.id)
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            } else {
                // Insert new record
                const { data, error } = await supabase
                    .from('attendance_records')
                    .insert([{
                        student_id: studentId,
                        date,
                        status
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Error updating attendance record:', error);
            throw error;
        }
    }

    /**
     * Get courses for a student
     */
    static async getStudentCourses(studentId) {
        try {
            // Fetch both youredu_courses and user_courses
            const [youreduCoursesResult, userCoursesResult] = await Promise.all([
                supabase
                    .from('youredu_courses')
                    .select('*')
                    .eq('student_id', studentId),
                supabase
                    .from('user_courses')
                    .select('*')
                    .eq('student_id', studentId)
            ]);

            if (youreduCoursesResult.error) throw youreduCoursesResult.error;
            if (userCoursesResult.error) throw userCoursesResult.error;

            // Combine and format courses
            const allCourses = [
                ...(youreduCoursesResult.data || []).map(course => ({
                    ...course,
                    source: 'youredu'
                })),
                ...(userCoursesResult.data || []).map(course => ({
                    ...course,
                    source: 'user'
                }))
            ];

            return allCourses;
        } catch (error) {
            console.error('Error fetching student courses:', error);
            throw error;
        }
    }

    /**
     * Link a student account to a student record
     */
    static async linkStudentAccount(studentId, userId) {
        try {
            const { data, error } = await supabase.rpc('link_student_account', {
                p_student_id: studentId,
                p_user_id: userId
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error linking student account:', error);
            throw error;
        }
    }
} 