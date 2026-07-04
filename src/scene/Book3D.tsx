import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Book } from '../lib/types'
import { BOOK } from './layout'
import { makeLabelTexture } from './textures'

interface Props {
  book: Book
  position: [number, number, number]
  onSelect: (book: Book) => void
  dimmed: boolean
  highlighted?: boolean
}

export function Book3D({ book, position, onSelect, dimmed, highlighted = false }: Props) {
  const slider = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const labelTexture = useMemo(() => makeLabelTexture(book.label), [book.label])

  useFrame(({ clock }, delta) => {
    if (!slider.current) return
    // hovered/highlighted books slide toward the viewer like being pulled off the shelf
    const target = (hovered && !dimmed) || highlighted ? 0.22 : 0
    slider.current.position.z = THREE.MathUtils.damp(
      slider.current.position.z,
      target,
      8,
      delta,
    )
    if (material.current) {
      // pixie glow: warm gold pulse on search matches
      material.current.emissiveIntensity = highlighted
        ? 0.55 + Math.sin(clock.elapsedTime * 4) * 0.25
        : 0.35
    }
  })

  return (
    <group position={position}>
      <group
        ref={slider}
        onClick={(e) => {
          e.stopPropagation()
          if (!dimmed) onSelect(book)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (!dimmed) {
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[BOOK.width, BOOK.height, BOOK.depth]} />
          <meshStandardMaterial
            ref={material}
            color={book.book_color}
            roughness={0.72}
            emissive={
              highlighted ? '#c9a227' : hovered && !dimmed ? book.book_color : '#000000'
            }
            emissiveIntensity={0.35}
          />
        </mesh>
        {/* pale page block peeking above the cover boards */}
        <mesh position={[0, BOOK.height / 2 - 0.015, -0.02]}>
          <boxGeometry args={[BOOK.width - 0.06, 0.03, BOOK.depth - 0.08]} />
          <meshStandardMaterial color="#e8dcc0" roughness={0.9} />
        </mesh>
        {/* label plane rotated so the title reads top-to-bottom on the spine */}
        <mesh rotation={[0, 0, -Math.PI / 2]} position={[0, 0, BOOK.depth / 2 + 0.002]}>
          <planeGeometry args={[BOOK.height * 0.9, 0.24]} />
          <meshBasicMaterial map={labelTexture} transparent />
        </mesh>
      </group>
    </group>
  )
}
