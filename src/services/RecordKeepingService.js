import { supabase } from '../utils/supabaseClient';

export class RecordKeepingService {
  async getFolders() {
    try {
      const { data: folders, error } = await supabase
        .from('folders')
        .select(`
          *,
          documentCount:documents(count)
        `)
        .order('name');

      if (error) throw error;
      
      return folders.map(folder => ({
        ...folder,
        documentCount: folder.documentCount[0].count
      }));
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  async createFolder(name, category) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('folders')
        .insert({
          name,
          category,
          user_id: user.id,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  async uploadDocument(file, folderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Upload file to storage
      const filePath = `${user.id}/${folderId}/${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('record-keeping-documents')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Create document record in database
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_path: filePath,
          size_kb: Math.round(file.size / 1024),
          mime_type: file.type,
          folder_id: folderId,
          user_id: user.id
        })
        .select()
        .single();

      if (documentError) throw documentError;
      return documentData;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getDocuments(folderId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (folderId) {
        query = query.eq('folder_id', folderId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getTotalDocumentCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count;
    } catch (error) {
      console.error('Error getting document count:', error);
      throw error;
    }
  }

  async downloadDocument(documentPath, bucketName) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(documentPath);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentPath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async deleteDocument(documentPath, bucketName, documentId = null, tableName = null) {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([documentPath]);

      if (storageError) throw storageError;

      // If a table record needs to be deleted
      if (documentId && tableName) {
        const { error: dbError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', documentId);

        if (dbError) throw dbError;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async deleteFolder(folderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First get all documents in the folder
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('folder_id', folderId);

      if (docError) throw docError;

      // Delete all documents in the folder
      for (const document of documents) {
        // Delete file from storage
        const { error: storageError } = await supabase.storage
          .from('record-keeping-documents')
          .remove([document.file_path]);

        if (storageError) throw storageError;
      }

      // Delete all document records in the folder
      if (documents.length > 0) {
        const { error: deleteDocsError } = await supabase
          .from('documents')
          .delete()
          .eq('folder_id', folderId);

        if (deleteDocsError) throw deleteDocsError;
      }

      // Finally delete the folder
      const { error: deleteFolderError } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', user.id)
        .eq('is_default', false); // Prevent deletion of default folders

      if (deleteFolderError) throw deleteFolderError;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  async getAllDocuments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all documents:', error);
      throw error;
    }
  }

  async getDocumentsByCategory(category) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First get all folders of the specified category
      const { data: folders, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', category);

      if (folderError) throw folderError;

      if (!folders || folders.length === 0) {
        return [];
      }

      // Then get all documents in those folders
      const folderIds = folders.map(f => f.id);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .in('folder_id', folderIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching documents by category:', error);
      throw error;
    }
  }

  async getStudents() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudentCourses(studentId) {
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

  async getCourseMaterials(courseId) {
    try {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course materials:', error);
      throw error;
    }
  }

  async getIdCards() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('id_cards')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching ID cards:', error);
      throw error;
    }
  }

  async getComplianceDocuments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get compliance forms from state compliance filing
      const { data: complianceForms, error: complianceError } = await supabase
        .from('state_compliance_forms')
        .select('*')
        .eq('user_id', user.id);

      if (complianceError) throw complianceError;

      // Get uploaded compliance documents
      const { data: uploadedDocs, error: uploadError } = await supabase
        .from('compliance_documents')
        .select('*')
        .eq('user_id', user.id);

      if (uploadError) throw uploadError;

      // Combine both types of documents
      const allDocuments = [
        ...(complianceForms || []).map(form => ({
          ...form,
          type: 'compliance-form',
          name: `${form.form_type} - ${new Date(form.submitted_at).toLocaleDateString()}`,
          bucket: 'compliance-forms'
        })),
        ...(uploadedDocs || []).map(doc => ({
          ...doc,
          type: 'compliance-document',
          bucket: 'compliance_documents'
        }))
      ];

      return allDocuments;
    } catch (error) {
      console.error('Error fetching compliance documents:', error);
      throw error;
    }
  }

  async getTranscripts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get all students first
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, student_name')
        .eq('parent_id', user.id);

      if (studentError) throw studentError;

      // Get transcripts for all students
      const transcriptPromises = students.map(async (student) => {
        const { data, error } = await supabase
          .from('transcripts')
          .select('*')
          .eq('student_id', student.id);

        if (error) throw error;

        return (data || []).map(transcript => ({
          ...transcript,
          student_name: student.student_name,
          name: `${student.student_name} - ${transcript.term} ${transcript.year}`,
          bucket: 'transcripts'
        }));
      });

      const transcriptArrays = await Promise.all(transcriptPromises);
      return transcriptArrays.flat();
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      throw error;
    }
  }
} 