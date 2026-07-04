import { useEffect, useState } from 'react'
import type { Book } from '../lib/types'

interface Props {
  book: Book
  onClose: () => void
}

export function SpreadOverlay({ book, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // hold the overlay back until the camera dolly-in mostly lands
    const t = setTimeout(() => setVisible(true), 550)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
          <div className="flex aspect-[4/5] w-3/4 items-center justify-center rounded border-4 border-[#8b6f47] bg-[#e6d8b8] text-center text-sm text-[#8b6f47]">
            Artwork appears here
          </div>
          <p className="font-serif text-lg text-[#3d2f1f]">{book.label}</p>
        </section>
        {/* center gutter shadow */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/25 to-transparent" />
        {/* right page: materials & notes */}
        <section className="flex w-1/2 flex-col gap-4 bg-[#f5ebd6] p-8">
          <h2 className="font-serif text-xl text-[#3d2f1f]">Materials</h2>
          <p className="text-sm italic text-[#7a6a50]">
            Materials and teacher notes will appear here once artwork is added.
          </p>
        </section>
        <button
          onClick={onClose}
          aria-label="Close book"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#3d2f1f]/80 text-[#f1e6cd] transition hover:bg-[#3d2f1f]"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
