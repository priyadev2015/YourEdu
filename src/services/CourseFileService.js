import { supabase } from '../utils/supabaseClient'

class CourseFileService {
  /**
   * Helper method to check if the current user has access to a course
   * @param {string} courseId - The ID of the course to check access for
   * @returns {Promise<boolean>} - True if the user has access, throws an error otherwise
   */
  async checkCourseAccess(courseId) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('You must be logged in to access course files')
    }
    
    // First check youredu_courses
    const { data: youreduCourse, error: youreduError } = await supabase
      .from('youredu_courses')
      .select('*')
      .eq('id', courseId)
      .single()
      
    if (youreduCourse) {
      return true // User has access to youredu courses
    }
    
    // If not found in youredu_courses or there was an error, check user_courses
    const { data: userCourse, error: userError } = await supabase
      .from('user_courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', user.id)
      .single()
      
    if (userCourse) {
      return true // User has access to this course
    }
    
    // If we get here, the user doesn't have access
    throw new Error('You do not have access to this course')
  }

  /**
   * Maps frontend categories to database categories
   * @param {string} frontendCategory - The category used in the frontend
   * @returns {string} - The corresponding database category
   */
  mapCategoryToDbCategory(frontendCategory) {
    // Map from frontend categories to database categories
    const categoryMap = {
      'syllabus': 'syllabus',
      'readings': 'materials',
      'problem_sets': 'assignments',
      'lecture_notes': 'materials',
      'supplemental': 'materials',
      'video_links': 'materials',
      // Add any other mappings as needed
    };
    
    return categoryMap[frontendCategory] || 'other';
  }

  /**
   * Sanitizes a filename to be safe for storage
   * @param {string} filename - The original filename
   * @returns {string} - A sanitized filename
   */
  sanitizeFilename(filename) {
    // Replace spaces and special characters
    return filename
      .replace(/[^\w\s.-]/g, '')  // Remove any character that's not alphanumeric, underscore, period, or hyphen
      .replace(/\s+/g, '_');      // Replace spaces with underscores
  }

  /**
   * Upload a file to a course
   * @param {File} file - The file to upload
   * @param {string} courseId - The ID of the course to upload the file to
   * @param {string} category - The category of the file (e.g., 'syllabus', 'assignment')
   * @returns {Promise<Object>} - The uploaded file data
   */
  async uploadFile(file, courseId, category) {
    try {
      // Check if user is authenticated and has access to the course
      await this.checkCourseAccess(courseId)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to upload files')
      }
      
      // Map the frontend category to a database-compatible category
      const dbCategory = this.mapCategoryToDbCategory(category);
      
      // Create a unique file path with sanitized filename
      const timestamp = Date.now();
      const sanitizedFilename = this.sanitizeFilename(file.name);
      const filePath = `${courseId}/${category}/${timestamp}_${sanitizedFilename}`;
      
      // Upload the file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('course-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
        
      if (storageError) {
        console.error('Error uploading file to storage:', storageError)
        throw new Error(`Failed to upload file: ${storageError.message}`)
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('course-files')
        .getPublicUrl(filePath)
        
      // Insert a record in the course_files table
      const { data: fileData, error: fileError } = await supabase
        .from('course_files')
        .insert([
          {
            user_id: user.id,
            course_id: courseId,
            name: file.name,
            file_path: filePath,
            size_kb: Math.round(file.size / 1024),
            mime_type: file.type,
            category: dbCategory // Use the mapped category for database
          }
        ])
        .select()
        .single()
        
      if (fileError) {
        console.error('Error inserting file record:', fileError)
        throw new Error(`Failed to save file information: ${fileError.message}`)
      }
      
      return fileData
    } catch (error) {
      console.error('Error in uploadFile:', error)
      throw error
    }
  }

  /**
   * Get files for a course
   * @param {string} courseId - The ID of the course to get files for
   * @param {string} [category] - Optional category to filter by
   * @returns {Promise<Array>} - Array of file objects
   */
  async getFiles(courseId, category) {
    try {
      // Check if user has access to this course
      await this.checkCourseAccess(courseId)
      
      // Build the query
      let query = supabase
        .from('course_files')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        
      // Add category filter if provided
      if (category) {
        // Map the frontend category to a database category if needed
        const dbCategory = this.mapCategoryToDbCategory(category);
        query = query.eq('category', dbCategory);
      }
      
      // Execute the query
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching files:', error)
        throw new Error(`Failed to fetch files: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getFiles:', error)
      throw error
    }
  }

  /**
   * Download a file
   * @param {string} fileId - The ID of the file to download
   * @returns {Promise<string>} - The download URL
   */
  async downloadFile(fileId) {
    try {
      // Get the file information
      const { data: fileData, error: fileError } = await supabase
        .from('course_files')
        .select('*')
        .eq('id', fileId)
        .single()
        
      if (fileError) {
        console.error('Error fetching file information:', fileError)
        throw new Error(`Failed to fetch file information: ${fileError.message}`)
      }
      
      // Check if user has access to the course this file belongs to
      await this.checkCourseAccess(fileData.course_id)
      
      // Get a signed URL for the file
      const { data, error } = await supabase.storage
        .from('course-files')
        .createSignedUrl(fileData.file_path, 60) // URL valid for 60 seconds
        
      if (error) {
        console.error('Error creating signed URL:', error)
        throw new Error(`Failed to generate download link: ${error.message}`)
      }
      
      return data.signedUrl
    } catch (error) {
      console.error('Error in downloadFile:', error)
      throw error
    }
  }

  /**
   * Delete a file
   * @param {string} fileId - The ID of the file to delete
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    try {
      // Get the file information
      const { data: fileData, error: fileError } = await supabase
        .from('course_files')
        .select('*')
        .eq('id', fileId)
        .single()
        
      if (fileError) {
        console.error('Error fetching file information:', fileError)
        throw new Error(`Failed to fetch file information: ${fileError.message}`)
      }
      
      // Check if user has access to the course this file belongs to
      await this.checkCourseAccess(fileData.course_id)
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('course-files')
        .remove([fileData.file_path])
        
      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        throw new Error(`Failed to delete file from storage: ${storageError.message}`)
      }
      
      // Delete the file record from the database
      const { error: dbError } = await supabase
        .from('course_files')
        .delete()
        .eq('id', fileId)
        
      if (dbError) {
        console.error('Error deleting file record:', dbError)
        throw new Error(`Failed to delete file record: ${dbError.message}`)
      }
    } catch (error) {
      console.error('Error in deleteFile:', error)
      throw error
    }
  }

  async getCourseType(courseId) {
    try {
      // First check youredu_courses
      const { data: youreduCourse } = await supabase
        .from('youredu_courses')
        .select('id')
        .eq('id', courseId)
        .maybeSingle();

      if (youreduCourse) {
        return 'youredu_course';
      }

      // Then check user_courses
      const { data: userCourse } = await supabase
        .from('user_courses')
        .select('id')
        .eq('id', courseId)
        .single();

      if (userCourse) {
        return 'user_course';
      }

      throw new Error('Course not found');
    } catch (error) {
      console.error('Error determining course type:', error);
      throw error;
    }
  }

  async getFiles(courseId) {
    try {
      const courseType = await this.getCourseType(courseId);
      
      const { data, error } = await supabase
        .from('user_course_files')
        .select('*')
        .eq('course_id', courseId)
        .eq('course_type', courseType);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  async uploadFile(file, courseId, category) {
    try {
      const courseType = await this.getCourseType(courseId);
      
      // Create a unique file path
      const timestamp = Date.now();
      const filePath = `${courseType}/${courseId}/${category}/${timestamp}_${file.name}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create file record in database
      const { data: fileRecord, error: dbError } = await supabase
        .from('user_course_files')
        .insert({
          course_id: courseId,
          course_type: courseType,
          file_path: filePath,
          name: file.name,
          size_kb: Math.round(file.size / 1024),
          category: this.mapCategoryToDbCategory(category),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return fileRecord;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async downloadFile(fileId) {
    try {
      // Get file record
      const { data: fileRecord, error: recordError } = await supabase
        .from('user_course_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (recordError) throw recordError;

      // Generate download URL
      const { data: { signedUrl }, error: urlError } = await supabase.storage
        .from('course-files')
        .createSignedUrl(fileRecord.file_path, 60); // 60 seconds expiry

      if (urlError) throw urlError;

      return signedUrl;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      // Get file record first
      const { data: fileRecord, error: recordError } = await supabase
        .from('user_course_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (recordError) throw recordError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('course-files')
        .remove([fileRecord.file_path]);

      if (storageError) throw storageError;

      // Delete database record
      const { error: dbError } = await supabase
        .from('user_course_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

export default new CourseFileService();
