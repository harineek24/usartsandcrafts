import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Book } from './lib/types'
import { fetchBooks } from './lib/supabase'
import { Library } from './scene/Library'
import { SpreadOverlay } from './ui/SpreadOverlay'

export default function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [selected, setSelected] = useState<Book | null>(null)

  useEffect(() => {
    fetchBooks().then(setBooks)
  }, [])

  return (
    <div className="relative h-full w-full">
      <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <Library books={books} selected={selected} onSelect={setSelected} />
        </Suspense>
      </Canvas>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 p-5 text-center">
        <h1 className="font-serif text-2xl tracking-wide text-[#f0e2c4] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          Art Class Library
        </h1>
        {!selected && (
          <p className="text-sm text-[#c9b48a]">Click a book to open it · drag to look around</p>
        )}
      </header>

      {selected && <SpreadOverlay book={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
