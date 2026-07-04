import { useEffect, useRef, useState } from 'react'
import type { Book } from '../lib/types'
import { searchArtworks, type SearchHit } from '../lib/artworks'

interface Props {
  books: Book[]
  onNavigate: (bookId: number, artworkId: string) => void
  onHighlight: (bookIds: number[]) => void
  onClose: () => void
}

export function SearchPanel({ books, onNavigate, onHighlight, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) {
        setHits([])
        setSearched(false)
        onHighlight([])
        return
      }
      const results = await searchArtworks(query, books)
      setHits(results)
      setSearched(true)
      onHighlight([...new Set(results.map((h) => h.book_id))]) // pixie lights up matching books
    }, 250)
    return () => clearTimeout(t)
  }, [query, books, onHighlight])

  const bookIds = [...new Set(hits.map((h) => h.book_id))]
  const firstHitIn = (bookId: number) => hits.find((h) => h.book_id === bookId)!

  return (
    <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#8b6f47]/60 bg-[#241d17]/95 p-4 shadow-[0_10px_50px_rgba(0,0,0,0.7)] backdrop-blur">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-xl">✨</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What shall we find? Try “how to draw giraffes”…"
            className="flex-1 rounded-lg border border-[#8b6f47]/40 bg-[#171310] px-3 py-2 text-[#f0e2c4] placeholder-[#7a6a50] outline-none focus:border-[#c9a227]"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="rounded-full px-2 py-1 text-[#c9b48a] transition hover:text-[#f0e2c4]"
          >
            ✕
          </button>
        </div>

        {searched && hits.length === 0 && (
          <p className="mt-3 text-sm italic text-[#c9b48a]">
            Hmm, nothing on the shelves matches that… try another word from the artwork’s title.
          </p>
        )}

        {bookIds.length > 1 && (
          <div className="mt-3">
            <p className="mb-2 text-sm text-[#c9b48a]">
              I found that in a few books — which level would you like?
            </p>
            <div className="flex flex-wrap gap-2">
              {bookIds.map((id) => {
                const hit = firstHitIn(id)
                return (
                  <button
                    key={id}
                    onClick={() => onNavigate(id, hit.id)}
                    className="rounded-full border border-[#c9a227]/60 bg-[#c9a227]/10 px-3 py-1 text-sm text-[#f0e2c4] transition hover:bg-[#c9a227]/30"
                  >
                    {hit.book_label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {hits.length > 0 && (
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
            {hits.map((hit) => (
              <li key={hit.id}>
                <button
                  onClick={() => onNavigate(hit.book_id, hit.id)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#f0e2c4] transition hover:bg-[#8b6f47]/20"
                >
                  <span className="font-medium">{hit.title}</span>
                  <span className="text-[#c9b48a]"> — {hit.book_label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
