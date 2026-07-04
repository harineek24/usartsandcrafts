# Art Class Library

A single-page art class catalog: a 3D stone bookshelf where each book is a
grade level (or any section the teacher adds), opening into a yearbook-style
spread — artwork on the left, materials and teacher's notes on the right.
A shelf pixie answers searches like "how to draw giraffes" and flies you to
the right book.

## Stack

TypeScript · React · React Three Fiber · Tailwind CSS v4 · Supabase · Vite

## Setup

1. `npm install`
2. Create a Supabase project, then apply the SQL files in
   `supabase/migrations/` in order (SQL editor or `supabase db push`).
3. Copy `.env.example` to `.env` and fill in the project URL + anon key.
4. Create the teacher's account: Supabase dashboard → Authentication →
   Add user (email + password).
5. `npm run dev`

Without a `.env`, the app runs entirely on built-in sample data — every flow
(browsing, spreads, fullscreen, pixie search) works offline.

## Teacher admin

The "teacher sign-in" link (bottom-right) or `#/admin` opens the Teacher's
Desk: sign in, add/remove books, and upload/edit/delete artworks. Uploaded
images land in the public `artwork` storage bucket; all writes are guarded by
row-level security requiring the signed-in account.
