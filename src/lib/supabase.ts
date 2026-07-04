import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Book } from './types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

// Mirrors the seed in 0001_init.sql so the shelf renders without a .env
const FALLBACK_BOOKS: Book[] = [
  { id: 0, label: 'Kindergarten', book_color: '#8b3a1e', sort_order: 0 },
  { id: 1, label: 'Grade 1', book_color: '#2b5288', sort_order: 1 },
  { id: 2, label: 'Grade 2', book_color: '#3d7a52', sort_order: 2 },
  { id: 3, label: 'Grade 3', book_color: '#9c2a2a', sort_order: 3 },
  { id: 4, label: 'Grade 4', book_color: '#8b3a1e', sort_order: 4 },
  { id: 5, label: 'Grade 5', book_color: '#2b5288', sort_order: 5 },
  { id: 6, label: 'Grade 6', book_color: '#3d7a52', sort_order: 6 },
  { id: 7, label: 'Grade 7', book_color: '#9c2a2a', sort_order: 7 },
  { id: 8, label: 'Grade 8', book_color: '#8b3a1e', sort_order: 8 },
  { id: 9, label: 'Grade 9', book_color: '#2b5288', sort_order: 9 },
  { id: 10, label: 'Grade 10', book_color: '#3d7a52', sort_order: 10 },
  { id: 11, label: 'Grade 11', book_color: '#9c2a2a', sort_order: 11 },
  { id: 12, label: 'Grade 12', book_color: '#8b3a1e', sort_order: 12 },
  { id: 100, label: 'Adults', book_color: '#5b4a2f', sort_order: 100 },
]

export async function fetchBooks(): Promise<Book[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('sort_order')
    if (!error && data && data.length > 0) return data as Book[]
  }
  return FALLBACK_BOOKS
}
