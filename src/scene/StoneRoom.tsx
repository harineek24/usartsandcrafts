import { useMemo } from 'react'
import { makeStoneTexture } from './textures'

interface Props {
  shelfWidth: number
  shelfRows: { y: number }[]
}

const BOARD_THICKNESS = 0.09
const BOARD_DEPTH = 1.0

export function StoneRoom({ shelfWidth, shelfRows }: Props) {
  const wallTexture = useMemo(() => {
    const t = makeStoneTexture()
    t.repeat.set(4, 3)
    return t
  }, [])
  const boardTexture = useMemo(() => makeStoneTexture('#57493d', '#332a22'), [])

  const width = shelfWidth + 1.2
  const topY = (shelfRows[0]?.y ?? 2) + 1.6

  return (
    <group>
      {/* back wall */}
      <mesh position={[0, topY / 2, -BOARD_DEPTH / 2 - 0.05]} receiveShadow>
        <planeGeometry args={[width + 6, topY + 4]} />
        <meshStandardMaterial map={wallTexture} roughness={0.95} />
      </mesh>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow>
        <planeGeometry args={[width + 8, 10]} />
        <meshStandardMaterial color="#241d17" roughness={0.9} />
      </mesh>
      {/* one stone board under each row, plus a capping board above the top row */}
      {[...shelfRows.map((row) => row.y), topY].map((y) => (
        <mesh key={y} position={[0, y - BOARD_THICKNESS / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, BOARD_THICKNESS, BOARD_DEPTH]} />
          <meshStandardMaterial map={boardTexture} roughness={0.9} />
        </mesh>
      ))}
      {/* stone pillars closing the shelf sides */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (width / 2 + 0.15), topY / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.3, topY, BOARD_DEPTH]} />
          <meshStandardMaterial map={boardTexture} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
