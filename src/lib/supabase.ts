import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Book } from './types'
import { SAMPLE_BOOKS } from './sampleData'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export async function fetchBooks(): Promise<Book[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('sort_order')
    if (!error && data && data.length > 0) return data as Book[]
  }
  return SAMPLE_BOOKS
}
