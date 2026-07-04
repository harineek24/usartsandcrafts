import type { Book } from '../lib/types'

export const BOOK = { width: 0.34, height: 1.05, depth: 0.78 }
const GAP = 0.09
const ROW_HEIGHT = 1.45
const BOOKS_PER_ROW = 7
const BASE_Y = 0.72 // shelf-board top of the bottom row

export interface ShelfLayout {
  positions: Map<number, [number, number, number]> // book center points
  rows: { y: number }[] // shelf-board top surfaces
  width: number // widest row, for sizing boards and walls
}

export function layoutBooks(books: Book[]): ShelfLayout {
  const rowCount = Math.max(1, Math.ceil(books.length / BOOKS_PER_ROW))
  const positions = new Map<number, [number, number, number]>()
  const rows: { y: number }[] = []
  let width = 0

  for (let r = 0; r < rowCount; r++) {
    const rowBooks = books.slice(r * BOOKS_PER_ROW, (r + 1) * BOOKS_PER_ROW)
    // row 0 is the top shelf so earlier books read top-down like a page
    const shelfY = BASE_Y + (rowCount - 1 - r) * ROW_HEIGHT
    rows.push({ y: shelfY })
    const rowWidth = rowBooks.length * (BOOK.width + GAP) - GAP
    width = Math.max(width, rowWidth)
    rowBooks.forEach((book, i) => {
      const x = -rowWidth / 2 + BOOK.width / 2 + i * (BOOK.width + GAP)
      positions.set(book.id, [x, shelfY + BOOK.height / 2, 0])
    })
  }
  return { positions, rows, width }
}
