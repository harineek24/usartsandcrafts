import { Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Book } from './lib/types'
import { fetchBooks } from './lib/supabase'
import { Library } from './scene/Library'
import { SpreadOverlay } from './ui/SpreadOverlay'
import { SearchPanel } from './ui/SearchPanel'

interface Selection {
  book: Book
  artworkId?: string
}

export default function LibraryApp() {
  const [books, setBooks] = useState<Book[]>([])
  const [selected, setSelected] = useState<Selection | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [highlighted, setHighlighted] = useState<ReadonlySet<number>>(new Set())
  const [pixieBookId, setPixieBookId] = useState<number | null>(null)

  useEffect(() => {
    fetchBooks().then(setBooks)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setHighlighted(new Set())
  }, [])

  const selectBook = useCallback(
    (book: Book | null) => {
      closeSearch()
      setPixieBookId(null)
      setSelected(book ? { book } : null)
    },
    [closeSearch],
  )

  const openSearch = useCallback(() => {
    setSelected(null)
    setSearchOpen(true)
  }, [])

  // "/" is the keyboard path to the pixie
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSearch])

  const navigateToArtwork = useCallback(
    (bookId: number, artworkId: string) => {
      const book = books.find((b) => b.id === bookId)
      if (!book) return
      closeSearch()
      setPixieBookId(bookId) // pixie escorts the camera to the answer
      setSelected({ book, artworkId })
    },
    [books, closeSearch],
  )

  const onHighlight = useCallback((bookIds: number[]) => {
    setHighlighted(new Set(bookIds))
  }, [])

  return (
    <div className="relative h-full w-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <Library
            books={books}
            selected={selected?.book ?? null}
            onSelect={selectBook}
            highlighted={highlighted}
            pixieBookId={pixieBookId}
            onPixieClick={openSearch}
          />
        </Suspense>
      </Canvas>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 p-5 text-center">
        <h1 className="font-serif text-xl tracking-wide text-[#f0e2c4] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:text-2xl">
          Art Class Library
        </h1>
        {!selected && !searchOpen && (
          <p className="text-xs text-[#c9b48a] sm:text-sm">
            Click a book to open it · click the pixie (or press /) to search
          </p>
        )}
      </header>

      {searchOpen && (
        <SearchPanel
          books={books}
          onNavigate={navigateToArtwork}
          onHighlight={onHighlight}
          onClose={closeSearch}
        />
      )}

      <a
        href="#/admin"
        className="absolute bottom-3 right-4 text-xs text-[#7a6a50] transition hover:text-[#c9b48a]"
      >
        teacher sign-in
      </a>

      {selected && (
        <SpreadOverlay
          book={selected.book}
          artworkId={selected.artworkId}
          onClose={() => {
            setSelected(null)
            setPixieBookId(null) // pixie heads home with you
          }}
        />
      )}
    </div>
  )
}
