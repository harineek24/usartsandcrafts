-- pg_trgm enables fuzzy title matching for the pixie search agent
create extension if not exists pg_trgm;

create table grades (
  id          smallint primary key,          -- 0 = Kindergarten, 1-12 = grade number
  label       text not null unique,          -- "Kindergarten", "Grade 1", ...
  book_color  text not null default '#8b3a1e' -- spine hex; theme palette: dark orange/blue/green/red
);

create table artworks (
  id            uuid primary key default gen_random_uuid(),
  grade_id      smallint not null references grades(id) on delete restrict,
  title         text not null,               -- primary search field
  student_name  text,                        -- first name or initials only; never full names
  materials     text[] not null default '{}',
  teacher_notes text,
  school_year   text not null,               -- e.g. "2025-2026"
  image_path    text not null,               -- path inside the 'artwork' storage bucket
  page_order    integer not null default 0,  -- spread position inside the grade's book
  created_at    timestamptz not null default now(),
  unique (grade_id, page_order)
);

create index artworks_title_trgm on artworks using gin (title gin_trgm_ops);
create index artworks_grade_idx on artworks (grade_id, page_order);

-- Seed the 13 shelf books; colors cycle the warm/dark theme palette
insert into grades (id, label, book_color) values
  (0,  'Kindergarten', '#8b3a1e'),
  (1,  'Grade 1',      '#1e3a5f'),
  (2,  'Grade 2',      '#2d5a3d'),
  (3,  'Grade 3',      '#7a1f1f'),
  (4,  'Grade 4',      '#8b3a1e'),
  (5,  'Grade 5',      '#1e3a5f'),
  (6,  'Grade 6',      '#2d5a3d'),
  (7,  'Grade 7',      '#7a1f1f'),
  (8,  'Grade 8',      '#8b3a1e'),
  (9,  'Grade 9',      '#1e3a5f'),
  (10, 'Grade 10',     '#2d5a3d'),
  (11, 'Grade 11',     '#7a1f1f'),
  (12, 'Grade 12',     '#8b3a1e');

-- RLS: the catalog is public to read; only the signed-in teacher writes
alter table grades enable row level security;
alter table artworks enable row level security;

create policy "public read grades"   on grades   for select using (true);
create policy "public read artworks" on artworks for select using (true);

create policy "teacher insert" on artworks for insert to authenticated with check (true);
create policy "teacher update" on artworks for update to authenticated using (true);
create policy "teacher delete" on artworks for delete to authenticated using (true);
create policy "teacher update grades" on grades for update to authenticated using (true);

-- Public-read image bucket; only the teacher uploads/removes
insert into storage.buckets (id, name, public) values ('artwork', 'artwork', true);

create policy "public read images"    on storage.objects for select using (bucket_id = 'artwork');
create policy "teacher upload images" on storage.objects for insert to authenticated with check (bucket_id = 'artwork');
create policy "teacher delete images" on storage.objects for delete to authenticated using (bucket_id = 'artwork');

-- Fuzzy title search used by the pixie agent; returns grade info for the
-- "which grade level?" follow-up when titles collide across grades
create function search_artworks(query text)
returns table (
  id uuid, title text, grade_id smallint, grade_label text,
  page_order integer, similarity real
)
language sql stable as $$
  select a.id, a.title, a.grade_id, g.label, a.page_order,
         similarity(a.title, query) as similarity
  from artworks a
  join grades g on g.id = a.grade_id
  where a.title % query or a.title ilike '%' || query || '%'
  order by similarity desc
  limit 20;
$$;
