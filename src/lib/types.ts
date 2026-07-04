export interface Book {
  id: number
  label: string
  book_color: string
  sort_order: number
}

export interface Artwork {
  id: string
  book_id: number
  title: string
  student_name: string | null
  materials: string[]
  teacher_notes: string | null
  school_year: string
  image_path: string
  page_order: number
}
