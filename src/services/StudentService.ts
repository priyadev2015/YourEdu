import { supabase } from '../utils/supabaseClient';
import { Student } from '../types/database.types';

export class StudentService {
    static async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('students')
            .insert([studentData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getStudentsByParentId(parentId: string) {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('parent_id', parentId);

        if (error) throw error;
        return data;
    }

    static async getStudentById(studentId: string) {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (error) throw error;
        return data;
    }

    static async updateStudent(studentId: string, updates: Partial<Student>) {
        const { data, error } = await supabase
            .from('students')
            .update(updates)
            .eq('id', studentId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async deleteStudent(studentId: string) {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', studentId);

        if (error) throw error;
    }
} 