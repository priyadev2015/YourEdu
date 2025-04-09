import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../supabase/types/database.types';

type TableName = keyof Database['public']['Tables'];

export class BaseService<T extends TableName> {
  protected table: T;
  protected supabase = supabase;

  constructor(table: T) {
    this.table = table;
  }

  protected async getAll() {
    const { data, error } = await supabase
      .from(this.table)
      .select('*');

    if (error) throw error;
    return data;
  }

  protected async getById(id: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  protected async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  protected async create(data: Database['public']['Tables'][T]['Insert']) {
    const { data: created, error } = await supabase
      .from(this.table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  protected async update(id: string, data: Database['public']['Tables'][T]['Update']) {
    const { data: updated, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  }

  protected async delete(id: string) {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  protected async query<TReturn = any>(
    queryFn: (query: ReturnType<typeof supabase.from>) => Promise<{ data: TReturn | null; error: PostgrestError | null }>
  ): Promise<TReturn> {
    const result = await queryFn(supabase.from(this.table));
    if (result.error) throw result.error;
    return result.data as TReturn;
  }
} 