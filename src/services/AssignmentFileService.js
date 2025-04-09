import { supabase } from '../utils/supabaseClient'

export class AssignmentFileService {
  constructor() {
    this.bucketName = 'assignment-submissions'
  }

  async initializeBucket() {
    const { data: bucket, error } = await supabase.storage.getBucket(this.bucketName)
    if (error && error.message.includes('does not exist')) {
      const { data, error: createError } = await supabase.storage.createBucket(this.bucketName, {
        public: false,
        allowedMimeTypes: [
          'application/pdf',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        fileSizeLimit: 10485760, // 10MB
      })
      if (createError) throw createError
      return data
    }
    if (error) throw error
    return bucket
  }

  async uploadFile(assignmentId, userId, file) {
    const filePath = `${assignmentId}/${userId}/${file.name}`
    const { data, error } = await supabase.storage.from(this.bucketName).upload(filePath, file)

    if (error) throw error
    return data
  }

  async getFile(filePath) {
    const { data, error } = await supabase.storage.from(this.bucketName).download(filePath)

    if (error) throw error
    return data
  }

  async deleteFile(filePath) {
    const { error } = await supabase.storage.from(this.bucketName).remove([filePath])

    if (error) throw error
  }
}
