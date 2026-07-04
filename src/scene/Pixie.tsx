import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  home: [number, number, number]
  flyTo: [number, number, number] | null // book the pixie escorts you to
  onClick: () => void
}

export function Pixie({ home, flyTo, onClick }: Props) {
  const visual = useRef<THREE.Group>(null)
  const anchor = useRef<THREE.Group>(null)
  const pos = useRef(new THREE.Vector3(...home))

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const target = flyTo ?? home
    // glide toward the target; bobbing rides on top of the flight path
    pos.current.x = THREE.MathUtils.damp(pos.current.x, target[0], 2, delta)
    pos.current.y = THREE.MathUtils.damp(pos.current.y, target[1], 2, delta)
    pos.current.z = THREE.MathUtils.damp(pos.current.z, target[2], 2, delta)
    visual.current?.position.set(
      pos.current.x + Math.sin(t * 0.7) * 0.08,
      pos.current.y + Math.sin(t * 1.4) * 0.14,
      pos.current.z,
    )
    anchor.current?.position.copy(pos.current)
  })

  return (
    <>
      <group ref={visual} position={home}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color="#fff3cf" />
        </mesh>
        <pointLight color="#ffd27d" intensity={8} distance={4} decay={2} />
        <Sparkles count={28} scale={0.8} size={4} speed={0.5} color="#ffd27d" />
      </group>
      {/* hit-target rides the flight but not the bob: a steady click zone
          is far easier to hit (and screen-reader/keyboard reachable) */}
      <group ref={anchor} position={home}>
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
