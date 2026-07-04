import { useCallback, useEffect, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Artwork, Book } from '../lib/types'

const inputCls =
  'w-full rounded-lg border border-[#8b6f47]/40 bg-[#171310] px-3 py-2 text-[#f0e2c4] placeholder-[#7a6a50] outline-none focus:border-[#c9a227]'
const btnCls =
  'rounded-lg border border-[#c9a227]/60 bg-[#c9a227]/10 px-4 py-2 text-sm text-[#f0e2c4] transition hover:bg-[#c9a227]/30 disabled:opacity-40'
const cardCls = 'rounded-2xl border border-[#8b6f47]/40 bg-[#241d17] p-5'

export function AdminPage() {
  if (!supabase) {
    return (
      <Shell>
        <div className={cardCls}>
          <h2 className="mb-2 font-serif text-lg text-[#f0e2c4]">Supabase not connected</h2>
          <p className="text-sm text-[#c9b48a]">
            The admin area needs a live database. Copy <code>.env.example</code> to{' '}
            <code>.env</code>, fill in your project keys, apply the migrations, and create the
            teacher account under Authentication in the Supabase dashboard.
          </p>
        </div>
      </Shell>
    )
  }
  return <AdminInner sb={supabase} />
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-[#171310] p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-baseline justify-between">
          <h1 className="font-serif text-2xl text-[#f0e2c4]">Teacher's Desk</h1>
          <a href="#/" className="text-sm text-[#c9b48a] transition hover:text-[#f0e2c4]">
            ← back to the library
          </a>
        </header>
        {children}
      </div>
    </div>
  )
}

function AdminInner({ sb }: { sb: SupabaseClient }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [sb])

  if (!ready) return <Shell>{null}</Shell>
  return <Shell>{session ? <Dashboard sb={sb} /> : <LoginForm sb={sb} />}</Shell>
}

function LoginForm({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await sb.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className={`${cardCls} mx-auto max-w-sm space-y-3`}>
      <h2 className="font-serif text-lg text-[#f0e2c4]">Sign in</h2>
      <input
        className={inputCls}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className={inputCls}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-[#e08b8b]">{error}</p>}
      <button className={btnCls} disabled={busy} type="submit">
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

function Dashboard({ sb }: { sb: SupabaseClient }) {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadBooks = useCallback(async () => {
    const { data, error: err } = await sb.from('books').select('*').order('sort_order')
    if (err) setError(err.message)
    else {
      setBooks(data as Book[])
      setSelectedId((cur) => cur ?? (data as Book[])[0]?.id ?? null)
    }
  }, [sb])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const selected = books.find((b) => b.id === selectedId) ?? null

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-[#e08b8b]">{error}</p>}
      <BooksPanel
        sb={sb}
        books={books}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChanged={loadBooks}
      />
      {selected && <ArtworksPanel key={selected.id} sb={sb} book={selected} />}
      <button className="text-sm text-[#7a6a50] hover:text-[#c9b48a]" onClick={() => sb.auth.signOut()}>
        Sign out
      </button>
    </div>
  )
}

function BooksPanel({
  sb,
  books,
  selectedId,
  onSelect,
  onChanged,
}: {
  sb: SupabaseClient
  books: Book[]
  selectedId: number | null
  onSelect: (id: number) => void
  onChanged: () => void
}) {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#8b3a1e')
  const [error, setError] = useState<string | null>(null)

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const sort = Math.max(0, ...books.map((b) => b.sort_order)) + 1
    const { error: err } = await sb
      .from('books')
      .insert({ label: label.trim(), book_color: color, sort_order: sort })
    if (err) setError(err.message)
    else {
      setLabel('')
      onChanged()
    }
  }

  const deleteBook = async (book: Book) => {
    if (!window.confirm(`Delete "${book.label}"? Its artworks must be removed first.`)) return
    const { error: err } = await sb.from('books').delete().eq('id', book.id)
    setError(err ? err.message : null)
    if (!err) onChanged()
  }

  return (
    <section className={cardCls}>
      <h2 className="mb-3 font-serif text-lg text-[#f0e2c4]">Books on the shelf</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {books.map((b) => (
          <span key={b.id} className="inline-flex items-center overflow-hidden rounded-full border border-[#8b6f47]/50">
            <button
              onClick={() => onSelect(b.id)}
              className={`px-3 py-1 text-sm transition ${
                b.id === selectedId ? 'bg-[#c9a227]/30 text-[#f0e2c4]' : 'text-[#c9b48a] hover:bg-[#8b6f47]/20'
              }`}
            >
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                style={{ background: b.book_color }}
              />
              {b.label}
            </button>
            <button
              onClick={() => deleteBook(b)}
              aria-label={`Delete ${b.label}`}
              className="px-2 py-1 text-xs text-[#7a6a50] transition hover:text-[#e08b8b]"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={addBook} className="flex flex-wrap items-center gap-2">
        <input
          className={`${inputCls} max-w-56`}
          placeholder="New book label (e.g. Adults)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="Spine color"
          className="h-10 w-12 cursor-pointer rounded border border-[#8b6f47]/40 bg-[#171310]"
        />
        <button className={btnCls} type="submit">
          Add book
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-[#e08b8b]">{error}</p>}
    </section>
  )
}

const emptyForm = {
  title: '',
  student_name: '',
  materials: '',
  teacher_notes: '',
  school_year: '2025-2026',
}

function ArtworksPanel({ sb, book }: { sb: SupabaseClient; book: Book }) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error: err } = await sb
      .from('artworks')
      .select('*')
      .eq('book_id', book.id)
      .order('page_order')
    if (err) setError(err.message)
    else setArtworks(data as Artwork[])
  }, [sb, book.id])

  useEffect(() => {
    load()
  }, [load])

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const reset = () => {
    setForm(emptyForm)
    setEditingId(null)
    setFile(null)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      let image_path: string | undefined
      if (file) {
        const ext = file.name.split('.').pop() ?? 'png'
        image_path = `${book.id}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await sb.storage.from('artwork').upload(image_path, file)
        if (upErr) throw upErr
      }
      const fields = {
        title: form.title.trim(),
        student_name: form.student_name.trim() || null,
        materials: form.materials.split(',').map((m) => m.trim()).filter(Boolean),
        teacher_notes: form.teacher_notes.trim() || null,
        school_year: form.school_year.trim(),
      }
      if (editingId) {
        const { error: err } = await sb
          .from('artworks')
          .update(image_path ? { ...fields, image_path } : fields)
          .eq('id', editingId)
        if (err) throw err
      } else {
        if (!image_path) throw new Error('Choose an image for the new artwork.')
        const page = artworks.length ? Math.max(...artworks.map((a) => a.page_order)) + 1 : 0
        const { error: err } = await sb
          .from('artworks')
          .insert({ ...fields, image_path, book_id: book.id, page_order: page })
        if (err) throw err
      }
      reset()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const edit = (a: Artwork) => {
    setEditingId(a.id)
    setForm({
      title: a.title,
      student_name: a.student_name ?? '',
      materials: a.materials.join(', '),
      teacher_notes: a.teacher_notes ?? '',
      school_year: a.school_year,
    })
    setFile(null)
  }

  const remove = async (a: Artwork) => {
    if (!window.confirm(`Delete "${a.title}"?`)) return
    const { error: err } = await sb.from('artworks').delete().eq('id', a.id)
    if (err) {
      setError(err.message)
      return
    }
    // best-effort: orphaned images are harmless but tidy up when we can
    if (!a.image_path.startsWith('placeholder')) {
      await sb.storage.from('artwork').remove([a.image_path])
    }
    if (editingId === a.id) reset()
    await load()
  }

  return (
    <section className={cardCls}>
      <h2 className="mb-3 font-serif text-lg text-[#f0e2c4]">Artwork in “{book.label}”</h2>

      {artworks.length > 0 ? (
        <ul className="mb-5 divide-y divide-[#8b6f47]/20">
          {artworks.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2">
              <div>
                <p className="text-sm text-[#f0e2c4]">{a.title}</p>
                <p className="text-xs text-[#7a6a50]">
                  {a.student_name ? `${a.student_name} · ` : ''}
                  {a.school_year} · page {a.page_order + 1}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs text-[#c9b48a] hover:text-[#f0e2c4]" onClick={() => edit(a)}>
                  Edit
                </button>
                <button className="text-xs text-[#7a6a50] hover:text-[#e08b8b]" onClick={() => remove(a)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 text-sm italic text-[#7a6a50]">No artwork in this book yet.</p>
      )}

      <form onSubmit={save} className="space-y-3">
        <h3 className="text-sm font-medium text-[#c9b48a]">
          {editingId ? 'Edit artwork' : 'Add artwork'}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={inputCls} placeholder="Title *" value={form.title} onChange={set('title')} required />
          <input
            className={inputCls}
            placeholder="Student (first name or initials)"
            value={form.student_name}
            onChange={set('student_name')}
          />
          <input
            className={inputCls}
            placeholder="Materials, comma separated"
            value={form.materials}
            onChange={set('materials')}
          />
          <input className={inputCls} placeholder="School year" value={form.school_year} onChange={set('school_year')} />
        </div>
        <textarea
          className={`${inputCls} min-h-20`}
          placeholder="Teacher's notes"
          value={form.teacher_notes}
          onChange={set('teacher_notes')}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block text-sm text-[#c9b48a] file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-[#8b6f47]/40 file:bg-[#171310] file:px-3 file:py-1.5 file:text-[#c9b48a]"
        />
        {error && <p className="text-sm text-[#e08b8b]">{error}</p>}
        <div className="flex gap-2">
          <button className={btnCls} disabled={busy} type="submit">
            {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add artwork'}
          </button>
          {editingId && (
            <button type="button" className="text-sm text-[#7a6a50] hover:text-[#c9b48a]" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
