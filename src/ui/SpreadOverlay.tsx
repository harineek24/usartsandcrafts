import { useEffect, useState } from 'react'
import type { Artwork, Book } from '../lib/types'
import { artworkImageUrl, fetchArtworks } from '../lib/artworks'

interface Props {
  book: Book
  artworkId?: string
  onClose: () => void
}

export function SpreadOverlay({ book, artworkId, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [artworks, setArtworks] = useState<Artwork[] | null>(null)
  const [page, setPage] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    // hold the overlay back until the camera dolly-in mostly lands
    const t = setTimeout(() => setVisible(true), 550)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchArtworks(book.id).then((list) => {
      if (cancelled) return
      setArtworks(list)
      const index = artworkId ? list.findIndex((a) => a.id === artworkId) : 0
      setPage(Math.max(0, index))
    })
    return () => {
      cancelled = true
    }
  }, [book.id, artworkId])

  const count = artworks?.length ?? 0
  const current = artworks?.[page]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // fullscreen backs out one layer at a time
        if (fullscreen) setFullscreen(false)
        else onClose()
      }
      if (e.key === 'ArrowRight') setPage((p) => Math.min(p + 1, count - 1))
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(p - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, fullscreen, count])

  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-500 sm:p-8 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className="relative flex aspect-[3/2] w-full max-w-5xl overflow-hidden rounded-lg shadow-[0_25px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* left page: artwork */}
        <section className="flex w-1/2 flex-col items-center justify-center gap-3 bg-[#f1e6cd] p-6">
          {current ? (
            <>
              <img
                src={artworkImageUrl(current)}
                alt={current.title}
                onClick={() => setFullscreen(true)}
                className="max-h-[72%] max-w-[85%] cursor-zoom-in rounded border-8 border-[#8b6f47] object-contain shadow-lg transition hover:scale-[1.02]"
                title="Click to view full screen"
              />
              <div className="text-center">
                <p className="font-serif text-lg text-[#3d2f1f]">{current.title}</p>
                <p className="text-sm text-[#7a6a50]">
                  {current.student_name ? `by ${current.student_name} · ` : ''}
                  {book.label} · {current.school_year}
                </p>
              </div>
            </>
          ) : (
            <p className="text-center text-sm italic text-[#8b6f47]">
              {artworks === null
                ? 'Opening the book…'
                : 'This book is waiting for its first artwork.'}
            </p>
          )}
        </section>

        {/* center gutter shadow */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/25 to-transparent" />

        {/* right page: materials & notes */}
        <section className="flex w-1/2 flex-col gap-5 bg-[#f5ebd6] p-8 pr-12">
          <h2 className="font-serif text-xl text-[#3d2f1f]">Materials</h2>
          {current && current.materials.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-[15px] text-[#4a3a26]">
              {current.materials.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-[#7a6a50]">No materials listed.</p>
          )}
          {current?.teacher_notes && (
            <>
              <h2 className="font-serif text-xl text-[#3d2f1f]">Teacher’s notes</h2>
              <p className="text-[15px] leading-relaxed text-[#4a3a26]">{current.teacher_notes}</p>
            </>
          )}
        </section>

        {/* page flip controls */}
        {count > 1 && (
          <>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              aria-label="Previous artwork"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-[#3d2f1f]/70 px-3 py-2 text-xl text-[#f1e6cd] transition hover:bg-[#3d2f1f] disabled:opacity-30"
            >
              ‹
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, count - 1))}
              disabled={page === count - 1}
              aria-label="Next artwork"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#3d2f1f]/70 px-3 py-2 text-xl text-[#f1e6cd] transition hover:bg-[#3d2f1f] disabled:opacity-30"
            >
              ›
            </button>
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-[#7a6a50]">
              Artwork {page + 1} of {count}
            </p>
          </>
        )}

        <button
          onClick={onClose}
          aria-label="Close book"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#3d2f1f]/80 text-[#f1e6cd] transition hover:bg-[#3d2f1f]"
        >
          ✕
        </button>
      </div>

      {/* fullscreen lightbox */}
      {fullscreen && current && (
        <div
          className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/95 p-6"
          onClick={(e) => {
            e.stopPropagation()
            setFullscreen(false)
          }}
        >
          <img
            src={artworkImageUrl(current)}
            alt={current.title}
            className="max-h-[85vh] max-w-full rounded object-contain shadow-2xl"
          />
          <p className="text-sm text-[#c9b48a]">
            {current.title}
            {current.student_name ? ` · by ${current.student_name}` : ''} · {book.label}
          </p>
          <button
            aria-label="Exit full screen"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
