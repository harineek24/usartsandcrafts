import type { Artwork, Book } from './types'
import { supabase } from './supabase'
import { SAMPLE_ARTWORKS } from './sampleData'
import { placeholderArt } from './placeholder'

export interface SearchHit {
  id: string
  title: string
  book_id: number
  book_label: string
  page_order: number
}

export async function fetchArtworks(bookId: number): Promise<Artwork[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('book_id', bookId)
      .order('page_order')
    if (!error && data && data.length > 0) return data as Artwork[]
  }
  return SAMPLE_ARTWORKS.filter((a) => a.book_id === bookId)
}

export async function searchArtworks(query: string, books: Book[]): Promise<SearchHit[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  if (supabase) {
    const { data, error } = await supabase.rpc('search_artworks', { query: q })
    if (!error && data && data.length > 0) return data as SearchHit[]
  }
  // Local fallback: match whole query or any word (with naive plural strip),
  // so "how to draw giraffes" still finds "Sunny Giraffe"
  const words = q.split(/\s+/).filter((w) => w.length > 2)
  const matches = (title: string) => {
    const t = title.toLowerCase()
    return (
      t.includes(q) ||
      words.some((w) => t.includes(w) || (w.endsWith('s') && t.includes(w.slice(0, -1))))
    )
  }
  const labelOf = (id: number) => books.find((b) => b.id === id)?.label ?? `Book ${id}`
  return SAMPLE_ARTWORKS.filter((a) => matches(a.title)).map((a) => ({
    id: a.id,
    title: a.title,
    book_id: a.book_id,
    book_label: labelOf(a.book_id),
    page_order: a.page_order,
  }))
}

export function artworkImageUrl(artwork: Artwork): string {
  if (artwork.image_path.startsWith('placeholder')) return placeholderArt(artwork.title)
  if (supabase) {
    return supabase.storage.from('artwork').getPublicUrl(artwork.image_path).data.publicUrl
  }
  return artwork.image_path
}
