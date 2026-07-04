import { useEffect, useState } from 'react'
import LibraryApp from './LibraryApp'
import { AdminPage } from './admin/AdminPage'

export default function App() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return route === '#/admin' ? <AdminPage /> : <LibraryApp />
}
