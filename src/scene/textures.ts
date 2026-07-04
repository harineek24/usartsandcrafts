import * as THREE from 'three'

// Spine labels are drawn to canvas instead of loading a font file, so the
// app works with zero external font fetches (school networks, offline demos).
export function makeLabelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const g = canvas.getContext('2d')!
  g.font = 'bold 104px Georgia, "Times New Roman", serif'
  g.fillStyle = '#f0e2c4'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.shadowColor = 'rgba(0,0,0,0.6)'
  g.shadowBlur = 12
  g.fillText(text, 512, 136, 920)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.min(255, Math.round(v * factor))
  return `rgb(${ch(n >> 16)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`
}

// Procedural stone blocks: offset courses with jittered per-block shading,
// so no texture assets need downloading.
export function makeStoneTexture(base = '#4a4038', mortar = '#2b241f'): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const g = canvas.getContext('2d')!
  g.fillStyle = mortar
  g.fillRect(0, 0, size, size)

  const rows = 8
  const cols = 4
  const bw = size / cols
  const bh = size / rows
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (bw / 2)
    for (let c = -1; c <= cols; c++) {
      const x = c * bw + offset
      const y = r * bh
      g.fillStyle = shade(base, 0.8 + Math.random() * 0.45)
      g.fillRect(x + 3, y + 3, bw - 6, bh - 6)
      // faint inner highlight gives blocks a beveled feel at glancing light
      g.fillStyle = 'rgba(255,255,255,0.05)'
      g.fillRect(x + 3, y + 3, bw - 6, 4)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
