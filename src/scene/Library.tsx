import { useEffect, useMemo, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import type { Book } from '../lib/types'
import { layoutBooks } from './layout'
import { Book3D } from './Book3D'
import { StoneRoom } from './StoneRoom'

interface Props {
  books: Book[]
  selected: Book | null
  onSelect: (book: Book | null) => void
}

export function Library({ books, selected, onSelect }: Props) {
  const controls = useRef<CameraControls>(null)
  const shelf = useMemo(() => layoutBooks(books), [books])

  const homeView = useMemo(() => {
    const midY = shelf.rows.length
      ? shelf.rows.reduce((sum, r) => sum + r.y, 0) / shelf.rows.length + 0.6
      : 1.5
    // distance scales with shelf size so every book stays in frame
    const dist = Math.max(5.5, shelf.width * 1.05)
    return { position: [0, midY + 0.4, dist] as const, target: [0, midY, 0] as const }
  }, [shelf])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    if (selected) {
      const p = shelf.positions.get(selected.id)
      if (p) void c.setLookAt(p[0], p[1], p[2] + 1.7, p[0], p[1], p[2], true)
    } else {
      const { position, target } = homeView
      void c.setLookAt(...position, ...target, true)
    }
  }, [selected, shelf, homeView])

  return (
    <>
      <color attach="background" args={['#171310']} />
      <fog attach="fog" args={['#171310', 8, 22]} />
      <ambientLight intensity={0.55} color="#ffe3b8" />
      <directionalLight
        position={[3, 6, 5]}
        intensity={1.4}
        color="#ffca85"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 2, 3]} intensity={12} color="#ff9040" />
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={1.2}
        maxDistance={14}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 5}
      />
      <StoneRoom shelfWidth={shelf.width} shelfRows={shelf.rows} />
      {books.map((book) => {
        const position = shelf.positions.get(book.id)
        if (!position) return null
        return (
          <Book3D
            key={book.id}
            book={book}
            position={position}
            onSelect={onSelect}
            dimmed={selected !== null}
          />
        )
      })}
    </>
  )
}
