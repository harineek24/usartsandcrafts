import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import type { Book } from '../lib/types'
import { layoutBooks } from './layout'
import { Book3D } from './Book3D'
import { StoneRoom } from './StoneRoom'
import { Pixie } from './Pixie'

interface Props {
  books: Book[]
  selected: Book | null
  onSelect: (book: Book | null) => void
  highlighted: ReadonlySet<number>
  pixieBookId: number | null
  onPixieClick: () => void
}

export function Library({
  books,
  selected,
  onSelect,
  highlighted,
  pixieBookId,
  onPixieClick,
}: Props) {
  const controls = useRef<CameraControls>(null)
  const size = useThree((s) => s.size)
  const shelf = useMemo(() => layoutBooks(books), [books])

  const homeView = useMemo(() => {
    const midY = shelf.rows.length
      ? shelf.rows.reduce((sum, r) => sum + r.y, 0) / shelf.rows.length + 0.6
      : 1.5
    // fit both shelf width and height for the current viewport aspect,
    // so phones dolly back far enough to frame the whole case + pixie
    const tanHalfV = Math.tan((45 / 2) * (Math.PI / 180))
    const aspect = size.width / size.height
    const topY = (shelf.rows[0]?.y ?? 1.5) + 1.5
    const halfH = topY / 2 + 0.5
    const halfW = shelf.width / 2 + 1.8
    const dist = Math.max(5.5, halfH / tanHalfV, halfW / (tanHalfV * aspect))
    return {
      position: [0, midY + 0.4, dist] as const,
      target: [0, midY, 0] as const,
      dist,
    }
  }, [shelf, size])

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
      <fog attach="fog" args={['#171310', homeView.dist + 2, homeView.dist + 16]} />
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
        maxDistance={homeView.dist + 3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 5}
      />
      <StoneRoom shelfWidth={shelf.width} shelfRows={shelf.rows} />
      <Pixie
        home={[-(shelf.width / 2 + 0.9), homeView.target[1] + 0.3, 0.7]}
        flyTo={(() => {
          if (pixieBookId === null) return null
          const p = shelf.positions.get(pixieBookId)
          return p ? ([p[0], p[1] + 0.85, p[2] + 0.75] as [number, number, number]) : null
        })()}
        onClick={onPixieClick}
      />
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
            highlighted={highlighted.has(book.id)}
          />
        )
      })}
    </>
  )
}
