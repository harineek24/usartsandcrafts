# Art Class Library

A single-page art class catalog. Visitors see a warm, stone-walled 3D
bookshelf where every book is a section — the thirteen grade levels by
default, plus anything the teacher adds ("Adults", "Summer Camp", …).
Clicking a book zooms the camera in and opens a yearbook-style spread:
the artwork on the left page, materials and teacher's notes on the right.
A glowing shelf pixie answers searches like *"how to draw giraffes"*,
asks *"which grade level?"* when the answer lives in several books, and
flies you to the right one.

**Stack:** TypeScript · React 19 · React Three Fiber · Tailwind CSS v4 · Supabase · Vite

---

## Architecture

### Data model (`supabase/migrations/`)

```
books                      artworks
─────                      ────────
id        smallint  ◄────  book_id      smallint (FK, delete-restricted)
label     text unique      id           uuid
book_color text            title        text          ← the search field
sort_order int             student_name text          ← first name/initials only
                           materials    text[]
                           teacher_notes text
                           school_year  text
                           image_path   text          ← key in 'artwork' bucket
                           page_order   int (unique per book)
```

- **Security model:** everything is public to *read*; every write requires a
  signed-in (`authenticated`) user — the teacher's single account. Enforced by
  Postgres row-level security, not application code.
- **Search:** `search_artworks(query)` is a SQL function using `pg_trgm`
  fuzzy matching on titles, returning book labels so the UI can ask the
  "which level?" follow-up.
- **Storage:** one public bucket `artwork`. Rows store only the object key.

### Frontend

```
src/
├── App.tsx              hash router: '#/admin' → AdminPage, else LibraryApp
├── LibraryApp.tsx       owns all UI state: selection {book, artworkId},
│                        search-open flag, highlighted books, pixie target
├── scene/               everything inside the <Canvas>
│   ├── Library.tsx      lights, fog, CameraControls choreography,
│   │                    aspect-aware home framing (phones dolly back)
│   ├── layout.ts        pure math: books → shelf rows + world positions
│   ├── Book3D.tsx       spine mesh, hover pull-out, search-glow pulse
│   ├── Pixie.tsx        sparkle sprite; glides to found books; its DOM
│   │                    hit-target stays still so it's easy to click
│   ├── StoneRoom.tsx    walls/shelves from procedural canvas textures
│   └── textures.ts      stone + spine-label canvas texture generators
├── ui/                  everything outside the <Canvas> (HTML/Tailwind)
│   ├── SpreadOverlay.tsx yearbook spread, page-turn animation,
│   │                    fullscreen lightbox, mobile stacked layout
│   └── SearchPanel.tsx  debounced title search + grade disambiguation
├── admin/AdminPage.tsx  Teacher's Desk: auth, book CRUD, artwork CRUD
└── lib/
    ├── supabase.ts      nullable client — null means "offline mode"
    ├── artworks.ts      fetch/search/image-URL, falls back to samples
    ├── sampleData.ts    offline dataset mirroring the migrations
    ├── placeholder.ts   deterministic SVG "student art" data URIs
    └── compressImage.ts browser-side downscale/WebP re-encode for uploads
```

**Key decisions**

- *Offline-first sample data.* Every data accessor tries Supabase, then falls
  back to `sampleData.ts`. The full app — spreads, search, pixie — works with
  no `.env`, which is also how the e2e suite runs.
- *Zero external assets.* Stone, spine labels, and placeholder art are all
  generated on a `<canvas>` at runtime. No font/CDN/texture fetches — the
  page can't be broken by a school network filter.
- *3D is a delight layer, not a gatekeeper.* Spine labels are readable at
  rest, search is keyboard-reachable (`/`), overlays are plain HTML with
  Esc/click-out semantics, and reduced-motion users skip the page-turn.

### Storage efficiency

Image storage is the only thing that grows, so it's kept minimal:

- Uploads are downscaled to ≤1600px and re-encoded to WebP (~82 quality)
  **in the teacher's browser** before they leave her machine; a typical
  4MB phone photo lands as ~150-250KB. The original is kept only if it was
  already smaller (and SVG/GIF pass through untouched).
- Object keys are random UUIDs, so files are uploaded with
  `Cache-Control: max-age=31536000` — browsers and the Supabase CDN cache
  them forever; a replaced artwork gets a new key.
- The spread fetches only the current image plus its two neighbors
  (preloaded so page flips feel instant) — never a whole book.
- Deleting an artwork best-effort deletes its storage object.
- Placeholder art costs zero storage (generated client-side).

At ~200KB per piece, the Supabase free tier (1GB) holds roughly 5,000
artworks. If the catalog ever outgrows that, the next steps are Supabase
Pro's on-the-fly image transformations (per-size variants without storing
them) or storing an extra ~320px thumbnail per piece for grid views.

## Using it

**Visitors** — click a book (or tap; the shelf reframes for phones), flip
pages with the arrows or ←/→ keys, click the artwork for fullscreen, Esc
backs out one layer at a time. Click the pixie or press `/` to search;
matching books slide out and glow.

**Teacher** — "teacher sign-in" link (bottom right) or `#/admin`. Add books
with a label and spine color; select a book to upload artwork (title,
student first name/initials, comma-separated materials, notes, school year,
image). Page order is automatic. Deleting a book requires emptying it first.

### Do / avoid

- **Do** keep student attribution to first names or initials — the site is
  public.
- **Do** upload straight from a phone/camera; compression is automatic.
- **Avoid** putting the `service_role` key anywhere in this project — the
  browser only ever needs the anon key.
- **Avoid** renaming the `artwork` bucket or editing `image_path` by hand;
  rows and objects are linked by that key.
- **Avoid** enabling public sign-ups in Supabase Auth — any authenticated
  account can write to the catalog by design (single-teacher model).

## Setup

```bash
npm install
npm run dev        # sample-data mode, no config needed
```

Connect a real database:

1. Create a project at supabase.com.
2. Run each file in `supabase/migrations/` in order (SQL Editor).
3. Authentication → Add user → create the teacher's email + password
   (leave sign-ups disabled).
4. `cp .env.example .env` and fill in Project Settings → API values.
5. Restart `npm run dev`, open `#/admin`, sign in, add real artwork —
   sample data disappears as soon as real rows exist.

### Deploy (Vercel)

1. Push this repo to GitHub and "Import Project" in Vercel — it
   auto-detects Vite (`npm run build` → `dist/`). No rewrites needed
   (the admin route is hash-based).
2. Project → Settings → Environment Variables: add `VITE_SUPABASE_URL`
   and `VITE_SUPABASE_ANON_KEY`, then redeploy.

### Tests

```bash
npm run build                          # type-check + bundle
npm run preview -- --port 4173 &       # serve the build
npm run test:e2e                       # scripted happy paths (desktop, mobile, admin)
```

The e2e scripts use `playwright-core` with a system Chromium; point
`CHROMIUM_PATH` at your Chrome/Chromium binary if the default path differs.
