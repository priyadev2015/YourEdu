export interface Student {
    id: string;
    user_id: string | null;
    parent_id: string;
    student_name: string;
    date_of_birth: string | null;
    grade_level: string | null;
    graduation_year: string | null;
    school_name: string | null;
    previous_school: string | null;
    previous_school_phone: string | null;
    previous_school_address: string | null;
    curriculum: string | null;
    special_education_needs: string | null;
    created_at: string;
    updated_at: string;
} 