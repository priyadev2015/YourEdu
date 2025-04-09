export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Tables {
  profiles: {
    Row: {
      id: string
      user_id: string
      profile_picture: string | null
      parent_name: string | null
      kids: string | null
      bio: string | null
      city: string | null
      state: string | null
      curriculum: string | null
      extracurriculars: string | null
      links: string[] | null
      onboarding_completed: boolean
      college_onboarding_completed: boolean
      number_of_students: number | null
      homeschool_program: string | null
      state_requirements: string[] | null
      homeschool_goals: string[] | null
      curriculum_type: string | null
      interests: string[] | null
      planned_courses: string | null
      learning_style: string | null
      course_delivery: string[] | null
      current_resources: string | null
      use_benchmarks: boolean
      use_reminders: boolean
      current_activities: string[] | null
      desired_activities: string | null
      track_hours: boolean
      skills_to_develop: string[] | null
      want_opportunities: boolean
      career_interests: string[] | null
      career_skills: string | null
      want_career_resources: boolean
      integrate_career_exploration: boolean
      college_plans: string | null
      specific_colleges: string | null
      want_college_reminders: boolean
      standardized_tests: string[] | null
      want_test_tracking: boolean
      notification_frequency: string | null
      want_guidance: boolean
      homeschool_methods: string[] | null
      homeschool_other: string | null
      student_name: string | null
      current_grade: string | null
      graduation_date: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['profiles']['Row'], 'id'>>
  }
  students: {
    Row: {
      id: string
      profile_id: string
      full_name: string | null
      grade_level: string | null
      graduation_date: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['students']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['students']['Row'], 'id'>>
  }
  school_philosophies: {
    Row: {
      id: string
      user_id: string
      prefix: string | null
      first_name: string | null
      middle_initial: string | null
      last_name: string | null
      title: string | null
      phone_number: string | null
      fax: string | null
      email_address: string | null
      profile_url: string | null
      graduating_class_size: string | null
      block_schedule: string | null
      graduation_date: string | null
      outside_us: string | null
      volunteer_service: string | null
      school_address: string | null
      one_sentence_philosophy: string | null
      why_homeschool: string | null
      types_of_learning: string | null
      course_structure: string | null
      success_measurement: string | null
      extracurricular_opportunities: string | null
      ai_philosophy: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['school_philosophies']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['school_philosophies']['Row'], 'id'>>
  }
  transcripts: {
    Row: {
      id: string
      user_id: string
      name: string | null
      gender: string | null
      address: string | null
      city: string | null
      state: string | null
      zip: string | null
      dob: string | null
      parent_guardian: string | null
      student_email: string | null
      projected_grad_date: string | null
      parent_email: string | null
      school_name: string | null
      school_phone: string | null
      school_address: string | null
      school_city: string | null
      school_state: string | null
      school_zip: string | null
      issue_date: string | null
      graduation_date: string | null
      freshman_year: string | null
      sophomore_year: string | null
      junior_year: string | null
      senior_year: string | null
      pre_high_school_year: string | null
      cumulative_summary: Json | null
      test_scores: string | null
      grading_scale: Json | null
      miscellaneous: string | null
      signature_date: string | null
      pdf_data: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['transcripts']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['transcripts']['Row'], 'id'>>
  }
  courses: {
    Row: {
      id: string
      transcript_id: string
      year_type: string | null
      method: string | null
      course_title: string | null
      term1_grade: string | null
      term2_grade: string | null
      term3_grade: string | null
      credits: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['courses']['Row'], 'id'>>
  }
  course_descriptions: {
    Row: {
      id: string
      user_id: string
      freshman: Json
      sophomore: Json
      junior: Json
      senior: Json
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['course_descriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['course_descriptions']['Row'], 'id'>>
  }
  grading_rubrics: {
    Row: {
      id: string
      user_id: string
      evaluation_method: string | null
      learning_goals: string | null
      assignments: string | null
      grading_scale: Json | null
      ai_grading_scale: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['grading_rubrics']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['grading_rubrics']['Row'], 'id'>>
  }
  guidance_letters: {
    Row: {
      id: string
      user_id: string
      letter_content: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['guidance_letters']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['guidance_letters']['Row'], 'id'>>
  }
  scholarships: {
    Row: {
      id: string
      user_id: string
      name: string
      description: string
      offered_by: string
      amount: string
      deadline: string
      grade_level: string
      link: string
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['scholarships']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['scholarships']['Row'], 'id'>>
  }
  saved_scholarships: {
    Row: {
      id: string
      user_id: string
      scholarship_id: string
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['saved_scholarships']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['saved_scholarships']['Row'], 'id'>>
  }
  colleges: {
    Row: {
      id: string
      user_id: string
      name: string
      deadlines: Json | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['colleges']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['colleges']['Row'], 'id'>>
  }
  enrollment_forms: {
    Row: {
      id: string
      user_id: string
      parent_first_name: string | null
      parent_last_name: string | null
      parent_pronouns: string | null
      email: string | null
      phone_number: string | null
      residential_address: string | null
      mailing_address: string | null
      student_first_name: string | null
      student_middle_initial: string | null
      student_last_name: string | null
      student_pronouns: string | null
      student_birthdate: string | null
      previous_school_name: string | null
      previous_school_phone: string | null
      previous_school_address: string | null
      grade_level: string | null
      immunization_records: string | null
      curriculum: string | null
      special_education_needs: string | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['enrollment_forms']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['enrollment_forms']['Row'], 'id'>>
  }
  trackers: {
    Row: {
      id: string
      user_id: string
      school_list: Json
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['trackers']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['trackers']['Row'], 'id'>>
  }
  my_students: {
    Row: {
      id: string
      user_id: string
      email: string | null
      status: string | null
      full_name: string | null
      gpa: string | null
      school: string | null
      contact: string | null
      admin_materials: Json | null
      school_materials: Json | null
      created_at: string
      updated_at: string
    }
    Insert: Omit<Tables['my_students']['Row'], 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<Tables['my_students']['Row'], 'id'>>
  }
}

export type Database = {
  public: {
    Tables: Tables
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'highschool' | 'college' | 'lafire'
      material_status: 'not started' | 'in progress' | 'completed'
    }
  }
} 