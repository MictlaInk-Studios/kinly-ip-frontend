import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/authContext'
import TopNav from './TopNav'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Don't show layout on auth pages
  const authPages = ['/login', '/auth', '/auth-confirm']
  const isAuthPage = authPages.includes(router.pathname)

  if (isAuthPage || loading) {
    return <>{children}</>
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '32px',
          backgroundColor: 'var(--bg-base)'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
