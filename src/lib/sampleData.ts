import type { Artwork, Book } from './types'

// Mirrors the seed migrations so every flow works before Supabase has data.
export const SAMPLE_BOOKS: Book[] = [
  { id: 0, label: 'Kindergarten', book_color: '#8b3a1e', sort_order: 0 },
  { id: 1, label: 'Grade 1', book_color: '#2b5288', sort_order: 1 },
  { id: 2, label: 'Grade 2', book_color: '#3d7a52', sort_order: 2 },
  { id: 3, label: 'Grade 3', book_color: '#9c2a2a', sort_order: 3 },
  { id: 4, label: 'Grade 4', book_color: '#8b3a1e', sort_order: 4 },
  { id: 5, label: 'Grade 5', book_color: '#2b5288', sort_order: 5 },
  { id: 6, label: 'Grade 6', book_color: '#3d7a52', sort_order: 6 },
  { id: 7, label: 'Grade 7', book_color: '#9c2a2a', sort_order: 7 },
  { id: 8, label: 'Grade 8', book_color: '#8b3a1e', sort_order: 8 },
  { id: 9, label: 'Grade 9', book_color: '#2b5288', sort_order: 9 },
  { id: 10, label: 'Grade 10', book_color: '#3d7a52', sort_order: 10 },
  { id: 11, label: 'Grade 11', book_color: '#9c2a2a', sort_order: 11 },
  { id: 12, label: 'Grade 12', book_color: '#8b3a1e', sort_order: 12 },
  { id: 100, label: 'Adults', book_color: '#5b4a2f', sort_order: 100 },
]

function art(
  book_id: number,
  page_order: number,
  title: string,
  student_name: string,
  materials: string[],
  teacher_notes: string,
): Artwork {
  return {
    id: `sample-${book_id}-${page_order}`,
    book_id,
    page_order,
    title,
    student_name,
    materials,
    teacher_notes,
    school_year: '2025-2026',
    image_path: 'placeholder:',
  }
}

// One artwork per book, three in Grade 3 (exercises page flipping), and
// giraffes in two grades (exercises the pixie's "which level?" follow-up).
export const SAMPLE_ARTWORKS: Artwork[] = [
  art(0, 0, 'Handprint Turkeys', 'Mia R.', ['Tempera paint', 'Construction paper'], 'Our very first painting week!'),
  art(1, 0, 'Rainbow Fish Collage', 'Leo T.', ['Tissue paper', 'Glue', 'Foil scales'], 'Inspired by the storybook.'),
  art(2, 0, 'Sunny Giraffe', 'Ava P.', ['Crayon', 'Watercolor wash'], 'We practiced long necks and spots.'),
  art(3, 0, 'Clay Coil Pots', 'Sam K.', ['Air-dry clay', 'Acrylic paint'], 'Coil building and smoothing.'),
  art(3, 1, 'Autumn Leaf Prints', 'Noor H.', ['Real leaves', 'Block ink'], 'Collected leaves at recess.'),
  art(3, 2, 'Wax Resist Ocean', 'Eli J.', ['Oil pastel', 'Watercolor'], 'Waves stay bright under the wash.'),
  art(4, 0, 'Perspective Hallways', 'Zoe M.', ['Pencil', 'Fineliner'], 'One-point perspective basics.'),
  art(5, 0, 'Giraffe on the Savannah', 'Owen B.', ['Chalk pastel', 'Charcoal'], 'Focus on light and shadow.'),
  art(6, 0, 'One-Point City', 'Ivy C.', ['Marker', 'Ruler'], 'Skylines with vanishing points.'),
  art(7, 0, 'Value Study Spheres', 'Max D.', ['Graphite'], 'Shading from highlight to core shadow.'),
  art(8, 0, 'Linocut Portraits', 'June F.', ['Linoleum', 'Block ink'], 'First carving project — mind the fingers!'),
  art(9, 0, 'Charcoal Still Life', 'Ash W.', ['Charcoal', 'Kneaded eraser'], 'Drawn from the fruit bowl setup.'),
  art(10, 0, 'Acrylic Landscapes', 'Rio S.', ['Acrylic on canvas board'], 'Layering background to foreground.'),
  art(11, 0, 'Figure Gestures', 'Kai N.', ['Conté crayon', 'Newsprint'], '30-second pose studies.'),
  art(12, 0, 'Senior Self-Portraits', 'Val Q.', ['Oil on canvas'], 'Capstone portfolio piece.'),
  art(100, 0, 'Watercolor Night Class', 'Ms. Harper', ['Watercolor', 'Masking fluid'], 'Adult evening session — wet-on-wet.'),
]
