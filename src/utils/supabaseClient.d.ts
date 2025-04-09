import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types/database.types'

export const supabase: SupabaseClient<Database>
export function checkSupabaseConnection(): Promise<boolean>
export function reconnectSupabase(): Promise<boolean>
export function getEnvironmentRedirectUrl(path?: string): string 