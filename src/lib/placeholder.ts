// Deterministic placeholder "student art" as SVG data URIs — zero network,
// zero storage needed, same title always draws the same picture.

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CRAYON = ['#d98e32', '#2b5288', '#3d7a52', '#9c2a2a', '#7a5ba6', '#c9a227']

function giraffe(rnd: () => number): string {
  const spots = Array.from({ length: 7 }, () => {
    const x = 330 + rnd() * 140
    const y = 520 + rnd() * 260
    return `<circle cx="${x}" cy="${y}" r="${14 + rnd() * 12}" fill="#8a5a1f"/>`
  }).join('')
  return `
    <rect x="300" y="500" width="200" height="180" rx="60" fill="#e0a83c"/>
    <rect x="330" y="660" width="28" height="150" fill="#e0a83c"/>
    <rect x="440" y="660" width="28" height="150" fill="#e0a83c"/>
    <rect x="440" y="260" width="46" height="270" rx="20" fill="#e0a83c"/>
    <ellipse cx="470" cy="230" rx="60" ry="45" fill="#e0a83c"/>
    <circle cx="490" cy="220" r="7" fill="#3a2a10"/>
    <rect x="430" y="165" width="10" height="45" rx="5" fill="#8a5a1f"/>
    <rect x="490" y="165" width="10" height="45" rx="5" fill="#8a5a1f"/>
    ${spots}`
}

export function placeholderArt(title: string): string {
  const rnd = mulberry32(hash(title))
  const pick = () => CRAYON[Math.floor(rnd() * CRAYON.length)]

  const sunX = 120 + rnd() * 200
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return `<line x1="${sunX + Math.cos(angle) * 70}" y1="${120 + Math.sin(angle) * 70}"
      x2="${sunX + Math.cos(angle) * 100}" y2="${120 + Math.sin(angle) * 100}"
      stroke="#c9a227" stroke-width="10" stroke-linecap="round"/>`
  }).join('')

  const blobs = /giraffe/i.test(title)
    ? giraffe(rnd)
    : Array.from({ length: 3 + Math.floor(rnd() * 3) }, () => {
        const x = 100 + rnd() * 600
        const y = 400 + rnd() * 380
        const r = 40 + rnd() * 90
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${pick()}" opacity="0.85"/>`
      }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
    <rect width="800" height="1000" fill="#ece0c6"/>
    <circle cx="${sunX}" cy="120" r="55" fill="#c9a227"/>
    ${rays}
    <path d="M0 860 Q 200 ${820 + rnd() * 60} 400 860 T 800 ${840 + rnd() * 40} V 1000 H 0 Z" fill="#3d7a52" opacity="0.8"/>
    ${blobs}
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
