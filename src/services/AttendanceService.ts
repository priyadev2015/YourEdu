import { supabase } from '../utils/supabaseClient';
import dayjs from 'dayjs';

export interface Student {
  id: string;
  parent_id: string;
  student_name: string;
  grade_level: string;
  date_of_birth: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'not_marked';
  created_at: string;
  updated_at: string;
}

export class AttendanceService {
  // Get all students for the current user
  static async getStudents(): Promise<Student[]> {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('student_name');

    if (error) throw error;
    return students;
  }

  // Create a new student
  static async createStudent(name: string, grade: string): Promise<Student> {
    const { data: student, error } = await supabase
      .from('students')
      .insert([{ name, grade }])
      .select()
      .single();

    if (error) throw error;
    return student;
  }

  // Get attendance records for a student within a date range
  static async getAttendanceRecords(
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceRecord[]> {
    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return records;
  }

  // Get attendance records for a student for the entire year
  static async getYearlyAttendanceRecords(
    studentId: string,
    year: number = dayjs().year()
  ): Promise<AttendanceRecord[]> {
    const startDate = dayjs().year(year).startOf('year').format('YYYY-MM-DD');
    const endDate = dayjs().year(year).endOf('year').format('YYYY-MM-DD');
    
    return this.getAttendanceRecords(studentId, startDate, endDate);
  }

  // Update or create attendance record for a specific date
  static async upsertAttendanceRecord(
    studentId: string,
    date: string,
    status: 'present' | 'absent' | 'not_marked'
  ): Promise<AttendanceRecord> {
    const { data: record, error } = await supabase
      .from('attendance_records')
      .upsert(
        { 
          student_id: studentId,
          date,
          status
        },
        {
          onConflict: 'student_id,date'
        }
      )
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  // Get attendance summary for a student
  static async getAttendanceSummary(
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<{ present: number; absent: number; not_marked: number }> {
    const records = await this.getAttendanceRecords(studentId, startDate, endDate);

    return records.reduce(
      (acc, record) => {
        acc[record.status]++;
        return acc;
      },
      { present: 0, absent: 0, not_marked: 0 }
    );
  }

  // Get yearly attendance summary
  static async getYearlyAttendanceSummary(
    studentId: string,
    year: number = dayjs().year()
  ): Promise<{ present: number; absent: number; not_marked: number }> {
    const startDate = dayjs().year(year).startOf('year').format('YYYY-MM-DD');
    const endDate = dayjs().year(year).endOf('year').format('YYYY-MM-DD');
    
    return this.getAttendanceSummary(studentId, startDate, endDate);
  }

  // Bulk update attendance records
  static async bulkUpsertAttendanceRecords(
    records: Array<{
      student_id: string;
      date: string;
      status: 'present' | 'absent' | 'not_marked';
    }>
  ): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(records, {
        onConflict: 'student_id,date'
      })
      .select();

    if (error) throw error;
    return data;
  }
} 