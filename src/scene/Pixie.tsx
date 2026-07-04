import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  onClick: () => void
}

export function Pixie({ position, onClick }: Props) {
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    // lazy figure-eight drift so she reads as alive, not a static bulb
    group.current.position.y = position[1] + Math.sin(t * 1.4) * 0.14
    group.current.position.x = position[0] + Math.sin(t * 0.7) * 0.08
  })

  return (
    <>
      <group ref={group} position={position}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#fff3cf" />
        </mesh>
        <pointLight color="#ffd27d" intensity={8} distance={4} decay={2} />
        <Sparkles count={28} scale={0.8} size={4} speed={0.5} color="#ffd27d" />
      </group>
      {/* hit-target anchored outside the bobbing group: a stationary click zone
          is far easier to hit (and screen-reader/keyboard reachable) */}
      <group position={position}>
        <Html center zIndexRange={[5, 5]}>
          <button
            aria-label="Ask the shelf pixie"
            onClick={onClick}
            className="h-16 w-16 cursor-pointer rounded-full border-none bg-transparent"
            title="Ask the shelf pixie"
          />
        </Html>
      </group>
    </>
  )
}
